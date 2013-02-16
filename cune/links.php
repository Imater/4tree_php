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
		<meta name="content-type" content="text/html; charset=UTF-8">
	</head>
<body >
	<font color=" 000000">
	<center>
    	<a href="upload.php?upload_image" target='frame4'> <img src="btn_icons/upload_up_to_five.png" OnMouseOut="this.src = 'btn_icons/upload_up_to_five.png';" OnMouseOver="this.src = 'btn_icons/upload_up_to_five_mover.png';" title="Загрузить изображение для распознавания" Hspace="30" border="0" alt="Upload image" style="border: 0px; width: 60px; height: 60px;"></a>
    	<a href="upload.php?upload_archive" target='frame4'><img  src="btn_icons/upload_archive.png" OnMouseOut="this.src = 'btn_icons/upload_archive.png';" OnMouseOver="this.src = 'btn_icons/upload_archive_mover.png';" title="загрузить архив изображений для пакетного распознования" Hspace="30" border="0" alt="Upload images pack" style="border: 0px solid ; width: 60px; height: 60px;"></a>
    	<a href="export_odt.php" target='frame4'><img src="btn_icons/exp_odt.png" OnMouseOut="this.src = 'btn_icons/exp_odt.png';" OnMouseOver="this.src = 'btn_icons/exp_odt_mover.png';" Hspace="30"  border="0" title="Экспортировать распознанный текст в формат OpenOffice.org (ODT)" alt="Экспорт распознанного текста в формат ODT" style="width: 60px; height: 60px;"></a>
    	<a href="export_djvu.php" target='frame4'><img src="btn_icons/exp_djvu.png" OnMouseOut="this.src = 'btn_icons/exp_djvu.png';" OnMouseOver="this.src = 'btn_icons/exp_djvu_mover.png';" Hspace="30" border="0"  title="Экспортировать распознанный текст в формат DJVU" alt="Экспотрировать распознанный текст в формат DJVU" style="width: 60px; height: 60px;"></a>
    	<a href="export_pdf.php" target='frame4'><img src="btn_icons/exp_pdf.png" OnMouseOut="this.src = 'btn_icons/exp_pdf.png';" OnMouseOver="this.src = 'btn_icons/exp_pdf_mover.png';" style="border: 0px solid ; width: 60px; height: 60px;" Hspace="30" border="0" title="Экспортировать распознанный текст в формат PDF" alt="Экспортировать распознанный текст в формат PDF" style="width: 60px; height: 60px;"></a>
	</center>
	</font>
</body>
</html>
