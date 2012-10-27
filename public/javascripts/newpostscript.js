var cvs
	,thumbcvs
	,imht=0
	,fstim=true
	,imgerr='<label class="error imgerr">请上传3MB以内的图片</label>';
var warning='您有未提交的数据。';
function gencvs(){
	var h = this.height*530/this.width;
	var prev_h = cvs.height;
	var ctx = cvs.getContext('2d');
	if (prev_h>0) var imgDat=ctx.getImageData(0,0,cvs.width,prev_h);
	this.width=530;
	this.height=h;
	cvs.height = prev_h + h;
	$('#iheight').val(cvs.height/2);
	if (prev_h>0) ctx.putImageData(imgDat,0,0);
	ctx.drawImage(this,0,prev_h,530,h);
	$('#idata').val(cvs.toDataURL('image/jpeg',0.7));
	if (fstim){
		this.width/=2;
		this.height/=2;
		thumbcvs.height = h/2;
		thumbcvs.getContext('2d').drawImage(this,0,0,265,h/2);
		$('#itheight').val(h/2);
		$('#ithumb').val(thumbcvs.toDataURL('image/jpeg'));
		fstim=false;
	}
}
function setup_reader(file){
	if (file.size>3145728) {//This number is 5MB in bytes
		$(imgerr).html(file.name+'超过3MB了').insertAfter($('#upImg'));
	}
	else{
		var img = new Image();
		var reader = new FileReader();
		var ctype = file.type;
		$('#ictype').val('image/jpeg');
		img.onload = gencvs;
		reader.onloadend=function(e){
				img.src = this.result;
			}
		reader.readAsDataURL(file);
	}
}
function appimg(event){
	$('.imgerr').remove();
	$('.imeta').val('');
	if(this.files.length==0){
		$(this).val('');
		return;
	}
	for (var i = 0; i <= this.files.length - 1; i++){
		setup_reader(this.files[i]);
	}
}
$.validator.setDefaults({ignore:''});
$(document).ready(function(){
	cvs = document.getElementById('imgpre');
	cvs.width = 530;
	thumbcvs = document.createElement('canvas');
	thumbcvs.width = 265;
	//leaving page with dirty data prompt -- Todo
	//validate the form, using jquery validation plugin
	$("#postform").validate({ignore:'#upImg',
		rules: {
			title: "required",
			hiddenTagList: "required",
			price: {
				number: true,
				min: 0
			},
			email: {
				required: true,
				email: true
			},
			cellnum: {
				digits: true,
				rangelength: [10,10]
			},
			zipcode: {
				digits: true,
				rangelength: [5,5],
				remote: '/valizip'
			}
		},
		messages: {
			title: "请输入标题",
			hiddenTagList: "请至少输入一个标签",
			price: {
				number: "请输入一个数",
				min: "请输入一个非负的价格"
			},
			email: {
				required: "请输入您的邮箱地址",
				email: "请输入合法的邮箱地址"
			},
			cellnum: {
				digits: "手机号只接受数字",
				rangelength: "US手机号为10位"
			},
			zipcode: {
				digits: "US邮编只包含数字",
				rangelength: "US邮编为5位",
				remote: "该邮编不存在"
			}
		},
		submitHandler: function(form) {
			if(!$.browser.msie)
                $('#upImg').remove();
            warning=null;
			form.submit();
		}
	});
	//Tags plugin activation
	$('#tags').tagsManager();
	$('#tags').one('focus',function(event){
		var p = $('.prompt');
		p.css('top', 5)
			.css('left',$(document).width()/2-p.width()/2)
			.slideDown('fast');
		p.delay(10000).slideUp('fast');
	});
	//Tag usage prompt
	//Automatically add tags by clicking on the links
	var taginput = $('#tags');
	$('a.tag').click(function(event){
		event.preventDefault();
		var thistags = $(this).text().split(/[\s,#]+/);
		$.each(thistags, function(i,v){
			taginput.pushTag(v);
		});
	});
	//When hiddenTagList is changed, remove the error label
	$('input[name="hiddenTagList"]').change(function(event){
		if ($.trim($(this).val())!=='')
			$('label[for="hiddenTagList"]').remove();
	});
	//Validate image file size, and resize image to smaller size.
	$('#upImg').change(appimg);
	//Load post information if it's editing page
	if ($('#mediting').text()=='true') {
		$('#title').val($('#mtitle').text());
		$('#price').val($('#mprice').text());
		$('#email').val($('#memail').text()).attr('readonly','readonly');
		$('#cellnum').val($('#mcellnum').text());
		$('#zipcode').val($('#mzipcode').text());
		$('#address').val($('#maddress').text());
		$('#content').val($('#mcontent').text());
		var tags = $('#mtags').text().split(',');
		for (var i = tags.length - 1; i >= 0; i--) {
			taginput.pushTag(tags[i]);
		}
		$('#mimg').each(function(){
			var img = new Image();
			img.onload = gencvs;
			img.src = $(this).text();
		})
	};
	//Reset image button
	$('#resetimg').click(function(e){
		e.preventDefault();
		imht=0;
		fstim=true;
		$('.imgerr').remove();
		cvs.height=0;
		$('.imeta').val('');
		$('.tmeta').val('');
		$('#upImg').val('');
	});
	$('#post').click(function(e){
		e.preventDefault();
		$('#postform').submit();
	})
});

$(window).on('beforeunload',function(){
	var dirty = false;
	$('input:not(:submit):not(:readonly),textarea').each(function(){
		dirty = dirty||$.trim($(this).val())!="";
	});
	if (dirty)
		return warning;
});