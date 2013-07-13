<html lang="ru" manifest="">
<meta name="viewport" content="width=device-width, initial-scale=1,user-scalable=no"> 
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=utf-8">
<meta charset="utf-8">
<head>
<title>4tree.ru — вход в систему</title>
<meta name="description" content="Сайт для ведения дел, заметок, календаря и так далее. Инструмент таймменеджмента, где всё нужное собранно в одном месте."/>
<meta name="keywords" content="gtd, 4tree.ru, заметки, задачи, гтд, таймменеджмент, хранение заметок, календарь"/>
<meta name="viewport" content="width=device-width">

<style>


#login_form {
	margin: 0 auto;
	display: inline-block;
	left: 50%;
	position: absolute;
	margin-left: -125px;
	top:50%;
	margin-top: -145px;
	height: 200px;
}

#login_please {
    -webkit-transition: all 0.3s;
    -moz-transition: all 0.3s;
    -o-transition: all 0.3s;
    transition: all 0.3s;
	width: 250px;
	text-align: center;
	font-size: 16px;
	color: rgba(0,0,0,0.3);
	padding: 5px 0px;
	border-radius: 10px;
	cursor: pointer;
text-shadow: 0px 1px 1px rgba(255,255,255,1);

background: rgb(238,238,238); /* Old browsers */
/* IE9 SVG, needs conditional override of 'filter' to 'none' */
background: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/Pgo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgdmlld0JveD0iMCAwIDEgMSIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+CiAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkLXVjZ2ctZ2VuZXJhdGVkIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPgogICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2VlZWVlZSIgc3RvcC1vcGFjaXR5PSIxIi8+CiAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNjY2NjY2MiIHN0b3Atb3BhY2l0eT0iMSIvPgogIDwvbGluZWFyR3JhZGllbnQ+CiAgPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0idXJsKCNncmFkLXVjZ2ctZ2VuZXJhdGVkKSIgLz4KPC9zdmc+);
background: -moz-linear-gradient(top,  rgba(238,238,238,1) 0%, rgba(204,204,204,1) 100%); /* FF3.6+ */
background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,rgba(238,238,238,1)), color-stop(100%,rgba(204,204,204,1))); /* Chrome,Safari4+ */
background: -webkit-linear-gradient(top,  rgba(238,238,238,1) 0%,rgba(204,204,204,1) 100%); /* Chrome10+,Safari5.1+ */
background: -o-linear-gradient(top,  rgba(238,238,238,1) 0%,rgba(204,204,204,1) 100%); /* Opera 11.10+ */
background: -ms-linear-gradient(top,  rgba(238,238,238,1) 0%,rgba(204,204,204,1) 100%); /* IE10+ */
background: linear-gradient(to bottom,  rgba(238,238,238,1) 0%,rgba(204,204,204,1) 100%); /* W3C */
filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#eeeeee', endColorstr='#cccccc',GradientType=0 ); /* IE6-8 */

-moz-box-shadow: 0px 2px 2px rgb(64,64,64);
-webkit-box-shadow: 0px 2px 2px rgb(64,64,64);
box-shadow: 0px 2px 2px rgb(64,64,64);
-ms-filter: "progid:DXImageTransform.Microsoft.Shadow(Strength=4, Direction=135, Color='#444444')";
filter: progid:DXImageTransform.Microsoft.Shadow(Strength=4, Direction=135, Color='#444444');

}

#login_please.active {
	color: #000;
    -webkit-transition: all 0.3s;
    -moz-transition: all 0.3s;
    -o-transition: all 0.3s;
    transition: all 0.3s;	
}


#login_please.active:hover {
-moz-box-shadow: 0px 1px 2px rgb(64,64,64);
-webkit-box-shadow: 0px 1px 2px rgb(64,64,64);
box-shadow: 0px 1px 2px rgb(64,64,64);
-ms-filter: "progid:DXImageTransform.Microsoft.Shadow(Strength=4, Direction=135, Color='#444444')";
filter: progid:DXImageTransform.Microsoft.Shadow(Strength=4, Direction=135, Color='#444444');
}

#login_please:active {
-moz-box-shadow: none;
-webkit-box-shadow: none;
box-shadow: none;
}


#registrate_form {
	position: absolute;
	bottom: 40px;
	left:50%;
	margin-left: -100px;
	width: 200px;

}

