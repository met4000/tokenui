const argv = require('minimist')(process.argv.slice(2));
const Discord = require("discord.js"), client = new Discord.Client();

client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));

function preZero (n) { return (parseInt(n) < 10 ? "0" : "") + n; }

if (argv._[1]) {
	client.on("ready", () => {
		console.log("monitor.js loaded and logged in as " + client.user.username + ", locked to " + argv._[1]);
	});
	
	client.on("message", (m) => {
		if (m.channel.id.toString() == argv._[1].toString()) {
			var t = m.createdAt;
			t = preZero(t.getHours()) + ":" + preZero(t.getMinutes()) + ":" + preZero(t.getSeconds());
			console.log("[" + t + "] " + m.author.username + ": " + m.content);
		}
	});
} else {
	client.on("ready", () => {
		console.log("monitor.js loaded and logged in as " + client.user.username);
	});
	
	client.on("message", (m) => {
		var t = m.createdAt;
		t = preZero(t.getHours()) + ":" + preZero(t.getMinutes()) + ":" + preZero(t.getSeconds());
		console.log("[" + t + "] (" + m.channel.id + ") " + m.author.username + ": " + m.content);
	});
}

process.stdout.write("\033c");
client.login(argv._[0]);
