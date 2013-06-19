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
  </div>
  <div id="air"><img src="img/air-4tree.png" width="417" height="250"></div>
</div>

<div id="white">
<img src="img/screen1.png" width="600" height="428">
<p>дела + календарь + заметки<br>
всё в одном дереве</p>
</div>

<div id="green">
<center><b>Возможности 4tree.ru:</b></center>
<ul>
<li>Календарь с Drag&Drop<span class="tip">Вы можете перемещать дела из дерева в календарь</span></li>
<li>SMS напоминания<span class="tip"><img src="img/bell.png" width="16px" height="16px">Если вы нажмёте на колокольчик рядом с датой, вы получите SMS напоминание на телефон в назначенное время</span></li>
<li>Добавление дел в дерево через SMS<span class="tip"><img src="img/bell.png" width="16px" height="16px">Получив от вас SMS на определённый телефонный номер, 4tree добавит новое дело с указанной датой в папку '_НОВОЕ'<hr><b>Примеры:</b><br><i>Поздравить Ивана с ДР 12.05 в 9:30<br>Загнать автомобиль на ТО завтра в 9ч<br>Забрать документы через 1 год</i></span></li>
<li>Регистрация через социальные сети<span class="tip">Вам не нужно вводить пароль, если вы зарегестрированы в любой социальной сети</span></li>
<li>Вставка фотографий из буфера обмена<span class="tip">Если ваш браузер Chrome, то вы можете вставлять в заметки картинки простым нажатием ctrl+v (картинки закачаются на 4tree автоматически)</span></li>
<li>Вставка в заметки файлов, картинок и HTML-статей<span class="tip">Статьи скопированные с других сайтов, выглядят в окне заметки так же, как их задумывал дизайнер. Пользуйтесь буфером обмена, это быстро. Создавайте собственную базу знаний</span></li>
<li>Картинки из статей копируются в 4tree автоматически<span class="tip">Любые картинки вставленные в заметку, скачиваются на сервер 4tree и хранятся пожизненно.</span></li>
<li>Написанное БОЛЬШИМИ буквами превращается в закладки</li>

</ul>
</div>

<div id="bubu" style="display:none"></div>


</body>



