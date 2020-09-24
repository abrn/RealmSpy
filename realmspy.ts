import { 
  Client, Library, Logger, LogLevel, Runtime,
  PacketHook, TextPacket, UpdatePacket, 
  UsePortalPacket, WorldPosData, MapInfoPacket, NewTickPacket, EscapePacket, LoadPacket, PlayerTextPacket
} from 'nrelay';

import { PlayerTracker } from 'nrelay/lib/stdlib/player-tracker';
import * as RealmData from './modules/realm-data';

// discord bot requirements
import { DiscordBot, External } from './modules/discord';
import { time } from 'console';

@Library({
  name: 'RealmSpy plugin',
  author: 'him#1337',
  enabled: false
})

class RealmSpy {
  private runtime: Runtime;
  private bot = new DiscordBot();
  private external = new External();
  private portals: RealmData.Portals;

  onPortal: {
    [guid: string]: boolean
  };
  portalID: {
    [guid: string]: number
  };
  portalTicks: {
    [guid: string]: number
  }
  currentServer: {
    [guid: string]: string
  };
  serverName: {
    [guid: string]: string
  };
  ongoingRaids: {
    [server: string]: RealmData.Raid[];
  }
  currentIP: string;
  currentPortal: number;

  @PacketHook()
  onMapInfo(client: Client, mapPacket: MapInfoPacket): void
  {
    if (client.canEnterRealm() && mapPacket.name == "Nexus") {
      setTimeout(() => {
        if (!client.worldPos) {
          client.connectToServer({name:"Nexus",address:client.server.address});
          return;
        } else {
          client.findPath(new WorldPosData(106, 130));
        }

        setTimeout(() => {
          if (!this.currentServer[client.guid]) {
            this.currentServer[client.guid] = client.server.name;
          }
          let serverLower = this.currentServer[client.guid].toLowerCase();

          if (!this.portals[serverLower] || this.portals[serverLower].length == 0) {
            client.connectToServer({name:"Nexus",address:client.server.address});
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
    } else if (mapPacket.name == "Realm of the Mad God") {
      let ip = client.server.address;
      let realm = mapPacket.realmName.substring(12);
      this.onPortal[client.guid] = false;

      this.external.addPortalIP(this.currentServer[client.guid], realm, ip);
      
      setTimeout(() => {
        let escape = new EscapePacket();
        client.io.send(escape);
      }, 10000);
    }
  }
  
  @PacketHook()
  onText(client: Client, textPacket: TextPacket): void 
  {
    if (client.mapInfo.name === "Nexus") {
      if (client.canEnterRealm()) {

      } else {
        if (textPacket.text.startsWith('{"key":"server.dungeon_opened_by"')) {
          var keypop = JSON.parse(textPacket.text);
          
          this.bot.callKey(keypop.tokens.dungeon, client.server.name, keypop.tokens.name);
        }
      }
    }
  }

  @PacketHook()
  onNewTick(client: Client, newTicket: NewTickPacket): void {
    if (this.onPortal[client.guid]) {
      if (!this.portalTicks[client.guid]) {
        this.portalTicks[client.guid] = 0;
      }

      this.portalTicks[client.guid] = this.portalTicks[client.guid] + 1;

      if (this.portalTicks[client.guid] >= 2500) {
        Logger.log('RealmInfo', `Client in ${this.currentServer[client.guid]} was stuck on empty portal.. nexusing`);

        client.connectToServer({name: "Nexus",address: client.server.address});
      }
    } else {
      this.portalTicks[client.guid] = 0;
    }
  }

  @PacketHook()
  async onUpdate(client: Client, updatePacket: UpdatePacket): Promise<void> 
  {
    if (client.canEnterRealm()) {

      if (this.onPortal[client.guid]) {
        let packet = new UsePortalPacket();
        packet.objectId = this.portalID[client.guid];

        client.io.send(packet);
      }

      updatePacket.newObjects.forEach(newObj => 
      {
        if (newObj.objectType == 1810) {
          newObj.status.stats.forEach(data => 
          {
            if (data.stringStatValue !== "") {
              const pattern = new RegExp('(\\w+)\\s\\((\\d+)(?:\\/\\d+\\)\\s\\(\\+(\\d+))?');
              let matches = data.stringStatValue.match(pattern);

              let server = (!this.currentServer[client.guid]) ? client.server.name : this.currentServer[client.guid]
              let serverLower = server.toLowerCase();

              let newPortal: RealmData.Portal = {
                position: newObj.status.pos,
                id: newObj.status.objectId,
                name: matches[1],
                server: server,
                players: parseInt(matches[2]),
                queue: (matches[3]) ? parseInt(matches[3]) : 0,
                time: Date.now(),
                ip: null
              }
              
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
  }

  constructor(playerTracker: PlayerTracker, runtime: Runtime, external: External) 
  {
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

    playerTracker.on('enter', (player) => 
    {
      if (!player.name) return;

      // track invalid names
      let alphaRegex = /^[A-z]+$/g;
      if (!player.name.match(alphaRegex)) {
        this.bot.callInvalidName(player.name, player.accountId, player.server)
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

    playerTracker.on('leave' , (player) => 
    {
      let bazaar: string = '';
      let realm: string = '';
      let px: number = player.worldPos.x;
      let py: number = player.worldPos.y;

      //Logger.log('RealmSpy', `Player ${player.name} left at X: ${player.worldPos.x} Y: ${player.worldPos.y}`, LogLevel.Warning);
      
      if (py < 168 && py > 160) {
        if (px < 88 && px > 83) bazaar = 'left';
        if (px < 128 && px > 123) bazaar = 'right';
      }

      let lowerCaseName = player.name.toLowerCase();

      if (bazaar != '' && !RealmData.defaultNames.includes(player.name)) {

        if (RealmData.pubhallsStaff.includes(lowerCaseName)) {
          this.addRaidLocation('pubhalls', player.name, `${player.server} ${bazaar} bazaar`)
        }

        external.addLocation(player.name, player.server, bazaar)
      }
    });
  }

  public addRaidLocation(server: string, username: string, location: string): void {
    let newTime = Date.now();
    let newRaid = {
      username: username,
      location: location,
      time: newTime
    }
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

  public getFlooredPos(client: Client): WorldPosData {
    const clientPos = new WorldPosData(
      Math.floor(client.worldPos.x),
      Math.floor(client.worldPos.y)
    );

    return clientPos;
  }

  public sleep(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  public shuffle(a: any) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
}
