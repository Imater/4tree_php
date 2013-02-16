<?php
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
include "config.php";

function RatioResizeImg($image ,$newWidth, $newHeight)

{

	$mime_type=mime_content_type($image);

	switch ($mime_type)
	{

		case "image/gif": $srcImage= ImageCreatefromgif($image); break;

		case "image/jpeg": $srcImage= ImageCreatefromjpeg($image); break;
		
		case "image/png": $srcImage= ImageCreatefrompng($image); break;

	}

$srcWidth= ImageSX($srcImage);

$srcHeigth= ImageSY($srcImage);

	//проверка пропорции картинки

	$ratioWidth = $srcWidth/$newWidth;

	$ratioHeight = $srcHeigth/$newHeight;

	if ($ratioWidth < $ratioHeight)

		{

		$destWhidth = $srcWidth/$ratioHeight;

		$destHeight = $newHeight;

		} else

			{

			$destWhidth=$newWidth;

			$destHeight=$srcHeigth/$ratioWidth;

			}

//создаем новую картинку с конечными данными ширины и высоты

$destImage = imagecreate($destWhidth, $destHeight);

//копируем srcImage (исходную) в $destImage (конечную)

ImageCopyResized($destImage, $srcImage,0, 0, 0, 0, $destWhidth, $destHeight, $srcWidth, $srcHeigth);

	$mime_type=mime_content_type($image);

	switch ($mime_type)
	{

		case "image/gif": imagegif($destImage); break;

		case "image/jpeg": imagejpeg($destImage); break;

		case "image/png": imagepng($destImage); break;

	}

		imagedestroy($srcImage);

		imagedestroy($destImage);



}
//--------------------------------------------------------------------------------------
?>
<html>
	<head>
		<meta name="content-type" content="text/html; charset=UTF-8">
	</head>
<body>
<?php
if (isset($_GET['upload_image']))
{
print '<form action="upload.php?upload_image" method="post" enctype="multipart/form-data">
		<table>
    		<tr>
      			<td style="vertical-align: top; width: 109px;"><br></td>
        		<td style="vertical-align: top; width: 615px;">
			Для лучшего результата распознавания сканируйте в:<br>
         			<ul>
         				<li>разрешении 300dpi</li>
         				<li>цветности 24bit</li>
         				<li>формате jpg или png<br></li>
         			</ul>
        		</td>
    		</tr>
			<tr>
 				<td style="vertical-align: top; width: 109px;"><br></td>
 				<td style="vertical-align: top; width: 615px;">
 					<input name="userfile1" type="file"><br>
 					<input name="userfile2" type="file"><br>
 					<input name="userfile3" type="file"><br>
 					<input name="userfile4" type="file"><br>
 					<input name="userfile5" type="file"><br>
     				<br>
       				<br>
					<center>
						<input name="upload_image_bt" value="Загрузить файл" type="submit"><br>
					</center>
 				</td>
			</tr>
		</table>';
}
if (isset($_GET['upload_archive']))
{
print '<form action="upload.php?upload_archive" method="post" enctype="multipart/form-data">
<table>
	<tr>
    	<td style="vertical-align: top; width: 109px;"><br></td>
        <td style="vertical-align: top; width: 615px;">Для лучшего результата распознавания сканируйте в:<br>
        <ul>
       		<li>разрешении 300dpi</li>
        	<li>цветности 24bit</li>
        	<li>формате jpg или png<br></li>
        </ul>
        </td>
    </tr>
	<tr>
   		<td style="vertical-align: top; width: 109px;"><br></td>
    	<td style="vertical-align: top; width: 615px;">
    		<input name="upload_archive" type="file"><br>
     		<br>
		<!--	Я загружаю архив типа: &nbsp tar <input name="radio" value="w" type="radio" >; zip <input name="radio" value="w" type="radio">; tar.gz <input name="radio" value="w" type="radio">; tar.bz2 <input name="radio" value="w" type="radio">; -->
     		<br>
     		<br>
		<b>Примечание:</b>
		<span style="color: red;">Пока работает только загрузка архивов <b>zip</b></span>
     		<br>
		<br />
    		<center><div style="text-align: center;">
    				<input name="upload_archive_bt" value="загрузить архив" type="submit"><br>
      				</div>
      		</center>
     		</td>
	</tr>
</table>';
}
if(isset($_POST['upload_archive_bt']))
{
	$uploaddir = SYSTEM_PATH.'/uploads/';

	if (move_uploaded_file($_FILES['upload_archive']['tmp_name'], $uploaddir.$_FILES['upload_archive']['name']))
	{
		print 'Архив успешно загружен';
		exec('unzip '.SYSTEM_PATH.'/uploads/'.$_FILES['upload_archive']['name'].' -d '.SYSTEM_PATH.'/uploads/');
		exec('rm -rf '.SYSTEM_PATH.'/uploads/'.$_FILES['upload_archive']['name']);
		$dir = scandir(SYSTEM_PATH.'/uploads');
		//print_r($dir);
		for ($i=0;$i<count($dir)-2;$i++)
		{
			ob_start();
								//изменяем размер, будет сохранено в буфере
			RatioResizeImg(SYSTEM_PATH."/uploads/".$dir[$i+2], "150", "150");
								//копируем в переменную
			$resizedImage = ob_get_contents();
								//очищаем буфер
			ob_end_clean();
			$resizedImage;
			$file = fopen(SYSTEM_PATH."/img/".$dir[$i+2],"w+");
			fwrite($file,$resizedImage);
		}
		print "<script type='text/javascript'>parent.frame2.location.href='list_images.php'</script>";
	}else {
        print "Не удалось загрузить архив. Возможно он уже существует...";
        }
}

if(isset($_POST['upload_image_bt']))
{
	for ($i=1;$i<=5;$i++){
		$uploaddir = SYSTEM_PATH.'/uploads/';
		if (move_uploaded_file($_FILES['userfile'.$i]['tmp_name'], $uploaddir .
			$_FILES['userfile'.$i]['name'])) {
			print 'Файл успешно загружен<br>';
			//сохраняем в буфер
			ob_start();
			//изменяем размер, будет сохранено в буфере
			RatioResizeImg(SYSTEM_PATH."/uploads/".$_FILES['userfile'.$i]['name'], "150", "150");
			//копируем в переменную
			$resizedImage = ob_get_contents();
			//очищаем буфер
			ob_end_clean();
			$resizedImage;
			$file = fopen(SYSTEM_PATH."/img/".$_FILES['userfile'.$i]['name'],"w+");
			fwrite($file,$resizedImage);
			print "<script type='text/javascript'>parent.frame2.location.href='list_images.php'</script>";
		}else {
	    	print "фаил не загружен или уже существует<br>";
		}
	}

}
if (isset($_GET['name']))
{
	system('cuneiform -f html -l ruseng -o '.SYSTEM_PATH.'/convert/'.$_GET['name'].'.html '.SYSTEM_PATH.'/uploads/'.$_GET['name']);
	print "<script type='text/javascript'>parent.frame4.location.href='convert/".$_GET['name'].".html'</script>";
}
?>
</form>
</body>
</html>
