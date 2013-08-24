<html lang="ru" manifest="">
<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1,user-scalable=no"> 
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
		$s = file_get_contents('https://ulogin.ru/token.php?token=' . @$_POST['token'] . '&host=' . $_SERVER['HTTP_HOST']);
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

		if(@!$user["error"] AND startsWith($_SERVER["HTTP_REFERER"],"https://ulogin.ru/")) {
			//если пользователь существует, входим
			
			$token_text = user_exist($user,$db2);
			
//			echo "YES".$token_text;
			
			if( $token_text == "") {
			//create_new_user($user, $db2);
				if( !isset($_GET['reg_me']) ) {
				
				
				
					if( isset($_GET['set_to_current_account']) ) {
						echo "<center style='margin: 63px;position: absolute;width: 300px;left: 50%;margin-left: -150px;color: #CCC;font-size: 10px;'>Связываю соц.сервис с вашим акканутом.</center>";	
																		
												
						
					} else {				
						echo "<center style='margin: 63px;position: absolute;width: 300px;left: 50%;margin-left: -150px;color: #CCC;font-size: 10px;'>Ваш аккаунт не связан с этим социальным сервисом.<br>Зарегистрируйтесь в 4tree с паролем и свяжите аккаунт с соц.сервисом в меню настройки.</center>";
					}
				} else {
					echo "<center style='margin: 63px;position: absolute;width: 300px;left: 50%;margin-left: -150px;color: #CCC;font-size: 10px;'>Создаём вам аккаунт связанный с выбранным соц.сервисом.<br><b>Теперь можете войти через соц.кнопку.</b></center>";
					create_new_user($user,$db2);					
					$token_text = user_exist($user,$db2);
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

<link rel="stylesheet" type="text/css" href="css/login.css"/>
<link rel="stylesheet" type="text/css" href="fontello/css/fontello.css"/>

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

	$("#password_reg").on("keyup",function(e){
		if( $("#password_reg").val().length>1 ) {
			$("#reg_please").addClass("active");
			localStorage.setItem("email",$("#email").val());
		} else {
			$("#reg_please").removeClass("active");
		}
		if(e.keyCode == 13) {
			$("#reg_please").click();
		}
	});

	$("#password").on("keyup",function(e){
		if( $("#password").val().length>1 ) {
			$("#login_please").addClass("active");
			localStorage.setItem("email",$("#email").val());
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
		$("#registrate_form h5").html("Слишком короткий пароль");
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
		    $("#registrate_form h5").html("Пароль установлен");
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
   	var global_table_name = "4tree_db";

		 
    if( JSON.stringify(db.getSchema().stores).indexOf('tree') != -1 ) {//если таблицы tree нет


	db.clear(global_table_name+"_comments").done(function(){
	   	db.clear(global_table_name).done(function(){
		   	db.clear(global_table_name+"_texts").done(function(){
			   	 console.info("db cleared"); 
			   	 d.resolve(); 
			});
	    });
	});
       	
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
	} else {
		d.resolve(); 
	}

   	return d.promise();
}



function jsRemindMePassword() {

    $("#registrate_form h5").html("Отправляю...");

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
		    $("#registrate_form h5").html("Проверьте почту");
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


	if(/reg_me/ig.test(window.location.href)) {
		setTimeout(function(){ $("#reg_please2").click(); }, 0);
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

	<a id="go_home" href="index.php" title="Перейти на главную страницу"><i class="icon-home"></i></a>

	<div id="registrate_form">
		<div id="reg_please2" class="reg_or_login">Регистрация на 4tree</div>
		<h5></h5>
	</div>

<?				

if( isset($_GET['reg_me']) ) { 
	$reg_visible = "none"; 
	$log_visible = "block"; 	
	$social = "регистрация";
} else {
	$reg_visible = "none"; 	
	$log_visible = "block"; 	
	$social = "вход";
}
	
?>


<div id="reg_page" style="display:<? echo $reg_visible; ?>;">
	
	
	<div id="login_form">
	<h1>Регистрация</h1>
	<br>
		<input id="email_reg" class="email" type="email" placeholder="Адрес электронной почты"><br>
	
		<input id="password_reg" class="password" type="password" placeholder="Пароль"><br><br>
		<div id="reg_please" class="send_button">создать аккаунт</div>
	
	</div>
	
	
	<div id="registrate_form">
		<div id="to_login_page" class="reg_or_login">Вход в 4tree</div> 
	
	</div>
<!--		<div id="to_login_page" class="bottom_link">Войти в 4tree</div>  -->
</div>

<!-- //////////////////////////////////////////////// -->

<div id="login_page" style="display:<? echo $log_visible; ?>;">	
	
	<div id="login_form">
	<h1>Вход</h1>
	<br>
		<input id="email" type="email" class="email" placeholder="Адрес электронной почты"><br>
	
		<input id="password" type="password" class="password" placeholder="Пароль"><br><br>
		<div id="login_please" class="send_button">вход</div>
	
	</div>

</div>

		<div id="social" style="" title="">
		<label><? echo $social; ?> с помощью:</label>
		<script src="//ulogin.ru/js/ulogin.js" async></script> 
		<div id="uLogin" data-ulogin="display=panel;fields=first_name,email;optional=photo,phone,bdate,sex,city,country,photo_big;providers=google,vkontakte,facebook,mailru,twitter;hidden=other;redirect_uri=https://4tree.ru/login.php?login_me"></div>
		<!-- http%3A%2F%2F4tree.ru%2F4tree.php -->
		</div>		

		<div id="forget_password" class="bottom_link">забыл пароль</div>


</body>