var command = {
	level: 1,
	alias: ["SL", "GUILDLIST", "GL"],
	desc: "Lists the available servers.",
	help: `
SERVERLIST [-H]

    -H        Hides the server IDs.
`,
	exec: function (r, scope) {
		if (!r._[0] && (!r.hasFlags() || r.hasFlag("H"))) {
			var keyArr = scope.client.guilds.keyArray();
			for (var i in keyArr) {
				const serverDispMax = 60;
				var name = scope.client.guilds.get(keyArr[i]).name,
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
