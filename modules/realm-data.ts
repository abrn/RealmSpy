import { WorldPosData } from 'nrelay';

export interface Portal {
    position: WorldPosData,
    id: number,
    name: string,
    server: string,
    players: number,
    queue: number,
    time: number,
    ip: string
}

export interface Portals {
    [server: string]: Portal[];
}

export interface Realm {
    server: string,
    realm: string,
    players: number,
    queue: number,
    ip: string
}

export interface Raid {
    location: string,
    username: string,
    time: number
}

export interface EventResponse {
    type: string,
    color: string,
    channel?: string
    name?: string,
    image?: string,
}

export interface PortalResponse {
    color: string,
    image: string,
}

export let gmNames: Array<string> = [
    "DecaUnibro","Menichko","Bukama","Fidelow","Sileeeeex","Slwkk","DecaToast","ValsinedGM",
    "*R3xD3x*","Baburajrl","AimZ","Baragon","RofiB","Dhayne","VonHamsty","FumaKotaro","Ulzimoto",
    "Fotio","AnaWaddy"
];

export let defaultNames: Array<string> = [
    "Utanu","Oalei","Eendi","Scheev","Drac","Yangu","Iri","Zhiar","Tiar","Uoro",
    "Tal","Lorz","Gharr","Eango","Iawa","Laen","Ril","Darq","Oshyu","Vorck","Oeti",
    "Issz","Queq","Saylt","Radph","Iatho","Yimi","Vorv","Rilr","Eashy","Urake","Serl","Odaru",
    "Lauk","Deyst","Eendi","Zhiar","Sek","Seus","Risrr","Idrae","Oshyu","Eati","Ehoni","Orothi"
];

export let servers: Array<string> = [
    "uswest4", "uswest3", "uswest2", "uswest", "ussouthwest", "ussouth3", "ussouth2", "ussouth",
    "usnorthwest", "usmidwest2", "usmidwest", "useast4", "useast3", "useast2", "useast",
    "euwest2", "euwest", "eusouthwest", "eusouth", "eunorth2", "eunorth", "eueast2", "eueast",
    "australia", "asiasoutheast", "asiaeast"
];

export let pubhallsStaff: Array<string> = ["aespear", "eurydice", "alohades", "mbr", "novaxlq", "sadlyfe", "bigdort", 
    "blazepig", "feetplcs", "foxloli", "pubhalldad", "quadblox", "quadpots", "xbyxbd", "adrizombie", "ajmc", "amanoo", 
    "apswindex", "bigounth", "archboby", "baconstp", "samwhich", "olnyname", "brillo", "broodman", "eichhorst", "erichuang", 
    "catalyze", "retterer", "rglking", "rhodi", "rulerzeus", "rulerjuice", "runix", "rybroo", "tarquinius", "thewar", "tomatonium", 
    "tosit", "trodaire", "tumescentx", "yohirshant", "yukisaaan", "dirtypolak", "fyrefightr", "kiklu", "juvenile", "luve", 
    "snuggling", "lesamuel", "idoi", "mmadigan", "imadabest", "immamlgpro", "istarreh", "implosionk", "captchris", "itamarlsl", 
    "oghazsa", "over", "simontroll", "sampurdy", "salcosa", "skarnrmain", "smokebreak", "sour", "spaxes", "stgyreaper", "superxduty", 
    "darkvii", "demiglands", "derpynexus", "downdraft", "fametime", "famlove", "twelfth", "hcomlogic", "jasonfuse", "lulzwtfbbq", 
    "zacksoccer", "permezan", "reyepea", "xlove", "xenruzz", "xy", "chevyo", "vasibro", "mastabayra", "ilydeca", "flebbian", 
    "hiwizardao", "itsbaryla", "jisuwu", "brockobama", "balloonpop", "dayqpi", "soareski", "sadturtl", "scrochyyyy", "hipnosis",
    "joeyhere", "zariky", "philiplayz", "zumbie", "notwhyte", "tiern", "blib", "baddestq", "court", "emisaurus", "mutza", "seawgirl", 
    "yerul", "ixenenl", "piccyp", "planprob", "protato", "chimeny", "mangokek", "deveaux", "queuing", "yurnero", "cuvbruvopl", "japani",
    "puberty", "autoknight", "notwhyte", "dymorius", "sour", "keshav", "nowadayss", "xbyxbd", "chibisora", "ixeneni"]

