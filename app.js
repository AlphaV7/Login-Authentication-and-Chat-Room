	
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
			resave : true,
			cookie : {maxAge : 60000000}
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

	function authenticate(name,pass,fn){

        if(!module.parent) console.log("authenticating %s %s ",name,pass);

        User.findOne({username : name},function(err,user){
            if(user){
                if(err) 
                    return fn(new Error('Cannot Find User'));
                
                hash(pass,user.salt,function(err,hash){
                    if(err) return fn(err);
                    if(hash == user.hash) return fn(null,user);
                    fn(new Error('Invalid Password'));
                });
            }else{
                return fn(new Error('Cannot Find User'));
            }
        
        });
    
    }

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

		//check user on signup
		socket.on("Existing User",function(data){
			User.findOne({username:data.username},function(err,user){
				if(err){
					console.log(err);
				}else if(user != null){
					io.to(socket.id).emit('User Validation',{val:true});
				}else{
					io.to(socket.id).emit('User Validation',{val:false});
				}
			});
		});

		//validate user on Login
		socket.on('Validate User',function(data){
			console.log('Validate User : ' + data.username);
			authenticate(data.username , data.password , function(err,user){
				if(err){
					io.to(socket.id).emit('Authentication',JSON.stringify({val:false}));
				}else if(user != null){
					io.to(socket.id).emit('Authentication',JSON.stringify({val:true}));
				}else{
					io.to(socket.id).emit('Authentication',JSON.stringify({val:false}));
				}
			});
		})
		function updateUsernames(){
			io.sockets.emit('get users',users);
		}
		
	}); 
