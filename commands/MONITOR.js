const {spawn} = require("child_process");

var command = {
	level: [1, 3],
	alias: ["V"],
	desc: "Opens a new Monitor program on the current user.",
	help: { 1: `
MONITOR [CHANNEL]

    CHANNEL   The channel to lock messages to. If not specified, no
              lock is applied.

Fails if not currently logged in.
`, 3: `
MONITOR

Locks messages to the current channel. Run on level 1 to spawn without a lock.
`}, // @TODO - Add -T tag to allow token specification - REJECTED (for now; Might add option for it to do so as a lvl 0 command)
	exec: function (r, scope) {
		if (!r.hasFlags() && (scope.level.current == 1 ? !r._[1] : true) && (scope.level.current == 3 ? !r._[0] : true)) {
			var params = ["./monitor.js", scope.client.token];

			if (r._[0]) params.push(r._[0]);
			else if (scope.level.current == 3) params.push(scope.level._[2]);

			spawn("node", params, { shell: true, detached: true });
			console.log("Spawned new Monitor as " + scope.client.user.username + (params.length > 2 ? ", locked to " + params[2] : "") + ".");
		} else if (r.hasFlags()) {
			console.log("Expected no flags. Found: " + Object.keys(r).slice(3));
		} else {
			console.log("Invalid Syntax.");
		}

		console.log();
	}
};

module.exports = command;
