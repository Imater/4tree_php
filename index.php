<?php
header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
header("Cache-Control: no-store, no-cache, must-revalidate"); // HTTP/1.1
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache"); // HTTP/1.0
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<?
require_once('compress_timestamp.php');                                       
?>
<html lang="ru" class="" <? if( ($_SERVER["HTTP_HOST"]!="localhost") AND ($_SERVER["HTTP_HOST"]!="192.168.0.52")) echo "manifest='!".$compress_stamp."_manifest.appcache'"; ?> >
<!-- 1browser_manifest !!-->

<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=utf-8">

<meta charset="utf-8">

<head>
<title>4tree.ru — мои дела</title>
<meta name="description" content="Сайт для ведения дел, заметок, календаря и так далее. Инструмент таймменеджмента, где всё нужное собранно в одном месте."/>
<meta name="keywords" content="gtd, 4tree.ru, заметки, задачи, гтд, таймменеджмент, хранение заметок, календарь"/>



<link rel="search" type="application/opensearchdescription+xml" title="4tree.ru Добавление дел" href="/SearchEngineInfo.xml" />


<link rel="shortcut icon" href="favicon1.png" type="image/x-icon" />
<link rel="icon" href="favicon1.png" type="image/x-icon" />

<script src="js/jquery-1.10.1.min.js"></script>
<script src="js/jquery-ui-1.10.3.custom.min.js"></script>

<?
if (stripos($_SERVER['HTTP_ACCEPT_ENCODING'],'GZIP')!==false)   
        $gz='gz';
 else
        $gz=null;
if( ($_SERVER["HTTP_HOST"]!="localhost") AND ($_SERVER["HTTP_HOST"]!="192.168.0.52")) {
	echo '<script src="min/all_'.$compress_stamp.'.js'.$gz.'" /></script>',PHP_EOL;
	echo '<link rel="stylesheet" type="text/css" href="min/styles_'.$compress_stamp.'.css'.$gz.'" />',PHP_EOL;
} else {

	echo '
    <link rel="stylesheet" type="text/css" href="ui/css/smoothness/jquery-ui-1.8.21.custom.css"/>
    <link rel="stylesheet" type="text/css" href="css/iphone.css"/>
    <link rel="stylesheet" type="text/css" href="fontello/css/fontello.css"/>
    <link rel="stylesheet" type="text/css" href="redactor900/redactor/redactor.css"/>
    <link rel="stylesheet" type="text/css" href="css/4tree-styles.css"/>
    <link rel="stylesheet" type="text/css" href="fullcalendar-1.6.1/fullcalendar/fullcalendar.css"/>
    <link rel="stylesheet" type="text/css" href="css/4tree-foto.css"/>
    <link rel="stylesheet" type="text/css" href="css/jqueryslidemenu.css"/>';


	echo '<script src="jstree/_lib/jquery.cookie.min.js"></script>
	<script src="b_menu/jquery.menu.js"></script>
	<script src="js/handlebars.js"></script>
	<script src="js/md5.js"></script>
	<script src="js/jquery.idle-timer.js"></script>
	<script src="diff_match_patch/javascript/diff_match_patch_uncompressed.js"></script>
	<script src="js/parser.js"></script>
	<script src="fabric.js-1.1.0/dist/all.js"></script>
	<script src="js/4tree-foto.js"></script>
	<script src="js/loader.js"></script>
	<script src="js/jquery.datetimeentry2.min.js"></script>
	<script src="js/jquery.datetimeentry-ru.js"></script>
	<script src="fullcalendar-1.6.1/fullcalendar/fullcalendar.js"></script>
	<script src="b_menu/jquery.dimensions.min.js"></script>
	<script src="js/pushstream.js"></script>
	<script src="js/js_regallkeys.js"></script>
	<script src="js/all_new.js"></script>
	<script src="js/!sync_modul.js"></script>
	<script src="js/ztx-ydn.db-dev-0.6.2.js"></script>
	<script src="redactor900/redactor/redactor.js"></script>
	<script src="redactor900/redactor/ru.js"></script>
	<script src="js/iphone-style-checkboxes.js"></script>
	<script src="js/jszip.js"></script>
	<script src="js/vcdiff.js"></script>
	<script src="js/rangy-core.js"></script>
	<script src="js/jqueryslidemenu.js"></script>
	<script src="js/rangy-selectionsaverestore.js"></script>';
	
}

if(isset($_GET['test']))
	{
	echo '
	<link rel="stylesheet" href="js/qunit-1.11.0.css" type="text/css" media="screen">
	<script type="text/javascript" src="js/qunit-1.11.0.js"></script>
	<script src="js/!test.js"></script>
	';
	}

?>
<? 
if(isset($_GET['confirm']))
   {	

		require_once('db.php');
		
		$confirm = $_GET['confirm'];

		$sqlnews="SELECT count(*) cnt FROM `tree_users` WHERE confirm_email = '".mysql_real_escape_string($confirm)."'";
		$result = mysql_query_my($sqlnews); 
		@$sql = mysql_fetch_object ($result);

		if($sql->cnt>0) 
		  {
		  $sqlnews="UPDATE `tree_users` SET confirm_email='' WHERE confirm_email = '".mysql_real_escape_string($confirm)."'";
		  $result = mysql_query_my($sqlnews); 
		  @$sql = mysql_fetch_object ($result);
		  echo '<script>alert("Спасибо за подтверждение электронной почты. Удачи в ваших делах.");</script>';
		  }
		
	}

?>



<script type="text/javascript">
$(document).ready(jsDoFirst); 
if(!$.cookie("4tree_passw")) document.location.href="./4tree.php";

