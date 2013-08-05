<html lang="ru" manifest="">
<meta name="viewport" content="width=device-width, initial-scale=1,user-scalable=no"> 
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=utf-8">
<meta charset="utf-8">
<head>

<?
require_once("db.php");
//qragowhget
$db2 = new PDO('mysql:dbname=h116;host=localhost;charset=utf8', $config["mysql_user"], $config["mysql_password"]);
$db2 -> exec("set names utf8");
$db2->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
$db2->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);  
  

  if( isset($_POST['token']) ) {
		$s = file_get_contents('http://ulogin.ru/token.php?token=' . @$_POST['token'] . '&host=' . $_SERVER['HTTP_HOST']);
		$user = json_decode($s, true);
		
		

		////устанавливаем выбранную социальную сеть в текущий аккаунт
		$key = array_keys($_GET);
		if( stristr($key[0], "set_to") ) {
		    $token = str_replace("set_to_current_account_", "", $key[0]);
		    //echo $token;

			$stmt = $db2->prepare('SELECT * from oauth_access_tokens WHERE access_token = :token');        
    		$stmt->execute( array( ":token" => $token ) );        
    		$result = $stmt->fetch();
    		  
    		$user_id = $result["user_id"];
			$answer_id = mySaveToSocial($user_id,$user,null,$db2);
			//echo $answer_id;
		}

		if(@!$user["error"] AND startsWith($_SERVER["HTTP_REFERER"],"http://ulogin.ru/http.html?")) {
			//если пользователь существует, входим
			$token_text = user_exist($user,$db2);
			
			if( $token_text == "") {
			//create_new_user($user, $db2);
				if( !isset($_GET['reg_me']) ) {
				
				
				
					if( isset($_GET['set_to_current_account']) ) {
						echo "<center style='margin: 63px;position: absolute;width: 300px;left: 50%;margin-left: -150px;color: #CCC;font-size: 10px;'>Связываю соц.сервис с вашим акканутом</center>";	
																		
												
						
					} else {				
						echo "<center style='margin: 63px;position: absolute;width: 300px;left: 50%;margin-left: -150px;color: #CCC;font-size: 10px;'>Ваш аккаунт не связан с этим социальным сервисом.<br>Зарегистрируйтесь в 4tree с паролем и свяжите аккаунт с соц.сервисом в меню настройки.</center>";
					}
				} else {
					echo "<center style='margin: 63px;position: absolute;width: 300px;left: 50%;margin-left: -150px;color: #CCC;font-size: 10px;'>Создаём вам аккаунт связанный с выбранным соц.сервисом.</center>";
					create_new_user($user,$db2);					
				}
			} else {
				
			}

		}	
  }
	


?>

<link rel="shortcut icon" href="favicon1.png" type="image/x-icon" />
<link rel="icon" href="favicon1.png" type="image/x-icon" />

<title>4tree.ru — вход в систему</title>
<meta name="description" content="Сайт для ведения дел, заметок, календаря и так далее. Инструмент таймменеджмента, где всё нужное собранно в одном месте."/>
<meta name="keywords" content="gtd, 4tree.ru, заметки, задачи, гтд, таймменеджмент, хранение заметок, календарь"/>
<meta name="viewport" content="width=device-width">

<style>

#login_page,#reg_page {
height: 100%;
width: 100%;
}

#login_form {
	margin: 0 auto;
	display: inline-block;
	left: 50%;
	position: absolute;
	margin-left: -125px;
	top:50%;
	margin-top: -145px;
	height: 200px;
	width: 250px;
}

