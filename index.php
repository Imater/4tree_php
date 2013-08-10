<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="ru" class="<? echo $theme_dark; ?>" style="background-image:url(<? echo $theme_img; ?>)" <?
require_once("compress_timestamp.php");
echo $_SERVER["SERVER_ADDR"];
if( ($_SERVER["SERVER_ADDR"]!="127.0.0.1") AND ($_SERVER["HTTP_HOST"]!="localhost") AND ($_SERVER["HTTP_HOST"]!="192.168.0.52")) echo "manifest='!".$compress_stamp."_manifest.appcache'"; ?> >
<!-- 1browser_manifest !!-->

<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=utf-8">

<meta charset="utf-8">

<meta name="viewport" content="width=device-width, initial-scale=1">

<head>
<title>4tree.ru — мои дела</title>
<meta name="description" content="Сайт для ведения дел, заметок, календаря и так далее. Инструмент таймменеджмента, где всё нужное собранно в одном месте."/>
<meta name="keywords" content="gtd, 4tree.ru, заметки, задачи, гтд, таймменеджмент, хранение заметок, календарь"/>
<script src="js/jquery-1.10.1.min.js"></script>
<script src="js/testdesign.js"></script>
<script src="js/jquery-ui-1.10.3.custom.min.js"></script>
<script src="js/scrollable.js"></script>
<script src="js/rangy-core.js"></script>
<script src="js/rangy-selectionsaverestore.js"></script>
<?
if (stripos($_SERVER['HTTP_ACCEPT_ENCODING'],'GZIP')!==false)   
        $gz='gz';
 else
        $gz=null;
        
if($_SERVER["SERVER_ADDR"]=="127.0.0.1") echo "<div style='position:absolute;bottom:3px; right: 300px;z-index:9999;font-size:9px;'>local</div>";
                
if( ($_SERVER["SERVER_ADDR"]!="127.0.0.1") AND ($_SERVER["HTTP_HOST"]!="localhost") AND ($_SERVER["HTTP_HOST"]!="192.168.0.52")) {
	echo '<script src="min/all_'.$compress_stamp.'.js'.$gz.'" /></script>',PHP_EOL;
	echo '<link rel="stylesheet" type="text/css" href="min/styles_'.$compress_stamp.'.css'.$gz.'" />',PHP_EOL;
} else {

	echo '
    <link rel="stylesheet" type="text/css" href="css/ui/css/smoothness/jquery-ui-1.8.21.custom.css"/>
    <link rel="stylesheet" type="text/css" href="css/iphone.css"/>
    <link rel="stylesheet" type="text/css" href="redactor904/redactor/redactor.css"/>
    <link rel="stylesheet" type="text/css" href="css/4tree-styles.css"/>
    <link rel="stylesheet" type="text/css" href="fullcalendar-1.6.1/fullcalendar/fullcalendar.css"/>
    <link rel="stylesheet" type="text/css" href="css/4tree-foto.css"/>
    <link rel="stylesheet" type="text/css" href="css/test-design.css"/>
    <link rel="stylesheet" type="text/css" href="css/jqueryslidemenu.css"/>';

//	<script src="js/less-1.3.3.min.js"></script>

	echo '<script src="js/jquery.cookie.min.js"></script>
	  	  <script src="js/login.js"></script>
	  	  <script src="js/fastclick2.js"></script>
	  	  <script src="js/jquery.jsPlumb-1.4.1-all.js"></script>
	  	  <script src="js/handlebars.js"></script>
	  	  <script src="js/md5.js"></script>
	  	  <script src="js/jquery.idle-timer.js"></script>
	  	  <script src="4tree_extension/diff_match_patch/javascript/diff_match_patch_uncompressed.js"></script>
	  	  <script src="js/parser.js"></script>
	  	  <script src="js/4tree-foto.js"></script>
	  	  <script src="js/loader.js"></script>
	  	  <script src="js/jquery.datetimeentry2.min.js"></script>
	  	  <script src="js/jquery.datetimeentry-ru.js"></script>
	  	  <script src="fullcalendar-1.6.1/fullcalendar/fullcalendar.js"></script>
	  	  <script src="js/pushstream.js"></script>
	  	  <script src="js/js_regallkeys.js"></script>
	  	  <script src="js/api4tree.js"></script>
	  	  <script src="js/all_new.js"></script>
	  	  <script src="js/ydn.db-jquery-0.7.5.js"></script>
	  	  <script src="redactor904/redactor/redactor.js"></script>
	  	  <script src="redactor904/redactor/ru.js"></script>
	  	  <script src="js/iphone-style-checkboxes.js"></script>
	  	  <script src="js/jszip.js"></script>
	  	  <script src="js/vcdiff.js"></script>
	  	  <script src="js/rangy-core.js"></script>
	  	  <script src="js/jqueryslidemenu.js"></script>
	  	  <script src="js/mjs.js"></script>	  	  
	  	  <script src="js/rangy-selectionsaverestore.js"></script>';
	
}