</script>
</head>



<body onResize="onResize();">


<div id="load_screen" style="background-image:url('./img/textures/17.png');top:0px;bottom:-1px;left:0px;right:0px;background-color:white;position:absolute;z-index:999;padding-top:185px;"><center><div id='pload_text'>Загрузка...</div><br><div id="progress_bar" style="width:300px;overflow:hidden;background-color:rgb(151,252,0);height:5px;margin-top:25px;border:1px solid #000;border-radius:3px;"><div id="inside_bar" style="float:left;background-color:rgb(36,150,0);height:10px;margin-left:-3px;display:inline-block;width:10px;"></div></div><a style="color:rgb(65,109,0);margin-top:280px;display:block" href="./4tree.php"><h2>4tree.ru</h2></a>
<font style="font-size:15px"><? echo $compress_stamp; ?></font>
</div></center></div>

<?
if(isset($_GET['test']))
	{
	echo '
<div id="test-div">
	<h1 id="qunit-header">Комплект для тестов QUnit</h1>
	<h2 id="qunit-banner"></h2>
	<div id="qunit-testrunner-toolbar"></div>
	<h2 id="qunit-userAgent"></h2>
	<ol id="qunit-tests"></ol>
</div>';
	}
?>


<div id="wrap" class="">
<div id='p1'></div><div id='p2'></div><div id='p3'></div>

<div id="header">

<div id="myslidemenu" class="jqueryslidemenu" style="z-index:50">
<ul>
<li class="top_level"><a href="#">4tree</a>
    <ul>  
        <li><a>Расположение панелей</a>
            <ul>  
                <li><span class="m_key">alt+"1"</span><a id="v1">Вид №1</a></li>  
                <li><span class="m_key">alt+"2"</span><a id="v2">Вид №2</a></li>  
                <li><span class="m_key">alt+"3"</span><a id="v3">Вид №3</a></li>  
                <li><span class="m_key">alt+"4"</span><a id="v4">Вид №4</a></li>  
            </ul>  
        </li>  
        <li class="blank"></li>
        <li><a>Редактор</a>
            <ul>  
                <li><span class="m_key">alt+"z"</span><a>Отменить один шаг редактирования</a></li>  
                <li><span class="m_key">alt+shift+"z"</span><a>Вернуть один шаг редактирования</a></li>  
            </ul>  
        </li>  
        <li><a>Поделиться</a>
            <ul>  
                <li><a class="send_by_mail"><i class='icon-mail-2'></i> По электронной почте</a></li>  
                <li><a>Короткая ссылка</a></li>  
                <li><a>Опубликовать на моём сайте</a></li>  
            </ul>  
        </li>  
        <li><a>Печать</a>
            <ul>  
                <li><a>Распечатать содержимое редактора</a></li>  
                <li><a>Распечатать содержимое календаря</a></li>  
                <li><a>Распечатать дерево</a></li>  
            </ul>  
        </li>  
        <li><a>Таймер</a>
            <ul>  
                <li><a class="timer_button" time="-1">1 минута</a></li>  
                <li><a class="timer_button" time="-5"><b>5 минут</b></a></li>  
                <li><a class="timer_button" time="-10">10 минут</a></li>  
                <li><a class="timer_button" time="-15"><b>15 минут</b></a></li>  
                <li><a class="timer_button" time="-20">20 минут</a></li>  
                <li><a class="timer_button" time="-25"><b>25 минут</b></a></li>  
                <li><a class="timer_button" time="-30">30 минут</a></li>  
                <li><a class="timer_button" time="-40">40 минут</a></li>  
                <li><a class="timer_button" time="-50">50 минут</a></li>  
                <li><a class="timer_button" time="-60">60 минут</a></li>  
                <li><a class="timer_button" time="-90">90 минут</a></li>  
                <li><a class="timer_button" time="-120">120 минут</a></li>  
                <li class="blank"></li>
                <li><a>Что такое pomidorro?</a></li>  
                <li class="blank"></li>
                <li><a id="cancel_timer" time="0">Отменить таймер</a></li>  
            </ul>  
        </li>  
        <li><a>Синхронизация</a>
        	<ul>
            	<li><span class="m_key">alt+"R"</span><a class="m_refresh">Синхронизировать с сервером</a></li>  
            	<li><span class="m_key"></span><a class="m_refresh_all">Загрузить дерево с сервера</a></li>  
            </ul>
        </li>
        <li>
        	<a href="./!versions.html?<? echo $compress_stamp; ?>" target="_blank">Что нового в версии 4tree.ru <? echo $compress_stamp; ?> ...</a>
        </li>
    </ul>  


</li>


<li class="top_level"><a href="#">Вид</a>
  <ul>
      <li><input type="checkbox" class="on_off" id="on_off_hide_did"></input><a class="show_hidden_do" style="margin-right:90px;">Показывать выполненные дела</a></li>
      <li class="blank"></li> <!-- separator -->  
	  <li><a href="#">Панели</a>
	  		<ul>
	  		    <li><a href="#">Вид №1</a></li>
	  		    <li><a href="#">Вид №2</a></li>
	  		    <li><a href="#">Вид №3</a></li>
	  		    <li><a href="#">Вид №4</a></li>
	  		</ul>
	  </li>
	  <li><a href="#">Отображение дерева</a>
	  		<ul>
	  		    <li><a href="#">Панели</a></li>
	  		    <li><a href="#">Дерево</a></li>
	  		    <li><a href="#">Карта ума</a></li>
	  		</ul>
	  </li>
	  <li><a href="#">Масштаб дерева</a>
	  		<ul>
		  		<li><span class="m_key">alt <i class="icon-plus-circle"></i></span><a class="m_zoom_in">Увеличить масштаб дерева</a></li>  
		  		<li><span class="m_key">alt <i class="icon-minus-circle"></i></span><a class="m_zoom_out">Уменьшить масштаб дерева</a></li>  
		  		<li><span class="m_key">alt+"0"</span><a class="m_zoom_default">Масштаб дерева по умолчанию</a></li>  
	  		</ul>
	  </li>
	  <li><a href="#">Фокус</a>
	  		<ul>
	  		    <li><a href="#">Установить</a></li>
	  		    <li><a href="#">Снять</a></li>
	  		    <li><a href="#">На уровень выше</a></li>
	  		</ul>
	  </li>
  </ul>
