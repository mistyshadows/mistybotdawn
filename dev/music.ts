

import { GuildQueue, Player, SearchResult, useQueue } from "discord-player";
import { ChatInputCommandInteraction, Client, GuildMember, Message, Options, SlashCommandBuilder, Events } from "discord.js";

export { setUpPlayer, play, slashPlay, slashPlayCommand, stop, skip, playnext, search, selectTrack, pause, loopqueue, restart };

async function setUpPlayer( client:Client ):Promise<Player> {

    const player:Player = new Player(client);
    await player.extractors.loadDefault();

    return player;

}


async function play( m:Message, player:Player ) {
    const channel = m.member?.voice.channel;
    const messageContent = m.content;
    if(!channel) {
        m.reply("You are not connected to a voice channel.");
        return;
    }

    const query = messageContent.split(" ").slice(1).join(" ");

    try {
        const { track } = await player.play(channel, query, {searchEngine: "youtube"} );
        m.reply("Track queued: " + track.title + ", " + track.author);
    } catch (error) {
        m.reply("Something went wrong");
    }
    return;
}

async function stop(m:Message) {

    if(!m.guildId) {
        m.channel.send("Error: Not in a guild.");
        return;
    }
    const queue = useQueue(m.guildId);

    if(!queue) {
        m.channel.send("Error: There is no queue.");
        return;
    }

    queue.delete();
    m.channel.send("Playback stopped.");
    return;
}

async function skip(m:Message) {

    if(!m.guildId) {
        m.channel.send("Error: Not in a guild.");
        return;
    }
    const queue = useQueue(m.guildId);

    if(!queue) {
        m.channel.send("Error: There is no queue.");
        return;
    }

    m.channel.send("Song skipped.");
    queue.node.skip();

}

async function playnext(m:Message, player:Player) {
    if(!m.guildId) {
        m.channel.send("Error: Not in a guild.");
        return;
    }
    const queue = useQueue(m.guildId);

    if(!queue) {
        play(m,player);
        return;
    }

    const query = m.content.split(" ").slice(1).join(" ");
    const searchResult = await player.search(query, {searchEngine: "youtube"});
    const track = searchResult.tracks[0];
    queue.insertTrack(track, 1);

    m.channel.send("Playing next:" + track.title + ", " + track.author);
    return;
}

async function search(m:Message, player:Player, searchResultMap:Map<string, SearchResult>, timerIdMap:Map<string,NodeJS.Timeout>) {
    
    const guildID = m.guildId;

    if(!guildID) {
        m.channel.send("Error: Not in a guild.");
        return;
    }

    const query = m.content.split(" ").slice(1).join(" ");

    if( !query ) {
        m.channel.send("Error: Provide a search query.");
        return;
    }

    const searchResult = await player.search(query, {searchEngine: "youtube"});

    const hasSearchAlready:boolean = searchResultMap.has( guildID );

    searchResultMap.set( guildID, searchResult );

    m.channel.send(`Select one of the following tracks by responding with the cooresponding number:\n1. ${searchResult.tracks[0].title}, ${searchResult.tracks[0].author}\n2. ${searchResult.tracks[1].title}, ${searchResult.tracks[1].author}\n3. ${searchResult.tracks[2].title}, ${searchResult.tracks[2].author}`);

    async function selectTrackEventFunction( m:Message ) {
        if( !searchResultMap.has(guildID as string) ) {
            m.client.removeListener( Events.MessageCreate, selectTrackEventFunction );
            clearTimeout(timerIdMap.get(guildID as string));
            return;
        }
        if( m.guildId === guildID && ["1","2","3"].includes(m.content) ) {
            const selectionSucceeded = await selectTrack( m, player, searchResultMap );
            if(selectionSucceeded ) {
                m.client.removeListener( Events.MessageCreate, selectTrackEventFunction );
                clearTimeout(timerIdMap.get(guildID as string));
            }
            return;
        }
    }
    
    let timeoutID:NodeJS.Timeout | undefined = timerIdMap.get(guildID);

    if(hasSearchAlready) {
        clearTimeout(timeoutID);
        timeoutID = setTimeout(() => {
            searchResultMap.delete(guildID);
        }, 30000);
        timerIdMap.set(guildID,timeoutID);
    } else {
        m.client.on( Events.MessageCreate, selectTrackEventFunction );
        timeoutID = setTimeout(() => {
            searchResultMap.delete(guildID);
        }, 30000);
        timerIdMap.set(guildID,timeoutID);
    }
    
    

    return searchResult;

}



