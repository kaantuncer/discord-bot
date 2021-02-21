const connection = require('./dbConnection');

const addNewUserToInformation = require("./userDao").addNewUserToInformation


module.exports.addMessage = async function (username,userId) {
    promise = await new Promise((resolve, reject) => {
        let sql = "UPDATE information SET messages = messages + 1 , username = ? WHERE userId = ?"
        let condition = [username, userId]

        connection.query(sql, condition, async (err, result) => {
            if (err) reject(err)
            if (result["affectedRows"] == 0) {
                result = await addNewUserToInformation({
                    "userId": userId,
                    "username": username,
                    "messages": 1
                });
            }
            resolve(result);
        })
    })
    return promise;
}

module.exports.removeMessage = async function (username,userId) {
    promise = await new Promise((resolve, reject) => {
        let sql = "UPDATE information SET messages = messages - 1 , username = ? WHERE userId = ?"
        let condition = [username, userId]

        connection.query(sql, condition, async (err, result) => {
            if (err) reject(err)
            if (result["affectedRows"] == 0) {
                result = await addNewUserToInformation({
                    "userId": userId,
                    "username": username,
                    "messages": 0
                });
            }
            resolve(result);
        })
    })
    return promise;
}

module.exports.addTimerMessage = async function (messageId, date, time, channelId, userId) {

    promise = await new Promise((resolve, reject) => {
        let sql = "INSERT INTO timerMessages SET ?"
        let data = {
            messageId: messageId,
            date: date,
            time: time,
            channelId: channelId
        }
        connection.query(sql, data, (err, result) => {
            if (err) reject(err)
            resolve(result);
        })
    })

    promise = await new Promise((resolve, reject) => {
        let sql = "UPDATE information SET createdEvents = createdEvents + 1 WHERE userId = ?"
        let condition = [userId]

        connection.query(sql, condition, async (err, result) => {
            if (err) reject(err)
            if (result["affectedRows"] == 0) {
                result = await addNewUserToInformation({
                    "userId": userId,
                    "createdEvents": 1
                });
            }
            resolve(result);
        })
    })

    return promise
}


module.exports.removeTimerMessage = async function (messageId, userId, isDeleted) {

    promise = await new Promise((resolve, reject) => {
        
        let sql = "DELETE tm , r FROM timermessages as tm INNER JOIN reactions as r ON tm.messageId = r.messageId WHERE tm.messageId = ? "
        let condition = [messageId]

        connection.query(sql, condition, (err, result) => {
            if (err) reject(err)
            resolve(result);
        })

    })
    if (isDeleted == 1) {
        await new Promise((resolve, reject) => {
            let sql = "UPDATE information SET createdEvents = createdEvents - 1 WHERE userId = ?"
            let condition = [userId]

            connection.query(sql, condition, async (err, result) => {
                if (err) reject(err)
                if (result["affectedRows"] == 0) {
                    result = await addNewUserToInformation({
                        "userId": userId,
                        "createdEvents": 0
                    });
                }
                resolve(result);
            })
        })
    }
    return promise;
}

module.exports.getTimerMessages = async function () {
    
    promise = await new Promise((resolve, reject) => {
        let sql = "SELECT * FROM timermessages"

        connection.query(sql, (err, result) => {
            if (err) reject(err)
            resolve(result);
        })
    })

    return promise;
}

module.exports.getTimerMessagesUserSet = async function (messageId) {
    
    promise = await new Promise((resolve, reject) => {
        let sql = "SELECT userId FROM reactions WHERE messageId = ?"
        let conditions = [messageId]

         connection.query(sql, conditions, (err, result) => {
            if (err) reject(err)

            let userSet = new Set()
            result.forEach(element => {
                userSet.add(element.userId)
            });
            let array = Array.from(userSet);
            console.log(array)
            console.log("promise done")
            resolve(array)
        })
    })

    var array = promise;
    console.log("after promise")
    console.log(array);
    //res.status(200).send(promise)  //THIS USE TO BE HERE
    //console.log(promise)
    for (var i = 0; i < array.length; i++) {
        var userId = array[i];

        await new Promise((resolve, reject) => {
            let sql = "UPDATE information SET participatedEvents = participatedEvents + 1 WHERE userId = ?"
            let condition = [userId]

            connection.query(sql, condition, async (err, result) => {
                if (err) reject(err)
                if (result["affectedRows"] == 0) {
                    result = await addNewUserToInformation({
                        "userId": userId,
                        "participatedEvents": 1
                    });
                }
                resolve(result);
            })
        })
    }
    return array;
}

