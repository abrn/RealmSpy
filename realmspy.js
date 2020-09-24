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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const nrelay_1 = require("nrelay");
const player_tracker_1 = require("nrelay/lib/stdlib/player-tracker");
const RealmData = __importStar(require("./modules/realm-data"));
// discord bot requirements
const discord_1 = require("./modules/discord");
let RealmSpy = class RealmSpy {
    constructor(playerTracker, runtime, external) {
        this.bot = new discord_1.DiscordBot();
        this.external = new discord_1.External();
        this.portals = {};
        this.currentServer = {};
        this.portalID = {};
        this.onPortal = {};
        this.portalTicks = {};
        this.ongoingRaids = {};
        this.ongoingRaids['pubhalls'] = [];
        this.ongoingRaids['divinity'] = [];
        this.ongoingRaids['dungeoneer'] = [];
        this.ongoingRaids['sanctuary'] = [];
        this.ongoingRaids['sbc'] = [];
        this.runtime = runtime;
        playerTracker.on('enter', (player) => {
            if (!player.name)
                return;
            // track invalid names
            let alphaRegex = /^[A-z]+$/g;
            if (!player.name.match(alphaRegex)) {
                this.bot.callInvalidName(player.name, player.accountId, player.server);
                return;
            }
            // add a new last known location and check if any notifications are to be sent
            external.addLocation(player.name, player.server, 'nexus');
            external.getTrackers(player.name, (trackers) => {
                if (trackers.length > 0) {
                    trackers.forEach((tracker) => {
                        this.bot.callPlayer(player.name, tracker);
                    });
                }
            });
            // log player gold
            external.logGold(player.name, player.gold);
            // track big ballers
            if (player.currentFame > 25000) {
                this.bot.callBaller(player.name, player.server, player.currentFame);
            }
            // track rich players
            if (player.gold > 20000) {
                this.bot.callRichPlayer(player.name, player.gold);
            }
            // track game managers
            if (RealmData.gmNames.includes(player.name) || player.guildName == "DecaGMs") {
                // exclude mreyeball as he spams the channel
                if (player.name !== "MrEyeball") {
                    this.bot.callGameManager(player.name, player.server);
                }
            }
        });
        playerTracker.on('leave', (player) => {
            let bazaar = '';
            let realm = '';
            let px = player.worldPos.x;
            let py = player.worldPos.y;
            //Logger.log('RealmSpy', `Player ${player.name} left at X: ${player.worldPos.x} Y: ${player.worldPos.y}`, LogLevel.Warning);
            if (py < 168 && py > 160) {
                if (px < 88 && px > 83)
                    bazaar = 'left';
                if (px < 128 && px > 123)
                    bazaar = 'right';
            }
            let lowerCaseName = player.name.toLowerCase();
            if (bazaar != '' && !RealmData.defaultNames.includes(player.name)) {
                if (RealmData.pubhallsStaff.includes(lowerCaseName)) {
                    this.addRaidLocation('pubhalls', player.name, `${player.server} ${bazaar} bazaar`);
                }
                external.addLocation(player.name, player.server, bazaar);
            }
        });
    }
    onMapInfo(client, mapPacket) {
        if (client.canEnterRealm() && mapPacket.name == "Nexus") {
            setTimeout(() => {
                if (!client.worldPos) {
                    client.connectToServer({ name: "Nexus", address: client.server.address });
                    return;
                }
                else {
                    client.findPath(new nrelay_1.WorldPosData(106, 130));
                }
                setTimeout(() => {
                    if (!this.currentServer[client.guid]) {
                        this.currentServer[client.guid] = client.server.name;
                    }
                    let serverLower = this.currentServer[client.guid].toLowerCase();
                    if (!this.portals[serverLower] || this.portals[serverLower].length == 0) {
                        client.connectToServer({ name: "Nexus", address: client.server.address });
                        return;
                    }
                    let randomPortals = this.shuffle(this.portals[serverLower]);
                    let nextPortal = randomPortals[0];
                    client.findPath(nextPortal.position);
                    setTimeout(() => {
                        this.portalID[client.guid] = nextPortal.id;
                        this.onPortal[client.guid] = true;
                        this.portals[serverLower].splice(0);
                    }, 10000);
                }, 30000);
            }, 5000);
        }
        else if (mapPacket.name == "Realm of the Mad God") {
            let ip = client.server.address;
            let realm = mapPacket.realmName.substring(12);
            this.onPortal[client.guid] = false;
            this.external.addPortalIP(this.currentServer[client.guid], realm, ip);
            setTimeout(() => {
                let escape = new nrelay_1.EscapePacket();
                client.io.send(escape);
            }, 10000);
        }
    }
    onText(client, textPacket) {
        if (client.mapInfo.name === "Nexus") {
            if (client.canEnterRealm()) {
            }
            else {
                if (textPacket.text.startsWith('{"key":"server.dungeon_opened_by"')) {
                    var keypop = JSON.parse(textPacket.text);
                    this.bot.callKey(keypop.tokens.dungeon, client.server.name, keypop.tokens.name);
                }
            }
        }
    }
    onNewTick(client, newTicket) {
        if (this.onPortal[client.guid]) {
            if (!this.portalTicks[client.guid]) {
                this.portalTicks[client.guid] = 0;
            }
            this.portalTicks[client.guid] = this.portalTicks[client.guid] + 1;
            if (this.portalTicks[client.guid] >= 2500) {
                nrelay_1.Logger.log('RealmInfo', `Client in ${this.currentServer[client.guid]} was stuck on empty portal.. nexusing`);
                client.connectToServer({ name: "Nexus", address: client.server.address });
            }
        }
        else {
            this.portalTicks[client.guid] = 0;
        }
    }
    onUpdate(client, updatePacket) {
        return __awaiter(this, void 0, void 0, function* () {
            if (client.canEnterRealm()) {
                if (this.onPortal[client.guid]) {
                    let packet = new nrelay_1.UsePortalPacket();
                    packet.objectId = this.portalID[client.guid];
                    client.io.send(packet);
                }
                updatePacket.newObjects.forEach(newObj => {
                    if (newObj.objectType == 1810) {
                        newObj.status.stats.forEach(data => {
                            if (data.stringStatValue !== "") {
                                const pattern = new RegExp('(\\w+)\\s\\((\\d+)(?:\\/\\d+\\)\\s\\(\\+(\\d+))?');
                                let matches = data.stringStatValue.match(pattern);
                                let server = (!this.currentServer[client.guid]) ? client.server.name : this.currentServer[client.guid];
                                let serverLower = server.toLowerCase();
                                let newPortal = {
                                    position: newObj.status.pos,
                                    id: newObj.status.objectId,
                                    name: matches[1],
                                    server: server,
                                    players: parseInt(matches[2]),
                                    queue: (matches[3]) ? parseInt(matches[3]) : 0,
                                    time: Date.now(),
                                    ip: null
                                };
                                this.external.addPortalInfo(serverLower, matches[1].toLowerCase(), newPortal);
                                if (!this.portals[serverLower]) {
                                    this.portals[serverLower] = [];
                                }
                                this.portals[serverLower].push(newPortal);
                                //Logger.log('Pathfinder', `Found new portal: ${server} ${newPortal.name} with ${newPortal.players}/85 players.. Queue: ${newPortal.queue}, Object ID: ${newPortal.id}`, LogLevel.Warning);
                            }
                        });
                    }
                });
            }
        });
    }
    addRaidLocation(server, username, location) {
        let newTime = Date.now();
        let newRaid = {
            username: username,
            location: location,
            time: newTime
        };
        this.ongoingRaids[server].push(newRaid);
        let currentRaids = this.ongoingRaids[server];
        setTimeout(() => {
            for (let i = 0; i <= currentRaids.length; i++) {
                let raid = currentRaids[i];
                let timeSince = Math.floor((newTime - currentRaids[i].time) / 1000);
                if (timeSince >= 300) {
                    this.ongoingRaids[server].splice(i, 1);
                    continue;
                }
                let matches = currentRaids.filter(x => x.location == raid.location);
                if (matches && matches.length > 1) {
                    // to be completed
                }
            }
        }, 300000);
    }
    getFlooredPos(client) {
        const clientPos = new nrelay_1.WorldPosData(Math.floor(client.worldPos.x), Math.floor(client.worldPos.y));
        return clientPos;
    }
    sleep(time) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }
    shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }
};
__decorate([
    nrelay_1.PacketHook(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [nrelay_1.Client, nrelay_1.MapInfoPacket]),
    __metadata("design:returntype", void 0)
], RealmSpy.prototype, "onMapInfo", null);
__decorate([
    nrelay_1.PacketHook(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [nrelay_1.Client, nrelay_1.TextPacket]),
    __metadata("design:returntype", void 0)
], RealmSpy.prototype, "onText", null);
__decorate([
    nrelay_1.PacketHook(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [nrelay_1.Client, nrelay_1.NewTickPacket]),
    __metadata("design:returntype", void 0)
], RealmSpy.prototype, "onNewTick", null);
__decorate([
    nrelay_1.PacketHook(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [nrelay_1.Client, nrelay_1.UpdatePacket]),
    __metadata("design:returntype", Promise)
], RealmSpy.prototype, "onUpdate", null);
RealmSpy = __decorate([
    nrelay_1.Library({
        name: 'RealmSpy plugin',
        author: 'him#1337',
        enabled: false
    }),
    __metadata("design:paramtypes", [player_tracker_1.PlayerTracker, nrelay_1.Runtime, discord_1.External])
], RealmSpy);
