
var con,ite,iw,m;
function go2page(event){
	event.preventDefault();
	var topage=parseInt($(this).attr('id'));
	var pagecount = parseInt($('.mpagecount').text());
	if (topage<1||topage>pagecount) return;
	var page=parseInt($('.mpage').text());
	if (topage==page) return;
	$('.mpage').html(topage);
	var formjson={};
	$('#criteria').serializeArray()
		.forEach(function(a){formjson[a.name]=a.value;});
	formjson.page=topage;
	formjson.partial='true';
	$.get('/search',formjson,function(data){
		$('.body').html(data);
		$('.prev').attr('id',topage-1);
		$('.next').attr('id',topage+1);
		if (topage>1) $('.prev').removeClass('disabled');
		else $('.prev').addClass('disabled');
		if (topage<pagecount) $('.next').removeClass('disabled');
		else $('.next').addClass('disabled');
		$('.active').removeClass('active');
		$('#'+topage).addClass('active');
		ite = $('.pin');con = $('#searchresults');
		reposition(con,ite,m,iw,true);
	});
}

$(document).ready(function(){
	con = $('#searchresults');
	ite = $('.pin');
	iw = ite.first().outerWidth();
	m = 10;
	// click to ajax load content and expand
	//$('.item').click(contentAjax);
	// go to page
	$('.topage').click(go2page);
	// pin everything if it's NIAGARA mode!
	reposition(con,ite,m,iw);
	function cbrepos(){
		reposition(con,ite,m,iw);
	}
	$(window).resize(cbrepos);
	// Highlight selected sorting order
	var sb = $('.msortby').text();
	$(sb).addClass('btn-info').click(function(e){e.preventDefault();});
});