#reg_please {
	width: 200px;
	text-align: center;
	font-size: 12px;
	font-weight: bold;
	color:rgb(36,68,25);
	padding: 5px 0px;
	border-radius: 5px;
	cursor: pointer;
text-shadow: 0px 1px 1px rgba(255,255,255,1);


background: rgb(210,255,82); /* Old browsers */
/* IE9 SVG, needs conditional override of 'filter' to 'none' */
background: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/Pgo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgdmlld0JveD0iMCAwIDEgMSIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+CiAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkLXVjZ2ctZ2VuZXJhdGVkIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPgogICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2QyZmY1MiIgc3RvcC1vcGFjaXR5PSIxIi8+CiAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM5MWU4NDIiIHN0b3Atb3BhY2l0eT0iMSIvPgogIDwvbGluZWFyR3JhZGllbnQ+CiAgPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0idXJsKCNncmFkLXVjZ2ctZ2VuZXJhdGVkKSIgLz4KPC9zdmc+);
background: -moz-linear-gradient(top,  rgba(210,255,82,1) 0%, rgba(145,232,66,1) 100%); /* FF3.6+ */
background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,rgba(210,255,82,1)), color-stop(100%,rgba(145,232,66,1))); /* Chrome,Safari4+ */
background: -webkit-linear-gradient(top,  rgba(210,255,82,1) 0%,rgba(145,232,66,1) 100%); /* Chrome10+,Safari5.1+ */
background: -o-linear-gradient(top,  rgba(210,255,82,1) 0%,rgba(145,232,66,1) 100%); /* Opera 11.10+ */
background: -ms-linear-gradient(top,  rgba(210,255,82,1) 0%,rgba(145,232,66,1) 100%); /* IE10+ */
background: linear-gradient(to bottom,  rgba(210,255,82,1) 0%,rgba(145,232,66,1) 100%); /* W3C */
filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#d2ff52', endColorstr='#91e842',GradientType=0 ); /* IE6-8 */

-moz-box-shadow: 0px 1px 2px rgb(64,64,64);
-webkit-box-shadow: 0px 1px 2px rgb(64,64,64);
box-shadow: 0px 1px 2px rgb(64,64,64);
-ms-filter: "progid:DXImageTransform.Microsoft.Shadow(Strength=4, Direction=135, Color='#444444')";
filter: progid:DXImageTransform.Microsoft.Shadow(Strength=4, Direction=135, Color='#444444');

}

#reg_please:hover {
-moz-box-shadow: 0px 0px 2px rgb(64,64,64);
-webkit-box-shadow: 0px 0px 2px rgb(64,64,64);
box-shadow: 0px 0px 2px rgb(64,64,64);
-ms-filter: "progid:DXImageTransform.Microsoft.Shadow(Strength=4, Direction=135, Color='#444444')";
filter: progid:DXImageTransform.Microsoft.Shadow(Strength=4, Direction=135, Color='#444444');

}

#forget_password {
	position: absolute;
	bottom: 10px;
	text-decoration: underline;
	font-size: 12px;
	left:50%;
	margin-left: -100px;
	width: 200px;
	text-align: center;
	color: rgba(36,68,25,0.5);
	display: inline-block;
	cursor: pointer;
}
#forget_password:hover {
    -webkit-transition: all 0.3s;
    -moz-transition: all 0.3s;
    -o-transition: all 0.3s;
    transition: all 0.3s;	
	color: rgba(36,68,25,0.8);
}


