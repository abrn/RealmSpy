import { 
  Client, Library, Logger, LogLevel, Runtime,
  PacketHook, TextPacket, UpdatePacket, 
  UsePortalPacket, WorldPosData, MapInfoPacket, NewTickPacket, EscapePacket, LoadPacket, PlayerTextPacket, PlayerData
} from 'nrelay';

import { PlayerTracker } from 'nrelay/lib/stdlib/player-tracker';
import * as RealmData from './modules/realm-data';

// discord bot requirements
import { DiscordBot, External } from './modules/discord';
import { Database } from './modules/database';

@Library({
  name: 'RealmSpy plugin',
  author: 'him#1337',
  enabled: true
})

class RealmSpy {
  private runtime: Runtime;
  private bot = new DiscordBot();
  private external = new External();
  private portals: RealmData.Portals;
  //private database: Database;

  onPortal: {
    [guid: string]: boolean
  };
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

  /**
   * Called when a client changes area (i.e enters a realm or loads into nexus)
   * 
   * @param client the client that received the packet
   * @param mapPacket the details of the MapInfo packet
   */
  /* @PacketHook()
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
  } */


  /* @PacketHook()
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
  } */


  /**
   *  Called when a text packet is received by a client - used to track key pops or event notifications
   * 
   * @param client the client that received the packet
   * @param textPacket the data from the text packet
   */
  @PacketHook()
  onText(client: Client, textPacket: TextPacket): void 
  {
    if (client.mapInfo.name === "Nexus") {
      if (textPacket.text.startsWith('{"key":"server.dungeon_opened_by"')) {
        var keypop = JSON.parse(textPacket.text);
          
        this.bot.callKey(keypop.tokens.dungeon, client.server.name, keypop.tokens.name);
      }
    }
  }


  /**
   *  The constructor object - waits for all player tracking events
   * 
   * @param playerTracker the player tracker module
   * @param runtime the current account runtime
   * @param external the databse interface
   */
  constructor(playerTracker: PlayerTracker, runtime: Runtime, external: External) 
  {
    this.portals = {};
    this.currentServer = {};
    this.onPortal = {};
    this.ongoingRaids = {};

    this.ongoingRaids['pubhalls'] = [];
    this.ongoingRaids['divinity'] = [];
    this.ongoingRaids['dungeoneer'] = [];
    this.ongoingRaids['sanctuary'] = [];
    this.ongoingRaids['sbc'] = [];

    //this.database = new Database();
    this.runtime = runtime;

    // event emitted when a player enters the nexus
    playerTracker.on('enter', (player) => 
    {
      //track null names
      if (!player.name || player.name == "") {
        this.bot.callNullName(player);
        return;
      }
      
      // track invalid names
      let alphaRegex = /^[A-z]+$/g;
      if (!player.name.match(alphaRegex)) {
        this.bot.callInvalidName(player.name, player.accountId, player.server)
        return;
      }

      // track name changes
      //external.checkNameChange(player.accountId, player.name, (result) => {
        //if (result !== null) {
          //this.bot.callNameChange(result, player.name);
        //}
      //})

      // add a new last known location
      external.addLocation(player.name, player.server, 'nexus');

      //this.database.insertLocation(player, 'nexus');
      //this.database.addPlayer(player);

      // check if anyone is tracking the player
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
        this.bot.callBaller(player.name, player.server, player.currentFame, player.class);
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

    // event emitted when a player leaves the nexus
    playerTracker.on('leave' , (player) => 
    {
      // exclude null or None accounts because they cause errors
      if (!player.name || player.name == "") return;

      if (RealmData.defaultNames.includes(player.name)) return;

      if (!player.accountId == undefined && player.accountId !== "") {
        this.external.checkNameChange(player.accountId, player.name, (result) => {
          if (result == null) return;
          this.bot.callNameChange(result, player.name);
        })
      }

      let area: string = '';
      let px: number = player.worldPos.x;
      let py: number = player.worldPos.y;

      //Logger.log('RealmSpy', `Player ${player.name} left at X: ${player.worldPos.x} Y: ${player.worldPos.y}`, LogLevel.Warning);
      
      // check if the player left near bazaar portals
      if (py < 142 && py > 137) {
        if (px < 117 && px > 110) area = 'left';
        if (px < 157 && px > 152) area = 'right';
      }
      // check if the player entered vault or guild hall
      if (py < 144 && py > 140) {
        if (px < 140 && px > 136) area = 'vault'
        if (px < 133 && px > 129) area = 'ghall'
      }
      // check if the player entered a realm
      if (py > 102 && py < 116) {
        if (px < 145 && px > 123) {
          area = 'realm'
        }
      }

      if (area != '') {
        // get the lowercase name to make it easier to search arrays
        let lowerCaseName = player.name.toLowerCase();

        // add the players last known location
        external.addLocation(player.name, player.server, area);
        
        if (area !== 'vault' && area !== 'ghall') {
          this.callDiscordStaff(player, area);
        }

        //this.database.insertLocation(player, area);

        // send a notification for any tracking players
        external.getTrackers(player.name, (trackers) => {
          if (trackers.length > 0) {
            trackers.forEach((tracker) => {
              this.bot.callPlayer(player.name, tracker);
            });
          }
        });
      }
    });
  }

  public callDiscordStaff(player: PlayerData, location: string): void
  {
    let lowerCaseName = player.name.toLowerCase();

    if (RealmData.sbcStaff.includes(lowerCaseName)) {
      this.bot.callStaffLocation('sbc', player.name, player.server, location);
    }

    if (location == 'left' || location == 'right') {
      if (RealmData.pubhallsStaff.includes(lowerCaseName)) {
        //this.addRaidLocation('pubhalls', player.name, `${player.server} ${bazaar} bazaar`)
        this.bot.callStaffLocation('pubhalls', player.name, player.server, location);
      }
      if (RealmData.fungalStaff.includes(lowerCaseName)) {
        this.bot.callStaffLocation('fungal', player.name, player.server, location);
      }
      if (RealmData.shattersStaff.includes(lowerCaseName)) {
        this.bot.callStaffLocation('shatters', player.name, player.server, location);
      }
    }
    if (location == 'realm') {
      if (RealmData.divinityStaff.includes(lowerCaseName)) {
        this.bot.callStaffLocation('divinty', player.name, player.server, location);
      }
      if (RealmData.oryxSanctuaryStaff.includes(lowerCaseName)) {
        this.bot.callStaffLocation('sanctuary', player.name, player.server, location);
      }
      if (RealmData.dungeoneerStaff.includes(lowerCaseName)) {
        this.bot.callStaffLocation('dungeoneer', player.name, player.server, location);
      }
    }
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
}
