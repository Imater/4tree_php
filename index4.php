<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=utf-8">
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width">


<html>
<head>
<title>990990.ru — GTD</title>

<link rel="shortcut icon" href="/fpk/favicon-fpk1.ico" type="image/x-icon" />
<link rel="icon" href="/fpk/favicon-fpk1.ico" type="image/x-icon" />

<link rel="stylesheet" href="css/styles.css" type="text/css">
<script src="./js/jquery.js"></script>
<script src="./js/all.js"></script>

	<script type="text/javascript" src="./jstree/_lib/jquery.cookie.js"></script>
	<script type="text/javascript" src="./jstree/_lib/jquery.hotkeys.js"></script>
	<script type="text/javascript" src="./jstree/jquery.jstree.js"></script>
	<script type="text/javascript" src="./jstree/_docs/syntax/!script.js"></script>

	<link rel="stylesheet" href="./redactor/redactor/css/redactor.css" />
	<script src="./redactor/redactor/redactor.js"></script>
	<script src="./redactor/redactor/langs/ru.js"></script>

		<link type="text/css" href="ui/css/smoothness/jquery-ui-1.8.21.custom.css" rel="stylesheet" />
		<script type="text/javascript" src="ui/js/jquery-ui-1.8.21.custom.min.js"></script>

	<link rel="stylesheet" type="text/css" href="../pro_dropdown_3/pro_dropdown_3.css" />

		
	
<script type="text/javascript">
$(document).ready(jsDoFirst); 
</script>

</head>

<body onResize="onResize();">

<div id="wrap">

	<div id="header">

<ul id="nav">   
	<li class="top"><a href="#nogo2" class="top_link"><span class="down" id="brand-ico">Дела</span></a>
		<ul class="sub tabs2">
		 <li><a href="#" id="abcnet">Новое дело</a></li>
		 <li><a href="#" id="abcnet">Удалить дело</a></li>
		 <li><a href="#" id="abcnet">Переименовать дело</a></li>
		</ul>
	</li>

	<li class="top"><a href="#nogo2" class="top_link"><span class="down" id="brand-ico">Фильтр</span></a>
		<ul class="sub tabs2">
		 <li><a href="#" id="abcnet">Новое дело</a></li>
		 <li><a href="#" id="abcnet">Удалить дело</a></li>
		 <li><a href="#" id="abcnet">Переименовать дело</a></li>
		</ul>
	</li>

	<li class="top"><a href="#nogo2" class="top_link"><span class="down" id="brand-ico">Поручения</span></a>
		<ul class="sub tabs2">
		 <li><a href="#" id="abcnet">Тарасова Татьяна (2)</a></li>
		 <li><a href="#" id="abcnet">Показаньев Алексей (3)</a></li>
		 <li><a href="#" id="abcnet">Балчугов Сергей (41)</a></li>
		</ul>
	</li>

	<li class="top"><a href="#nogo2" class="top_link"><span class="down" id="brand-ico">Сервис</span></a>
		<ul class="sub tabs2">
		 <li><a href="#" id="abcnet">Тарасова Татьяна (2)</a></li>
		 <li><a href="#" id="abcnet">Показаньев Алексей (3)</a></li>
		 <li><a href="#" id="abcnet">Балчугов Сергей (41)</a></li>
		</ul>
	</li>

	<li class="top"><a href="#nogo2" class="top_link"><span class="down" id="brand-ico">Помощь</span></a>
		<ul class="sub tabs2">
		 <li><a href="#" id="abcnet">Тарасова Татьяна (2)</a></li>
		 <li><a href="#" id="abcnet">Показаньев Алексей (3)</a></li>
		 <li><a href="#" id="abcnet">Балчугов Сергей (41)</a></li>
		</ul>
	</li>
  <div class="search-ico"><img height="16px" width="16px" src="..\img\find.png" style=""></div>

</ul>




