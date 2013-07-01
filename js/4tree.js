var log_error = ['неправильно…','неа… жмите &rarr;','ошибочка… жмите &rarr;','может сменить раскладку?', 'нажмите сюда &rarr;','хотите, вышлю на почту &rarr;', 'хватит… жмите &rarr;', 'а!… ты хакер&iquest; &rarr;','а оно тебе надо &iquest;', 'настырный какой &spades;', 'моё терпение лопнуло &not;','опять ты? &not;', 'уговорил… ща помогу &spades;'];
var textid = -1;

function jsReg() //регистрация
{
var email = $('#reg_email').val().toLowerCase();
var passw = $('#regpwd_text_id').val();

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

passw = hex_md5(passw);

var mydata = { 
		  "registrate_me" : true,
		  "email" : email, 
		  "passw" : passw
		 }
		 
var md5email = hex_md5(email+'990990');

var $txt = $.ajax({type: "POST",url: "do.php", data: mydata, success: function(t) { 
	$('#reg_error').hide().html(t).fadeIn();
	if (t=='Вы успешно зарегистрировались.<br>Перенаправляю на сайт...') 
	   {
	   $.cookie('4tree_email',email,{"expires": 365});
	   $.cookie('4tree_email_md',md5email,{"expires": 365});
	   $.cookie('4tree_passw',passw,{"expires": 365});
	   setTimeout(function(){ document.location.href="./index.php"; },500);
	   }
	//alert('Регистрация '+email+' '+passw);
	} });
}

function jsLog(i_am_mobile) //вход
{
var email = $('#email_login').val().toLowerCase();
var passw = $('#log_pas').val();

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

var md5email = hex_md5(email+'990990');

var passw = hex_md5(passw);

var mydata = { 
		  "login_me" : true,
		  "email" : email, 
		  "passw" : passw
		 }
		 
var md5email = hex_md5(email+'990990');

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
	   		if(!i_am_mobile) {
	   			document.location.href="./index.php"; 
	   		} else {
				document.location.href="./pda.php"; 
	   		}
	   		},500);
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


function jsClearCurrentBase() { //очищаем существующую базу данных
   	var d=$.Deferred();

   	if( JSON.stringify(db.getSchema().stores).indexOf('tree') != -1 ) //если таблицы tree нет
       	db.clear().done(function(){ console.info("db cleared"); db.close(); d.resolve(); });
       else
       	d.resolve();
       	
    $.cookie("4tree_passw",null);
    $.cookie("4tree_email",null);
    $.cookie("4tree_email_md",null);
    $.cookie("4tree_user_id",null);
    $.cookie("4tree_social_md5",null);
    $.cookie("main_tree_font",null);
    $.cookie("main_x",null);
    $.cookie("main_y",null);
    $.cookie("pwidth",null);
    $.cookie("sh",null);
    localStorage.clear();

   	return d.promise();
}

var db;

function jsDoFirst()
{
    db = new ydn.db.Storage('_all_tree');    
    
    setTimeout(function(){ jsClearCurrentBase(); }, 1500);
	

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
				    localStorage.clear();
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

			md5email = hex_md5(email+'990990');

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


$("#reg_form").delegate("#reg_ok", "click", function(event){
	jsReg();
	return false;
	});

$("#login_form").delegate("#login_ok", "click", function(event){
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