//	<script src="js/!sync_modul.js"></script>


if(isset($_GET['test']))
	{
	echo '
	<link rel="stylesheet" href="js/qunit-1.11.0.css" type="text/css" media="screen">
	<script type="text/javascript" src="js/qunit-1.11.0.js"></script>
	<script src="js/!test.js"></script>
	';
	}

?>

<script>

$(document).ready(function(){
	FastClick.attach(document.body);
	jsLoginUser();

});

</script>


<link rel="search" type="application/opensearchdescription+xml" title="4tree.ru Добавление дел" href="/SearchEngineInfo.xml" />


<link rel="shortcut icon" href="favicon1.png" type="image/x-icon" />
<link rel="icon" href="favicon1.png" type="image/x-icon" />

<link rel="stylesheet" type="text/css" href="fontello/css/fontello.css"/>

</head>

<body onResize="onResize();" class="">

<div id="welcome_screen"></div>
<div id="load_screen" class='<? echo $theme_dark; ?>' style="background-image:url('<? echo $theme_img; ?>');top:0px;bottom:-1px;left:0px;right:0px;background-color:white;position:absolute;z-index:999;padding-top:185px;"><center><div id='pload_text'>Загрузка...</div><br><div id="progress_bar" style="width:300px;overflow:hidden;background-color:rgb(151,252,0);height:5px;margin-top:25px;border:1px solid #000;border-radius:3px;"><div id="inside_bar" style="float:left;background-color:rgb(36,150,0);height:10px;margin-left:-3px;display:inline-block;width:10px;"></div></div><a style="color:rgb(65,109,0);margin-top:280px;display:block" href="./4tree.php"><h2>4tree.ru</h2></a>
<font style="font-size:15px"><? echo $compress_stamp; ?></font>
</div></center></div>


	<div id="tree_wrap">

		<div class="tree_add_do">
			<input x-webkit-speech placeholder="Добавить...">
		</div>
		


<div id="myslidemenu" class="jqueryslidemenu noselectable" style="z-index:50">
<ul>
<li class="top_level">
	<a>
				<span class="for_sos">
					<div class="sos" title="Главное меню"><i class="icon-cd"></i><div id="myloader"></div></div>	
				</span>
	&nbsp;</a>
<ul>
<li><a href="#">4tree.ru</a>
    <ul>  
        <li><a><i class="icon-hourglass"></i>Таймер</a>
            <ul>  
                <li><a class="timer_button" time="-1">1 минута</a></li>  
                <li><a class="timer_button" time="-5"><b>5 минут</b></a></li>  
                <li><a class="timer_button" time="-10">10 минут</a></li>  
                <li><a class="timer_button" time="-15"><b>15 минут</b></a></li>  
                <li><a class="timer_button" time="-20">20 минут</a></li>  
                <li><span class="m_key">alt + g</span><a class="timer_button" time="-25"><i class="icon-record"></i><b>25 минут</b></a></li>  
                <li><a class="timer_button" time="-30">30 минут</a></li>  
                <li><a class="timer_button" time="-40">40 минут</a></li>  
                <li><a class="timer_button" time="-50">50 минут</a></li>  
                <li><a class="timer_button" time="-60">60 минут</a></li>  
                <li><a class="timer_button" time="-90">90 минут</a></li>  
                <li><a class="timer_button" time="-120">120 минут</a></li>  
                <li class="blank"></li>
                <li><a href="http://mydebianblog.blogspot.ru/2012/08/pomodoro.html" target="_blank">Что такое Pomodorro?</a></li>  
                <li class="blank"></li>
                <li><a id="cancel_timer" time="0">Отменить таймер</a></li>  
            </ul>  
        </li>  
        <li><a><i class="icon-cloud"></i>Синхронизация</a>
        	<ul>
            	<li><span class="m_key">alt + r</span><a class="m_refresh">Синхронизировать с сервером</a></li>  
            	<li><a>Загрузить с сервера</a>
            		<ul>
						<li><a class="m_refresh_all">Заново</a></li>  
					</ul>
				</li>
            </ul>
        </li>
        <li class="blank"></li>
        <li><a id="show_settings"><i class="icon-cog-2"></i>Настройки</a></li>
        <li class="blank"></li>

		<li><a href="http://reformal.4tree.ru" onclick="window.open('http://reformal.4tree.ru');return false;"><i class="icon-thumbs-up"></i>Oтзывы и предложения (reformal.ru)</a><script type="text/javascript">
    var reformalOptions = {
        project_id: 105149,
        show_tab: false,
        project_host: "reformal.4tree.ru",
        force_new_window: true
    };
    
    (function() {
        var script = document.createElement('script');
        script.type = 'text/javascript'; script.async = true;
        script.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'media.reformal.ru/widgets/v3/reformal.js';
        document.getElementsByTagName('head')[0].appendChild(script);
    })();