export let oryxSanctuaryStaff: Array<string> = ["spencer", "darkmattr", "awsomflake", "xenoskill", "blue", "crucks", 
    "consolemc", "skelits", "cebmofroz", "raginghard", "caped", "alonex", "niahoimino", "xenobwast", "reetado", "foxesrock",
    "akky", "johnnisins", "defancers", "failuure", "drsupbro", "behkoff", "aka", "wandwolf", "nanuli", "luciancrab", 
    "bgjoe", "ybysduzfdy", "sachariase", "cheesehog", "hogoq", "hogoqr", "cichlid", "oryxplmp", "thewar", "mysterygod", 
    "jobbjobb", "uwotmateyz", "billbosbag", "delphio", "wolfwizzrd", "lordthedos", "nashex", "theripers", "godlander", 
    "flamed", "apolarbear", "assasianiv", "unrest", "wookyskill", "lordsgod", "melunz", "octavianii", "xxdatbossx", "zumbie", 
    "floflorian", "terriblty", "nickonater", "jeffurry", "luke", "wolvesmyth", "story", "sappyisher", "mowplow", "theperson", 
    "skrillergg", "torniud", "deatttthhh", "phoejal", "hjjhey", "cryoteknix", "waffleswuf", "rotmglag", "matuxlt", 
    "bronzeow", "xxoxmann", "jahschwitz", "piesforlif", "landine", "bombbitto", "gvbcreeper", "vorckea", "varsverum", "vorverer", 
    "aiioy", "tilenol", "ytwimlam", "tgrobby", "critbonk", "stgyreaper", "piccyp", "supsam", "avengerkev", "kiari", "hurja", 
    "zifour", "implosionk", "ghostbloxt", "immunit", "bg", "iextinct", "anitez", "sampurdy", "saknis", "knifedenni", "bonghitsss"];

export let dungeoneerStaff: Array<string> = ["apolarbear", "dethalt", "wildguyx", "thewar", "rotmglag", "amaze", "awsomflake", "blue", 
    "darkmattr", "lordsgod", "nashex", "arkhine", "ybysduzfdy", "guidegoose", "immunit", "caped", "alpha", "behkoff", "wandwolf", "gamecloud", 
    "wolfwizzrd", "eatingfurs", "bgjoe", "xenoskill", "vorckea", "landine", "mowplow", "cryoteknix", "varsverum", "godlander", "jahschwitz", 
    "lordthedos", "niahoimino", "cushmara", "crucks", "apolarbear", "skrillergg", "xxoxmann", "consolemc", "deatttthhh", "fist", "jobbjobb", 
    "alloy", "ahsuhdude", "terriblty", "zalark", "bullbruh", "astrosickl", "allegation", "zumbie"];

export let divinityStaff: Array<string> = ["juancarloo", "memorable", "jiggylord", "daryldaryn", "izhaksrock", "biohuntera", "johnwise", 
    "shutup", "theurul", "numbaones", "anitez", "lordthedos", "daddywagon", "hunnit", "spared", "spencerhoo", "paynusnut", "lize", "vexi", 
    "bunungo", "epicymaboo", "erggin", "wyl", "strip", "tankinem", "aceaid", "fantastic", "flebbian", "legal", "penguiniii", 
    "fantastic", "flebbian", "underthebe", "disapprove", "fatock", "joseph", "yamaking", "yumx", "killerchoy", "playcool", "oec", "hotsalt",
    "dossi", "dethalt", "exploit", "vxlid", "qutiepi", "mexireeses", "grazeeeeee"];

