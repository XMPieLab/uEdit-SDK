var connect = require('connect');
connect().use(connect.static(__dirname)).listen(8080);
console.log('listening on port 8080');