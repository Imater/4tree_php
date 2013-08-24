<?
require_once("db.php");

$s = file_get_contents('http://ulogin.ru/token.php?token=' . @$_POST['token'] . '&host=' . $_SERVER['HTTP_HOST']);
$user = json_decode($s, true);
//$user = array( "uid" => "38346778", "bdate" => "12.5.1978", "network" => "vkontakte", "country" => "Россия ", "profile" => "http://vk.com/id38346778", "sex" => "2", "last_name" => "Вецель", "first_name" => "Евгений", "city" => "Челябинск", "identity" => "http://vk.com/id38346778", "photo_big" => "http://cs4480.vk.me/u38346778/a_7e2ce3e6.jpg", "photo" => "http://cs4480.vk.me/u38346778/e_8908007b.jpg", "email" => "eugene.leonar@gmail.com");

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

<script src="js/jquery-1.10.1.min.js"></script>
<script src="js/md5.js"/></script>
<script src="js/4tree.js"/></script>
<script src="js/jquery.cookie.min.js"/></script>


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
		<?
		
		$last_user_id = $_COOKIE['4tree_user_id'];
		if($last_user_id)
		echo '
		<a href="./home/index.php" id="login_now" style="font-size:11px;float:right;margin-bottom:10px;">Вход в открытое дерево</a><br>
		';
		?>
		<a href="./login.php?login_me" id="login_now">Вход</a><br>
    <a href="./login.php?reg_me" id="login_now">Регистрация</a><br>
	</div>
</div>

<div id="content">
  <div id="lozung">
  Мы заботимся о ваших деревьях,<br> чтобы у вас оставалось время строить и воспитывать…
  <br><br>
  <img src="./img/mainpage/clip_750_fc1baf3e.png" width="530" height="410">
  </div>
</div>

<div id="white">
  <div id="air"><img src="./img/mainpage/clip_4152_1ff1f204.png" width="417" height="250"></div>
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
<img src="./img/mainpage/clip_9375_e99fe479.png" width="400px" align="left">Текстовый html редактор.<br>
Позволяет писать и украшать тексты форматированием. Вы можете добавить картинки не только из файла, но и из буфера обмена.<br><br>
Вы можете комментировать собственные записи и отвечать на эти комментарии. Вы можете использовать редактор как дневник. Заметка сегодняшнего дня создаётся автоматически и доступна при помощи горячей клавиши.<br><br>
В правом нижнем углу — можно заметить таймер, который можно заводить мышкой. Этот таймер настроен на работу с симтемой Pomodorro (25 минут работы, потом 5 минут перерыв. Каждые 4 "помидорки" 15 минутный отдых).<br><br>
Вы можете вставлять в редактор статьи с других сайтов, даже если они включают в себя картинки и таблицы.
</div>

<div id="green" class="some_more">
<center><b>Календарь:</b></center><br>
<img src="./img/mainpage/clip_1448_80c8e22d.png" width="400px" align="left">Может отображать данные в режиме месяца, недели и дня.<br><br>
Поддерживает перетаскивание дел с даты на дату. Дело можно переместить из дерева в календарь. При клике в дело календаря, эта заметка откроется и в дереве и в редакторе.<br><br>
Текущее время отображается красной чертой.<br><br>
Слева переключатели на: панель картинок и файлов, новости и поиск.<br><br>
В поиске можно не только искать нужные слова, но и считать арифметические выражения.
</div>

<div id="white" class="some_more">
<center><b>3 режима отображения дерева:</b></center><br>
<center>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Панельный режим:<br>
<img src="./img/mainpage/clip_9087_31a9bd91.png" width="650px" align="center">
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Режим дерева:<br>
<img src="./img/mainpage/clip_6517_5d22e5da.png" width="650px" align="center">
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Режим карты ума:<br>
<img src="./img/mainpage/clip_8580_658cb30a.png" width="650px" align="center">
</center>
<p>
Любую заметку дерева можно превратить в папку, просто добавив в неё элементы при помощи клавиш alt+вправо.<br><br>
При добавлении новых дел или переименовании старых, вы можете написать "позвонить через 3 дня в 10:50 напомнить", эта фраза расшифруется и делу присвоится соответствующая дата.<br><br>
Вы можете создать собственную структуру дел, основанную, например, на технологии Getting Things Done (GTD). Дела по дереву можно перетаскивать мышкой.<br><br>Всё что вы напишите БОЛЬШИМИ буквами, автоматически добавится в панель избранных над деревом. При клике в избранные, эта папка открывается в дереве, календаре и редакторе.<br><br>
При клике мышкой в синюю папку рядом с делом, в редактор загружаются все заметки этой папки. Вы можете редактировать несколько заметок одновременно.<br><br>
Дата следующего действия транслируется на все родительские папки. Если кликнуть на эту дату, открывается дело, дата которого ближайшая.
</p>
</div>

<div id="green" class="some_more" style="height:360px !important;">
<center>Добро пожаловать на альфа-тестирование 4tree.<br><br>
<img src="./img/mainpage/clip_8495_e5256a80.png" width="450px" align="center"></center>
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