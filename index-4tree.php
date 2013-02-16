<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html lang="ru">
<? 
//manifest="cache-manifest-v3.php"
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
//  echo '<script>document.location.href="./4tree.php";</script>'; 
//  exit; 
  } 
?>

<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=utf-8">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width">
<head>
<title>4tree.ru — мои дела</title>
<meta name="description" content="Сайт для ведения дел, заметок, календаря и так далее. Инструмент таймменеджмента, где всё нужное собранно в одном месте."/>
<meta name="keywords" content="gtd, 4tree.ru, заметки, задачи, гтд, таймменеджмент, хранение заметок, календарь"/>

<link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
<link rel="icon" href="favicon.ico" type="image/x-icon" />


<?
require_once('compress_timestamp.php');         //load timestamp created by compress.php module sets field $compress_stamp=unix_timestamp                                       
if (stripos($_SERVER['HTTP_ACCEPT_ENCODING'],'GZIP')!==false)   
        $gz='gz';
 else
        $gz=null;
echo '<link rel="stylesheet" type="text/css" href="min/styles_'.$compress_stamp.'.css'.$gz.'" />',PHP_EOL;
echo '<script src="min/all_'.$compress_stamp.'.js'.$gz.'" /></script>',PHP_EOL;
//echo '<script src="min/all1_'.$compress_stamp.'.js'.$gz.'" /></script>',PHP_EOL;
if ( $_SERVER['HTTP_HOST'] == 'localhost') 
   echo '<link rel="stylesheet" type="text/css" href="css/styles.css" />',PHP_EOL;

?>
    <script src="./js/all.js"></script>
    <script src="./jstree/jquery.jstree.js"></script>
	<script src="js/iphone-style-checkboxes.js" type="text/javascript" charset="utf-8"></script>

    <script src="./js/js_panel.js"></script>

    <link rel="stylesheet" href="css/iphone.css" type="text/css" media="screen" charset="utf-8" />
    
<!--
-->

<script type="text/javascript">
$(document).ready(jsDoFirst); 
</script>

</head>

<body onResize="onResize();">


<div id="wrap">

<div id="header">