export let sbcStaff: Array<string> = ["aw", "blessy", "maginallll", "tim", "neuro", "adan", "benjibros", "cubeee", "finnish", "dingxyxfve", 
    "drake", "magycyan", "aylith", "marvin", "moonshoot", "mrunibro", "parfait", "aqualuma", "baanana", "dannypho", "darkkitty", "fearteddy", 
    "berdlarf", "jukkii", "fazekisi", "kaboobies", "khaleeesi", "lachyv", "lollion", "maxhello", "tharms", "brett", "kablooeyy", "lbce", "mileena", 
    "miweena", "ryanzhang", "thatsjake", "sebchoof", "wounds"]

export let fungalStaff: Array<string> = ["deatttthhh", "nyyx", "waffleswuf", "caibo", "immunit", "steria", "heinsenduf", "silntsong", 
    "imasquirtl", "tarquinius", "akdipasupi", "axsolo", "melunz", "avengerkev", "torniud", "rglking", "swimdoggo", "bryceania", 
    "lightelite", "leveltwent", "pugdog", "hauntedthc", "almostto", "marinac", "demomannob", "meangirlz", "ashdargon", "brillo", 
    "dinopleb", "hippei", "moves", "orangsauce", "piesforlif", "themiddler", "triforcej", "xblazikenx", "zeladaar", "archboby", "frostydu"]

export let shattersStaff: Array<string> = ["zariky", "febelmeste", "brillo", "heisme", "nyyx", "whaleparty", "kyeopta", "mari", "clash", 
    "dlajdiuawh", "heavydk", "oofg", "someonelol", "hippei", "leveltwent", "hokieman", "connoreer", "aceaid", "hipnosis", "ooops", "rglking", 
    "slodiiiiii", "hiwizardao", "oooshie", "trigplanar", "nottrig", "kinkypink", "pinkerjoe", "discrie", "allegation", "blizzardha", "hihihs", 
    "swiftywowz", "wook", "jumpybug", "ybysduzfdy", "mag", "johndw"]

export enum serverEnum {
    usw4 = "uswest4",       usw3 = "uswest3",       usw2 = "uswest2",   usw = "uswest",
    ussw = "ussouthwest",   uss3 = "ussouth3",      uss2 = "ussouth2",  uss = "ussouth",
    usnw = "usnorthwest",   usmw2 = "usmidwest2",   usmw = "usmidwest", use4 = "useast4",
    use3 = "useast3",       use2 = "useast2",       use = "useast",     euw2 = "euwest2",
    euw = "euwest",         eusw = "eusouthwest",   eus = "eusouth",    eun2 = "eunorth2",      
    eun = "eunorth",        eue2 = "eueast2",       eue = "eueast",     aus = "australia",
    ase = "asiasoutheast",  ae = "asiaeast"
}

export function parseClass(classId: number): string {
    switch(classId)
    {
        case 768: return 'Rogue';
        case 775: return 'Archer';
        case 782: return 'Wizard';
        case 784: return 'Priest';
        case 797: return 'Warrior';
        case 798: return 'Knight';
        case 799: return 'Paladin';
        case 800: return 'Assassin';
        case 801: return 'Necromancer';
        case 802: return 'Huntress';
        case 803: return 'Mystic';
        case 804: return 'Trickster';
        case 805: return 'Sorcerer';
        case 806: return 'Ninja';
        case 785: return 'Samurai';
        case 796: return 'Bard';
        default: return 'Unknown';
    }
}

export function parseGuildRank(rank: number): string {
    switch(rank)
    {
        case 0: return 'Initiate';
        case 10: return 'Member';
        case 20: return 'Officer';
        case 30: return 'Leader';
        case 40: return 'Founder';
        default: return 'Unknown';
    }
}


