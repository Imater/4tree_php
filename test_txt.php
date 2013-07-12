<html lang="ru" manifest="">
<meta name="viewport" content="width=device-width, initial-scale=1,user-scalable=no"> 
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=utf-8">
<meta charset="utf-8">
<head>
<title>4tree.ru — мобильные дела</title>

<script src="./js/jquery-1.8.2.js"></script>

<script>
		setInterval( function(){
			$("#editor").focus().click();
			$("#log").append("focus<br>");
		}, 5000 );
</script>


</head>

<body>


<div contenteditable="true" id="editor">
Тестовый текст
<p>Мы тут</p>
<p>Мы тут</p>
<p>Мы тут</p>
</div>

<span id="log" style="color:#888"> </span>


</body>