function jsGetToken() {
	var dfd = new $.Deferred();
	
	var oauth2 = localStorage.getItem( "oauth2" );
	if(oauth2) {
		data = JSON.parse(oauth2);
		
		
		var dif = jsNow() - (data.start_time + data.expires_in*1000);
		
//		console.info("Token will expired in ",dif);
		
		//проверяем, просрочен ли Token
		if( dif > -10000 ) { 
			console.info("Token устарел! Получаю новый.");
			jsRefreshToken().done(function(data){
				dfd.resolve(data.access_token);
			});
		} else {
			//console.info("Token свежий");
			dfd.resolve( data.access_token );
		}
		
	} else {
	     window.location.href = "./login.php?dont_have_token";
	}
	return dfd.promise();
}
	 
	 
function jsLoginUser() {
	
	jsRefreshToken().done(function(data){
		console.info( jsGetToken() );
		jsDoFirst();		
	});

}	 

function jsReg() //регистрация
{
var email = $('#email_reg').val().toLowerCase();
var passw = $('#password_reg').val();

if((email.indexOf('@')>0) && (email.indexOf('.')>0)) email_ok = 1;
else
  {
  $('#reg_page h1').hide().html('проверьте email').fadeIn();
  $('#email_reg').focus();
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

var $txt = $.ajax({type: "GET",url: "do.php", data: mydata, success: function(t) { 
	$('#reg_page h1').hide().html(t).fadeIn();
	if (t=='Вы успешно зарегистрировались.<br>Перенаправляю на сайт...') 
	   {
	   jsLogin(md5email, passw);
	   }
	//alert('Регистрация '+email+' '+passw);
	} });
}



////////////////////////////////////////////////////////////



function jsRefreshToken() {
	var dfd = new $.Deferred();

	//Проверка токена
	//Request Access Token
	
	console.info("Start_refresh_token");

	var oauth2 = localStorage.getItem( "oauth2" );

	if( oauth2 ) {
				var oauth2data = JSON.parse(oauth2);

var params_get = 'grant_type=refresh_token'+
									'&client_id=4tree_web'+
									'&client_secret=4tree_passw'+
									'&refresh_token='+oauth2data.refresh_token;

	$.ajax({
	    url: "./oauth2/token.php",
	    type: "POST",
	    dataType: "json",
	    jsonp: false,
	    cache: false,
	    contentType: "application/x-www-form-urlencoded; charset=UTF-8",
	    data: params_get,
	    processData: false,
	    cache: true,
	    success: function (data) {
	        console.log("success");
//	        console.info(data);
			data.start_time = jsNow();
	        localStorage.setItem( "oauth2", JSON.stringify(data) );
	        dfd.resolve(data);
	    },
	    abort: function (data) {
	        console.log(data);
	        console.log("abort");
	    },
	    error: function (data) {
	        console.log("error");
	        console.info(data.responseText);
	        window.location.href = "./login.php?refresh_token_expired";
	    }
	});


	} else {
		window.location.href="./login.php";
	}
	return dfd.promise();
}



function jsGetMyFirstToken() {

	//Проверка токена
	//Request Access Token

	var oauth2 = localStorage.getItem( "oauth2" );

	if( oauth2 ) {
				var oauth2data = JSON.parse(oauth2);

			var params_get = 'access_token='+oauth2data.access_token+'&secret='+Math.random();

				$.ajax({
				    url: "./oauth2/resource.php",
				    type: "GET",
				    dataType: "text",
				    jsonp: false,
				    cache: false,
				    contentType: "application/x-www-form-urlencoded; charset=UTF-8",
				    data: params_get,
				    processData: false,
				    cache: true,
				    success: function (data) {
				        console.log("success");
				        window.location.href = "./index.php";
				    },
				    abort: function (data) {
				        console.log(data);
				        console.log("abort");
				    },
				    error: function (data) {
				        console.log("error");
				        console.info(data.responseText);


				    }
				});
	}
}



function jsNow(dont_need_dif) //определение текущего времени
{
time_dif = localStorage.getItem("time_dif");
if(!time_dif) time_dif = 0;
if(!dont_need_dif)
	now_time = ( parseInt( (new Date()).getTime() ) + parseInt(time_dif)  );
else
	now_time = ( parseInt( (new Date()).getTime() ) );


return now_time; 
}	
