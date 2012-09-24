
/**
 * Module dependencies.
 */
// Setting up db
require('./db.js');

var express = require('express')
  , routes = require('./routes')
  , buflist = require('./routes/buflist')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 80);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(function(req,res,next){console.log(req.ip,Date());next();})
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', buflist.home);
app.get('/tag/:tag', buflist.search_postreq);
app.get('/newpost', buflist.newpost);
app.get('/post/:id', buflist.viewpost);
app.get('/valizip', buflist.valizip);
app.post('/', buflist.search_postreq);
app.post('/getcontent',buflist.ajax_postreq);
app.post('/tag/:tag', buflist.search_postreq);
app.post('/newpost',buflist.newpost_postreq);

app.use(function(req, res, next){
  res.render('err.jade', {title: "404 - Page Not Found",
    errmsg:"Welcome, but trust me, you don't need what you're looking for... Please hit BACK on your browser...",
    showFullNav: false, status: 404, url: req.url });
});


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