</li>
<li class="top_level"><a href="#">Добавить</a>
	<ul>
        <li><a href="#" class="add_do_down">Дело вниз</a></li>
        <li><a href="#" class="add_do_right">Дело вправо</a></li>
        <li class="blank"></li> <!-- separator -->  
        <li><a href="#">Запись в сегодняшний дневник</a>
			<ul>
			    <li><a href="#">Завершённую "помидорку"</a></li>
			    <li><a href="#">Комментарий</a></li>
			</ul>
        </li>
    </ul>
</li>
<li class="top_level"><a href="#">Поделиться</a>
	<ul>
        <li><a href="#">Контакты</a>
			<ul>
			    <li><a href="#">Вецель Евгений</a>
					<ul>
						<li><a>чат</a></li>
						<li><a>поделилась со мной</a></li>
						<li><a>я делюсь с ней</a></li>
					</ul>
			    </li>
			    <li><a href="#">Вецель Валентина</a>
					<ul>
						<li><a>чат</a></li>
						<li><a>поделилась со мной</a></li>
						<li><a>я делюсь с ней</a></li>
					</ul>
			    </li>			    
			    <li><a href="#">Подбельных Екатерина</a>
					<ul>
						<li><a>чат</a></li>
						<li><a>поделилась со мной</a></li>
						<li><a>я делюсь с ней</a></li>
					</ul>
			    </li>
			    
			</ul>
        </li>
        
        <li><a href="#">Поделиться текущей папкой</a>
			<ul>
			    <li><a href="#">Только для чтения</a></li>
			    <li><a href="#">Полные права на редактирование</a></li>
			    <li><a href="#">На мой сайт</a></li>
			</ul>
        </li>
        <li class="blank"></li> <!-- separator -->  
        <li><a href="#">Отправить текущую заметку</a>
			<ul>
			    <li><a href="#">Письмом</a></li>
			    <li><a href="#">Короткую ссылку на экран</a></li>
			    <li><a href="#">Короткую ссылку через SMS</a></li>
			</ul>
        </li>
    </ul>
</li>
<li class="top_level"><a href="#">Избранные</a>
  <ul>
  <li><a href="#">ИДЕИ</a></li>
  <li><a href="#">РАБОЧИЕ</a>
    <ul>
    <li><a href="#">КЛАДОВЩИК</a></li>
    <li><a href="#">САЙТЫ</a></li>
    <li><a href="#">_НОВОЕ</a>
		<ul>
    		<li><a href="#">ПИСЬМА</a></li>
    		<li><a href="#">БЫСТРЫЕ</a></li>
    		<li><a href="#">ИНН</a></li>
    		<li><a href="#">ПФР</a></li>
    		<li><a href="#">ВСЯЧИНА</a></li>
		</ul>
    </li>
    <li><a href="#">ССЫЛКИ</a></li>
    </ul>
  </li>
  </ul>
</li>
<li class="top_level"><a href="http://www.dynamicdrive.com/style/">Правка</a>
  <ul>
  <li><a href="#">Undo/Redo/History</a>
    <ul>
    <li><a href="#">Отменить (undo)</a></li>
    <li><a href="#">Повторить (redo)</a></li>
    <li><a href="#">История изменений текущей заметки</a></li>
    </ul>
  </li>  
  <li class="blank"></li> <!-- separator -->  
  <li><a href="#">Вырезать дело</a></li>
  <li><a href="#">Скопировать дело</a></li>
  <li><a href="#">Вставить дело</a></li>
  <li><a href="#">Дублировать папку</a></li>
  <li class="blank"></li> <!-- separator -->  
  <li><a href="#">Вставить Граффити</a></li>
  <li><a href="#">Печать содержимого редактора</a></li>
  <li><a href="#">Упорядочить</a>
    <ul>
    <li><a href="#">По имени</a></li>
    <li><a href="#">По дате выполнения</a></li>
    <li><a href="#">По иконке (типу дела)</a></li>
    </ul>
  </li>  
  <li><a href="#">Изменить тип дела</a>
    <ul>
    <li><a href="#">Звонок</a></li>
    <li><a href="#">Визит</a></li>
    <li><a href="#">Поездка</a></li>
    </ul>
  </li>  
  <li><a href="#">Изменить цвет ярлычка</a>
    <ul>
    <li><a href="#">Синий</a></li>
    <li><a href="#">Красный</a></li>
    <li><a href="#">Зелёный</a></li>
    </ul>
  </li>  
  </ul>
</li>
<li class="top_level go_to_li_menu"><a class="header_text">Переход</a>
	<ul>
		<li><a>_Новое</a></li>
	</ul>