.send_button {
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

.send_button.active {
	color: #000;
    -webkit-transition: all 0.3s;
    -moz-transition: all 0.3s;
    -o-transition: all 0.3s;
    transition: all 0.3s;	
}


.send_button.active:hover {
-moz-box-shadow: 0px 1px 2px rgb(64,64,64);
-webkit-box-shadow: 0px 1px 2px rgb(64,64,64);
box-shadow: 0px 1px 2px rgb(64,64,64);
-ms-filter: "progid:DXImageTransform.Microsoft.Shadow(Strength=4, Direction=135, Color='#444444')";
filter: progid:DXImageTransform.Microsoft.Shadow(Strength=4, Direction=135, Color='#444444');
}

.send_button:active {
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

.reg_or_login {
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

.reg_or_login:hover {
-moz-box-shadow: 0px 0px 2px rgb(64,64,64);
-webkit-box-shadow: 0px 0px 2px rgb(64,64,64);
box-shadow: 0px 0px 2px rgb(64,64,64);
-ms-filter: "progid:DXImageTransform.Microsoft.Shadow(Strength=4, Direction=135, Color='#444444')";
filter: progid:DXImageTransform.Microsoft.Shadow(Strength=4, Direction=135, Color='#444444');

}

.bottom_link {
	position: absolute;
	bottom: 10px;
	text-decoration: underline;
	font-size: 12px;
	left:50%;
	margin-left: -100px;
	width: 200px;
	text-align: center;
	color:  rgba(255,255,255,0.5);
	display: inline-block;
	cursor: pointer;
}
.bottom_link:hover {
    -webkit-transition: all 0.3s;
    -moz-transition: all 0.3s;
    -o-transition: all 0.3s;
    transition: all 0.3s;	
	color:  rgba(255,255,255,1);
}


body {
font-size: 14px;
margin:0px;
padding: 0px;
font-family: verdana, arial;
position: relative;	
overflow: hidden;

background: rgb(41,154,11); /* Old browsers */
/* IE9 SVG, needs conditional override of 'filter' to 'none' */
background: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/Pgo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgdmlld0JveD0iMCAwIDEgMSIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+CiAgPHJhZGlhbEdyYWRpZW50IGlkPSJncmFkLXVjZ2ctZ2VuZXJhdGVkIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY3g9IjUwJSIgY3k9IjUwJSIgcj0iNzUlIj4KICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMyOTlhMGIiIHN0b3Atb3BhY2l0eT0iMSIvPgogICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjNGI5OTM1IiBzdG9wLW9wYWNpdHk9IjEiLz4KICA8L3JhZGlhbEdyYWRpZW50PgogIDxyZWN0IHg9Ii01MCIgeT0iLTUwIiB3aWR0aD0iMTAxIiBoZWlnaHQ9IjEwMSIgZmlsbD0idXJsKCNncmFkLXVjZ2ctZ2VuZXJhdGVkKSIgLz4KPC9zdmc+);
background: -moz-radial-gradient(center, ellipse cover,  rgba(41,154,11,1) 0%, rgba(75,153,53,1) 100%); /* FF3.6+ */
background: -webkit-gradient(radial, center center, 0px, center center, 100%, color-stop(0%,rgba(41,154,11,1)), color-stop(100%,rgba(75,153,53,1))); /* Chrome,Safari4+ */
background: -webkit-radial-gradient(center, ellipse cover,  rgba(41,154,11,1) 0%,rgba(75,153,53,1) 100%); /* Chrome10+,Safari5.1+ */
background: -o-radial-gradient(center, ellipse cover,  rgba(41,154,11,1) 0%,rgba(75,153,53,1) 100%); /* Opera 12+ */
background: -ms-radial-gradient(center, ellipse cover,  rgba(41,154,11,1) 0%,rgba(75,153,53,1) 100%); /* IE10+ */
background: radial-gradient(ellipse at center,  rgba(41,154,11,1) 0%,rgba(75,153,53,1) 100%); /* W3C */
filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#299a0b', endColorstr='#4b9935',GradientType=1 ); /* IE6-8 fallback on horizontal gradient */
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


.email {
	border-top-left-radius: 10px;
	border-top-right-radius: 10px;
	border-bottom: 1px solid #888;
	box-shadow: inset 2px 2px 3px rgba(0,0,0,0.4);
	-webkit-box-shadow: inset 2px 2px 3px rgba(0,0,0,0.4);
}

.password {
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
	color: rgba(255,255,255,0.7);
	font-size: 23px;
	margin: 0px;
	font-weight: bold;
	font-family: Verdana;
text-shadow: 0px -1px 1px rgba(0,0,0,0.9);
	cursor: pointer;
	word-wrap: break-word;
}

h1:hover {
    -webkit-transition: all 0.3s;
    -moz-transition: all 0.3s;
    -o-transition: all 0.3s;
    transition: all 0.3s;	
	color: rgba(255,255,255,0.7);
}

#social {
	position: absolute;
	top:0px;
	left: 50%;
	margin-left: -175px;
    -webkit-transition: all 0.3s;
    -moz-transition: all 0.3s;
    -o-transition: all 0.3s;
    transition: all 0.3s;	
	width:350px;
	height:20px;
	margin-top:19px;
	text-align: center;
}

#social label {
	font-size: 12px;
	color:  rgba(255,255,255,0.7);
	margin-bottom: 5px;
	display: inline-block;
}




</style>

<script src="./js/jquery-1.8.2.js"></script>
<script src="js/jquery.cookie.min.js"></script>
<script src="js/ydn.db-jquery-0.7.5.js"></script>
<script src="js/md5.js"/></script>
<script src="js/login.js"/></script>

<script>
$(document).ready(function(){
    db = new ydn.db.Storage('_all_tree');   

	token_text = '<? if($token_text) echo $token_text; ?>';
	if(token_text) {
	    var data = JSON.parse(token_text);
		localStorage.setItem( "oauth2", JSON.stringify(data) );
        jsClearCurrentBase().done(function(){  //стираю данные
	        jsGetMyFirstToken(); //попытка первого входа
	    });
	}
	<? 
	 
	 if(isset($_GET["change_pass"])) {

		 $stmt = $db2->prepare('SELECT * from tree_users WHERE forget_password = :forget_password');        
		 $stmt->execute( array( ":forget_password" => $_GET["change_pass"] ) );        
		 $result = $stmt->fetch();


		 $email = $result["email"];
		 
		 if($result) {
			 echo "forget_email = '".$email."'; ";
			 echo "change_pass = '".$_GET["change_pass"]."'; ";
	     } else {
		     echo "alert('Ссылка для смены пароля устарела'); ";
	     }
	 } else {
			 echo "forget_email = ''; ";
	 }
		
	?>


	if(!forget_email) {
	var email = localStorage.getItem("email");
	} else {
		email = forget_email;
		$("h1").html("Введите новый пароль");
		document.title = "4tree — смена пароля";
		$("#login_please").html("установить новый пароль");
	}
	
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
		if(!forget_email) {
		  jsLogin();	
		} else {
		  jsNewPass().done(function(){
			  jsLogin();
		  });
		}
		
		return false;
	});

	$("#reg_please").on("click",function(e){
		//jsGetMyFirstToken();
		jsClearCurrentBase().done(function(){
			jsReg();
		});
		return false;
	});


	$("#forget_password").on("click",function(e){
		if( /@/.test( $("#email").val() ) ) {
			jsRemindMePassword();
		} else {
			$("#email").attr("placeholder","Сначала введите адрес");
			setTimeout(function(){
				$("#email").attr("placeholder","Адрес электронной почты");
			}, 5000);
			$("#email").focus();
		}
		return false;
	});
	
	$(".reg_or_login").on("click",function(e){
		if( $("#reg_page").is(":visible") ) {
			$("#reg_page").hide();
			$("#login_page").show();
			$("#social label").html("вход с помощью:");
			$("iframe").each(function(){
				$(this).attr("src", $(this).attr("src").replace("reg_me", "login_me") );
			});
			document.title = "4tree.ru — вход";
			if( $("#email").val().length ) {
			    $("#password").focus();
			} else {
			    $("#email").focus();
			}
		} else {
			$("#reg_page").show();
			$("#login_page").hide();
			$("#social label").html("регистрация с помощью:");
			$("iframe").each(function(){
				$(this).attr("src", $(this).attr("src").replace("login_me", "reg_me") );
			});
			document.title = "4tree.ru — регистрация";
			$(".email:visible").focus();
		}
		return false;
	});
	





});


