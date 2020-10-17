import { prefix, token } from './discord-config.json';

import fs = require('fs');
import moment = require('moment');
import Redis = require('redis');

import { Library, Logger, LogLevel, PlayerData } from 'nrelay';

import * as Discord from 'discord.js';
import * as RealmData from './realm-data';
import * as Constants from './constants';

export class DiscordBot {
    public bot: Discord.Client;
    public realm: External;
   // public database: Database;
    public logger: any;
    public ready: boolean = false;
    public embedColor: string = '#2e7367';

    constructor() {
        this.bot = new Discord.Client();
        this.bot.login(token);

        //this.database = new Database();

        // called when the bot connects to Discord
        this.bot.on('ready', () => {
            this.realm = new External();
            this.ready = true;

            // open the bot_commands.txt file stream
            this.logger = fs.createWriteStream('command_log.txt', { flags: 'a' });
            Logger.log('Discord', 'Bot connected!', LogLevel.Success);
            this.bot.user.setActivity('!commands', { type: 'WATCHING' });
        });

        // called when Discord receives an error
        this.bot.on('error', (error) => {
            Logger.log('Discord', `Error: ${error}`, LogLevel.Error);
        });

        this.bot.on('message', message => {
            // check if the bot is ready before handling commands
            if (!this.ready) {
                this.sendStartupMessage(message);
                message.delete();
                return;
            }

            // delete all non-commands in #bot-commands
            if (message.channel.id == Constants.Channels.bot_commands && !message.content.startsWith(prefix) && !message.author.bot) {
                message.delete();
                return;
            }

            // only handle messages that start with the command prefix
            if (!message.content.startsWith(prefix) || message.author.bot) return;

            // if command was sent via server channel, delete the message
            if (message.channel.type == 'text') {
                message.delete();
            }
            
            const args = message.content.slice(prefix.length).split(/ +/);
            const command = args.shift().toLowerCase();
            const author = this.bot.users.cache.get(message.author.id);

            // write the command to the log files
            let date = Date.now();
            let newDate = moment(date, 'x').format('DD-MM-YY HH:mm:ss')
            this.logger.write(`[${newDate}] [${message.author.username}] ${command} ${args.toString()}\n`);
            
            // handle commands
            switch(command) {
                case 'sendcommands':
                    this.sendCommandsMessage(message, false);
                    break;
                case 'commands':
                    this.sendCommandsMessage(message, true);
                    break;
                case 'track':
                    this.handleTrackCommand(message, args);
                    break;
                case 'location':
                case 'loc':
                    this.handleLocCommand(message, args);
                    break;
                case 'gold':
                    this.handleGoldCommand(message, args);
                    break;
                case 'realm':
                    this.handleRealmCommand(message, args);
                    break;
                default:
                    author.send('Command not found.. please send **``!commands``** for a list of commands');
                    break;
            }            
        });
    }

