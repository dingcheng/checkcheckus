var mongoose = require('mongoose'),
	Post = mongoose.model('Post'),
	User = mongoose.model('User'),
	Zipcode = mongoose.model('Zipcode'),
	ObjectId = mongoose.Types.ObjectId;


//Return image to 'get' request based on post Id
exports.getimg=function(req,res){
	var id = req.params.id;
	Post.findById(id,'img',function(err,result){
		if(err||result==null){
			res.redirect('/notfound');
			return;
		}
		res.contentType(result.img.ctype);
		res.send(result.img.data);
	});
}

//Return image to 'get' request based on post Id
exports.getthumb=function(req,res){
	var id = req.params.id;
	Post.findById(id,'thumb',function(err,result){
		if(err||result==null){
			res.redirect('/notfound');
			return;
		}
		res.contentType(result.thumb.ctype);
		res.send(result.thumb.data);
	});
}

//Validate US zip codes
exports.valizip=function(req,res){
	Zipcode.findOne({zip:req.query.zipcode},"zip",function(err,zipItem){
		if(!err){
			if(zipItem)
				res.send('true');
			else
				res.send('false');
		}
		else
			res.send('error');
	});
}

//View post
exports.viewpost=function(req,res){
	var id = ObjectId(req.params.id);
	var fieldsel = {img:0};
	Post.findById(id,
		fieldsel,
		function(err, result){
			if (!err&&result)
				res.render('viewpost',{title:result.title,item:result});
			else
				res.redirect('/notfound');
		});
}

//Activating the post, if it's already activated, forward to editing page
exports.activate=function(req,res){
	var id = ObjectId(req.params.id),
		code = req.params.code;
	Post.findById(id,
		null,
		function(err, result){
			if (!err&&result&&result.actcode==code){
				if (result.acti==false) {
					result.acti=true;
					result.save(function(err,saveres){
						if(err){
							res.render('err',
								{title: "500 - Internal Server Error",
								errmsg:'Cannot activate post, please contact administrator.',
								showFullNav: false, status: 500, url: req.url}
								);
						}
						else
							res.redirect('/post/'+result._id);
					})
				} else res.redirect('/edit/'+result._id+'/'+code);
			}
			else
				res.redirect('/notfound');
	});
}

//Editing the post, should have the activation code.
exports.editpost=function(req,res){
	var id = ObjectId(req.params.id),
		code = req.params.code;
	Post.findById(id,
		{img:0},
		function(err, result){
			if (!err&&result&&result.actcode==code){
				res.render('newpost',{title:'编辑帖子', editing:true, item:result});
			}
			else
				res.redirect('/notfound');
	});
}