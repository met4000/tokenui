const uilib = require("../uilib");
const deasync = require("deasync");
const fs = require("fs");

var command = {
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
	exec: function (r, scope) {
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
				key = scope.config.last;
			}

			if (!key) { console.error("Unable to set key value"); return; }

			scope.client.on("ready", () => {
				console.log("Successfully Logged in as " + scope.client.user.username + ".\n\n");

				scope.level.current = 1;
				scope.level._[0] = scope.client.user.username;
				scope.config.last = scope.client.token;
				fs.writeFile("../config.json", JSON.stringify(scope.config, null, 2), (err) => console.error);
				setPaused(false);
			});

			console.log("Logging in to account with '" + uilib.obfuscateToken(key) + "'. Please wait...");
			setPaused(true);

			scope.client.login(key).catch(() => {
				console.log("Token rejected, or unable to connect to the Discord auth server.\nCheck that you have input it correctly and that you are connected\nto the internet before trying again.\n\n");

				deasync(client.destroy());
				client = new Discord.Client();

				setPaused(false);
			});
		} else if (r.hasFlags()) {
			console.log("Expected no flags. Found: " + Object.keys(r).slice(3));
		} else {
			console.log("Invalid Syntax.");
		}

		console.log();
	}
};

module.exports = command;
