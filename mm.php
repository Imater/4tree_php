<html lang="ru">
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=utf-8">
<meta charset="utf-8">

<head>
<title>Карты ума — 4tree.ru</title>

<link rel="shortcut icon" href="favicon-mindmap.png" type="image/x-icon" />
<link rel="icon" href="favicon-mindmap.png" type="image/x-icon" />
<meta name="description" content="Сайт для ведения дел, заметок, календаря и так далее. Инструмент таймменеджмента, где всё нужное собранно в одном месте."/>
<meta name="keywords" content="gtd, 4tree.ru, заметки, задачи, гтд, таймменеджмент, хранение заметок, календарь"/>
<style>
html
{
overflow-y: hidden;
}
</style>

<script src="js/jquery-1.10.1.min.js"></script>
<script src="js/jquery-ui-1.10.3.custom.min.js"></script>

<?
if (isset($_GET['mindmap'])) 
 echo '<script>var main_node = '.$_GET['mindmap'].'</script>';
else 
 echo '<script>var main_node = 225</script>';

	include "db.php";

require_once('compress_timestamp.php');         //load timestamp created by compress.php module sets field $compress_stamp=unix_timestamp                                       
if (stripos($_SERVER['HTTP_ACCEPT_ENCODING'],'GZIP')!==false)   
        $gz='gz';
 else
        $gz=null;
	echo '<link rel="stylesheet" type="text/css" href="min/styles_'.$compress_stamp.'.css'.$gz.'" />',PHP_EOL;

    echo '<link rel="stylesheet" type="text/css" href="css/mindmap.css"/>',PHP_EOL;
	$db = mysql_connect ($config[mysql_host], $config[mysql_user], $config[mysql_password]);
	mysql_query_my("SET NAMES utf8");
	mysql_select_db('h116',$db);   
	if (!$db) { echo "Ошибка подключения к SQL :("; exit();}

   $q = strtolower($HTTP_GET_VARS["short"]);
?>
<?
require_once('compress_timestamp.php');         //load timestamp created by compress.php module sets field $compress_stamp=unix_timestamp                                       
if (stripos($_SERVER['HTTP_ACCEPT_ENCODING'],'GZIP')!==false)   
        $gz='gz';
 else
        $gz=null;
//echo '<link rel="stylesheet" type="text/css" href="min/styles_'.$compress_stamp.'.css'.$gz.'" />',PHP_EOL;
echo '<script src="min/all_'.$compress_stamp.'.js'.$gz.'" /></script>',PHP_EOL;
//echo '<script src="min/all1_'.$compress_stamp.'.js'.$gz.'" /></script>',PHP_EOL;
if ( $_SERVER['HTTP_HOST'] == 'localhost') 
   echo '<link rel="stylesheet" type="text/css" href="css/styles.css" />',PHP_EOL;

?>
<script src="js/mindmap.js"></script>
<script src="js/scrollable.js"></script>

<link href="common.css" type="text/css" rel="stylesheet">

<script type="text/javascript">
$(document).ready(jsDoFirstMindMap); 
</script>

</head>

<body style="margin:0px;" onresize="onResizeMindMap();">


<div id="mindmap_wrap">
	  <div class="mindmap_toolbar">
		<div class="i_button zoom_out"><i class="icon-zoom-out"></i></div>
		<div class="i_button zoom_in"><i class="icon-zoom-in"></i></div><br><br>
		<div class="i_button collapse_all"><i class="icon-minus-circle"></i></div>
		<div class="i_button expand_all"><i class="icon-plus-circle"></i></div>
	  </div>

	<div id="mindmap_header">
	</div>
		<div id="mindmap_content1">
			<div id="mindmap_output">
				<div id="mindmap_canvas">
				<canvas id="canvas" width="5000px" height="5000px"></canvas>


				</div>
			</div>
		</div>
	<div id="mindmap_footer"><span class="title"></span><div id="bubu" style="display:block"></div>
</div>

</div>

<div id="mindmap_note" default_text="<font style='font-size:9px;line-height:11px;'><b>Enter</b> — добавить элемент<br><b>Shift+Enter</b> — добавить дочерний элемент<br><b>Alt+F3</b> — сфокусироваться на элементе<br><b>Del</b> — удалить выбранный элемент<br>Можно перемещать поля перетаскиванием мышью</font>"></div>

</body>






