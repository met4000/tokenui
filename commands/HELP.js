var command = {
	alias: ["H"],
	desc: "Displays a list of or information about commands.",
	help: `
HELP [COMMAND] [-L LEVEL]

    COMMAND   Displays help information on that command. If not specified,
              displays a list and description of all commands.
    -L LEVEL  Forces help to be displayed as if at the given level.
`,
	exec: function (r, scope) {
		var cLevel = parseInt(r["L"]) | scope.level.current;
		if (r._[0] && (!r.hasFlags() || (r.hasFlag("L") && r.nFlags() == 1)) && !r._[1]) {  // Command Help
			if (Object.keys(scope.commandMap[cLevel]).includes(r._[0])) {
				var c = getCommand(r._[0], cLevel);

				console.log();

				var desc = c.desc;
				if (typeof desc == "object") desc = desc[cLevel];
				if (typeof desc == "function") desc = desc(r);
				if (!help) help = "NO DESCRIPTION IS PROVIDED FOR THIS COMMAND";
				console.log(desc);

				var help = c.help;
				if (typeof help == "object") help = help[cLevel];
				if (typeof help == "function") help = help(r);
				if (!help) help = "\n - NO HELP IS PROVIDED FOR THIS COMMAND - \n";
				console.log(help);
			} else {
				console.log("Unknown Command: '" + r._[0] + "'.\nType HELP for a list of commands.\n");
			}
		} else if (!r._[0] && (!r.hasFlags() || (r.hasFlag("L") && r.nFlags() == 1))) {  // Command List
			var k = Object.keys(scope.commands).filter(v => {
				var l = scope.commands[v].level;
				if (l == undefined) l = [0, 1, 2, 3]; // @TODO - See below commands; this is also manual
				if (typeof l != "object") l = [l];

				return l.includes(cLevel);
			}).sort();

			console.log("For more information on a specific command, type HELP command-name.");
			console.log("Level " + cLevel + " command list:");
			for (var i in k) {
				var desc = scope.commands[k[i]].desc;
				if (typeof desc == "object") desc = desc[cLevel];
				if (typeof desc == "function") desc = desc(r);

				console.log(k[i].appendPad(15) + desc);
			}
			console.log();
		} else {
			console.log("Invalid Syntax.\n");
		}
	}
};

module.exports = command;