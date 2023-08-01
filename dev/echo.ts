import { ChannelType, ChatInputCommandInteraction, GuildChannel, Message, SlashCommandBuilder, TextChannel } from "discord.js";

/**
 * Bot Echo: The echo command. Sends the sent message to a channel, defaults to the channel of origin if no 
 * channel location is sent.
 * 
 * @param m: The sent message. Type: Message
 * @returns undefined
 */
function botEcho( m:Message ):undefined {

    const messageContent:string = m.content;
                
    // Check if the second line is a text channel
    const secondWord: string = messageContent.split(" ")[1];
    
    if(typeof secondWord === "undefined" ) {
        m.channel.send("Error: You must supply a message to echo.");
        return;
    }

    const regex = new RegExp( "<#[0-9]*>" );
    if( regex.test(secondWord) ) {
        const channelToSendSnowflake: string = secondWord.slice(2, -1);
        
        const channelToSend: TextChannel = m.client.channels.cache.get( channelToSendSnowflake ) as TextChannel;
        
        // Checks to see if the channel is in the same server
        if(!(m.guild !== null && m.guild.channels.cache.has( channelToSendSnowflake ))) {
            m.channel.send( "Error: You can only send echo commands within the same server." );
            return;
        }
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

// Bot Echo Slash Command

const slashBotEcho = new SlashCommandBuilder();
slashBotEcho.setName("echo").setDescription("Echos the following text in the current channel. Optional: Specify a different channel.")
    .addStringOption( option => (
        option.setName("input").setDescription("The input to echo back").setRequired(true)
    )).addChannelOption( option => (
        option.setName("channel").setDescription("The channel to echo into").addChannelTypes(ChannelType.GuildText)
    ));

async function slashBotEchoCommand(interaction: ChatInputCommandInteraction) {
    const messageToEcho = interaction.options.getString("input");
    const channelToEchoInto = interaction.options.getChannel("channel");
    if( messageToEcho === null) return;
    if(channelToEchoInto === null) {
        await interaction.channel?.send( messageToEcho );
        await interaction.reply({content: "Echo sent.", ephemeral: true});
        return;
    }
    if( !(interaction.guild !== null && interaction.guild.channels.cache.has( channelToEchoInto.id) ) ) {
        await interaction.reply({content: "Error: Channel must be in this server", ephemeral: true});
        return;
    }
    await (channelToEchoInto as TextChannel).send(messageToEcho);
    // await (interaction.client.channels.cache.get(channelToEchoInto.id) as TextChannel).send(messageToEcho);
    await interaction.reply({content: "Echo sent to channel " + channelToEchoInto.toString(), ephemeral: true});
}

export { botEcho, slashBotEcho, slashBotEchoCommand };
