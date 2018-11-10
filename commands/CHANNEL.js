var command = {
	level: 2,
	alias: ["C", "LOCK"],
	desc: "Locks commands to a specific channel. {LEVEL 3}",
	help: `
CHANNEL ID

    ID        The ID of the channel to lock to.

Fails if the user does not have access to the specified channel.
`,
	exec: function (r, scope) {
		if (r._[0] && !r.hasFlags() && !r._[1]) {
			var ID = r._[0].toString(), isDM = scope.level._[1] == "DM", channels;

			if (isDM) {
				channels = scope.client.channels.filter(v => v.type == "dm");
			} else {
				channels = scope.client.guilds.get(scope.level._[1]).channels;
			}

			if (channels.has(ID)) {
				scope.level._[2] = ID;
			} else {
				console.log(
					"User does not have access to the specified channel, or it is not " + (isDM ? "a DM" : "on this server") + ".\n"
				);
				return;
			}

			scope.level.current++;
			console.log("Locked commands to " + scope.level._[2] + ".");
		} else if (r.hasFlags()) {
			console.log("Expected no flags. Found: " + Object.keys(r).slice(3));
		} else {
			console.log("Invalid Syntax.");
		}

		console.log();
	}
};

module.exports = command;
