const connection = require('./dbConnection');

const addNewUserToInformation =require("./userDao").addNewUserToInformation

module.exports.addReaction = async function (username, userId, messageId, reactionType , isTimerMessage) {
    
    promise = await new Promise((resolve, reject) => {
        let sql = "UPDATE information SET reactions = reactions + 1 , username = ? WHERE userId = ?"
        let condition = [username, userId]

        connection.query(sql, condition, async (err, result) => {
            if (err) reject(err)
            if (result["affectedRows"] == 0) {
                result = await addNewUserToInformation({
                    "userId": userId,
                    "username": username,
                    "reactions": 1
                });
            }
            resolve(result);
        })
    })

    if (isTimerMessage == 1) {

        promise = await new Promise((resolve, reject) => {
            let sql = "INSERT INTO reactions SET ?"
            let data = {
                userId: userId,
                messageId: messageId,
                reactionType: reactionType
            }

            connection.query(sql, data, (err, result) => {
                if (err) reject(err)
                resolve(result);
            })
        })

    }


    return promise;
}

module.exports.removeReaction = async function (username, userId, messageId, reactionType, isTimerMessage) {
    promise = await new Promise((resolve, reject) => {
        let sql = "UPDATE information SET reactions = reactions - 1 , username = ? WHERE userId = ?"
        let condition = [username, userId]

        connection.query(sql, condition, async (err, result) => {
            if (err) reject(err)
            if (result["affectedRows"] == 0) {
                result = await addNewUserToInformation({
                    "userId": userId,
                    "username": username,
                    "reactions": 0
                });
            }
            resolve(result);
        })
    })
    if (isTimerMessage == 1) {
        promise = new Promise((resolve, reject) => {
            let sql = "DELETE FROM reactions WHERE userId = ? and messageId = ? and reactionType = ?"
            let condition = [userId, messageId, reactionType]

            connection.query(sql, condition, (err, result) => {
                if (err) reject(err)
                resolve(result);
            })
        })
    }
    return promise;
}