body {
font-size: 14px;
margin:0px;
padding: 0px;
font-family: verdana, arial;
position: relative;	
overflow: hidden;
background: rgb(210,255,82); /* Old browsers */
/* IE9 SVG, needs conditional override of 'filter' to 'none' */
background: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/Pgo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgdmlld0JveD0iMCAwIDEgMSIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+CiAgPHJhZGlhbEdyYWRpZW50IGlkPSJncmFkLXVjZ2ctZ2VuZXJhdGVkIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY3g9IjUwJSIgY3k9IjUwJSIgcj0iNzUlIj4KICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNkMmZmNTIiIHN0b3Atb3BhY2l0eT0iMSIvPgogICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjOTFlODQyIiBzdG9wLW9wYWNpdHk9IjEiLz4KICA8L3JhZGlhbEdyYWRpZW50PgogIDxyZWN0IHg9Ii01MCIgeT0iLTUwIiB3aWR0aD0iMTAxIiBoZWlnaHQ9IjEwMSIgZmlsbD0idXJsKCNncmFkLXVjZ2ctZ2VuZXJhdGVkKSIgLz4KPC9zdmc+);
background: -moz-radial-gradient(center, ellipse cover,  rgba(210,255,82,1) 0%, rgba(145,232,66,1) 100%); /* FF3.6+ */
background: -webkit-gradient(radial, center center, 0px, center center, 100%, color-stop(0%,rgba(210,255,82,1)), color-stop(100%,rgba(145,232,66,1))); /* Chrome,Safari4+ */
background: -webkit-radial-gradient(center, ellipse cover,  rgba(210,255,82,1) 0%,rgba(145,232,66,1) 100%); /* Chrome10+,Safari5.1+ */
background: -o-radial-gradient(center, ellipse cover,  rgba(210,255,82,1) 0%,rgba(145,232,66,1) 100%); /* Opera 12+ */
background: -ms-radial-gradient(center, ellipse cover,  rgba(210,255,82,1) 0%,rgba(145,232,66,1) 100%); /* IE10+ */
background: radial-gradient(ellipse at center,  rgba(210,255,82,1) 0%,rgba(145,232,66,1) 100%); /* W3C */
filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#d2ff52', endColorstr='#91e842',GradientType=1 ); /* IE6-8 fallback on horizontal gradient */
}


input {
	font-size: 16px;
	padding: 10px 10px;
	width:250px;
	border: none;
	margin:0px;
	background: rgb(247,247,247);
	border-radius: 0px;
	outline: none;
	-webkit-appearance: none;
}


#email {
	border-top-left-radius: 10px;
	border-top-right-radius: 10px;
	border-bottom: 1px solid #888;
	box-shadow: inset 2px 2px 3px rgba(0,0,0,0.4);
	-webkit-box-shadow: inset 2px 2px 3px rgba(0,0,0,0.4);
}

#password {
	border-bottom-left-radius: 10px;
	border-bottom-right-radius: 10px;
	box-shadow: inset 2px -2px 3px rgba(0,0,0,0.4);
	-webkit-box-shadow: inset 2px -2px 3px rgba(0,0,0,0.4);
	padding-top: 8px;

}

h1 {
    -webkit-transition: all 0.3s;
    -moz-transition: all 0.3s;
    -o-transition: all 0.3s;
    transition: all 0.3s;	
	text-align: center;
	color: rgba(255,255,255,0.8);
	font-size: 37px;
	margin: 0px;
	font-weight: bold;
	font-family: Verdana;
text-shadow: 0px -1px 1px rgba(0,0,0,0.3);
	cursor: pointer;
}

h1:hover {
    -webkit-transition: all 0.3s;
    -moz-transition: all 0.3s;
    -o-transition: all 0.3s;
    transition: all 0.3s;	
	color: rgba(255,255,255,0.83);
}

#social {
    -webkit-transition: all 0.3s;
    -moz-transition: all 0.3s;
    -o-transition: all 0.3s;
    transition: all 0.3s;	
	width:250px;
	height:20px;
	margin-top:19px;
	text-align: center;
	opacity: 0.3;
}

#social:hover {
    -webkit-transition: all 0.3s;
    -moz-transition: all 0.3s;
    -o-transition: all 0.3s;
    transition: all 0.3s;	
	opacity: 1;
}



</style>

<script src="./js/jquery-1.8.2.js"></script>
<script src="js/md5.js"/></script>

<script>

$(document).ready(function(){

	var email = localStorage.getItem("email");
	if(email) {
		$("#email").val(email);
		$("#password").focus();
	} else {
		$("#email").focus();
	}



	$("#email").on("keyup",function(){
		localStorage.setItem("email",$("#email").val());
	});

	$("#password").on("keyup",function(e){
		if( $("#password").val().length>1 ) {
			$("#login_please").addClass("active");
		} else {
			$("#login_please").removeClass("active");
		}

		if(e.keyCode == 13) {
			jsLogin();
		}
		return false;
	});

	$("#login_please").on("click",function(e){
		jsLogin();
		return false;
	});

	$("#reg_please").on("click",function(e){
		jsGetMyFirstToken();
		return false;
	});


	$("#forget_password").on("click",function(e){
		jsRefreshToken();
		return false;
	});





});

