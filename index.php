<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="ru" class="<? echo $theme_dark; ?>" style="background-image:url(<? echo $theme_img; ?>)" <? if( ($_SERVER["HTTP_HOST"]!="localhost") AND ($_SERVER["HTTP_HOST"]!="192.168.0.52")) echo "manifest='!".$compress_stamp."_manifest.appcache'"; ?> >
<!-- 1browser_manifest !!-->

<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=utf-8">

<meta charset="utf-8">

<head>
<title>4tree.ru — мои дела</title>
<meta name="description" content="Сайт для ведения дел, заметок, календаря и так далее. Инструмент таймменеджмента, где всё нужное собранно в одном месте."/>
<meta name="keywords" content="gtd, 4tree.ru, заметки, задачи, гтд, таймменеджмент, хранение заметок, календарь"/>
<script src="js/jquery-1.10.1.min.js"></script>
<script src="js/testdesign.js"></script>
<script src="js/jquery-ui-1.10.3.custom.min.js"></script>
<script src="js/scrollable.js"></script>
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

<body onResize="onResize();">

<div id="welcome_screen"></div>
<div id="load_screen" class='<? echo $theme_dark; ?>' style="background-image:url('<? echo $theme_img; ?>');top:0px;bottom:-1px;left:0px;right:0px;background-color:white;position:absolute;z-index:999;padding-top:185px;"><center><div id='pload_text'>Загрузка...</div><br><div id="progress_bar" style="width:300px;overflow:hidden;background-color:rgb(151,252,0);height:5px;margin-top:25px;border:1px solid #000;border-radius:3px;"><div id="inside_bar" style="float:left;background-color:rgb(36,150,0);height:10px;margin-left:-3px;display:inline-block;width:10px;"></div></div><a style="color:rgb(65,109,0);margin-top:280px;display:block" href="./4tree.php"><h2>4tree.ru</h2></a>
<font style="font-size:15px"><? echo $compress_stamp; ?></font>
</div></center></div>


	<div id="tree_wrap">

		<div class="header_text" style="display:none;"></div>
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

        <li>
        	<a href="./!versions.html?<? echo $compress_stamp; ?>" target="_blank"><i class="icon-info-circle"></i>Что нового в версии <span id="this_version"><? echo $compress_stamp; ?></span></a>
        </li>
        <li class="blank"></li>
        <li><a href="./login.php?logout"><i class="icon-home-2"></i>Выход (смена пользователя)</a></li>
    </ul>  


</li>


<li class="" dont_close="true"><a href="#">Вид</a>
  <ul>
      <li dont_close="true"><input type="checkbox" class="on_off" id="on_off_hide_did"></input><a class="show_hidden_do" style="margin-right:90px;">Показывать выполненные дела</a></li>
      <li class="blank"></li> <!-- separator -->  
	  <li><a href="#">Расположение панелей</a>
            <ul>  
                <li dont_close="true"><span class="m_key">alt + 1</span><a id="v1">Вид №1</a></li>  
                <li dont_close="true"><span class="m_key">alt + 2</span><a id="v2">Вид №2</a></li>  
                <li dont_close="true"><span class="m_key">alt + 3</span><a id="v3">Вид №3</a></li>  
                <li dont_close="true"><span class="m_key">alt + 4</span><a id="v4">Вид №4</a></li>  
            </ul>  
	  </li>
	  <li style="display:none"><a href="#">Отображение дерева</a>
	  		<ul>
	  		    <li><a href="#">Панели</a></li>
	  		    <li><a href="#">Дерево</a></li>
	  		    <li><a href="#">Карта ума</a></li>
	  		</ul>
	  </li>
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
</li>

</ul>
</li>
</ul>