</script><noscript><a href="http://reformal.ru"><img src="http://media.reformal.ru/reformal.png" /></a><a href="http://reformal.4tree.ru">Oтзывы и предложения для 4tree.ru — дела, календарь, заметки, файлы. Всё в одном месте. </a></noscript></li>

        <li class="blank"></li>
        <li>
        	<a href="./!versions.html?<? echo $compress_stamp; ?>" target="_blank"><i class="icon-info-circle"></i>Что нового в версии <span id="this_version"><? echo $compress_stamp; ?></span></a>
        </li>
    </ul>  


</li>


<li class="" dont_close="true"><a href="#">Вид</a>
  <ul>
      <li dont_close="true"><input type="checkbox" class="on_off" id="on_off_hide_did"></input><a class="show_hidden_do" style="margin-right:90px;">Показывать выполненные дела</a></li>
      <li class="blank"></li> <!-- separator -->  
	  <li><a href="#">Масштаб дерева</a>
	  		<ul>
		  		<li dont_close="true"><span class="m_key">alt <i class="icon-plus-circle"></i></span><a class="m_zoom_in">Увеличить масштаб дерева</a></li>  
		  		<li dont_close="true"><span class="m_key">alt <i class="icon-minus-circle"></i></span><a class="m_zoom_out">Уменьшить масштаб дерева</a></li>  
		  		<li dont_close="true"><span class="m_key">alt+"0"</span><a class="m_zoom_default">Масштаб дерева по умолчанию</a></li>  
	  		</ul>
	  </li>
	  <li style="display:none"><a href="#">Фокус</a>
	  		<ul>
	  		    <li><a href="#">Установить</a></li>
	  		    <li><a href="#">Снять</a></li>
	  		    <li><a href="#">На уровень выше</a></li>
	  		</ul>
	  </li>
  </ul>
</li>

<li class=""><a href="#">Поделиться</a>
	<ul>
        <li style="display:none"><a href="#">Контакты</a>
			<ul>
			    <li><a href="#">Вецель Евгений</a>
					<ul>
						<li><a>чат</a></li>
						<li><a>поделилась со мной</a></li>
						<li><a>я делюсь с ней</a></li>
					</ul>
			    </li>			    
			</ul>
        </li>
        
        <li style="display:none"><a href="#">Поделиться текущей папкой</a>
			<ul>
			    <li><a href="#">Только для чтения</a></li>
			    <li><a href="#">Полные права на редактирование</a></li>
			    <li><a href="#">На мой сайт</a></li>
			</ul>
        </li>
        <li class="blank"></li> <!-- separator -->  
        <li><a href="#">Отправить текущую заметку</a>
			<ul>
                <li><a class="send_by_mail"><i class='icon-mail-2'></i> По электронной почте</a></li>  
                <li style="display:none"><a>Короткая ссылка</a></li>  
			</ul>
        </li>
    </ul>
</li>

<li class="" id="all_my_favorits"><a href="#">Избранные</a>
  <ul>
  </ul>
</li>

<li  style="display:none" class=""><a href="http://www.dynamicdrive.com/style/">Правка</a>
  <ul>
  <li><a href="#">Undo/Redo/History</a>
    <ul>
    <li><span class="m_key">ctrl + z</span><a><i class="icon-fast-bw"></i>Отменить один шаг редактирования</a></li>  
    <li><span class="m_key">ctrl + shift + z</span><a><i class="icon-fast-fw"></i>Вернуть один шаг редактирования</a></li>  
    <li><a href="#"><i class="icon-clock-1"></i>История изменений текущей заметки</a></li>
    </ul>
  </li>  
  <li class="blank"></li> <!-- separator -->  
  <li><a href="#"><i class="icon-scissors"></i>Вырезать дело</a></li>
  <li><a href="#"><i class="icon-docs"></i>Скопировать дело</a></li>
  <li><a href="#"><i class="icon-list-add"></i>Вставить дело</a></li>
  <li><a href="#"><i class="icon-dot-2"></i>Дублировать папку</a></li>
  <li class="blank"></li> <!-- separator -->  
  <li><a href="#"><i class="icon-feather"></i>Вставить Граффити</a></li>
  <li><a href="#"><i class="icon-print"></i>Печать содержимого редактора</a></li>
  <li><a href="#"><i class="icon-arrow-combo"></i>Упорядочить</a>
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

