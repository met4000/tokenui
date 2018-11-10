var command = {
	level: 2,
	alias: ["UC", "GETDM", "GDM"],
	desc: "Displays the ID of the DM for the specified user. WIP - DO NOT USE",
	exec: function (r, scope) {
		if (r._[0] && !r.hasFlags() && !r._[1]) {
			if (scope.client.user.bot) { // Bot account; can use .fetchUser()
				console.log(scope.client.fetchUser(r._[0]));
			} else { // User account; cannot use .fetchUser()
				console.log(scope.client);
			}
		} else if (r.hasFlags()) {
			console.log("Expected no flags. Found: " + Object.keys(r).slice(3));
		} else {
			console.log("Invalid Syntax.");
		}

		console.log();
	}
};

module.exports = command;
