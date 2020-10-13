const mysql = require('mysql')

import { PlayerData, Logger, LogLevel } from 'nrelay';
import { parseClass, parseGuildRank } from './realm-data';

export class Database
{
    db: any;

    constructor()
    {
        this.db = mysql.createConnection({
            host: 'localhost',
            user: 'realmspy',
            password: 'Loldongs*123',
            database: 'realmspy'
        });
        this.db.connect();
        
        this.db.on('error', (error: any) => {
            Logger.log('MySQL', `Received MySQL error: ${error}`, LogLevel.Error);
        });
    }

    public updateLocation(player: PlayerData, location: string): void
    {
        let statement = "INSERT OR REPLACE INTO players " + 
        "(username, account_fame, account_gold, guild, guild_rank, account_stars, last_server, last_location, last_class) " + 
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

        let inserts = [player.name, player.accountFame, player.gold, player.guildName, parseGuildRank(player.guildRank), player.stars, player.server, location, parseClass(player.class)];
        const sql = this.db.format(statement, inserts);
        this.db.query(sql);
        return;
    }

    public addPlayerLog(player: PlayerData, location: string): void
    {
        let statement = "INSERT INTO player_logs (account_id, username, server, location, class, char_fame) VALUES (?, ?, ?, ?, ?, ?)"
        let inserts = [player.accountId, player.name, player.server, location, parseClass(player.class), player.currentFame];

        const sql = this.db.format(statement, inserts);

        this.db.query(sql);
        return;
    }

    public checkGoldDifference(player: PlayerData, callback: (difference: number) => void): void
    {
        //this.db.query("SELECT `account_gold` FROM `players` WHERE `username` = ?", player.name, (error, results, fields) => {
            
       // })
    } 

    public addPlayer(player: PlayerData): void
    {
        if (player.accountId == undefined || player.accountId == null) {
            const insert = this.db.prepare('INSERT OR REPLACE INTO players (username, account_fame, account_gold, guild, guild_rank, account_stars) VALUES (@username, @account_fame, @account_gold, @guild, @guild_rank, @account_stars)');

            insert.run({
                username: player.name,
                account_fame: player.accountFame,
                account_gold: player.gold,
                guild: player.guildName,
                guild_rank: parseGuildRank(player.guildRank),
                account_stars: player.stars
            });
        } else {
            const insert = this.db.prepare('INSERT OR REPLACE INTO players (account_id, username, account_fame, account_gold, guild, guild_rank, account_stars) VALUES (@account_id, @username, @account_fame, @account_gold, @guild, @guild_rank, @account_stars)');
        
            insert.run({
                account_id: player.accountId,
                username: player.name,
                account_fame: player.accountFame,
                account_gold: player.gold,
                guild: player.guildName,
                guild_rank: parseGuildRank(player.guildRank),
                account_stars: player.stars
            });
        }
    }

    public checkTrackers(player: string): string[] | null
    {
        const statement = this.db.prepare("SELECT tracker_id FROM tracklist WHERE tracked_user = ? COLLATE NOCASE")
        const get = statement.all(player);

        if (get.length == 0) return null;

        let trackers: string[] = [];
        get.forEach((tracker: any) => {
            trackers.push(tracker.tracker_id);
        });
        return trackers;
    }

    public addTrackedPlayer(player: string, tracker: string): boolean
    {
        const statement = this.db.prepare("SELECT * from tracklist WHERE tracker_id = ? AND tracked_user = ? COLLATE NOCASE").bind(tracker, player);
        const get = statement.all();

        if (get.length == 0) {
            const insert = this.db.prepare("INSERT INTO tracklist (tracker_id, tracked_user, time_added) VALUES (@tracker_id, @tracked_user, @time_added)");

            insert.run({
                tracker_id: tracker,
                tracked_user: player,
                time_added: Date.now()
            });
            return true;
        } else { return false; }
    }

    public removeTrackedPlayer(player: string, tracker: string): boolean
    {
        const statement = this.db.prepare("SELECT * from tracklist WHERE tracker_id = ? AND tracked_user = ? COLLATE NOCASE").bind(tracker, player);
        const get = statement.all();

        if (get.length == 0) {
            return false;
        } else {
            const newStatement = this.db.prepare("DELETE FROM tracklist WHERE tracker_id = ? AND tracked_user = ?").bind(tracker, player);
            newStatement.run();

            return true;
        }
    }

    public getTracklist(tracker: string): string[]
    {
        const statement = this.db.prepare("SELECT * from tracklist WHERE tracker_id = ?").bind(tracker);
        const get = statement.all();

        if (get.length == 0) return [];

        let tracklist: string[] = [];
        get.forEach((player: any) => {
            tracklist.push(player.tracked_user);
        });

        return tracklist;
    }

    public clearTracklist(tracker: string): void
    {
        const statement = this.db.prepare("DELETE FROM tracklist WHERE tracker_id = ?").bind(tracker);
        statement.run();
    }

    public getLocation(player: string): {[v: string]: any} | null
    {
        const statement = this.db.prepare("SELECT username, time, server, location, class from player_logs WHERE username = ? COLLATE NOCASE").bind(player)
        const get = statement.get()

        if (get.length == 0) return null;

        return {
            username: get.username,
            time: get.time,
            server: get.server,
            location: get.location,
            class: get.class
        }
    }

    public getLastLocations(player: string, amount: number = 10): {[v: string]: any}[] | null
    {
        const statement = this.db.prepare("SELECT username, time, server, location, class from player_logs WHERE username = ? COLLATE NOCASE LIMIT ?").bind(player, amount);
        const get = statement.all();

        if (get.length == 0) return null;

        let locations: {[v: string]: any}[] = []

        get.forEach((loc: any) => {
            let newLoc = {
                username: get.username,
                time: get.time,
                server: get.server,
                location: get.location,
                class: get.class
            }
            locations.push(newLoc);
        });
        
        return locations;
    }

    public getGold(player: string): string | null
    {
        const statement = this.db.prepare("SELECT account_gold from players WHERE username = ? COLLATE NOCASE").bind(player);
        const get = statement.all();

        if (get.length == 0) return null;

        return get.account_gold;
    }

    public getGuildInfo(player: string): {[v: string]: any} | null
    {
        const statement = this.db.prepare("SELECT account_gold from players WHERE username = ? COLLATE NOCASE").bind(player);
        const get = statement.get();

        if (get.length == 0) return null;

        return {
            guild: get.guild,
            rank: get.guild_rank
        }
    }
}
