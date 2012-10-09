
/**
 * Module dependencies.
 */

// Load configurations
config = require('./siteconf.json');

// Setting up db
require('./db.js');

var express = require('express')
  , routes = require('./routes')
  , stpage = require('./routes/static_pages')
  , p_get = require('./routes/post_get')
  , p_post = require('./routes/post_post')
  , http = require('http')
  , path = require('path');

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
  app.use(app.router);
  app.use(function(req,res,next){console.log(req.ip,Date());next();});
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', stpage.home);
app.get('/newpost', stpage.newpost);

app.get('/post/:id', p_get.viewpost);
app.get('/valizip', p_get.valizip);
app.get('/getimg/:id', p_get.getimg);
app.get('/getthumb/:id', p_get.getthumb);
app.get('/tag/:tag', p_post.search_postreq);
app.get('/activate/:id/:code', p_get.activate);
app.get('/preview/:id', p_get.viewpost);
app.get('/edit/:id/:code', p_get.editpost);

app.post('/edit/:id/:code', p_post.editpost);
app.post('/', p_post.search_postreq);
app.post('/getcontent',p_post.ajax_postreq);
app.post('/tag/:tag', p_post.search_postreq);
app.post('/newpost',p_post.newpost_postreq);

app.use(function(req, res, next){
  res.render('err.jade', {title: "404 - Page Not Found",
    errmsg:"Welcome, but trust me, you don't need what you're looking for... Please hit BACK on your browser...",
    showFullNav: false, status: 404, url: req.url });
});


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
