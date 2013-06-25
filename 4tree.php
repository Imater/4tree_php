<?
function startsWith($haystack, $needle)
{
    return !strncmp($haystack, $needle, strlen($needle));
}

$s = file_get_contents('http://ulogin.ru/token.php?token=' . @$_POST['token'] . '&host=' . $_SERVER['HTTP_HOST']);
$user = json_decode($s, true);
//$user = array( "uid" => "38346778", "bdate" => "12.5.1978", "network" => "vkontakte", "country" => "Россия ", "profile" => "http://vk.com/id38346778", "sex" => "2", "last_name" => "Вецель", "first_name" => "Евгений", "city" => "Челябинск", "identity" => "http://vk.com/id38346778", "photo_big" => "http://cs4480.vk.me/u38346778/a_7e2ce3e6.jpg", "photo" => "http://cs4480.vk.me/u38346778/e_8908007b.jpg", "email" => "eugene.leonar@gmail.com");

if(true OR @!$user["error"] AND startsWith($_SERVER["HTTP_REFERER"],"http://ulogin.ru/http.html?")) {
//$user['network'] - соц. сеть, через которую авторизовался пользователь
//$user['identity'] - уникальная строка определяющая конкретного пользователя соц. сети
//$user['first_name'] - имя пользователя
//$user['last_name'] - фамилия пользователя
	require_once("db.php");
	$db2 = new PDO('mysql:dbname=h116;host=localhost;charset=utf8', $config["mysql_user"], $config["mysql_password"]);
	$db2 -> exec("set names utf8");
	$db2->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
	$db2->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	
	$db = mysql_connect ($config["mysql_host"], $config["mysql_user"], $config["mysql_password"]);
	mysql_query_my("SET NAMES utf8");

	mysql_select_db('h116',$db);   
	if (!$db) { echo "Ошибка подключения к SQL :("; exit();}
	

	if(user_exist($user, $db2) == false)	create_new_user($user, $db2);
	
}

function user_exist($user, $db2){
	$stmt = $db2->prepare("select * from tree_users_social where identity=:identity");
	$stmt->setFetchMode(PDO::FETCH_CLASS, 'User');
	$stmt->execute( array( ':identity' => $user["identity"] ) );
	$user_exist = $stmt->fetch();
	
	if($user_exist["user_id"]) {
		setcookie('4tree_email',@$user_exist["email"],time()+60*60*24*60);
		setcookie('4tree_email_md5',md5(@$user_exist["md5email"]."990990"),time()+60*60*24*60);
		setcookie('4tree_social_md5', @$user_exist["session_md5"],time()+60*60*24*60);
		setcookie('4tree_user_id',@$user_exist["user_id"],time()+60*60*24*60);
		echo "<script>document.location.href='./index.php';</script>";
		
		return true;
	} else {
		return false;	
	}
}