<li class=""><a href="#"><b><i class='icon-plus'></i>Добавить</b></a>
	<ul>
        <li><span class="m_key">alt + <i class="icon-down"></i></span><a href="#" class="add_do_down"><i class='icon-down-1'></i> Дело вниз</a></li>
        <li><span class="m_key">alt + <i class="icon-right"></i></span><a href="#" class="add_do_right"><i class='icon-right-1'></i> Дело вправо</a></li>
        <li class="blank"></li> <!-- separator -->  
        <li><a href="#">Запись в сегодняшний дневник</a>
			<ul>
			    <li><span class="m_key">alt + p</span><a href="javascript:api4tree.jsAskForPomidor();"><i class='icon-record'></i>Завершённую "помидорку"</a></li>
			    <li style="display:none"><a href="#">Комментарий</a></li>
			</ul>
        </li>
    </ul>
        <li id="exit_and_purge" title="Удаление ваших персональных данных в этом браузере (но не на сервере)"><a><i class="icon-cancel-1"></i>Выход</a></li>
</li>

</ul>
</li>
</ul>



</div> <!-- myslidemenu -->




		<div id="tree_header">
			<ul class="tree_tab_menu tabs clearfix noselectable">
			<!--	<li><a>Дерево</a><i class="icon-cancel"></i></li> -->
				<li class="add_tab" title="Добавить запись в папку _НОВОЕ"><i class="icon-plus"></i></li>
			</ul>
		<div id="tree_fav">
		</div>
		</div>
		<div id="close_all_tabs_except_current"><i class="icon-cancel-circle"></i></div>
		
	  <div class="resize_me"></div>
		
	  <div id="tree_left_panel" class="">
		<div id="top_panel_header">
		</div>
		<div class="top_panel panel_type1">
			<div class="mypanel tree_active" style="" id="tree_1">
			</div>
		</div>
		<div id="left_calendar" class="clean_calendar">
			<div class="gradient_line"></div>
		</div>
		
		<div id="tree_footer2">
			<ul class="tree_footer_menu2">
				<li id = "tab_calendar" title="Большой календарь"><a><i class="icon-calendar-2"></i></a></li>
				<li id = "tab_files" title="Файлы и картинки"><a><i class="icon-attach-1"></i></a></li>
				<li id = "tab_news" title="Новые комментарии"><a><i class="icon-rss"></i></a></li>
				<li id = "tab_find" title="Панель поиска"><a><i class="icon-search"></i></a></li>
			</ul>
		</div>
		
		<div class="tree_search">
			<input id="search_filter" placeholder="Искать...">
		</div>

	    <div class="tree_footer">

		      <div id="pomidoro_icon" class="noselectable" time="0">
				      <i id="pomidor1" time="-25" class="icon-record" title="Работа 25 минут" text="Далее 25 минут работы."></i>
				      <i id="pomidor2" time="-5" class="icon-hourglass" title="Отдых 5 минут" text="Далее отдых 5 минут."></i>
				      <i id="pomidor3" time="-25" class="icon-record" title="Работа 25 минут" text="Далее 25 минут работы."></i>
				      <i id="pomidor4" time="-5" class="icon-hourglass" title="Отдых 5 минут" text="Далее отдых 5 минут."></i>
				      <i id="pomidor5" time="-25" class="icon-record" title="Работа 25 минут" text="Далее 25 минут работы."></i>
				      <i id="pomidor6" time="-5" class="icon-hourglass" title="Отдых 5 минут" text="Далее отдых 5 минут."></i>
				      <i id="pomidor7" time="-25" class="icon-record" title="Работа 25 минут" text="Далее 25 минут работы."></i>
				      <i id="pomidor8" time="-15" class="icon-glass" title="Отдых 15 минут" text="Далее отдых 15 минут."></i>
		      </div>

		      <div id="pomidor" title="Таймер">
				  <div id="pomidor_scale">&nbsp;</div>
				  <div id="pomidor_bottom">&nbsp;</div>
			 </div>
			 <i title="Панель таймеров Pomodorro" id="show_pomidors_panel" class="icon-hourglass"></i>

	    </div>

	  </div> <!-- tree_left_panel -->
	  
	  
	  	  <div id="tree_right_panel" class="noselectable">
		  	<div id="top_panel_header_right">
			</div>
			<div id="right_tags">
				<ul id="tags_ul">
					<li class="top_label"><div class="label">Домашние ярлыки</div>
						<ul>
							<li>@Срочно								
								<ul class="tags_content">
									<li><i class="icon-folder-1"></i>Мозг</li>
									<li><i class="icon-folder-1"></i>Задуматься</li>
									<li><i class="icon-folder-1"></i>Цели в жизни</li>
									<li><i class="icon-folder-1"></i>Потом</li>
									<li><i class="icon-folder-1"></i>Разобрать</li>
									<li><i class="icon-folder-1"></i>Уборка</li>
								</ul>
							</li>
							<li>@Мысли
								<ul class="tags_content">
									<li><i class="icon-folder-1"></i>Новый завет</li>
									<li><i class="icon-folder-1"></i>Не забыть сходить подстричься в парикмахерскую на углу второй улици справа от фонтана</li>
									<li><i class="icon-folder-1"></i>Цели в жизни</li>
									<li><i class="icon-folder-1"></i>Потом</li>
									<li><i class="icon-folder-1"></i>Разобрать</li>
									<li><i class="icon-folder-1"></i>Уборка</li>
								</ul>
							</li>
							<li>@4tree</li>
							<li>@На сайт</li>
							<li>@Магазин</li>
							<li>@Обдумать</li>
							<li>@Разобрать</li>
						</ul>
					 </li>
					<li class="top_label"><div class="label">Рабочие ярлыки</div>
						<ul>
							<li>@Срочно</li>
							<li>@Новый компьютер</li>
							<li>@Компьютер</li>
							<li>@Телефон</li>
							<li>@Босс</li>
							<li>@Поручения</li>
							<li>@Календарь</li>
							<li>@Выставить</li>
							<li>@Платежи</li>
							<li>@Оплачено</li>
							<li>@Долги</li>
							<li>@Купить</li>
							<li>@Стройка</li>
							<li>@Обязательства</li>
						</ul>
					 </li>
					<li class="top_label"><div class="label">Остальные ярлыки</div>
						<ul>
							<li>@Мозг</li>
							<li>@Задуматься</li>
							<li>@Цели в жизни</li>
							<li>@Потом</li>
							<li>@Разобрать</li>
							<li>@Уборка</li>
						</ul>
					 </li>


					<li class="top_label"><div class="label">Домашние ярлыки</div>
						<ul>
							<li>@Срочно</li>
							<li>@Мысли</li>
							<li>@4tree</li>
							<li>@На сайт</li>
							<li>@Магазин</li>
							<li>@Обдумать</li>
							<li>@Разобрать</li>
						</ul>
					 </li>
					<li class="top_label"><div class="label">Рабочие ярлыки</div>
						<ul>
							<li>@Срочно</li>
							<li>@Новый компьютер</li>
							<li>@Компьютер</li>
							<li>@Телефон</li>
							<li>@Босс</li>
							<li>@Поручения</li>
							<li>@Календарь</li>
							<li>@Выставить</li>
							<li>@Платежи</li>
							<li>@Оплачено</li>
							<li>@Долги</li>
							<li>@Купить</li>
							<li>@Стройка</li>
							<li>@Обязательства</li>
						</ul>
					 </li>
					<li class="top_label"><div class="label">Остальные ярлыки</div>
						<ul>
							<li>@Мозг</li>
							<li>@Задуматься</li>
							<li>@Цели в жизни</li>
							<li>@Потом</li>
							<li>@Разобрать</li>
							<li>@Уборка</li>
						</ul>
					 </li>

					<li class="top_label"><div class="label">Домашние ярлыки</div>
						<ul>
							<li>@Срочно</li>
							<li>@Мысли</li>
							<li>@4tree</li>
							<li>@На сайт</li>
							<li>@Магазин</li>
							<li>@Обдумать</li>
							<li>@Разобрать</li>
						</ul>
					 </li>
					<li class="top_label"><div class="label">Рабочие ярлыки</div>
						<ul>
							<li>@Срочно</li>
							<li>@Новый компьютер</li>
							<li>@Компьютер</li>
							<li>@Телефон</li>
							<li>@Босс</li>
							<li>@Поручения</li>
							<li>@Календарь</li>
							<li>@Выставить</li>
							<li>@Платежи</li>
							<li>@Оплачено</li>
							<li>@Долги</li>
							<li>@Купить</li>
							<li>@Стройка</li>
							<li>@Обязательства</li>
						</ul>
					 </li>
					<li class="top_label"><div class="label">Остальные ярлыки</div>
						<ul>
							<li>@Мозг</li>
							<li>@Задуматься</li>
							<li>@Цели в жизни</li>
							<li>@Потом</li>
							<li>@Разобрать</li>
							<li>@Уборка</li>
						</ul>
					 </li>

				</ul>
			</div>
			
			<div id="right_fav_folders">
				<ul class="">
					<li>_НОВОЕ</li>
					<li>ДНЕВНИК</li>
					<li>МЫСЛИ</li>
					<li>АСТД</li>
					<li>ОБДУМАТЬ</li>
					<li>4TREE.RU</li>

				</ul>
			</div>
			
		    <div class="tree_footer">
				<div id="open_favorits"><i class="icon-down-open"></i>Избранное</div>
		    </div>
		  </div>


  		  <div id="params_header" class="noselectable">
  		  	<div class="top_btn first" id="hide_left_panel" title="Левая панель"><i class="icon-left-open arrow"></i><i class="icon-doc"></i></div>
  		  	<div class="top_btn second" id="open_params" title="Верхняя панель (второе дерево)"><i class="icon-down-open arrow"></i><i class="icon-docs-landscape"></i></div>

			<div id="path_tree" class="path_line">
				<ul></ul>
			</div>

  		  	<div class="top_btn" id="open_right_panel_btn" title="Ярлыки (теги)"><i class="icon-tag"></i><i id="right-panel-arrow" class="icon-left-open"></i></div>
  		  	<div class="top_btn makedel"><i class="icon-trash"></i></div>
  		  </div>


	  
	  <div id="tree_editor" class="bottom_open_no">
		  		  <div id="params_panel">
		  		  Панель параметров
		  		  </div>

		  	  <div id="tree_center">
			  	  <div class="top_panel2 panel_type3">
			  	      <div class="mypanel" style="" id="tree_2">
			  	      </div>
			  	  </div>
		  	  </div>
	  		  
	  		  <div class="all_editor_place" class="needsclick">
	  		  
	  		  <div id="myslidemenu" class="jqueryslidemenu noselectable" style="z-index:50">
		  		  <ul>
		  		  <li class="top_level">
		  		      <a><i class="icon-th-list" style="color: #000;