    /**
     *  Handle the command !track
     * 
     * @param message the discord message sent by a user
     * @param args the arguments from the discord message
     */
    public handleTrackCommand(message: Discord.Message, args: string[]): void {
        let alphaRegex = /^[A-z]+$/g;

        if (args[1] && !args[1].match(alphaRegex)) {
            message.author.send('Your command was not sent, please enter a username with only alpha-numeric characters (A-z)');
            return;
        }

        if (args[0] == 'add') {

            //let result = this.database.addTrackedPlayer(args[1], message.author.id);

            //if (result) {
                //message.author.send(`Player **\`\`${args[1]}\`\`** was added to your track list`);
            //} else {
                //message.author.send(`Player **\`\`${args[1]}\`\`** is already in your track list`);
            //}

            if (args.length >= 1) {
                this.realm.addToTracked(args[1], message.author.id, (result) => {
                    if (result) {
                        message.author.send(`Player **\`\`${args[1]}\`\`** was added to your track list`);
                    } else {
                        message.author.send(`Player **\`\`${args[1]}\`\`** is already in your track list`);
                    }
                });
                return;
            }
        } else if (args[0] == 'remove') {
            
            //let result = this.database.removeTrackedPlayer(args[1], message.author.id);

            //if (result) {
                //message.author.send(`Player **\`\`${args[1]}\`\`** was removed from your track list`);
            //} else {
                //message.author.send(`Player **\`\`${args[1]}\`\`** is not in your track list`);
            //}
            
            if (args.length >= 1) {
                this.realm.removeFromTracked(args[1], message.author.id, (result) => {
                    if (result) {
                        message.author.send(`Player **\`\`${args[1]}\`\`** was removed from your track list`);
                    } else {
                        message.author.send(`Player **\`\`${args[1]}\`\`** is not in your track list`);
                    }
                });
                return;
            }
        } else if (args[0] == 'toggle') {
            this.realm.toggleTracking(message.author.id, (enabled) => {
                if (enabled) {
                    message.author.send('Tracking **``enabled``**');
                } else {
                    message.author.send('Tracking **``temporarily disabled``**');
                }
             });
             return;
        } else if (args[0] == 'clear') {
            //this.database.clearTracklist(message.author.id);

            //message.author.send('Your tracklist has been cleared');
            //return;
        } else if (args[0] == 'list') {
            //let tracklist = this.database.getTracklist(message.author.id);

            //if (tracklist.length == 0) {
                //message.author.send('You are not tracking anyone!');
                //return;
            //}

            //let description = '\n```';
            //tracklist.forEach((player) => {
                //description = description + `${player}\n`;
            //})
            //description = description + '```';

            //let embed = new Discord.MessageEmbed()
                //.setTitle('Your tracklist')
                //.setDescription(description)
                //.setTimestamp()
                //.setFooter('RealmSpy', 'https://cdn.discordapp.com/avatars/724018118510510142/ab18597f9dbd9b9b37ea0609bdb95b76.png?size=128');

            //message.author.send(embed).catch((error) => { return });
        } else {
           // message.author.send('Please enter a track command type: \n```!track add player\n!track remove player\n!track toggle\n!track clear\n!track list```');
           // return;
        }
        
        message.author.send(`Please enter a player username: **\`\`!track ${args[1]} PlayerName\`\`**`);
    }

    /**
     *  Handle the command !loc
     * 
     * @param message the discord message sent by a user
     * @param args the arguments from the discord message
     */
    public handleLocCommand(message: Discord.Message, args: string[]): void {
        let alphaRegex = /^[A-z]+$/g;

        if (args[0] && !args[0].match(alphaRegex)) {
            message.author.send('Your command was not sent, please enter only alpha-numeric characters (a-Z)');
            return;
        }

        this.realm.getLocation(args[0], function(location) {
            message.author.send(`${location}`);
        });
    }

    /**
     *  Handle the command !realm
     * 
     * @param message the discord message sent by a user
     * @param args the parsed arguments from the discord message
     */
    public handleRealmCommand(message: Discord.Message, args: string[]): void {
        if (!args[0] || !args[1]) {
            message.author.send('Please enter a server and realm to get information on like: **``!realm eunorth medusa``**');
            return;
        }
        let server = args[0].toLowerCase();
        let realm = args[1].toLowerCase();

        if (!RealmData.servers.includes(server)) {
            let newServer = RealmData.parseServer(server);
            if (newServer == null) {
                message.author.send('That realm could not be found');
                return;
            } else {
                server = newServer;
            }
        }

        this.realm.getPortalInfo(server, realm, (data) => {
            if (data == null) {
                message.author.send('The realm could not be found');
                return;
            }
            let ip = (!data.ip) ? "Bot has not connected to the realm, please wait a few minutes and try again" : data.ip;
            let time = moment(data.time, 'x').fromNow();

            const embed = new Discord.MessageEmbed()
                .setColor(this.embedColor)
                .setDescription('\n')
                .setTimestamp()
                .setFooter('RealmSpy', 'https://cdn.discordapp.com/avatars/724018118510510142/ab18597f9dbd9b9b37ea0609bdb95b76.png?size=128')
                .addField('Realm:', `${data.server} ${data.name}`)
                .addField('Players:', data.players)
                .addField('Queue:', data.queue)
                .addField('IP:', `${ip}\n\n`)
                .addField('Retreived:', time);

            message.author.send('', { embed });
        });
    }