export function parseServer(server: string): string {
    let newServer: string = null;
    switch (server) {
        case 'usw4': return "uswest4";
        case 'usw3': return "uswest3";
        case 'usw2': return  "uswest2";
        case 'usw': return "uswest";
        case 'ussw': return "ussouthwest";
        case 'uss3': return "ussouth3";
        case 'uss2': return "ussouth2";
        case 'uss': return "ussouth";
        case 'usnw': return "usnorthwest";
        case 'usmw2': return "usmidwest2";
        case 'usmw': return "usmidwest";
        case 'use4': return "useast4";
        case 'use3': return "useast3";
        case 'use2': return "useast2";
        case 'use': return "useast";
        case 'euw2': return "euwest2";
        case 'euw': return "euwest";  
        case 'eusw': return "eusouthwest";    
        case 'eus': return "eusouth";
        case 'eun2': return "eunorth2";
        case 'eun': return "eunorth"; 
        case 'eue2': return "eueast2";     
        case 'eue': return "eueast";       
        case 'aus': return "australia";
        case 'ase': return "asiasoutheast";
        case 'ae': return "asiaeast"
    }
}

export function parseDiscordServer(name: string): {name: string, channel: string} {
    switch(name)
        {
            case 'divinty': return {
                name: 'Divinity',
                channel: '756476045422624831'
            };
            case 'dungeoneer': return {
                name: 'Dungeoneer',
                channel: '756476065601421393'
            };
            case 'sanctuary': return {
                name: 'Oryx Sanctuary',
                channel: '756476095582306336'
            };
            case 'pubhalls': return {
                name: 'Pub Halls',
                channel: '756475912115060766'
            };
            case 'shatters': return {
                name: 'Shatters',
                channel: '756475933615063131'
            };
            case 'fungal': return {
                name: 'Fungal Cavern',
                channel: '756476159637717003'
            };
            case 'sbc': return {
                name: 'SBC',
                channel: '756475956545454151'
            };
        }
}