font-size: 22px;
display: inline-block;
top: 5px;
left: 10px; "></i>&nbsp;</a>
		  			  	<ul>
		  			  	<li><a onclick="jsRedactorInsert('checkbox')">Вставить галочку (alt + c)</a></li>
		  			  	<li><a onclick="jsRedactorInsert('datetime')">Вставить дату (alt + x)</a></li>
		  			  	</ul>
		  		  </li>
		  		  </ul>
	  		  </div>

	  		  
	  		  
			  <div id="wiki_back_button" title="Вернуться назад в wiki"><i class="icon-left-bold"></i> вернуться</div>
			  <div class="noselectable" id="fav_redactor_btn"></div>
			  <div class="noselectable" id="fav_redactor_btn_comment"></div>
	  			<textarea id="redactor">
	  			</textarea>	  
	  		  </div>
	  	  
	  	<div class="calendar_and_others">
	  	<div id="resize_me2"></div>
				
				
				<div class="search_panel_result panel_type3">
	  				<div id="news_header">
		  				<span style="margin: 3px 15px;
display: inline-block;
font-size: 10px;
font-weight: bold;">Поиск</span>
		  			</div>
					<ul>
					  <li>Введите фразу для поиска или <br>выражение для калькулятора: <i>2+(2^2)*(1+1)*10/2</i></li>
					</ul>
				</div>
	  			<div class="search_arrow"></div>

	  			<div id="tree_news">
	  				<div id="news_header">
		  				<li class="active">Новые комментарии</li>
		  			</div>
            <div id="tree_news_content">
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

    			<div class="favorit_menu noselectable" style="bottom:10px;">
    				<ul>
    				</ul>
    			</div>

	  		</div> <!-- calendar_and_others -->
	  
	  
	  
	  	  
	   <div class="tree_footer">
	   		<i class="icon-left-open icon_box"></i>
	   		<div class="f_text"></div>
		    <i class="icon-right-open float_right">&nbsp;</i>&nbsp;
	   </div>
	</div> <!-- tree_editor -->
	


		<div id="tree_shelf">

			<div class="shelf"><!-- shelf wrapper begin -->
			  <div class="row" style="border-top:8px solid #444;"><!-- row begin -->
			    <div class="border">
			      <div class="inner">&nbsp;</div><!-- content here -->
			    </div>
			  </div><!-- row end -->
			  <div class="row">
			    <div class="border">
			      <div class="inner">&nbsp;</div>
			    </div>
			  </div>
			  <div class="row">
			    <div class="border">
			      <div class="inner">&nbsp;</div>
			    </div>
			  </div>
			  <div class="row">
			    <div class="border">
			      <div class="inner">&nbsp;</div>
			    </div>
			  </div>
			  <div class="row">
			    <div class="border">
			      <div class="inner">&nbsp;</div>
			    </div>
			  </div>
			</div><!-- shelf wrapper end -->

			<div class="one_book" style="background:#ffe1b5">Статья про Пежо 208</div>
			<div class="one_book" style="background:#fff">Когда-нибудь</div>
			<div class="one_book" style="background:#d0ffb0">Изначальная папка</div>
			<div class="one_book" style="background:#9effb5">По автомобилям</div>
			<div class="one_book" style="background:#b2b3ff">Про личную эффективность</div>
			<div class="one_book" style="background:#ffb9f7">GTD лучший мир</div>
			<div class="one_book" style="background:#ffadad">Создание ZIP архива</div>
		</div>


		


					<!-- Шаблоны -->
				<div id="comment_template" style="display:none">
					<div class="comment_box" id="comment_{{id}}">
						<div class="comment_text_box">

							<div class="comment_header">
								<div class="comment_foto">
								    <img src="" style="background-size:15px 15px;background-image:url(images/{{foto}}?width=20&height=20)" height="15px" width="15px" class="comment_foto_img">
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

			<div id="tree_comments">
				<div class="gradient_line"></div>
				<div id="tree_comments_container">
				</div>
				<div id="comment_enter_place">
					<div id="comment_enter">
						<!-- <div class="fullscreen_button icon-resize-full" title="На весь экран"></div> -->
						<div class="comment_enter_input"></div>
						<div class="comment_send_button" title="alt+enter">отправить <span style='color:#DFDFDF'>(alt+enter)</span></div>
					</div>
				</div>
				
			</div>


