<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html lang="ru" class="" manifest="">
<!-- 1browser_manifest -->

<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=utf-8">
<meta charset="utf-8">

<head>
<title>4tree.ru — мои дела</title>
<meta name="description" content="Сайт для ведения дел, заметок, календаря и так далее. Инструмент таймменеджмента, где всё нужное собранно в одном месте."/>
<meta name="keywords" content="gtd, 4tree.ru, заметки, задачи, гтд, таймменеджмент, хранение заметок, календарь"/>

<link rel="search" type="application/opensearchdescription+xml" title="4tree.ru Добавление дел" href="/SearchEngineInfo.xml" />


<link rel="shortcut icon" href="favicon1.png" type="image/x-icon" />
<link rel="icon" href="favicon1.png" type="image/x-icon" />

<?
require_once('compress_timestamp.php');         //load timestamp created by compress.php module sets field $compress_stamp=unix_timestamp 

//<meta name="viewport" content="width=device-width">
                                      
if (stripos($_SERVER['HTTP_ACCEPT_ENCODING'],'GZIP')!==false)   
        $gz='gz';
 else
        $gz=null;
echo '<link rel="stylesheet" type="text/css" href="min/styles_'.$compress_stamp.'.css'.$gz.'" />',PHP_EOL;
if(true )echo '<script src="min/all_'.$compress_stamp.'.js'.$gz.'" /></script>',PHP_EOL;
if(true )echo '<script src="min/redactor_'.$compress_stamp.'.js'.$gz.'" /></script>',PHP_EOL;
//echo '<script src="min/all1_'.$compress_stamp.'.js'.$gz.'" /></script>',PHP_EOL;

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

//	$db = mysql_connect ($config[mysql_host], $config[mysql_user], $config[mysql_password]);
//	mysql_query_my("SET NAMES utf8");
//	mysql_select_db('h116',$db);   
//	if (!$db) { echo "Ошибка подключения к SQL :("; exit();}
    

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

	<link rel="stylesheet" type="text/css" href="css/4tree-styles.css">
<!--[if gte IE 8]>
	<link rel="stylesheet" type="text/css" href="css/4tree-styles-ie.css">
<![endif]-->

<!--
	<link rel="stylesheet" href="jsredactor/redactor/redactor.css" />
	<link rel="stylesheet" type="text/css" href="css/iphone.css">


	<script src="js/jquery.min.js"></script>
	<script src="js/jquery.datetimeentry2.min.js"></script>
	<script src="js/jquery.datetimeentry-ru.js"></script>
	<script src="jstree/_lib/jquery.cookie.min.js"></script>
	<script src="jstree/_lib/jquery.hotkeys.min.js"></script>
	<script src="ui/js/jquery-ui-1.8.21.custom.min.js"></script>
	<script src="fullcalendar/jquery/jquery-ui-1.8.23.custom.min.js"></script>

	<script src="js/loader.js"></script>
	<script src="b_menu/jquery.dimensions.min.js"></script>
	<script src="b_menu/jquery.menu.js"></script>
	<script src="./js/jquery-ui.multidatespicker.js"></script>
    <script type="text/javascript" src="./js/jquery.idle-timer.js"></script>
	<script src="./js/jquery-ui.multidatespicker.js"></script>
	<script src="./js/iphone-style-checkboxes.js"></script>
	<script src="./js/handlebars.js"></script> 
	<script src="js/ru.js"></script>
	<script src="fullcalendar/fullcalendar/fullcalendar.js"></script>
    <script src="js/pushstream.js" type="text/javascript" language="javascript" charset="utf-8"></script>
	<script src="jsredactor/redactor/redactor.js"></script>
	-->


	<script src="js/all_new.js"></script>
	<script src="js/!sync_modul.js"></script>
	<script src="js/zvt-ydn.db-dev-0.4.6.js"></script>

<!--	<script src="js/jszip.js"></script> -->

<script type="text/javascript">
$(document).ready(jsDoFirst); 

if(!$.cookie("4tree_passw")) document.location.href="./4tree.php";

</script>
</head>



