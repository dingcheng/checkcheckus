$.validator.setDefaults({ignore:''});
$(document).ready(function(){
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
    //Validate file size
    var reader;
    $('#upImg').change(function(event){
        reader = new FileReader();
        $('#imgerr').remove();
        $('#imgpre').remove();
        if(this.files.length==0) return;
        if (this.files[0].size>5242880) {//This number is 5MB in bytes
            $('<label class="error" id="imgerr">请上传5MB以内的图片</label>').insertAfter($(this));
            $(this).val('');
        }
        else{
            $('<div><img id="imgpre"></div>').insertAfter($(this));
            reader.onload=function(e){
                $('#imgpre').attr('src', e.target.result)
                    .width(300);
            }
            reader.readAsDataURL(this.files[0]);
        }
    })
});