
const credentials = require("./credentials.js")
const btoa = require("btoa")
const fetch = require("node-fetch")

const ytdl = require("ytdl-core");

const YouTube = require("simple-youtube-api");
const youtube = new YouTube(credentials.youtubeAPI);

var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi();

const queue = new Map();

const _getSpotifyToken = async () => {
    const result = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(credentials.spotifyClientId + ':' + credentials.spotifyClientSecret)
        },
        body: 'grant_type=client_credentials'
    });

    const data = await result.json();
    return data.access_token;
}

function play(guild, song) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }

    const dispatcher = serverQueue.connection
        .play(ytdl(song.url))
        .on("finish", () => {
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]);
        })
        .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`Start playing: **${song.title}**`);
}

async function startPlaying(queueContruct, voiceChannel, message) {
    try {
        var connection = await voiceChannel.join();
        queueContruct.connection = connection;
        play(message.guild, queueContruct.songs[0]);
    } catch (err) {
        console.log(err);
        queue.delete(message.guild.id);
        return message.channel.send(err);
    }
}

async function addPlaylist(list, serverQueue, message, voiceChannel) {
    if (!serverQueue) {
        const queueContruct = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true
        };
        queue.set(message.guild.id, queueContruct);
        let started = false;
        for (i = 0; i < list.length; i++) {
            try {
                const searchedVideo = await youtube.searchVideos(list[i])
                songInfo = await ytdl.getInfo(searchedVideo[0].id);
                const song = {
                    title: songInfo.videoDetails.title,
                    url: songInfo.videoDetails.video_url,
                };
                queueContruct.songs.push(song);
                if (!started) {
                    await startPlaying(queueContruct, voiceChannel, message)
                    started = true;
                }
            }
            catch (e) {
                console.log(list[i])
            }
        }
    } else {
        for (i = 0; i < list.length; i++) {
            const searchedVideo = await youtube.searchVideos(list[i])
            songInfo = await ytdl.getInfo(searchedVideo.id);
            const song = {
                title: songInfo.videoDetails.title,
                url: songInfo.videoDetails.video_url,
            };
            queueContruct.songs.push(song);
        }
        return message.channel.send(`Playlist added to the queue`);
    }

}

module.exports.execute = async function (message) {
    const serverQueue = queue.get(message.guild.id);
    const args = message.content.split(" ");

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
        return message.channel.send(
            "You need to be in a voice channel to play music!"
        );
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return message.channel.send(
            "I need the permissions to join and speak in your voice channel!"
        );
    }
    var songInfo;
    if (args[1].startsWith("https://www.youtube")) {
        songInfo = await ytdl.getInfo(args[1]);
    }
    else if (args[1].startsWith("https://open.spotify.com/playlist/")) {
        let spotifyToken = await _getSpotifyToken();
        spotifyApi.setAccessToken(spotifyToken);

        let slicedString = args[1].slice(34);
        slicedString = slicedString.split("?")[0];
        var result = await spotifyApi.getPlaylistTracks(slicedString);
        let list = [];
        result.body.items.forEach((element) => {
            list.push(element.track.name + " " + element.track.artists[0].name);
        })
        console.log(list)
        await addPlaylist(list, serverQueue, message, voiceChannel);
        return;
    }
    else if (args[1].startsWith("https://open.spotify.com/track/")) {
        let spotifyToken = await _getSpotifyToken();
        spotifyApi.setAccessToken(spotifyToken);
        
        let slicedString = args[1].slice(31);
        slicedString = slicedString.split("?")[0];
        var result = await spotifyApi.getTrack(slicedString);
        const searchedVideo = await youtube.searchVideos(result.body.name + " " + result.body.artists[0].name)
        songInfo = await ytdl.getInfo(searchedVideo[0].id);
    }
    else {
        let entireName = "";
        for (i = 1; i < args.length; i++) {
            entireName += args[i] + " ";
        }
        const searchedVideo = await youtube.searchVideos(entireName)
        songInfo = await ytdl.getInfo(searchedVideo[0].id);
    }
    const song = {
        title: songInfo.videoDetails.title,
        url: songInfo.videoDetails.video_url,
    };

    if (!serverQueue) {
        const queueContruct = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true
        };
        queue.set(message.guild.id, queueContruct);
        queueContruct.songs.push(song);
        startPlaying(queueContruct, voiceChannel, message);
    } else {
        serverQueue.songs.push(song);
        return message.channel.send(`${song.title} has been added to the queue!`);
    }
}

module.exports.skip = function (message) {
    const serverQueue = queue.get(message.guild.id);
    if (!message.member.voice.channel)
        return message.channel.send(
            "You have to be in a voice channel to stop the music!"
        );
    if (!serverQueue)
        return message.channel.send("There is no song that I could skip!");
    serverQueue.connection.dispatcher.end();
}

module.exports.stop = function (message) {
    const serverQueue = queue.get(message.guild.id);
    if (!message.member.voice.channel)
        return message.channel.send(
            "You have to be in a voice channel to stop the music!"
        );

    if (!serverQueue)
        return message.channel.send("There is no song that I could stop!");

    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
}

module.exports.queue = function (message) {

    const serverQueue = queue.get(message.guild.id);
    if (!message.member.voice.channel)
        return message.channel.send("You have to be in the voice channel to see the queue")
    if (!serverQueue)
        return message.channel.send("There are no songs in the queue");

    var queueStr = "Queue:\n";


    for (i = 0; i < serverQueue.songs.length; i++) {
        queueStr += serverQueue.songs[i]["title"] + "\n"
    }
    return message.channel.send(queueStr)

}
