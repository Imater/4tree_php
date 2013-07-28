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
    <link rel="stylesheet" type="text/css" href="ui/css/smoothness/jquery-ui-1.8.21.custom.css"/>
    <link rel="stylesheet" type="text/css" href="css/iphone.css"/>
    <link rel="stylesheet" type="text/css" href="fontello/css/fontello.css"/>
    <link rel="stylesheet" type="text/css" href="redactor904/redactor/redactor.css"/>
    <link rel="stylesheet" type="text/css" href="css/4tree-styles.css"/>
    <link rel="stylesheet" type="text/css" href="fullcalendar-1.6.1/fullcalendar/fullcalendar.css"/>
    <link rel="stylesheet" type="text/css" href="css/4tree-foto.css"/>
    <link rel="stylesheet" type="text/css" href="css/test-design.css"/>
    <link rel="stylesheet" type="text/css" href="css/jqueryslidemenu.css"/>';

//	<script src="js/less-1.3.3.min.js"></script>

	echo '<script src="jstree/_lib/jquery.cookie.min.js"></script>
	<script src="js/login.js"></script>
	<script src="./js/fastclick2.js"></script>
	<script src="b_menu/jquery.menu.js"></script>
	<script src="js/jquery.jsPlumb-1.4.1-all.js"></script>
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
		<div class="tree_add_do">
			<input x-webkit-speech placeholder="Добавить...">
		</div>
		
		<div id="tree_header">
			
			<ul class="tree_tab_menu tabs clearfix noselectable">
				<span class="for_sos"><a>
					<div class="sos" title="Синхронизация / Размер окон"><i class="icon-cd"></i><div id="myloader"></div></div>		
				</a></span>
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
		<div id="left_calendar"></div>
		
		<div id="tree_footer2">
			<ul class="tree_footer_menu2">
				<li id = "tab_calendar"><a><i class="icon-calendar-2"></i></a></li>
				<li id = "tab_files"><a><i class="icon-attach-1"></i></a></li>
				<li id = "tab_news"><a><i class="icon-rss"></i></a></li>
				<li id = "tab_find"><a><i class="icon-search"></i></a></li>
			</ul>
		</div>
		
		
	  </div>
	  
	  
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
			  <div class="noselectable" id="fav_redactor_btn"></div>
	  			<textarea id="redactor">
	  			</textarea>	  
	  		  </div>
	  	  
	  	<div class="calendar_and_others">
				
				
				<div class="search_panel_result panel_type3">
	  				<div id="news_header">
		  				<span style="margin: 7px 15px;display: inline-block;">Поиск</span>
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


		
		<div class="tree_search">
			<input placeholder="Искать...">
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
								    <img src="image_remote.php?width=15&height=15&cropratio=1:1&image={{foto}}" height="15px" width="15px" class="comment_foto_img">
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

		
		
</body>
