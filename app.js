/**
 * Module dependencies.
 */

// Load configurations
myscope = {};
myscope.config = require('./siteconf.json');
myscope.Segment = require('node-segment').Segment;
myscope.segment = new myscope.Segment();
myscope.segment.useDefault();
myscope.bcrypt = require('bcrypt');
var passport = require('passport');
var config = myscope.config;
//config = require('./localconf.json');

// Setting up db
require('./db.js');

var express = require('express')
, routes = require('./routes')
, stpage = require('./routes/static_pages')
, p_get = require('./routes/post_get')
, p_post = require('./routes/post_post')
, u_post = require('./routes/user_post')
, u_get = require('./routes/user_get')
, http = require('http')
, path = require('path')
, gzippo = require('gzippo')
, flash = require('connect-flash');

passport.use(u_post.localstrategy);
// Passport session setup.
//	 To support persistent login sessions, Passport needs to be able to
//	 serialize users into and deserialize users out of the session.	Typically,
//	 this will be as simple as storing the user ID when serializing, and finding
//	 the user by ID when deserializing.
passport.serializeUser(function(user, done) {
	done(null, user._id);
});

passport.deserializeUser(u_post.deserializer);

var app = express();

app.configure(function(){
	app.set('port', process.env.PORT || config.port);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser('your secret here'));
	app.use(express.session());
  app.use(flash());
	app.use(passport.initialize());
	app.use(passport.session());
  app.use(u_get.user_and_msg);
	app.use(app.router);
	//app.use(function(req,res,next){console.log(req.ip,Date());next();});
	app.use(require('stylus').middleware(__dirname + '/public'));
	app.use(express.static(path.join(__dirname, 'public')));
	//app.use(gzippo.staticGzip(path.join(__dirname, 'public')));
});

app.configure('development', function(){
	app.use(express.errorHandler());
});

// Static pages
app.get('/', stpage.home);
app.get('/newpost', stpage.newpost);
app.get('/login', stpage.login);
app.get('/register',stpage.register);
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('back');
});

// Partial or information url
app.get('/valizip', p_get.valizip);
app.get('/img/:id', p_get.getimg);
app.get('/thumb/:id', p_get.getthumb);
app.get('/valemail',u_get.user_available);

// Post related GET request pages
app.get('/post/:id', p_get.viewpost);
app.get('/tag/:query', p_get.search);
app.get('/explore', p_post.search_postreq);
app.get('/activate/:id/:code', p_get.activate);
app.get('/preview/:id', p_get.viewpost);
app.get('/edit/:id/:code', p_get.editpost);
app.get('/search',p_get.search);

// Post related POST request pages
app.post('/edit/:id/:code', p_post.editpost);
app.post('/', p_post.search_postreq);
app.post('/getcontent',p_post.ajax_postreq);
app.post('/newpost',p_post.newpost_postreq);

// User related GET request pages
app.get('/user',ensureAuthenticated,u_get.user);
app.get('/user/activate/:id/:code',u_get.activate);

// User related POSt request pages
app.post('/register',u_post.newuser_postreq);
app.post('/login',passport.authenticate('local', { failureRedirect: '/login', failureFlash:true}),
	function(req, res) {
		res.redirect(req.flash('target')[0]||'/');
	});

app.use(function(req, res, next){
	res.render('err.jade', {title: "404 - Page Not Found",
		errmsg:"Welcome, but trust me, you don't need what you're looking for... Please hit BACK on your browser...",
		showFullNav: false, status: 404, url: req.url });
});


http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});


function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
  console.log(req.originalUrl);
  req.flash('target',req.originalUrl);
	res.redirect('/login');
}
