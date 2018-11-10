var deasync = require("deasync");

var command = {
	alias: ["X", "BACK", "B"],
	desc: "Reduces active level by 1, or exits the program.",
	help: `
EXIT [-L | -F]

    -L        Sets the current level to 0.
    -F        Forces the program to stop executing.

If no flags are specified, reduces the level by 1.
`,
	exec: function (r, scope) {
		var oldLevel = scope.level.current;

		if (!r.hasFlags()) {
			if (!scope.level.current) {
				process.exit();
			} else {
				delete scope.level._[--scope.level.current];
			}
		} else if (r.hasFlag("L") && r.nFlags() == 1) {
			while (scope.level.current > 0) delete scope.level._[--scope.level.current];
		} else if (r.hasFlag("F") && r.nFlags() == 1) {
			process.exit();
		} else {
			console.log("Invalid Syntax.");
			return;
		}

		if (!scope.level.current && !!scope.client.uptime) {
			console.log("Logging out of " + scope.client.user.username + "...");
			deasync(scope.client.destroy());
			console.log("Logged out.");
			scope.client = new scope.Discord.Client();
		}

		console.log();
	}
};

module.exports = command;
