
var mongoose = require('mongoose');
var User = mongoose.model('user');
var hash = require('../pass').hash;
module.exports.Controller = function(app){
	/*
        Middleware :     
    */
	app.use(function (req, res, next) {
    	
    	var err = req.session.error,
            msg = req.session.success;
	    delete req.session.error;
    	delete req.session.success;
    	res.locals.message = '';
    	if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
    	if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
    	next();
	
	});

    /*
        Helping Functions : 
    */
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

    function requiredAuthentication(req,res,next){
        if(req.session.user)
            next();
        else{
            req.session.error = "Access Denied !!!";
            res.redirect('/Login');
        }
    }

    function UserExists(req,res,next){

        User.count({username : req.body.username},function(err,count){
            if(count == 0) 
                next;
            else{
                req.session.error = "User Exists !!!";
                req.redirect('/Signup');
            }
        });
    }

    /*
        Routes :
    */

    app.get('/',function(req,res){
        if(req.session.user)
            res.render('profile.ejs',{username : req.session.user.username});
        else{
            console.log('Console Log from index : ' + req.session.message);
            var str = req.session.message ;
            req.session.message = '';
            res.render('index.ejs',{msg:str});
        }
    });

    app.get('/Login',function(req,res){
        if(req.session.user)
            return res.redirect('/');
        else
            res.render("login.ejs");
    });

    app.get("/Signup", function (req, res) {
        
        if (req.session.user)
            return res.redirect("/");
        else 
            res.render("signup.ejs");
    });

    app.post('/Login',function(req,res){

        authenticate(req.body.username,req.body.password,function(err,user){

            if(user){
                req.session.regenerate(function(){
                    req.session.user = user;
                    req.session.success = 'Authenticated as ' + user.username +
                                          ' click to <a href="/logout">logout</a>. ' + 
                                          ' You may now access <a href="/restricted">/restricted</a>.'; 
                    console.log('SessionID  : '+ req.sessionID + '\nexpiers on : ' + new Date(Date.now()+req.session.cookie.maxAge));
                    return res.redirect('/');
                    res.next();
                });

            }
            if(err){
                req.session.error = 'Authentication failed , please check your username and password';
                req.session.message = 'Authentication failed , please check your username and password';
                console.log("Authentication failed , please check your username and password");
                return res.redirect('/');
            }
        
        });
    });

    app.post('/Signup',function(req,res){

        var username = req.body.username;
        var password = req.body.password;

        User.findOne({username:username},function(err,user){
            if(user){
                req.session.user = null;
                req.session.message = 'Username Already Exists ';
                return res.redirect('/');
                res.next();
                // call return res.next() after redirect;
            }else{
                hash(password,function(err,salt,hash){
                    if(err) {
                        console.log("Error !!!");
                        throw err;
                    }
                    var user = new User({
                        username: username,
                        salt: salt,
                        hash: hash,
                    }).save(function(err,newUser){
                        if(err)
                            throw err;
                        authenticate(newUser.username,password,function(err,user){
                            if(user){
                                req.session.regenerate(function(){
                                    req.session.user = user;
                                    req.session.success = 'Authenticated as ' + user.username 
                                                          + ' click to <a href="/logout">logout</a>. ' 
                                                          + ' You may now access <a href="/restricted">/restricted</a>.';
                                    return res.redirect('/');
                                    res.next();
                                });
                            }
                        });
                    });
                });
            }
        });
    });

    app.get('/logout',function(req,res){
        req.session.destroy(function(){
            res.redirect('/');
        });
    });

    app.get('/ChatRoom', requiredAuthentication, function (req, res) {
        
        if(req.session.user){
            res.render('chatroom.ejs',{username:req.session.user.username});
        }
        else
            res.redirect('/');
    });


}