    /**
     *  Handle the command !gold
     * 
     * @param message the discord message sent by a user
     */
    public handleGoldCommand(message: Discord.Message, args: string[]): void {
        let alphaRegex = /^[A-z]+$/g;

        if (!args[0]) {
            message.author.send('Please enter a player to query their gold: **``!gold playername``**');
            return;
        }
        if (!args[0].match(alphaRegex)) {
            message.author.send('Your command was not sent, please enter only alpha-numeric characters (a-Z)');
            return;
        }
        this.realm.getGold(args[0], (reply) => {
            message.author.send(reply);
        });
    }

    /**
     *  Send a message to a user when a command is received but the bot is not ready
     * 
     * @param message the message sent by the user
     */
    public sendStartupMessage(message: Discord.Message): void {
        message.author.send('The bot is currently starting up or disconnected.. please try again in 2 minutes');
        return;
    }

    /**
     *  Send a user a message when a tracked player is seen
     * 
     * @param username the username of the player found
     * @param tracker the discord user ID of the person tracking
     */
    public callPlayer(username: string, tracker: string): void {
        if (!this.ready) return;
        let user = this.bot.users.cache.get(tracker);
        if (!user) return;

        let tracking = this.realm.trackingEnabled(user.id, (enabled) => {
            if (!enabled) return;

            this.realm.getLocation(username, async function(location) {
                let message = await user.send(location).catch((error) => { return; });
            });
        });
    }

    /**
     *  Send a channel message when a player with 25k+ fame enters a nexus
     * 
     * @param player PlayerData
     */
    public callBaller(player: PlayerData): void {
        let channel = this.bot.channels.cache.get(Constants.Channels.high_fame);
        let parsedFame = RealmData.parseNumber(player.currentFame);
        let className = RealmData.parseClass(player.class);
    
        const embed = new Discord.MessageEmbed()
            .setColor(this.embedColor)
            .setDescription(`Big baller [**${player.name}**](https://realmeye.com/player/${player.name}) entered **${player.server}** nexus with **${parsedFame}** fame on ${className}`)
            .setTimestamp()
            .setFooter('RealmSpy', 'https://cdn.discordapp.com/avatars/724018118510510142/ab18597f9dbd9b9b37ea0609bdb95b76.png?size=128');
    
        (channel as Discord.TextChannel).send('', { embed });
    }

    /**
     *  Sends a channel message when a dungeon key is popped in the nexus
     * 
     * @param name the name of the dungeon
     * @param server the server the key was popped in
     * @param username the key poppers username
     */
    public callKey(name: string, server: string, username: string): void {
        let channel = this.bot.channels.cache.get(Constants.Channels.key_pops);
        let portalData = RealmData.getPortalData(name);
    
        const embed = new Discord.MessageEmbed()
            .setColor(portalData.color)
            .setThumbnail(portalData.image)
            .setDescription(`**${name}** opened in **${server}** nexus by ${username}`)
            .setTimestamp()
            .setFooter('RealmSpy', 'https://cdn.discordapp.com/avatars/724018118510510142/ab18597f9dbd9b9b37ea0609bdb95b76.png?size=128');
    
        if (channel) (channel as Discord.TextChannel).send('', { embed }).catch((error) => {
            Logger.log('Discord', `Error sending key pop notification: ${error}`, LogLevel.Warning);
        });
    }

    /**
     * Called when a game manager enters the nexus
     * 
     * @param player PlayerData
     */
    public callGameManager(player: PlayerData): void {
        let channel = this.bot.channels.cache.get(Constants.Channels.game_managers);

        let username = player.name;
        let server = player.server;
        let gold = RealmData.parseNumber(player.gold);
        let className = RealmData.parseClass(player.class);

        const embed = new Discord.MessageEmbed()
            .setColor(this.embedColor)
            .setDescription(`Game manager [**${player.name}**](https://realmeye.com/player/${player.name}) entered **${player.server}** nexus on ${className}\n\nAccount gold: \`${gold}\``)
            .setTimestamp()
            .setFooter('RealmSpy', 'https://cdn.discordapp.com/avatars/724018118510510142/ab18597f9dbd9b9b37ea0609bdb95b76.png?size=128');
    
        if (channel) (channel as Discord.TextChannel).send('', { embed }).catch((error) => {
            Logger.log('Discord', `Error sending game manager notification: ${error}`, LogLevel.Warning);
        });
    }

