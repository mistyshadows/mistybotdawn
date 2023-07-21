import { Client, Message, TextChannel } from "discord.js";

/**
 * Bot Echo: The echo command. Sends the sent message to a channel, defaults to the channel of origin if no 
 * channel location is sent.
 * 
 * @param m: The sent message
 * @param client: The client object
 * @returns undefined
 */
function botEcho( m:Message, client:Client ):undefined {

    const messageContent:string = m.content;
                
    // Check if the second line is a text channel
    const secondWord: string = messageContent.split(" ")[1];
    const regex = new RegExp( "<#[0-9]*>" );
    if( regex.test(secondWord) ) {
        const channelToSendsnowflake: string = secondWord.slice(2, -1);
        
        const channelToSend: TextChannel = client.channels.cache.get( channelToSendsnowflake ) as TextChannel;
        
        // Checks to see if the channel is in the same server
        if(!(m.guild !== null && m.guild.channels.cache.has( channelToSendsnowflake ))) {
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

export { botEcho };
