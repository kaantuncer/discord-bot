
const mysql = require('mysql')
var connection = mysql.createPool({
    host: 'us-cdbr-east-03.cleardb.com',
    user: 'baa4c0c59237fb',
    password: '1f1c9bb7',
    database: 'heroku_5e27a2abf2d075c'
});



let messageId = "123"

let sql = "SELECT userId FROM reactions WHERE messageId = ?"
let conditions  = [messageId]

connection.query(sql,conditions, (err, result) => {
    if (err) reject(err)

    let userSet = new Set()
    result.forEach(element => {
        userSet.add(element.userId)
    });
    console.log(userSet);
})