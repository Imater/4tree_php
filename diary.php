<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html lang="ru">
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=utf-8">
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width">
<head>
<?
if (isset($_GET['short'])) 
   { 
   echo "<title>".$title."</title>
	<link rel='shortcut icon' href='favicon.ico' type='image/x-icon' />
	<link rel='icon' href='favicon.ico' type='image/x-icon' />";
   }
else
   {
   echo "<title>ДНЕВНИК</title>
	<link rel='shortcut icon' href='favicon-diary.ico' type='image/x-icon' />
	<link rel='icon' href='favicon-diary.ico' type='image/x-icon' />";
   }
?>
<meta name="description" content="Сайт для ведения дел, заметок, календаря и так далее. Инструмент таймменеджмента, где всё нужное собранно в одном месте."/>
<meta name="keywords" content="gtd, 4tree.ru, заметки, задачи, гтд, таймменеджмент, хранение заметок, календарь"/>

<style>
.redactor_toolbar
{
opacity: 0.5;
}
html
{
overflow-y: hidden;
}
</style>


<?

if ( stristr($_SERVER['HTTP_USER_AGENT'], 'Firefox') ) $browser = 'firefox';
elseif ( stristr($_SERVER['HTTP_USER_AGENT'], 'Chrome') ) $browser = 'chrome';
elseif ( stristr($_SERVER['HTTP_USER_AGENT'], 'Safari') ) $browser = 'safari';
elseif ( stristr($_SERVER['HTTP_USER_AGENT'], 'Opera') ) $browser = 'opera';
elseif (true) 
  {
	include "db.php";
     
    echo '<link rel="stylesheet" type="text/css" href="css/styles.css"/>',PHP_EOL;

	$db = mysql_connect ($config[mysql_host], $config[mysql_user], $config[mysql_password]);
	mysql_query_my("SET NAMES utf8");
	mysql_select_db('h116',$db);   
	if (!$db) { echo "Ошибка подключения к SQL :("; exit();}

   $q = strtolower($HTTP_GET_VARS["short"]);
   
//   echo '<meta name="description" content="4tree.ru">';
   
   echo '</head><body style="background-image:url(img/02.jpeg);background-attacment:fixed;background-position:center center;"><div id="ie_page" style="overflow-y: auto;height:98%;background:white;padding:25px;margin-left:50px;width:800px;margin: 0 auto;display:block">';
   
   $sqlnews = "SELECT node_id,is_on FROM h116.tree_shortlink WHERE (shortlink='".$q."' OR longlink='".$q."')";
   $result = mysql_query_my($sqlnews); 
   @$sql = mysql_fetch_array($result);
   
      
   $node_id = $sql['node_id']; 
   $node_id_count = split(",",$node_id);
   $cnt_id = count($node_id_count)-1;

   if(($sql['is_on']==0) AND ($cnt_id>0)) { echo '<center>Такая заметка существует,<br>но владелец заметки отключил её просмотр</center><br>'; exit; }
   
   //заношу статистику посещения гостей в дневник, использую их ip
   $sqlnews = "UPDATE h116.tree_shortlink SET statistic = CONCAT(statistic,'".$_SERVER['REMOTE_ADDR'].",') WHERE shortlink='".$q."'";
   $result = mysql_query_my($sqlnews); 
   @$sql = mysql_fetch_array($result);

   if ($cnt_id == 0) { echo '<center>Заметки не существует</center><br><br>'; exit; }

   if ($cnt_id > 1) { $need_h = true; $cnt = $cnt_id; }
   else $need_h = false;

   $sqlnews = "SELECT * FROM h116.tree WHERE id IN (".$node_id."0) ORDER by id";
   $result = mysql_query_my($sqlnews); 
   $i = 1;
   while (@$sql = mysql_fetch_array($result))
     {
     $q = $sql['id'];
     $title = $sql['title'];
     echo "<h1>$title</h1>";
     if($need_h) echo "<div class='divider' contenteditable='false' id='".$q."'><h2><span style='float:left'>".$i.'.</span> '.$title."</h2></div><div class='edit_text'><p>";
     echo $sql['text'];
     if($need_h) echo "</p></div>";
     $i++;
     }
  echo '</div></body>';

  exit;
  }

