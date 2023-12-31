/* CONFIG */
var SSLPORT = 8080; //Default 443
var HTTPPORT = process.env.PORT || 3000; //Default 80 (Only used to redirect to SSL port)
var privateKeyPath = "./cert/key.pem"; //Default "./cert/key.pem"
var certificatePath = "./cert/cert.pem"; //Default "./cert/cert.pem"

/* END CONFIG */

var fs = require('fs');
var express = require('express');
var https = require('https');
var app = express();
var http = require('http');

app.use(express.static(__dirname + '/webcontent'));

var privateKey = fs.readFileSync( privateKeyPath );
var certificate = fs.readFileSync( certificatePath );

var server = http.createServer(app).listen(HTTPPORT);

var io  = require('socket.io').listen(server, { log: false });
console.log("Webserver & Socketserver running on port: "+HTTPPORT);

//Handel connections
io.sockets.on('connection', function (socket) {
	console.log("New user connected:", socket.id);
	io.emit('clients', io.engine.clientsCount);

	socket.on('disconnect', function () {
		console.log("User disconnected:", socket.id);
		socket.broadcast.emit('clients', io.engine.clientsCount);
	});

	socket.on('d', function (data) {
		data["sid"] = socket.id;
		//console.log(data["a"]);
		socket.broadcast.emit('d', data); //Send to all but the sender
		//io.emit("d", data); //Send to all clients (4 debugging)
	});
});