    /**
     * Called when a player with a high amount of gold is spotted entering a nexus
     * 
     * @param username the username of the gm
     * @param gold the amount of gold the player has
     */
    public callRichPlayer(username: string, gold: number): void {
        let channel = this.bot.channels.cache.get(Constants.Channels.high_gold);
        let parsedGold = RealmData.parseNumber(gold);

        const embed = new Discord.MessageEmbed()
            .setColor(this.embedColor)
            .setDescription(`Player [**${username}**](https://realmeye.com/player/${username}) was spotted with **${parsedGold}** gold`)
            .setTimestamp()
            .setFooter('RealmSpy', 'https://cdn.discordapp.com/avatars/724018118510510142/ab18597f9dbd9b9b37ea0609bdb95b76.png?size=128');
    
        if (channel) (channel as Discord.TextChannel).send('', { embed }).catch((error) => {
            Logger.log('Discord', `Error sending high gold notification: ${error}`, LogLevel.Warning);
        });
    }

    /**
     * Called when a players gold increases
     * 
     * @param player PlayerData
     * @param oldGold the account gold before the purchase
     */
    public callGoldPurchase(player: PlayerData, oldGold: number): void {
        let channel = this.bot.channels.cache.get(Constants.Channels.gold_purchases);
        let username = player.name;
        let newGold = RealmData.parseNumber(player.gold);
        let parsedGold = RealmData.parseNumber(oldGold);
        let difference = RealmData.parseNumber(player.gold - oldGold);

        const embed = new Discord.MessageEmbed()
        .setColor(this.embedColor)
        .setDescription(`Player [**${username}**](https://realmeye.com/player/${username}) just purchased **${difference}** gold\n\nOld amount: \`${parsedGold}\`\nNew amount: \`${newGold}\``)
        .setTimestamp()
        .setFooter('RealmSpy', 'https://cdn.discordapp.com/avatars/724018118510510142/ab18597f9dbd9b9b37ea0609bdb95b76.png?size=128');

        if (channel) (channel as Discord.TextChannel).send('', { embed }).catch((error) => {
            Logger.log('Discord', `Error sending gold purchase notification: ${error}`, LogLevel.Warning);
        });
    }

    /**
     * Sends a message when a player with an invalid (non-alpha) name is spotted
     * 
     * @param player PlayerData
     */
    public callInvalidName(player: PlayerData): void {
     
        // #invalid-names
        let channel = this.bot.channels.cache.get(Constants.Channels.invalid_names);
        let parsedClass = RealmData.parseClass(player.class);
        let parsedGold = RealmData.parseNumber(player.gold);
        let parsedFame = RealmData.parseNumber(player.accountFame);

        const embed = new Discord.MessageEmbed()
            .setColor(this.embedColor)
            .setDescription(`Player \`\`${player.name}\`\` was spotted in **${player.server}** nexus\n\nClass: \`\`${parsedClass}\`\`\n\nGold: \`\`${parsedGold}\`\`\n\nCharacter fame: \`\`${parsedFame}\`\``)
            .setTimestamp()
            .setFooter('RealmSpy', 'https://cdn.discordapp.com/avatars/724018118510510142/ab18597f9dbd9b9b37ea0609bdb95b76.png?size=128');
    
        if (channel) (channel as Discord.TextChannel).send('', { embed }).catch((error) => {
            Logger.log('Discord', `Error sending invalid name notification: ${error}`, LogLevel.Warning);
        });
    }

    /**
     * Called when a null name account is spotted (now deprecated since the method is patched)
     * 
     * @param player PlayerData
     */
    public callNullName(player: PlayerData): void {

        // #null-names
        let channel = this.bot.channels.cache.get(Constants.Channels.null_names);
        let className = RealmData.parseClass(player.class);
        let parsedFame = RealmData.parseNumber(player.currentFame);
        let parsedGold = RealmData.parseNumber(player.gold);


        const embed = new Discord.MessageEmbed()
            .setColor(this.embedColor)
            .setDescription(`Null name \`\`${className}\`\` spotted in ${player.server}\n\nAccount stars: \`\`${player.stars}\`\`\nAccount gold: \`\`${parsedGold}\`\`\nCharacter fame: \`\`${parsedFame}\`\``)
            .setTimestamp()
            .setFooter('RealmSpy', 'https://cdn.discordapp.com/avatars/724018118510510142/ab18597f9dbd9b9b37ea0609bdb95b76.png?size=128');
    
        if (channel) (channel as Discord.TextChannel).send('', { embed }).catch((error) => {
            Logger.log('Discord', `Error sending null name notification: ${error}`, LogLevel.Warning);
        });
    }