<div class="makedone">
	   <div class="makedone_header noselectable">
	   		<ul>
	   			<li myid="makedone_page_1">Даты</li>
	   			<li myid="makedone_page_2">Ссылка</li>
	   			<li myid="makedone_page_3">Иконка</li>
	   			<li myid="makedone_page_4">Сервис</li>
	   		</ul>
	   </div>
	   	   
	   <div class="makedone_pages">

		   <div class="makedone_page_1 page">
			    <div class="mini_label" id="clear_dates">без дат</div>
				<input id="makedone_date1" value="27.07.2013"><input id="makedone_time1" value="22:30">&nbsp;—&nbsp; 
				<input id="makedone_time2" value="23:30"><input id="makedone_date2" value="27.07.2013">
				<div class="mini_label" id="clear_times">весь день</div>
				<br>

			   <div id="makedate">
			   <br>
			   <div class="makelabel" style="margin-left:-11px">SMS за <span id="remind_time">15 мин.</span> <i class="icon-bell-1"></i>:</div><div id="makedatebutton2"> <input type="checkbox" class="on_off" id="on_off_sms"></div>
			<!--   <div class="makelabel" style="margin-left:-11px">Повторять:</div><div class="makerepeat"> каждый год</div> -->
			   </div>
			</div> <!-- page1 -->
			
		    <div class="makedone_page_2 page">
			   <div class="makelabel">поделиться короткой ссылкой:</div><div id="makedatebutton2"> <input type="checkbox" class="on_off" id="on_off_share"></div><br>
				<div class="makesharediv">
					<input id="makeshare" value="4tree.ru/gh3">
					<div id="makesharestat_count" title="Кол-во просмотров внешней ссылки. Кликните, чтобы увидеть статистику."><b><i class="icon-eye"></i><span>0</span></b></div>
					<div id="makesharestat">
					</div>
				</div>

		    </div> <!-- page2 -->

		    <div class="makedone_page_3 page">
		    	<div id="icons_and_colors"></div>
		    	<div id="clear_all_icons"><i class="icon-cancel-circle"></i>без иконки</div>
		    	<div id="select_color_of_folder">
						<ul>
							<li><a class="fav_color fav_red" fav="1"><i class="icon-folder-1"></i></a></li>
							<li><a class="fav_color fav_yellow" fav="2"><i class="icon-folder-1"></i></a></li>
							<li><a class="fav_color fav_green" fav="3"><i class="icon-folder-1"></i></a></li>
							<li><a class="fav_color fav_cyan" fav="4"><i class="icon-folder-1"></i></a></li>
							<li><a class="fav_color fav_blue" fav="5"><i class="icon-folder-1"></i></a></li>
							<li><a class="fav_color fav_orange" fav="6"><i class="icon-folder-1"></i></a></li>
							<li><a class="fav_color fav_magenta" fav="7"><i class="icon-folder-1"></i></a></li><br><br>
							<li><a class="fav_color fav_no" fav="0"><i class="icon-folder-1"></i></a></li>
						</ul>
				</div>
		    </div> <!-- page2 -->

		    <div class="makedone_page_4 page">
		    	<a onclick="javascript:api4tree.jsCallPrint('.redactor_');"><i class="icon-print-1"></i> Распечатать заметку</a><br><br>
		    	<span class="show_all_history_redactor"><i class="icon-layers"></i> Резервные копии заметки</span>
		    </div> <!-- page2 -->
		    
			
		</div> <!-- pages -->
 	    <div id="makedatebutton" title="Установить/снять статус: выполнено"> <input type="checkbox" class="on_off_" id="on_off_did"></div>
	    <div class="makedone_h1" contenteditable="true"></div>
		<div class="header_text" style=""></div>
		<div class="gradient_line"></div>

