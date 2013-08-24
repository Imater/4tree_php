<?
require_once("db.php");

$s = file_get_contents('http://ulogin.ru/token.php?token=' . @$_POST['token'] . '&host=' . $_SERVER['HTTP_HOST']);
$user = json_decode($s, true);
//$user = array( "uid" => "38346778", "bdate" => "12.5.1978", "network" => "vkontakte", "country" => "Россия ", "profile" => "http://vk.com/id38346778", "sex" => "2", "last_name" => "Вецель", "first_name" => "Евгений", "city" => "Челябинск", "identity" => "http://vk.com/id38346778", "photo_big" => "http://cs4480.vk.me/u38346778/a_7e2ce3e6.jpg", "photo" => "http://cs4480.vk.me/u38346778/e_8908007b.jpg", "email" => "eugene.leonar@gmail.com");

if( ($_SERVER["SERVER_ADDR"]!="127.0.0.1") AND ($_SERVER["HTTP_HOST"]!="localhost") AND ($_SERVER["HTTP_HOST"]!="192.168.0.52")) 
  push(array("am"),array('type' => "new_visit", 'from' => $fpk_id, 'txt' => "Визит <b title='".addslashes($_SERVER["HTTP_USER_AGENT"]." / ".$_SERVER["HTTP_COOKIE"])."'>".$_SERVER["REMOTE_ADDR"]."</b>"));


if(@!$user["error"] AND startsWith($_SERVER["HTTP_REFERER"],"http://ulogin.ru/http.html?")) {
//$user['network'] - соц. сеть, через которую авторизовался пользователь
//$user['identity'] - уникальная строка определяющая конкретного пользователя соц. сети
//$user['first_name'] - имя пользователя
//$user['last_name'] - фамилия пользователя
	$db2 = new PDO('mysql:dbname=h116;host=localhost;charset=utf8', $config["mysql_user"], $config["mysql_password"]);
	$db2 -> exec("set names utf8");
	$db2->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
	$db2->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	
	$db = mysql_connect ($config["mysql_host"], $config["mysql_user"], $config["mysql_password"]);
	mysql_query_my("SET NAMES utf8");

	mysql_select_db('h116',$db);   
	if (!$db) { echo "Ошибка подключения к SQL :("; exit();}
	
	if(isset($_GET["set_to_current_account"])) {
		$last_user_id = $_COOKIE['4tree_user_id'];
		$session_md5 = md5($user["identity"]."990990");
		$sqlnews = "DELETE FROM tree_users_social WHERE session_md5 = '".$session_md5."'";
		$result = mysql_query_my($sqlnews); 
		if($last_user_id AND mySaveToSocial($last_user_id,$user,$db,$db2)) user_exist($user, $db2);
	} else {
		if(user_exist($user, $db2) == false) create_new_user($user, $db2);
	}
	
}


		if(isset($_GET["part"])) {
			$part = $_GET["part"];
			if($part == "getting_started") {
				$include = "_getting_started.php";		
				$navbar = "navbar-fixed-top";
			}
		} else {
			$include = "_first_page.php";
			$navbar = "navbar-static-top";
		}


?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="ru" class="" style="" 

<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=utf-8">

<meta charset="utf-8">

<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="shortcut icon" href="favicon1.png" type="image/x-icon" />
<link rel="icon" href="favicon1.png" type="image/x-icon" />

<html>
  <head>
    <title>4tree.ru — мои дела</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Bootstrap -->
    <link href="bootstrap-3/css/bootstrap.css" rel="stylesheet" media="screen">
    <link href="bootstrap-3/css/carousel.css" rel="stylesheet" media="screen">
    <link href="css/my_web.css" rel="stylesheet" media="screen">
	<link rel="stylesheet" type="text/css" href="fontello/css/fontello.css"/>

    <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
    <script src="//code.jquery.com/jquery.js"></script>
    <!-- Include all compiled plugins (below), or include individual files as needed -->
    <script src="bootstrap-3/js/bootstrap.min.js"></script>

    <!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!--[if lt IE 9]>
      <script src="../../assets/js/html5shiv.js"></script>
      <script src="../../assets/js/respond.min.js"></script>
    <![endif]-->
    
    
  </head>
  
  
  
  
  
  
<!-- NAVBAR
================================================== -->
  <body data-spy="scroll" data-target="#navbar-example" data-offset="150">
  
      <script>
    
		  $(document).ready(function(){ //переход к хеш ссылке
			  $('a[href^="#"]').on('click',function (e) {
			      e.preventDefault();
			  
			      var target = this.hash,
			      $target = $(target);
			  
			      $('html, body').stop().animate({
			          'scrollTop': $target.offset().top - 60
			      }, 900, 'swing', function () {
			          window.location.hash = target;
			      });
			  });
			  
			  $(".nav li .active").removeClass("active");
			  setTimeout(function(){
			  
				  <? if($include == "_getting_started.php") echo ' $("#getting_started_li").addClass("active");' ?>
				  
			  }, 150);
		  
		  });
    
    </script>

  
<?
if( ($_SERVER["SERVER_ADDR"]!="127.0.0.1") AND ($_SERVER["HTTP_HOST"]!="localhost") AND ($_SERVER["HTTP_HOST"]!="192.168.0.52")) 
{
} else {
	echo "<script>document.write('<script src=\"http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1\"></' + 'script>')</script>";
	
}


		


?>
    <header class="navbar">

      

        <nav class="navbar navbar-inverse <? echo $navbar; ?>">
          <div class="container">
            <div class="navbar-header">
              <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
              </button>
              <a class="navbar-brand" href="./"><img src="favicon1.png" id="mylogo"> 4tree.ru</a>
            </div>
            <div class="navbar-collapse collapse">
              <ul class="nav navbar-nav">
                <li class="active"><a href="./">Главная</a></li>
                <li id="getting_started_li"><a href="./getting_started">Пошаговое руководство</a></li>
                <li class="dropdown" style="display:none;">
                  <a href="#" class="dropdown-toggle" data-toggle="dropdown">Ещё <b class="caret"></b></a>
                  <ul class="dropdown-menu">
                    <li class="dropdown-header">Что нового?</li>
                    <li><a href="#">Блог 4tree.ru</a></li>
                    <li><a href="#">Интересные статьи по ТМ</a></li>
                    <li class="divider"></li>
                    <li class="dropdown-header">Продвинутые возможности</li>
                    <li><a href="#">Горячие клавиши</a></li>
                    <li><a href="#">Часто задаваемые вопросы</a></li>
                    <li class="divider"></li>
                    <li class="dropdown-header">О сайте 4tree.ru</li>
					<li><a href="#docs">Тарифы</a></li>
					<li><a href="#docs">Конфеденциальность</a></li>
					<li><a href="#docs">Соглашение с пользователями</a></li>
                  </ul>
                </li>

                <li id="login_or_reg">       

		<?
		$last_user_id = $_COOKIE['4tree_user_id'];
		if($last_user_id) $index = "./home/index.php";
		else $index = "login.php?log";
		?>				

                	<a href="<? echo $index; ?>"><button type="button" class="btn btn-success">Войти</button></a>
				</li>

                <li id="reg_button">       
                	<a href="login.php?reg"><button type="button" class="btn btn-primary">Регистрация</button></a>
				</li>
				

              </ul>
            </div>
          </div>
        </nav>

    </header>




	<? 
		include "my".$include;
	?>
  
  
  
  
  
  
  
  
  
  </body>
</html>