    /**
     * Sends a message when a player is spotted changing their username
     * 
     * @param previousName the player's previous username
     * @param newName the player's new username
     */
    public callNameChange(previousName: string, newName: string): void {
     
        // #name-changes
        let channel = this.bot.channels.cache.get(Constants.Channels.name_changes);

        const embed = new Discord.MessageEmbed()
            .setColor(this.embedColor)
            .setDescription(`Player \`\`${previousName}\`\` changed their username to [**${newName}**](https://realmeye.com/player/${newName})`)
            .setTimestamp()
            .setFooter('RealmSpy', 'https://cdn.discordapp.com/avatars/724018118510510142/ab18597f9dbd9b9b37ea0609bdb95b76.png?size=128');
    
        if (channel) (channel as Discord.TextChannel).send('', { embed }).catch((error) => {
            Logger.log('Discord', `Error sending name change notification: ${error}`, LogLevel.Warning);
        });
    }
    
    /**
     * Sends a message when a possible discord raid is spotted in a location
     * 
     * @param server the discord server running the raid
     * @param usernames array of staff member usernames spotted
     * @param location the location of the raid
     */
    public callDiscordRun(server: string, usernames: string[], location: string): void {       
        let discordData = RealmData.parseDiscordServer(server);
        
        let staffAmount = usernames.length;
        let description = `${staffAmount} ${discordData.name} staff members were spotted in the same location: \`${location}\`\n\n\`\`\``;

        for (let x = 0; x < staffAmount; x++) {
            description = description + usernames[x] + '\n';
        }
        description = description + '```';

        const embed = new Discord.MessageEmbed()
            .setColor(this.embedColor)
            .setTitle('Raid detected')
            .setDescription(description)
            .setTimestamp()
            .setFooter('RealmSpy', 'https://cdn.discordapp.com/avatars/724018118510510142/ab18597f9dbd9b9b37ea0609bdb95b76.png?size=128');

        let serverChannel = this.bot.channels.cache.get(discordData.channel);

        if (serverChannel) (serverChannel as Discord.TextChannel).send('', { embed }).catch((error) => {
            Logger.log('Discord', `Error sending Discord raid notification: ${error}`, LogLevel.Warning);
        });
    }

    /**
     * Sends a message when a staff member is spotted entering a location
     * 
     * @param discordServer the discord server of the raid
     * @param username the staff members username
     * @param server the ingame server 
     * @param location the location of the staff member
     */
    public callStaffLocation(discordServer: string, username: string, server: string, location: string): void
    {
        let discordData = RealmData.parseDiscordServer(discordServer);
        let message = "";
        switch(location)
        {
            case 'left':
                message = `**${username}** entered \`left bazaar\` in **${server}**`;
                break;
            case 'right':
                message = `**${username}** entered \`right bazaar\` in **${server}**`;
                break;
            case 'realm':
                message = `**${username}** entered a realm in **${server}**`;
                break;
        }

        this.realm.addStaffLocation(discordServer, username, server, location, (result) => {
            if (result !== null) {
                let message = `${result.length} staff members spotted in same location\`\`\``;

                message += result[0] + '\n';
                result.forEach(element => {
                    message += `${element}\n`;
                });
                message = message + `\`\`\`**\`\`\`${server} ${location}\`\`\`**`;

                let embed = new Discord.MessageEmbed()
                    .setColor(this.embedColor)
                    .setTitle('Possible raid')
                    .setDescription(message)
                    .setTimestamp()
                    .setFooter('RealmSpy', 'https://cdn.discordapp.com/avatars/724018118510510142/ab18597f9dbd9b9b37ea0609bdb95b76.png?size=128');
                

                let serverChannel = this.bot.channels.cache.get(discordData.channel);
                if (serverChannel) (serverChannel as Discord.TextChannel).send(embed).catch((error) => {
                    Logger.log('Discord', `Error sending Discord raid notification: ${error}`, LogLevel.Warning);
                });

                embed.setTitle(`Possible @${discordData.name} raid`);

                let allChannel = this.bot.channels.cache.get(Constants.Channels.all_raids);
                if (allChannel) (allChannel as Discord.TextChannel).send(embed).catch((error) => {
                    Logger.log('Discord', `Error sending Discord raid notification: ${error}`, LogLevel.Warning);
                });
            }
        });

        const embed = new Discord.MessageEmbed()
            .setColor('#000000')
            .setDescription(message)
            .setTimestamp()

        let serverChannel = this.bot.channels.cache.get(discordData.channel);
        if (serverChannel) (serverChannel as Discord.TextChannel).send(embed).catch((error) => {
            Logger.log('Discord', `Error sending Discord raid notification: ${error}`, LogLevel.Warning);
        });
    }

