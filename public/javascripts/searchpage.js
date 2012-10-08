function contentAjax(event){
	//This function is used to load post content when a post div is clicked
	var item = $(this);
	var holder = $(this).children('.postcontent');
	$('.prompt').hide();

	if (holder.hasClass('open')) {
		holder.slideUp('fast').removeClass('open');
		return;
	}
	$('.open').removeClass('open').slideUp('fast');
	if(item.hasClass('fetched')){
		holder.slideToggle('fast').addClass('open');
	}
	else{
		var id = item.attr('id');
		$.post('/getcontent',{id:id},
			function(data){
				item.children('.postcontent')
					.html(data)
					.slideToggle('fast')
					.addClass('open');
				item.addClass('fetched');
			}
		);
	}
}
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
	$.post('/',formjson,function(data){
		$('#searchresults').html(data);
		$('.page').html(topage);
		$('.from').html($('.mfrom').text());
		$('.to').html($('.mto').text());
		$('.prev').attr('id',topage-1);
		$('.next').attr('id',topage+1);
		ite = $('.pin');
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
	$(sb).addClass('plump').click(function(e){e.preventDefault();});
});