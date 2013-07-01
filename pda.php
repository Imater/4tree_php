<html lang="ru" manifest="">

<? 
//cache-manifest-mobile1.manifest
//manifest="cache-manifest-v3.php"
	require_once('db.php');

if(isset($_GET['confirm']))
   {
	
	$db = mysql_connect ($config[mysql_host], $config[mysql_user], $config[mysql_password]);
	mysql_query_my("SET NAMES utf8");
	mysql_select_db('h116',$db);   
	if (!$db) { echo "Ошибка подключения к SQL :("; exit();}
	

		$confirm = $_GET['confirm'];

		
	}
?>

<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=utf-8">
<meta charset="utf-8">
<head>
<title>4tree.ru — мобильные дела</title>
<meta name="description" content="Сайт для ведения дел, заметок, календаря и так далее. Инструмент таймменеджмента, где всё нужное собранно в одном месте."/>
<meta name="keywords" content="gtd, 4tree.ru, заметки, задачи, гтд, таймменеджмент, хранение заметок, календарь"/>
<meta name="viewport" content="width=device-width">
<meta name="apple-mobile-web-app-capable" content="yes" />

<link rel="shortcut icon" href="favicon-mobile.png" type="image/x-icon" />
<link rel="icon" href="favicon-mobile.png" type="image/x-icon" />

<link rel="stylesheet" href="./css/jquery.mobile-1.3.1.css" />
<link rel="stylesheet" href="./css/mobile.css" />
<link rel="stylesheet" type="text/css" href="redactor900/redactor/redactor.css"/>
<link rel="stylesheet" type="text/css" href="fontello/css/fontello.css"/>

<script src="./js/jquery-1.8.2.js"></script>
<script src="./js/jquery.mobile-1.3.1.js"></script>
<script src="js/ztx-ydn.db-dev-0.6.2.js"></script>
<script src="jstree/_lib/jquery.cookie.min.js"></script>
<script src="js/md5.js"></script>
<script src="js/js_regallkeys.js"></script>
<script src="js/loader.js"></script>
<script src="diff_match_patch/javascript/diff_match_patch_uncompressed.js"></script>
<script src="js/jquery.idle-timer.js"></script>
<script src="./js/api4tree.js"></script>
<script src="./js/all-mobile.js"></script>
<script src="redactor900/redactor/redactor.js"></script>
<script src="redactor900/redactor/ru.js"></script>
<script src="./js/4tree.js"></script>



<script type="text/javascript">
$(document).ready(jsDoFirstMobile); 
</script>


</head>

<body onResize="">





<div data-role="page" data-theme="c" id="mainWindow">
	<div data-role="panel" id="menuPanel" data-display="reveal" data-dismissible="false" style="">
		<div data-role="header" data-position-fixed="true">
		 
		 <a class="back1" href="pda.php" data-icon="arrow-l" data-mini="true" data-iconpos="notext">Назад</a>	
		 <h1>&nbsp;</h1>
		 
		</div>
		<div id="search_div">
			<input type="search" name="search" id="search-basic" data-mini="true" placeholder="Поиск в 4tree" value="" />
		</div>
		<div data-role="content" style="" id="menuContent">

		<ul data-role="listview" data-inset="true" data-filter="false">
		<li><a href="#user-login">Вход (смена пользователя)</a></li>
		<li><a href="#" target="_blank" id="load_from_server">Загрузить данные с сервера</a></li>
		<li><a href="#category-items?node=1">Все дела в 4tree.ru</a></li>
		</ul>

		</div>
	

	</div>
	

	<div data-role="header" id="tree_header" data-theme="a">
			<a class="menu" href="#menuPanel" data-icon="bars" id="open_menu" data-iconpos="notext">Дерево</a>	
			<h1>Вход </h1>
			<a href="#" data-icon="plus" data-iconpos="notext">Регистрация</a>	
	</div><!-- /header -->


	<div data-role="content">
		 Example using <a href="#user-login"> Login_it </a>
		 <br>
		<a href="#menuPanel" data-role="button" data-inline="true">Show left panel</a>
	</div>
</div>


<div data-role="page" data-theme="c" id="page2">
	<div data-role="header">
		 page2
	</div>
	<div data-role="content">
		 I am page2
	</div>
</div>





<div id="user-login" data-role="panel">
	<div data-role="header" data-theme="a" data-position="fixed">
			<a class="back1" href="pda.php" data-icon="">Назад</a>	
			<h1>Вход </h1>
			<a href="#" data-icon="plus">Регистрация</a>	
	</div><!-- /header -->
  
  <div data-role="content" style="overflow:auto !important;">
  
	  <div data-role="fieldcontain">
	    <label for="email_login">Email:</label>
	    <input data-clear-btn="true" type="email" name="email_login" id="email_login" value="" placeholder="4tree@4tree.ru" />
	  </div>	
	  <div data-role="fieldcontain">
	    <label for="log_pas">Пароль:</label>
	    <input type="password" name="log_pas" id="log_pas" value=""  />
	  </div>	
	  

	  <a href="javascript:jsLog('i_am_mobile');" data-mini="true" data-role="button" data-icon="check">Войти</a>

  </div>

<div data-role="footer" data-theme="a" data-position="fixed">		
	<div data-role="navbar">
		<ul>
			<li><a href="pda.php">Главная</a></li>
			<li><a href="#">Календарь</a></li>
			<li><a href="#">Добавить</a></li>
		</ul>
	</div><!-- /navbar -->
</div><!-- /footer -->


</div>


<!-- ///////////////////////////////////////////////////////////////////// -->

<div id="category-items" data-role="page">
	<div data-role="header" data-theme="a" data-position="fixed">
			<a class="back1" href="pda.php" data-icon="">Назад</a>	
			<h1>4tree.ru</h1>
	
    
    <a id="sync_now" href="#" data-role="button" data-iconpos="notext" data-icon="refresh" data-theme="a"></a>
    
	

	</div><!-- /header -->

  <div data-role="content"></div>

<div data-role="footer" data-theme="a" data-position="fixed">		
	<div data-role="navbar">
		<ul>
			<li><a href="pda.php">Главная</a></li>
			<li><a href="#">Календарь</a></li>
			<li><a href="#">Добавить</a></li>
		</ul>
	</div><!-- /navbar -->
</div><!-- /footer -->


</div>

<!-- ///////////////////////////////////////////////////////////////////// -->







<div id="this_version" style="display:none">Mobile</div>

</body>

</html>