    /**
     *  Sends a message with the list of accepted commands
     * 
     * @param message (optional) the discord message to reply to
     * @param reply whether the message should be sent directly to a user
     */
    public sendCommandsMessage(message?: Discord.Message, reply: boolean = true): void {
        
        const embed = new Discord.MessageEmbed()
            .setColor(this.embedColor)
            .setAuthor('Command list', 'https://cdn.discordapp.com/avatars/724018118510510142/ab18597f9dbd9b9b37ea0609bdb95b76.png?size=128')
            .setDescription(
                '\n\n**SEND ALL COMMANDS TO THE BOT VIA PRIVATE MESSAGE\n' +
                '```diff\n' + 
                '+ !commands\n' +
                '\tdisplay this message\n\n' +
                '+ !gold playername\n' +
                '\tshow how much account gold a player has\n\n' +
                '+ !track add playername\n' + 
                '\tadd a user to your tracked players\n\n' + 
                '+ !track remove playername\n' + 
                '\tstop tracking a player\n\n' + 
                '+ !track toggle\n' +
                '\tpause or resume tracking all players\n\n' +
                '+ !loc playername\n' +
                '+ !location playername\n' +
                '\tget the last known location of a player\n\n```'
            )
            .setTimestamp()
            .setFooter('RealmSpy', 'https://cdn.discordapp.com/avatars/724018118510510142/ab18597f9dbd9b9b37ea0609bdb95b76.png?size=128');

        // send the message to #bot-commands
        if (!reply) {
            let channel = this.bot.channels.cache.get(Constants.Channels.bot_commands);

            if (channel) (channel as Discord.TextChannel).send('', { embed }).catch((error) => {
                Logger.log('Discord', `Error sending the commands message: ${error}`, LogLevel.Warning);
            });
            return;
        // send the message directly to a user
        } else if (message) {
            message.author.send('', { embed }).catch((error) => { return; });
        }
    }


    /**
     *  Parse a mention from a message and return the user ID
     * 
     * @param mention the mention from a discord message
     */
    public getUserIdFromMention(mention: string): string {
        if (!mention) return;

        if (mention.startsWith('<@') && mention.endsWith('>')) {
            mention = mention.slice(2, -1);

            if (mention.startsWith('!')) {
                mention = mention.slice(1);
            }

            let user = this.bot.users.cache.get(mention);
            return user.id;
        }
    }
}



/**
 *  The library for interacting with the backend (redis/mysql)
 */
@Library ({
    name: 'backend functions',
    author: 'him#1337',
    enabled: true
})
export class External {

    private redis = Redis.createClient();
  
    constructor() {
        this.redis.on('error', (error) => {
            Logger.log('Redis', `Error message received: ${error}`, LogLevel.Error);
        });
    }

    public addStaffLocation(discordServer: string, username: string, server: string, location: string, callback: (result: string[]) => void)
    {
        let raidString = `${discordServer}:${server}:${location}`; 
        let lowercaseUsername = username.toLowerCase();

        this.redis.get(raidString, (error, reply) => {
            if (reply == null) {
                let usernames: string[] = [username]
                this.redis.setex(raidString, 300, JSON.stringify(usernames));
                callback(null);
            } else {
                let usernames: string[] = JSON.parse(reply);
                if (!usernames.includes(username)) {
                    usernames.push(username);
                    this.redis.setex(raidString, 120, JSON.stringify(usernames));
                    if (usernames.length >= 2) {
                        callback(usernames);
                    }
                }
                
            }
        });
    }

    
    public addPortalInfo(server: string, realm: string, info: RealmData.Portal): void {
        let newServer = server.toLowerCase();
        let newRealm = realm.toLowerCase();
        let json = JSON.stringify(info);

        this.redis.set(`portal:${newServer}:${newRealm}`, json);
    }

