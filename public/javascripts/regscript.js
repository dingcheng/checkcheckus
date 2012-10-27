var warning='您有未提交的数据。';
$.validator.setDefaults({ignore:''});
$(document).ready(function(){
	$('#regform').validate({
		rules: {
			email: {
				required: true,
				email: true,
				remote: '/valemail'
			},
			cellnum: {
				digits: true,
				rangelength: [10,10]
			},
			passwd: {
				required: true,
				minlength: 5
			},
			passveri: {
				equalTo: "#passwd"
			}
		},
		messages: {
			email: {
				required: "请输入Email作为用户名",
				email: "请输入合法的邮箱地址",
				remote: "该邮箱已被用来注册过"
			},
			cellnum: {
				digits: "手机号只接受数字",
				rangelength: "US手机号为10位"
			},
			passwd: {
				required: "请设置您的密码",
				minlength: "请设置大于5位的密码"
			},
			passveri: "确认密码与密码不匹配"
		}
	});
	$('#go').click(function(e){
		e.preventDefault();
		warning=null;
		$('#regform').submit();
	})
});

$(window).on('beforeunload',function(){
	var dirty = false;
	$('input:not(:submit),textarea').each(function(){
		dirty = dirty||$.trim($(this).val())!="";
	});
	if (dirty)
		return warning;
});