<ul id="nav">   
	<li class="top"><a  id="to_home" class="top_link"><i class="icon-home" title="На главную страницу 4tree.ru" style="margin-left:10px;margin-right:10px;"></i></a>
	</li>

	<li class="top"><a  class="top_link"><span class="down" id="brand-ico">Вид</span></a>
		<ul class="sub tabs2">
		 <li><a  id="mindmap"><img src='./favicon-mindmap.png' style='vertical-align:top;' width='16' height='16' />&nbsp;&nbsp;Карта ума</a></li>
		 <li><a href="4tree.php" id="swap_calendar"><i class="icon-resize-small"></i>&nbsp;&nbsp;Поменять местами календарь и заметки</a></li>
		</ul>
	</li>

	<li class="top"><a  class="top_link"><span class="down" id="brand-ico">Редактор</span></a>
		<ul class="sub tabs2">
		 <li><a  id="undo_redactor"><i class="icon-ccw"></i>&nbsp;&nbsp;Отменить шаг редактирования (Undo)</a></li>
		 <li><a  id="redo_redactor"><i class="icon-cw"></i>&nbsp;&nbsp;Вернуть шаг редактирования (Redo)</a></li>
		</ul>
	</li>


	<li class="top"><a  class="top_link"><span class="down" id="brand-ico">Печать</span></a>
		<ul class="sub tabs2">
		 <li><a  id="print_tree"><i class="icon-th-list-1"></i>&nbsp;&nbsp;Печать дерева</a></li>
		 <li><a  id="print_redactor"><i class="icon-picture-1"></i>&nbsp;&nbsp;Печать заметки</a></li>
		 <li><a  id="print_calendar"><i class="icon-calendar"></i>&nbsp;&nbsp;Печать календаря</a></li>
		</ul>
	</li>

	<li class="top"><a  class="top_link shortlink_hover"><span class="down" id="brand-ico">Поделиться</span></a>
		<ul class="short_link">

		 Общедоступная ссылка на заметку :<br> <input class="shortlink1 linkdisabled" value="http://4tree.ru/5Xx">
		 <br>
		 
		 <br>
		 С названием:<br> <input class="shortlink2 linkdisabled" value="http://4tree.ru/Dnevnik_Vampira_5Xx">
		 <br>
		 <br>
		 <div class="hint_of_shortlink">Отправьте эту ссылку знакомым и они смогут читать<br>выбранные заметки.<br>Доступа к остальным делам у них не будет. Если захотите<br>запретить доступ, то выключите ссылку.</div>
		 <span class="statistic"></span>

		<center><input type="checkbox" id="on_off_on"/></center><br>
		 		 
		</ul>
		
	</li>

	<li class="top"><a  class="top_link"><span class="down" id="brand-ico">Таймер</span></a>
		<ul class="sub tabs2">
		 <li><a  time="-1" id="pomidor_timer">1 минута</a></li>
		 <li><a  time="-5" id="pomidor_timer"><b>5 минут</b></a></li>
		 <li><a  time="-10" id="pomidor_timer">10 минут</a></li>
		 <li><a  time="-15" id="pomidor_timer"><b>15 минут</b></a></li>
		 <li><a  time="-20" id="pomidor_timer">20 минут</a></li>
		 <li><a  time="-25" id="pomidor_timer"><b>25 минут</b></a></li>
		 <li><a  time="-30" id="pomidor_timer">30 минут</a></li>
		 <li><a  time="-40" id="pomidor_timer">40 минут</a></li>
		 <li><a  time="-50" id="pomidor_timer">50 минут</a></li>
		 <li><a  time="-60" id="pomidor_timer">60 минут</a></li>
		 <li><a  time="-90" id="pomidor_timer">90 минут</a></li>
		 <hr noshade style="height:0px;">
		 <li><a  time="0" id="pomidor_timer">отключить таймер</a></li>
		 <li><a href="http://mydebianblog.blogspot.com/2012/08/pomodoro.html" target="_blank" time="0" id="pomidor_timer1">Что такое Pomodorro</a></li>
		</ul>
	</li>


	<li class="top"><a  onclick="modalWin();" class="top_link" id="settings"><span class="down" id="brand-ico"> Дневник</span></a>
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

  <div id="search1">
    Поиск: <input hint="" id="textfilter" value="" placeholder="234+67*2+(22+99)*1.2">
	<div id="search_empty"><i class="icon-cancel-circle"></i></div>
  </div>
  <div id="search_panel">
   <span id="calc_answer"></span>
  </div>
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
	<img src="img/4tree-logo-leaf.png" width="166px" height="50px">
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
				<a  title="Свернуть дерево" class="collapse"><i class="icon-minus-circle"></i></a>
			</li>
			<li>
				<a  title="Развернуть дерево" class="expand"><i class="icon-plus-circle"></i></a>
			</li>
			<li class="redactor_separator"></li>

			<li>
				<a  title="Уменьшить масштаб" class="zoom_out"><i class="icon-zoom-out"></i></a>
			</li>
			<li>
				<a  title="Увеличить масштаб" class="zoom_in"><i class="icon-zoom-in"></i></a>
			</li>

			<li class="redactor_separator"></li>

			<li>
				<a  title="Скрыть выполненные" class="hide_checked"><i class="icon-ok"></i></a>
			</li>
			<li>
				<a  title="Показать выполненные" class="show_checked"><i class="icon-ok"  style="text-decoration: line-through"></i></a>
			</li>
			<li class="redactor_separator"></li>
			<li>
				<a  title="Добавить дело" class="add_default"><i class="icon-doc-1"></i></a>
			</li>
			<li class="redactor_separator"></li>
			<li>
				<a  title="Переименовать" class="rename"><i class="icon-pencil"></i></a>
			</li>
			<li class="redactor_separator"></li>
			<li>
				<a  title="Удалить дело" class="remove"><i class="icon-trash-1"></i></a>
			</li>
			<li class="redactor_separator"></li>
			<li>
				<a title="Обновить дерево" class="refresh"><i class="icon-arrows-cw"></i></a>
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
					<div id="toolbar"></div>
					<div id="main_redactor">
						<textarea id="redactor_content" name="content" style="height: auto;bottom:0px;top:0px;position:absolute;">none</textarea>
					</div>
				</div>
			
			</div>
		</div>
		<div id="right">
			<div id="resize">
			</div>
			<div id="page">
			
			
				<div id="top">






				<div id="full_screen_right" style=""><i class="icon-resize-full-1"></i></div>
						<div id="calendar"></div>	
				</div>



	<div id="settings_do" style="border-top: 1px solid lightgray">
	<form id="settings_form" style="margin: 0px;">
		<div id="settings_content">
		
		<div id="s1" class="s_tab"><h5>1. Основные</h5></div>
		<div class="s_content">
				<input name="s_title" type="text" class="s_title" title="Название дела"><br>
				
				<input name="s_date1" type="text" class="s_date1" title="Дата начала">
				<input name="s_time1" type="text" class="s_time1" title="Время начала"> — 
		
				<input name="s_time2" type="text" class="s_time2" title="Время завершения">
				<input name="s_date2" type="text" class="s_date2" title="Дата завершения">
				
				<input name="s_allday" id="s_allday" type="checkbox"><span id="s_allday_label"> Весь день</span><br><br>
		
				<input name="s_recur_check" id="s_recur_check" type="checkbox" checked><span id="s_recur_label"> Повторить:</span> 
				<span id="s_recur_text">каждый месяц</span> <a id="s_recur_change" href="#" checked="checked">Изменить</a><br>
				<div class="s_paths"><u>Домашние дела</u> → <u>ЗАМЕТКИ</u> → <u>4TREE.RU</u> → <u>Функционал</u> → <u>Горячие клавиши</u> →</div><br>

		Напоминание: 
		<select name="SelectRemind">
        <option value="1" selected>Всплывающее сообщение</option>
        <option value="2">Email</option>
        <option value="3">SMS</option>
        </select>

		<input name="s_remind_cnt" type="text" class="s_title3" title="Сколько" style="width:30px;" value="15">

		<select name="SelectRemindDim">
        <option value="1" selected>мин.</option>
        <option value="2">час.</option>
        <option value="2">дн.</option>
        <option value="3">нед.</option>
        </select> <span class="s_del_remind">x</span> <a class="s_add_remind" href="#">Добавить</a>

		<br><div class="s_button s_save">Сохранить</div> <div class="s_button s_del">Удалить</div><div class="s_button s_cancel">Отменить</div>
		
		</div>
		
		<div style="display:none" id="s2" class="s_tab"><h5>2. Мой сайт</h5></div>
		<div class="s_content">
		Тут параметры<br>
		выкладки на<br>
		собственный<br>
		сайт
		<br><div class="s_button s_save">Сохранить</div> <div class="s_button s_del">Удалить</div><div class="s_button s_cancel">Отменить</div>
		</div>
		<div style="display:none" id="s3" class="s_tab"><h5>3. Делегирование</h5></div>
		<div class="s_content s_delegate_panel">
			<div class="s_delegate">
			<h5>Исполнители:</h5><img src="img/face2.jpeg" width="40px"> <img src="img/face3.jpeg" width="40px"> <img src="img/faces/2/8.jpeg" width="40px"><br><br>
			<h5>Контролирует:</h5><img src="img/face1.jpeg" width="40px"> <img src="img/face5.jpeg" width="40px"><br><br>
			<h5>Поручил:</h5><img src="img/face1.jpeg" width="50px">
			</div>
			
			<div class="s_comments">
