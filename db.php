<?

 $HTTP_POST_VARS=$GLOBALS['_POST'];
 $HTTP_GET_VARS=$GLOBALS['_GET'];
 

 require_once('db2.php');


function push ($cids, $message) {
    /*
     * $cids - ID канала, либо массив, у которого каждый элемент - ID канала
     * $text - сообщение, которое необходимо отправить 
     */
    $c = curl_init();
    $url = 'http://4do.me/pub?id=';
        
    curl_setopt($c, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($c, CURLOPT_POST, true);

    if (is_array($cids)) {
        foreach ($cids as $v) {
            curl_setopt($c, CURLOPT_URL, $url.$v);
            curl_setopt($c, CURLOPT_POSTFIELDS, json_encode($message));
            $r = curl_exec($c);
        }
    } else {
        curl_setopt($c, CURLOPT_URL, $url.$cids);
        curl_setopt($c, CURLOPT_POSTFIELDS, json_encode($message));
        $r = curl_exec($c);
    }
    
    curl_close($c);
    
    return $r;
    
}

if (time()<1346331456) $read=1;
else $read=0;

function myCreateRecord($sql, $new_parent, $new_user) {

   $sqlnews="INSERT INTO `tree` SET 
   				user_id = '$new_user',
   				position = '".$sql["position"]."',
   				node_icon = '".$sql["node_icon"]."',
   				adddate = '".$sql["adddate"]."',
   				changetime = '".now1()."',
   				title = '".addslashes($sql["title"])."', 
   				parent_id = '".$new_parent."',
   				text = '".addslashes($sql["text"])."',
   				old_id = '-8'";
   				
   $result = mysql_query_my($sqlnews); 
   $id = mysql_insert_id();
//   echo "<li>parent_id=".$new_parent." | n_i=$id | title=<b>".$sql["title"]."</b></li>";
   
   
   return $id;
};

function now1()
{
//    return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()).valueOf(); 

    return (integer)(microtime(true)*1000);
}


function mySelectBranch($sql2, $new_parent, $new_user) {

  $sqlnews = "SELECT * FROM tree WHERE del=0 AND user_id=11 AND parent_id=".$sql2["id"];
//  echo $sqlnews."<hr>";
  $result = mysql_query_my($sqlnews); 
  $i=0;
//  echo "<ol>";
  while (@$sql = mysql_fetch_array($result))
    {
//	echo "sdfdfsd";
    $id = myCreateRecord($sql, $new_parent, $new_user);
//	echo $id." - ";
    mySelectBranch($sql, $id, $new_user);
    }
//  echo "</ol>";
	
}


function username($shortname) { 
   global $config;     

   return 'Вецель Евгений';
}

function brand($shortname) { 
   global $config;     

   return 'Peugeot';
}

//Верхнее меню для всех страниц ФПК
function menu() { 
return '&nbsp;&nbsp;&nbsp;&nbsp;
       <a href="?r=clients">Клиенты</a> | <a href="?r=stat">Статистика</a> | 
<a href="file://Aldebaran/pgt-autosales$/" target="_blank">Папка ОП</a></div>';

}


//////////////////////////////////////////////////////////////////////////////

//Вывод таблицы с шаблоном $theme
function displayNewsAll($theme,$sqlnews) { 
   global $config,$r,$iii,$rrr;
   $r=$GLOBALS['_GET']['r'];

   $result = mysql_query_my($sqlnews); 
   
   $TXT='';
   $iii=0;
   while ($sql = mysql_fetch_object ($result))
     {
      $TXT.=displayNewsEntry($sql, $theme, $detail="no");
      
      if($rrr==5) $iii+=mod_rrcost($sql);
     } 
   return $TXT;
}

//Вывод одной строки
function displayNewsEntry($sql, $theme, $detail="no") { 
   global $config,$topic;     

   $fullbox=str_replace("\n","", str_replace("\r\n","", implode("", file($config['themedir'].$theme))));
   preg_match_all("/#(.*)#/U",$fullbox,$matches);
   for ($i=0; $i<count($matches[0]); $i++) {
      $func_name="mod_".strtolower($matches[1][$i]);
      if (function_exists($func_name)) {
         $tag=call_user_func($func_name,$sql,66,$detail);
         $fullbox=str_replace($matches[0][$i],$tag,$fullbox);
      } else {
         echo "Func $func_name not exists<br>\n";
      }
   }

if(stristr($theme,'json'))
  {
	static $jsonReplaces = array(
	array("\\", "/", "\t", "\b", "\f", "'"),
	array('\\\\', '\\/', '\\t', '\\b', '\\f', "`"));
	$fullbox = str_replace("'", "`", $fullbox);
	$fullbox = preg_replace("/\r?\n/", "\\n", $fullbox);
  }

   return $fullbox;


}

function UpdateClients()
{
global $HTTP_POST_VARS,$config,$client;
	$sqlnews="UPDATE 1_clients SET 
            fio='".$HTTP_POST_VARS['fio']."',
            phone1='".$HTTP_POST_VARS['phone1']."',
            phone2='".$HTTP_POST_VARS['phone2']."',
            phone3='".$HTTP_POST_VARS['phone3']."',
            phone4='".$HTTP_POST_VARS['phone4']."',
            phone11='".$HTTP_POST_VARS['phone11']."',
            phone22='".$HTTP_POST_VARS['phone22']."',
            phone33='".$HTTP_POST_VARS['phone33']."',
            phone44='".$HTTP_POST_VARS['phone44']."',
            adress='".$HTTP_POST_VARS['adress']."',
            comment='".$HTTP_POST_VARS['comment']."',
            birthday='".$HTTP_POST_VARS['birthday']."'
	    WHERE id=".$client;
   if ($read==0) $result = mysql_query_my($sqlnews); 

}

function UpdateDo()
{
global $HTTP_POST_VARS,$config,$do,$GLOBALS;
	$sqlnews="
UPDATE  `1_do` SET  

`manager` =  '".$HTTP_POST_VARS['SELECTMANAGER']."',
`date1` =  '".$HTTP_POST_VARS['DATE1']."',
`date2` =  '".$HTTP_POST_VARS['DATE2']."',
`text` =  '".$HTTP_POST_VARS['TEXT']."',
`comment` =  '".$HTTP_POST_VARS['DOCOMMENT']."',
`checked` =  '".$HTTP_POST_VARS['DOCHECKED']."',
`type` =  '".$HTTP_POST_VARS['DOTYPE']."',
`host` =  '".$HTTP_POST_VARS['DOHOST']."',
`important` =  '".$HTTP_POST_VARS['DOIMPORTANT']."',
`remind` =  '".$HTTP_POST_VARS['DOREMIND']."',
`changed` =  '".gmdate("Y-m-d H:i:s",cheltime(time()))."'
WHERE  `id` ='".$do."' LIMIT 1";
 if ($read==1) $result = mysql_query_my($sqlnews); 

}


function AddDo($client,$Type,$did)
{
global $HTTP_POST_VARS,$config,$fpk_user,$fpk_brand;

if ($did==1) $d=gmdate("Y-m-d H:i:s",cheltime(time()));
else $d="0000-00-00 00:00:00";

$ddd = gmdate("Y-m-d H:i:s",cheltime(time()));

	$sqlnews="
INSERT INTO  `1_do` (  `id` ,  `client` ,  `brand` ,  `manager` ,  `date1` ,  `date2` ,  `text` ,  `comment` ,  `checked` ,  `type` ,  `host` ,  `important` ,  `repeat` ,  `remind` ,  `created` ,  `changed` ,  `starred` ,  `hostcheck` ,  `shablon` ) 
VALUES (
'',  '".$client."',  '".$fpk_brand."',  '".$fpk_user."',  '".$ddd."',  '".$ddd."',  '".$Type."',  '',  '".$d."',  '".$Type."',  '".$fpk_user."',  '50',  '',  '0000-00-00 00:00:00',  '".$ddd."',  '0000-00-00 00:00:00',  '',  '0000-00-00 00:00:00',  '')
";

//	echo $sql;
//  $fp = fopen('its2.txt', "w");
//  @fwrite($fp, 'rrr='.$fpk_user);
//  fclose($fp);


//echo $sqlnews;
   if ($read==0) $result = mysql_query_my($sqlnews); 

   $sqlnews="SELECT max(id) maxid FROM `1_do`";

   $result = mysql_query_my($sqlnews); 

   $sql = mysql_fetch_object ($result);
   return($sql->maxid);
   

}

function AddClient($Manager)
{
global $HTTP_POST_VARS,$config,$fpk_user,$fpk_brand;

if(stristr($Manager,'<')) $Manager='Все';


	$sqlnews="


INSERT INTO  `1_clients` (  `id` ,  `fio` ,  `comment` ,  `phone1` ,  `phone2` ,  `phone3` ,  `phone4` ,  `date` ,  `adress` ,  `birthday` ,  `brand` ,  `manager` ) 
VALUES (
'',  '',  '',  '',  '',  '',  '',  '".gmdate("Y-m-d",cheltime(time()))."',  '',  '1978-00-00',  '".$fpk_brand."',  '".$Manager."'
);

		";
   $result = mysql_query_my($sqlnews); 

   $sqlnews="SELECT max(id) maxid FROM `1_clients`";

   $result = mysql_query_my($sqlnews); 

   $sql = mysql_fetch_object ($result);
   return($sql->maxid);

}


function DeleteClient($id)
{
global $HTTP_POST_VARS,  $config;

    $sqlnews="DELETE FROM 1_do WHERE client=".$id." LIMIT 100";
    $result = mysql_query_my($sqlnews); 
    $sqlnews="DELETE FROM 1_clients WHERE id=".$id." LIMIT 1";
    $result = mysql_query_my($sqlnews); 

}

function DeleteDo($id)
{
global $HTTP_POST_VARS,  $config;

    $sqlnews="DELETE FROM 1_do WHERE id=".$id." LIMIT 1";
    $result = mysql_query_my($sqlnews); 

}

////Поля таблицы 1_clients
function mod_fio($sql) { return str_replace('"',"`",$sql->fio); }
function mod_typetime($sql) 
 {
 global $HTTP_GET_VARS;
  if ($sql->typetime=='') return '';
  else
     {
     $tm=''.date("H:i",strtotime($sql->typetime)).' - '; 
     
     $alldate=$HTTP_GET_VARS['ALLDate'];

     if (strlen($alldate)==7) $tm=''.date("d.m",strtotime($sql->typetime)).' - '; 
//     $™ = strlen($alldate);
     return $tm; 
     }
 }
function mod_fioshort($sql) 
   { 
   $name=str_replace('"',"`",$sql->fio);

    $explodeName = explode(" ", $name);
    $lng=0;$txt='';
    for ($i=0; $i<count($explodeName); $i++) {
	    $lng += strlen($explodeName[$i]);
	    if($lng<74) $txt.=$explodeName[$i].' ';
	    else { $txt.='…'; break; }
	   }

   
   return $txt; 
   
   }
function mod_fioshort2($sql) 
   { 
   $name=str_replace('"',"`",$sql->fio);

    $explodeName = explode(" ", $name);
	$name = $explodeName[0];
	$name .= ' '.mb_substr($explodeName[1], 0, 1,'utf-8').'.';
   
   return $name; 
   
   }

function mod_commercial($sql) 
{
return $sql->commercial;
}

function mod_status($sql) 
{
return $sql->status;
}

function mod_cost($sql) 
{
return $sql->cost;
}

function mod_files($sql)
{
if ($sql->files==0) return '';
else return $sql->files;
}
function mod_filesopacity($sql)
{
if ($sql->files==0) return 0;
else return 1;
}

function mod_rcost($sql) 
{
$cost = (integer)($sql->cost/1000);

if ($cost==0) 
  {
   $sqlnews="SELECT cost FROM `1_models` WHERE id=".$sql->model;
   $result = mysql_query_my($sqlnews); 
   @$sql2 = mysql_fetch_object ($result);
   $cost = '~'.(integer)($sql2->cost)/1000;
   if ($sql2->cost<300000) $cost='~444';
  }

return $cost.' т.р.';
}

function mod_rrcost($sql) 
{
$cost = (integer)($sql->cost/1000);

if ($cost==0) 
  {
   $sqlnews="SELECT cost FROM `1_models` WHERE id=".$sql->model;
   $result = mysql_query_my($sqlnews); 
   @$sql2 = mysql_fetch_object ($result);
   $cost = (integer)($sql2->cost)/1000;
   if ($sql2->cost<300000) $cost=444;
  }

return $cost;
}


function mod_vin($sql) 
{
return $sql->vin;
}

function mod_model($sql) 
{
   $sqlnews="SELECT model FROM `1_models` WHERE id=".$sql->model;
   $result = mysql_query_my($sqlnews); 
   @$sql2 = mysql_fetch_object ($result);

return $sql2->model;
}

function mod_modelfio($sql) 
{
   $sqlnews="SELECT short FROM `1_models` WHERE id=".$sql->fio;
   $result = mysql_query_my($sqlnews); 
   @$sql2 = mysql_fetch_object ($result);

return $sql2->short;
}


function mod_modelid($sql) 
{
   $sqlnews="SELECT id FROM `1_models` WHERE id=".$sql->model;
   $result = mysql_query_my($sqlnews); 
   @$sql2 = mysql_fetch_object ($result);

return $sql2->id;
}

function mod_modelshort($sql) 
{
   $sqlnews="SELECT short FROM `1_models` WHERE id=".$sql->model;
   $result = mysql_query_my($sqlnews); 
   @$sql2 = mysql_fetch_object ($result);

if ($sql2->short=='') return mod_model2($sql).'?';
return $sql2->short;
}

function mod_statusshort($sql) 
{
if ($sql->status[0]=='5') return '..';
if ($sql->status[0]=='?') return ' ?';

if ($sql->status[0]=='+') return ' +';
else
  {
   return '';
  }
}

function mod_statuscolor($sql) 
{
if ($sql->status[0]=='+') return '#516F8F';
else
  {
   if ($sql->status[0]=='1') { $cl1=0.2; $cl2=0.24; }
   if ($sql->status[0]=='2') { $cl1=0.5; $cl2=0.54; }
   if ($sql->status[0]=='3') { $cl1=0.8; $cl2=0.84; }
   if ($sql->status[0]=='4') { $cl1=0.9; $cl2=0.94; }
   if ($sql->status[0]=='5') { $cl1=0.95; $cl2=0.96; }
   if ($sql->status[0]=='?') { $cl1=1; $cl2=1; }
   if ($sql->status=='') { $cl1=1; $cl2=1; }
   return "-webkit-gradient(linear, right top, left top, color-stop($cl1, #2b365a), color-stop($cl2, #516F8F));";
   //return '#516F8F';
  }
}

function mod_model2($sql) 
{
   $name=str_replace('"',"`",$sql->comment);
   $name = explode(" ", $name);
   $name = $name[0];

   return mb_substr($name, 0, 8,'utf-8');; 
}

 
function mod_id($sql) { return $sql->id; }
function mod_phone1($sql) { return str_replace('"',"`",$sql->phone1); }
function mod_phone2($sql) { return str_replace('"',"`",$sql->phone2); }
function mod_phone3($sql) { return str_replace('"',"`",$sql->phone3); }
function mod_phone4($sql) { return str_replace('"',"`",$sql->phone4); }

function mod_phone11($sql) { return str_replace('"',"`",$sql->phone11); }
function mod_phone22($sql) { return str_replace('"',"`",$sql->phone22); }
function mod_phone33($sql) { return str_replace('"',"`",$sql->phone33); }
function mod_phone44($sql) { return str_replace('"',"`",$sql->phone44); }

function mod_email($sql) { return str_replace('"',"`",$sql->email); }

function mod_pas1($sql) { return str_replace('"',"`",$sql->pas1); }
function mod_pas2($sql) { return str_replace('"',"`",$sql->pas2); }
function mod_pas3($sql) { return str_replace('"',"`",$sql->pas3); }
function mod_pas4($sql) { return d(str_replace('"',"`",$sql->pas4)); }

function mod_carpets($sql) { if($sql->carpets==1) return 'checked'; }
function mod_mudguard($sql) { if($sql->mudguard==1) return 'checked'; }
function mod_tech_1($sql) { if($sql->tech_1==1) return 'checked'; }
function mod_tech_2($sql) { if($sql->tech_2==1) return 'checked'; }
function mod_tires($sql) { if($sql->tires==1) return 'checked'; }
function mod_client_adress($sql) { return $sql->client_adress; }


function d($mydate)
{
$answer = explode('-',$mydate);
return $answer[2].'-'.$answer[1].'-'.$answer[0];
}


function mod_clientbirthday($sql) { return d(str_replace('"',"`",$sql->clientbirthday)); }

function mod_prepay($sql) { return str_replace('"',"`",$sql->prepay); }

function mod_date_contract($sql) { return d(str_replace('"',"`",$sql->date_contract)); }

function mod_adress($sql) { return mb_substr(str_replace('"',"`",$sql->adress),0,55,'utf-8'); }
function mod_manager($sql) { return $sql->manager; }


function mod_groupby($sql) 
  {
  global $groupby;
  
  if ($groupby=='status') $name=";"; 
  if ($groupby=='icon') $name=" - желание"; 
  if ($groupby=='icon2') $name=" - Вероятность выдачи в этом месяце"; 
  if ($groupby=='manager') $name=""; 
  
if ($groupby!='')  $group = $sql->$groupby;

  return $group.' '.$name.''; 
  }
function mod_creditmanager($sql) { return $sql->creditmanager; }
function mod_showmanager($sql) { 

$explodeName = explode(" ", $sql->manager);

return '['.$explodeName[0].']'; 
}
function mod_icon($sql) { return $sql->icon; }
function mod_icon2($sql) { return $sql->icon2; }

function mod_d1($sql)
{
if ($sql->dg=='0000-00-00 00:00:00') return '';
return showdatedif($sql->dg);
}

function mod_d2($sql)
{
if ($sql->zv=='0000-00-00 00:00:00') $dat=$sql->vz;
else $dat = $sql->zv;
if ($dat=='0000-00-00 00:00:00') return '';
return showdatedif($dat);
}

function showdatedif($mydate) 
{
   $long="";

$dd=(int)( ((gmstrtotime($mydate))-cheltime(gmmktime()) )/60/60*10)/10; 



if (($dd>24) or ($dd<-24)) 
   { 
    $dd=(int)($dd/24); 
    $long="long";
    if ($dd>=0) $days="+ ".$dd." дн";
       else
    $days=$dd." дн";
   }

else
   { 
    if ($dd>=0) $days="+ ".$dd." ч";
       else
    $days=$dd." ч";
   }



return $days;
}



function mod_nextdo($sql) 
 {
   $sqlnews="SELECT date2, checked FROM `1_do` WHERE client=".$sql->id." and checked='0000-00-00 00:00:00' ORDER by date2 LIMIT 1;";
   $result = mysql_query_my($sqlnews); 
   $sql1 = mysql_fetch_object ($result);
   
   $dat = showdatejson($sql1->date2,$sql1);
   
   if(!$sql1->date2) 
     {
     
     if((($sql->out)!="0000-00-00 00:00:00") AND ($sql->dg)!="0000-00-00 00:00:00") return '{"classdo":"shortdatedid2","date":"OUT","days":"Расторг"}';

     if(($sql->out)!="0000-00-00 00:00:00") return '{"classdo":"shortdatedid","date":"OUT","days":"OUT"}';
     return '{"classdo":"shortdatedid","date":"Нет следующего действия","days":""}';   
     }

   
   return '{"classdo":"'.$dat[0].'","date":"'.$dat[1].'","days":"'.$dat[2].'"}';   
    
 }
function mod_birthday($sql) { return $sql->birthday; }
function mod_comment($sql) { return stripcslashes(str_replace('"',"`",$sql->comment)); }

function mod_alldo($sql) { 
global $fpk_brand;
//Задаем даныне для отображения дел
$Date = "%"; // Даты для фильтра или %-отобразить все Даты "2010-10-04 -> 2010-10-09,2010-10-12 -> 2010-10-14,2010-10-19,2010-10-21 -> 2010-10-22,2010-10-28"
$Manager = "%"; // Имя менеджера "JohnWecel"
$Clientid = $sql->id; // Номер клиента "23"
$Did = 0; // 1-скрывать ли выполненные дела (0=все, 1=скрывать выполненные, 2=только выполненные)
$Template = "fpk-do-acordion.php"; // Шаблон
$What = "Show"; // Что делать - Show, Edit, Add, Delete
$Host = "%"; // Кто поручил дело
$Search = "%"; // Что ищем "%Курган%
$SearchField = array ("1_clients.fio","1_clients.phone1","1_clients.phone2","1_clients.phone3","1_clients.phone4","1_do.comment","1_do.text","1_clients.comment","1_clients.adress","1_clients.birthday");  
$Brand = $fpk_brand; // Какой бренд
$Type = "%"; // Тип действия
$Hide = 1; // 1=показывать скрытые дела
$Order = "Order by DATE2 DESC"; //Сортировка

return ShowMeDo(
$Date,
$Manager,
$sql->id,
$Did,
$Template,
$What,
$Host,
$Search,
$SearchField,
$Brand,
$Type,
$Hide,
$Order
); 
}



////Поля таблицы 1_do

function mod_text($sql) { return str_replace('"',"`",$sql->text); }

function mod_slave($sql) { return $sql->slave; }

function mod_showslave($sql) 
  { 
  $name = explode(' ',$sql->slave);
  
  if ($sql->manager == $sql->slave) return '';
  else
    return '[Исполнитель: '.$name[0].']'; 
  }


function mod_host($sql) 
   { 
   $explodeName = explode(" ", $sql->host);
   $host=$explodeName[0];

   if( $sql->host == $sql->manager ) $host='';
   
   if ($host=='') return '';
   else
     return str_replace('"',"`",' [Поручил: '.$host.']'); 
   }

//Права доступа для редактирования клиента
function mod_readonly($sql) 
  {
  global $fpk_user, $fpk_job;
  
  $job = (stristr($fpk_job,'иректор')) || (stristr($fpk_job,'уковод') )  || (stristr($fpk_job,'тарш') )  || (stristr($fpk_job,'редитн') || (stristr($fpk_job,'Администратор')));
  //$job = false;
  //Если дело добавил админстратор, то не разрешать менеджерам удалять клиента
  if ((!$job) && ($sql->tmp=='Администратор')) return 'readonly';
  
  if (($fpk_user == $sql->manager) || ($sql->manager=='Все') || $job ) return '';
  else return 'readonly'; 
  }

function mod_doreadonly($sql) 
  {
  global $fpk_user, $fpk_job;
  
if (($sql->type=='Тест-драйв') and ($fpk_job=="Администратор")) return '';
if (($sql->type=='Кредит') and ($fpk_job=="Кредитный эксперт")) return '';
if (($sql->type=='Выдача')) return '';
if (($sql->type=='Подготовка') and ($fpk_job=="Логист")) return '';
  
if ($sql->checked != '0000-00-00 00:00:00')  
  if ( (time() - strtotime($sql->checked))/(60*60*24) > 3 ) $timeover = true;
  else $timeover = false; 
  
  $job = (stristr($fpk_job,'иректор')) || (stristr($fpk_job,'уковод')) || (stristr($fpk_job,'тарш'));
  //$job = false;
   
  if ( ((($sql->host == $fpk_user) || ($sql->slave == $fpk_user)) && !$timeover) || $job ) return '';
  else return 'readonly'; 
  }

function mod_textshort($sql) 
 { 
 return mb_substr(str_replace('"',"`",$sql->text), 0, 50,'utf-8'); 
 }
function mod_type($sql) { return $sql->type; }
function mod_docomment($sql) { return str_replace('"',"`",$sql->docomment); }
function mod_clientid($sql) { return $sql->client; }
function mod_doid($sql) { return $sql->doid; }
function mod_dodate($sql) { return $sql->date1; }
function mod_dodate2($sql) { return $sql->date2; }
function mod_dochecked($sql) { return $sql->checked; }
function mod_important($sql) { return $sql->important; }
function mod_doremind($sql) { return $sql->remind; }
function mod_docreated($sql) { return $sql->created; }
function mod_dochanged($sql) { return $sql->changed; }
function mod_hostcheck($sql) { return $sql->hostcheck; }

/*function mod_doclient($sql) 
   { 
    global $config,$client;

   $sqlnews="select * from `1_clients` WHERE id='".$sql->client."'";
   $result = mysql_query_my($sqlnews); 
   @$sql1 = mysql_fetch_object ($result);

   if (@$client=='') return '<a href="./index.php?r=client_edit&client='.$sql1->id.'" title="'.$sql1->phone1.'">'.$sql1->fio.'</a>'; 

   }
*/
function mod_doclientshort($sql) 
   { 
    global $config,$client;

   $sqlnews="select fio from `1_clients` WHERE id='".$sql->client."'";
   $result = mysql_query_my($sqlnews); 
   @$sql1 = mysql_fetch_object ($result);

   $name=$sql1->fio;

    $explodeName = explode(" ", $sql1->fio);
    for ($i=0; $i<count($explodeName); $i++) {
	    if ($i==0) $name = $explodeName[$i];
        if ($i==1) $name.= ' '.$explodeName[$i];
	   }

   
   return $name; 

   }


function mod_doclientmini($cl) 
   { 
    global $config,$client;

   $sqlnews="select fio from `1_clients` WHERE id='".$cl."'";
   $result = mysql_query_my($sqlnews); 
   @$sql1 = mysql_fetch_object ($result);

   return $sql1->fio; 
   }



function mod_doeditclient($sql) 
   { 
    global $config;

   $sqlnews="select id,phone1,fio from `1_clients` WHERE id='".$sql->client."'";
   $result = mysql_query_my($sqlnews); 
   @$sql1 = mysql_fetch_object ($result);

   return '<a href="./index.php?r=client_edit&client='.$sql1->id.'" title="'.$sql1->phone1.'">'.$sql1->fio.'</a>'; 

   }

function mod_date2json($sql) 
   { 
   
   //return array ($class.$long, $mydate, $days);
   $dat = showdatejson($sql->date2,$sql);
   
    return $dat[2];   
	}

function mod_date1json($sql) 
   { 
   
   //return array ($class.$long, $mydate, $days);
   $dat = showdatejson($sql->date2,$sql);
   
    return '{"classdo":"'.$dat[0].'","date":"'.$dat[1].'","days":"'.$dat[2].'"}';   
	}

function mod_date1($sql) 
   { 
    return showdate($sql->date2,$sql); 
	}
	
function mod_checkcolor($sql) 
   { 
   if ($sql->checked=="0000-00-00 00:00:00") return "black";
    else return "8b8b8b";
   }
   
function mod_inputdonejson($sql) 
   { 
   if ($sql->checked=="0000-00-00 00:00:00") 
       return '{"idd":"'.$sql->doid.'","name":"Выполнить"}';
	   
    else return  '{"idd":"'.$sql->doid.'","name":"Снять выполнение"}';
   }
  
function mod_inputdone($sql) 
   { 
   if ($sql->checked=="0000-00-00 00:00:00") return '<input idd="'.$sql->doid.'" name="Done" type="submit" value="Выполнить">';
    else return '<input idd="'.$sql->doid.'" name="notDone" type="submit" value="Снять выполнение">';
   }
  
   
function mod_checkstrike($sql) 
   { 
   if ($sql->checked<>"0000-00-00 00:00:00") return "text-decoration:line-through";
    else return "";
   }


function mod_check($sql) 
  { 
  if ($sql->checked<>"0000-00-00 00:00:00") $did="checked";
   else $did="";
  return '<input name="checkbox" type="checkbox" value="checkbox" '.$did.'>'; 
  }

//Показ даты в списке дел в скобочках сколько дней или часов осталось до дела
function showdate($mydate, $sql) 
{
   $long="";

$dd=(int)( ((gmstrtotime($mydate))-cheltime(gmmktime()) )/60/60*10)/10; 

   if ($dd>0) $class='shortdate';
   else $class='shortdatepast';


if (($dd>24) or ($dd<-24)) 
   { 
    $dd=(int)($dd/24); 
    $long="long";
    if ($dd>=0) $days="+ ".$dd." дн";
       else
    $days=$dd." дн";
   }

else
   { 
    if ($dd>=0) $days="+ ".$dd." ч";
       else
    $days=$dd." ч";
   }

  if ($sql->checked <> '0000-00-00 00:00:00' ) { $class='shortdatedid'; $long=''; }


return '<span class="'.$class.$long.'" title="'.$mydate.'">'.$days.'</span>';
}

function gmstrtotime($time, $now = null){
    static $utc_offset = null;
    if ($utc_offset === null){
        $utc_offset = date_offset_get(new DateTime);
    }
    if ($now === null){
        $loctime = strtotime($time);
    } else {
        $loctime = strtotime($time, $now);
    }
    return $loctime + $utc_offset;
}


function showdatejson($mydate, $sql) 
{
   $long="";

$dd=(int)( ((gmstrtotime($mydate))-cheltime(gmmktime()) )/60/60*10)/10; 

   if ($dd>0) $class='shortdate';
   else $class='shortdatepast';


if (($dd>24) or ($dd<-24)) 
   { 
    $dd=(int)($dd/24); 
    $long="long";
    if ($dd>=0) $days="+ ".$dd." дн";
       else
    $days=$dd." дн";
   }

else
   { 
    if ($dd>=0) $days="+ ".$dd." ч";
       else
    $days=$dd." ч";
   }
   

  if ($sql->checked <> '0000-00-00 00:00:00' ) { $class='shortdatedid'; $long=''; }


return array ($class.$long, $mydate, $days);
}



function mod_edit_client($sql) { return $sql->id; }

////Автонумератор
function mod_nn($sql) { global $i1; return ++$i1; }
function mod_nn2($sql) { global $i2; return ++$i2; }




//////////////////////////////////////////////////////////////////////////////

function ShowClientList($sqlnews)
{
global $fpk_user, $fpk_brand;
$sqlnews="SELECT * from 1_clients WHERE ".$in." brand='".$fpk_brand."' AND manager='".$fpk_user."' ORDER BY id DESC";
$news=displayNewsAll("fpk-clients-empty.php",$sqlnews);
return $news;
}


function ShowDo($fpk_user2,$client,$query,$date)
{
global $client,$fpk_brand;
if ($client==0) { $client='%'; $in1=' AND date2 LIKE "'.$date.'%"';}
if ($client==0) { $client='%'; $in=' AND checked="0000-00-00 00:00:00"';}
else $in="";

if ($query<>"") $in=" AND text LIKE '%".$query."%' ";


//////Выводим весь список клиентов данного менеджера
$sqlnews="SELECT * from 1_do WHERE brand='".$fpk_brand."'".$in.$in1." AND manager LIKE '".$fpk_user2."' AND client LIKE '".$client."' ORDER BY date2";
//echo $sqlnews."<hr>";
$news=displayNewsAll("fpk-do.php",$sqlnews);
return $news;
}

//////Выводим падающий список всех менеджеров, вверху тот кто хозяин данного дела $do
function mod_ShowUserlist($job)
{
   global $config,$r,$fpk_user,$do,$fpk_brand;
   $sqlnews="SELECT fio FROM 1_users WHERE brand='".$fpk_brand."' AND ".$job." ORDER by fio DESC";
   $result = mysql_query_my($sqlnews); 
   $TXT='';
   while (@$sql = mysql_fetch_object ($result))
     {
      $TXT.='<li><a href="#nogo4">'.$sql->fio.'</a></li>';
     } 
   return $TXT;
}

//////Выводим падающий список всех менеджеров, вверху тот кто хозяин данного дела $do
function mod_ShowUserlist2($job)
{
   global $config,$r,$fpk_user,$do,$fpk_brand;
   $sqlnews="SELECT fio FROM 1_users WHERE brand='".$fpk_brand."' AND ".$job." ORDER by fio DESC";
   $result = mysql_query_my($sqlnews); 
   $TXT='';
   while (@$sql = mysql_fetch_object ($result))
     {
      $TXT.='<option>'.$sql->fio.'</option>';
     } 
   return $TXT;
}


function mod_ShowTypeNewslist($job)
{
   global $config,$r,$fpk_user,$do,$fpk_brand, $fpk_job, $fpk_brandname;

   $sqlnews="SELECT *, (SELECT count(*) FROM 1_news WHERE 1_news_type.type = 1_news.tag AND 1_news.towho LIKE '%|brand=$fpk_brand|%' ) cnt FROM 1_news_type ORDER by orderid";

   $result = mysql_query_my($sqlnews); 
   $TXT='';
   while (@$sql = mysql_fetch_object ($result))
     {
     if (($sql->cnt)>0)
      $cnt = ' ('.$sql->cnt.' новостей)';
     else
      $cnt = '';
      
      $TXT.='<option value="'.$sql->type.'">'.$sql->type.$cnt.'</option>';
     } 
   return $TXT;
}



function mod_ShowBrandlist($job)
{
   global $config,$r,$fpk_user,$do,$fpk_brand, $fpk_job, $fpk_brandname;

if (stristr($fpk_job,'Генерал')) $sqlnews="SELECT * FROM 1_brands ORDER by brandname DESC, title DESC";
   else $sqlnews="SELECT * FROM 1_brands WHERE name='$fpk_brandname' ORDER by brandname DESC, title DESC";

   $result = mysql_query_my($sqlnews); 
//   echo $sqlnews;
   $TXT='';
   while (@$sql = mysql_fetch_object ($result))
     {
      $TXT.='<li><a href="#nogo4" id2="'.$sql->id.'" brandname="'.$sql->title.'"><img height="14px" src=".\img\\'.$sql->logo.'">&nbsp;&nbsp;&nbsp;'.$sql->title.'</a></li>';
     } 
   return $TXT;
}

function mod_ShowBrandOption($job)
{
   global $config,$r,$fpk_user,$do,$fpk_brand;
   $sqlnews="SELECT id,brandname,title FROM 1_brands ORDER by brandname, name";
   $result = mysql_query_my($sqlnews); 
   $TXT='';
   while (@$sql = mysql_fetch_object ($result))
     {
      $TXT.='<option value='.$sql->id.'>'.$sql->brandname.' - '.$sql->title.'</option>';
     } 
   return $TXT;
}


function mod_ShowModelslist()
{
   global $config,$r,$fpk_user,$do,$fpk_brand;

   $sqlnews="SELECT id,model FROM 1_models WHERE brand='".$fpk_brand."' AND 1_models.show=1 ORDER by model";
   $result = mysql_query_my($sqlnews); 
   $TXT='';
   $i=0;
   while (@$sql = mysql_fetch_object ($result))
     {
      $TXT.='<option modelid="'.$sql->id.'">'.$i.' - '.$sql->model.'</option>';
      $i++;
     } 
   return $TXT;
}


function mod_ShowCreditUserlist()
{
   global $config,$r,$fpk_user,$do,$fpk_brand;
   $sqlnews="SELECT fio FROM 1_users WHERE brand='".$fpk_brand."' AND job='Кредитный эксперт'";
   $result = mysql_query_my($sqlnews); 
   $TXT='';
   while (@$sql = mysql_fetch_object ($result))
     {
      $TXT.='<option>Кредит - '.$sql->fio.'</option>';
     } 
   return $TXT;
}

//////Выводим падающий список всех менеджеров, вверху тот кто Поручил данное дело $do
function mod_ShowUserlisthost()
{
   global $config,$r,$fpk_user,$do;
   $sqlnews1="SELECT * FROM 1_do WHERE id='".$do."'";
   $result1 = mysql_query_my($sqlnews1); 
   @$sql1 = mysql_fetch_object ($result1);
   $sqlnews="SELECT * FROM wakka_users";
   $result = mysql_query_my($sqlnews); 
   $TXT='<option>'.$sql1->host.'</option>';
   while (@$sql = mysql_fetch_object ($result))
     {
      if ($sql->name<>$sql1->host) $TXT.='<option>'.$sql->name.'</option>';
     } 
   return $TXT;
}

function mod_icontypejson($sql)
{
   if ($sql->checked == '0000-00-00 00:00:00') $opacity=0.2;
   else $opacity=1;

   $sqlnews2="SELECT typepng FROM 1_dotype WHERE 1_dotype.type='".$sql->type."'";
   $result2 = mysql_query_my($sqlnews2); 
   @$sql2 = mysql_fetch_object ($result2);

   return '{"typepng":"'.$sql2->typepng.'","opacity":"'.$opacity.'"}';   



}



function mod_icontype($sql)
{
   if ($sql->checked == '0000-00-00 00:00:00') $opacity=0.2;
   else $opacity=1;

   $sqlnews2="SELECT typepng FROM 1_dotype WHERE 1_dotype.type='".$sql->type."'";
   $result2 = mysql_query_my($sqlnews2); 
   @$sql2 = mysql_fetch_object ($result2);

   return '<img src="img/'.$sql2->typepng.'.png" width="20px" height="20px" hspace="5" align="absmiddle" style="opacity:'.$opacity.'">';
}

function mod_icontypemini($sql)
{
   if ($sql->checked == '0000-00-00 00:00:00') $opacity=0.2;
   else $opacity=1;

   $sqlnews2="SELECT typepng FROM 1_dotype WHERE 1_dotype.type='".$sql->type."'";
   $result2 = mysql_query_my($sqlnews2); 
   @$sql2 = mysql_fetch_object ($result2);

   return $sql2->typepng;
}


function mod_typeid($sql3)
{
   return $sql3->type;
}

function mod_icons($sql3)
{

//[{"name":"666", "type":"888", "opacity":"888"},{"name":"777", "type":"888", "opacity":"999"}]
   $sqlnews="SELECT * FROM 1_dotype ORDER by typeorder DESC";
   $result = mysql_query_my($sqlnews); 
   $TXT='';
   $opacity1=$opacity2=$opacity3=$opacity4=$opacity5=$opacity6=0.1;
  
   if ($sql3->zv!='0000-00-00 00:00:00') { $z1=$sql3->zv; $opacity1=0.5; }
   if ($sql3->vz!='0000-00-00 00:00:00') { $z2=$sql3->vz; $opacity2=0.5; }
   if ($sql3->tst!='0000-00-00 00:00:00') { $z3=$sql3->tst; $opacity3=0.5; }
   if ($sql3->dg!='0000-00-00 00:00:00') { $z4=$sql3->dg; $opacity4=0.5; }
   if ($sql3->vd!='0000-00-00 00:00:00') { $z5=$sql3->vd; $opacity5=0.5; }
   if ($sql3->out!='0000-00-00 00:00:00') { $z6=$sql3->out; $opacity6=0.5; }

   $TXT.='{"name":"OUT","date":"'.$z6.'", "type":"OUT", "opacity":"'.$opacity6.'"},'; 
   $TXT.='{"name":"Выдача","date":"'.$z5.'", "type":"1vidacha", "opacity":"'.$opacity5.'"},'; 
   $TXT.='{"name":"Подготовка","date":"'.$z5.'", "type":"settings", "opacity":"'.$opacity5.'"},'; 
   $TXT.='{"name":"Договор","date":"'.$z4.'", "type":"1dogovor", "opacity":"'.$opacity4.'"},'; 
   $TXT.='{"name":"Кредит","date":"'.$z4.'", "type":"1credit", "opacity":"0.1"},'; 
   $TXT.='{"name":"Тест-драйв","date":"'.$z3.'", "type":"1test-drive", "opacity":"'.$opacity3.'"},'; 
   $TXT.='{"name":"Визит","date":"'.$z2.'", "type":"1vizit", "opacity":"'.$opacity2.'"},'; 
   $TXT.='{"name":"Звонок","date":"'.$z1.'", "type":"1zvonok", "opacity":"'.$opacity1.'"},'; 

/*   while (@$sql = mysql_fetch_object ($result))
     {
   $sqlnews="SELECT count(*) cnt FROM 1_do WHERE type='".$sql->type."' AND checked<>'0000-00-00 00:00:00' AND client=".$sql3->id;
   $result2 = mysql_query_my($sqlnews); 
   @$sql4 = mysql_fetch_object ($result2);
	if ($sql4->cnt > 0) $opacity=0.5;
	else $opacity='0.1';
      if ($sql->type<>$sql1->type) 
	       {
  	       $sqlnews2="SELECT typepng FROM 1_dotype WHERE 1_dotype.type='".$sql->type."'";
           $result2 = mysql_query_my($sqlnews2); 
           @$sql2 = mysql_fetch_object ($result2);

	       $TXT.='{"name":"'.$sql->type.'", "type":"'.$sql2->typepng.'", "opacity":"'.$opacity.'"},'; 
		   }	
     } 
	 
	//return '[{"name":"666", "type":"OUT", "opacity":"1"},{"name":"666", "type":"OUT", "opacity":"1"}]'; 
*/   $TXT = str_replace('},]','}]','['.$TXT.']');
 
   return $TXT;

}


function mod_alldojson($sql) { 
global $fpk_brand;
//Задаем даныне для отображения дел
$Date = "%"; // Даты для фильтра или %-отобразить все Даты "2010-10-04 -> 2010-10-09,2010-10-12 -> 2010-10-14,2010-10-19,2010-10-21 -> 2010-10-22,2010-10-28"
$Manager = "%"; // Имя менеджера "JohnWecel"
$Clientid = $sql->id; // Номер клиента "23"
$Did = 0; // 1-скрывать ли выполненные дела (0=все, 1=скрывать выполненные, 2=только выполненные)
$Template = "fpk-do-acordion-json.php"; // Шаблон
$What = "Show"; // Что делать - Show, Edit, Add, Delete
$Host = "%"; // Кто поручил дело
$Search = "%"; // Что ищем "%Курган%
$SearchField = array ("1_clients.fio","1_clients.phone1","1_clients.phone2","1_clients.phone3","1_clients.phone4","1_do.comment","1_do.text","1_clients.comment","1_clients.adress","1_clients.birthday");  
$Brand = $fpk_brand; // Какой бренд
$Type = "%"; // Тип действия
$Hide = 1; // 1=показывать скрытые дела
$Order = "Order by DATE2 DESC"; //Сортировка

$news = ShowMeDo(
$Date,
$Manager,
$sql->id,
$Did,
$Template,
$What,
$Host,
$Search,
$SearchField,
$Brand,
$Type,
$Hide,
$Order
); 

static $jsonReplaces = array(
array("\\", "/", "\n", "\t", "\r", "\b", "\f", "'"),
array('\\\\', '\\/', '\\n', '\\t', '\\r', '\\b', '\\f', "\'")
);
//$news = str_replace($jsonReplaces[0], $jsonReplaces[1], $news);

   $news = str_replace('},]','}]','['.$news.']');
return $news;

}




function mod_iconsclient($sql3)
{
   $sqlnews="SELECT * FROM 1_dotype ORDER by typeorder DESC";
   $result = mysql_query_my($sqlnews); 
   $TXT='';
   while (@$sql = mysql_fetch_object ($result))
     {
   $sqlnews="SELECT count(*) cnt FROM 1_do WHERE type='".$sql->type."' AND checked<>'0000-00-00 00:00:00' AND client=".$sql3->id;
   $result2 = mysql_query_my($sqlnews); 
   @$sql4 = mysql_fetch_object ($result2);
	if ($sql4->cnt > 0) $opacity=0.5;
	else $opacity='0.1';
      if ($sql->type<>$sql1->type) 
	       {
  	       $sqlnews2="SELECT typepng FROM 1_dotype WHERE 1_dotype.type='".$sql->type."'";
           $result2 = mysql_query_my($sqlnews2); 
           @$sql2 = mysql_fetch_object ($result2);

	        $TXT.='<img class="dotype" height=20px width=20px title="'.$sql->type.'" src="./img/'.$sql2->typepng.'.png" hspace="10" vspace="0" align="right" style="opacity:'.$opacity.'">';
		   }	
     } 
   return $TXT;

}

function mod_ShowDoTypeList()
{
   global $config,$r,$fpk_user,$do;
   
   $sqlnews="SELECT type FROM 1_dotype ORDER by typeorder";
   $result = mysql_query_my($sqlnews); 
   $TXT='';
   while (@$sql = mysql_fetch_object ($result))
     {
      $TXT.='<option>'.$sql->type.'</option>';
     } 
   return $TXT;
}

function showdodate()
{
   global $config,$r,$fpk_user,$do,$fpk_brand;
   $sqlnews="SELECT date2,text,client FROM 1_do WHERE checked='0000-00-00 00:00:00' AND brand='$fpk_brand' AND manager='$fpk_user' ORDER BY date2";
   $result = mysql_query_my($sqlnews);
   $TXT='';
   $dat='';
   $t1='';
   while (@$sql = mysql_fetch_object ($result))
     {
      if ($dat<>date("Ymd",(strtotime($sql->date2))) )
          {
           $TXT.=$t1.date("Ymd",(strtotime($sql->date2))).': {klass: "highlight", tooltip: "<font color=#999999>'.date("H:i",cheltime(strtotime($sql->date2))).'</font> '.$sql->text.' ('.mod_doclientmini($sql->client).') ';
           $dat=date("Ymd",(strtotime($sql->date2)));
           $t1='"}, ';
          }
       else 
          {
           $TXT.=' <hr><font color=#999999>'.date("H:i",(strtotime($sql->date2))).'</font> '.$sql->text.' ('.mod_doclientmini($sql->client).') ';
          }
     } 
   $TXT .= '" } ';

 //echo $TXT;
//$txt='
//              20101007: { klass: "highlight", tooltip: "16:00 Купить все для суши (Курган В.Н)" },
//              20101008: { klass: "highlight2", tooltip: "18:30 Задать вопрос по кредиту (Завьялов П.)<hr>19:30 Выдача 308 (Михайлов А.)" },
//              20101010: { klass: "highlight", tooltip: "12:30 Позвонить по поводу денег (Петров Алексей)<hr>16:30 Тестдрайв (Курган В.Н.)" }
//     ';
return $TXT;
}

//Конвертируем набор дат в SQL фильтр из такого формата: "2010-10-04 -> 2010-10-09,2010-10-12 -> 2010-10-14,2010-10-19,2010-10-21 -> 2010-10-22,2010-10-28"
function DateToSQL($Date)
{

    $Date= str_replace(" -&gt; "," -> ",$Date);
    $explodeDate = explode(",", $Date);
    $datesql = "FALSE "; 
    for ($i=0; $i<count($explodeDate); $i++) {
	if (strlen($explodeDate[$i])>12) 
       {
	   $explodeDate2 = explode(' -> ',$explodeDate[$i]);
	   $datesql .= "OR date2 BETWEEN '$explodeDate2[0]' AND '$explodeDate2[1]' ";
	   }
	else $datesql .= "OR date2 LIKE '$explodeDate[$i]%' ";
	}
	return $datesql;
}

function SearchFieldSQL($SearchField,$Search)
{
    //По каким полям искать
    $searchsql = "AND ( FALSE ";
    for ($i=0; $i<count($SearchField); $i++) 
	   {
	   $searchsql .= " OR ".$SearchField[$i]." LIKE '$Search'";
	   }
    $searchsql .= " ) ";
	
	
	return $searchsql;
}


//Одна из главных функций отображения дела по многочисленным фильтрам
function ShowMeDo (
	$Date = "%", // Даты для фильтра
	$Manager = "%", // Имя менеджера
	$Clientid = "%", // Номер клиента
	$Did = 0, // 1-скрывать ли выполненные дела (0=все дела, 1=скрывать выполненные, 2=только выполненные, 3=просрочены)
	$Template = "fpk-do.php", // Шаблон
	$What = "Show", // Что делать - Show, Edit, Add, Delete
	$Host = "%", // Кто поручил дело
	$Search = "%", // Что ищем
    $SearchField = array ("1_clients.fio","1_clients.phone1","1_clients.phone2","1_clients.phone3","1_clients.phone4","1_do.comment","1_do.text","1_clients.comment","1_clients.adress","1_clients.birthday"), //По каким полям искать  
	$Brand = "Peugeot", // Какой бренд
	$Type = "Звонок", // Тип действия
	$Hide = 1, // 1=показывать скрытые дела
	$Order = "Order by DATE2" //Сортировка
	)
	{
	global $fpk_brand;
	
if(isset($GLOBALS['_GET']['do']))
    {
    $doid=$GLOBALS['_GET']['do'];
	$doid="AND 1_do.id=$doid";
	}
	else $doid='';
if ($What == 'Show') //Если нужно ОТОБРАЗИТЬ дела
 {
    $datesql = DateToSQL($Date); //Конвертируем набор дат в SQL фильтр

	switch ($Did) //Скрывать ли дела
	  { //(0=все дела, 1=скрывать выполненные, 2=только выполненные)
		case 0: $checked = ""; break;
	    case 1: $checked = " AND checked = '0000-00-00 00:00:00' "; break;
		case 2: $checked = " AND checked != '0000-00-00 00:00:00' "; break;
		case 3: { $checked = " AND checked = '0000-00-00 00:00:00' "; $datesql = "1_do.date2 < NOW()"; break; }
	  }
       	
    //Вставляем в SQL поле для поиска, набор полей берем в SearchField
	if ($Search!="%") $searchsql = SearchFieldSQL($SearchField,$Search);
	else $searchsql="";

	$sql="SELECT *, 1_do.id doid, 1_do.comment docomment, 1_do.manager slave FROM  `1_do` 
	      JOIN 1_clients ON 1_clients.id = 1_do.client 
		  WHERE $datesql AND 1_clients.brand = '$fpk_brand' AND 1_clients.manager LIKE '$Manager' AND 1_do.client LIKE '$Clientid'
		  $checked $searchsql $doid $Order
			 ";
//	echo $sql;
//  $fp = fopen('its2.txt', "w");
//  @fwrite($fp, 'rrr='.$sql);
//  fclose($fp);
		 
    $news=displayNewsAll($Template,$sql);
	return $news;
	}
  }
	
	
function User ($email, $pass)
{
global $fpk_user,$fpk_user_short,$fpk_brand,$fpk_id,$fpk_job,$fpk_brandtitle, $fpk_logo, $fpk_brandname,$message_on;

   $sqlnews1="SELECT fio,brand,job,id,message_on FROM 1_users WHERE email='".$email."' AND md5password='$pass'";
   $result1 = mysql_query_my($sqlnews1); 
   @$sql1 = mysql_fetch_object ($result1);
   $fpk_user = $sql1->fio;
   
   if ($sql1->message_on != 'true') $message_on = '';
   else  $message_on = ' checked="checked" ';
   
    $explodeName = explode(" ", $fpk_user);
    $name = $explodeName[0].' '.mb_substr($explodeName[1],0,1,'utf-8').'.'.mb_substr($explodeName[2],0,1,'utf-8').'.';
   $fpk_user_short = $name;
   
   $fpk_brand=$sql1->brand;
   $fpk_job=$sql1->job;
   $fpk_id = $sql1->id;
   
   $sqlnews2="SELECT title,logo,name FROM 1_brands WHERE id='".$fpk_brand."'";
   $result2 = mysql_query_my($sqlnews2); 
   @$sql2 = mysql_fetch_object ($result2);
   
   $fpk_brandtitle=$sql2->title;
   $fpk_logo=$sql2->logo;
   $fpk_brandname = $sql2->name;


if ($fpk_user=='') return false;
return true;
}

function loginuser ()
{
global $fpk_id,$confirm_email, $fio_user, $theme_img, $theme_dark;

   @$email = $_COOKIE['4tree_email_md'];
   @$passw = $_COOKIE['4tree_passw'];
   
   $social = $_COOKIE['4tree_social_md5'];
   
   if($social) {
	   $sqlnews="SELECT * FROM tree_users_social WHERE session_md5='$social' LIMIT 1;";
	   $result = mysql_query_my($sqlnews); 
	   @$sql = mysql_fetch_object ($result);
	   $user_id = $sql->user_id;
	   $sqlnews="SELECT * FROM tree_users WHERE id='$user_id' LIMIT 1;";
   } else {
	   $sqlnews="SELECT * FROM tree_users WHERE md5email='$email' AND password='$passw' LIMIT 1;";
   }
      
   $result = mysql_query_my($sqlnews); 
   @$sql = mysql_fetch_object ($result);
   
   
   $fpk_id = $sql->id;
   $theme_img = $sql->theme_img;
   $theme_dark = $sql->theme_dark;
   
   if ($sql->confirm_email=='') 
      {
      $confirm_email = 'true';
      }
   else
   	  {
      $confirm_email = 'false';
   	  }
//   setcookie('fpk_id', $fpk_id);

   setcookie('4tree_user_id', $fpk_id,time()+60*60*24*60);

if($fpk_id=='') return false;
else return true;
}

function mysql_query_my($sqlnews)
{
global $fpk_user,$fpk_brand,$fpk_id;
$important = 0;
$startTime = microtime();
$result = mysql_query($sqlnews);
$endTime = microtime();
$howLong = ($endTime-$startTime)*1000;

   $sqlnews="INSERT INTO `1_log` (`id`, `date1`, `manager`, `brand`, `text`, `client`, `important`,`sqlnews`) 
             VALUES ('', NOW(), '$fpk_id', '$fpk_brand', '$howLong', '', '$important','".$sqlnews."');";
//   @$result2 = mysql_query($sqlnews); 

return $result; 
}


?>