async function selectTrack( m:Message, player:Player, searchResultMap:Map<string, SearchResult> ) {

    // const selection = m.content.split(" ").slice(1).join(" ");
    const selection = m.content;
    const guildId = m.guildId;
    let selectionNumber:number;

    if(!guildId) {
        m.channel.send("Not in a guild.");
        return false;
    }

    const searchResult = searchResultMap.get(guildId);

    if(!searchResult) {
        m.channel.send("No search was performed.");
        return false;
    }

    switch (selection) {
        case "1":
            selectionNumber = 0;
            break;
        case "2":
            selectionNumber = 1;
            break;
        case "3":
            selectionNumber = 2;
            break;
        default:
            m.channel.send("Not a valid selection.");
            return;
    }

    const queue = useQueue(guildId);

    if(!queue) {

        const channel = m.member?.voice.channel;
        if(!channel) {
            m.reply("You are not connected to a voice channel.");
            return false;
        }

        player.play(channel, searchResult.tracks[selectionNumber]);
        m.channel.send("Track queued: " + searchResult.tracks[selectionNumber].url);
        searchResultMap.delete(guildId);

        return true;
    }

    queue.addTrack( searchResult.tracks[selectionNumber] );

    m.channel.send("Track queued: " + searchResult.tracks[selectionNumber].url);
    searchResultMap.delete(guildId);

    return true;
}

async function pause(m:Message){
    
    if(!m.guildId) {
        m.channel.send("Error: Not in a guild.");
        return;
    }
    const queue = useQueue(m.guildId);

    if(!queue) {
        m.channel.send("Error: There is no queue.");
        return;
    }

    queue.node.setPaused(!queue.node.isPaused());
    
    if(queue.node.isPaused()) {
        m.channel.send("Queue is paused.");
    } else {
        m.channel.send("Queue is unpaused.");
    }

    return;
}

async function loopqueue(m:Message) {

    if(!m.guildId) {
        m.channel.send("Error: Not in a guild.");
        return;
    }
    const queue = useQueue(m.guildId);

    if(!queue) {
        m.channel.send("Error: There is no queue.");
        return;
    }

    const messageContent = m.content.split(" ").slice(1).join(" ").toLowerCase();
    let repeatMode:number;

    switch (messageContent) {
        case "0":
        case "off":
            repeatMode = 0;
            m.channel.send("Looping disabled.");
            break;
        case "1":
        case "track":
            repeatMode = 1;
            m.channel.send("Looping set to repeat track.");
            break;
        case "2":
        case "queue":
            repeatMode = 2;
            m.channel.send("Looping set to repeat queue.");
            break;
        case "3":
        case "autoplay":
            repeatMode = 3;
            m.channel.send("Let me pick some songs for you! Adding new songs to queue based on what you've already added.");
            break;
        default:
            m.channel.send("Invalid repeat mode: Please use: 0 for off, 1 for track, 2 for queue, 3 for autoplay.");
            return;
    }
    queue.setRepeatMode(repeatMode);
    return;
}

async function restart( m:Message, player:Player ) {
    if(!m.guildId) {
        m.channel.send("Error: Not in a guild.");
        return;
    }
    const queue = useQueue(m.guildId);

    if(!queue) {
        m.channel.send("Error: There is no queue.");
        return;
    }

    if(!queue.currentTrack) {
        m.channel.send("Error: There is no current track.");
        return;
    }

    const currentTrackURL = queue.currentTrack.url;

    m.content = `!playnext ${currentTrackURL}`;


    await playnext(m,player);
    await skip(m);

    // m.channel.send("Song restarted, not skipped, ignore the above message.");

    return;

}


const slashPlay = new SlashCommandBuilder();
slashPlay.setName("play").setDescription("Adds the song to a queue and plays it. Must be in a voice channel for this to work.").addStringOption( option => (
    option.setName("track").setDescription("The track to play, preferrably URL format").setRequired(true)
));

async function slashPlayCommand(interaction:ChatInputCommandInteraction, player:Player ) {

    const channel = (interaction.member as GuildMember).voice.channel;

    if( !channel ) {
        interaction.reply("You are not connected to a voice channel!");
        return;
    }

    const query = interaction.options.getString("track");

    await interaction.deferReply();    
    
    try {
        const { track } = await player.play(channel, query as string );
        interaction.followUp("Track queued: " + query);
    } catch (error) {
        interaction.followUp(`Something went wrong: ${error}`);
        return;
    }
    
}