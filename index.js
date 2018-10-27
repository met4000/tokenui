const DEBUG = false;

const commandParser = require("string-to-argv.js");
const Discord = require("discord.js");
const deasync = require("deasync");
const fs = require("fs"), {spawn} = require("child_process");
var client = new Discord.Client(),
	config = require("./config.json");

Object.defineProperty(Object.prototype, "nFlags", {
	enumerable: false,
	value: function () { return Object.keys(this).length - 3; }
});

Object.defineProperty(Object.prototype, "hasFlags", {
	enumerable: false,
	value: function () { return !!this.nFlags(); }
});

Object.defineProperty(Object.prototype, "hasFlag", {
	enumerable: false,
	value: function (f) {
		var Obj = this;
		
		if (typeof f == "string") {
			return Obj.hasOwnProperty(f);
		} else { // Assume Array
			return f.some(v => Obj.hasOwnProperty(v));
		}
	}
});

String.prototype.pad = function (n) {
	return [...Array(n + 1 - this.length)].join(" ");
};

String.prototype.appendPad = function (n) {
	return this + this.pad(n);
};


function obfuscateToken (t) {
	return t.substr(0, 6) + "** ... **" + t.substr(t.length - 6, 6);
}

var paused = false;
function setPaused (b) {
	if (!(paused = b)) {
		if (level.current >= 1) {
			process.stdout.write("[" + level._[0] + "]");
			
			if (level.current >= 2) {
				process.stdout.write("(" + level._[1] + ")");
				
				if (level.current >= 3) {
					process.stdout.write("{" + level._[2] + "}");
				}
			}
		}
		process.stdout.write("> ");
	}
}