function create_new_user($user, $db2){
	//print_r($user);
	$sql11 = "INSERT INTO `tree_users` SET
	    	`fio` = :fio,
	    	`mobilephone` = :mobilephone,
	    	`email` = :email,
	    	`md5email` = :md5email,
	    	`confirm_email` = :confirm_email,
	    	`password` = :password,
	    	`reg_date` = :reg_date,
	    	`foto` = :foto,
	    	`frends` = :frends,
	    	`female` = :female,
	    	`lastvisit` = :lastvisit";
//	echo $sql11;
	$last_name = $user["last_name"]?$user["last_name"]." ":"";
	$fio = $last_name.$user["first_name"];
	
	$newpassword = substr(md5($user["identity"]."pass_990"),3,10);
	$code = '4tree_'.substr(md5($email),5,10);
	
	$values11 = array( 
	    	":fio" => 				$fio,
	    	":mobilephone" =>  		$user["mobilephone"]?$user["mobilephone"]:"",
	    	":email" => 			$user["email"]?$user["email"]:"",
	    	":md5email" => 	   		$user["email"]?md5($user["email"]):"",
	    	":confirm_email" => 	$user["email"]?$code:"",
	    	":password" => 			md5($passw."990990"),
	    	":reg_date" => 			date("Y-m-d H:i:s"),
	    	":foto" => 				$user["photo"]?$user["photo"]:"",
	    	":frends" =>			",11,",
	    	":female" => 			1,
	    	":lastvisit" => 		0
	        );
	        
	$query1 = $db2->prepare($sql11);
	$query1->execute($values11);
	$last_user_id = $db2->lastInsertId();
	
	if(!$last_user_id) {
		echo "Ошибка регистрации";
		return false;
	}
	
	if(stristr($user["email"],"@")) {
		//отправляю сгенерированный пароль
		$tree="<font color='#214516'>4</font><font color='#244918'>t</font><font color='#356d23'>r</font><font color='#42872c'>e</font><font color='#57b33a'>e</font>";
		
		mail($user["email"],'Вы только что зарегистрировались на 4tree.ru',"<font size='3em'>&nbsp;Привет,<br><br>Вы только что зарегистрировались на ".$tree.".<br>Чтобы подтвердить регистрацию, пожалуйста, пройдите по ссылке ниже:<br><a href='http://4tree.ru/?confirm=".$code."'><font size=5em><b>http://4tree.ru/?confirm=".$code."</b></font></a></font><br><br><br>Желаю успехов в делах, ваш ".$tree.".<br><br><br>PS: Между прочим, вы регистрировались через ".$user["network"].",<br>поэтому мы сгенерировали вам пароль сами: <b>".$newpassword."</b>",
   		"From: 4tree-mailer <noreply@4tree.ru>\r\nContent-type: text/html; charset=utf8\r\n");
		
	}
	
//	echo "<hr>$last_id<hr>";


	//1. save_to tree_users_social
	$sql11 = "INSERT INTO `tree_users_social` SET
	    	`user_id` = :user_id,
	    	`network` = :network,
	    	`identity` = :identity,
	    	`uid` = :uid,
	    	`bdate` = :bdate,
	    	`country` = :country,
	    	`profile` = :profile,
	    	`last_name` = :last_name,
	    	`first_name` = :first_name,
	    	`city` = :city,
	    	`photo_big` = :photo_big,
	    	`photo` = :photo,
	    	`session_md5` = :session_md5,
	    	`fio` = :fio,
	    	`email` = :email,
	    	`sex` = :sex";
//	echo $sql11;
		
	$values11 = array( 
	    	":user_id" => 		$last_user_id,
	    	":network" =>  		$user["network"],
	    	":identity" => 		$user["identity"],
	    	":uid" => 	   		$user["uid"],
	    	":bdate" => 		$user["bdate"],
	    	":country" => 		$user["country"],
	    	":profile" => 		$user["profile"],
	    	":last_name" => 	$user["last_name"],
	    	":first_name" =>	$user["first_name"],
	    	":city" => 			$user["city"],
	    	":photo_big" => 	$user["photo_big"],
	    	":photo" => 		$user["photo"],
	    	":session_md5"=>	$user["session_md5"],
	    	":fio" => 			$user["fio"],
	    	":email" => 		$user["email"],
	    	":sex" => 			$user["sex"],
	    	":session_md5" =>	md5($user["identity"]."990990")
	        );
	        
	$query1 = $db2->prepare($sql11);
	$query1->execute($values11);
	$last_id = $db2->lastInsertId();

	
//	echo "<h1>$last_user_id</h1>";

	$sql = "";
	$sql["id"] = 219;//6570
	mySelectBranch($sql,1,$last_user_id);

	
//	echo "<hr>$last_id<hr>";
	
	
	//2. create in tree_users
}
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=utf-8">
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width">

<html>
<head>
<title>4tree.ru — мои дела</title>

<link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
<link rel="icon" href="favicon.ico" type="image/x-icon" />


<link rel="stylesheet" type="text/css" href="css/4tree.css">
<link rel="stylesheet" type="text/css" href="js/pwdwidget.css">

<script src="js/jquery.js"/></script>
<script src="js/4tree.js"/></script>
<script src="jstree/_lib/jquery.cookie.js"/></script>
<script src="js/pwdwidget.js"/></script>
<script src="js/ztx-ydn.db-dev-0.6.2.js"/></script>


<?
/*
require_once('compress_timestamp.php');         //load timestamp created by compress.php module sets field $compress_stamp=unix_timestamp                                       
if (stripos($_SERVER['HTTP_ACCEPT_ENCODING'],'GZIP')!==false)   
        $gz='gz';
 else
        $gz=null;
echo '<link rel="stylesheet" type="text/css" href="min/4tree_'.$compress_stamp.'.css'.$gz.'" />',PHP_EOL;
echo '<script src="min/4tree_'.$compress_stamp.'.js'.$gz.'" /></script>',PHP_EOL;
*/
?>


