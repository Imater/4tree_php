<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html lang="ru" class="" manifest="">
<!-- 1browser_manifest -->

<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=utf-8">

<meta charset="utf-8">

<head>
<title>4tree.ru — мой фоторедактор</title>
<meta name="description" content="Сайт для ведения дел, заметок, календаря и так далее. Инструмент таймменеджмента, где всё нужное собранно в одном месте."/>
<meta name="keywords" content="gtd, 4tree.ru, заметки, задачи, гтд, таймменеджмент, хранение заметок, календарь"/>



<link rel="search" type="application/opensearchdescription+xml" title="4tree.ru Добавление дел" href="/SearchEngineInfo.xml" />


<link rel="shortcut icon" href="favicon1.png" type="image/x-icon" />
<link rel="icon" href="favicon1.png" type="image/x-icon" />

<script src="js/jquery-1.10.1.min.js"></script>
<script src="js/jquery-ui-1.10.3.custom.min.js"></script>
<script src="fabric.js-1.1.0/dist/all.js"></script>
<script src="js/4tree-foto.js"></script>
<link rel="stylesheet" type="text/css" href="css/4tree-foto.css">
<link rel="stylesheet" type="text/css" href="fontello/css/fontello.css">


<script type="text/javascript">
var foto_url_global = "<? echo $HTTP_GET_VARS["foto"]; ?>";
$(document).ready(jsFotoDoFirst); 
</script>

</head>

<body onload="jsFotoDoFirst">
<h1 id="save_button">4tree.ru - редактирование фотографий</h1>

<div id="foto_toolbar">
	<ul>
	 <li id="tool_pencil"><i class="icon-pencil"></i></li>
	 <li><i class="icon-picture-1"></i></li>
	 <br>
	 <li><i class="icon-resize-small"></i></li>
	 <li><i class="icon-stop"></i></li>
	 <br>
	 <li><i class="icon-right-thin"></i></li>
	 <li><i class="icon-play"></i></li>
	 <br>
	 <li><i class="icon-font"></i></li>
	 <li><i class="icon-record"></i></li>
	 <br>
	 <li><i class="icon-minus"></i></li>
	 <li><i class="icon-stop"></i></li>
	 <br>
	 <li><i class="icon-zoom-out"></i></li>
	 <li><i class="icon-zoom-in"></i></li>
	</ul>
</div>

<div id="foto_toolbar_settings">
</div>

<div id="foto_canvas">
	<canvas id="c" width="1024" height="868"></canvas>
</div>

</body>