var command = {
	alias: ["CLS"],
	desc: "Clears the screen.",
	help: `
CLEAR
`,
	exec: function (r) {
		process.stdout.write("\033c");
	}
};

module.exports = command;