export function parseRealmChat(message: string): EventResponse {
    // CLOSED REALM
    if (message.includes('I HAVE CLOSED THIS REALM! YOU WILL NOT LIVE TO SEE THE LIGHT OF DAY!'))
    {
        return {
            type: 'closed',
            color: '',
            image: ''
        }
    }

    // LAST LICH
    if (message.includes('My final Lich shall consume your souls!') || message.includes('My final Lich will protect me forever!')) 
    {
        return {
            type: 'event',
            channel: '725694278059294770',
            color: '',
            name: 'Last Lich',
            image: ''
        }
    }

    // CUBE GOD
    if (message.includes('Your meager abilities cannot possibly challenge a Cube God!'))
    {
        return {
            type: 'event',
            channel: '725695914764927055',
            color: '',
            name: 'Cube God',
            image: ''
        }
    }

    // SKULL SHRINE
    if (message.includes('Your futile efforts are no match for a Skull Shrine!'))
    {
        return {
            type: 'event',
            channel: '725695899384414238',
            color: '',
            name: 'Skull Shrine',
            image: ''
        }
    }

    // KEYPER
    if (message.includes('Hands off those crystals! I need them to scrounge up more keys!') || message.includes('Wha- Again? REALLY?!'))
    {
        return {
            type: 'event',
            channel: '725695262458249229',
            color: '',
            name: 'The Keyper',
            image: ''
        }
    }
    if (message.includes('Ah, there we go! Let’s see those lowlifes try to take down my crystals this time!'))
    {
        return {
            type: 'event',
            channel: '725695262458249229',
            color: '',
            name: 'Keyper Crystals',
            image: ''
        }
    }

    // ALIENS
    if (message.includes('A possible ally from far away has arrived to eradicate you vexatious brutes!') || 
        message.includes('Invaders in my realm?! Perhaps these could serve as fresh minions!'))
    {
        return {
            type: 'event',
            channel: '725696239147941908',
            color: '',
            name: 'Aliens',
            image: ''
        }
    }

    // LOST SENTRY
    if (message.includes('What is this? A subject has broken free from those wretched halls!') || 
        message.includes('That lowly Paladin has escaped the Lost Halls with a vessel!') || 
        message.includes('The catacombs have been unearthed?! What depraved souls have survived so long?'))
    {
        return {
            type: 'event',
            channel: '725696198060539944',
            color: '',
            name: 'Lost Sentry',
            image: ''
        }
    }

    // LORD OF THE LOST LANDS
    if (message.includes('Cower in fear of my Lord of the Lost Lands!') || message.includes('My Lord of the Lost Lands will make short work of you!'))
    {
        return {
            type: 'event',
            channel: '725695788390285332',
            color: '',
            name: 'Lord of the Lost Lands',
            image: ''
        }
    }

    // GRAND SPHINX
    if (message.includes('At last, a Grand Sphinx will teach you to respect!'))
    {
        return {
            type: 'event',
            channel: '725695828718649405',
            color: '',
            name: 'Grand Sphinx',
            image: ''
        }
    }

    // HERMIT GOD
    if (message.includes('My Hermit God\'s thousand tentacles shall drag you to a watery grave!'))
    {
        return {
            type: 'event',
            channel: '725695855247753236',
            color: '',
            name: 'Hermit God',
            image: ''
        }
    }

    // GHOST SHIP
    if (message.includes('A Ghost Ship has entered the Realm.') || message.includes('My Ghost Ship will terrorize you pathetic peasants!'))
    {
        return {
            type: 'event',
            channel: '725695953918754928',
            color: '',
            name: 'Ghost Ship',
            image: ''
        }
    }

    // BEE NEST
    if (message.includes('The Killer Queen Bee has made her nest in the realm!') || 
        message.includes('Beehold the Killer Bee Nest! Not even the sturdiest armor or most powerful healing spell will save you now!') ||
        message.includes('My horde of insects will easily obliterate you lowbrow pests!') || 
        message.includes('You obtuse half-wits stand no chance against the Killer Bee Queen and her children!'))
    {
        return {
            type: 'event',
            channel: '725745014193389629',
            color: '',
            name: 'Killer Bee Nest',
            image: ''
        }
    }

    // AVATAR
    if (message.includes('The Shatters has been discovered!?!') || message.includes('The Forgotten King has raised his Avatar!'))
    {
        return {
            type: 'event',
            channel: '725696003516137483',
            color: '',
            name: 'Avatar of the Forgotten King',
            image: ''
        }
    }

    // PENTARACT
    if (message.includes('Behold my Pentaract, and despair!'))
    {
        return {
            type: 'event',
            channel: '725696069375361096',
            color: '',
            name: 'Pentaract',
            image: ''
        }
    }

    // BEACH BUM
    if (message.includes('An elusive Beach Bum is hiding somewhere in the Realm.') || message.includes('What is this lazy Beach Bum doing in my Realm?!'))
    {
        return {
            type: 'event',
            channel: '736224533949710367',
            color: '',
            name: 'Beach Bum',
            image: ''
        }
    }
}