</div> <!-- myslidemenu -->




		<div id="tree_header">
		
		
		

			
			<ul class="tree_tab_menu tabs clearfix noselectable">
				<li><a>Дерево</a><i class="icon-cancel"></i></li>
				<li><a>Дела</a><i class="icon-cancel"></i></li>
				<li><a>Что нужно сделать сегодня</a><i class="icon-cancel"></i></li>
				<li><a>Мысли</a><i class="icon-cancel"></i></li>
				<li class="active"><a>Новый дизайн</a><i class="icon-cancel"></i></li>
				<li><a>Активный текст</a><i class="icon-cancel"></i></li>
				<li><a>Записки дебианщика</a><i class="icon-cancel"></i></li>				
			</ul>
		<div id="tree_fav">
		</div>
		
		</div>
		
	  <div class="resize_me"></div>
		
	  <div id="tree_left_panel">
		<div id="top_panel_header">
			<i class="icon-flow-cascade"></i>
			<i class="icon-th-4"></i>
			<i class="icon-th-list"></i>
			<i class="icon-th-list-3"></i>
		</div>
		<div id="top_panel" class="panel_type1">
			<div id="mypanel" style="">
			</div>
		</div>
		<div id="left_calendar" class="clean_calendar"></div>
		
		<div id="tree_footer2">
			<ul class="tree_footer_menu2">
				<li id = "tab_calendar"><a><i class="icon-calendar-2"></i></a></li>
				<li id = "tab_files"><a><i class="icon-attach-1"></i></a></li>
				<li id = "tab_news"><a><i class="icon-rss"></i></a></li>
				<li id = "tab_find"><a><i class="icon-search"></i></a></li>
			</ul>
		</div>
		
		<div class="tree_search">
			<input id="search_filter" placeholder="Искать...">
		</div>

	    <div class="tree_footer"></div>

	  </div> <!-- tree_left_panel -->
	  
	  
	  	  <div id="tree_right_panel">
			<ul>
				<li>Мысли вслух</li>
			</ul>
	  </div>


  		  <div id="params_header">
  		  	<div class="top_btn first" id="hide_left_panel"><i class="icon-left-1"></i></div>
  		  	<div class="top_btn second" id="open_params"><i class="icon-cog-2"></i><i class="icon-down-dir"></i></div>

			<div id="path_tree" class="path_line noselectable">
				<ul></ul>
			</div>

  		  	<div class="top_btn" id="hide_right_panel"><i class="icon-right-1"></i></div>
  		  	<div class="top_btn"><i class="icon-star-empty"></i></div>
  		  	<div class="top_btn"><i class="icon-ok"></i></div>		  		  
  		  	<div class="top_btn"><i class="icon-trash"></i></div>
  		  </div>


	  
	  <div id="tree_editor" class="bottom_open_no">
		  		  <div id="params_panel">
		  		  Панель параметров
		  		  </div>
	  		  
	  		  
	  		  <div class="all_editor_place" class="needsclick">
	  		  
	  		  <div id="myslidemenu" class="jqueryslidemenu noselectable" style="z-index:50">
		  		  <ul>
		  		  <li class="top_level">
		  		      <a><i class="icon-th-list" style="color: #000;