<script type="text/javascript">
<? if (isset($HTTP_GET_VARS['fpk_id'])) echo "$.cookie('fpk_id',".$HTTP_GET_VARS['fpk_id'].");" ?>

$(document).ready(jsDoFirst); 
</script>



</head>


<body>
<div id="fade"></div>
<div id="header">
	<div id="logo"><img src="img/4tree-logo.png" width="498" height="150"></div>
	<div id="login">
		<a href="#" id="login_now">Вход</a><br>
		<div id="login_form" class="myform">
		  <h2>для входа введите:</h2>
		  email: <input id="email_login" placeholder="4tree@4tree.ru" type="email" name="email"><br>

		<label for='regpwd'>Пароль:</label> <br />
		<input type='password' id='log_pas' name='regpwd' />		

		  <br><span id="log_error"></span><span id="reremember" title="Если забыли пароль, не беда. Нажмите кнопку и я вышлю вам ссылку для восстановления пароля на почту">забыл</span>
		  <br><span id="login_ok" title="вход на сайт">войти</span>
		</div>



		<a href="#" id="reg_now">Регистрация (открыта)</a>

<div id="social" style="width:180px;height:20px;">
<script src="//ulogin.ru/js/ulogin.js"></script>
<div id="uLogin" data-ulogin="display=small;fields=first_name,email;optional=photo,phone,bdate,sex,city,country,photo_big;providers=vkontakte,google,odnoklassniki,mailru,facebook,yandex,twitter;hidden=other;redirect_uri=http%3A%2F%2F4tree.ru%2F4tree.php"></div>
</div>		
		<div id="reg_form" class="myform">
		  <h2>всего 2 поля:</h2>
		  email: <input id="reg_email" placeholder="4tree@4tree.ru" type="email" name="email"><br>

		<label for='regpwd'>Пароль:</label> <br />
		<div class='pwdwidgetdiv' id='thepwddiv'></div>
		<script  type="text/javascript" >
		var pwdwidget = new PasswordWidget('thepwddiv','regpwd');
		pwdwidget.MakePWDWidget();
		</script>
		<noscript>
		<div><input type='password' id='regpwd' name='regpwd' /></div>		
		</noscript>

		  <br><span id="reg_error"></span>
		  <br><span id="reg_ok" title="Регистрация">зарегистрироваться</span><br>
		</div>
		
	</div>
</div>

<div id="content">
  <div id="lozung">
  Мы заботимся о ваших деревьях,<br> чтобы у вас оставалось время строить и воспитывать…
  <br><br>
  <img src="http://upload.4tree.ru/data/u11/06-2013/clip_750_fc1baf3e.png" width="530" height="410">
  </div>
</div>

<div id="white">
  <div id="air"><img src="http://upload.4tree.ru/data/u11/06-2013/clip_4152_1ff1f204.png" width="417" height="250"></div>
<p>дела + календарь + заметки<br>
всё в одном дереве</p>
</div>

<div id="green">
<center><b>Всё в одном дереве:</b></center>
<ul>
<li>Дела</li>
<li>SMS напоминания</li>
<li>Календарь</li>
<li>Карта ума</li>
<li>Wiki</li>
<li>Html редактор</li>
<li>Сворачивающийся дневник</li>
<li>Таймер Pomodorro</li>
<li>Отправка заметок короткой ссылкой</li>
<li>Загрузка фотографий и документов</li>
<li>Ваши письма из электронной почты</li>
<li>Статьи из интернета</li>
<li>Комментарии к вашим заметкам и делам</li>
</ul>
</div>

<div id="white">
<h1>Видео-обзор сервиса 4tree.ru</h1>
<iframe width="640" height="390" src="http://www.youtube.com/embed/q6noLA6XwRw" frameborder="0" allowfullscreen></iframe>
</div>

<div id="green">
<center><b>Online/offline:</b></center>
<ul>
<li>Работает в любом браузере</li>
<li>Хранит данные на вашем компьютере</li>
<li>Может работать без интернета</li>
<li>Синхронизируется с сервером</li>
<li>PUSH технологии мгновенного обновления</li>
<li>Работает мгновенно</li>

</ul>
</div>

