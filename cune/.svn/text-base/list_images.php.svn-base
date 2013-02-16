<?
#Copyright (c) 2009, Слугин В.Г., Кузнецов Д.А., Азовцев Ю.Г.
#Разрешается повторное распространение и использование как в виде исходного
#кода, так и в двоичной форме, с изменениями или без, при соблюдении
#следующих условий:
#    * При повторном распространении исходного кода должно оставаться
#      указанное выше уведомление об авторском праве, этот список условий и
#      последующий отказ от гарантий.
#    * При повторном распространении двоичного кода должна сохраняться
#      указанная выше информация об авторском праве, этот список условий и
#      последующий отказ от гарантий в документации и/или в других
#      материалах, поставляемых при распространении.
#    * Ни название <Организации>, ни имена ее сотрудников не могут быть
#      использованы в качестве поддержки или продвижения продуктов,
#      основанных на этом ПО без предварительного письменного разрешения.
#
#ЭТА ПРОГРАММА ПРЕДОСТАВЛЕНА ВЛАДЕЛЬЦАМИ АВТОРСКИХ ПРАВ И/ИЛИ ДРУГИМИ
#СТОРОНАМИ "КАК ОНА ЕСТЬ" БЕЗ КАКОГО-ЛИБО ВИДА ГАРАНТИЙ, ВЫРАЖЕННЫХ ЯВНО
#ИЛИ ПОДРАЗУМЕВАЕМЫХ, ВКЛЮЧАЯ, НО НЕ ОГРАНИЧИВАЯСЬ ИМИ, ПОДРАЗУМЕВАЕМЫЕ
#ГАРАНТИИ КОММЕРЧЕСКОЙ ЦЕННОСТИ И ПРИГОДНОСТИ ДЛЯ КОНКРЕТНОЙ ЦЕЛИ. НИ В
#КОЕМ СЛУЧАЕ, ЕСЛИ НЕ ТРЕБУЕТСЯ СООТВЕТСТВУЮЩИМ ЗАКОНОМ, ИЛИ НЕ УСТАНОВЛЕНО
#В УСТНОЙ ФОРМЕ, НИ ОДИН ВЛАДЕЛЕЦ АВТОРСКИХ ПРАВ И НИ ОДНО  ДРУГОЕ ЛИЦО,
#КОТОРОЕ МОЖЕТ ИЗМЕНЯТЬ И/ИЛИ ПОВТОРНО РАСПРОСТРАНЯТЬ ПРОГРАММУ, КАК БЫЛО
#СКАЗАНО ВЫШЕ, НЕ НЕСЁТ ОТВЕТСТВЕННОСТИ, ВКЛЮЧАЯ ЛЮБЫЕ ОБЩИЕ, СЛУЧАЙНЫЕ,
#СПЕЦИАЛЬНЫЕ ИЛИ ПОСЛЕДОВАВШИЕ УБЫТКИ, ВСЛЕДСТВИЕ ИСПОЛЬЗОВАНИЯ ИЛИ
#НЕВОЗМОЖНОСТИ ИСПОЛЬЗОВАНИЯ ПРОГРАММЫ (ВКЛЮЧАЯ, НО НЕ ОГРАНИЧИВАЯСЬ
#ПОТЕРЕЙ ДАННЫХ, ИЛИ ДАННЫМИ, СТАВШИМИ НЕПРАВИЛЬНЫМИ, ИЛИ ПОТЕРЯМИ
#ПРИНЕСЕННЫМИ ИЗ-ЗА ВАС ИЛИ ТРЕТЬИХ ЛИЦ, ИЛИ ОТКАЗОМ ПРОГРАММЫ РАБОТАТЬ
#СОВМЕСТНО С ДРУГИМИ ПРОГРАММАМИ), ДАЖЕ ЕСЛИ ТАКОЙ ВЛАДЕЛЕЦ ИЛИ ДРУГОЕ
#ЛИЦО БЫЛИ ИЗВЕЩЕНЫ О ВОЗМОЖНОСТИ ТАКИХ УБЫТКОВ.

header("Content-Type: text/html;charset=utf-8");
header("Cache-Control: no-cache, must-revalidate");
?>
<html>
	<head>
	<script type="text/javascript">

	</script>
		<meta name="content-type" content="text/html; charset=UTF-8">
	</head>
<body >
<div id="state"></div>
<form action="list_images.php" method="post">
<?php

//--------------------------------------------------------------------------------------
include "config.php";
//print SYSTEM_PATH;
$files=scandir('img');
if (count($files)>3) print '<input name="convert_all" value="Распознать всё" type="submit">';
//Если в списке на распознавание один файл, то незачем рисовать кнопку <распознать всё>
for ($i=0;$i<count($files)-2;$i++)
{
	
	print "<a href='upload.php?name=".$files[$i+2]."' target='frame4'><img border='0' src='img/".$files[$i+2]."'></a>";
}
?>
<?php
if (count($files)>2) print '<input name="del_all" value="Удалить всё" type="submit">'; else print'<h5>Нет изображений для распознавания</h5>';
if (isset($_POST['del_all']))
{
	system('rm -rf '.SYSTEM_PATH.'/img/*');
	system('rm -rf '.SYSTEM_PATH.'/uploads/*');
	system('rm -rf '.SYSTEM_PATH.'/convert/*');
	print "<script type='text/javascript'>parent.frame2.location.href='list_images.php'</script>";
}

if (isset($_POST['convert_all']))
{
	$dir = scandir(SYSTEM_PATH.'/uploads');
	$all=count($dir)-2;
	for ($i=0;$i<count($dir)-2;$i+=COUNT_PROCESS-1)
	{
	$command='';
		for ($j=0;$j<=COUNT_PROCESS;$j++){
		$command.='cuneiform -f html -l ruseng -o '.SYSTEM_PATH.'/convert/'.$dir[$i+$j+2].'.html '.SYSTEM_PATH.'/uploads/'.$dir[$i+$j+2].' & ';
		}
	exec($command);

	}
	exec('rm '.SYSTEM_PATH.'/convert/*.zip');
	exec('cd '.SYSTEM_PATH.'/convert/; cat ./*.html > ALL.html; mv ALL.html ALL.html.ALL; rm *.html; mv ALL.html.ALL ALL.html');
	exec('cd '.SYSTEM_PATH.'/convert/; zip -r '.SYSTEM_PATH.'/convert/out.zip ./*');
	print "<script>window.open('convert/out.zip')</script>";

}
?>
</form>
</body>
</html>