<!--	<div class="makedel" title="Удалить элемент"><i class="icon-trash-1" style="color:#999"></i></div> -->
</div>

<div class="send_mail_form">
	<b>email получателя:</b>
	<input id="email_enter" value="box.valentina@gmail.com"><br>
	<b>тема электронного письма:</b>
	<input id="title_enter" value="Плагин для нахождения разницы между двумя текстами"><br>
	<div id="send_mail" class="s_button"><i class='icon-mail-2'></i> отправить заметку по email</div>
</div>

<div id="hotkeyhelper">
	<h4>Горячие клавиши</h4>
	<ul></ul>
</div>



<div id="tree_settings" style="display:none">
	<h2>Настройки</h2>
	<form id="tree_settings_form">
	<div class="set_center">
	<div class="left_label">Фамилия Имя:</div>
	<div class="right_set"><input tabindex=1 name='fio' value='Вецель Евгений' placeholder="Петров Иван"></input></div>
	<br><br>
	<div class="left_label">Email №1:</div>
	<div class="right_set"><input tabindex=2 name='email1' value='' placeholder="4tree@4tree.ru" ></input></div>
	<div class="left_label">Email №2:</div>
	<div class="right_set"><input tabindex=3 name='email2' value='' placeholder="4tree@4tree.ru" ></input></div>
	<div class="left_label">Email №3:</div>
	<div class="right_set"><input tabindex=4 name='email3' value='' placeholder="4tree@4tree.ru" ></input></div>
	<div class="left_label">Email №4:</div>
	<div class="right_set"><input tabindex=5 name='email4' value='' placeholder="4tree@4tree.ru" ></input></div><br>
	<div class="description">Письма отправленные с этих адресов на 4tree@4tree.ru, будут складываться в папку "_НОВОЕ"</div>
	<br><br>
	<div class="left_label">Номер телефона для SMS:</div>
	<div class="right_set"><input tabindex=6 name='mobilephone' value='' placeholder="79221234567"></input></div><br>
	<br>
	<div class="left_label">Ваша фотография:</div>
	<div class="right_set"><input tabindex=7 name='foto' value='' placeholder="http://4tree.ru/upload/1.jpg"></input></div><br>
	<br>
	<div class="is_female">
		<input type="radio" class="radio" name="gender" value="male" id="male" checked="true"/>
		<label for="male">Мужчина</label>
		<input type="radio" class="radio" name="gender" value="female" id="femail" />
		<label for="female">Женщина</label>
	</div>
    <br>
    <div id="login_social_form">. . .</div>
    	<div class="left_label"></div>
    <br>
	<div class="right_set" style="text-align:center;width:100%;">
	<div id='send_settings' class='button_send' style="margin-left:10px;">Сохранить</div>
	<div id='close_settings' class='button_send' style="margin-left:10px">Закрыть</div>
	</div>
	
	</form>
	
	<div class="set_center">
</div>





		
		
</body>