function jsNewPass() {
	var dfd = new $.Deferred();
	
	var pass = $("#password").val();
	if(pass.length<3) {
		$("#login_page h1").html("Слишком короткий пароль");
		dfd.resolve();
		return dfd.promise();
	}
	var passw = hex_md5(pass);

	var params_get = 'remind_me_password='+forget_email+'&new_pass='+
					  passw+'&forget_code='+change_pass+'&secret='+Math.random();
									

	$.ajax({
	    url: "./do.php",
	    type: "GET",
	    dataType: "json",
	    jsonp: false,
	    cache: false,
	    contentType: "application/x-www-form-urlencoded; charset=UTF-8",
	    data: params_get,
	    processData: false,
	    cache: true,
	    success: function (data) {
		    $("#login_page h1").html("Пароль установлен");
		    dfd.resolve();
	    },
	    abort: function (data) {
	        console.log("abort");
	    },
	    error: function (data) {
	        console.log("error");
	        //console.info(data.responseText);
	        $('#email').animate({'margin-left':-15},150).animate({'margin-left':5},150).animate({'margin-left':-15},150).animate({'margin-left':0},75);
	    }
	});

	return dfd.promise();
}


function jsClearCurrentBase() { //очищаем существующую базу данных
   	var d=$.Deferred();

   	if( JSON.stringify(db.getSchema().stores).indexOf('tree') != -1 ) //если таблицы tree нет
       	db.clear().done(function(){ console.info("db cleared"); d.resolve(); }).fail(function(x){
	       	alert(1);
       	});
       else {
 	    console.info("db cleared"); d.resolve();
       }
       	
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

   	return d.promise();
}



