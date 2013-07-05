<html lang="ru" manifest="">
<meta name="viewport" content="width=device-width, initial-scale=1,user-scalable=no"> 
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
<script src="js/md5fast.js"></script>
<script src="js/js_regallkeys.js"></script>
<script src="js/loader.js"></script>
<script src="diff_match_patch/javascript/diff_match_patch_uncompressed.js"></script>
<script src="js/jquery.idle-timer.js"></script>
<script src="./js/api4tree.js"></script>
<script src="./js/fastclick.js"></script>
<script src="./js/all-mobile.js"></script>
<script src="js/handlebars.js"></script>
<script src="redactor900/redactor/redactor.js"></script>
<script src="redactor900/redactor/ru.js"></script>
<script src="b_menu/jquery.menu.js"></script>
<script src="./js/4tree.js"></script>
<script src="js/parser.js"></script>



<script type="text/javascript">
$(document).ready(jsDoFirstMobile); 
</script>


</head>

<body onResize="onResize();">





<div data-role="page" data-theme="b" id="mainWindow" class="hide_options show_calendar">
	<div data-role="panel" id="menuPanel" data-display="reveal" data-dismissible="false" style="">
		<div data-role="header" data-position-fixed="true">
		 
		 <a class="back1" href="pda.php" data-icon="arrow-l" data-mini="true">Назад</a>	
		 <h1>&nbsp;<span class="f_text">4tree.ru</span></h1>
		 <a class="back1" href="pda.php" data-icon="" data-mini="true">Меню</a>	
		 