</li>
</ul>
<br style="clear: left" />
</div>


	
  <div id="add_do_panel">
  	<input type="text" id="add_do" onwebkitspeechchange="jsSpeechComplete()" x-webkit-speech value="позвонить через 3 дня в 9:30">
  </div>
  <div id="add_combobox">
  	<div class="combo_label" title="Папка для добавления"><i class="icon-folder-1"></i></div><input id="add_combobox_input" value="_НОВОЕ">
  	<div class="combo_last_list"><b></b></div>
  	<div class="combo_list panel_type3">
  	  <ul>
  	  </ul>
  	</div>
  </div>
	
	
</div>


<div id="content1" class="v1">
<div id="left_panel_opener">
	<i class="icon-right-open"></i>
</div>
<div id="left_panel">
	<div class="inside_left_panel">
		<h1><i class="icon-down-dir"></i> INBOX</h1>
		<ul>
			<li><i class="icon-inbox"></i> _Новое<div class="left_count">84</div></li>
		</ul>
		<div class="horizont_line"></div>
		<h1><i class="icon-down-dir"></i> ОТБОРЫ</h1>
		<ul>
			<li><i class="icon-calendar"></i> Сегодня<div class="left_count">4</div></li>
			<li><i class="icon-flag"></i> Следующие<div class="left_count">14</div></li>
			<li><i class="icon-calendar"></i> Завтра<div class="left_count">5</div></li>
			<li><i class="icon-calendar-1"></i> Календарь<div class="left_count">210</div></li>
			<li><i class="icon-archive"></i> Когда-нибудь</li>
			<li><i class="icon-hourglass"></i> Ожидание<div class="left_count">24</div></li>
		</ul>
		<div class="horizont_line"></div>

		<h1><i class="icon-down-dir"></i> ПРОЕКТЫ</h1>
		<ul>
			<li><i class="icon-leaf"></i> Обучение менеджеров</li>
			<li><i class="icon-leaf"></i> Командировка</li>
			<li><i class="icon-leaf"></i> Новый салон на северозападе</li>
			<li><i class="icon-leaf"></i> Заказ авто</li>
			<li><i class="icon-leaf"></i> Закупка оборудования</li>
		</ul>
		<div class="horizont_line"></div>

		<h1><i class="icon-down-dir"></i> КОНТЕКСТЫ</h1>
		<ul>
			<li><i class="icon-at"></i> Дома</li>
			<li><i class="icon-at"></i> На работе</li>
			<li><i class="icon-at"></i> Магазин</li>
			<li><i class="icon-at"></i> Северозапад</li>
			<li><i class="icon-at"></i> За компьютером</li>
		</ul>
		<div class="horizont_line"></div>
	</div>
</div><!--left panel -->


<div id="right_panel_opener">
	<i class="icon-left-open"></i>
</div>
<div id="right_panel">
	<div class="inside_right_panel">
		  <ul>
		  <div class="right_contacts">
		  </div>
		  </ul>

	</div>
</div> <!--right panel -->



	<div id="main_window">
	  <div class="place_of_top">
	    
		<div id="top_panel" class="effect2 panel_type3">

	<div class="header_toolbar">
	</div>


			<div id="mypanel" style="">
			</div>
					<div class="favorit_tabs" id="fav_tabs">
					</div>
					<div class="favorit_menu"><i class="icon-right-open"></i>
						<ul>
						</ul>
					</div>
	    </div> <!-- top-panel -->
	  </div> <!-- place-of-top -->
	
	  <div id="bottom_panel">
	  		<div class="bottom_left">

			<div id="tree_comments">
				<div id="tree_comments_container">
				</div>
				<div id="comment_enter_place">
					<div id="comment_enter">
						<div class="fullscreen_button icon-resize-full" title="На весь экран"></div>					
						<div class="comment_enter_input"></div>
						<div class="comment_send_button" title="alt+enter"><i class="icon-comment-1"></i> написать</div>
					</div>
				</div>
				
			</div>
				
				
				<div class="search_panel_result panel_type3">
					<ul>
					  <li>Введите фразу для поиска или <br>выражение для калькулятора: <i>2+(2^2)*(1+1)*10/2</i></li>
					</ul>
				</div>
	  			<div class="search_arrow"></div>

	  			<div id="tree_news">
	  				<div id="news_header">
		  				Заметки | Все комментарии | Мои комментарии
		  			</div>
		  		</div>

	  			<div id="tree_files_panel">
	  				<div id="files_header">
	  					<ul>
	  						<li mytype="images" class="active">фотографии</li>
	  						<li mytype="all">документы</li>
	  					</ul>
		  			</div>
		  			<div id="tree_files_content">
		  			</div>
		  		</div>

	  			<div id="tree_agenda">
		  		</div>

				
			    <div id="calendar" class="noselectable1">
				</div>	

				<div class="favorit_tabs" id="fav_calendar">
    				<ul>
    					<li id="tab_find"><i class="icon-search"></i> Поиск</li><li class="active" id="tab_calendar">
    					<i class="icon-calendar"></i> Календарь</li><li id="tab_files">
    					<i class="icon-attach-1"></i> Файлы</li><li id="tab_news">
    					<i class="icon-clock"></i> Новости</li>
    					<!--<li style="display:none">
    					Параметры</li><li style="display:none">
    					Мой сайт</li><li style="display:none">
    					Файлы</li><li style="display:none">
    					По датам</li>-->
    				</ul>
    			</div>
    			<div class="favorit_menu" style="bottom:10px;"><i class="icon-right-open"></i>
    				<ul>
    				</ul>
    			</div>

	  		</div>
	  		<div class="resize_me"></div>
	  		<div class="sos" title="Синхронизация / Размер окон"><i class="icon-cd"></i><div id="myloader"></div></div>
	  		<div class="bottom_right animate_me">
	  			<textarea id="redactor">
	  			</textarea>
	  				<div class="diary_calendar">
	  				</div>
	  				<div class="diary_arrow"></div>
					<div class="favorit_tabs" id="fav_red">
						<ul>
						<li fix=0></li>
						</ul>
					</div>
					<div class="favorit_menu" id="fav_red_mini" style="bottom:10px;"><i class="icon-right-open"></i>
						<ul>
						</ul>
					</div>
					<div class="red_new_window" style="" title="Открыть в новом окне"><i class="icon-forward"></i></div>
					<div class="fullscreen_button fullscreen_editor icon-resize-full" title="На весь экран"></div>	
					<div id="wiki_back_button" title="Вернуться назад в wiki"><i class="icon-left-bold"></i></div>
					
	  			
	  		</div>
	  </div>
	  
	  
	</div>
