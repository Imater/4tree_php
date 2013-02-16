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
include_once 'config.php';
?>
<html>
	<head>
		<meta name="content-type" content="text/html; charset=UTF-8">
	</head>
<body >
	<font color=" 000000"><center><small>Экспорт в формат <b>ODT</b> пока в стадии разработки! Извините...</small></center></font>
</body>
</html>
<?php
function odt()
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
	//exec('cd '.SYSTEM_PATH.'/convert/; zip -r '.SYSTEM_PATH.'/convert/out.zip ./*');
	//print "<script>window.open('convert/out.zip')</script>";
	$temp=file_get_contents(SYSTEM_PATH.'/convert/ALL.html');
	$text=eregi_replace('<.{1,6}>|
						<p .{1,20}>|
						<meta .{1,100}>|
						<!DOCTYPE .{1,200}>|
						<img .{1,200}',' ',$temp);
	$content=fopen(SYSTEM_PATH.'/odt/content.xml','w');
	print $text;
	fwrite($content,'<?xml version="1.0" encoding="UTF-8"
	<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
	 xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
	  xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
	   xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"
	    xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0"
	     xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"
	      xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:dc="http://purl.org/dc/elements/1.1/"
	       xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0"
	        xmlns:number="urn:oasis:names:tc:opendocument:xmlns:datastyle:1.0"
	         xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0"
	          xmlns:chart="urn:oasis:names:tc:opendocument:xmlns:chart:1.0"
	           xmlns:dr3d="urn:oasis:names:tc:opendocument:xmlns:dr3d:1.0"
	            xmlns:math="http://www.w3.org/1998/Math/MathML"
	             xmlns:form="urn:oasis:names:tc:opendocument:xmlns:form:1.0" 
	             xmlns:script="urn:oasis:names:tc:opendocument:xmlns:script:1.0" 
	             xmlns:ooo="http://openoffice.org/2004/office" 
	             xmlns:ooow="http://openoffice.org/2004/writer" 
	             xmlns:oooc="http://openoffice.org/2004/calc" 
	             xmlns:dom="http://www.w3.org/2001/xml-events" 
	             xmlns:xforms="http://www.w3.org/2002/xforms" 
	             xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
	             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
	             xmlns:rpt="http://openoffice.org/2005/report" 
	             xmlns:of="urn:oasis:names:tc:opendocument:xmlns:of:1.2" 
	             xmlns:rdfa="http://docs.oasis-open.org/opendocument/meta/rdfa#" 
	             xmlns:field="urn:openoffice:names:experimental:ooxml-odf-interop:xmlns:field:1.0" 
	             xmlns:formx="urn:openoffice:names:experimental:ooxml-odf-interop:xmlns:form:1.0" 
	             office:version="1.2">
	<office:scripts/>
	<office:font-face-decls>
		<style:font-face style:name="Liberation Serif" svg:font-family="&apos;Liberation Serif&apos;"
		 style:font-family-generic="roman" 
		 style:font-pitch="variable"/>
		<style:font-face style:name="Arial" svg:font-family="Arial" 
		 style:font-family-generic="swiss" 
		 style:font-pitch="variable"/>
		<style:font-face style:name="DejaVu Sans" 
		 svg:font-family="&apos;DejaVu Sans&apos;" 
		 style:font-family-generic="system" 
		 style:font-pitch="variable"/>
	</office:font-face-decls>
	<office:automatic-styles/>
		<office:body>
			<office:text>
			<text:sequence-decls>
				<text:sequence-decl text:display-outline-level="0" 
				 text:name="Illustration"/>
				<text:sequence-decl text:display-outline-level="0" 
				 text:name="Table"/>
				<text:sequence-decl text:display-outline-level="0" 
				 text:name="Text"/>
				<text:sequence-decl text:display-outline-level="0" 
				 text:name="Drawing"/>
				</text:sequence-decls>
				<text:p text:style-name="Standard">'.$text.'</text:p>
				</office:text></office:body></office:document-content>');
	exec('cd '.SYSTEM_PATH.'/odt/; zip -r '.SYSTEM_PATH.'/odt/out.odt ./* ');
}
?>