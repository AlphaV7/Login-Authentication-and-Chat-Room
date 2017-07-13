var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var UserSchema = new Schema({
	username:String,
	password:String,
	salt:String,
	hash:String
});

mongoose.model('user',UserSchema);