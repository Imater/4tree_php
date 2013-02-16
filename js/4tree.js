var log_error = ['неправильно…','неа… жми &rarr;','ошибочка… жми &rarr;','может сменить раскладку?', 'нажми сюда &rarr;','хочешь, вышлю на почту &rarr;', 'хватит… жми &rarr;', 'а!… ты хакер&iquest; &rarr;','а оно тебе надо &iquest;', 'настырный какой &spades;', 'моё терпение лопнуло &not;','опять ты? &not;', 'уговорил… ща помогу &spades;'];
var textid = -1;

function jsReg()
{
email = $('#reg_email').val();
passw = $('#regpwd_text_id').val();

if((email.indexOf('@')>0) && (email.indexOf('.')>0)) email_ok = 1;
else
  {
  $('#reg_error').hide().html('проверьте email').fadeIn();
  return false;
  }

if(passw.length>=3) passw_ok=1;
else
 {
  $('#reg_error').hide().html('проверьте пароль').fadeIn();
  return false;
 }

passw = $.md5(passw);

mydata = { 
		  "registrate_me" : true,
		  "email" : email, 
		  "passw" : passw
		 }
		 
md5email = $.md5(email+'990990');

var $txt = $.ajax({type: "POST",url: "do.php", data: mydata, success: function(t) { 
	$('#reg_error').hide().html(t).fadeIn();
	if (t=='Вы успешно зарегистрировались.<br>Перенаправляю на сайт...') 
	   {
	   $.cookie('4tree_email',email,{"expires": 365});
	   $.cookie('4tree_email_md',md5email,{"expires": 365});
	   $.cookie('4tree_passw',passw,{"expires": 365});
	   setTimeout(function(){ document.location.href="./index.php"; },1000);
	   }
	//alert('Регистрация '+email+' '+passw);
	} });
}

function jsLog()
{
email = $('#email_login').val();
passw = $('#log_pas').val();

if((email.indexOf('@')>0) && (email.indexOf('.')>0)) email_ok = 1;
else
  {
  $('#log_error').hide().html('проверьте email').fadeIn();
  return false;
  }

if(passw.length>=3) passw_ok=1;
else
 {
  $('#log_error').hide().html('проверьте пароль').fadeIn();
  return false;
 }

md5email = $.md5(email+'990990');

passw = $.md5(passw);

mydata = { 
		  "login_me" : true,
		  "email" : email, 
		  "passw" : passw
		 }
		 
md5email = $.md5(email+'990990');

var $txt = $.ajax({type: "POST",url: "do.php", data: mydata, success: function(t) { 
	$('#reg_error').hide().html(t).fadeIn();
	if (t=='Добро пожаловать!<br>Перенаправляю на сайт...') 
	   {
	   $.cookie('4tree_email',email,{"expires": 365});
	   $.cookie('4tree_email_md',md5email,{"expires": 365});
	   $.cookie('4tree_passw',passw,{"expires": 365});
	   setTimeout(function()
	   		{ 
		  	localStorage.clear(); //очищаю данные, если тут был другой пользователь
	   		document.location.href="./index.php"; 
	   		},1000);
	   }
	 else
	   {

	   textid = textid+1;
	   $('#reremember').css('opacity', (0.4+parseFloat(textid/10)) );
	   
	   if(textid==11) $('#reg_now').click();
	   $('#log_error').hide().html(log_error[textid]).fadeIn();
	   if(textid>=13) document.location.href="http://www.xakep.ru/";
	   $('#log_pas').animate({'margin-left':-15},100).animate({'margin-left':5},100).animate({'margin-left':-15},100).animate({'margin-left':0},50);
	   }
	//alert('Регистрация '+email+' '+passw);
	} });

}

function jsDoFirst()
{

		 $('*').delegate("input", "keyup", function(event) 
			{
				if (event.keyCode=='27')
					{
					$("#reg_form").slideUp(200);
					$("#login_form").slideUp(200);
					$("#fade").fadeOut();
					return false;
					}
				if (event.keyCode=='13')
				    {
				    form = $(this).parents('.myform').attr('id');
				    if (form == 'reg_form') jsReg();
				    if (form == 'login_form') jsLog();
				    }
				 return false;
			});


if ($.cookie('4tree_email')) 
   {
   $("#email_login").val($.cookie('4tree_email'));
   }

$("*").delegate("#reremember", "click", function(event){
	email = $('#email_login').val();
	if((email.indexOf('@')>0) && (email.indexOf('.')>1)) 
			{

			md5email = $.md5(email+'990990');

			mydata = { 
					  "reremember" : true,
					  "email" : md5email
					 }
					 			
			var $txt = $.ajax({type: "POST",url: "do.php", data: mydata, success: function(t) { 
				$('#reg_error').hide().html(t).fadeIn();
				if (t.length>40) 
				   {
					$('#log_error').hide().html(t).fadeIn();
				   }
				else
				   {
					$('#log_error').hide().html('У меня нет такого адреса почты').fadeIn();
				   }
				}});
				   
			}
		else
	  		{
			  $('#log_error').hide().html('для восстановления пароля укажите email').fadeIn();
		    }
  return false;
  });


$("*").delegate("#reg_ok", "click", function(event){
	jsReg();
	return false;
	});

$("*").delegate("#login_ok", "click", function(event){
	jsLog();
	return false;
	});


$("*").delegate("#fade", "click", function(event){
	$("#reg_form").slideUp(200);
	$("#login_form").slideUp(200);
	$("#fade").fadeOut();
	return false;
	});

$("*").delegate("#login_now", "click", function(event){
	   $("#fade").fadeIn();
	   $("#login_form").slideDown(500,function()
	       { 
	       if( $("#login_form #email_login").val()=='' ) $("#login_form #email_login").focus();
	       else
		       $("#login_form input:password").focus(); 
	       });
	   
	return false;
	});


$("*").delegate("#reg_now", "click", function(event){
	   $("#fade").fadeIn();
	   $("#reg_form").slideDown(500,function(){ $("#reg_email").focus(); } );
	return false;
	});


$("*").delegate("li", "hover", function(event){
		tip = $(this).find('.tip');
		tip.show();
	return false;
	});

$("*").delegate("li", "mouseout", function(event){
		tip = $('.tip');
		tip.hide();	  
	return false;
	});

$("*").delegate("li", "mousemove", function(e) {
//		console.info(tip);
		tip = $(this).find('.tip');
		var mousex = e.pageX + 20;
		var mousey = e.pageY + 20;
		var tipWidth = tip.width();
		var tipHeight = tip.height();
		var tipVisX = $(window).width() - (mousex + tipWidth);
		var tipVisY = $(window).height() - (mousey + tipHeight);
		  
		if ( tipVisX < 20 ) {
			mousex = e.pageX - tipWidth - 20;
		} if ( tipVisY < 20 ) {
			mousey = e.pageY - tipHeight - 20;
		} 
		tip.css({  top: mousey, left: mousex });
	});
}






