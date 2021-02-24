require('dotenv').config();
const axios = require('axios')
const emojiUnicode = require("emoji-unicode");

const { Client } = require('discord.js');
const credentials = require('./credentials.js')
const musicDao = require('./musicDao.js')

const client = new Client({
    partials: ['MESSAGE', 'REACTION']

});
const PREFIX = "$";
var timerMap = new Map();


var API =credentials.databaseAPI;
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function mentionPeople(message) {
    await axios.get(API + "getTimerMessageUserSet", { "params": { "messageId": message.messageId } }).then(async function (result) {
        const channel = await client.channels.cache.find(channel => channel.id === message.channelId)

        console.log(result.data)
        result.data.forEach(async function (id) {
            try {
                const user = await client.users.fetch(id).catch(() => null);
                user.send("Etkinlik 5 dakika sonra başlıyor!" + "\n" + "https://discord.com/channels/" + channel.guild.id + "/" + message.channelId + "/" + message.messageId);
            }
            catch (e) {
                console.log("USER NOT FOUND !! : " + id)
            }
        })

    })
}

async function timer() {
    while (true) {

        (await client.guilds.fetch("644482131699171348")).channels.cache.filter(entry => entry.type == 'voice').forEach((entry) => {

            entry["members"].forEach((guildMember) => {

                if (entry["id"] != "657627277873512480") {
                    var type = 0;
                    if (entry["parent"]["id"] == "775400757406072892") {   //CHECK IF ITS IN STUDY CATEGORY


                        if (entry["id"] == "775420412238495766") {         //CHECK IF ITS LIBRARY VOICE CHANNEL
                            type = 2;
                        }
                        else {              //OTHER STUDY VOICE CHANNELS
                            type = 1;
                        }
                    }
                    //OTHER VOICE CHANNELS
                    var data = {
                        "username": guildMember["user"]["username"],
                        "userId": guildMember["user"]["id"],
                        "type": type
                    };

                    axios.post(API + "voiceChannelUpdate", data).then(result => {
                    }).then((response) => {
                    }, (error) => {
                        console.log(error)
                    });
                }
                
            })
        })
        Object.keys(timerMap).forEach(async function (key) {
            var timeArray = timerMap[key]["time"].split(":")
            var dateArray = timerMap[key]["date"].split("/")
            var currentTime = new Date();
            var hours = currentTime.getHours()
            var minutes = currentTime.getMinutes() + 5
            var day = currentTime.getDate()
            var month = currentTime.getMonth() + 1
            var year = currentTime.getFullYear()
            if (minutes >= 60) {
                minutes = minutes - 60
                hours += 1;
            }
            if (hours == 24) {
                day += 1
                hours = 0
            }
            hours = hours.toString()
            minutes = minutes.toString()

            if (hours.length == 1) {
                hours = "0" + hours;
            }
            if (minutes.length == 1) {
                minutes = "0" + minutes
            }
            console.log("Current Time: " + hours + ":" + minutes + " // " + day + "/" + month + "/" + year + " - Target Time: " + timeArray + " // " + dateArray)
            if (timeArray[0] == hours && timeArray[1] == minutes && dateArray[0] == day && dateArray[1] == month && dateArray[2] == year) {
                await mentionPeople(timerMap[key])

                var data = { "data": { "messageId": timerMap[key]["messageId"], "isDeleted": 0, "userId": "."}};
                await axios.delete(API + "removeTimerMessage", data).then(result => {
                })
                var newMap = new Map()
                await axios.get(API + "getTimerMessages").then(result => {
                    result.data.forEach(element => {
                        newMap[element.messageId] = element
                    });
                    timerMap = newMap;
                })

            }
        });


        await timeout(60000)
    }

}

client.on('ready', async () => {
    await axios.get(API + "getTimerMessages").then(result => {
        result.data.forEach(element => {
            timerMap[element.messageId] = element
        });
        console.log(timerMap)
    })
    timer()
    console.log(`${client.user.tag} has logged in`)
});

