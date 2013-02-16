<html lang="ru" manifest="cache-manifest-mobile1.manifest">
<? 
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

<link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
<link rel="icon" href="favicon.ico" type="image/x-icon" />

<link rel="stylesheet" href="./css/jquery.mobile-1.2.0.css" />
<script src="./js/jquery-1.8.2.js"></script>
<script src="./js/jquery.mobile-1.2.0.js"></script>
<script src="./js/all-mobile.js"></script>

<script type="text/javascript">
$(document).ready(jsDoFirstMobile); 
</script>


</head>

<body onResize="">

<div id="home" data-role="page">

	<div data-role="header" data-theme="a" data-position="fixed">
			<a class="back1" href="pda.php" data-icon="">Назад</a>	
			<h1>4tree.ru</h1>
			<a href="#" data-icon="search">Поиск</a>	
	</div><!-- /header -->

	<div data-role="content">	

<ul data-role="listview" data-inset="false" data-filter="false">
		<li><a href="#category-items?node=1">Все дела в 4tree.ru</a></li>
</ul>

	</div><!-- /content -->

<div data-role="footer" data-theme="a" data-position="fixed">		
	<div data-role="navbar">
		<ul>
			<li><a href="#">Дерево</a></li>
			<li><a href="#">Календарь</a></li>
			<li><a href="#">Добавить</a></li>
		</ul>
	</div><!-- /navbar -->
</div><!-- /footer -->


</div><!-- /page -->


<div id="category-items" data-role="page">
	<div data-role="header" data-theme="a" data-position="fixed">
			<a class="back1" href="pda.php" data-icon="">Назад</a>	
			<h1>4tree.ru</h1>
			<a href="#" data-icon="search">Поиск</a>	
	</div><!-- /header -->

  <div data-role="content"></div>

<div data-role="footer" data-theme="a" data-position="fixed">		
	<div data-role="navbar">
		<ul>
			<li><a href="#">Дерево</a></li>
			<li><a href="#">Календарь</a></li>
			<li><a href="#">Добавить</a></li>
		</ul>
	</div><!-- /navbar -->
</div><!-- /footer -->


</div>



<div id="note-items" data-role="page">
	<div data-role="header" data-theme="a" data-position="fixed">
			<a class="back1" href="pda.php" data-icon="">Назад</a>	
			<h1>4tree.ru</h1>
			<a href="#" data-icon="search">Поиск</a>	
	</div><!-- /header -->

  <div data-role="content" style="overflow:auto !important"></div>

<div data-role="footer" data-theme="a" data-position="fixed">		
	<div data-role="navbar">
		<ul>
			<li><a href="#">Дерево</a></li>
			<li><a href="#">Календарь</a></li>
			<li><a href="#">Добавить</a></li>
		</ul>
	</div><!-- /navbar -->
</div><!-- /footer -->


</div>



</body>

</html>