    public getPortalInfo(server: string, realm: string, callback: (result: RealmData.Portal) => void): void {
        let newServer = server.toLowerCase();
        let newRealm = realm.toLowerCase();

        this.redis.get(`portal:${newServer}:${newRealm}`, (error, reply) => {
            if (reply !== null) {
                let data = JSON.parse(reply);

                this.getPortalIP(newServer, newRealm, (ip: string) => {
                    if (ip !== null) {
                        data.ip = ip;
                        callback(data);
                    } else {
                        data.ip = null;
                        callback(data);
                    }
                });
            } else {
                callback(null);
            }
        });
    }

    public removePortalInfo(server: string, realm: string): void {
        let newServer = server.toLowerCase();
        let newRealm = realm.toLowerCase();

        this.redis.del(`portal:${newServer}:${newRealm}`);
    }

    public addPortalIP(server: string, realm: string, ip: string): void {
        let newServer = server.toLowerCase();
        let newRealm = realm.toLowerCase();

        this.redis.set(`ip:${newServer}:${newRealm}`, ip);
    }

    public getPortalIP(server: string, realm: string, callback: (ip: string) => void): void {
        let newServer = server.toLowerCase();
        let newRealm = realm.toLowerCase();

        this.redis.get(`ip:${newServer}:${newRealm}`, (error, reply) => {
            if (reply !== null){
                callback(reply);
            } else {
                callback(null);
            }
        });
    }

    public checkNameChange(userId: string, username: string, callback: (result: string) => void): void {
        if (userId == undefined) callback(null);
        if (userId == null) callback(null);
        if (userId == "") callback(null);

        this.redis.get(`accountid:${userId}`, (error, reply) => {
            if (reply == null) {
                this.redis.set(`accountid:${userId}`, `${username}`);
            } else {
                if (username !== reply) {
                    callback(reply);
                    this.redis.set(`accountid:${userId}`, `${username}`);
                } else {
                    callback(null);
                }
            }
        });
    }
  
    /**
     *  Return a list of discord user IDs who are tracking a player
     * 
     * @param username the tracked player
     * @param callback a string array containing the discord user IDs of trackers
     */
    public getTrackers(username: string, callback: (trackers: string[]) => void): void {
        username = username.toLowerCase();

        this.redis.get(`tracked:${username}`, (error, reply) => {
            if (reply !== null) {
                let trackers: string[] = reply.split(':');

                callback(trackers);
            } else {
                callback([]);
            }
        });
    }
  
    /**
     *  Add a player to a user's track list
     * 
     * @param username the username of the player to be tracked
     * @param tracker  the discord user ID of the tracker
     * @param callback the result (true/false)
     */
    public addToTracked(username: string, tracker: string, callback: (result: boolean) => void): void {
        username = username.toLowerCase();

        this.redis.get(`tracked:${username}`, (error, reply) => {
            if (reply !== null) {
                let trackers: string[] = reply.split(':');

                if (!trackers.includes(tracker)) {
                    trackers.push(tracker);

                    this.redis.set(`tracked:${username}`, trackers.join(':'));
                    callback(true);
                    return;
                } else {
                    callback(false);
                    return;
                }
            } else {
                this.redis.set(`tracked:${username}`, tracker);
                callback(true);
                return;
            }
        });
    }
  
    /**
     *  Remove a player from a user's track list
     * 
     * @param username 
     * @param tracker 
     * @param callback 
     */
    public removeFromTracked(username: string, tracker: string, callback: (result: boolean) => void): void {
        username = username.toLowerCase();

        this.redis.get(`tracked:${username}`, (error, reply) => {
            if (reply !== null) {
                let trackers: string[] = reply.split(':');

                let index = trackers.indexOf(tracker);
                if (index > -1) {
                    trackers.splice(index, 1);
                    
                    if (trackers.length == 0) {
                        this.redis.del(`tracked:${username}`);
                    } else {
                        this.redis.set(`tracked:${username}`, trackers.join(':'));
                    }
                    
                    callback(true)
                    return;
                } else {
                    callback(false);
                    return;
                }
            } else {
                callback(false);
                return;
            }
        });
    }
  
