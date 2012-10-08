var mongoose = require('mongoose'),
	Post = mongoose.model('Post'),
	User = mongoose.model('User'),
	Zipcode = mongoose.model('Zipcode'),
	ObjectId = mongoose.Types.ObjectId,
	fs = require('fs');
var Segment = require('node-segment').Segment;
var segment = new Segment();
var PAGESIZE = 20;
segment.useDefault();


//Searching handler
exports.search_postreq=function(req,res){
	if('post' in req.body){
		res.redirect('/newpost');
		return;
	}
	var queryObj,title,tag,keywords,total;
	var sortby = '-date';
	var page = req.body.page==null?1:req.body.page;
	var niagara = true;
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
		}else minp='';
		if (maxp>0){
			if (queryObj.price==null) {queryObj.price={};}
			queryObj.price.$lt=maxp;
		}else maxp='';
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
	if (niagara) {
		//queryObj.hasimg = true;
	};
	//Execute the query
	var myQuery = Post.find(queryObj,"_id title price tags date email hasimg content img.h");
	myQuery.sort(sortby).skip(PAGESIZE*(page-1))
		.limit(PAGESIZE)
		.exec(function(err,results){
			myQuery.count(function(err,count){
				results.niagara=niagara;
				var pagename = req.body.partial==null?'searchresult':'flowview';
				res.render(pagename,{
					title:title,
					items:results,
					total:count,
					showingfrom:(page-1)*PAGESIZE+1,
					showingto:(page-1)*PAGESIZE+results.length,
					pagecount:Math.ceil(count/PAGESIZE),
					page:page,
					keywords:keywords,
					sortby:sortby,
					during:req.body.during,
					minprice:minp,
					maxprice:maxp
				});
			})
		});
}