<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=utf-8">
<head>
<title>Тарификатор Леонар</title>

	<script src="../src/js/jquery.js"></script>
	
</head>

<?
include "../db.php";
$db = mysql_connect ($config[mysql_host], $config[mysql_user], $config[mysql_password]);
mysql_query("SET NAMES utf8");
mysql_select_db('h116',$db);   
if (!$db) { echo "Ошибка подключения к SQL :("; exit();}


if (isset($HTTP_GET_VARS['nal'])) 
 {
	$uploads="";

  $fh = fopen($uploads.$HTTP_GET_VARS['nal'], "r");
  
  $filename=$HTTP_GET_VARS['nal'];

	$sqlnews = "TRUNCATE TABLE `2_nal`";
	$result = mysql_query($sqlnews);

  $time=date("Y-m-d H:i:s",time());
  echo "<h1>Обработка CSV файла наличия ($filename)<br>завершена $time</h1>";
  $ii=0;
while (! feof($fh))
  {
//    echo $ii.' <hr>';
	if ($ii>5000000) break;
	$line = fgets($fh, 4096);
	$line = iconv('windows-1251', 'utf-8', $line);
//	echo $line.'<br>';
	$line = str_replace("\r",'',$line);
	$line = str_replace("\n",'',$line);
	$l = explode(';',$line);
		    
	$sqlnews="INSERT INTO `h116`.`2_nal` (`id`, `art_num`, `date_m`) VALUES (NULL, '$l[0]', '24-05-2011');";
	$result = mysql_query($sqlnews);
//	echo $ii.'<br>';

	$ii++;
  }
  echo "<h2>Добавлено : $ii запчастей в тарификатор.</h2>";

fclose($fh);
 
 exit;
 }


if (isset($HTTP_GET_VARS['csv'])) 
 {
	$uploads="";

  $fh = fopen($uploads.$HTTP_GET_VARS['csv'], "r");
  
	$sqlnews = "TRUNCATE TABLE `2_tarif`";
	$result = mysql_query($sqlnews);

  $filename=$HTTP_GET_VARS['csv'];

  $time=date("Y-m-d H:i:s",time());
  ini_set("max_execution_time","800");
  echo "<h1>Обработка CSV файла ($filename)<br>завершена $time</h1>";
  $ii=0;
while (! feof($fh))
  {
//    echo $ii.' <hr>';
	if ($ii>5000000) break;
	$line = fgets($fh, 4096);
	$line = iconv('windows-1251', 'utf-8', $line);
//	echo $line.'<br>';
	$line = str_replace(',','.',$line);
	$l = explode(';',$line);
		    
	$sqlnews="INSERT INTO `h116`.`2_tarif` (`id`, `art_number`, `brand`, `name_rus`, `name_fr`, `index_num`, `segment`, `marketing`, `kreno`, `cost`, `type`, `group`, `cost_skl`, `cost_avia`, `amount`, `weight`) VALUES (NULL, '$l[0]', '$l[1]', '$l[2]', '$l[3]', '$l[4]', '$l[5]', '$l[6]', '$l[7]', '$l[8]', '$l[9]', '$l[10]', '$l[11]', '$l[12]', '$l[13]', '$l[14]');";
	$result = mysql_query($sqlnews);

	$ii++;
  }
  echo "<h2>Добавлено : $ii запчастей в тарификатор.</h2>";

fclose($fh);
 
 exit;
 }

