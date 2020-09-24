"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.External = exports.DiscordBot = void 0;
const Discord = __importStar(require("discord.js"));
const discord_config_json_1 = require("./discord-config.json");
const fs = require("fs");
const moment_1 = __importDefault(require("moment"));
const Redis = require("redis");
const nrelay_1 = require("nrelay");
const RealmData = __importStar(require("./realm-data"));
class DiscordBot {
    constructor() {
        this.ready = false;
        this.embedColor = '#2e7367';
        this.bot = new Discord.Client();
        this.bot.login(discord_config_json_1.token);
        // called when the bot connects to Discord
        this.bot.on('ready', () => {
            this.realm = new External();
            this.ready = true;
            this.logger = fs.createWriteStream('command_log.txt', {
                flags: 'a'
            });
            nrelay_1.Logger.log('Discord', 'Bot connected!', nrelay_1.LogLevel.Success);
            this.bot.user.setActivity('!commands', { type: 'WATCHING' });
        });
        this.bot.on('message', message => {
            // delete all non-commands in #bot-commands
            if (message.channel.id == '725042418251989064' && !message.content.startsWith(discord_config_json_1.prefix) &&
                !message.author.bot)
                message.delete();
            // only handle messages that start with the command prefix
            if (!message.content.startsWith(discord_config_json_1.prefix) || message.author.bot)
                return;
            // if command was sent via server channel, delete the message
            if (message.channel.type == 'text') {
                message.delete();
            }
            const args = message.content.slice(discord_config_json_1.prefix.length).split(/ +/);
            const command = args.shift().toLowerCase();
            const author = this.bot.users.cache.get(message.author.id);
            let date = Date.now();
            let newDate = moment_1.default(date, 'x').format('DD-MM-YY HH:mm:ss');
            this.logger.write(`[${newDate}] [${message.author.username}] ${command} ${args.toString()}\n`);
            // check if the bot is ready before handling commands
            if (!this.ready) {
                this.sendStartupMessage(message);
                message.delete();
                return;
            }
            switch (command) {
                case 'sendcommands':
                    this.sendCommandsMessage(message, false);
                    break;
                case 'sendwelcome':
                    this.sendWelcomeMessage();
                    break;
                case 'commands':
                    this.sendCommandsMessage(message, true);
                    break;
                case 'verify':
                    this.handleVerifyCommand(message);
                    break;
                case 'unverify':
                    this.handleUnverifyCommand(message, args);
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
    handleTrackCommand(message, args) {
        let alphaRegex = /^[A-z]+$/g;
        this.realm.checkVerification(message.author.id, (result) => {
            if (!result) {
                message.author.send('You are not verified to use the bot, please send **``!verify``** in the #bot-commands channel');
            }
            else {
                if (args[1] && !args[1].match(alphaRegex)) {
                    message.author.send('Your command was not sent, please enter only alpha-numeric characters (a-Z)');
                    return;
                }
                if (args[0] == 'add') {
                    if (args.length >= 1) {
                        this.realm.addToTracked(args[1], message.author.id, (result) => {
                            if (result) {
                                message.author.send(`Player **\`\`${args[1]}\`\`** was added to your track list`);
                            }
                            else {
                                message.author.send(`Player **\`\`${args[1]}\`\`** is already in your track list`);
                            }
                        });
                        return;
                    }
                }
                else if (args[0] == 'remove') {
                    if (args.length >= 1) {
                        this.realm.removeFromTracked(args[1], message.author.id, (result) => {
                            if (result) {
                                message.author.send(`Player **\`\`${args[1]}\`\`** was removed from your track list`);
                            }
                            else {
                                message.author.send(`Player **\`\`${args[1]}\`\`** is not in your track list`);
                            }
                        });
                        return;
                    }
                }
                else if (args[0] == 'toggle') {
                    this.realm.toggleTracking(message.author.id, (enabled) => {
                        if (enabled) {
                            message.author.send('Tracking **``enabled``**');
                        }
                        else {
                            message.author.send('Tracking **``temporarily disabled``**');
                        }
                    });
                    return;
                }
                else if (args[0] == 'clear') {
                    //this.realm.clearTrackList(message.author.id);
                    message.author.send('Your track list has been cleared');
                    return;
                }
                else {
                    message.author.send('Please enter a track command type: **``!track add/remove/toggle/clear``**');
                    return;
                }
                message.author.send(`Please enter a player username: **\`\`!track ${args[1]} PlayerName\`\`**`);
            }
        });
    }
    /**
     *  Handle the command !loc
     *
     * @param message the discord message sent by a user
     * @param args the arguments from the discord message
     */
    handleLocCommand(message, args) {
        let alphaRegex = /^[A-z]+$/g;
        this.realm.checkVerification(message.author.id, (result) => {
            if (!result) {
                message.author.send('You are not verified to use the bot, please send **``!verify``** in the #bot-commands channel');
            }
            else {
                if (args[0] && !args[0].match(alphaRegex)) {
                    message.author.send('Your command was not sent, please enter only alpha-numeric characters (a-Z)');
                    return;
                }
                this.realm.getLocation(args[0], function (location) {
                    message.author.send(`${location}`);
                });
            }
        });
    }
    /**
     *  Handle the command !verify
     *
     * @param message the discord message sent by the user
     */
    handleVerifyCommand(message) {
        // only allow users to verify via the #bot-commands channel
        if (message.channel.type !== "text" || message.channel.id !== "725042418251989064") {
            message.author.send('Please send the verification command from the #bot-commands channel');
            return;
        }
        this.realm.checkVerification(message.author.id, (result) => {
            if (result) {
                message.author.send('You are already verified!');
            }
            else {
                this.realm.addVerification(message.author.id);
                message.author.send('You have been verified to use the bot, thanks!');
            }
        });
    }
    /**
     *  Handle the command !unverify
     *
     * @param message the discord message sent by the user
     * @param args the parsed arguments from the discord message
     */
    handleUnverifyCommand(message, args) {
        // only allow users to send the command via the #bot-commands channel
        if (message.channel.type !== "text" || message.channel.id !== "725042418251989064") {
            message.author.send('Please send the unverify command from the #bot-commands channel');
            return;
        }
        // check if the user has the admin or security role
        if (message.member.roles.cache.has('725690972662530048') || message.member.roles.cache.has('725691652630380555')) {
            if (!args[0]) {
                message.author.send('Please mention a user to unverify: **``!unverify @userhere``**');
                return;
            }
            let idRegex = new RegExp("^[0-9]{18}$");
            if (!args[0].match(idRegex)) {
                message.author.send('Please enter a valid discord user ID, e.g: **``!unverify 146395651255566336``**');
                return;
            }
            this.realm.removeVerification(args[0], (result) => {
                if (result) {
                    message.author.send(`Verification has been removed from ${args[0]}`);
                }
                else {
                    message.author.send(`User ${args[0]} does not have verification status`);
                }
            });
        }
        else {
            message.author.send('You need to be an Admin or Security to send this command');
            return;
        }
    }
    /**
     *  Handle the command !realm
     *
     * @param message the discord message sent by a user
     * @param args the parsed arguments from the discord message
     */
    handleRealmCommand(message, args) {
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
            }
            else {
                server = newServer;
            }
        }
        this.realm.getPortalInfo(server, realm, (data) => {
            if (data == null) {
                message.author.send('The realm could not be found');
                return;
            }
            let ip = (!data.ip) ? "Bot has not connected to the realm, please wait a few minutes and try again" : data.ip;
            let time = moment_1.default(data.time, 'x').fromNow();
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
    handleGoldCommand(message, args) {
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
    sendStartupMessage(message) {
        message.author.send('The bot is currently starting up or disconnected.. please try again in 2 minutes');
        return;
    }
    /**
     *  Send a user a message when a tracked player is seen
     *
     * @param username the username of the player found
     * @param tracker the discord user ID of the person tracking
     */
    callPlayer(username, tracker) {
        if (!this.ready)
            return;
        let user = this.bot.users.cache.get(tracker);
        if (user) {
            let tracking = this.realm.trackingEnabled(user.id, (enabled) => {
                if (enabled) {
                    this.realm.getLocation(username, function (location) {
                        user.send(location);
                    });
                }
            });
        }
    }
    /**
     *  Send a channel message when a player with 25k+ fame enters a nexus
     *
     * @param username the username of the player
     * @param server the server entered
     * @param fame the amount of fame on the players character
     */
    callBaller(username, server, fame) {
        // #big-ballers
        let channel = this.bot.channels.cache.get('725728505714966579');
        const embed = new Discord.MessageEmbed()
            .setColor(this.embedColor)
            .setDescription(`Big baller [**${username}**](https://realmeye.com/player/${username}) entered **${server}** nexus with ${fame} character fame`)
            .setTimestamp()
            .setFooter('RealmSpy', 'https://cdn.discordapp.com/avatars/724018118510510142/ab18597f9dbd9b9b37ea0609bdb95b76.png?size=128');
        channel.send('', { embed });
    }
    /**
     *  Sends a channel message when a dungeon key is popped in the nexus
     *
     * @param name the name of the dungeon
     * @param server the server the key was popped in
     * @param username the key poppers username
     */
    callKey(name, server, username) {
        // #key-pops
        let channel = this.bot.channels.cache.get('725694613893152828');
        let portalData = RealmData.getPortalData(name);
        const embed = new Discord.MessageEmbed()
            .setColor(portalData.color)
            .setThumbnail(portalData.image)
            .setDescription(`**${name}** opened in ${server} nexus by ${username}`)
            .setTimestamp()
            .setFooter('RealmSpy', 'https://cdn.discordapp.com/avatars/724018118510510142/ab18597f9dbd9b9b37ea0609bdb95b76.png?size=128');
        channel.send('', { embed });
    }
    /**
     * called when a game manager enters the nexus
     *
     * @param username the username of the gm
     * @param server the server the player entered
     */
    callGameManager(username, server) {
        // #game-managers
        let channel = this.bot.channels.cache.get('728599135242027131');
        const embed = new Discord.MessageEmbed()
            .setColor(this.embedColor)
            .setDescription(`Game manager [**${username}**](https://realmeye.com/player/${username}) entered **${server}** nexus`)
            .setTimestamp()
            .setFooter('RealmSpy', 'https://cdn.discordapp.com/avatars/724018118510510142/ab18597f9dbd9b9b37ea0609bdb95b76.png?size=128');
        channel.send('', { embed });
    }
    /**
     * called when a rich player enters the nexus
     *
     * @param username the username of the gm
     * @param gold the amount of gold the player has
     */
    callRichPlayer(username, gold) {
        // #rich-niggas
        let channel = this.bot.channels.cache.get('742818844933881888');
        let parsedGold = gold.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        const embed = new Discord.MessageEmbed()
            .setColor(this.embedColor)
            .setDescription(`Player [**${username}**](https://realmeye.com/player/${username}) was spotted with **${parsedGold}** gold`)
            .setTimestamp()
            .setFooter('RealmSpy', 'https://cdn.discordapp.com/avatars/724018118510510142/ab18597f9dbd9b9b37ea0609bdb95b76.png?size=128');
        channel.send('', { embed });
    }
    /**
     * called when a player with an invalid )non-alpha) name is spotted
     *
     * @param username the username of the player
     */
    callInvalidName(username, accountId, server) {
        // #invalid-names
        let channel = this.bot.channels.cache.get('747426430027169902');
        let encodedName = escape(username);
        const embed = new Discord.MessageEmbed()
            .setColor(this.embedColor)
            .setDescription(`Player \`\`${username}\`\` was spotted in ${server}\n\nAccount ID: \`\`${accountId}\`\`\n\nEncoded string: \`\`${encodedName}\`\``)
            .setTimestamp()
            .setFooter('RealmSpy', 'https://cdn.discordapp.com/avatars/724018118510510142/ab18597f9dbd9b9b37ea0609bdb95b76.png?size=128');
        channel.send('', { embed });
    }
    /**
     * called when a player has changed their username
     *
     * @param previousName the player's previous username
     * @param newName the player's new username
     */
    callNameChange(previousName, newName) {
        // #invalid-names
        let channel = this.bot.channels.cache.get('742468801311932468');
        const embed = new Discord.MessageEmbed()
            .setColor(this.embedColor)
            .setDescription(`Player \`\`${previousName}\`\` changed their username to [**${newName}**](https://realmeye.com/player/${newName})`)
            .setTimestamp()
            .setFooter('RealmSpy', 'https://cdn.discordapp.com/avatars/724018118510510142/ab18597f9dbd9b9b37ea0609bdb95b76.png?size=128');
        channel.send('', { embed });
    }
    /**
     * sent when a discord raid is found in a location
     *
     * @param server the discord server running the raid
     * @param usernames array of staff member usernames spotted
     * @param location the location of the raid
     */
    callDiscordRun(server, usernames, location) {
        let discord = '';
        let channel = '';
        switch (server) {
            case 'divinty':
                discord = 'Divinity';
                channel = '756476045422624831';
                break;
            case 'dungeoneer':
                discord = 'Dungeoneer';
                channel = '756476065601421393';
                break;
            case 'sanctuary':
                discord = 'Oryx Sanctuary';
                channel = '756476095582306336';
                break;
            case 'pubhalls':
                discord = 'Pub Halls';
                channel = '756475912115060766';
                break;
            case 'shatters':
                discord = 'Shatters';
                channel = '756475933615063131';
                break;
            case 'fungal':
                discord = 'Fungal Cavern';
                channel = '756476159637717003';
                break;
            case 'sbc':
                discord = 'Spooky Boi Central';
                channel = '756475956545454151';
                break;
        }
        let staffAmount = usernames.length;
        let description = `${staffAmount} ${discord} staff members were spotted in the same location: ${location}\n\n\`\`\``;
        for (let x = 0; x < staffAmount; x++) {
            description = description + usernames[x];
        }
        description = description + '```';
        const embed = new Discord.MessageEmbed()
            .setColor(this.embedColor)
            .setDescription(``);
    }
    sendMessage(message) {
    }
    /**
     *  Sends a message with the list of accepted commands
     *
     * @param message (optional) the discord message to reply to
     * @param reply whether the message should be sent directly to a user
     */
    sendCommandsMessage(message, reply = true) {
        const embed = new Discord.MessageEmbed()
            .setColor(this.embedColor)
            .setAuthor('Command List', 'https://cdn.discordapp.com/avatars/724018118510510142/ab18597f9dbd9b9b37ea0609bdb95b76.png?size=128')
            .setDescription('\nThe current accepted commands from the bot:\n\n' +
            '```diff\n' +
            '- !commands\n' +
            '\tdisplay this message\n\n' +
            '- !verify\n' +
            '\tverify yourself to use the bot\n\n' +
            '- !realm Server RealmName\n' +
            '\tget information about a realm including players, queue and IP\n\n' +
            '- !track add PlayerName\n' +
            '\tadd a user to your tracked players (you will receive a message from the bot when this player is spotted)\n\n' +
            '- !track remove PlayerName\n' +
            '\tstop tracking a player\n\n' +
            '- !track toggle\n' +
            '\tpause or resume tracking all players\n\n' +
            '- !loc PlayerName\n' +
            '\tget the last known location of a player\n\n```')
            .setTimestamp()
            .setFooter('RealmSpy', 'https://cdn.discordapp.com/avatars/724018118510510142/ab18597f9dbd9b9b37ea0609bdb95b76.png?size=128');
        // send the message to #bot-commands
        if (!reply) {
            let channel = this.bot.channels.cache.get('725042418251989064');
            if (channel)
                channel.send('', { embed });
            return;
            // send the message directly to a user
        }
        else if (message) {
            message.author.send('', { embed });
        }
    }
    /**
     *  Send the welcome message to the #welcome channel
     *
     */
    sendWelcomeMessage() {
        // #welcome
        let channel = this.bot.channels.cache.get('725692529814536255');
        const embed = new Discord.MessageEmbed()
            .setColor(this.embedColor)
            .setAuthor('𝓦𝓮𝓵𝓬𝓸𝓶𝓮 𝓽𝓸 𝓡𝓮𝓪𝓵𝓶𝓢𝓹𝔂', 'https://cdn.discordapp.com/avatars/724018118510510142/ab18597f9dbd9b9b37ea0609bdb95b76.png?size=128')
            .setDescription('\nThis is a private tracking discord for Realm of the Mad God\n\n' +
            '**Features**\n\n' +
            '```diff\n' +
            '+ Track certain players entering the nexus, bazaars and realms\n' +
            '+ Notify when waves of players enter any bazaars\n' +
            '+ Track keys popped on every server\n' +
            '+ Retrieve realm information including IP addresses\n\n')
            .setThumbnail('https://static.drips.pw/rotmg/wiki/Enemies/Pentaract%20Eye.png')
            .addField('\n\nWhat next?', '\n\nHead over to <#725042418251989064> or send **``!commands``** for a list of commands\n\n' +
            'The bot will send you a PM and delete your message after every command\n\n')
            .setFooter('created by him#1337', 'https://cdn.discordapp.com/avatars/724018118510510142/ab18597f9dbd9b9b37ea0609bdb95b76.png?size=128');
        if (channel)
            channel.send('', { embed });
    }
    /**
     *  Parse a mention from a message and return the user ID
     *
     * @param mention the mention from a discord message
     */
    getUserIdFromMention(mention) {
        if (!mention)
            return;
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
exports.DiscordBot = DiscordBot;
/**
 *  The library for interacting with the backend (redis/mysql)
 */
let External = class External {
    constructor() {
        this.redis = Redis.createClient();
        this.redis.on('error', (error) => {
            nrelay_1.Logger.log('Redis', `Error message received: ${error}`, nrelay_1.LogLevel.Error);
        });
    }
    /**
     *  Check if a user is verified to send commands to the bot
     *
     * @param userId the users discord ID
     * @param callback the result of the query (true/false)
     */
    checkVerification(userId, callback) {
        this.redis.get(`verified:${userId}`, (error, reply) => {
            if (reply !== null && reply == "true") {
                callback(true);
            }
            else {
                callback(false);
            }
        });
    }
    /**
     *  Verify a user to allow them to interact with the bot
     *
     * @param userId the users discord ID
     */
    addVerification(userId) {
        this.redis.set(`verified:${userId}`, 'true');
    }
    /**
     *  Remove verification from a discord user
     *
     * @param userId the users discord ID
     * @param callback the result of the query (true/false)
     */
    removeVerification(userId, callback) {
        this.checkVerification(userId, (result) => {
            if (result) {
                this.redis.set(`verified:${userId}`, 'false');
                callback(true);
            }
            else {
                callback(false);
            }
        });
    }
    addPortalInfo(server, realm, info) {
        let newServer = server.toLowerCase();
        let newRealm = realm.toLowerCase();
        let json = JSON.stringify(info);
        this.redis.set(`portal:${newServer}:${newRealm}`, json);
    }
    getPortalInfo(server, realm, callback) {
        let newServer = server.toLowerCase();
        let newRealm = realm.toLowerCase();
        this.redis.get(`portal:${newServer}:${newRealm}`, (error, reply) => {
            if (reply !== null) {
                let data = JSON.parse(reply);
                this.getPortalIP(newServer, newRealm, (ip) => {
                    if (ip !== null) {
                        data.ip = ip;
                        callback(data);
                    }
                    else {
                        data.ip = null;
                        callback(data);
                    }
                });
            }
            else {
                callback(null);
            }
        });
    }
    removePortalInfo(server, realm) {
        let newServer = server.toLowerCase();
        let newRealm = realm.toLowerCase();
        this.redis.del(`portal:${newServer}:${newRealm}`);
    }
    addPortalIP(server, realm, ip) {
        let newServer = server.toLowerCase();
        let newRealm = realm.toLowerCase();
        this.redis.set(`ip:${newServer}:${newRealm}`, ip);
    }
    getPortalIP(server, realm, callback) {
        let newServer = server.toLowerCase();
        let newRealm = realm.toLowerCase();
        this.redis.get(`ip:${newServer}:${newRealm}`, (error, reply) => {
            if (reply !== null) {
                callback(reply);
            }
            else {
                callback(null);
            }
        });
    }
    checkNameChange(userId, username, callback) {
        this.redis.get(`accountid:${userId}`, (error, reply) => {
            if (reply !== null) {
                this.redis.set(`accountid:${userId}`, username);
            }
            else {
                if (username !== reply) {
                    callback(reply);
                    this.redis.set(`accountid:${userId}`, username);
                }
                else {
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
    getTrackers(username, callback) {
        username = username.toLowerCase();
        this.redis.get(`tracked:${username}`, (error, reply) => {
            if (reply !== null) {
                let trackers = reply.split(':');
                callback(trackers);
            }
            else {
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
    addToTracked(username, tracker, callback) {
        username = username.toLowerCase();
        this.redis.get(`tracked:${username}`, (error, reply) => {
            if (reply !== null) {
                let trackers = reply.split(':');
                if (!trackers.includes(tracker)) {
                    trackers.push(tracker);
                    this.redis.set(`tracked:${username}`, trackers.join(':'));
                    callback(true);
                    return;
                }
                else {
                    callback(false);
                    return;
                }
            }
            else {
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
    removeFromTracked(username, tracker, callback) {
        username = username.toLowerCase();
        this.redis.get(`tracked:${username}`, (error, reply) => {
            if (reply !== null) {
                let trackers = reply.split(':');
                let index = trackers.indexOf(tracker);
                if (index > -1) {
                    trackers.splice(index, 1);
                    if (trackers.length == 0) {
                        this.redis.del(`tracked:${username}`);
                    }
                    else {
                        this.redis.set(`tracked:${username}`, trackers.join(':'));
                    }
                    callback(true);
                    return;
                }
                else {
                    callback(false);
                    return;
                }
            }
            else {
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
     * @param type the type of area the player is in (nexus, bazaar, realm)
     */
    addLocation(username, server, type) {
        let time = Date.now();
        this.redis.set(`location:${username.toLowerCase()}`, `${type}:${server}:${time}`);
    }
    /**
     *  Get the last known location of a player
     *
     * @param username the players ingame username
     * @param callback the message to send to the tracker on discord
     */
    getLocation(username, callback) {
        this.redis.get(`location:${username.toLowerCase()}`, (error, reply) => {
            if (reply !== null) {
                let info = reply.toString().split(':');
                let server = info[1];
                let time = moment_1.default(info[2], 'x').fromNow();
                if (info[0] == 'nexus') {
                    callback(`Player **\`\`${username}\`\`** was last seen in \`\`${server}\`\` nexus ${time}`);
                    return;
                }
                else if (info[0] == 'left') {
                    callback(`Player **\`\`${username}\`\`** was last seen entering \`\`${server}\`\` left bazaar ${time}`);
                    return;
                }
                else if (info[0] == 'right') {
                    callback(`Player **\`\`${username}\`\`** was last seen entering \`\`${server}\`\` right bazaar ${time}`);
                    return;
                }
                else {
                    callback(`Player **\`\`${username}\`\`** was last seen entering realm ${info[0]} in \`\`${server}\`\` ${time}`);
                    return;
                }
            }
            else {
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
    toggleTracking(userId, callback) {
        this.redis.get(`enabled:${userId}`, (error, reply) => {
            if (reply !== null) {
                if (reply == 'false') {
                    this.redis.set(`enabled:${userId}`, 'true');
                    callback(true);
                }
                else {
                    this.redis.set(`enabled:${userId}`, 'false');
                    callback(false);
                }
            }
            else {
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
    trackingEnabled(userId, callback) {
        this.redis.get(`enabled:${userId}`, (error, reply) => {
            if (reply == "false") {
                callback(false);
            }
            else {
                callback(true);
            }
        });
    }
    /**
     *  Log the account gold amount of a user
     *
     * @param username
     * @param gold
     */
    logGold(username, gold) {
        let lowerUsername = username.toLowerCase();
        this.redis.set(`gold:${lowerUsername}`, gold.toString());
    }
    /**
     *  Query the amount of gold a user has ingame
     *
     * @param username
     */
    getGold(username, callback) {
        let lowerUsername = username.toLowerCase();
        this.redis.get(`gold:${lowerUsername}`, (error, reply) => {
            if (reply !== null) {
                let parsedGold = reply.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                callback(`Player **\`\`${username}\`\`** has **${parsedGold}** gold`);
            }
            else {
                callback(`Player **\`\`${username}\`\`** does not exist or has not been seen by the tracker yet`);
            }
        });
    }
    logClients(clients) {
        let newClient = JSON.stringify(clients);
        this.redis.set('clients', newClient);
    }
    getClients(callback) {
        this.redis.get('clients', (error, reply) => {
            if (reply !== null) {
                let clients = JSON.parse(reply);
                callback(clients);
            }
        });
    }
    logCommand(sender, command) {
        this.redis.lpush(`commands:${sender}`, command);
    }
};
External = __decorate([
    nrelay_1.Library({
        name: 'backend functions',
        author: 'him#1337',
        enabled: false
    }),
    __metadata("design:paramtypes", [])
], External);
exports.External = External;
