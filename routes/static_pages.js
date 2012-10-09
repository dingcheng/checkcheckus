//Home page
exports.home=function(req,res){
	res.render('home', {title: '主页', sitename:config.sitename});
};

exports.newpost=function(req,res){
	res.render('newpost',{title:'发布信息',editing:false});
}
