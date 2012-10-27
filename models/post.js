var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;
var Zipcode = mongoose.model('Zipcode');
var stopwords = require('./stopwords.json');
var segment = myscope.segment;


function extractKeywords(text){
	if (!text) return [];
	var segObj = segment.doSegment(text).filter(function(v){return v.p!=2048;});
	var segArr=[];
	segObj.forEach(function(v){segArr.push(v.w.toLowerCase());})
	return segArr.
		filter(function(v) {return stopwords.indexOf(v) === -1; }).
		filter(function(v, i, a) { return a.lastIndexOf(v) === i; });
}

// Defining post schema
var PostSchema = new Schema({
	title:		{type:String, required:true},
	date:		{type:Date, default:Date.now},
	content:	String,
	price:		{type:Number, default:0},
	email:		{type:String, required:true, lowercase:true, trim:true},
	address:	String,
	zip:		{type:String, index:true},
	tags:		{type:[String], index:true, trim:true},
	cellnum:	Number,
	tkeys:		{type:[String], index:true, lowercase:true},
	ckeys:		{type:[String], index:true, lowercase:true},
	latlon:		{type:[Number], index:'2d'},
	user:		{type:Schema.ObjectId, ref:'User', index:true},
	hasimg:		Boolean,
	hasthumb:	Boolean,
	thumb:		{data:Buffer, h:Number,ctype:String},
	img:		{data:Buffer, h:Number,ctype:String},
	acti:		Boolean,
	actcode:	String
}, {expires: '15d'});

//Validate title
PostSchema.path('title').validate(function(title){
	return title.length > 0;
}, 'Post title cannot be blank');
//Validate email address
PostSchema.path('email').validate(function(email){
	var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email);
}, 'Invalid email address format');

PostSchema.pre('save', function(next){
	var thisholder = this;
	Zipcode.findOne({zip:this.zip},'latlon',function(err,zipItem){
		if(!err&&zipItem){
			thisholder.latlon = zipItem.latlon;
		}
		next();
	});
	
});

//Automatically extract keywords from title
//Automatically extract keywords from content
PostSchema.pre('save', function(next){
	this.tkeys = extractKeywords(this.title);
	this.ckeys = extractKeywords(this.content);
	next();
});

exports.Post = mongoose.model( 'Post', PostSchema );