<ul id="tabs">
<li id="current"><a href="#" title="tab1">Все</a></li>
<li><a href="#" title="tab2">Даты</a></li>
<li><a href="#" title="tab2">Календарь</a></li>
<li><a href="#" title="tab3">Выполнены</a></li>
<li><a href="#" title="tab4">Просрочены</a></li>
</ul>

	</div>
	
	<div id="content1">
		<div id="left-col">
			<img src="img/calendar.png">
			<img src="img/calendar2.png"><span class="roundcount">6</span>
			<img src="img/detail.png">
			<img src="img/car.png">
			<img src="img/face.jpeg" width="32"><span class="roundcount">12</span>
			<img src="img/face1.jpeg" width="32"><span class="roundcount">2</span>
			<img src="img/face2.jpeg" width="32"><span class="roundcount">22</span>
			<img src="img/face3.jpeg" width="32">
			<img src="img/face4.jpeg" width="32"><span class="roundcount">112</span>
			<img src="img/face5.jpeg" width="32">
			<img src="img/face6.jpeg" width="32">
			<img src="img/face7.jpeg" width="32">
		</div>
		
		<div id="right-col">


<!-- the tree container (notice NOT an UL node) -->
<div id="demo" class="demo"></div>
</div>



		
		</div>
		<div id="right-col2">
		<div id="resize"></div>

	<div id="page" style="height:auto;position:absolute;bottom:0px;top:0px;">
	<textarea id="redactor_content" name="content" style="height: auto;bottom:0px;top:0px;position:absolute;">none</textarea>
	</div>

<div id="prop" style="height:250px;background:green;vertical-align:top;position:absolute;width:100%;bottom:0px;">
<ul id="tabs" class="tabsmini">
<li id="current"><a href="#" title="tab1">Заметка</a></li>
<li><a href="#" title="tab2">Данные</a></li>
<li><a href="#" title="tab2">Календарь</a></li>
</ul>
</div>
		
		
		<center style="display:none">
	<input type="button" style='width:170px; height:24px; margin:5px auto;' value="reconstruct" onclick="$.get('./jstree/_demo/server.php?reconstruct', function () { $('#demo').jstree('refresh',-1); });" />
	<input type="button" style='width:170px; height:24px; margin:5px auto;' id="analyze" value="analyze" onclick="$('#alog').load('./jstree/_demo/server.php?analyze');" />
	<input type="button" style='width:170px; height:24px; margin:5px auto;' value="refresh" onclick="$('#demo').jstree('refresh',-1);" />
		</center>
		</div>


		<div id="right-col3">
			<img src="img/calendar.png">
			<img src="img/calendar2.png"><span class="roundcount">6</span>
			<img src="img/detail.png">
			<img src="img/car.png">
			<img src="img/face.jpeg" width="32"><span class="roundcount">12</span>
			<img src="img/face1.jpeg" width="32"><span class="roundcount">2</span>
			<img src="img/face2.jpeg" width="32"><span class="roundcount">22</span>
			<img src="img/face3.jpeg" width="32">
			<img src="img/face4.jpeg" width="32"><span class="roundcount">112</span>
			<img src="img/face5.jpeg" width="32">
			<img src="img/face6.jpeg" width="32">
			<img src="img/face7.jpeg" width="32">
		</div>

	
	<div id="footer">
	
<div id="mmenu" style="overflow:auto;margin-left:60px;">
<input type="button" id="Dates" value="DATES" style="display:block; float:left;"/>
<input type="button" id="Expand" value="expand" style="display:block; float:left;"/>
<input type="button" id="Collapse" value="collapse" style="display:block; float:left;"/>
<input type="button" id="add_folder" value="add folder" style="display:block; float:left;"/>
<input type="button" id="add_default" value="add file" style="display:block; float:left;"/>
<input type="button" id="rename" value="rename" style="display:block; float:left;"/>
<input type="button" id="remove" value="remove" style="display:block; float:left;"/>
<input type="button" id="cut" value="cut" style="display:block; float:left;"/>
<input type="button" id="copy" value="copy" style="display:block; float:left;"/>
<input type="button" id="paste" value="paste" style="display:block; float:left;"/>
<input type="button" id="clear_search" value="clear" style="display:block; float:right;"/>
<input type="button" id="search" value="search" style="display:block; float:right;"/>
<input type="text" id="text" value="" style="display:block; float:right;height:20px;font-size:10px;margin:1px;" />
</div>
	
	
	</div>

</div>

<div id="bubu" style="display:none"></div>

</body>

</html>