require_once('compress_timestamp.php');         //load timestamp created by compress.php module sets field $compress_stamp=unix_timestamp                                       
if (stripos($_SERVER['HTTP_ACCEPT_ENCODING'],'GZIP')!==false)   
        $gz='gz';
 else
        $gz=null;
echo '<link rel="stylesheet" type="text/css" href="min/styles_'.$compress_stamp.'.css'.$gz.'" />',PHP_EOL;

if (isset($_GET['short'])) $short = $_GET['short'];
else $short = 0;

if ( $_SERVER['HTTP_HOST'] == 'localhost') echo '<link rel="stylesheet" type="text/css" href="css/styles.css"/>',PHP_EOL;


echo '<script src="min/all_'.$compress_stamp.'.js'.$gz.'" /></script>',PHP_EOL;

if ( $_SERVER['HTTP_HOST'] == 'localhost') echo '<script src="./js/all.js"></script>';
else echo '<script src="min/all1_'.$compress_stamp.'.js'.$gz.'" /></script>',PHP_EOL;

echo '    <script src="./jstree/jquery.jstree.js"></script>';

if ($short) {
echo "
<style>
.redactor_editor,.redactor_editor:focus
{
padding-left:80px !important;
padding-right:80px !important;
}

.redactor_editor,.redactor_editor:focus
{
padding-left:80px;
padding-right:80px;
}

.padding-ten,.padding-ten:focus
{
padding-left:10px !important;
padding-right:10px  !important;
}


.redactor_editor p:first-child,.redactor_editor:focus div p:first-child
{
padding-top:30px !important;
}

.redactor_editor p:last-child,.redactor_editor:focus div p:last-child
{
padding-bottom:100px !important;
}
.divider
{
width: 100%;
font-size: 13px !important;
background: #2f6a23 !important;
background-image: url(../img/bigleaf.png) !important;
color: white;
font-weight: bold;
text-align: center;
margin-bottom: 0px !important;
margin-top: 60px !important;
cursor: pointer !important;
border-top-right-radius: 7px;
border-top-left-radius: 7px;
}
#diary_content1 .divider:first-child
{
margin-top: 30px !important;
}

.divider h2
{
padding:10px !important;
color:white !important;
}

#cal_label
{
display:none;
}

.redactor_toolbar
{
display:none;
}

#d_header
{
top:2px;
line-height: 25px;
font-size: 19px !important;
color: #666;
}
</style>";
$tree="<span style='float:right; margin-right: 44% !important; font-size:20px;line-height:25px;'><a href='http://4tree.ru/' target='_blank'><font color='#0c1409'>4</font><font color='#15270f'>t</font><font color='#1f3d15'>r</font><font color='#2a551c'>e</font><font color='#356e23'>e</font><font color='#428a2b'>.</font><font color='#4fa733'>r</font><font color='4fa733'>u - мои дела</font></a></span>";
}
else $tree = '';

?>

    <script type="text/javascript" src="./js/jquery-ui.multidatespicker.js"></script>
    <script type="text/javascript" src="./js/jquery.datetimeentry-ru.js"></script>


<script type="text/javascript">
<? 
if (!isset($HTTP_GET_VARS['days']))
   {
   $d = date("d.m.Y");
//   echo $d;
   } 
else $d = $HTTP_GET_VARS['days'];
?>
var mydays = '<? echo $d; ?>';
var short  = '<? echo $short; ?>';
$(document).ready(jsDoFirstDiary); 
</script>

</head>

<body style="margin:0px;" onresize="onResizeDiary();">

<div id="diary_wrap">
	<div id="diary_header"><span id="d_header"></span><div id="prev">◄</div><div id="next">►</div></div>
		<div id="diary_content1">
			<div id="diary_text" style="height:200px;margin-top:25px;">
			<textarea id="redactor_content" name="content" style="height: auto;bottom:0px;top:0px;position:absolute;">none</textarea>
			</div>
			<div id="cal_bottom">
				<div id="cal_label">календарь</div>
				<div id="diary_calendar"></div>
			</div>
		</div>
	<div id="diary_footer"><span class="title"></span><? echo $tree; ?><div id="bubu" style="display:none"></div>
</div>

</div>

</body>












