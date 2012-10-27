var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;

var UserSchema = Schema({
	email	: {type:String, required:true, lowercase:true,
		trim:true, index:true, unique:true},
	cellNum	: Number,
	pwdhash	: String,
	salt	: String,
	acti	: Boolean,
	actcode	: String
});

exports.User = mongoose.model('User', UserSchema);

UserSchema.path('email').validate(function(email){
	var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email);
}, 'Invalid email address format');