<div class="chat-bubble"><div class="chat-bubble-glare"></div>Я не совсем поняла, это точно должна делать я? У меня времени совсем нет на это!<div class="chat-bubble-arrow-border"></div><div class="chat-bubble-arrow"></div></div>
<div class="chat_time"><img src="img/face2.jpeg" width="40px"> 03.11.2012 12:30</div>

<div class="chat-bubble2"><div class="chat-bubble-glare2"></div>Конечно ты должна делать, а кто ещё то? Давай, не выкабенивайся.<div class="chat-bubble-arrow-border2"></div><div class="chat-bubble-arrow2"></div></div>
<div class="chat_time2">03.11.2012 12:30</div>

<div class="chat-bubble"><div class="chat-bubble-glare"></div>Катя не сможет это сделать нормально, давайте лучше я<div class="chat-bubble-arrow-border"></div><div class="chat-bubble-arrow"></div></div>
<div class="chat_time"><img src="img/face5.jpeg" width="40px"> 03.11.2012 12:30</div>

<div class="chat-bubble2"><div class="chat-bubble-glare2"></div>Ладно, пусть Оксана делает!<div class="chat-bubble-arrow-border2"></div><div class="chat-bubble-arrow2"></div></div>
<div class="chat_time2">03.11.2012 12:30</div>

