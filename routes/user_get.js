var bcrypt = myscope.bcrypt;
var mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Post = mongoose.model('Post'),
	ObjectId = mongoose.Types.ObjectId,
	nmlr = require('nodemailer'),
	config = myscope.config;
var smtpTransport=nmlr.createTransport('SMTP',config.mailer);

exports.user_available=function(req,res){
	User.findOne({email:req.query.email},"email acti",function(err,result){
		if (!err) {
			if (result&&result.acti==true)
				res.send('false');
			else
				res.send('true');
		}
		else
			res.send('error');
	});
};

exports.activate=function(req,res){
	var id = ObjectId(req.params.id),
		code = req.params.code;
	User.findById(id,null,
		function(err,result){
			if (!err&&result&&result.actcode==code){
				if (result.acti==false) {
					result.acti=true;
					result.save(function(err,saveres){
						if(err){
							res.render('err',
								{title: "500 - Internal Server Error",
								errmsg:'Cannot activate user, please contact administrator.',
								showFullNav: false, status: 500, url: req.url}
								);
						}
						else
							res.redirect('/user/');
					})
				} else res.redirect('/user/');
			}
			else
				res.redirect('/notfound');
		});
};

exports.user=function(req,res){
	Post.find({email:req.user.email},null,{sort:'-date'},
		function(err,result){
			res.render('user',
				{
					title:req.user.email,
					items:result,
					total:result.length,
					page:1,
					pagecount:1,
					showingfrom:1,
					showingto:1,
					sortby:'-date'
				});
		});
}

exports.user_and_msg=function(req,res,next){
	res.locals({'user':req.user,'message':req.flash('error')});
	next();
}