var level = {
	current: 0,
	_: []
}, commands = {
	HELP: {
		alias: ["H"],
		desc: "Displays a list of or information about commands.",
		help: `
HELP [COMMAND] [-L LEVEL]

    COMMAND   Displays help information on that command. If not specified,
              displays a list and description of all commands.
    -L LEVEL  Forces help to be displayed as if at the given level.
`,
		exec: function (r) {
			var cLevel = parseInt(r["L"]) | level.current;
			if (r._[0] && (!r.hasFlags() || (r.hasFlag("L") && r.nFlags() == 1)) && !r._[1]) {  // Command Help
				if (Object.keys(commandMap[cLevel]).includes(r._[0])) {
					var c = getCommand(r._[0], cLevel);
					
					console.log();

					var desc = c.desc;
					if (typeof desc == "object") desc = desc[cLevel];
					if (typeof desc == "function") desc = desc(r);
					if (!help) help = "NO DESCRIPTION IS PROVIDED FOR THIS COMMAND";
					console.log(desc);
					
					var help = c.help;
					if (typeof help == "object") help = help[cLevel];
					if (typeof help == "function") help = help(r);
					if (!help) help = "\n - NO HELP IS PROVIDED FOR THIS COMMAND - \n";
					console.log(help);
				} else {
					console.log("Unknown Command: '" + r._[0] + "'.\nType HELP for a list of commands.\n");
				}
			} else if (!r._[0] && (!r.hasFlags() || (r.hasFlag("L") && r.nFlags() == 1))) {  // Command List
				var k = Object.keys(commands).filter(v => {
					var l = commands[v].level;
					if (l == undefined) l = [0, 1, 2, 3]; // @TODO - See below commands; this is also manual
					if (typeof l != "object") l = [l];
					
					return l.includes(cLevel);
				}).sort();
				
				console.log("For more information on a specific command, type HELP command-name.");
				console.log("Level " + cLevel + " command list:");
				for (var i in k) {
					var desc = commands[k[i]].desc;
					if (typeof desc == "object") desc = desc[cLevel];
					if (typeof desc == "function") desc = desc(r);
					
					console.log(k[i].appendPad(15) + desc);
				}
				console.log();
			} else {
				console.log("Invalid Syntax.\n");
			}
		}
	}, EXIT: {
		alias: ["X", "BACK", "B"],
		desc: "Reduces active level by 1, or exits the program.",
		help: `
EXIT [-L | -F]

    -L        Sets the current level to 0.
    -F        Forces the program to stop executing.

If no flags are specified, reduces the level by 1.
`,
		exec: function (r) {
			var oldLevel = level.current;
			
			if (!r.hasFlags()) {
				if (!level.current) {
					process.exit();
				} else {
					delete level._[--level.current];
				}
			} else if (r.hasFlag("L") && r.nFlags() == 1) {
				while (level.current > 0) delete level._[--level.current];
			} else if (r.hasFlag("F") && r.nFlags() == 1) {
				process.exit();
			} else {
				console.log("Invalid Syntax.");
				return;
			}
			
			if (!level.current && !!client.uptime) {
				console.log("Logging out of " + client.user.username + "...");
				deasync(client.destroy());
				console.log("Logged out.");
				client = new Discord.Client();
			}
			
			console.log();
		}
	}, CLEAR: {
		alias: ["CLS"],
		desc: "Clears the screen.",
		help: `
CLEAR
`,
		exec: function (r) {
			process.stdout.write("\033c");
		}
	}, INFO: {
		alias: ["I"],
		desc: "Displays information about all levels.",
		help: `
INFO
`, // @TODO - add '-l' flag to specify the level to be queried
		exec: function (r) {
			if (!r._[0] && !r.hasFlags()) {
				if (!level.current) {
					console.log("LEVEL 0");
					console.log("No info available.");
				} else {
					if (level.current >= 1) {
						console.log("LEVEL 1");
						console.log("Current User: ".appendPad(15) + level._[0]);
						console.log("User Token: ".appendPad(15) + obfuscateToken(client.token));
					} if (level.current >= 2) {
						console.log("\nLEVEL 2");
						
						if (level._[1] == "DM") {
							console.log("Set to DMs.");
						} else {
							var server = client.guilds.get(level._[1]);
							console.log("Server: ".appendPad(15) + server.name);
							console.log("ID: ".appendPad(15) + server.id);
							console.log("Region: ".appendPad(15) + server.region);
							console.log("Owner: ".appendPad(15) + server.owner.user.username);
							console.log("Owner Nick: ".appendPad(15) + (server.owner.nickname || ""));
							console.log("Owner ID: ".appendPad(15) + server.ownerID);
						}
					} if (level.current >= 3) {
						console.log("\nLEVEL 3");
						
						if (level._[1] == "DM") {
							var recipient = client.channels.get(level._[2]).recipient;
							console.log("Recipient: ".appendPad(15) + recipient.username);
							console.log("Recipient ID: ".appendPad(15) + recipient.id);
							console.log("Channel ID: ".appendPad(15) + level._[2])
						} else {
							var channel = client.channels.get(level._[2]);
							console.log("Channel Name: ".appendPad(15) + channel.name);
							console.log("Channel ID:".appendPad(15) + channel.id);
							console.log("Channel Type: ".appendPad(15) + channel.type);
						}
					}
				}
			} else if (r.hasFlags()) {
				console.log("Expected no flags. Found: " + Object.keys(r).slice(3));
			} else {
				console.log("Invalid Syntax.");
			}
			
			console.log();
		}
	}, LOGIN: {
		level: 0,
		alias: ["L"],
		desc: "Logs in to Discord. [LEVEL 1]",
		help: `
LOGIN [USERNAME | -T TOKEN]

    USERNAME  The user account to login as.
    -T TOKEN  The user token to login with.

If neither USERNAME or TOKEN are provided defaults to the last used account.
Note: USERNAME pulls its token from "./keys.json".
Note: TOKEN should be escaped with quotes to ensure correct parsing.
      i.e. LOGIN -T "MHXrrySzbCCXdcDAJMjYjIt5.GhC2jW.3XMwvoS14YSzOBt_Ut3tH6NK4vw"
`,
		exec: function (r) {
			if ((!r.hasFlags() || (!r._[0] && r.hasFlag("T"))) && !r._[1]) {
				var key;
				if (r._[0]) { // Name
					var user = r._[0], keys = {};
					if (fs.existsSync("../SHARED/keys.json")) keys = require("../SHARED/keys.json");
					else keys = require("./keys.json");

					if (Object.keys(keys).includes(user)) {
						key = keys[user];
					} else {
						console.error("User not found: '" + user + "'");
						return;
					}
				} else if (r.hasFlag("T")) { // Token
					key = r["T"].replace(/"/g, "");
				} else { // Last used user
					key = config.last;
				}
				
				if (!key) { console.error("Unable to set key value"); return; }
				
				client.on("ready", () => {
					console.log("Successfully Logged in as " + client.user.username + ".\n\n");
					
					level.current = 1;
					level._[0] = client.user.username;
					config.last = client.token;
					fs.writeFile("./config.json", JSON.stringify(config, null, 2), (err) => console.error);
					setPaused(false);
				});
				
				console.log("Logging in to account with '" + obfuscateToken(key) + "'. Please wait...");
				setPaused(true);
				deasync(client.login(key).catch(() => {
					console.log("Token rejected, or unable to connect to the Discord auth server.\nCheck that you have input it correctly and that you are connected\nto the internet before trying again.\n\n");
					
					deasync(client.destroy());
					client = new Discord.Client();
					
					setPaused(false);
				}));
			} else if (r.hasFlags()) {
				console.log("Expected no flags. Found: " + Object.keys(r).slice(3) + "\n");
			} else {
				console.log("Invalid Syntax.\n");
			}
		}
	}, USERLIST: {
		level: 0,
		alias: ["U", "UL"],
		desc: "Lists the stored user accounts.",
		help: `
USERLIST

    -T        Additionaly displays the user tokens.
`,
		exec: function (r) {
			if (!r._[0] && (!r.hasFlags() || r.hasFlag("T"))) {
				var keys = {};
				if (fs.existsSync("../SHARED/keys.json")) keys = require("../SHARED/keys.json");
					else keys = require("./keys.json");
				
				var users = Object.keys(keys);
				
				for (var i in users) {
					console.log(users[i] + (r.hasFlag("T") ? users[i].pad(15) + obfuscateToken(keys[users[i]]) : ""));
				}
			} else {
				console.log("Invalid Syntax.");
			}
			
			console.log();
		}
	}, MONITOR: {
		level: [1, 3],
		alias: ["V"],
		desc: "Opens a new Monitor program on the current user.",
		help: { 1: `
MONITOR [CHANNEL]

    CHANNEL   The channel to lock messages to. If not specified, no
              lock is applied.

Fails if not currently logged in.
`, 3: `
MONITOR

Locks messages to the current channel. Run on level 1 to spawn without a lock.
`}, // @TODO - Add -T tag to allow token specification - REJECTED (for now; Might add option for it to do so as a lvl 0 command)
		exec: function (r) {
			if (!r.hasFlags() && (level.current == 1 ? !r._[1] : true) && (level.current == 3 ? !r._[0] : true)) {
				var params = ["./monitor.js", client.token];
				
				if (r._[0]) params.push(r._[0]);
				else if (level.current == 3) params.push(level._[2]);
				
				spawn("node", params, { shell: true, detached: true });
				console.log("Spawned new Monitor as " + client.user.username + (params.length > 2 ? ", locked to " + params[2] : "") + ".");
			} else if (r.hasFlags()) {
				console.log("Expected no flags. Found: " + Object.keys(r).slice(3));
			} else {
				console.log("Invalid Syntax.");
			}
			
			console.log();
		}
	}, SERVER: {
		level: 1,
		alias: ["S", "GUILD", "G"],
		desc: "Locks commands to a specific server (or DMs). (LEVEL 2)",
		help: `
SERVER [ID]

    ID        The ID of the server to lock to.

If no server is specified, locks to DMs.
`,
		exec: function (r) {
			if (!r.hasFlags() && !r._[1]) {
				if (r._[0] && r._[0] != "DM") {
					var ID = r._[0].toString();
					
					if (client.guilds.has(ID)) {
						level._[1] = ID;
					} else {
						console.log("User does not have access to the specified server.\n");
						return;
					}
				} else {
					level._[1] = "DM";
				}
				
				level.current++;
				console.log("Locked commands to " + level._[1] + (level._[1] == "DM" ? "s" : "") + ".");
			} else if (r.hasFlags()) {
				console.log("Expected no flags. Found: " + Object.keys(r).slice(3));
			} else {
				console.log("Invalid Syntax.");
			}
			
			console.log();
		}
	}, SERVERLIST: {
		level: 1,
		alias: ["SL", "GUILDLIST", "GL"],
		desc: "Lists the available servers.",
		help: `
SERVERLIST [-H]

    -H        Hides the server IDs.
`,
		exec: function (r) {
			if (!r._[0] && (!r.hasFlags() || r.hasFlag("H"))) {
				var keyArr = client.guilds.keyArray();
				for (var i in keyArr) {
					const serverDispMax = 60;
					var name = client.guilds.get(keyArr[i]).name,
						nameShort = name.slice(0, Math.min(name.length, serverDispMax));
					
					console.log(nameShort + (!r.hasFlag("H") ? nameShort.pad(serverDispMax + 1) + "" + keyArr[i] : ""));
				}
			} else {
				console.log("Invalid Syntax.");
			}
			
			console.log();
		}
	}, CHANNEL: {
		level: 2,
		alias: ["C", "LOCK"],
		desc: "Locks commands to a specific channel. {LEVEL 3}",
		help: `
CHANNEL ID

    ID        The ID of the channel to lock to.

Fails if the user does not have access to the specified channel.
`,
		exec: function (r) {
			if (r._[0] && !r.hasFlags() && !r._[1]) {
				var ID = r._[0].toString(), isDM = level._[1] == "DM", channels;
				
				if (isDM) {
					channels = client.channels.filter(v => v.type == "dm");
				} else {
					channels = client.guilds.get(level._[1]).channels;
				}

				if (channels.has(ID)) {
					level._[2] = ID;
				} else {
					console.log(
						"User does not have access to the specified channel, or it is not " + (isDM ? "a DM" : "on this server") + ".\n"
					);
					return;
				}
				
				level.current++;
				console.log("Locked commands to " + level._[2] + ".");
			} else if (r.hasFlags()) {
				console.log("Expected no flags. Found: " + Object.keys(r).slice(3));
			} else {
				console.log("Invalid Syntax.");
			}
			
			console.log();
		}
	}, CHANNELLIST: {
		level: 2,
		alias: ["CL"],
		desc: "Lists the available channels.",
		help: `
CHANNELLIST [-H]

    -H        Hides the channel IDs.
`,
		exec: function (r) {
			if (!r._[0] && (!r.hasFlags() || r.hasFlag("H"))) {
				var channels;
				
				if (level._[1] == "DM") {
					channels = client.channels.filter(v => v.type == "dm");
				} else {
					channels = client.guilds.get(level._[1]).channels;
				}
				
				var keyArr = channels.keyArray();
				for (var i in keyArr) {
					const serverDispMax = 60;
					var channel = channels.get(keyArr[i]),
						name = channel.name || channel.recipient.username,
						nameShort = name.slice(0, Math.min(name.length, serverDispMax));
					
					console.log(nameShort + (!r.hasFlag("H") ? nameShort.pad(serverDispMax + 1) + "" + keyArr[i] : ""));
				}
			} else {
				console.log("Invalid Syntax.");
			}
			
			console.log();
		}
	}, MESSAGE: {
		level: 3,
		alias: ["M", "MSG"],
		desc: "Sends a text message in the current channel.",
		help: `
MESSAGE CONTENT [-S]

    CONTENT   The content of the message to be sent.
    -S        Automatically splits the message into multiple messages if
              larger than 2000 chars.

Fails if the current channel is not a text channel.
`,
		exec: function (r) {
			if (r._[0] && (!r.hasFlags() || r.hasFlag("S")) && !r._[1]) { // @TODO - check if text channel, and fail if not
				var channel = client.channels.get(level._[2]);
				if (channel.send) {
					channel.send(r._[0]);
				} else {
					console.log("Unable to send message: channel refused text message.");
				}
			} else if (r.hasFlags()) {
				console.log("Expected no flags. Found: " + Object.keys(r).slice(3));
			} else {
				console.log("Invalid Syntax.");
			}
			
			console.log();
		}
	}
};


var commandMap = [...Array(4)]; // @TODO - Dynamic level detection
commandMap.forEach((v, i, a) => { a[i] = {}; });
global.k = Object.keys(commands);

for (var x in k) {
	var a = commands[k[x]].alias, l = commands[k[x]].level;
	
	if (l == undefined) l = [0, 1, 2, 3]; // See above; this is also manual
	if (typeof l != "object") l = [l];
	
	for (var i in l) {
		if (commandMap[l[i]][k[x]]) {
			throw new Error( // @TODO - Add '--silentOverride' flag to silence this
				"Attempting to set a map address for a command that already exists: Trying to override '" + k[x] + "' (mapped to '" +
				Object.keys(commands)[commandMap[l[i]][k[x]]] + "') with a map to '" + Object.keys(commands)[x] + "'."
			);
		}
		
		commandMap[l[i]][k[x]] = x;
		
		for (var y in a) {
			if (commandMap[l[i]][a[y]]) {
				throw new Error( // @TODO - Add '--silentOverride' flag to silence this
					"Attempting to set a map address for a command that already exists: Attempting to override '" + a[y] + "' (mapped to '" +
					Object.keys(commands)[commandMap[l[i]][a[y]]] + "') with a map to '" + Object.keys(commands)[x] + "'."
				);
			}
			
			commandMap[l[i]][a[y]] = x;
		}
	}
}

delete k;

function getCommand (name, l) { return commands[Object.keys(commands)[commandMap[l || level.current][name.toUpperCase()]]]; }



process.stdin.setEncoding("utf8");

process.stdin.on("readable", () => {
	var chunk = process.stdin.read();
	if (chunk !== null) {
		var raw = chunk.replace(/\r?\n$/, ""),
			r = raw ? new commandParser(raw) : { raw: "", command: null, _: [] };
		
		if (r.command) {
			if (Object.keys(commandMap[level.current]).includes(r.command.toUpperCase())) {
				var c = getCommand(r.command);

				// Change flags to uppercase
				if (r.hasFlags()) {
					for (var i = 3, f = Object.keys(r); i < f.length; i++) {
						if (f[i] != f[i].toUpperCase()) {
							r[f[i].toUpperCase()] = r[f[i]];
							if (!delete r[f[i]]) console.error("ERR: UNABLE TO DELETE FLAG ('" + r[f[i]] + "') DURING CAPITALISATION");
						}
					}
				}

				for (var i in r._) {
					if (!/^(?:"(?:[^"]*)"|'(?:[^']*)')$/.exec(r._[i])) {
						r._[i] = r._[i].toUpperCase();
					} else {
						r._[i] = r._[i].replace(/^["']|["']$/g, "");
					}
				}

				if (DEBUG) console.log(r);
				console.log(); // break

				c.exec(r);
			} else {
				console.log("Unknown level " + level.current + " command: '" + r.command + "'.\nType HELP for a list of commands.\n");
			}
		}
		
		console.log();
		
		if (!paused) setPaused(false);
	}
});

if (!DEBUG) process.stdout.write("\033c");

if (DEBUG) console.log(commandMap);

console.log("Type HELP for a list of commands.\n\n");
process.stdout.write("> ");
