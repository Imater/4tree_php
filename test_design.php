<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="ru" class="<? echo $theme_dark; ?>" style="background-image:url(<? echo $theme_img; ?>)" <? if( ($_SERVER["HTTP_HOST"]!="localhost") AND ($_SERVER["HTTP_HOST"]!="192.168.0.52")) echo "manifest='!".$compress_stamp."_manifest.appcache'"; ?> >
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

<link rel="stylesheet" type="text/css" href="css/test-design.css"/>
<link rel="stylesheet" type="text/css" href="fontello/css/fontello.css"/>

<script src="js/jquery-1.10.1.min.js"></script>
<script src="js/jquery-ui-1.10.3.custom.min.js"></script>
<script src="js/scrollable.js"></script>
</head>

<body>
	<div id="tree_wrap">
		<div id="tree_header">
			<ul class="tree_tab_menu">
				<li><a>Управление</a></li>
				<li class="active"><a>Дела</a></li>
				<li><a>Что нужно сделать сегодня</a></li>
				<li><a>Мысли</a></li>
				<li><a>Новый дизайн</a></li>
				<li><a>Активный текст</a></li>
				<li><a>Записки дебианщика</a></li>
			</ul>
		<div id="tree_fav">
		</div>
		
		</div>
	  <div id="tree_left_panel">
			<ul>
				<li>_НОВОЕ</li>
				<li>Входящие</li>
				<li>Календарь</li>
				<li>Дневник</li>
				<li>Мысли вслух</li>
			</ul>
	  </div>
	</div>

Simple Design
</body>