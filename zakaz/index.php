<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=utf-8">
<head>
<title>Обработка накладных ПСР</title>

	<script src="./src/js/jquery.js"></script>
</head>

<?
include "../db.php";
$db = mysql_connect ($config[mysql_host], $config[mysql_user], $config[mysql_password]);
mysql_query("SET NAMES utf8");
mysql_select_db('h116',$db);   
if (!$db) { echo "Ошибка подключения к SQL :("; exit();}

?>



<form method="POST" action="index.php">

<center>

<textarea name="TEXT" rows="10" style="width:90%;height:50%">
<?
$txt1 = str_replace("\'",'',$HTTP_POST_VARS[TEXT]);

$txt = explode("\r\n",$txt1);

if ((strlen($txt1)>1) AND (!stristr($txt1,'Spare part code')) AND (!stristr($txt1,'Состояние склада на')))
{
	echo '"Line number";"Invoice number";"Sales order number";"Spare part code";"Spare part name";"Quantity";"Unit price";"Nett amount";"Total amount";"Rebate amount";"Custom declaration number"'."\r\n";
	
	for($i=1;$i<=count($txt);$i++)
	{
	$cols=explode(";",$txt[$i]);
	
	echo $cols[0].';"'.$cols[1].'";"'.$cols[2].'";"'.$cols[3].'";"'.$cols[4].'";';
	
	echo $cols[5].';'.$cols[6].';'.$cols[7].';'.$cols[8].';'.$cols[9].';';
	
	if (strlen($cols[10])>0) echo '"'.$cols[10].'"';
	
	echo "\n";	
	
	}
}

?>

</textarea>
<?
if (stristr($txt1,'Состояние склада на'))
{
	$sqlnews = "TRUNCATE TABLE `2_sklad`";
	$result = mysql_query($sqlnews);

	echo '<table style="font-size:10px;">';
	for($i=0;$i<=count($txt);$i++)
	{
	$line = str_replace(',','.',$txt[$i]);

	$cols=explode("\t",$line);
	$cols[15]=str_replace(chr(194).chr(160),'',$cols[15]);	
	$cols[16]=str_replace(chr(194).chr(160),'',$cols[16]);	
	$cols[17]=str_replace(chr(194).chr(160),'',$cols[17]);	
	$cols[18]=str_replace(chr(194).chr(160),'',$cols[18]);	

//	echo ' *'.ord($cols[18][2]).'*<br>';

	if ($cols[9]!='') 
	  {
	  echo '<tr><td>';
	  
//	for($j=0;$j<=20;$j++) echo '<td>'.$j.'='.$cols[$j].'</td> ';	
	  
	  echo '</td></tr>';
	  echo '<tr>';
	  echo '<td>'.$cols[9]."</td><td>".$cols[12]."</td><td>Ячейка:".$cols[14].'</td><td>в наличии:'.$cols[15].'</td><td>в т.ч. в резерве:'.$cols[16].'</td>' ;
	  echo "<td>цена входная:".$cols[17]."</td><td>Цена продажная:".$cols[18].'</td>';
	  echo '</tr>';
	  
		$sqlnews = "INSERT INTO `h116`.`2_sklad` (`id`, `art_num`, `name`, `box`, `amount`, `reserv`, `cost1`, `cost2`) VALUES (NULL, '$cols[9]', '$cols[12]', '$cols[14]', '$cols[15]', '$cols[16]', '$cols[17]', '$cols[18]'); ";
		$result = mysql_query($sqlnews);

	  
	  }
	else
	  {
//	  for($j=0;$j<=20;$j++) echo $j.'='.$cols[$j].' | ';	
//	  echo "\n";
	  }
	}
	echo '</table>';

}


if (stristr($txt1,'Spare part code'))
 {

	$sqlnews = "TRUNCATE TABLE `2_nal`";
	$result = mysql_query($sqlnews);

  $time=date("Y-m-d H:i:s",time());
  echo "<h1>Обработка наличия в Москве<br>завершено $time</h1>";
  $ii=0;
 
 for($ii=0;$ii<=count($txt);$ii++)
  {
//    echo $ii.' <hr>';
	if ($ii>5000000) break;
	
	$line = str_replace(',','.',$txt[$ii]);
	$cols=explode("\t",$line);
			    
	$sqlnews="INSERT INTO `h116`.`2_nal` (`id`, `art_num`, `date_m`) VALUES (NULL, '$cols[0]', '$time');";
	$result = mysql_query($sqlnews);
//	echo $ii.'<br>';

  }
  echo "<h2>Добавлено : $ii запчастей в тарификатор.</h2>";

 
 exit;
 }




?>

<br><br><input hint="Сохранение информации о клиенте." name="clientsave" type="submit" value="Обработать наличие запчастей в Москве или 1С">
<br><b>Время ожидания может быть больше 5 минут. <br>После нажатия кнопки ожидайте.</b>
</center>

<br><h2>Описание:</h2>
В верхнее поле, вы можете вставить следующую текстовую информацию:<br>
1.Наличие на складе в Москве (Должно начинаться со слов:"<b>Spare part code</b>", затем идёт перечень номеров запчастей).<br>
2.Наличие на нашем складе (Информация из 1С).<br>
После этого, нажимайте кнопку.<br>
Просьба, держать информацию актуальной!<br>

<hr>


</form>