if (isset($HTTP_GET_VARS['TEXT'])) 
 {
 if (strlen($HTTP_GET_VARS['TEXT'])<4) exit;
 
 $txt = str_replace(" ",'',$HTTP_GET_VARS['TEXT']);
 
	$sqlnews="SELECT * FROM 2_tarif WHERE art_number LIKE '%$txt' LIMIT 1";
	$result = mysql_query($sqlnews);
    $sql = mysql_fetch_object ($result);

 $cost = round ($sql->cost * 1.28); //1,18 рекомендация Москвы
 $cost = number_format($cost, 0, ',', ' ');

 echo '<br><font size="5em" color="gray">'.$sql->name_rus.'</font><br>';
 echo '<font size="5em" color="gray">'.$sql->art_number.' - '.$sql->name_fr.'</font><br>';
 echo '<font size="+30em" title="Розничная цена">'.$cost.' руб</font><br>';
 echo '<br><font color="gray" size="3em">Вес: '.$sql->weight.' кг</font><br>';
 echo '<font  color="gray" size="3em">Кол-во в упаковке: '.$sql->amount.' шт</font><br>';

	$sqlnews2="SELECT * FROM 2_nal WHERE art_num LIKE '%$txt' LIMIT 1";
//	echo $sqlnews2;
	$result2 = mysql_query($sqlnews2);
    @$sql2 = mysql_fetch_object ($result2);
    
//    echo $sql2->date_m;

if ($sql2->date_m !='') echo '<br><font  color="green" size="3em"><b>в наличии в москве на '.$sql2->date_m.'</b></font><br>';
else echo '<br><font  color="red" size="3em">в москве отсутствует</font><br>';

echo '<hr>';

	$sqlnews3="SELECT * FROM 2_sklad WHERE art_num LIKE '%$txt' LIMIT 1";
//	echo $sqlnews2;
	$result3 = mysql_query($sqlnews3);
    @$sql3 = mysql_fetch_object ($result3);

	echo '<font color=gray>По информации в 1С:</font><br>';
	echo '<font size=5em>свободное наличие: <b>'.($sql3->amount - $sql3->reserv).'</b> шт. ';
	if ($sql3->reserv>0) echo '+ в резерве: <b>'.$sql3->reserv.'</b> шт.';
	echo '</font><br><font color=gray>Наименование: '.$sql3->name.'</font><br>';
	$cost3=round(round($sql3->cost2)/$sql3->amount); ///1.0848
	if ($sql3->amount>0) echo '</font><br><font color=gray>Цена в 1С: </font><font size=7em>'.$cost3.' руб</font><br>';
	if($sql3->box!='') echo 'Ячейка хранения: <b>'.$sql3->box.'</b><br>';
//	echo 'Цена по 1С:'.$sql3->cost2.' руб.';

///Информация о закупочной цене
if(isset($HTTP_GET_VARS['slava']))
 {
 echo '<hr><font color=gray>Скрытая информация:</font><br>';
 echo 'Закупочная цена складская / Срочная: <b>'.$sql->cost_skl.' / '.$sql->cost_avia.'</b><br>';
 if ($sql3->amount>0) echo 'Закупочная цена по 1С: <b>'.$sql3->cost1/$sql3->amount.'</b><br><br>';
 echo 'Рекомендованная ПСР продажная цена (без НДС): <b>'.$sql->cost.'</b><br>';
 echo 'Группа товара: <b>'.$sql->group.'</b><br>';
 }


 jsLog("_Поиск запчасти ".$sql->name_rus.' ('.$sql->art_number."). ".$sql->date_moscow,$sql->cost,3,$sql->art_number);



 exit; 
 }
?>


<center>
<font color="gray">артикул з/ч:</font><br>
<input id="TEXT" name="TEXT" style="width:200px;font-size:25px;vertical-align: middle;" value=""><br>
<div id="answer"></div>

<?
function jsLog($txt,$id,$important,$sqlnews1)
 {
   global $fpk_user,$fpk_brand;
   
   $fpk_user = '__Запчасти__';
   $fpk_brand = '-1';
   
   $sqlnews1 = str_replace("'",'"',$sqlnews1);
   
   $sqlnews="INSERT INTO `1_log` (`id`, `date1`, `manager`, `brand`, `text`, `client`, `important`,`sqlnews`) 
             VALUES ('', NOW(), '$fpk_user', '$fpk_brand', '$txt', '$id', '$important','".$sqlnews1."');";
   @$result = mysql_query($sqlnews); 
 }
?>

<center>
</form> 

<script>
var tt;
$('*').undelegate("#TEXT", "keydown").delegate("#TEXT", "keydown", function(event) 
 {
 event.stopPropagation();														
  
 
if (event.keyCode=='13') 
 tt = setTimeout( function() 
    {
    txt = encodeURIComponent($('#TEXT').val());
 	if (!event.shiftKey)
        $('#answer').load('tarif.php?TEXT='+txt);
    else 
        $('#answer').load('tarif.php?TEXT='+txt+'&slava=1');
    },10);
 });
</script>








