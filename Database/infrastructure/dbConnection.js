const mysql = require('mysql')

//Create connection

module.exports = mysql.createPool({
    host: 'us-cdbr-east-03.cleardb.com',
    user: 'baa4c0c59237fb',
    password: '1f1c9bb7',
    database: 'heroku_5e27a2abf2d075c'
});
