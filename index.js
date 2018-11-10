const DEBUG = true;

const commandParser = require("string-to-argv.js");
const Discord = require("discord.js");
const deasync = require("deasync");
const fs = require("fs");
var client = new Discord.Client(), config = require("./config.json");


function getScope () {
	return {
		level: level,
		commands: commands,
		commandMap: commandMap,
		
		Discord: Discord,
		client: client,
		
		config: config
	};
}


var paused = false;
global.setPaused = function (b) {
	if (!(paused = b)) {
		console.log();
		
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
}, commands = {}, commandMap = []; 


global.loadCommands = function () {
	var commandFiles = fs.readdirSync("./commands");

	if (DEBUG) console.log("Loaded files:\n" + JSON.stringify(commandFiles));
	commandFiles.forEach(v => { commands[/(.+)\.js/g.exec(v)[1]] = require("./commands/" + v); });
	
	commandMap = [...Array(4)]; // @TODO - Dynamic level detection
	commandMap.forEach((v, i, a) => { a[i] = {}; });
	var k = Object.keys(commands);

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
};

loadCommands();

global.getCommand = function (name, l) { return commands[Object.keys(commands)[commandMap[l || level.current][name.toUpperCase()]]]; }



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
				
				c.exec(r, getScope());
			} else {
				console.log("Unknown level " + level.current + " command: '" + r.command + "'.\nType HELP for a list of commands.\n");
			}
		}
		
		if (!paused) setPaused(false);
	}
});

if (!DEBUG) process.stdout.write("\033c");

if (DEBUG) console.log(commandMap);

console.log("Type HELP for a list of commands.\n\n");
process.stdout.write("> ");