function jsRemindMePassword() {

    $("#login_page h1").html("Отправляю...");

	var email = encodeURIComponent( $("#email").val() )
	var params_get = 'remind_me_password='+email+'&secret='+Math.random();

	$.ajax({
	    url: "./do.php",
	    type: "GET",
	    dataType: "json",
	    jsonp: false,
	    cache: false,
	    contentType: "application/x-www-form-urlencoded; charset=UTF-8",
	    data: params_get,
	    processData: false,
	    cache: true,
	    success: function (data) {
		    $("#login_page h1").html("Проверьте почту");
	    },
	    abort: function (data) {
	        console.log("abort");
	    },
	    error: function (data) {
	        console.log("error");
	        //console.info(data.responseText);
	        $('#email').animate({'margin-left':-15},150).animate({'margin-left':5},150).animate({'margin-left':-15},150).animate({'margin-left':0},75);
	    }
	});

}

//curl http://localhost/fpk/4tree/oauth2/resource.php -d 'access_token=bdc76b02741a0f1faee803cd8ec5d712ac538331'
//curl -u testclient:testpass http://localhost/fpk/4tree/oauth2/token.php -d 'grant_type=client_credentials&code=2db11b2d10f60a07a1038c5ebc06b8c4fc15d0d7'  - получение TOKEN
//curl -u testclient:testpass http://localhost/token.php -d 'grant_type=authorization_code&code=YOUR_CODE'
//curl http://localhost/fpk/4tree/oauth2/token.php -d 'grant_type=password&username=fuck&password=fuck&user_id=66&client_secret=87e7c51b7a7e50cdf2e78670557c18a4&client_id=fuck'


//grant_type=password&username=fuck&password=fuck&user_id=66&client_secret=87e7c51b7a7e50cdf2e78670557c18a4&client_id=fuck';
function jsLogin(email1, password) {
	var email = $("#email").val();
	var pass = $("#password").val();

	var md5email = email1?email1:hex_md5(email+'990990');
	var passw = password?password:hex_md5(pass);


var params_get = 'grant_type=password&username='+md5email+
									'&password='+passw+
									'&client_id=4tree_web'+
									'&client_secret=4tree_passw'+
									'&secret='+Math.random();
									

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
	        console.info(data);
	        localStorage.setItem( "oauth2", JSON.stringify(data) );
            jsClearCurrentBase().done(function(){  //стираю данные
		        jsGetMyFirstToken(); //попытка первого входа
		    });
	    },
	    abort: function (data) {
	        console.log(data);
	        console.log("abort");
	    },
	    error: function (data) {
	        console.log("error");
	        //console.info(data.responseText);
	        $('#password').animate({'margin-left':-15},150).animate({'margin-left':5},150).animate({'margin-left':-15},150).animate({'margin-left':0},75);
	    }
	});


}



</script>

</head>

<body>


		<div id="social" style="" title="">
		<label>вход с помощью:</label>
		<script src="//ulogin.ru/js/ulogin.js" async></script> 
		<div id="uLogin" data-ulogin="display=small;fields=first_name,email;optional=photo,phone,bdate,sex,city,country,photo_big;providers=vkontakte,google,odnoklassniki,mailru,facebook,yandex,twitter;hidden=other;redirect_uri=http://4tree.ru/login.php?login_me"></div>
		<!-- http%3A%2F%2F4tree.ru%2F4tree.php -->
		</div>		


<div id="reg_page" style="display:none;">
	
	
	<div id="login_form">
	<h1>Регистрация</h1>
	<br>
		<input id="email_reg" class="email" type="email" placeholder="Адрес электронной почты"><br>
	
		<input id="password_reg" class="password" type="password" placeholder="Пароль"><br><br>
		<div id="reg_please" class="send_button">создать аккаунт</div>
	
	</div>
	
	
	<div id="registrate_form">
		<div id="to_login_page" class="reg_or_login">Войти</div> 
	
	</div>
<!--		<div id="to_login_page" class="bottom_link">Войти в 4tree</div>  -->
</div>

<!-- //////////////////////////////////////////////// -->

<div id="login_page" style="display:block;">	
	
	<div id="login_form">
	<h1>Вход</h1>
	<br>
		<input id="email" type="email" class="email" placeholder="Адрес электронной почты"><br>
	
		<input id="password" type="password" class="password" placeholder="Пароль"><br><br>
		<div id="login_please" class="send_button">вход</div>
	
	</div>
	
	
	<div id="registrate_form">
		<div id="reg_please" class="reg_or_login">Регистрация на 4tree</div>
	
	</div>
		<div id="forget_password" class="bottom_link">забыл пароль</div>
</div>



</body>