</div>

<div id="footer">
	<div class="f_text">
	</div>
	
  <div id="pomidor">
     <div id="pomidor_scale">&nbsp;</div>
     <div id="pomidor_bottom">&nbsp;</div>

		 <div id="pomidoro_icon" time="0">
		 <i id="pomidor1" time="-25" class="icon-leaf-1" title="Работа 25 минут" text="Далее 25 минут работы."></i>
		 <i id="pomidor2" time="-5" class="icon-hourglass" title="Отдых 5 минут" text="Далее отдых 5 минут."></i>
		 <i id="pomidor3" time="-25" class="icon-leaf-1" title="Работа 25 минут" text="Далее 25 минут работы."></i>
		 <i id="pomidor4" time="-5" class="icon-hourglass" title="Отдых 5 минут" text="Далее отдых 5 минут."></i>
		 <i id="pomidor5" time="-25" class="icon-leaf-1" title="Работа 25 минут" text="Далее 25 минут работы."></i>
		 <i id="pomidor6" time="-5" class="icon-hourglass" title="Отдых 5 минут" text="Далее отдых 5 минут."></i>
		 <i id="pomidor7" time="-25" class="icon-leaf-1" title="Работа 25 минут" text="Далее 25 минут работы."></i>
		 <i id="pomidor8" time="-15" class="icon-glass" title="Отдых 15 минут" text="Далее отдых 15 минут."></i>
		 </div>
  </div>


  <div class="open_calendars" title="Открыть календарь дневника"><i class="icon-calendar-inv"></i>
  </div><div id="diary_panel">
  		<i class="icon-dot"></i>
	    <div class="h_button"  title="Открыть день в дневнике"> <div class="todaydate">13 ноября</div>&nbsp;
		</div>
		<div class="h_button" title="Открыть неделю в дневнике (новое окно)"><div class="todayweek">(4 нед.)</div></div>
		<!--<div id="diaryright" class="h_button round_right"><i class="icon-right-dir"></i></div>
		<div id="diaryleft" class="h_button round_left"><i class="icon-left-dir"></i></div> -->
  </div>

	
	<div id="search_panel">
  		<input type="text" id="search_filter">
  	</div>
	
</div>

</div>
<div id="below_footer"></div>

<div id="bubu" style="display:none"></div>

<div class="add_new_do popup bottom">
	<div class="add_select_parent">
		Добавить дело в:
		<select>
			<option selected>НОВОЕ</option>
			<option>Рабочее</option>
		</select>
		<div id="diary_calendar"><div class="minicalendarinside"></div></div>
	</div>
</div>


<div id="hotkeyhelper">
	<h4>Горячие клавиши</h4>
	<ul></ul>
</div>

<div class="basket_panel panel popup bottom">
	<ul>
	</ul>
	<div class="basket_bottom basket_panel_menu">
	</div>

</div>

