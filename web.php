<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<?
include "db.php";
     
$db = mysql_connect ($config[mysql_host], $config[mysql_user], $config[mysql_password]);
mysql_query_my("SET NAMES utf8");
mysql_select_db('h116',$db);   
if (!$db) { echo "Ошибка подключения к SQL :("; exit();}

$h = strtolower($HTTP_GET_VARS["note_history"]);
if($h)
	{
		   $txt = "";
		   $title = "История редактирования";


		   $sqlnews = "SELECT * FROM h116.tree_backup WHERE id = '$h' ORDER by changedate DESC";

		   
		   $result = mysql_query_my($sqlnews); 
		   $i = 1;
		   while (@$sql = mysql_fetch_array($result))
		     {
		     $id = $sql['id'];
			 $sqlnews2 = "SELECT * FROM h116.tree WHERE id = '$id'";
			 $result2 = mysql_query_my($sqlnews2); 
		   	 @$sql2 = mysql_fetch_array($result2);
		     
		     $divider = "<div class='divider_red' myid='".$id."'><div class='divider_count'>".$i."</div>".$sql['changedate']."<h6>".$sql2["title"]."</h6></div>";

		     
		     $txt = $txt.$divider."<div class='edit_text'>".$sql['text']."</div>";
		     $title = "4tree.ru: " . $sql['title'];
		     $titleshort = $sql['title'];
		     }
	
	}

$q = strtolower($HTTP_GET_VARS["short"]);
if($q)
	{
		$answer = "";
		
		$sqlnews = "SELECT node_id,is_on FROM h116.tree_shortlink WHERE (shortlink='".$q."' OR longlink='".$q."')";
		$result = mysql_query_my($sqlnews); 
		@$sql = mysql_fetch_array($result);
		   $node_id = $sql['node_id']; 
		   $node_id_count = split(",",$node_id);
		   $cnt_id = count($node_id_count);
		
		   if(($sql['is_on']==0) AND ($cnt_id>0)) { $answer = '<center>Такая заметка существует,<br>но владелец заметки отключил её просмотр</center><br>'; }
		   else $answer = "";
		   
		   //заношу статистику посещения гостей в дневник, использую их ip
		   $sqlnews = "UPDATE h116.tree_shortlink SET statistic = CONCAT(statistic,'".$_SERVER['REMOTE_ADDR'].",') WHERE shortlink='".$q."'";
		   $result = mysql_query_my($sqlnews); 
		   @$sql = mysql_fetch_array($result);
		
		   if ($cnt_id == 0) { $answer = 'Заметки не существует'; }
		
		   if ($cnt_id > 1) { $need_h = true; $cnt = $cnt_id; }
		   else $need_h = false;
		
		   $sqlnews = "SELECT * FROM h116.tree WHERE id IN (".$node_id.",0) ORDER by id";
		   $result = mysql_query_my($sqlnews); 
		   $i = 1;
		   while (@$sql = mysql_fetch_array($result))
		     {
		     $q = $sql['id'];
		     if($answer == "") $txt = $sql['text'];
		     else $txt = $answer;
		     $title = "4tree.ru: " . $sql['title'];
		     $titleshort = $sql['title'];
		     }
		//    <base href="http://4tree.ru/">
		}
		
		$user_name = "4tree.ru";
		$description = substr( strip_tags($txt),0,1000)."…";
		

?>
<html lang="ru">
<head>
    <title><? echo $title; ?></title>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="keywords" content="gtd, личные дела, планировщик, свой сайт, новости, блог, бесплатно, календарь, совместная работа, хранение заметок, фотографии, <? echo $user_name; ?>, хранение данных, база знаний">
    <meta name="description" content="<? echo $description; ?>">

<link rel="shortcut icon" href="favicon1.png" type="image/x-icon" />
<link rel="icon" href="favicon1.png" type="image/x-icon" />

<script src="js/jquery-1.10.1.min.js"></script>
    
    
<?
require_once('compress_timestamp.php');         //load timestamp created by compress.php module sets field $compress_stamp=unix_timestamp 

//<meta name="viewport" content="width=device-width">
                                      
if (stripos($_SERVER['HTTP_ACCEPT_ENCODING'],'GZIP')!==false)   
        $gz='gz';
 else
        $gz=null;
echo '<link rel="stylesheet" type="text/css" href="min/styles_'.$compress_stamp.'.css'.$gz.'" />',PHP_EOL;
echo '<script src="min/all_'.$compress_stamp.'.js'.$gz.'" /></script>',PHP_EOL;
//echo '<script src="min/all1_'.$compress_stamp.'.js'.$gz.'" /></script>',PHP_EOL;

?>

    
    
    
	<link rel="stylesheet" type="text/css" href="redactor900/redactor/redactor.css">
	<link rel="stylesheet" type="text/css" href="css/4tree-styles.css">

	<script src="redactor900/redactor/redactor.js"></script>
	<script src="redactor900/redactor/ru.js"></script>
	<script src="js/4tree-web.js"></script>

<script type="text/javascript">
$(document).ready(jsDoFirst); 
<?
if($h)
	{
	echo "var note_history = '".$h."'";
	}
?>
</script>
	
</head>

<body onresize="onResize();" class="web">

<div class="webheader"><? echo $titleshort; ?></div>
<div class="webred">
<textarea id="redactor_content" name="content" style="height: auto;bottom:0px;top:0px;position:absolute;">
		<? if($q) echo $txt; ?>
</textarea>
</div>

<div class="webcomment">
	<div class="web_arrow"></div>
	<div class="web_arrow2"></div>
	<div class="webcomment_inside">
		<div class="web_header"><i class="icon-comment-2"></i> комментарии (0)</div>
		<div class="web_header"><i class="icon-comment-inv"></i> Написать комментарий</div>
		<textarea id="redactor_comment" name="content" style="">
		</textarea>
		<div class="button_send">Написать</div>
	</div>
</div>

<div class="webfooter"><a href="http://4tree.ru/" target="_blank">4tree.ru — мои дела</a></div>
</body>