    /**
     *  Add a players last known location to the database
     * 
     * @param username the players ingame username
     * @param server the server the player was seen on
     * @param type the type of area the player is in (nexus, bazaar, realm，vault, ghall)
     */
    public addLocation(username: string, server: string, type: string): void {
        let time = Date.now();
        this.redis.set(`location:${username.toLowerCase()}`, `${type}:${server}:${time}`)
    }
  
    /**
     *  Get the last known location of a player
     * 
     * @param username the players ingame username
     * @param callback the message to send to the tracker on discord
     */
    public getLocation(username: string, callback: (location: string) => void): void {
        this.redis.get(`location:${username.toLowerCase()}`, (error, reply) => {
            if (reply !== null) {
                let info = reply.toString().split(':');
                let server = info[1];
                let time = moment(info[2], 'x').fromNow();

                if(info[0] == 'nexus') {
                    callback(`Player **\`\`${username}\`\`** was seen in \`\`${server}\`\` nexus ${time}`);
                    return;
                } else if (info[0] == 'left') {
                    callback(`Player **\`\`${username}\`\`** was just seen entering \`\`${server}\`\` left bazaar ${time}`);
                    return;
                } else if (info[0] == 'right') {
                    callback(`Player **\`\`${username}\`\`** was just seen entering \`\`${server}\`\` right bazaar ${time}`);
                    return;
                } else if (info[0] == 'vault') {
                    callback(`Player **\`\`${username}\`\`** was seen entering their vault in \`\`${server}\`\` ${time}`);
                    return;
                } else if (info[0] == 'ghall') {
                    callback(`Player **\`\`${username}\`\`** was seen entering their guild hall in \`\`${server}\`\` ${time}`);
                    return;
                } else {
                    callback(`Player **\`\`${username}\`\`** was seen entering a realm in \`\`${server}\`\` ${time}`);
                    return;
                }
            } else {
                callback(`Player **\`\`${username}\`\`** has not been seen by the tracker yet`);
                return;
            }
        });
    }

    /**
     *  Enable or disable tracking notifications for a user
     * 
     * @param userId the users discord ID
     * @param callback the result of the request (true/false)
     */
    public toggleTracking(userId: string, callback: (enabled: boolean) => void): void {
        this.redis.get(`enabled:${userId}`, (error, reply) => {
            if (reply !== null) {
                if (reply == 'false') {
                    this.redis.set(`enabled:${userId}`, 'true');
                    callback(true);
                } else {
                    this.redis.set(`enabled:${userId}`, 'false');
                    callback(false);
                }
            } else {
                this.redis.set(`enabled:${userId}`, 'false');
                callback(false);
            }
        });
    }

    /**
     *  Query whether a user has tracking enabled
     * 
     * @param userId the users discord ID
     * @param callback the result of the query (true/false)
     */
    public trackingEnabled(userId: string, callback: (enabled: boolean) => void): void {
        this.redis.get(`enabled:${userId}`, (error, reply) => {
            if (reply == "false") {
                callback(false);
            } else {
                callback(true);
            }
        });
    }

    /**
     *  Log the account gold of a user and check for any gold purchases
     * 
     * @param player PlayerData
     */
    public checkGold(player: PlayerData, callback: (player: PlayerData, oldGold) => void): void {
        let lowerUsername = player.name.toLowerCase();

        this.redis.get(`gold:${lowerUsername}`, (error, reply) => {
            if (reply !== null) {
                let parsedGold = parseInt(reply);
                // check for a gold increase
                let difference = player.gold - parsedGold;
                if (parsedGold < player.gold && difference >= 500) {
                    callback(player, parsedGold);
                    return;
                }
            }
            callback(null, null);
        });
        this.redis.set(`gold:${lowerUsername}`, player.gold.toString());
    }

    /**
     *  Query the amount of gold a user has ingame
     * 
     * @param username 
     */
    public getGold(username: string, callback: (reply: string) => void): void {
        let lowerUsername = username.toLowerCase();
        this.redis.get(`gold:${lowerUsername}`, (error, reply) => {
            if (reply !== null) {
                let parsedGold = reply.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

                callback(`Player **\`\`${username}\`\`** has **${parsedGold}** gold`);
            } else {
                callback(`Player **\`\`${username}\`\`** does not exist or has not been seen by the tracker yet`);
            }
        });
    }
  }