client.on('message', async (message) => {
    process.env.PORT
    if (message.author.bot) return;


    var data = {
        "username": message.author.username,
        "userId": message.author.id
    };

    await axios.post(API + "addMessage", data).then(result => {
    }).then((response) => {
    }, (error) => {
        console.log(error)
    });



    if (message.content.startsWith(PREFIX)) {

        console.log(message.content)
        const [CMD_NAME, ...args] = message.content.trim().substring(PREFIX.length).split(/\s+/);

        if (CMD_NAME === "help") {
            
            return message.channel.send("Possible commands:\n$etkinlik XX:YY DAY/MONTH/YEAR\n$play SONG URL or SONG NAME\n$skip\n$stop\n$queue")

        }

        else if (CMD_NAME === "etkinlik") {
            try {
                if (!args[0] || !args[1] || args[0][2] != ':' || args[0].length != 5 || args[1].length != 10 || args[1][2] != '/' || args[1][5] != '/') {
                    throw "Wrong format"
                }
                var newTimer = { "messageId": message.id, "date": args[1], "time": args[0], "channelId": message.channel.id, "userId": message.author.id };
                timerMap[message.id] = newTimer
                axios.post(API + "addTimerMessage", newTimer).then(result => {
                })
            }
            catch (e) {
                message.reply("Wrong format ($etkinlik 00:00 DAY/MONTH/YEAR)")
            }
        }
        else if (CMD_NAME == "play") {
            musicDao.execute(message);
            return;
        } else if (CMD_NAME == "skip") {
            musicDao.skip(message);
            return;
        } else if (CMD_NAME == "stop") {
            musicDao.stop(message);
            return;
        }
        else if (CMD_NAME == "queue") {
            musicDao.queue(message);
            return;
        } 
        else {
            message.channel.send("You need to enter a valid command!");
        }

    }

})

client.on('messageReactionAdd',async (reaction, user) => {

    const { name } = reaction.emoji;
    const member = reaction.message.guild.members.cache.get(user.id);

    var isTimerMessage = 0;
    if (timerMap[reaction.message.id]) {
        isTimerMessage = 1;
    }


    var data = {
        "username": user.username,
        "userId": user.id,
        "messageId": reaction.message.id,
        "reactionType": emojiUnicode(reaction.emoji.name),
        "isTimerMessage":isTimerMessage
    }

    await axios.post(API + "addReaction", data).then(result => {
    }).then((response) => {
    }, (error) => {
        console.log(error)
    });

    if (reaction.message.id == '805796617328263208') {
        switch (name) {
            case '🟢':
                member.roles.add('804792762838286407')
                break;
            case '🔴':
                member.roles.add('804791831475912795')
                break;
            case '🐖':
                member.roles.add('804793030719832094')
                break;
            case '⚪':
                member.roles.add('805627604517388288')
                break;
            case '🔵':
                member.roles.add('804791819422400563')
                break;
            case '🟡':
                member.roles.add('804797442045247518')
                break;
        }
    }

})
client.on('messageReactionRemove', async (reaction, user) => {
    const { name } = reaction.emoji;
    const member = reaction.message.guild.members.cache.get(user.id);


    var isTimerMessage = 0;
    if (timerMap[reaction.message.id]) {
        isTimerMessage = 1;
    }


    var data = {
        "username": user.username,
        "userId": user.id,
        "messageId": reaction.message.id,
        "reactionType": emojiUnicode(reaction.emoji.name),
        "isTimerMessage": isTimerMessage
    }

    await axios.post(API + "removeReaction", data).then(result => {
    }).then((response) => {
    }, (error) => {
        console.log(error)
    });

    if (reaction.message.id == '805796617328263208') {
        switch (name) {
            case '🟢':
                member.roles.remove('804792762838286407')
                break;
            case '🔴':
                member.roles.remove('804791831475912795')
                break;
            case '🐖':
                member.roles.remove('804793030719832094')
                break;
            case '⚪':
                member.roles.remove('805627604517388288')
                break;
            case '🔵':
                member.roles.remove('804791819422400563')
                break;
            case '🟡':
                member.roles.remove('804797442045247518')
                break;
        }
    }


})

client.on('messageDelete', async (message) => {

    console.log(message.author);

    var data = {
        "username": message.author.username,
        "userId": message.author.id
    };

    await axios.post(API + "removeMessage", data).then(result => {
    }).then((response) => {
    }, (error) => {
        console.log(error)
    });


    if (timerMap[message.id]) {
        var data = { "data": { "messageId": message.id, "isDeleted": 1, "userId": message.author.id} };
        
        await axios.delete(API + "removeTimerMessage", data).then(result => {
        })
        timerMap = new Map()
        await axios.get(API + "getTimerMessages").then(result => {
            result.data.forEach(element => {
                timerMap[element.messageId] = element
            });
        })

    }

})

client.login(credentials.botToken);