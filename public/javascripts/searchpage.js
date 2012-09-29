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
$(document).ready(function(){
	// hover prompt
	$('.item').hover(function(e){
		var p = $('.prompt');
		p.css('top', $(window).height()/2-p.height())
            .css('left', 5)
            .show();
    },function(e){
    	$('.prompt').hide();
    });
	// click to ajax load content and expand
	$('.item').click(contentAjax);
	// previous and next page
	$('#prev,#next').click(function(event){
		event.preventDefault();
		var pagecount = parseInt($('input[name="pagecount"]').val());
		var page = parseInt($("input[name='page']").val());
		if ($(this).attr('id')=='prev') page-=1;
		else page+=1;
		if (page<1||page>pagecount) return;
		var formjson={};
		$('#criteria').serializeArray()
			.forEach(function(a){formjson[a.name]=a.value;});
		formjson.partial='true';
		formjson.page=page;
		$.post('/',formjson,function(data){
			$('#searchresults').html(data);
			$('.item').click(contentAjax);
			$("input[name='page']").val(formjson.page);
			$('.range').html(
				$("input[name='from']").val()
				+ " - "
				+ $("input[name='to']").val());
			$('.page').html(page);
		});
	});
	// go to linked page
	$('.topage').click(function(event){
		event.preventDefault();
		var topage=parseInt($(this).text());
		var page=parseInt($("input[name='page']").val());
		if (topage==page) return;
		$('#searchresults').addClass('busy');
		var formjson={};
		$('#criteria').serializeArray()
			.forEach(function(a){formjson[a.name]=a.value;});
		formjson.page=topage;
		formjson.partial='true';
		$.post('/',formjson,function(data){
			$('#searchresults').html(data);
			$('.item').click(contentAjax);
			$("input[name='page']").val(formjson.page);
			$('.range').html(
				$("input[name='from']").val()
				+ " - "
				+ $("input[name='to']").val());
			$('#searchresults').removeClass('busy');
			$('.page').html(topage);
		});
	});
});