<div class="makedone_arrow"></div>
<div class="makedone_arrow2"></div>
<div class="makedone">
   <div id="makedone_menu"><i class="icon-align-justify"></i>
   
   			    <ul>  
					<li><a class="show_all_in_redactor"><i class='icon-doc-2'></i> Редактировать <b>все</b> заметки этой ветки</a></li>
					<li><a class="show_all_history_redactor"><i class='icon-clock-alt'></i> История изменений заметки</a></li>
					<li class="blank"></li>
					<li><a class="show_mindmap"><i class='icon-leaf'></i> Показать карту ума</a></li>
					<li class="blank"></li>
					<li><a class="send_by_mail"><i class='icon-mail-2'></i> Отправить заметку по эл.почте</a></li>
					<li class="blank"></li>
					<li><i class="icon-stop" style="color:red"></i> Цвет ярлычка
						<ul>
							<li><a class="fav_color fav_red" fav="1"><b>красный</b></a></li>
							<li><a class="fav_color fav_yellow" fav="2"><b>жёлтый</b></a></li>
							<li><a class="fav_color fav_green" fav="3"><b>зелёный</b></a></li>
							<li class="blank"></li>
							<li><a class="fav_color fav_cyan" fav="4"><b>салатовый</b></a></li>
							<li><a class="fav_color fav_blue" fav="5"><b>синий</b></a></li>
							<li><a class="fav_color fav_orange" fav="6"><b>оранжевый</b></a></li>
							<li><a class="fav_color fav_magenta" fav="7"><b>фиолетовый</b></a></li>
							<li class="blank"></li>
							<li><a class="fav_color fav_no" fav="0"><b>без цвета</b></a></li>
						</ul>
					</li>
					<li><i class="icon-camera"></i> Иконка
						<ul>
							<li><a class="fav_icon"><i class="icon-progress-0"></i><b>прогресс 0%</b></a></li>
							<li><a class="fav_icon"><i class="icon-progress-1"></i><b>прогресс 30%</b></a></li>
							<li><a class="fav_icon"><i class="icon-progress-2"></i><b>прогресс 70%</b></a></li>
							<li><a class="fav_icon"><i class="icon-progress-3"></i><b>прогресс 100%</b></a></li>
							<li class="blank"></li>
							<li><a class="fav_icon"><i class="icon-info"></i><b>информация</b></a></li>
							<li><a class="fav_icon"><i class="icon-phone"></i><b>телефон</b></a></li>
							<li><a class="fav_icon"><i class="icon-home"></i><b>дом</b></a></li>
							<li><a class="fav_icon"><i class="icon-pause"></i><b>ожидание</b></a></li>
							<li><a class="fav_icon"><i class="icon-star"></i><b>важное</b></a></li>
							<li><a class="fav_icon"><i class="icon-heart"></i><b>нравится</b></a></li>
							<li><a class="fav_icon"><i class="icon-flag"></i><b>флажок</b></a></li>
							<li><a class="fav_icon"><i class="icon-flight"></i><b>путешествие</b></a></li>
							<li><a class="fav_icon"><i class="icon-mail-2"></i><b>почта</b></a></li>
							<li><a class="fav_icon"><i class="icon-ok"></i><b>сделано</b></a></li>
							<li><a class="fav_icon"><i class="icon-help"></i><b>узнать</b></a></li>
							<li><a class="fav_icon"><i class="icon-eye"></i><b>посмотреть</b></a></li>
							<li><a class="fav_icon"><i class="icon-article-alt"></i><b>статьи</b></a></li>
							<li><a class="fav_icon"><i class="icon-archive"></i><b>архив</b></a></li>
							<li><a class="fav_icon"><i class="icon-pencil-neg"></i><b>писать</b></a></li>
							<li><a class="fav_icon"><i class="icon-basket-1"></i><b>купить</b></a></li>
							<li>Ещё
								<ul>
									<li><a class="fav_icon"><i class="icon-dot"></i><b>приоритет высокий</b></a></li>
									<li><a class="fav_icon"><i class="icon-dot-2"></i><b>приоритет средний</b></a></li>
									<li><a class="fav_icon"><i class="icon-dot-3"></i><b>приоритет низкий</b></a></li>
									<li class="blank"></li>
									<li><a class="fav_icon"><i class="icon-inbox"></i><b>входящие</b></a></li>
									<li><a class="fav_icon"><i class="icon-steering-wheel"></i><b>автомобиль</b></a></li>
									<li><a class="fav_icon"><i class="icon-chart-pie"></i><b>диаграммы</b></a></li>
									<li><a class="fav_icon"><i class="icon-terminal"></i><b>терминал</b></a></li>
									<li><a class="fav_icon"><i class="icon-youtube"></i><b>видеоролики</b></a></li>
									<li><a class="fav_icon"><i class="icon-picture"></i><b>картинки</b></a></li>
									<li><a class="fav_icon"><i class="icon-leaf-1"></i><b>листок</b></a></li>
									<li><a class="fav_icon"><i class="icon-glass"></i><b>праздник</b></a></li>
									<li><a class="fav_icon"><i class="icon-gift"></i><b>подарок</b></a></li>
									<li><a class="fav_icon"><i class="icon-mic"></i><b>записи</b></a></li>
									<li><a class="fav_icon"><i class="icon-target"></i><b>цели</b></a></li>
									<li><a class="fav_icon"><i class="icon-top-list"></i><b>награды</b></a></li>
									<li><a class="fav_icon"><i class="icon-address"></i><b>адреса</b></a></li>
									<li><a class="fav_icon"><i class="icon-print-1"></i><b>печатать</b></a></li>
									<li><a class="fav_icon"><i class="icon-trash"></i><b>мусор</b></a></li>
									<li><a class="fav_icon"><i class="icon-clock-1"></i><b>время</b></a></li>
									<li><a class="fav_icon"><i class="icon-list"></i><b>список</b></a></li>
									<li><a class="fav_icon"><i class="icon-moon"></i><b>ночь</b></a></li>
									<li><a class="fav_icon"><i class="icon-light-up"></i><b>день</b></a></li>
								</ul>
							</li>
							<li>И ещё
								<ul>
									<li><a class="fav_icon"><i class="icon-thumbs-up-1"></i><b>супер</b></a></li>
									<li><a class="fav_icon"><i class="icon-thumbs-down"></i><b>отвратительно</b></a></li>
									<li class="blank"></li>
									<li><a class="fav_icon"><i class="icon-lock"></i><b>закрыто</b></a></li>
									<li><a class="fav_icon"><i class="icon-lock-open"></i><b>открыто</b></a></li>
									<li class="blank"></li>
									<li><a class="fav_icon"><i class="icon-user"></i><b>человек</b></a></li>
									<li><a class="fav_icon"><i class="icon-users-1"></i><b>люди</b></a></li>
									<li><a class="fav_icon"><i class="icon-lamp"></i><b>идея</b></a></li>
									<li><a class="fav_icon"><i class="icon-monitor"></i><b>телевизор</b></a></li>
									<li><a class="fav_icon"><i class="icon-pin"></i><b>запомнить</b></a></li>
									<li><a class="fav_icon"><i class="icon-attach"></i><b>вложения</b></a></li>
									<li><a class="fav_icon"><i class="icon-book"></i><b>прочитано</b></a></li>
									<li><a class="fav_icon"><i class="icon-book-open"></i><b>читать</b></a></li>
									<li><a class="fav_icon"><i class="icon-upload"></i><b>отправить</b></a></li>
									<li><a class="fav_icon"><i class="icon-camera"></i><b>фотографии</b></a></li>
									<li><a class="fav_icon"><i class="icon-at"></i><b>собака</b></a></li>
									<li><a class="fav_icon"><i class="icon-aperture-alt"></i><b>апертура</b></a></li>
									<li><a class="fav_icon"><i class="icon-shuffle"></i><b>всячина</b></a></li>
									<li><a class="fav_icon"><i class="icon-bookmark"></i><b>закладки</b></a></li>
									<li><a class="fav_icon"><i class="icon-wrench"></i><b>настроить</b></a></li>
									<li><a class="fav_icon"><i class="icon-plus-circle"></i><b>плюс</b></a></li>
									<li><a class="fav_icon"><i class="icon-minus-circle"></i><b>минус</b></a></li>
								</ul>
							</li>
						</ul>
					</li>
				</ul>
   </div>
   <div class="makelabel"> выполнено <i class="icon-ok-1"></i>:</div><div id="makedatebutton"> <input type="checkbox" class="on_off" id="on_off_did"></div><br>
   <div class="makelabel">дата <i class="icon-calendar"></i>:</div><div id="makedatebutton"> <input  checked type="checkbox" class="on_off" id="on_off_date"></div>
   <div id="makedate">

	<input id="makedatetime" value="12 мая 2012 12:30:55">

	<div class="makedonecalendar"></div>
   <br>
   <div class="makelabel" style="margin-left:-11px">SMS за 15м <i class="icon-bell-1"></i>:</div><div id="makedatebutton"> <input type="checkbox" class="on_off" id="on_off_sms"></div><br>
