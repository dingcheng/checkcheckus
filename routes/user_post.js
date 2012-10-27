var bcrypt = myscope.bcrypt;
var mongoose = require('mongoose'),
	User = mongoose.model('User'),
	ObjectId = mongoose.Types.ObjectId,
	nmlr = require('nodemailer'),
	jsha = require('jshashes'),
	config = myscope.config;
var smtpTransport = nmlr.createTransport('SMTP',config.mailer);
var mailOptions = {
	from: "Notification✔ <admin@checkcheck.us>", // sender address
	subject: config.sitename + "账户激活邮件✔", // Subject line
};
var LocalStrategy = require('passport-local').Strategy;
function sendmail(options){
	smtpTransport.sendMail(options,
		function(err,mailresult){
			if (err) {
				console.error("sending email to "+user.email+" for user "+result._id+" failed");
				res.render('err',
					{title: "500 - Internal Server Error",
					errmsg:'Cannot send activation email, please try again.',
					showFullNav: false, status: 500, url: req.url}
					);
			}
		});
}

function mailtemplate(actlink){
	return "<h1>点击链接激活您的账户：</h1><a href='"+
		actlink + "'>" + actlink + "</a>";
}

function makeactlink(id,code){
	return config.domain + '/user/activate/' +
		id + '/' + encodeURIComponent(code);
}

function renderErr(msg){
	res.render('err',
		{title: "500 - Internal Server Error",
		errmsg: msg,
		showFullNav: false, status: 500, url: req.url}
		);
}

exports.newuser_postreq=function(req,res){
	var user = req.body;
	var salt = bcrypt.genSaltSync(10);
	var userObj = {
		email: user.email,
		cellnum: user.cellnum,
		acti: false,
		actcode: jsha.SHA1().b64(Date()),
		salt: salt,
		pwdhash: bcrypt.hashSync(user.passwd,salt)
	};
	var actlink;
	mailOptions.to = user.email;
	User.findOne({email:user.email},function(err,result){
		if (!err&&result) { // If user record exists
			if (result.acti==false) { // If it's not activated yet
				actlink = makeactlink(result._id,result.actcode);
				mailOptions.html = mailtemplate(actlink);
				sendmail(mailOptions);
				res.redirect('/user/');
			}
			else // If it's activated
				renderErr('This email address is already registered with us,'+
					' I don\'t know how you got here. ('+err+')');
		}
		else
		{ // User record doesn't exist, create a new one.
			new User(userObj).save(function(err,result){
				actlink = makeactlink(result._id,result.actcode);
				mailOptions.html = mailtemplate(actlink);
				sendmail(mailOptions);
				if (err) {
					renderErr('Cannot save to db.');
				}
				else
					res.redirect('/login/');
			});
		}
	});
};

// Use the LocalStrategy within Passport.
//	 Strategies in passport require a `verify` function, which accept
//	 credentials (in this case, a username and password), and invoke a callback
//	 with a user object.	In the real world, this would query a database;
//	 however, in this example we are using a baked-in set of users.
exports.localstrategy = new LocalStrategy({
	usernameField: 'login',
	passwordField: 'passwd'},
	function(username, password, done) {
		// asynchronous verification, for effect...
		process.nextTick(function () {
			// Find the user by username.	If there is no user with the given
			// username, or the password is not correct, set the user to `false` to
			// indicate failure and set a flash message.	Otherwise, return the
			// authenticated `user`.
			User.findOne({email:username},null,function(err,user){
				if (err) return done(err);
				if (!user) return done(null, false, { message: '未知用户'});
				if (!user.acti) return done(null,false,{message: '该账户未被激活'});
				if (!bcrypt.compareSync(password,user.pwdhash)) return done(null, false, { message: '用户名或密码不匹配' });
				return done(null, user);
			});
		});
	}
);

exports.deserializer=function(id, done) {
  User.findById(id, null, function (err, user) {
    done(err, user);
  });
};