<body onResize="onResize();">
<!--

                                                                                                              
                                                        .                                                     
                                                       ,                                                      
                                                  r  .9                                                       
                                                  X  ::                G.                                     
                       s               h          #  #    r        :r  h                                      
                  .G9X            GhhA,rG   ..G&  @  ,    .        ,3s ;       :                              
                   r32 s2        #G&X     s  :    #.3    @          5,sXAA     5                              
                    s             M         s9r   @    i   &r                  5 Ar    r ,:                   
                     ;   B         rG          XX # 95  @  3GS      X 3h       : &G . i SX;.                  
               9&      @    ;   ,Xr              3H 33Xi 5          @  &X, r   S  . ;                         
               .AG      9s   ;        rM hGr      B. XsG  B   9     h   : ;    B  ;h                          
                :A:      ,#i H          3i.  :    # .: s   X        i   3 .s    @,@                           
                .SB:       :@:r  :;      SiM      B:   .   M  ,    r   r  As    9    r3S                      
                XXh9  #      M,      S   @   s@B#MH:   r G :  2    #  .  ,  &G @ ; .9hX      ,GA              
                       5      #3       2:2        Mi   @   A  ;    M  # ;A: XA@  h Xi       2Ahs              
                 .:       2@h,.2H    A&:  M       MM   9   2 #    3r #      #   hs  :B@Gs.                    
             ;   hX ,&X.       ..H5   r5 , M      @#  s:    H     #s#      h.  A@;:    hh:                    
    :;      .    293 ,h5.r.H,     #Hr   3 B M     MB 3H r   h9    A       ,5  @.       :X99:    ,X            
    s99X.     . @2hX     2  X      #A   . B S@    #@sH2      @@  B        @  # #2          .  :AhG            
       ;s        .93     :  ;5,     @S ;      M;  @MM    s    SBG        5A@&    .5#@S,X#r    Hh.             
             .: .   S5     ;        i#  r      i&;3A     .   MHr    ,AA@B;                   2                
      :r:    X   .:2&9M:    5       :#           @AH     9  rB 2@M@5:  H             5H .       ;33           
    S9GGG3,.            @   h        H s          9H:    s  #;    r   iA##HM;            .     r3X,           
       .  .               #:@        @A@          XHr     #AB   ;     B      i@                95             
    .    .            &    .H         H# s        3A5     ,A  .      B         ;             5      h&        
 9H   s;i,       s52  X      #r       .H9r        GBh     @.  r     MX            ,hS,    9@    2h.&&h        
            #     r    S       &H       Hr        BHX    rB  #    3H r                ,M.     ,hX: r:         
        .s&@MM###M#9:            H      M&       .AH     @r @    &@                 BG       s5XBAX:          
    3s  .@.          i&#AH;       H    , #H      2HH     BB,  rAMMM@#9     5s    ,B3#@9r5#@AS           ;     
     X:#                @ @A      iX   @  #H      &B5    H   &@                A@            G::       ,&;    
  &3  9               X9    @S     MA  9   @GX    BHH    #&SG9       r       &A             iA          A     
    ;            HS;.         #BA#. 2& 3     @A.   GH@.  ,AAr              ;#   sBM                    si,    
 r ;       &hAGh            ,X#s;;@G&AH#      BH@: AAB@  HHG    3  h&i     @    s   @           r    :        
  ;& r,   ;Xhr;           @.         i@BAG&AAM# 3BA&hGB HA@    H  A&&     @      ,   # ,       r   #          
  rhs   2@. ,                 &A.r;     MX         3G&ABA@    :ss, .S&G iBi      ..39 ,9s     &i@s            
   5.       9@i               S   s .    MM        r9ABH@      r      :GH.             ;    3:                
               .G@#:       9H          #SB@&        G&H@       @S; , M@               i    @                  
                     #Bi  : XB;   :i9M@5   ,HAX     &GH#       @   9BS,,2@3           5 2H                    
          h            .#MhA.                :BG    BGABs      s rh9        B ;      @                        
       ,;,. @       ss     .M#                 @&A; #&&H@     AA&#        :S X:   :@                   ,9     
      3G&&    :MM@@.         HB       r          @&&H&AHB;i@HA@        .S       :&5S2:                33:     
     ,&i             2#      iB#  5is    HA,      ;MAhABBAH#X         @        X#                ,h#X 3   3&G:
          ;X@3:rMr    .:Hh&&@h :Hs5S;   h  ;sh&     XGABBi   .2@@A&H&BHHBBBB#B@H.       :iH##2     hA         
     SB,         .#              @Ah.    9 .        3&AHA&9B#i               r&.BHH#AH5          .&GG         
                A                  #MA     :        2&ABBBB                   @      @H.    ;G.  .;           
              .                      rHB     3      G&AHH@                     @           r     rr           
            :           9&A&, 2XS;:;5#@2A&.   r;    #GAHH#              :SS     .5        ;& :M&M             
                       A&i                i#&AS#    HHAHB@#h           &hh        S 9                         
                                              5#GHHAA&AMH3     .3  .Gr         .Ghr  :                        
                                                   i&H&HB,      2i     r,          s  .                       
                                                   MhHBBA      AX  .X              ,G2 i                      
                                                   H&AHBM                               s                     
                                                   &&HBH@                                                     
                                                  A&&AMBs                                                     
                                                  BGABHA                                                      
                                                  &&ABH@                                                      
                                                 SG&HBB@                                                      
                                                 @G&HBB#                                                      
                                                 HG&HBB2                                                      
                                                 &G&HBB5                                                      
                                                 GG&HBBX                                                      
                                                 GG&HBB@                                                      
                                                 GG&HBB#                                                      
                                                 GG&HBBM                                                      
                                                 &&AHBBB3                                                     
                                                 &&AHBBM#                                                     
                                                 AAAHBBBB,                                                    
                                                 AAAHBBMB#                                                    
                                                .AAAHBBBHM                                                    
                                                .HAHHBBBMBH                                                   
                                                .HAHHBBMMM#                                                   
                                                ,HHHHBBBMBB                                                   
                                                rHHHHBBBBBB                                                   
                                                BHBBBHHBBBHS                                                  
                                                ........:XASr                                                 
                                               STOP SEARCHING
                                      TOOLS FOR GTD. DON'T TRY. JUST DO.
                                      ALL YOUR STUFF IN ONE PLACE OF 4TREE
                                     I'M HERE NOW. JUST DO. I WILL HELP YOU.
                                     

