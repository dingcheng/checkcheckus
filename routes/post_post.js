var mongoose = require('mongoose'),
	Post = mongoose.model('Post'),
	User = mongoose.model('User'),
	Zipcode = mongoose.model('Zipcode'),
	ObjectId = mongoose.Types.ObjectId,
	nmlr = require('nodemailer'),
	jsha = require('jshashes');
var smtpTransport=nmlr.createTransport('SMTP',{
	service:'Gmail',
	auth:{
		user: 'admin@checkcheck.us',
		pass: 'D1n0d3j5'
	}
});
var Segment = require('node-segment').Segment;
var segment = new Segment();
var PAGESIZE = 20;
segment.useDefault();

//Ajax POST request handler, renders partial html to put into page
exports.ajax_postreq=function(req,res){
	var id = req.body.id;
	Post.findById(id,'email cellnum content hasimg',function(err,result){
		res.render('postpartial',{item:result});
	})
}

//Posting new post
exports.newpost_postreq=function(req,res){
	if (req.body.submit=='取消') {
		res.redirect('/');
		return;
	};
	var post = req.body;
	var postObj = {
		title: post.title,
		content: post.content,
		email: post.email,
		address: post.address,
		zip: post.zipcode,
		price: Number(post.price),
		tags: post.hiddenTagList.toLowerCase().split(','),
		cellnum: post.cellnum,
		acti: false,
		actcode: jsha.SHA1().b64(Date())
	};
	//Save image to post only if there is one, and the size is in range (0,5) MB.
	if (post.imdata){
		var encodeheader = 'data:'+post.ctype+';base64,';
		post.imdata = post.imdata.replace(encodeheader,'');
		postObj.img={};
		postObj.img.data=new Buffer(post.imdata, 'base64');
		postObj.img.ctype=post.ctype;
		postObj.img.h=post.imgheight;
		postObj.hasimg = true;
	}
	//Similarly save thumbnail, namely the first image if there're multiple images
	if (post.thumb){
		var encodeheader = 'data:'+post.ctype+';base64,';
		post.thumb = post.thumb.replace(encodeheader,'');
		postObj.thumb={};
		postObj.thumb.data=new Buffer(post.thumb, 'base64');
		postObj.thumb.ctype=post.ctype;
		postObj.thumb.h=post.theight;
		postObj.hasthumb = true;
	}

	//Otherwise, save only text part of the post
	new Post(postObj).save(function(err, result){
		if(err)
			res.render('err',
				{title: "500 - Internal Server Error",
				errmsg:'Cannot save data to db. '+err,
				showFullNav: false, status: 500, url: req.url}
				);
		else
		{
			var actlink = "http://localhost/activate/"+result._id+"/"+encodeURIComponent(postObj.actcode);
			var mailOptions = {
				from: "✔Notification <admin@checkcheck.us>", // sender address
				to: post.email, // list of receivers
				subject: "✔checkcheck.us 新帖激活邮件", // Subject line
				html: "<h1>点击链接激活您的新帖：</h1><a href='"+actlink+"'>"+actlink+"</a>"
			};
			smtpTransport.sendMail(mailOptions,
				function(err,mailresult){
					if (err) {
						console.error("sending email to "+post.email+" for post "+result._id+" failed");
						res.render('err',
							{title: "500 - Internal Server Error",
							errmsg:'Cannot send activation email, please try again.',
							showFullNav: false, status: 500, url: req.url}
							);
					}
			});
			res.redirect('/preview/'+result._id);
		}
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
	//Include only active posts
	queryObj.acti=true;
	//Execute the query
	var myQuery = Post.find(queryObj,"_id title price tags date email content hasimg hasthumb thumb.h img.h");
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