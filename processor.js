var io = require('socket.io-client'),
	socket = io.connect('http://localhost:80/'),
	http = require('http'),
	nigelUrl = "http://localhost:3000/",
	parser = function (message) {
		var temp = message.toLowerCase(),
			results;
		temp = temp.split("with");
		if (temp[0]) {
			if (temp[1]) {
				results = temp[0].split(' ').slice(0, -1).join('/');
			} else {
                results =
                    temp[0]
                        .replace("who ", "")
                        .replace("what ", "")
                        .replace("the ", "")
                        .replace("a ", "")
                        .replace("an ", "")
                        .replace("is ", "")
                        .replace("on ", "")
                        .replace(/[^a-zA-Z0-9-\s]+/g, "") // Replace any non word character with nothing
                        .split(' ');
                if (temp[0].indexOf("who") === 0) {
                    // Reverse the order of the arguments so
                    // ie.  Who broke the build?
                    results = results.reverse();
                }
                results = results.join('/');
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
	socket.emit('recieve', {to: data.userName, userName: 'NIGEL', message: "Executing..." });
		// TODO: Use nigel sockets when available
	http.get(nigelUrl + results.toString() + "?format=plain", function(res) {
	  	res.on('data', function (chunk) {
	  		var message = "Invalid instruction";
	     	if (('' + res.statusCode).match(/^[23]\d\d$/)) {
     			message = "\n" + chunk;
	 		}
			socket.emit('recieve', {to: data.userName, userName: 'NIGEL', message: message });
		});
	}).on('error', function(e) {
		socket.emit('recieve', {to: data.userName, userName: 'NIGEL', message: "Invalid instruction"});
	});
});