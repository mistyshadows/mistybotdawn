import { ClientOptions, IntentsBitField, Message, TextChannel } from "discord.js";

const { Client, Events, GatewayIntentBits } = require('discord.js');

const { token }: {token:string} = require("../config.json");

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

        if(messageContent.slice(1,5) === "echo" ) {
            
            // Check if the second line is a text channel
            const secondWord: string = messageContent.split(" ")[1];
            const regex = new RegExp( "<#[0-9]*>" );
            if( regex.test(secondWord) ) {
                const channelToSendsnowflake: string = secondWord.slice(2, -1);
                
                const channelToSend: TextChannel = client.channels.cache.get( channelToSendsnowflake );
                
                if( typeof channelToSend === 'undefined' ) {
                    m.channel.send( "Error: That channel does not exist or is in another server I don't have permission to access." );
                    return;
                }
                channelToSend.send( messageContent.slice( 6 + secondWord.length )).catch( (error) => {
                    m.channel.send("Error: I do not have permission to access this channel.");
                    // console.log(error);
                });
                return;                   
            }
            const messageToEcho: string = messageContent.slice(6);
            m.channel.send(messageToEcho);
        }

    }
});