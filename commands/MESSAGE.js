var command = {
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
	exec: function (r, scope) {
		if (r._[0] && (!r.hasFlags() || r.hasFlag("S")) && !r._[1]) {
			var channel = scope.client.channels.get(scope.level._[2]);
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
};

module.exports = command;
