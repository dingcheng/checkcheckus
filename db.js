var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;

// register Zipcode schema
require('./models/zipcode.js');
// register Post schema
require('./models/post.js');
// register User schema
require('./models/user.js');
 
mongoose.connect( 'mongodb://localhost/buflist' );