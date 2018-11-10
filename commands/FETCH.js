const uilib = require("../uilib");

var command = {
	level: 3,
	alias: ["F"],
	desc: "Fetches messages from the current channel.",
	help: `
FETCH [NUMBER]

    NUMBER    The number of messages to fetch. Defaults to 20.
`,
	exec: function (r, scope) {
		if (!r.hasFlags() && !r._[1]) {
			var channel = scope.client.channels.get(scope.level._[2]);
			if (channel.fetchMessages) {
				channel.fetchMessages({ limit: r._[0] || 20 }).then((messages) => {
					var messageArr = messages.array().reverse();

					for (var i in messageArr) {
						var m = messageArr[i], t = m.createdAt;
						t = uilib.preZero(t.getHours()) + ":" + uilib.preZero(t.getMinutes()) + ":" + uilib.preZero(t.getSeconds());
						console.log("[" + t + "] " + m.author.username + ": " + m.content);
					}

					setPaused(false);
				});

				setPaused(true);
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
