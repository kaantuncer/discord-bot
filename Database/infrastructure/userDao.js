const connection = require('./dbConnection');

module.exports.addNewUserToInformation = async function (data) {
    promise = await new Promise((resolve, reject) => {
        let sql = "INSERT INTO information SET ?"
        connection.query(sql, data, (err, result) => {
            if (err) reject(err)
            resolve(result);
        })
    })
    return promise;

};