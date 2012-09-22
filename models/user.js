var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;

var UserSchema = Schema({
	nick	: {type:String, trim:true},
	email	: {type:String, required:true, lowercase:true,
		trim:true, index:true, unique:true},
	cellNum	: Number,
	pwdhash	: String,
	salt	: String, 
	pid		: {type:[Schema.ObjectId], ref:'Post'}
});

exports.User = mongoose.model('User', UserSchema);