</div>



		<div id="search_div">
			<input type="search" name="search" id="search_filter" data-mini="true" placeholder="Поиск в 4tree" value="" />
		</div>

	<div data-role="navbar" data-mini="true" id="tree_menu">
		<ul>
			<li id="tree_home" title="В корень дерева"><a style="" href="#">&nbsp;<i class='icon-home'></i>&nbsp;</a></li>
			<li id="tree_fav" title="Избранные (набранные БОЛЬШИМИ буквами)"><a style="" href="#">&nbsp;<i class='icon-star'></i>&nbsp;</a></li>
			<li id="tree_new" title="Добавить заметку в _НОВОЕ"><a style="" href="#"><i class='icon-plus'></i>НОВОЕ</a></li>
			<li id="tree_diary" title="Сегодняшний ДНЕВНИК"><a style="" href="#">07.07</a></li>
		</ul>
	</div><!-- /navbar -->


		<div id="sync_status">
			<div id="sync_text">синхронизация</div>
			<i class="icon-down-1"></i>
			

		</div>

		<div data-role="content" style="" id="menuContent" style='top: 0; -webkit-transition: top .5s ease-out'>

			<ul data-theme="c" data-role="listview" data-inset="true" data-filter="false" style="margin-top:30px;" id="fastclick">

			<li data-icon='false' class="li_header"><a href="#user-login">Вход</a></li>
			<li data-icon='false' class="li_header"><a href="#" id="load_from_server">Загрузить данные снова</a></li>
			<li data-icon='false' class="li_header"><a href="#category-items?node=1">Мои дела</a></li>
			</ul>

		</div>
	

	</div>

	<!-- //////////////////////////////////////// -->

		<div data-role="panel" id="menuPanelRight" data-display="reveal" data-dismissible="false" style="" data-position="right"  data-theme="c" >
		<div data-role="header" data-position-fixed="true" data-theme="a" >
		 
		 
		 <h1>Календарь</h1>
		 
		</div>
	
	<div data-role="navbar" data-mini="true" id="view_menu"  data-theme="c" >
		<ul>
			<li id="scroll_to_today"><a  style="background:rgba(0,0,0,0.5);" href="#">к сегодня</a></li>
			<li id="hide_show_did"><a style="background:rgba(0,0,0,0.5);" href="#">выполненные</a></li>
		</ul>
	</div><!-- /navbar -->

		
		<div data-theme="c"  data-role="content" style="" id="menuCalendar" style='top: 0; -webkit-transition: top .5s ease-out'>

			<ul data-role="listview" data-inset="true" data-filter="false" style="margin-top:30px;">

			<li><a href="#user-login">Вход (смена пользователя)</a></li>
			<li><a href="#" target="_blank" id="load_from_server">Загрузить данные с сервера</a></li>
			<li><a href="#category-items?node=1">Все дела в 4tree.ru</a></li>
			</ul>

		</div>
	

	</div>

	

	<div data-role="header" id="tree_header" data-theme="a">
			<a class="menu" href="#menuPanel" data-icon="" id="open_menu" data-iconpos=""><i class='icon-cd'></i><div id="myloader"></div></a>	

			<h1 id="editor_header">&nbsp;</h1>
			<div data-role="controlgroup" data-type="horizontal" data-mini="true" style="position:absolute; right:5px;top:-2px;">
				<a href="#" data-role="button" data-iconpos="">&nbsp;<i class='icon-plus'></i> </a>
				<a id="show_calendar" href="#" data-role="button" data-iconpos=""><i class='icon-calendar-2'></i></a>
			</div>

	<div data-role="navbar" data-mini="true" id="view_menu">
		<ul>
			<li id="view_settings"><a href="#">параметры</a></li>
			<li id="view_delete"><a style="" href="#">отмена</a></li>
			<li id="view_delete"><a style="" href="#">удалить</a></li>
			<li id="view_makedid"><a style="text-decoration:line-through;text-shadow:none;" href="#">выполнить</a></li>
		</ul>
	</div><!-- /navbar -->


	</div><!-- /header -->


	<div data-role="content">
		 
	<div id="redactor_header">
		<div class="">
			<label for="node_title">Заголовок заметки</label>
			<input placeholder="Заголовок заметки" value="статья про Пежо 208 на авточел" name="node_title" id="noder_title">
		</div>
		
		<div class="note_date" style="width:auto;display:inline-block;">
			<label for="node_date">Дата начала</label>
			<input type="datetime-local" value="2013-07-19T16:39:57" name="node_date" id="node_date">

		</div>

		<div class="note_date" style="width:auto;display:inline-block;">
			<label for="node_date" style="width:auto;">SMS за</label>
			<select name="select-choice-0" id="select-choice-1" data-mini="true" style="width:70px">
			<option value="standard">выкл</option>
			<option value="standard">10 мин</option>
   			<option value="standard">15 мин</option>
   			<option value="standard">20 мин</option>
   			<option value="standard">25 мин</option>
   			<option value="rush">30 мин</option>
   			<option value="express">45 мин</option>
   			<option value="express">60 мин</option>
   			<option value="express">120 мин</option>
   			<option value="overnight">180 мин</option>
</select>

		</div>

	</div><!-- /grid-a -->





		<div id="fav_redactor_btn"></div>
		<div id="editor_content" class="redactor_" data-role="content" style="overflow:auto !important;">
		  	  
			  <div id="redactor" style="">Редактор</div>

		</div>


	</div>



</div>






<div id="user-login" data-role="page">
	<div data-role="header" data-theme="a" data-position="fixed">
			<a class="back1" href="pda.php" data-icon="">Назад</a>	
			<h1>Вход </h1>
			
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


</div>


<!-- ///////////////////////////////////////////////////////////////////// -->

<div id="category-items" data-role="page">
	<div data-role="header" data-theme="b" data-position="fixed">
			<a class="back1" data-icon="">Назад</a>	
			<h1>4tree.ru</h1>
	
    
    <a id="sync_now" href="#" data-role="button" data-iconpos="notext" data-icon="refresh" data-theme="b">
    	
    </a>
    
	

	</div><!-- /header -->

  <div data-role="content"></div>

<div data-role="footer" data-theme="b" data-position="fixed">		
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




<div id="this_version" style="display:none">Mobile</div>

</body>

</html>