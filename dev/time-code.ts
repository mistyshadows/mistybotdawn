import { Message } from "discord.js";

export { timeConverter };

/**
 * timeConverter
 * 
 * Creates Unix timestamps for use with Discord!
 * 
 * @param m: Message object. Message content should start with !time, <format: d: year/month/day, D: Month day, year, t: hour:minute am/pm, T: hour:minute:second am/pm, f: Month day, year hour:minute am/pm, F: Day of week, month day, year hour:minute am/pm, R: Relative to current time, or nothing for the raw code>, the date as either <year/month/day> <hour:minute> or <year/month/day>, and ending with <timezone name>. Ex: R 2023/04/05 11:51>.
 * 
 * @returns void
 */
async function timeConverter( m:Message ) {

    //!getTime 2023/08/06 11:52
    let time:string = m.content.split(" ").slice(1).join(" ");

    if( time === "help") {
        m.channel.send("Please provide time in the correct format of <format (optional)> <year/month/day> <hour:minute:second (second is optional)> <timezone code (optional but defaults to UTC if not specified)>.\nExtended Information: <format: d: year/month/day, D: Month day, year, t: hour:minute am/pm, T: hour:minute:second am/pm, f: Month day, year hour:minute am/pm, F: Day of week, month day, year hour:minute am/pm, R: Relative to current time>, the date as either <year/month/day> <hour:minute> or <year/month/day>, and ending with <timezone name>. Ex: !time R 2023/04/05 11:51 PST")
        return;
    }

    const dateRegex = new RegExp("(?:([dDfFtTR]) )?(?:(?:[0-9]{4})\/(?:[0-9]{1,2})\/(?:[0-9]{1,2}))(?: (?:[0-2]?[0-9]):(?:[0-9]{2})(?::[0-9]{2})?(?:am|pm)?)?(?: ([a-zA-Z]{3,5}))?");

    if( !dateRegex.test(time) ) {
        m.channel.send("Error: Time not in the correct format of <format> <year/month/day> <hour:minute> <timezone code>. Ex: 2023/01/05 11:51 PST");
        return;
    }

    const timeRegexed = dateRegex.exec(time);
    let timeFormatCode = "";

    if( timeRegexed && ["f","F","d","D","t","T","R"].includes(timeRegexed[1]) ) {
        time = time.split(" ").slice(1).join(" ");
        timeFormatCode = ":" + timeRegexed[1];
    }

    if( timeRegexed && timeRegexed[2] === undefined ) {
        time += "Z";
    }

    const date:Date = new Date( time );
        
    if( date.toString() === "Invalid Date" ) {
        m.channel.send("Error: Time not in the correct format of <format> <year/month/day> <hour:minute> <timezone code>. Ex: 2023/01/05 11:51 PST");
        return;
    }

    const timeSinceEpochInSeconds:number = Math.floor( date.getTime()/1000 );

    m.channel.send("Your time code is:");
    m.channel.send("<t:" + timeSinceEpochInSeconds + timeFormatCode + ">");

}
