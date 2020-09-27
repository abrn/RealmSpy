# RealmSpy

This is a plugin written for the nrelay bot framework for the game Realm of the Mad God. It will track when players enter/leave nexuses or bazaars. It will notify key pops in every nexus plus high player gold and fame. You can add it to a Discord server as a bot to accept commands.


## Installation

**Requirements:**  

* nodejs 12.x or above
* [nrelay](https://github.com/thomas-crane/nrelay)
* redis

**nodejs libraries:**  

* discord.js
* bufferutil
* moment
* redis

### Instructions:

1. Create a new nrelay project via the CLI
1. Copy and paste the `realmspy.js` file and `modules` folder into the nrelay `/lib` folder
1. Add your Discord bot token inside `modules/discord-config.json`
1. Modify the channel IDs inside `modules/discord.js` to match your Discord server
1. Add accounts to the nrelay `accounts.json` file (enough to cover every nexus) then run it with `nrelay run`

### 24/7 uptime

To run the bot 24/7, install the nodejs PM2 module via `npm install -g pm2`

Then inside the project folder, do `nrelay eject`

This will create an index.js file which you can then start with PM2 via `pm2 start index.js`

### Redis

Expose the redis server to localhost only and start the server. No further setup is required except I would recommend persisting the database, otherwise your player location logs and tracklists can get wiped.



---

For help message me on discord at `him#1337`
