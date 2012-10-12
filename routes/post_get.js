var mongoose = require('mongoose'),
	Post = mongoose.model('Post'),
	User = mongoose.model('User'),
	Zipcode = mongoose.model('Zipcode'),
	ObjectId = mongoose.Types.ObjectId,
	segment = myscope.segment,
	PAGESIZE = 20;


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

exports.search=function(req,res){
	var queryObj={},
		tag,total,
		q = req.query,
		qstr = req.param('query'),
		title = qstr,
		sortby = '-date';
	// Parse which page user is requesting, default to 1
	var page = parseInt(q.page)>0?parseInt(q.page):1;
	// Parse sorting method if exists
	if (q.sortbtn) sortby = q.sortbtn;
	else if (q.partial) sortby = q.sortby;
	if (req.path.match(/\/tag/)) {
		tag = qstr.toLowerCase();
		queryObj = {$or:[
			{tags:tag},
			{ckeys:tag},
			{tkeys:tag}]
		};
	}
	else if (req.path.match(/\/search/)) {
		if (qstr.length==0) {
			title = '全部帖子';
			queryObj = {};
		}
		else{
			//Process query string
			var segObj = segment.doSegment(qstr).filter(function(v){
				return v.p!=2048;
			});
			var segArr = [];
			segObj.forEach(function(v){segArr.push(v.w.toLowerCase());})
			title = segArr.join(' ');
			queryObj = {$or:[
				{tags:{$in:segArr}},
				{tkeys:{$in:segArr}},
				{ckeys:{$in:segArr}}]
			};
		}
		//Set timing argument
		if (q.during) {
			var startDate = new Date();
			switch(q.during){
				case 'today': startDate.setDate(startDate.getDate()-1);break;
				case 'month': startDate.setDate(startDate.getDate()-31);break;
				case 'week': startDate.setDate(startDate.getDate()-8);break;
				case 'season': startDate.setDate(startDate.getDate()-91);break;
				default: startDate=null;
			}
			if (startDate!=null){
				queryObj.date={};
				queryObj.date.$gte=startDate;
			}
		}
		//Set price range
		var minp = parseInt(q.minprice);
		var maxp = parseInt(q.maxprice);
		if (minp>=0){
			queryObj.price={};
			queryObj.price.$gte=minp;
		}else minp='';
		if (maxp>0){
			if (queryObj.price==null) {queryObj.price={};}
			queryObj.price.$lt=maxp;
		}else maxp='';
	}
	//Include only active posts
	queryObj.acti=true;
	//Execute the query
	var myQuery = Post.find(queryObj,"_id title price tags date email content hasimg hasthumb thumb.h img.h");
	myQuery.sort(sortby).skip(PAGESIZE*(page-1))
		.limit(PAGESIZE)
		.exec(function(err,results){
			myQuery.count(function(err,count){
				results.niagara=true;
				var pagename = q.partial==null?'searchresult':'flowview';
				res.render(pagename,{
					title:title,
					items:results,
					total:count,
					showingfrom:(page-1)*PAGESIZE+1,
					showingto:(page-1)*PAGESIZE+results.length,
					pagecount:Math.ceil(count/PAGESIZE),
					page:page,
					keywords:qstr,
					sortby:sortby,
					during:q.during,
					minprice:minp,
					maxprice:maxp
				});
			})
		});
}