<!--   <div class="makelabel" style="margin-left:-11px">Повторять:</div><div class="makerepeat"> каждый год</div> -->
   </div>
   <br>
   <div class="makelabel">поделиться <i class="icon-export-1"></i>:</div><div id="makedatebutton"> <input type="checkbox" class="on_off" id="on_off_share"></div><br>
	<div class="makesharediv">
		<input id="makeshare" readonly="true" value="4tree.ru/gh3">
		<div id="makesharestat_count" title="Кол-во просмотров внешней ссылки. Кликните, чтобы увидеть статистику."><b><i class="icon-eye"></i><span>0</span></b></div>
		<div id="makesharestat">
		</div>
	</div>
	<div class="makedel" title="Удалить элемент"><i class="icon-trash-1" style="color:#999"></i></div>
</div>


<div class="send_mail_form">
	<b>email получателя:</b>
	<input id="email_enter" value="box.valentina@gmail.com"><br>
	<b>тема электронного письма:</b>
	<input id="title_enter" value="Плагин для нахождения разницы между двумя текстами"><br>
	<div id="send_mail" class="s_button"><i class='icon-mail-2'></i> отправить заметку по email</div>
</div>


<div id="all_screen">
	<div id="recur_panel">
	<form id="recur_form">
		<center><h3>Правила повторения</h3></center>
		<div class="recur_close">закрыть</div>

		<div class="recur_label">Повторяется:</div>
		<select name="SelectRemindType">
        <option value="1" selected>каждую неделю</option>
        <option value="2">каждый месяц</option>
        <option value="3">каждый год</option>
        </select>
        <br><br>
		<div class="recur_label">Интервал повторения:</div>
		<select name="SelectRemindInterval">
        <option value="1" selected>1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
        <option value="6">6</option>
        <option value="7">7</option>
        <option value="8">8</option>
        <option value="9">9</option>
        <option value="10">10</option>
        <option value="11">11</option>
        <option value="12">12</option>
        <option value="13">13</option>
        <option value="14">14</option>
        <option value="15">15</option>
        <option value="16">16</option>
        <option value="17">17</option>
        <option value="18">18</option>
        <option value="19">19</option>
        <option value="20">20</option>
        <option value="21">21</option>
        <option value="22">22</option>
        <option value="23">23</option>
        <option value="24">24</option>
        <option value="25">25</option>
        <option value="26">26</option>
        <option value="27">27</option>
        <option value="28">28</option>
        <option value="29">29</option>
        <option value="30">30</option>
        </select>
        <div class="recur_label_right">нед.</div>
        <br><br>
		<div class="recur_label">Дни повторения:</div>
		<input name="w1" class="r_week" type="checkbox"><div class="recur_label_right"> пн</div>
		<input name="w2" class="r_week" type="checkbox"><div class="recur_label_right"> вт</div>
		<input name="w3" class="r_week" type="checkbox"><div class="recur_label_right"> ср</div>
		<input name="w4" class="r_week" type="checkbox"><div class="recur_label_right"> чт</div>
		<input name="w5" class="r_week" type="checkbox"><div class="recur_label_right"> пт</div>
		<input name="w6" class="r_week" type="checkbox"><div class="recur_label_right"> сб</div>
		<input name="w0" class="r_week" type="checkbox"><div class="recur_label_right"> вс</div>
       
        <br><br>
		<div class="recur_label">Дата начала:</div>
        <input name="recur_date1" type="text" class="recur_date1" title="Дата начала" value="12.05.1978">

        <br><br>
		<div class="recur_label">Окончание:</div>
		<input value="1" name="recur_end_radio" type="radio" checked>
        <div class="recur_label_right"> Никогда</div>
        <br>
		<div class="recur_label"></div>
		<input value="2" name="recur_end_radio" type="radio">
        <input name="recur_col" type="text" class="recur_col" title="Кол-во повторений" value="">
        <br>
		<div class="recur_label"></div>
		<input value="3" name="recur_end_radio" type="radio">
        <input name="recur_date2" type="text" class="recur_date1" title="Дата начала" value="">
        
        <br><br>
		<div class="recur_label">Краткое описание:</div>
		<div class="recur_label_right"><b>каждую неделю — воскресение</b></div>


		<br><br><center><div id="s_save" class="s_button">Сохранить</div>&nbsp;&nbsp;&nbsp;&nbsp;<div id="s_close" class="s_button">Отменить</div></center>


	</form>	
	</div>
	
