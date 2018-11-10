var command = {
	level: 2,
	alias: ["CL"],
	desc: "Lists the available channels.",
		help: `
CHANNELLIST [-H]

    -H        Hides the channel IDs.
`,
	exec: function (r, scope) {
		if (!r._[0] && (!r.hasFlags() || r.hasFlag("H"))) {
			var channels;

			if (scope.level._[1] == "DM") {
				channels = scope.client.channels.filter(v => v.type == "dm");
			} else {
				channels = scope.client.guilds.get(scope.level._[1]).channels;
			}

			var keyArr = channels.keyArray();
			for (var i in keyArr) {
				const serverDispMax = 60;
				var channel = channels.get(keyArr[i]),
					name = channel.name || channel.recipient.username,
					nameShort = name.slice(0, Math.min(name.length, serverDispMax));

				console.log(nameShort + (!r.hasFlag("H") ? nameShort.pad(serverDispMax + 1) + "" + keyArr[i] : ""));
			}
		} else {
			console.log("Invalid Syntax.");
		}

		console.log();
	}
};

module.exports = command;