<div id="white" class="some_more">
<center><b>HTML редактор:</b></center><br>
<img src="http://upload.4tree.ru/data/u11/06-2013/clip_9375_e99fe479.png" width="400px" align="left">Текстовый html редактор.<br>
Позволяет писать и украшать тексты форматированием. Вы можете добавить картинки не только из файла, но и из буфера обмена.<br><br>
Вы можете комментировать собственные записи и отвечать на эти комментарии. Вы можете использовать редактор как дневник. Заметка сегодняшнего дня создаётся автоматически и доступна при помощи горячей клавиши.<br><br>
В правом нижнем углу — можно заметить таймер, который можно заводить мышкой. Этот таймер настроен на работу с симтемой Pomodorro (25 минут работы, потом 5 минут перерыв. Каждые 4 "помидорки" 15 минутный отдых).<br><br>
Вы можете вставлять в редактор статьи с других сайтов, даже если они включают в себя картинки и таблицы.
</div>

<div id="green" class="some_more">
<center><b>Календарь:</b></center><br>
<img src="http://upload.4tree.ru/data/u11/06-2013/clip_1448_80c8e22d.png" width="400px" align="left">Может отображать данные в режиме месяца, недели и дня.<br><br>
Поддерживает перетаскивание дел с даты на дату. Дело можно переместить из дерева в календарь. При клике в дело календаря, эта заметка откроется и в дереве и в редакторе.<br><br>
Текущее время отображается красной чертой.<br><br>
Слева переключатели на: панель картинок и файлов, новости и поиск.<br><br>
В поиске можно не только искать нужные слова, но и считать арифметические выражения.
</div>

<div id="white" class="some_more">
<center><b>3 режима отображения дерева:</b></center><br>
<center>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Панельный режим:<br>
<img src="http://upload.4tree.ru/data/u11/06-2013/clip_9087_31a9bd91.png" width="650px" align="center">
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Режим дерева:<br>
<img src="http://upload.4tree.ru/data/u11/06-2013/clip_6517_5d22e5da.png" width="650px" align="center">
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Режим карты ума:<br>
<img src="http://upload.4tree.ru/data/u11/06-2013/clip_8580_658cb30a.png" width="650px" align="center">
</center>
Любую заметку дерева можно превратить в папку, просто добавив в неё элементы при помощи клавиш alt+вправо.<br><br>
При добавлении новых дел или переименовании старых, вы можете написать "позвонить через 3 дня в 10:50 напомнить", эта фраза расшифруется и делу присвоится соответствующая дата.<br><br>
Вы можете создать собственную структуру дел, основанную, например, на технологии Getting Things Done (GTD). Дела по дереву можно перетаскивать мышкой.<br><br>Всё что вы напишите БОЛЬШИМИ буквами, автоматически добавится в панель избранных над деревом. При клике в избранные, эта папка открывается в дереве, календаре и редакторе.<br><br>
При клике мышкой в синюю папку рядом с делом, в редактор загружаются все заметки этой папки. Вы можете редактировать несколько заметок одновременно.<br><br>
Дата следующего действия транслируется на все родительские папки. Если кликнуть на эту дату, открывается дело, дата которого ближайшая.
</div>

<div id="green" class="some_more" style="height:600px !important;">
<center>Добро пожаловать на альфа-тестирование 4tree.<br><br>
<img src="http://upload.4tree.ru/data/u11/06-2013/clip_8495_e5256a80.png" width="650px" align="center"></center>
</div>


<div id="bubu" style="display:none"></div>

<!-- Yandex.Metrika counter -->
<script type="text/javascript">
(function (d, w, c) {
    (w[c] = w[c] || []).push(function() {
        try {
            w.yaCounter21558199 = new Ya.Metrika({id:21558199,
                    webvisor:true,
                    clickmap:true,
                    trackLinks:true,
                    accurateTrackBounce:true,
                    trackHash:true});
        } catch(e) { }
    });

    var n = d.getElementsByTagName("script")[0],
        s = d.createElement("script"),
        f = function () { n.parentNode.insertBefore(s, n); };
    s.type = "text/javascript";
    s.async = true;
    s.src = (d.location.protocol == "https:" ? "https:" : "http:") + "//mc.yandex.ru/metrika/watch.js";

    if (w.opera == "[object Opera]") {
        d.addEventListener("DOMContentLoaded", f, false);
    } else { f(); }
})(document, window, "yandex_metrika_callbacks");
</script>
<noscript><div><img src="//mc.yandex.ru/watch/21558199" style="position:absolute; left:-9999px;" alt="" /></div></noscript>
<!-- /Yandex.Metrika counter -->

</body>



</html>