</div>

	<div class="add_do_type" style="opacity:0.5;display:none;">
		<div  title="Информация" class="h_button round_left" id="do_1"><i class="icon-info-circle"></i>
		</div><div title="Звонок" class="h_button" id="do_1"><i class="icon-phone"></i>
		</div><div title="Контакт" class="h_button" id="do_1"><i class="icon-user"></i>
		</div><div title="Дома" class="h_button" id="do_1"><i class="icon-home"></i>
		</div><div title="На работе" class="h_button" id="do_1"><i class="icon-wrench-1"></i>
		</div><div title="Ожидание" class="h_button" id="do_1"><i class="icon-hourglass"></i>
		</div><div title="Написать" class="h_button" id="do_1"><i class="icon-pencil-1"></i>
		</div><div title="Почта" class="h_button" id="do_1"><i class="icon-mail-2"></i>
		</div><div title="Подумать" class="h_button" id="do_1"><i class="icon-lamp"></i>
		</div><div title="Читать" class="h_button" id="do_1"><i class="icon-book-open"></i>
		</div><div title="Поездка" class="h_button" id="do_1"><i class="icon-steering-wheel"></i>
		</div><div title="Купить/Продать" class="h_button round_right" id="do_1"><i class="icon-basket-1"></i>
		</div>			 
	</div> 

					<!-- Шаблоны -->
				<div id="comment_template" style="display:none">
					<div class="comment_box" id="comment_{{id}}">
						<div class="comment_text_box">

							<div class="comment_header">
								<div class="comment_foto">
								    <img src="image.php?width=15&height=15&cropratio=1:1&image=/{{foto}}" height="15px" width="15px" class="comment_foto_img">
								</div>
								<div class="comment_name">{{name}}</div>
								<div class="comment_like">{{likes}}<i class="icon-heart"></i></div>
								<div class="comment_time" time="{{add_time}}">
									{{add_time_txt}} {{{tree_title}}}
								</div>
								<div class="comment_del" title="удалить комментарий"><i class="icon-cancel"></i></div>
								<div class="comment_edit" title="редактировать комментарий"><i class="icon-pencil-1"></i></div>
							</div>

							<div class="comment_text">{{{text}}}</div>
							
							<div class="comment_reply">ответить</div>
							
						</div>
					</div>
				</div>

				<div id="chat_template" style="display:none">
					<div class="chat_inner_box" id="comment_{{id}}">
							<div class="chat-bubble">
							    <div class="chat-bubble-glare"></div>
							    <div class="chat_text">{{{text}}}</div>
							    <div class="chat-bubble-arrow-border"></div>
							    <div class="chat-bubble-arrow"></div>
							 </div>					
						    <div class="chat_time">{{add_time_txt}}</div>
					</div>
				</div>


				
<div class="chat_box" user_id="template">
	<div class="chat_header">
		<div class="chat_user_img"></div><div class="chat_user_name" title="Минимизировать беседу"></div>
		<div class="chat_fullscreen"><i class="icon-resize-full"></i></div>
		<div class="chat_close"><i class="icon-cancel"></i></div>
	</div>
	<div class="chat_inner">
		<div class="chat_content">
		</div>
		<div class="chat_editor">
			<div class="chat_editor_input"></div>
			<div class="chat_send_button" title="Отправить сообщение (ctrl+enter)"><i class='icon-chat-1'></i></div>
		</div>
		
	</div>
</div>

<div class="sync_console">
	<ul>
	</ul>
</div>

<div id="foto_editor" style="display:none">
	<div id="foto_toolbar" class="noselectable">
		<ul>
		 <li id="tool_pencil"><i class="icon-brush"></i></li>
		 <li><i class="icon-picture-1"></i></li>
		 <li><i class="icon-resize-small"></i></li>
		 <li><i class="icon-stop"></i></li>
		 <li><i class="icon-right-thin"></i></li>
		 <li><i class="icon-play"></i></li>
		 <li><i class="icon-font"></i></li>
		 <li><i class="icon-record"></i></li>
		 <li><i class="icon-palette"></i></li>
		 <li><i class="icon-record"></i></li>
		 <li><i class="icon-flow-line"></i></li>
		 <li><i class="icon-vector"></i></li>
		 <li><i class="icon-zoom-out"></i></li>
		 <li><i class="icon-zoom-in"></i></li>
		</ul>
	</div>
	
	<div id="foto_toolbar_actions"  class="noselectable">
		<ul>
		 <li><i class="icon-floppy-1"></i> Сохранить граффити</li>
		 <li><i class="icon-doc-text"></i> Вставить в редактор</li>
		 <li><i class="icon-camera"></i> Добавить фото в граффити</li>
		 <li><i class="icon-export"></i> В новое окно</li>
		 <br>
		 <li><i class="icon-cancel-1"></i> Скрыть окно</li>
		</ul>
	</div>

	<div id="foto_toolbar_settings"  class="noselectable">
	</div>
	
	<div id="foto_canvas" class="noselectable">
	</div>
</div>


</div>

</body>
</html>