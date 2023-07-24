import { Message } from "discord.js";

/**
 * Bot Ping: The ping command. Sends a message with the text "pong"
 * 
 * @param m: Type: Message. The sent message.
 */
function botPing( m: Message ) {
    m.channel.send( "Pong!" );
    return;
}

export { botPing };