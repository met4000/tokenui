const uilib = require("../uilib");

var command = {
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
			if (fs.existsSync("../../SHARED/keys.json")) keys = require("../../SHARED/keys.json");
				else keys = require("../keys.json");

			var users = Object.keys(keys);

			for (var i in users) {
				console.log(users[i] + (r.hasFlag("T") ? users[i].pad(15) + uilib.obfuscateToken(keys[users[i]]) : ""));
			}
		} else {
			console.log("Invalid Syntax.");
		}

		console.log();
	}
};

module.exports = command;
