const connection = require('./dbConnection');

const addNewUserToInformation = require("./userDao").addNewUserToInformation

module.exports.voiceChannelUpdate = async function (username,userId,type) {
    promise = await new Promise((resolve, reject) => {

        let sql = ""
        if (type == 0) {
            sql = "UPDATE information SET timeInVCs = timeInVCs + 1 ,timeInNonStudyVCs = timeInNonStudyVCs + 1 , username = ? WHERE userId = ?"
        }
        else if (type == 1) {
            sql = "UPDATE information SET timeInVCs = timeInVCs + 1 , timeInStudyVCs = timeInStudyVCs + 1 , username = ? WHERE userId = ?"
        }
        else {
            sql = "UPDATE information SET timeInVCs = timeInVCs + 1 , timeInLibrary = timeInLibrary + 1 , username = ? WHERE userId = ?"
        }
        let condition = [username, userId]

        connection.query(sql, condition, async (err, result) => {
            if (err) reject(err)
            if (result["affectedRows"] == 0) {
                result = await addNewUserToInformation({
                    "userId": userId,
                    "username": username,
                });
            }
            resolve(result);
        })
    })
    return promise;
}