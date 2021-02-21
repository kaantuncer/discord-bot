const mysql = require('mysql')

//Create connection

module.exports = mysql.createPool({
    host: 'HOST',
    user: 'USER',
    password: 'PASSWORD',
    database: 'DATABASE'
});