export function getPortalData(dungeon: string): PortalResponse {
    switch (dungeon)
    {
        case 'Pirate Cave':
            return {
                color: "#734722",
                image: "https://static.drips.pw/rotmg/wiki/Environment/Portals/Pirate%20Cave%20Portal.png",
            }
        case 'Forest Maze':
            return {
                color: "#497000",
                image: "https://static.drips.pw/rotmg/wiki/Environment/Portals/Forest%20Maze%20Portal.png",
            }
        case 'Spider Den':
            return {
                color: "#571300",
                image: "https://static.drips.pw/rotmg/wiki/Environment/Portals/Spider%20Den%20Portal.png",
            }
        case 'Snake Pit':
            return {
                color: "#1AAF44",
                image: "https://i.imgur.com/yDsmuGa.gif",
            }
        case 'Forbidden Jungle':
            return {
                color: "#9E9E9E",
                image: "https://static.drips.pw/rotmg/wiki/Environment/Portals/Forbidden%20Jungle%20Portal.png",
            }
        case 'The Hive':
            return {
                color: "#F3BB3A",
                image: "https://static.drips.pw/rotmg/wiki/Environment/Portals/The%20Hive%20Portal.png",
            }
        case 'Magic Woods':
            return {
                color: "#895929",
                image: "https://i.imgur.com/mvUTUNo.png",
            }
        case 'Sprite World':
            return {
                color: "#959595",
                image: "https://static.drips.pw/rotmg/wiki/Environment/Portals/Glowing%20Portal.png",
            }
        case 'Candyland Hunting Grounds':
            return {
                color: "#EF6363",
                image: "https://static.drips.pw/rotmg/wiki/Environment/Portals/Candyland%20Portal.png",
            }
        case 'Cave of a Thousand Treasures':
            return {
                color: "#74381B",
                image: "https://static.drips.pw/rotmg/wiki/Environment/Portals/Treasure%20Cave%20Portal.png",
            }
        case 'Undead Lair':
            return {
                color: "#737373",
                image: "https://i.imgur.com/gQ5QqQr.gif",
            }
        case 'Abyss of Demons':
            return {
                color: "#B50915",
                image: "https://static.drips.pw/rotmg/wiki/Environment/Portals/Abyss%20of%20Demons%20Portal.png",
            }
        case 'Manor of the Immortals':
            return {
                color: "#84618E",
                image: "https://static.drips.pw/rotmg/wiki/Environment/Portals/Manor%20of%20the%20Immortals%20Portal.png",
            }
        case 'Puppet Master\'s Theatre':
            return {
                color: "#760000",
                image: "https://i.imgur.com/2JZNslO.png",
            }
        case 'Toxic Sewers':
            return {
                color: "#59695C",
                image: "https://static.drips.pw/rotmg/wiki/Environment/Portals/Toxic%20Sewers%20Portal.png",
            }
        case 'Cursed Library':
            return {
                color: "#363843",
                image: "https://i.imgur.com/0M9yA5f.gif",
            }
        case 'Haunted Cemetery':
            return {
                color: "#279366",
                image: "https://i.imgur.com/WtTKp9k.gif",
            }
        case 'The Machine':
            return {
                color: "#22B672",
                image: "https://i.imgur.com/0PyfYHr.png",
            }
        case 'Mad Lab':
            return {
                color: "#32307B",
                image: "https://i.imgur.com/Bv01fV9.gif",
            }
        case 'Parasite Chambers':
            return {
                color: "#3A3A4C",
                image: "https://i.imgur.com/hcRb6kp.gif",
            }
        case 'Beachzone':
            return {
                color: "#F4A32E",
                image: "https://static.drips.pw/rotmg/wiki/Environment/Portals/Beachzone%20Portal.png",
            }
        case 'Davy Jones\' Locker':
            return {
                color: "#2E2E5E",
                image: "https://i.imgur.com/DSPoWQP.gif",
            }
        case 'Mountain Temple':
            return {
                color: "#681E14",
                image: "https://i.imgur.com/SY0Jtnp.png",
            }
        case 'Lair of Draconis':
            return {
                color: "#EDD900",
                image: "https://static.drips.pw/rotmg/wiki/Environment/Portals/Consolation%20of%20Draconis%20Portal.png",
            }
        case 'Deadwater Docks':
            return {
                color: "#734722",
                image: "https://i.imgur.com/ipvUwng.png",
            }
        case 'Woodland Labyrinth':
            return {
                color: "#527707",
                image: "https://i.imgur.com/2SV1B4n.png",
            }
        case 'The Crawling Depths':
            return {
                color: "#511B1B",
                image: "https://i.imgur.com/5uU3jvb.png",
            }
        case 'Ocean Trench':
            return {
                color: "#7CAFD6",
                image: "https://static.drips.pw/rotmg/wiki/Environment/Portals/Ocean%20Trench%20Portal.png",
            }
        case 'Ice Cave':
            return {
                color: "#0088E9",
                image: "https://static.drips.pw/rotmg/wiki/Environment/Portals/Ice%20Cave%20Portal.png",
            }
        case 'Tomb of the Ancients':
            return {
                color: "#F7D46B",
                image: "https://static.drips.pw/rotmg/wiki/Environment/Portals/Tomb%20of%20the%20Ancients%20Portal.png",
            }
        case 'Fungal Cavern':
            return {
                color: "#7488AD",
                image: "https://i.imgur.com/CLzxdEM.png",
            }
        case 'Crystal Cavern':
            return {
                color: "#E2E5FE",
                image: "https://i.imgur.com/BHwk26f.png",
            }
        case 'The Nest':
            return {
                color: "#FF9B18",
                image: "https://i.imgur.com/WQ95Y0j.png",
            }
        case 'The Shatters':
            return {
                color: "#767676",
                image: "https://static.drips.pw/rotmg/wiki/Environment/Portals/The%20Shatters.png",
            }
        case 'Lost Halls':
            return {
                color: "#D9E2E2",
                image: "https://i.imgur.com/uhDj0M5.png",
            }
        case 'Lair of Shaitan':
            return {
                color: "#F65E00",
                image: "https://static.drips.pw/rotmg/wiki/Environment/Portals/Lair%20of%20Shaitan%20Portal.png",
            }
        case 'Puppet Master\'s Encore':
            return {
                color: "#5D0809",
                image: "https://static.drips.pw/rotmg/wiki/Environment/Portals/Puppet%20Encore%20Portal.png",
            }
        case 'Cnidarian Reef':
            return {
                color: "#FFBC7A",
                image: "https://i.imgur.com/qjd04By.png",
            }
        case 'Secluded Thicket':
            return {
                color: "#463D6A",
                image: "https://i.imgur.com/8vEAT8t.png",
            }
        case 'Heroic Undead Lair':
            return {
                color: "#FFC519",
                image: "https://i.imgur.com/SVqmTWH.gif",
            }
        case 'Heroic Abyss of Demons':
            return {
                color: "#FFC519",
                image: "https://i.imgur.com/zz6D2lz.png",
            }
        case 'Battle for the Nexus':
            return {
                color: "#EDD558",
                image: "https://static.drips.pw/rotmg/wiki/Environment/Portals/Battle%20Nexus%20Portal.png",
            }
        case 'Belladonna\'s Garden':
            return {
                color: "#1F991F",
                image: "https://i.imgur.com/VTXGPSy.png",
            }
        case 'Ice Tomb':
            return {
                color: "#C9FCF2",
                image: "https://static.drips.pw/rotmg/wiki/Environment/Portals/Ice%20Tomb%20Portal.png",
            }
        case 'Santa\'s Workshop':
            return {
                color: "#683800",
                image: "https://i.imgur.com/z7EMGP1.gif",
            }
        case 'Mad God Mayhem':
            return {
                color: "#4D4D4D",
                image: "https://i.imgur.com/jnHUonE.gif",
            }
        case 'Forax':
            return {
                color: "#2DA14C",
                image: "https://i.imgur.com/UUpIie4.gif",
            }
        case 'Katalund':
            return {
                color: "#CFA900",
                image: "https://i.imgur.com/ZznbfNe.gif",
            }
        case 'Malogia':
            return {
                color: "#963C48",
                image: "https://i.imgur.com/mDsZ0gq.gif",
            }
        case 'Untaris':
            return {
                color: "#4C68BA",
                image: "https://i.imgur.com/9mHv0hw.gif",
            }
        case 'Ancient Ruins':
            return {
                color: "#A69660",
                image: "https://i.imgur.com/d7MSK2x.png"
            }
        default:
            return {
                color: "#734722",
                image: "https://static.drips.pw/rotmg/wiki/Environment/Portals/Pirate%20Cave%20Portal.png",
            }
    }
}