font-size: 22px;
display: inline-block;
top: 5px;
left: 10px;"></i>&nbsp;</a>
		  			  	<ul>
		  			  	
		  			  	<li><a href="javascript:" onclick="$('.redactor_btn_html:first').trigger('click');">HTML код</a></li>
		  			  	<li><a href="#" onclick="jsRedactorInsert()">Вставить галочку</a></li>
		  			  	<li><a href="#">Отправить по почте</a></li>
		  			  	</ul>
		  		  </li>
		  		  </ul>
	  		  </div>

	  		  
	  		  
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


		

  <div id="pomidor" title="Таймер">
     <div id="pomidor_scale">&nbsp;</div>
     <div id="pomidor_bottom">&nbsp;</div>

		 <div id="pomidoro_icon" time="0">
		 <i id="pomidor1" time="-25" class="icon-record" title="Работа 25 минут" text="Далее 25 минут работы."></i>
		 <i id="pomidor2" time="-5" class="icon-hourglass" title="Отдых 5 минут" text="Далее отдых 5 минут."></i>
		 <i id="pomidor3" time="-25" class="icon-record" title="Работа 25 минут" text="Далее 25 минут работы."></i>
		 <i id="pomidor4" time="-5" class="icon-hourglass" title="Отдых 5 минут" text="Далее отдых 5 минут."></i>
		 <i id="pomidor5" time="-25" class="icon-record" title="Работа 25 минут" text="Далее 25 минут работы."></i>
		 <i id="pomidor6" time="-5" class="icon-hourglass" title="Отдых 5 минут" text="Далее отдых 5 минут."></i>
		 <i id="pomidor7" time="-25" class="icon-record" title="Работа 25 минут" text="Далее 25 минут работы."></i>
		 <i id="pomidor8" time="-15" class="icon-glass" title="Отдых 15 минут" text="Далее отдых 15 минут."></i>
		 </div>
  </div>

					<!-- Шаблоны -->
				<div id="comment_template" style="display:none">
					<div class="comment_box" id="comment_{{id}}">
						<div class="comment_text_box">

							<div class="comment_header">
								<div class="comment_foto">
								    <img src="" style="background-size:15px 15px;background-image:url(image_remote.php?width=15&height=15&cropratio=1:1&image={{foto}})" height="15px" width="15px" class="comment_foto_img">
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
				<div id="tree_comments_container">
				</div>
				<div id="comment_enter_place">
					<div id="comment_enter">
						<div class="fullscreen_button icon-resize-full" title="На весь экран"></div>					
						<div class="comment_enter_input"></div>
						<div class="comment_send_button" title="alt+enter">отправить <span style='color:#CCC'>(alt+enter)</span></div>
					</div>
				</div>
				
			</div>


<div class="makedone">
	   <div class="makedone_h1" contenteditable="true">Записки дебианщика</div>
	   <div class="makedone_header noselectable">
	   		<ul>
	   			<li class="active" myid="makedone_page_1">даты</li>
	   			<li myid="makedone_page_2">поделиться</li>
	   			<li myid="makedone_page_3">оформление</li>
	   			<li myid="makedone_page_4">управление</li>
	   		</ul>
	   </div>
	   
	   <div class="makedone_pages">

		   <div class="makedone_page_1 page">
			    <div class="mini_label">без дат</div>
				<input id="makedone_date1" value="27.07.2013"><input id="makedone_time1" value="22:30">&nbsp;—&nbsp; 
				<input id="makedone_time2" value="23:30"><input id="makedone_date2" value="27.07.2013">
				<div class="mini_label">весь день</div>
				<br>

			   <div id="makedate">
			   <br>
			   <div class="makelabel" style="margin-left:-11px">SMS за <span id="remind_time">15 мин.</span> <i class="icon-bell-1"></i>:</div><div id="makedatebutton"> <input type="checkbox" class="on_off" id="on_off_sms"></div>
			<!--   <div class="makelabel" style="margin-left:-11px">Повторять:</div><div class="makerepeat"> каждый год</div> -->
			   </div>
			</div> <!-- page1 -->
			
		    <div class="makedone_page_2 page">
			   <div class="makelabel">поделиться <i class="icon-export-1"></i>:</div><div id="makedatebutton"> <input type="checkbox" class="on_off" id="on_off_share"></div><br>
				<div class="makesharediv">
					<input id="makeshare" readonly="true" value="4tree.ru/gh3">
					<div id="makesharestat_count" title="Кол-во просмотров внешней ссылки. Кликните, чтобы увидеть статистику."><b><i class="icon-eye"></i><span>0</span></b></div>
					<div id="makesharestat">
					</div>
				</div>

			   <div class="makelabel"> выполнено <i class="icon-ok-1"></i>:</div><div id="makedatebutton"> <input type="checkbox" class="on_off" id="on_off_did"></div><br>
			   <div class="makelabel">дата <i class="icon-calendar"></i>:</div><div id="makedatebutton"> <input  checked type="checkbox" class="on_off" id="on_off_date"></div>
		    </div> <!-- page2 -->

		    <div class="makedone_page_3 page">
		    	<div id="icons_and_colors"></div>
		    </div> <!-- page2 -->
		    
			
		</div>
<!--	<div class="makedel" title="Удалить элемент"><i class="icon-trash-1" style="color:#999"></i></div> -->
</div>



		
		
</body>
