const deasync = require("deasync");

var command = {
	level: [1, 2, 3],													// Array of CLI levels the command is available on
	alias: ["APPEAR", "A"],												// Array of command aliases
	desc: "Sets the account status.",									// General description of the command, used by HELP
	help: `
STATUS [STAT]

    STAT      The status to set the account to. One of:
              'ONLINE', 'IDLE', 'DND', 'INVISIBLE'

If STAT is not specified, displays the current status.
`,																		// 'In-Depth' help, including usage and flag documentation
	exec: function (r, scope) {											// The function to be run when the command is called
		// @param r      - details of the command-line input
		// @param scope  - provides access to objects such as the discord client common to all commands
		
		if (!r.hasFlags() && !r._[1]) {			// Checks that the input had no flags and no 'second' data
			if (r._[0]) { 						// Checks if the input has 'first' data (i.e. STAT param); true => setting status...
				var status;
				
				switch (r._[0].toUpperCase()) {				// Sets the status (allowing for aliases) - just in case you can't read; ...
					case "ONLINE":
					case "O":
						status = "online";		// ... sets it to online
						break;
						
					case "IDLE":
					case "AWAY":
					case "A":
						status = "idle";		// ... sets it to away
						break;
						
					case "DND":
					case "D":
						status = "dnd";			// ... sets it to dnd
						break;
						
					case "INVISIBLE":
					case "INVISI":
					case "INV":
					case "I":
						status = "invisible";	// ... sets it to invisible
						break;
						
					default:					// If unknown (i.e. invalid) alias, fail the command immediately
						console.log("Unknown status: '" + r._[0] + "'.\n");
						return;
				}
				
				deasync(scope.client.user.setStatus(status));
				console.log("Set status to '" + status.toUpperCase() + "'."); // Log that we've set the status
			} else {							// Displaying status...
				console.log("Current status is '" + scope.client.user.presence.status.toUpperCase() + "'.");
			}
		} else if (r.hasFlags()) {				// If the input has a flag, fail and give an error message
			console.log("Expected no flags. Found: " + Object.keys(r).slice(3));
		} else {								// If we don't know how to parse the input for this command, give an error message
			console.log("Invalid Syntax.");
		}

		console.log();							// For the purposes of good formatting...
	}
};

module.exports = command;
