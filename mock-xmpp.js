var app = require('http').createServer(handler), 
	io = require('socket.io').listen(app), 
	fs = require('fs'),
	serverSocket,
	webSockets = {};

app.listen(80);

function handler (req, res) {
  fs.readFile(__dirname + req.url,
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }
    res.writeHead(200);
    res.end(data);
  });
}

io.sockets.on('connection', function (socket) {
    socket.on('reg', function (data) {
		if (data.source === "web") {
			socket.on('signin', function (data) {
				webSockets[data.userName] = socket;
				webSockets[data.userName].emit('signin', data);
			});
			socket.on('signout', function (data) {
				webSockets[data.userName].emit('signout', data);
			});
			socket.on('send', function (data) {
				webSockets[data.userName].emit('send', data);
				serverSocket.emit('recieve', data);
			});
		} else {
			serverSocket = socket;
			serverSocket.on('recieve', function (data) {
				webSockets[data.to].emit('send', data);
			});
		}	
    });
});