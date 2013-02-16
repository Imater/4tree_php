<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=utf-8">
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width">

<? 
	require_once('db.php');

if(isset($_GET['confirm']))
   {
	
	$db = mysql_connect ($config[mysql_host], $config[mysql_user], $config[mysql_password]);
	mysql_query_my("SET NAMES utf8");
	mysql_select_db('h116',$db);   
	if (!$db) { echo "Ошибка подключения к SQL :("; exit();}
	

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

if(!loginuser()) 
  { 
  echo '<script>document.location.href="./4tree.php";</script>'; 
  exit; 
  } 
?>

<html>
<head>
<title>4tree.ru — мои дела</title>

<link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
<link rel="icon" href="favicon.ico" type="image/x-icon" />

<link rel="stylesheet" href="css/styles.css" type="text/css">
<link rel="stylesheet" href="./redactor/redactor/redactor.css" />
<link type="text/css" href="ui/css/smoothness/jquery-ui-1.8.21.custom.css" rel="stylesheet" />
<link rel="stylesheet" type="text/css" href="./pro_dropdown_3/pro_dropdown_3.css" />
<link rel='stylesheet' type='text/css' href='./fullcalendar-1.5.3/fullcalendar/fullcalendar.css' />
<link rel='stylesheet' type='text/css' href='./fullcalendar-1.5.3/fullcalendar/fullcalendar.print.css' media='print' />
<link rel="stylesheet" href="./fontello/css/fontello.css"><!--[if IE 7]>
<link rel="stylesheet" href="./fontello/css/fontello-ie7.css"><![endif]-->

<script src="./js/jquery.min.js"></script>
<script src="./js/all.js"></script>






<!--<script src="./js/all-ck.js"></script>-->

    <script src="./js/jquery.datetimeentry2.min.js"></script>
    <script src="./js/jquery.datetimeentry-ru.min.js"></script>

	<script type="text/javascript" src="./jstree/_lib/jquery.cookie.min.js"></script>
	<script type="text/javascript" src="./jstree/_lib/jquery.hotkeys.min.js"></script>

	<script type="text/javascript" src="./jstree/jquery.jstree-ck.js"></script>
	
<!--	<script src="./redactor/redactor/redactor.js"></script>
	<script src="./redactor/redactor/langs/ru.min.js"></script>

		<script type="text/javascript" src="ui/js/jquery-ui-1.8.21.custom.min.js"></script>

<script type='text/javascript' src='./fullcalendar-1.5.3/jquery/jquery-ui-1.8.17.custom.min.js'></script>-->
<script type='text/javascript' src='./fullcalendar-1.5.3/fullcalendar/fullcalendar-ck.js'></script>
<script type='text/javascript' src='./fullcalendar-1.5.3/fullcalendar/gcal-ck.js'></script>



<script type="text/javascript">
$(document).ready(jsDoFirst); 
</script>

</head>

<body onResize="onResize();">


<div id="wrap">

<div id="header">
<ul id="nav">   
	<li class="top"><a href="#" id="to_home" class="top_link"><i class="icon-home" title="На главную страницу 4tree.ru" style="margin-left:10px;margin-right:10px;"></i></a>
	</li>

	<li class="top"><a href="#" class="top_link"><span class="down" id="brand-ico">Вид</span></a>
		<ul class="sub tabs2">
		 <li><a href="4tree.php" id="swap_calendar"><i class="icon-resize-small"></i>&nbsp;&nbsp;Поменять местами календарь и заметки</a></li>
		</ul>
	</li>

	<li class="top"><a href="#" class="top_link"><span class="down" id="brand-ico">Поручения</span></a>
		<ul class="sub tabs2">
		</ul>
	</li>

	<li class="top"><a href="#" class="top_link"><span class="down" id="brand-ico">Печать</span></a>
		<ul class="sub tabs2">
		 <li><a href="#" id="print_tree"><i class="icon-th-list-1"></i>&nbsp;&nbsp;Печать дерева</a></li>
		 <li><a href="#" id="print_redactor"><i class="icon-picture-1"></i>&nbsp;&nbsp;Печать заметки</a></li>
		 <li><a href="#" id="print_calendar"><i class="icon-calendar"></i>&nbsp;&nbsp;Печать календаря</a></li>
		</ul>
	</li>

	<li class="top"><a href="#" class="top_link"><span class="down" id="brand-ico">Помощь</span></a>
		<ul class="sub tabs2">
		</ul>
	</li>
	<li class="top"><a href="#" class="top_link" id="settings"><span class="down" id="brand-ico">Настройки</span></a>
	</li>

	<li class="top"><a href="#" class="top_link"><span class="down" id="brand-ico">Таймер</span></a>
		<ul class="sub tabs2">
		 <li><a href="#" time="-1" id="pomidor_timer">1 минута</a></li>
		 <li><a href="#" time="-5" id="pomidor_timer"><b>5 минут</b></a></li>
		 <li><a href="#" time="-10" id="pomidor_timer">10 минут</a></li>
		 <li><a href="#" time="-15" id="pomidor_timer"><b>15 минут</b></a></li>
		 <li><a href="#" time="-20" id="pomidor_timer">20 минут</a></li>
		 <li><a href="#" time="-25" id="pomidor_timer"><b>25 минут</b></a></li>
		 <li><a href="#" time="-30" id="pomidor_timer">30 минут</a></li>
		 <li><a href="#" time="-40" id="pomidor_timer">40 минут</a></li>
		 <li><a href="#" time="-50" id="pomidor_timer">50 минут</a></li>
		 <li><a href="#" time="-60" id="pomidor_timer">60 минут</a></li>
		 <li><a href="#" time="-90" id="pomidor_timer">90 минут</a></li>
		 <hr noshade style="height:0px;">
		 <li><a href="#" time="0" id="pomidor_timer">отключить таймер</a></li>
		 <li><a href="http://mydebianblog.blogspot.com/2012/08/pomodoro.html" target="_blank" time="0" id="pomidor_timer1">Что такое Pomodorro</a></li>
		</ul>
	</li>


	<li class="top"><a href="#" onclick="modalWin();" class="top_link" id="settings"><span class="down" id="brand-ico"> Дневник</span></a>
	</li>

		 <span id="pomidoro_icon">
		 <i id="p1" time="-25" class="icon-record" title="Работа 25 минут" text="Далее 25 минут работы."></i>
		 <i id="p2" time="-5" class="icon-hourglass" title="Отдых 5 минут" text="Далее отдых 5 минут."></i>
		 <i id="p3" time="-25" class="icon-record" title="Работа 25 минут" text="Далее 25 минут работы."></i>
		 <i id="p4" time="-5" class="icon-hourglass" title="Отдых 5 минут" text="Далее отдых 5 минут."></i>
		 <i id="p5" time="-25" class="icon-record" title="Работа 25 минут" text="Далее 25 минут работы."></i>
		 <i id="p6" time="-5" class="icon-hourglass" title="Отдых 5 минут" text="Далее отдых 5 минут."></i>
		 <i id="p7" time="-25" class="icon-record" title="Работа 25 минут" text="Далее 25 минут работы."></i>
		 <i id="p8" time="-15" class="icon-glass" title="Отдых 15 минут" text="Далее отдых 15 минут."></i>
		 </span>

  <div id="left_min" time="-5" title="Завести таймер на 5 минут">&nbsp;&nbsp;&nbsp;5</div>
  <div id="right_min" time="-25" title="Завести таймер на 25 минут">25</div>
  <div id="pomidor">
     <div id="pomidor_scale">&nbsp;</div>
     <div id="pomidor_bottom">&nbsp;</div>
  </div>

  <div id="search">Поиск: <input hint="" id="textfilter" value=""></div>
	
  <div class="search-ico"><i class="icon-search" style="font-size:21px;margin-top:-5px;position:absolute;"></i></div>

</ul>

</div>

<div id="content1">

<div id="side_arrow"><div id="arrow"></div></div>
<div id="side_folder">
	<span class="ff">
	<span class="roundcountbig">1</span>
	<img src="">
	</span>
	
</div>

	<div id="left_panel_hover" class="side_panel_hover"></div>
	
	<div id="left_panel" class="side_panel">

	<span class="side_img">
		<div class="roundcount">12</div>
		<img src="">
		<div class="name"><b>Валентина Курган</b><br> </div>
	</span>


	</div>
	


	<div id="right_panel_hover" class="side_panel_hover"></div>
	<div id="right_panel" class="side_panel">
	<span class="side_img">
		<img src="">
		<div class="name"><b>Саловат Ялалов</b><br>одногрупник из Екатеринбурга</div>
	</span>



	</div>

<div id="main_icons">
	<i id="icon_to_main" class="icon-check" toshow="cont"></i>
	<i id="icon_to_leaf" class="icon-leaf-1" toshow="leaf_div"></i>
	<i id="icon_to_settings" class="icon-cog-1" toshow="settings_div"></i>
</div>
	
	
	<div id="settings_div" class="main_div">


	<div id="leaf_left_col">
	<img src="img/4tree-logo-leaf.png">
	<li leaf="1" class="current">Основные</li>
	<li leaf="2">Сервис</li>
	<li leaf="3">Горячие клавиши</li>
	</div>
	
	<div id="leaf_wrapper">
	<div id="leaf_output"></div>
	</div>


	</div>

	<div id="cont" class="main_div">
	<div id="cont2"></div>

		<div id="left">
				<div id="full_screen_left"><i class="icon-resize-full-1"></i></div>
			<div id="left_top">
			<ul class="tree_toolbar">
			<li>
				<a href="#" title="Свернуть дерево" class="collapse"><i class="icon-minus-circle"></i></a>
			</li>
			<li>
				<a href="#" title="Развернуть дерево" class="expand"><i class="icon-plus-circle"></i></a>
			</li>
			<li class="redactor_separator"></li>
			<li>
				<a href="#" title="Скрыть выполненные" class="hide_checked"><i class="icon-ok"></i></a>
			</li>
			<li>
				<a href="#" title="Показать выполненные" class="show_checked"><i class="icon-ok"  style="text-decoration: line-through"></i></a>
			</li>
			<li class="redactor_separator"></li>
			<li>
				<a href="#" title="Добавить дело" class="add_default"><i class="icon-doc-1"></i></a>
			</li>
			<li class="redactor_separator"></li>
			<li>
				<a href="#" title="Переименовать" class="rename"><i class="icon-pencil"></i></a>
			</li>
			<li class="redactor_separator"></li>
			<li>
				<a href="#" title="Удалить дело" class="remove"><i class="icon-trash-1"></i></a>
			</li>
			<li class="redactor_separator"></li>
			<li>
				<a href="#" title="Обновить дерево" class="refresh"><i class="icon-arrows-cw"></i></a>
			</li>
			
			
			
			</ul>
				<div id="for_demo">
					<div id="demo" class="demo"></div>
				</div>
			</div>
			<div id="left_bottom">
				<div id="left_bottom_label">заметка</div>
				<div id="left_bottom2">
				<div id="full_screen_left2"><i class="icon-resize-full-1"></i></div>
					<textarea id="redactor_content" name="content" style="height: auto;bottom:0px;top:0px;position:absolute;">none</textarea>
				</div>
			
			</div>
		</div>
		<div id="right">
			<div id="resize">
			</div>
			<div id="page">
				<div id="top">
				<div id="full_screen_right"><i class="icon-resize-full-1"></i></div>
						<div id="calendar"></div>	
				</div>
				<div id="bottom">
				<div id="right_leaf_label">фильтр</div>
					
						<div id="leaf_div" class="main_div">
					
						<div id="leaf_left_col">
						<li leaf="1" class="current">Ближайшие</li>
						<li leaf="2">Просроченные</li>
						<li leaf="3">Сегодня</li>
						<li leaf="4">Завтра</li>
						<li leaf="5">Будущие</li><br>
						<font color="lightgray" style="margin-left:20px;margin-bottom:5px;">Выполнены:</font><br>
						<li leaf="6">Все</li>
						<li leaf="7">Вчера</li>
						<li leaf="8">Сегодня</li><br>
						<font color="lightgray" style="margin-left:20px;margin-bottom:5px;">Сортировка:</font><br>
						<li leaf="9">По дате добавления</li>
						</div>
						
						<div id="leaf_wrapper">
						<div id="leaf_output"></div>
						</div>
						</div>
					
					
					<!--
					<div id="tabsminitop">
							<ul id="tabs" class="tabsmini">
							<li id="current"><a href="#" title="tab1">Даты</a></li>
							<li><a href="#" title="tab2">Данные</a></li>
							<li><a href="#" title="tab2">Календарь</a></li>
							</ul>
					</div>
					<div id="tabsminibottom">
					 дата1:<input id="do_date1" class="datetime"><input id="altdo_date1" style="display:" value=""><br>
					 дата2:<input id="do_date2" class="datetime"><input id="altdo_date2" style="display:" value="">
					 
<br>						
<input type="button" style='width:170px; height:24px; margin:5px auto;' value="сохранить" onclick="savetext()" />
				
					</div>
					-->
				</div>
			</div>
		</div>
		
	
	</div>
</div>

<div id="footer">
<?
if ($confirm_email=='false') echo '<font size="2px" style="margin-top:4px;margin-left:48px;position:absolute;"><b>Нужно подтвердить ваш email адрес, иначе ваша регистрация будет отменена (проверьте свою почту)</b2></font>';
?>
<span class="title"></span>


<span class="leaves_count">

	
	<i class="icon-folder-1"  toshow="cont" hint="Всё дерево">
	<span id="r1" class="first"></span></i>

	<i class="icon-clock" toshow="leaf_div" leaf="3" hint="Предстоящие дела на сегодня (в этом месяце)">
	<span id="r2"></span></i>

	<i class="icon-check" toshow="leaf_div" leaf="8" hint="Выполненные дела на сегодня (за месяц)">
	<span id="r3"><font style="text-decoration: line-through"></font></span></i>

	<i class="icon-hourglass" toshow="leaf_div" leaf="2" hint="Просроченные дела сегодня (за месяц)">
	<span id="r4"></span></i>

	<i class="icon-record" toshow="leaf_div" leaf="9" hint="Все дела отсортированные в порядке добавления">
	<span id="r5"></span></i>

	<i class="icon-leaf-1" toshow="leaf_div" hint="Поручено вам сегодня (в этом месяце)">
	<span id="r6" class="last"></span></i>

	<i id="icon_to_settings" class="icon-cog-1" toshow="settings_div" hint="Настройки 4tree" style="margin-right:-7px;cursor:pointer"></i>

<span>

</div>


</div>
<div id="bubu" style="display:none"></div>
