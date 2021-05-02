const express = require('express')
const messageDao = require("./infrastructure/messageDao.js")
const reactionDao = require("./infrastructure/reactionDao.js")
const voiceChannelDao = require("./infrastructure/voiceChannelDao.js")

const connection = require("./infrastructure/dbConnection.js")


const app = express();
app.use(express.json());

/*
app.get('/createReactionsTable', (req, res) => {
    let sql = 'CREATE TABLE reactions(reactionId int AUTO_INCREMENT,PRIMARY KEY(reactionId),userId VARCHAR(255),messageId VARCHAR(255),reactionType VARCHAR(255))'
    connection.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.send('Post table created')
    })
})

app.get('/createTimerMessagesTable', (req, res) => {
    let sql = 'CREATE TABLE timerMessages(id int AUTO_INCREMENT,PRIMARY KEY(id),messageId VARCHAR(255),date VARCHAR(255),time VARCHAR(255),channelId VARCHAR(255))'
    connection.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.send('Post table created')
    })
})

app.get('/createInfoTable', (req, res) => {
    let sql = 'CREATE TABLE information(id int AUTO_INCREMENT,PRIMARY KEY(id), userId VARCHAR(255), username VARCHAR(255) ,messages int NOT NULL,reactions int NOT NULL, createdEvents int NOT NULL, participatedEvents int NOT NULL,timeInVCs int NOT NULL, timeInNonStudyVCs int NOT NULL, timeInStudyVCs int NOT NULL, timeInLibrary int NOT NULL)'
    connection.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.send('Post table created')
    })
})
app.get('/dropAllTables', (req, res) => {
    
    let sql = "DROP TABLE reactions"

    connection.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.send('Table dropped')
    })
    

})

app.get('/addNewColumn', (req, res) => {
    
    let sql = "ALTER TABLE information ADD COLUMN Sabahlama INT not NULL";
    connection.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.send('Column added')
    })

})
*/

app.post('/addMessage', async (req, res) => {


    try {
        const username = req.body.username
        const userId = req.body.userId

        if (!username || !userId) {
            return res.status(500).send();
        }
        const result = await messageDao.addMessage(username,userId)
        res.status(200).send(result)
    }
    catch (e) {
        console.log(error)
        res.status(400).send(error)
    }
})

app.post('/removeMessage', async (req, res) => {


    try {
        const username = req.body.username
        const userId = req.body.userId

        if (!username || !userId) {
            return res.status(500).send();
        }
        const result = await messageDao.removeMessage(username, userId);
        res.status(200).send(result)
    }
    catch (e) {
        console.log(error)
        res.status(400).send(error)
    }
})

app.post('/addReaction', async (req, res) => {
    try {
        const username = req.body.username
        const userId = req.body.userId
        const messageId = req.body.messageId
        const reactionType = req.body.reactionType
        const isTimerMessage = req.body.isTimerMessage;

        if (!username || !userId) {
            return res.status(500).send();
        }
        const result = await reactionDao.addReaction(username,userId,messageId,reactionType,isTimerMessage)
        res.status(200).send(result)
    }
    catch (e) {
        console.log(error)
        res.status(400).send(error)
    }
})

app.post('/removeReaction', async (req, res) => {
    try {
        const username = req.body.username
        const userId = req.body.userId
        const messageId = req.body.messageId
        const reactionType = req.body.reactionType
        const isTimerMessage = req.body.isTimerMessage;

        if (!username || !userId) {
            return res.status(500).send();
        }
        const result = await reactionDao.removeReaction(username,userId,messageId,reactionType,isTimerMessage)
        res.status(200).send(result)
    }
    catch (e) {
        console.log(error)
        res.status(400).send(error)
    }
})



app.post('/addTimerMessage', async (req, res) => {

    try {
        const messageId = req.body.messageId;
        const date = req.body.date
        const time = req.body.time
        const channelId = req.body.channelId
        const userId = req.body.userId

        if (!messageId || !date || !time || !channelId || !userId) {
            return res.status(500).send();
        }
        const result = await messageDao.addTimerMessage(messageId,date,time,channelId,userId)
        res.status(200).send(result)
    }
    catch (error) {
        console.log(error)
        res.status(400).send(error)
    }

})

app.delete('/removeTimerMessage', async (req, res) => {


    try {
        const messageId = req.body.messageId;
        const isDeleted = req.body.isDeleted;
        const userId = req.body.userId;

        console.log(userId)
        if (!messageId || isDeleted == undefined || !userId) {
            return res.status(500).send();
        }

        const result = await messageDao.removeTimerMessage(messageId,userId,isDeleted)

        res.status(200).send(result)
    }
    catch (error) {
        console.log(error)
        res.status(400).send(error)
    }

})

app.get('/getTimerMessages', async (req, res) => {

    try {
        const result = await messageDao.getTimerMessages();
        res.status(200).send(result)
    }
    catch (error) {
        res.status(400).send(error)
    }

})

app.get('/getTimerMessageUserSet', async (req, res) => {
    const messageId = req.query.messageId
    try {
        const result = await messageDao.getTimerMessagesUserSet(messageId);
        res.status(200).send(result);
    }
    catch (error) {
        res.status(400).send(error)
    }

})

app.post('/voiceChannelUpdate', async (req, res) => {
    try {
        const username = req.body.username
        const userId = req.body.userId
        const type = req.body.type

        if (!username || !userId || type == undefined) {
            return res.status(500).send();
        }
        const result = await voiceChannelDao.voiceChannelUpdate(username,userId,type)
        res.status(200).send(result)
    }
    catch (e) {
        console.log(error)
        res.status(400).send(error)
    }
})

app.post('/sabahlamaUpdate', async (req, res) => {
    try {
        const idList = req.body.idList
        if (!idList) {
            return res.status(500).send();
        }
        const result = await voiceChannelDao.sabahlamaUpdate(idList)
        res.status(200).send(result)
    }
    catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Listening ' + PORT));