import { REST, Routes } from "discord.js";

const {token, clientID, devGuild } = require( "../config.json");

// Import Command Data
const { slashBotPing } = require("./ping");
const { slashBotEcho } = require("./echo");
const { slashPlay } = require("./music");

const commands = [];

commands.push(slashBotPing.toJSON());
commands.push(slashBotEcho.toJSON());
commands.push(slashPlay.toJSON());

// Creates a new REST Module instance
const rest = new REST().setToken(token);

// Deploys commands
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data:any = await rest.put(
			Routes.applicationGuildCommands(clientID, devGuild),
			{ body: commands },
		);

		// console.log(typeof data);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();