-->

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

	<div class="header_text">
	</div>
	
	<div class="view_type">
		<div id="v1" class="view_button view_selected"></div>
		<div id="v3" class="view_button"></div>
		<div id="v2" class="view_button"></div>
		<div id="v4" class="view_button"></div>
	</div>
	
	<div class="basket basket_empty" title="Выбранные дела"><i class="icon-basket"></i><div class="basket_count">0</div></div>
	
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
			<div id="main_menu"><div class="h_button round_left round_right"><i class="icon-align-justify"></i></div>
			    <ul>  
					<li><a class="show_hidden_do">Скрыть выполненные дела</a></li>
					<li><a class="show_childdate_do">Скрыть дату следующего действия у папки</a></li>
			        <li></li> <!-- separator -->  
			        <li><a class="m_zoom_in">Увеличить масштаб дерева<span class="m_key">alt <i class="icon-plus-circle"></i></span></a></li>  
			        <li><a class="m_zoom_out">Уменьшить масштаб дерева<span class="m_key">alt <i class="icon-minus-circle"></i></span></a></li>  
			        <li><a class="m_zoom_default">Масштаб дерева по умолчанию<span class="m_key">alt+"0"</span></a></li>  
			        <li></li> <!-- separator -->  
			        <li>Расположение панелей  
			            <ul>  
			                <li><a id="v1">Вид №1<span class="m_key">alt+"1"</span></a></li>  
			                <li><a id="v2">Вид №2<span class="m_key">alt+"2"</span></li>  
			                <li><a id="v3">Вид №3<span class="m_key">alt+"3"</span></li>  
			                <li><a id="v4">Вид №4<span class="m_key">alt+"4"</span></li>  
			            </ul>  
			        </li>  
			        <li></li> <!-- separator -->  
			        <li>Редактор  
			            <ul>  
			                <li>Отменить один шаг редактирования<span class="m_key">alt+"z"</span></li>  
			                <li>Вернуть один шаг редактирования<span class="m_key">alt+shift+"z"</span></li>  
			            </ul>  
			        </li>  
			        <li>Поделиться  
			            <ul>  
			                <li><a class="send_by_mail"><i class='icon-mail-2'></i> По электронной почте</a></li>  
			                <li>Короткая ссылка</li>  
			                <li>Опубликовать на моём сайте</li>  
			            </ul>  
			        </li>  
			        <li>Печать
			            <ul>  
			                <li>Распечатать содержимое редактора</li>  
			                <li>Распечатать содержимое календаря</li>  
			                <li>Распечатать дерево</li>  
			            </ul>  
			        </li>  
			        <li>Таймер
			            <ul>  
			                <li>1 минута</li>  
			                <li><b>5 минут</b></li>  
			                <li>10 минут</li>  
			                <li><b>15 минут</b></li>  
			                <li>20 минут</li>  
			                <li><b>25 минут</b></li>  
			                <li>30 минут</li>  
			                <li>40 минут</li>  
			                <li>50 минут</li>  
			                <li>60 минут</li>  
			                <li>90 минут</li>  
			                <li></li>
			                <li>Что такое pomidorro?</li>  
			                <li></li>
			                <li>Отменить таймер</li>  
			            </ul>  
			        </li>  
			        <li>Синхронизация
			        	<ul>
				        	<li><a class="m_refresh">Обновить дерево<span class="m_key">alt+"R"</span></a></li>  
				        	<li><a class="m_refresh_all">Обновить дерево полностью<span class="m_key"></span></a></li>  
				        </ul>
				    </li>
				    <li>
				    	<font color="lightgray">версия 4tree.ru — <? include "!version.txt"; ?></font>
				    </li>
			    </ul>  
			</div>  


		&nbsp;
		<div class="h_button round_left" id="tree_back"><i class="icon-left-dir"></i>
		</div><div class="h_button round_right" id="tree_forward"><i class="icon-right-dir"></i></div>
		&nbsp;
		<div style="display:none" id="pt1" class="h_button round_left" title="вид: колонки"><i class="icon-calendar-alt" style="font-size:1.2em;vertical-align:-1px;"></i>
		</div><div style="display:none" id="pt2" class="h_button" title="вид: иконки"><i class="icon-th-large" style="font-size:1em"></i>
		</div><div id="pt3" class="h_button" title="вид: горизонтальные панели"><i class="icon-list" style="font-size:1.05em"></i>
		</div><div style="display:none" id="pt4" class="h_button round_right" title="вид: дерево"><i class="icon-folder-open" style="font-size:1em"></i></div>
		&nbsp;
		&nbsp;
		<div style="display:none" class="h_button round_left"><i class="icon-export-1"></i>
		</div><div id="add_menu"><div class="h_button round_right" title="Добавить новое дело"><i class="icon-list-add"><font style="font-size:0.5em;vertical-align:middle">&nbsp;</font></i></div>
			    <ul>  
			        <li><a class="add_do_down">Добавить дело вниз<span class="m_key">alt+<i class="icon-down-bold"></i></span></a></li>  
			        <li><a class="add_do_right">Добавить дело вправо<span class="m_key">alt+<i class="icon-right-bold"></i></span></a></li>  
			        <li></li>
			        <li><a class="delete_do">Удалить дело<span class="m_key">del</span></a></li>  
				</ul>
			  </div>
		&nbsp;
		&nbsp;
		<a id="blob-archive" style="display:none" href="">blob</a>
			  
	<div class='tree_history'><ul></ul></div>			  
			  
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
				
				
				<div class="search_panel_result panel_type3"><ul></ul></div>
	  			<div class="search_arrow"></div>

	  			<div id="tree_news">
	  				<div id="news_header">
		  				Заметки | Все комментарии | Мои комментарии
		  			</div>
		  		</div>

				
			    <div id="calendar" class="noselectable1">
				</div>	

				<div class="favorit_tabs" id="fav_calendar">
    				<ul>
    					<li id="tab_find"><i class="icon-search"></i> Поиск</li><li class="active" id="tab_calendar">
    					<i class="icon-calendar"></i> Календарь</li><li id="tab_news">
    					<i class="icon-clock"></i> Мои новости</li>
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
	  		<div class="sos"><i class="icon-cd"></i><div id="myloader"></div></div>
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
					<div class="fullscreen_button icon-resize-full" title="На весь экран"></div>					
					
	  			
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

		 <div id="pomidoro_icon">
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


  <div class="open_calendars" title="Открыть календарь дневника"><i class="icon-calendar-inv"></i>
  </div><div id="diary_panel">
	    <div class="h_button"  title="Открыть день в дневнике"> <div class="todaydate">13 ноября</div>&nbsp;
		</div>
		<div class="h_button" title="Открыть неделю в дневнике (новое окно)"><div class="todayweek">(4 нед.)</div></div>
		<!--<div id="diaryright" class="h_button round_right"><i class="icon-right-dir"></i></div>
		<div id="diaryleft" class="h_button round_left"><i class="icon-left-dir"></i></div> -->
  </div>

	
	<div id="search_panel">
  		<input type="text" id="textfilter">
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
	<h2>Горячие клавиши <b>alt</b> + </h2>
	<ul>
		<li><b>F</b><span>- развернуть заметку на весь экран</span></li>
		<li><b>S</b><span>- сохранить заметку</span></li>
		<li><b>D</b><span>- открыть дневник</span></li>
		<li><b>1</b><span>- вид №1</span></li>
		<li><b>2</b><span>- вид №2</span></li>
		<li><b>3</b><span>- вид №3</span></li>
		<li><b>4</b><span>- вид №4</span></li>
		<li><b> <i class="icon-down-bold"></i></b><span>- добавить дело вниз</span></li>
		<li><b> <i class="icon-right-bold"></i></b><span>- добавить дело вправо</span></li>
		<li><b><i class="icon-plus-circle"></i></b><span>- увеличить шрифт</span></li>
		<li><b><i class="icon-minus-circle"></i></b><span>- уменьшить шрифт</span></li>
		<li><b>0</b><span>- шрифт по умолчанию</span></li>
	</ul>
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
					<li></li>
					<li><a class="show_mindmap"><i class='icon-leaf'></i> Показать карту ума</a></li>
					<li></li>
					<li><a class="send_by_mail"><i class='icon-mail-2'></i> Отправить заметку по эл.почте</a></li>
					<li></li>
					<li><i class="icon-stop" style="color:red"></i> Цвет ярлычка
						<ul>
							<li><a class="fav_color fav_red" fav="1"><b>красный</b></a></li>
							<li><a class="fav_color fav_yellow" fav="2"><b>жёлтый</b></a></li>
							<li><a class="fav_color fav_green" fav="3"><b>зелёный</b></a></li>
							<li></li>
							<li><a class="fav_color fav_cyan" fav="4"><b>салатовый</b></a></li>
							<li><a class="fav_color fav_blue" fav="5"><b>синий</b></a></li>
							<li><a class="fav_color fav_orange" fav="6"><b>оранжевый</b></a></li>
							<li><a class="fav_color fav_magenta" fav="7"><b>фиолетовый</b></a></li>
							<li></li>
							<li><a class="fav_color fav_no" fav="0"><b>без цвета</b></a></li>
						</ul>
					</li>
					<li><i class="icon-camera"></i> Иконка
						<ul>
							<li><a class="fav_icon"><i class="icon-progress-0"></i><b>прогресс 0%</b></a></li>
							<li><a class="fav_icon"><i class="icon-progress-1"></i><b>прогресс 30%</b></a></li>
							<li><a class="fav_icon"><i class="icon-progress-2"></i><b>прогресс 70%</b></a></li>
							<li><a class="fav_icon"><i class="icon-progress-3"></i><b>прогресс 100%</b></a></li>
							<li></li>
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
									<li></li>
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
									<li></li>
									<li><a class="fav_icon"><i class="icon-lock"></i><b>закрыто</b></a></li>
									<li><a class="fav_icon"><i class="icon-lock-open"></i><b>открыто</b></a></li>
									<li></li>
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
		</div>
		
	</div>
