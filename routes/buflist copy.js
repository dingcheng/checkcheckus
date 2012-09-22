exports.home=function(req,res){
	res.render('home', {title: 'Buf\'s List'});
};

exports.dummysearch=function(req,res){
	res.render('searchresult',{title: 'Keywords',items:items,total:7,showingfrom:1,showingto:7,pagecount:1});

};

exports.search_handler=function(req,res){
	if('post' in req.body)
		res.redirect('/newpost');
	searchstrings = req.body.searchbox.split(' ');
	var resultset={}
	,total=0
	,showingto=0
	,pagecount=0;
	for(var id in items) {
		var item = items[id];
		for(var i=0;i<item['tags'].length;i++){
			for(var j=0;j<searchstrings.length;j++){
				if(item['tags'][i]==searchstrings[j]){
					resultset[id]=item;
					total++;
				}
			}
		}
	}
	pagecount=total%10;
	res.render('searchresult',{title:req.body.searchbox,items:resultset,total:total,showingfrom:1,showingto:total,pagecount:pagecount})
}

exports.tagshow=function(req,res){
	var tagslist = req.params.tag.split(/\s+/);
	res.send(tagslist);
}

var items={
	ABC:{title:'A 2002 Audi A4 for sale, 97000 miles, black 1.8T', price:7000, tags:['audi','a4','1.8t'], date:'08/02/2012'},
	BCD:{title:'A 2000 Audi A4 for sale, 97000 miles, black 1.8T', price:6356, tags:['奥迪','t2','t3'], date:'08/02/2012'},
	CDE:{title:'A 2006 Audi A4 for sale, 9700 miles, black 1.8T', price:12144, tags:['t1','t2','t3'], date:'08/02/2012'},
	DEF:{title:'A 1999 Audi A4 for sale, 97000 miles, black 1.8T', price:2131, tags:['t1','t2','t3'], date:'08/02/2012'},
	EFG:{title:'A 2008 Audi S4 for sale, 97 miles, black 3.2T', price:52346, tags:['t1','t2','t3'], date:'08/02/2012'},
	FGH:{title:'A 2012 Audi A4 for sale, 970 miles, black 1.8T', price:48752, tags:['t1','t2','t3'], date:'08/02/2012'},
	GHI:{title:'A 2005 Audi A4 for sale, 90000 miles, black 1.8T', price:12314, tags:['t1','t2','t3'], date:'08/02/2012'},
};