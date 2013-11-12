var io = require('socket.io-client'),
	socket = io.connect('http://localhost:80/'),
	parser = function (message) {
		var temp = message.toLowerCase(),
			results;
		temp = temp.split("with");
		if (temp[0]) {
			if (temp[1]) {
				results = temp[0].split(' ').slice(0, -1).join('/');
			} else {
				results = temp[0].split(' ').join('/');
			}
		}
		if (temp[1]) {
			temp = temp[1].split('and');
			temp.forEach(function (param, index) {
				results += index ? '&' : '?';
				var temp = param.split('as');
				if (temp[0]) {
					results += temp[0].trim();
				}
				if (temp[1]) {
					results += '=' + temp[1].trim();
				}
			});
		}
		return results;
	};

socket.emit("reg", {source: "server"});
socket.on('recieve', function (data) {
	var results = parser(data.message);
	console.log("Results: ", results);
	socket.emit('recieve', {to: data.userName, userName: 'NIGEL', message: results.toString()});
});