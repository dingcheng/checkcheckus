//Home page
exports.home=function(req,res){
	res.render('home', {title: '主页', sitename:myscope.config.sitename});
};

exports.newpost=function(req,res){
	res.render('newpost',{title:'发布信息',editing:false});
}

exports.register=function(req,res){
	res.render('register', {title:'注册账号'});
}

exports.login=function(req,res){
	res.render('login', {title:'登陆'});
}