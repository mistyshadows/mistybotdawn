import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from "discord.js";

/**
 * Bot Ping: The ping command. Sends a message with the text "pong"
 * 
 * @param m: Type: Message. The sent message.
 */
function botPing( m: Message ) {
    m.channel.send( "Pony!" );
    return;
}

const slashBotPing = new SlashCommandBuilder();
slashBotPing.setName("ping").setDescription("Replies with Pony!");

async function slashBotPingCommand( interaction: ChatInputCommandInteraction, ephemeralCheck:boolean ) {
    
    if(ephemeralCheck) {
        await interaction.reply({content: "Pony!", ephemeral: true});
    } else {
        await interaction.reply("Pony!");
    }
    
}


export { botPing, slashBotPing, slashBotPingCommand };