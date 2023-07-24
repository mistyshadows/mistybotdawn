import { ClientOptions, IntentsBitField, Message, PermissionFlagsBits, TextChannel } from "discord.js";

const { Client, Events, GatewayIntentBits } = require('discord.js');
const { token }: {token:string} = require("../config.json");

import { botEcho } from "./echo";
import { botPing } from "./ping";

// Create new client instance

const intentsBits = new IntentsBitField([IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.MessageContent]);

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


// Listen for a message
client.on(Events.MessageCreate, (m: Message) => {
    // Checks for a ! and executes a command, but prevented from calling commands on itself 
    if(m.content[0] === "!" && m.author.id !== "1126413831883718826" ) {

        const messageContent:string = m.content;
        const commandName: string = messageContent.split(" ")[0];

        // Check if the member is an admin
        if(m.member !== null && m.member.permissions.has(PermissionFlagsBits.Administrator, true) ) {
            
            switch (commandName) {
                case "!echo":
                    botEcho( m );
                    return;
                case "!ping":
                    botPing( m );
                    return;
            }

        }
        
    }
});