</div>

<div class="sync_console">
	<ul>
	</ul>
</div>


</div>
<!--


532XX3XX25SS5s                                                                                                
iXXXXXXXXXXXXXX2   52XXX555255SSi                                                                             
 5XXXXXXXXXXXXXX2  52XXX2XXXX3XXXS     2S5525Si;;,.                                                           
 5XXXXXX,  ;2XXX3; SXXXXXXXXXX2X29s   5XXXXXXXXX2X5; SX2XXXiS                                                 
  5522225   522225  5XXX2XSssiX2XXX,  53XXXXXXXXXXXX.  32XX2Xr   r9XXXX2  5                                   
  S555555, ,55555SS :22252S   S22225r rXXXXXXXXXXXX92  ,3XXXX22  22XXXXS  X3:                                 
  ;5S55555555555S5   5S5555:   S55555  5222222r         S552225s 5X2222s s2XX255555S 555S .,                  
   i5SSSSSSSSSSSSSS  i55555S    S55S5s  5555555          2555552SX5555S  i32222222552s 239S SX2.:32  25       
   SiSSSSSSSSS5iSiSi  5SSSSSS   2S5SSS2 rSSSSS5;          SSSSSS55SSSS5 i52X5555555552i :22S;;535 53i S3s     
   ;iiiiiiS   SiiiiSs 5iiiiiSSSS5Siiiii  5SSSSii          ,SSSSSSSSSSS5   .5SSSSSSSSSS5S  SSS5 SS5 S25 55S    
    siiiiiS   ,iiiiiS .SiiiiiiiiiiiiiiiS  iiiiiS5          SiiiiiiiiiiSiisi  :SiSSSSSS5Si. 5Ss5 Sii Si5 S55   
    isssssi5,.2isssss  siiissssssssiiisi; 5iSsiii           iiiiissisiiiiissS,  5iiiiiiiiS, Ssi5 si5 2i5 5Si  
    2ssssssssssssssssr 5sssssSSSSSSsiissi  sisssssssssiiiiiSsssssii :iissisissi5  ssriisiiiS iss  rsS 5ss Xr  
    issrssssssssssssss rsssrr5     Sssssi: :sisssssssssiissrrrssssr2   Sssssssisr5. rii:                      
    rrrrrrrrrrrrrrr;;   rrrrrr     :ssrrsi  :rrrrrrrrrrrrrrssssssssr      2ssrrrrrrs; si                      
    :;rr;;rrr;;;rrrS    r;rrrs      S;rr:;    iirrrrrrrrrrr;;;;;;;;;:       5rrrrrrrri5 S                     
                                                                                                              
     issrrrss Sssssss    siiiiiiiiiii irsssi   ssssr5ssrsrrrsrrrrs srrssS  ssssrs.ssrrssssssS  rssssrrrsss5   
     isssssii.;sssrsiS   ssssssssssrr rirrr5  .srrrr.isrssssrssssS srrss   rrrss isissssssssi ,ssssssssssr    
       ;ss   iss   is:  Sisssssssssi55ssssir  Sssssr rssssssssiiis2sssss  Ssssi5 Sissiriisssr 5sisss55555S    
       iss   si,  .sS   issiiiiS5555 siirsi   irsii2rsisiiisss    iiiiis  Sssis 5iiis5 SsiiiS iiisiiSi5r      
       iir  riS   sSS   iiiiiSr     :iiiSiS  iiiiii    5iiiiii   5siiiS  SSiii5 SiiiiSisssii SiiisSiii5       
      SSi   sSSSiiiS   ;SSiiiiiSiSS SiiiiS   iiiii2    iiiiSi    iSiii, 5iiiSi iSiiiiiiiiii riSiiiSS55        
      ii;              5SSSSSiiSSsiSisSSSS  S5SSSS    S5SSSi5   SiS555 5iSSiS;SSSSSSSSiis   iSSSSS   .        
   :SSiSi SS 5SS Si5S  25555SSSS5S SSS55S  ,5S555:   siSS55S   5555S55S52555SS555S5 525552 S55S55SSS2         
   S2525ii2S 52,S52,. 2555525;::. S555555SS555525    S55552:   5S5555555555Ss5S525  S52255SX55555222.         
    r55  X2;i25 2222i 522225      X2222222X222X2    52222X5    22222222225,s2S555.  SSr:.                     
    X3  SX2XX3 SX25i 5X2XXX      S2XXXXXXXXXXXi    ,X2XX25      sSrr:                                         
   525 sX5 S2sS2222 iXXX325      X9X2SS5S5255s                                                                
  :2X  32 5X2 3XXX2:i55S;:                                                                                    
  ii 

DONT PROCRASTINATE, BACK TO THE WORK. NOW IS THE BEST TIME TO MAKE YOUR FUTURE. NO TOMMOROW! TODAY.
-->
</body>
</html>