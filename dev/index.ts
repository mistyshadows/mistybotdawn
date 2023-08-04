import { BaseInteraction, ChatInputCommandInteraction, ClientOptions, GuildApplicationCommandManager, GuildMember, IntentsBitField, Message, PermissionFlagsBits, PermissionsBitField, TextChannel } from "discord.js";

const { Client, Events, GatewayIntentBits } = require('discord.js');
const { token }: {token:string} = require("../config.json");

import { botEcho, slashBotEchoCommand } from "./echo";
import { botPing, slashBotPingCommand } from "./ping";
import { loopqueue, pause, play, playnext, restart, search, selectTrack, setUpPlayer, skip, slashPlayCommand, stop } from "./music";
import { Player, SearchResult } from "discord-player";

// Create new client instance

const intentsBits = new IntentsBitField([IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.MessageContent, IntentsBitField.Flags.GuildVoiceStates]);

const clientOptions:ClientOptions = {
    intents: intentsBits
}

const client = new Client( clientOptions );

// When the client is ready, run this code (only once)
// 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, (c: any) => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Log in to Discord with token
client.login(token);

// Create Music Player
const playerPromise = setUpPlayer(client);
let player: Player;

playerPromise.then( (resolvedPlayer) => {
    player = resolvedPlayer;

}).catch( (error) => {
    console.log("Player failed to be created");
} );

const searchResultsMap:Map<string,SearchResult> = new Map();
const timerIdMap:Map<string,NodeJS.Timeout> = new Map();


// Listen for a message
client.on(Events.MessageCreate, async (m: Message) => {
    // Checks for a ! and executes a command, but prevented from calling commands on itself 
    if(m.content[0] === "!" && m.author.id !== "1126413831883718826" ) {

        const messageContent:string = m.content;
        const commandName: string = messageContent.split(" ")[0];
            
        try {
            // Check if the member is an admin
            if(m.member !== null && m.member.permissions.has(PermissionFlagsBits.Administrator, true) ) {
                
                switch (commandName) {
                    case "!echo":
                        botEcho( m );
                        return;
                    case "!ping":
                        botPing( m );
                        return;
                    default:
                        break;
                }

            }
        
            
            switch (commandName) {

                // Music Commands
                    case "!play":
                        play(m, player);
                        return;
                    case "!stop":
                        stop(m);
                        return;
                    case "!skip":
                        skip(m);
                        return;
                    case "!playnext":
                        playnext(m,player);
                        return;
                    case "!search":
                        search(m,player,searchResultsMap,timerIdMap);
                        return;
                    case "!pause":
                        pause(m);
                        return;
                    case "!loopqueue":
                        loopqueue(m);
                        return;
                    case "!restart":
                        restart(m,player);
                        return;
                // Default
                default:
                    break;
            }
        } catch (error) {
            console.log(error);
        }
    }
});

// Listen for Slash Commands
client.on(Events.InteractionCreate, async (interaction: BaseInteraction) => {
    if(!interaction.isChatInputCommand()) return;
    const commandName: string = interaction.commandName;

    // Check if the member is an admin
    if(interaction.member instanceof GuildMember && interaction.member.permissions.has(PermissionFlagsBits.Administrator, true) )  {
        switch(commandName) {
            case "ping":
                try {
                    await slashBotPingCommand(interaction, false);
                } catch (error) {
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                    } else {
                        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                    }
                }
                return;
            case "echo":
                try {
                    await slashBotEchoCommand(interaction);
                } catch (error) {
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                    } else {
                        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                    }
                }
        }
    }

    // Non-Admin Slash Commands

    switch(commandName) {
        case "ping":
            try {
                await slashBotPingCommand(interaction, true);
            } catch (error) {
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            }
            return;
        case "play":
            try {
                await slashPlayCommand( interaction, player );
            } catch (error) {
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            }
    }


});

