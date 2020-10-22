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
Object.defineProperty(exports, "__esModule", { value: true });
const nrelay_1 = require("nrelay");
const player_tracker_1 = require("nrelay/lib/stdlib/player-tracker");
const RealmData = __importStar(require("./modules/realm-data"));
/**
 * Import the Discord bot functions
 * Import the Redis database functions
 */
const discord_1 = require("./modules/discord");
let RealmSpy = class RealmSpy {
    /**
     * The constructor object - waits for all player tracking events
     *
     * @param playerTracker the player tracker module
     * @param runtime the current account runtime
     * @param external the databse interface
     */
    constructor(playerTracker, runtime, external) {
        this.bot = new discord_1.DiscordBot();
        this.external = new discord_1.External();
        this.alphaRegex = /^[A-z]+$/g;
        this.runtime = runtime;
        this.startPlayerTracker(playerTracker);
    }
    //private database = new Database();
    /**
     * Called when a text packet is received by a client
     * Used to track key pops or event notifications
     *
     * @param client the client that received the packet
     * @param textPacket the data from the text packet
     */
    onText(client, textPacket) {
        if (client.mapInfo.name === "Nexus") {
            if (textPacket.text.startsWith('{"key":"server.dungeon_opened_by"')) {
                var keypop = JSON.parse(textPacket.text);
                this.bot.callKey(keypop.tokens.dungeon, client.server.name, keypop.tokens.name);
            }
        }
    }
    /**
     * Start hooking events when players join and leave the nexus
     *
     * @param tracker the PlayerTracker module
     */
    startPlayerTracker(tracker) {
        tracker.on('enter', (player) => {
            /**
             * Check if the player's username is unset or null and send a notification
             */
            if (!player.name || player.name == "") {
                this.bot.callNullName(player);
                return;
            }
            /**
             * Check if the player's username is invalid (non-alphanumeric) and send a notification
             */
            if (!player.name.match(this.alphaRegex)) {
                this.bot.callInvalidName(player);
                return;
            }
            this.external.addLocation(player.name, player.server, "nexus");
            /**
              * Return a list of discord users tracking the player and send a notification with the area
              */
            this.external.getTrackers(player.name, (trackers) => {
                if (trackers.length > 0) {
                    trackers.forEach((tracker) => {
                        this.bot.callPlayer(player.name, tracker);
                    });
                }
            });
            /**
             * Check if the player's gold increased since the last time they were spotted
             */
            this.external.checkGold(player, (playerData, oldGold) => {
                if (playerData !== null) {
                    this.bot.callGoldPurchase(playerData, oldGold);
                }
            });
            /**
             * Check if the player has high char fame and send a notification
             */
            if (player.currentFame > 30000) {
                this.bot.callBaller(player);
            }
            /**
             * Check if the player gold is high and send a notification
             */
            if (player.gold > 20000) {
                this.bot.callRichPlayer(player.name, player.gold);
            }
            /**
             * Check if the player is in the DecaGMs guild
             * Exclude MrEyeball as he spams the channel
             */
            if (RealmData.gmNames.includes(player.name) ||
                player.guildName == "DecaGMs") {
                if (player.name !== "MrEyeball") {
                    this.bot.callGameManager(player);
                }
            }
        });
        /**
         * Called when a player leaves the nexus
         *
         * @param player the player's PlayerData
         */
        tracker.on('leave', (player) => {
            /*
            * Fixes a weird bug where the players username gets unset and StatData can't be parsed
            */
            if (!player.name || player.name == "")
                return;
            /* Don't send notifications for default name accounts */
            if (!player.nameChosen)
                return;
            /**
             * Check the players previous username by accountId
             * If there's a username difference, call a username change
             */
            this.external.checkNameChange(player.accountId, player.name, (result) => {
                if (result !== null) {
                    this.bot.callNameChange(result, player);
                }
            });
            /**
             * Parse the location the player left the nexus
             */
            let area = this.getPlayerArea(player);
            if (!area) {
                let lowerCaseName = player.name.toLowerCase();
                this.external.addLocation(player.name, player.server, area);
                /**
                 * If the player entered a realm or bazaar, check discord staff lists
                 */
                if (area !== "vault" && area !== "ghall") {
                    this.callDiscordStaff(player, area);
                }
                /**
                 * Return a list of discord users tracking the player and send a notification with the area
                 */
                this.external.getTrackers(player.name, (trackers) => {
                    if (trackers.length > 0) {
                        trackers.forEach((tracker) => {
                            this.bot.callPlayer(player.name, tracker);
                        });
                    }
                });
                // TODO: FIX CALLBACK HELL!
            }
        });
    }
    /**
     * Get the area where the player left the nexus based on their X,Y coordinates
     *
     * @param player the PlayerData
     */
    getPlayerArea(player) {
        let area = "";
        let px = player.worldPos.x;
        let py = player.worldPos.y;
        /**
         * Return a portal name based on player leave WorldPos
         */
        if (py < 142 && py > 137) {
            if (px < 117 && px > 110)
                area = "left";
            if (px < 157 && px > 152)
                area = "right";
        }
        if (py < 144 && py > 140) {
            if (px < 140 && px > 136)
                area = "vault";
            if (px < 133 && px > 129)
                area = "ghall";
        }
        if (py > 102 && py < 116) {
            if (px < 145 && px > 123)
                area = "realm";
        }
        if (area == '')
            return null;
        return area;
    }
    /**
     * If a discord staff member enters a realm or a bazaar, send a message in the
     * appropriate channel
     *
     * @param player the PlayerData
     * @param location the location i.e 'left' 'right' 'realm'
     */
    callDiscordStaff(player, location) {
        let lowerCaseName = player.name.toLowerCase();
        /**
         * Only check staff members who start raids in cloth bazaars
         */
        if (location == "left" || location == "right") {
            if (RealmData.pubhallsStaff.includes(lowerCaseName)) {
                this.bot.callStaffLocation("pubhalls", player.name, player.server, location);
            }
            if (RealmData.fungalStaff.includes(lowerCaseName)) {
                this.bot.callStaffLocation("fungal", player.name, player.server, location);
            }
            if (RealmData.shattersStaff.includes(lowerCaseName)) {
                this.bot.callStaffLocation("shatters", player.name, player.server, location);
            }
        }
        /**
         * Only check staff members who start Oryx 3 raids
         */
        if (location == "realm") {
            if (RealmData.divinityStaff.includes(lowerCaseName)) {
                this.bot.callStaffLocation("divinty", player.name, player.server, location);
            }
            if (RealmData.oryxSanctuaryStaff.includes(lowerCaseName)) {
                this.bot.callStaffLocation("sanctuary", player.name, player.server, location);
            }
            if (RealmData.dungeoneerStaff.includes(lowerCaseName)) {
                this.bot.callStaffLocation("dungeoneer", player.name, player.server, location);
            }
        }
        /**
         * Except SBC as they do clot bazaar and Oryx 3 runs
         */
        if (RealmData.sbcStaff.includes(lowerCaseName)) {
            this.bot.callStaffLocation("sbc", player.name, player.server, location);
        }
    }
};
__decorate([
    nrelay_1.PacketHook(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [nrelay_1.Client, nrelay_1.TextPacket]),
    __metadata("design:returntype", void 0)
], RealmSpy.prototype, "onText", null);
RealmSpy = __decorate([
    nrelay_1.Library({
        name: "RealmSpy plugin",
        author: "him#1337",
        enabled: true,
    }),
    __metadata("design:paramtypes", [player_tracker_1.PlayerTracker,
        nrelay_1.Runtime,
        discord_1.External])
], RealmSpy);
