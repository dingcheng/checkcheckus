var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;

var ZipcodeSchema = new Schema({
	zip:		{type:String, trim:true, index: true},
	city:		String,
	state:		String,
	latlon:		{type:[Number], index:'2d'},
});

mongoose.model('Zipcode',ZipcodeSchema);