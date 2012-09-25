var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;
var Zipcode = mongoose.model('Zipcode');
var stopwords = require('./stopwords.json');
var Segment = require('node-segment').Segment;
var segment = new Segment();
segment.useDefault();


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
    date: 		{type:Date, default:Date.now},
    content:	String,
    price:      {type:Number, default:0},
    email:		{type:String, required:true, lowercase:true, trim:true},
    address:	String,
    zip:		{type:String, index:true},
    tags:		{type:[String], index:true, trim:true},
    cellnum:	Number,
    tkeys:		{type:[String], index:true, lowercase:true},
    ckeys:		{type:[String], index:true, lowercase:true},
    latlon:		{type:[Number], index:'2d'},
    user:		{type:Schema.ObjectId, ref:'User', index:true},
    hasimg:     Boolean,
    img:        {data: Buffer, ctype:String}
}, {expires: '15d'});


PostSchema.path('title').validate(function(title){
	return title.length > 0;
}, 'Post title cannot be blank');

PostSchema.path('content').validate(function(content){
	return content.length > 0;
}, 'Post content cannot be blank');

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
PostSchema.pre('save', function(next){
	this.tkeys = extractKeywords(this.title);
	next();
});

//Automatically extract keywords from content
PostSchema.pre('save', function(next){
	this.ckeys = extractKeywords(this.content);
	next();
});

//To-do
//Identify a user using email as ID, then push the new post into the user's post list
PostSchema.pre('save', function(next){

    next();
});

exports.Post = mongoose.model( 'Post', PostSchema );