<div class="chat-bubble"><div class="chat-bubble-glare"></div>О! Я уже почти закончила. Оксану к этому делу не подпускайте.<div class="chat-bubble-arrow-border"></div><div class="chat-bubble-arrow"></div></div>
<div class="chat_time"><img src="img/face2.jpeg" width="40px"> 03.11.2012 12:30</div>

<div class="chat-bubble2"><div class="chat-bubble-glare2"></div>Не обижай Оксану.<div class="chat-bubble-arrow-border2"></div><div class="chat-bubble-arrow2"></div></div>
<div class="chat_time2">03.11.2012 12:30</div>

<div class="chat-bubble"><div class="chat-bubble-glare"></div>Ладно, Кать, ты как сделаешь, мне сообщи, я сразу же начну формировать группу контролеров качества. Делай только качественно, а не так как всегда<div class="chat-bubble-arrow-border"></div><div class="chat-bubble-arrow"></div></div>
<div class="chat_time"><img src="img/face5.jpeg" width="40px"> 03.11.2012 12:30</div>


			</div>
			
		<textarea class="s_message" title="Название дела"></textarea>
			
		</div>
		<div style="display:none" id="s4" class="s_tab"><h5>4. Другое</h5></div>
		<div class="s_content">
		 Дата выполнения дела: <input type="text" class="s_date1" title="Дата выполнения"> <input type="text" class="s_time1" title="Время выполнения">
		</div>

		<div style="display:none" id="s5" class="s_tab"><h5>5. Файлы (5 шт + 12 фото)</h5></div>
		<div class="s_content">
			<div class="s_files">
				<img src="img/face1.jpeg">
				<img src="img/face2.jpeg">
				<img src="img/face3.jpeg">
				<img src="img/face4.jpeg">
				<img src="img/face5.jpeg">
				<img src="img/faces/2/2.jpeg">
				<img src="img/face7.jpeg">
				<img src="img/faces/8.jpeg">
				<img src="img/faces/9.jpeg">
				<img src="img/faces/10.jpeg">
				<img src="img/faces/2/1.jpeg">
				<img src="img/faces/2/0.jpeg"><br><br>
				<a href="#">1. Договор подряда.doc (180kb - 12.05.2012)</a>
				<a href="#">2. Список музыкальных файлов.xls (385kb - 12.05.2012)</a>
				<a href="#">3. Презентация.pdf (1130kb - 13.05.2012)</a>
				<a href="#">4. Визитка.doc (80kb - 12.10.2012)</a>
				<a href="#">5. Список контактов.doc (180kb - 12.05.2012)</a>
			</div>

		<br><div class="s_button s_save">Сохранить</div> <div class="s_button s_del">Удалить</div><div class="s_button s_cancel">Отменить</div>
		</div>

		<div id="s5" class="s_tab"><h5>6. Фильтр всех дел</h5></div>
		<div class="s_content" style="margin-top:5px;">
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

		</div>


<!--		<div id="s_save" class="s_button">Сохранить</div> <div id="s_close" class="s_button">Закрыть без изменений</div> <div id="s_del" class="s_button">Удалить</div><br> -->
				
		</div> 
	</form>
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

	<i class="icon-leaf-1" toshow="leaf_div" style="display:none" hint="Поручено вам сегодня (в этом месяце)">
	<span id="r6" class="last"></span></i>

	<i id="icon_to_settings" class="icon-cog-1" toshow="settings_div" hint="Настройки 4tree" style="margin-right:-7px;cursor:pointer;display:none"></i>

<span>

</div>


</div>

<div id="bubu" style="display:none"></div>


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

	<div id="mypanel" style="display:none">
	</div>


</body>
</html>