var mongoose = require('mongoose'),
	Post = mongoose.model('Post'),
	User = mongoose.model('User'),
	Zipcode = mongoose.model('Zipcode'),
	ObjectId = mongoose.Types.ObjectId;
var Segment = require('node-segment').Segment;
var segment = new Segment();
var PAGESIZE = 20;
segment.useDefault();

//Ajax POST request handler, renders partial html to put into page
exports.ajax_postreq=function(req,res){
	var id = req.body.id;
	Post.findById(id,'email cellnum content',function(err,result){
		res.render('postpartial',{item:result});
	})
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
//Home page
exports.home=function(req,res){
	console.log('ip:',req.ip,Date());
	res.render('home', {title: '主页'});
};
//View post
exports.viewpost=function(req,res){
	var id = ObjectId(req.params.id);
	Post.findById(id,
		"title price tags date email cellnum content",
		function(err, result){
			if (!err&&result)
				res.render('viewpost',{title:result.title,item:result});
			else
				res.redirect('/notfound');
		});
}
//Searching handler
exports.search_postreq=function(req,res){
	if('post' in req.body){
		res.redirect('/newpost');
		return;
	}
	var queryObj,title,tag,keywords,total;
	var sortby = '-date';
	var page = req.body.page==null?1:req.body.page;
	//construct query from GET request
	//this is tag searching, no segmenting performed
	if (req.method=='GET') {
		if (req.params.tag.length==0) {
			title = '全部帖子';
			queryObj = {};
			keywords = '';
		}
		else{
			title = req.params.tag;
			tag = title.toLowerCase();
			keywords = tag;
			queryObj = {$or:[
				{tags:tag},
				{ckeys:tag},
				{tkeys:tag}]
			};
		}
	}
	else { //construct query from POST request
		if (req.body.searchbox.length==0) {
			title = '全部帖子';
			queryObj = {};
			keywords = '';
		}
		else{
			//Process query string
			var segObj = segment.doSegment(req.body.searchbox).filter(function(v){
				return v.p!=2048;
			});
			var segArr = [];
    		segObj.forEach(function(v){segArr.push(v.w.toLowerCase());})
    		title = segArr.join(' ');
    		keywords = title;
    		queryObj = {$or:[
    			{tags:{$in:segArr}},
    			{tkeys:{$in:segArr}},
    			{ckeys:{$in:segArr}}]
    		};
    	}
    	//Set timing argument
    	var startDate = new Date();
    	switch(req.body.during){
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
    	//Set price range
    	var minp = parseInt(req.body.minprice);
    	var maxp = parseInt(req.body.maxprice);
    	if (minp>=0){
    		queryObj.price={};
    		queryObj.price.$gte=minp;
    	}
    	if (maxp>0){
    		if (queryObj.price==null) {queryObj.price={};}
    		queryObj.price.$lt=maxp;
    	}
    	//Set sorting method
    	if (req.body.partial!=null) {
    		sortby=req.body.sortby;
    	}
    	else{
    		if (req.body.newest!=null) sortby = '-date';
    		if (req.body.pricy!=null) sortby = '-price';
    		if (req.body.cheap!=null) sortby = 'price';
    	}
	}
	//Execute the query
	var myQuery = Post.find(queryObj,"_id title price tags date");
	myQuery.sort(sortby).skip(PAGESIZE*(page-1))
		.limit(PAGESIZE)
		.exec(function(err,results){
			myQuery.count(function(err,count){
				if (req.body.partial!=null) {
					res.render('nextpage',{
						items:results,
						showingfrom:(page-1)*PAGESIZE+1,
						showingto:(page-1)*PAGESIZE+results.length
					});
				}
				else{
					res.render('searchresult',{
						title:title,
						items:results,
						total:count,
						showingfrom:(page-1)*PAGESIZE+1,
						showingto:(page-1)*PAGESIZE+results.length,
						pagecount:Math.ceil(count/PAGESIZE),
						page:page,
						keywords:keywords,
						sortby:sortby
					});
				}
			})
		});
}

exports.newpost=function(req,res){
	res.render('newpost',{title:'发布信息'});
}

exports.newpost_postreq=function(req,res){
	if (req.body.submit=='取消') {
		res.redirect('/');
		return;
	};
	var post = req.body;
	new Post({
		title: post.title,
		content: post.content+"\r\n#"+post.hiddenTagList,
		email: post.email,
		address: post.address,
		zip: post.zipcode,
		price: post.price,
		tags: post.hiddenTagList.toLowerCase().split(','),
		cellnum: post.cellnum,
	}).save(function(err, result){
		if(err)
			res.render('err',
				{title: "500 - Internal Server Error",
				errmsg:'Cannot save data to db.',
				showFullNav: false, status: 404, url: req.url}
				);
		else
			res.redirect('/post/'+result._id.toString());
	})
}
