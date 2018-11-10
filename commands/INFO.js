const uilib = require("../uilib");

var command = {
	alias: ["I"],
	desc: "Displays information about all levels.",
	help: `
INFO
`, // @TODO - add '-l' flag to specify the level to be queried
	exec: function (r, scope) {
		if (!r._[0] && !r.hasFlags()) {
			if (!scope.level.current) {
				console.log("LEVEL 0");
				console.log("No info available.");
			} else {
				if (scope.level.current >= 1) {
					console.log("LEVEL 1");
					console.log("Current User: ".appendPad(15) + scope.level._[0]);
					console.log("User Token: ".appendPad(15) + uilib.obfuscateToken(scope.client.token));
					console.log("Status: ".appendPad(15) + scope.client.user.presence.status.toUpperCase());
				} if (scope.level.current >= 2) {
					console.log("\nLEVEL 2");

					if (scope.level._[1] == "DM") {
						console.log("Set to DMs.");
					} else {
						var server = scope.client.guilds.get(scope.level._[1]);
						console.log("Server: ".appendPad(15) + server.name);
						console.log("ID: ".appendPad(15) + server.id);
						console.log("Region: ".appendPad(15) + server.region);
						console.log("Owner: ".appendPad(15) + server.owner.user.username);
						console.log("Owner Nick: ".appendPad(15) + (server.owner.nickname || ""));
						console.log("Owner ID: ".appendPad(15) + server.ownerID);
						console.log("Owner Status: ".appendPad(15) + server.owner.presence.status.toUpperCase());
					}
				} if (scope.level.current >= 3) {
					console.log("\nLEVEL 3");

					if (scope.level._[1] == "DM") {
						var recipient = scope.client.channels.get(scope.level._[2]).recipient;
						console.log("Recipient: ".appendPad(15) + recipient.username);
						console.log("Recipient ID: ".appendPad(15) + recipient.id);
						console.log("R. Status: ".appendPad(15) + recipient.presence.status.toUpperCase());
						console.log("Channel ID: ".appendPad(15) + scope.level._[2]);
					} else {
						var channel = scope.client.channels.get(scope.level._[2]);
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
};

module.exports = command;