//curl http://localhost/fpk/4tree/oauth2/resource.php -d 'access_token=bdc76b02741a0f1faee803cd8ec5d712ac538331'
//curl -u testclient:testpass http://localhost/fpk/4tree/oauth2/token.php -d 'grant_type=client_credentials&code=2db11b2d10f60a07a1038c5ebc06b8c4fc15d0d7'  - получение TOKEN
//curl -u testclient:testpass http://localhost/token.php -d 'grant_type=authorization_code&code=YOUR_CODE'
//curl http://localhost/fpk/4tree/oauth2/token.php -d 'grant_type=password&username=fuck&password=fuck&user_id=66&client_secret=87e7c51b7a7e50cdf2e78670557c18a4&client_id=fuck'


function jsRefreshToken() {

	//Проверка токена
	//Request Access Token

	var oauth2 = localStorage.getItem( "oauth2" );

	if( oauth2 ) {
				var oauth2data = JSON.parse(oauth2);

var params_get = 'grant_type=refresh_token'+
									'&client_id=4tree_web'+
									'&client_secret=4tree_passw'+
									'&refresh_token='+oauth2data.refresh_token;

	$.ajax({
	    url: "http://localhost/fpk/4tree/oauth2/token.php",
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
	        console.info(data);
	        localStorage.setItem( "oauth2", JSON.stringify(data) );
	        jsGetMyFirstToken(); //попытка первого входа
	    },
	    abort: function (data) {
	        console.log(data);
	        console.log("abort");
	    },
	    error: function (data) {
	        console.log("error");
	        console.info(data.responseText);
	        $('#password').animate({'margin-left':-15},100).animate({'margin-left':5},100).animate({'margin-left':-15},100).animate({'margin-left':0},50);
	    }
	});


	}

}


function jsGetMyFirstToken() {

	//Проверка токена
	//Request Access Token

	var oauth2 = localStorage.getItem( "oauth2" );

	if( oauth2 ) {
				var oauth2data = JSON.parse(oauth2);

			var params_get = 'access_token='+oauth2data.access_token+'&secret='+Math.random();

				$.ajax({
				    url: "http://localhost/fpk/4tree/oauth2/resource.php",
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
				        alert(data);
				    },
				    abort: function (data) {
				        console.log(data);
				        console.log("abort");
				    },
				    error: function (data) {
				        console.log("error");
				        console.info(data);


				    }
				});
	}

}


//grant_type=password&username=fuck&password=fuck&user_id=66&client_secret=87e7c51b7a7e50cdf2e78670557c18a4&client_id=fuck';
function jsLogin(email, password) {
	var email = $("#email").val();
	var pass = $("#password").val();

	var md5email = hex_md5(email+'990990');
	var passw = hex_md5(pass);


var params_get = 'grant_type=password&username=fuck&password=fuck&user_id=66&client_secret=87e7c51b7a7e50cdf2e78670557c18a4&client_id=fuck';

var params_get = 'grant_type=password&username='+md5email+
									'&password='+passw+
									'&client_id=4tree_web'+
									'&client_secret=4tree_passw'+
									'&secret='+Math.random();

	$.ajax({
	    url: "http://localhost/fpk/4tree/oauth2/token.php",
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
	        console.info(data);
	        localStorage.setItem( "oauth2", JSON.stringify(data) );
	        jsGetMyFirstToken(); //попытка первого входа
	    },
	    abort: function (data) {
	        console.log(data);
	        console.log("abort");
	    },
	    error: function (data) {
	        console.log("error");
	        //console.info(data.responseText);
	        $('#password').animate({'margin-left':-15},100).animate({'margin-left':5},100).animate({'margin-left':-15},100).animate({'margin-left':0},50);
	    }
	});


}

</script>

</head>

<body>


<div id="login_form">
<h1>4tree</h1>
<br>
	<input id="email" type="email" placeholder="Адрес электронной почты"><br>

	<input id="password" type="password" placeholder="Пароль"><br><br>
	<div id="login_please">вход</div>

	<div id="social" style="" title="Вход через соц.сервисы">
<!--	<script src="//ulogin.ru/js/ulogin.js"></script> -->
	<div id="uLogin" data-ulogin="display=small;fields=first_name,email;optional=photo,phone,bdate,sex,city,country,photo_big;providers=vkontakte,google,odnoklassniki,mailru,facebook,yandex,twitter;hidden=other;redirect_uri=http%3A%2F%2F4tree.ru%2F4tree.php"></div>
	</div>		

</div>


<div id="registrate_form">
	<div id="reg_please">Регистрация на 4tree</div>

</div>
	<div id="forget_password">забыл пароль</div>



</body>