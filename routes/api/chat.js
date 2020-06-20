const io = require('socket.io')();
var auth = require('../auth');


io.use(auth.required)
.on('connection',function(socket) {
    
})