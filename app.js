	
	var express = require('express');
	var	app = express();
    var	http = require('http');
    var server = http.createServer(app);
    var	path = require('path');
    var	mongoose = require('mongoose');
    var	hash = require('./pass').hash;
    var	fs = require('fs');
    var	io = require('socket.io').listen(server);

    users = [];
    connections = [];

	var bodyparser = require('body-parser'),
		mongoose = require('mongoose'),
		db = mongoose.connect("mongodb://localhost:27017/DB");

	app.use(bodyparser.urlencoded( { extended:true }));
	app.use(express.cookieParser('Authentication Tutorial '));
	app.use(bodyparser.json());
	app.use(express.static(path.join(__dirname, 'public')));
	app.use(express.session({
			secret : 'Authentication Tutorial ' ,
			saveUninitialized: true ,
			resave : true
	}));
	app.set('views', __dirname + '/views');
	app.use('view engine','ejs');


	fs.readdirSync('./Model').forEach(function(file){
		if(~file.indexOf('.js'))
			require('./Model/' + file);
	});

	fs.readdirSync('./Controller').forEach(function(file){
		if(file.substr(-3) == '.js'){
			var route = require('./Controller/' + file);
			route.Controller(app);
		}
	});

	mongoose.connection.once('open',function(){

		console.log("Connection Successful");

	});

	var User = mongoose.model('user');

	server.listen(8080);
	console.log("Server successfully started on port 8080");

	io.sockets.on('connection',function(socket){
		connections.push(socket);
		console.log('Connected : %s sockets connected ',connections.length);
		
		//Disconnect
		socket.on("disconnect", function(){
			
			users.splice(users.indexOf(socket.username),1);
			updateUsernames();
			connections.splice(connections.indexOf(socket),1);
			console.log('Disconnected : %s sockets connected ',connections.length);		
		});

		//Send Message
		socket.on('new message',function(data){
			console.log('new message: ' + data);
			io.sockets.emit('chat message' , {msg: data});
		});

		//New User Connected
		socket.on('new user',function(data){
			console.log(data);
			socket.username = data;
			users.push(socket.username);
			updateUsernames();
		});

		function updateUsernames(){
			io.sockets.emit('get users',users);
		}
		
	}); 
