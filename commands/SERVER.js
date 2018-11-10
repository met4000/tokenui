var command = {
	level: 1,
	alias: ["S", "GUILD", "G"],
	desc: "Locks commands to a specific server (or DMs). (LEVEL 2)",
	help: `
SERVER [ID]

    ID        The ID of the server to lock to.

If no server is specified, locks to DMs.
`,
	exec: function (r, scope) {
		if (!r.hasFlags() && !r._[1]) {
			if (r._[0] && r._[0] != "DM") {
				var ID = r._[0].toString();

				if (scope.client.guilds.has(ID)) {
					scope.level._[1] = ID;
				} else {
					console.log("User does not have access to the specified server.\n");
					return;
				}
			} else {
				scope.level._[1] = "DM";
			}

			scope.level.current++;
			console.log("Locked commands to " + scope.level._[1] + (scope.level._[1] == "DM" ? "s" : "") + ".");
		} else if (r.hasFlags()) {
			console.log("Expected no flags. Found: " + Object.keys(r).slice(3));
		} else {
			console.log("Invalid Syntax.");
		}

		console.log();
	}
};

module.exports = command;
