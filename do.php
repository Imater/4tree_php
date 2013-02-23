<?
header('Access-Control-Allow-Origin: *');

ini_set('memory_limit', '-1');
set_time_limit (400);

$fpk_id = "";
$all_tree_id = "";

include "db.php";

  include 'hypher.php';
  $hy_ru = new phpHypher('hyph_ru_RU.conf');
  
  $db2 = new PDO('mysql:dbname=h116;host=localhost;charset=utf8', $config["mysql_user"], $config["mysql_password"]);
  $db2 -> exec("set names utf8");
  $db2->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
  $db2->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
//mysql_set_charset('utf8', $db2);
  
  
$db = mysql_connect ($config["mysql_host"], $config["mysql_user"], $config["mysql_password"]);
 mysql_query_my("SET NAMES utf8");
//mysql_set_charset('utf8', $db);

mysql_select_db('h116',$db);   
if (!$db) { echo "Ошибка подключения к SQL :("; exit();}



function ShowTree($cnt,$note,$tree, $pid=0){
 echo '<ul data-role="listview" data-inset="true"  data-position="fixed">';
 foreach( $tree as $id=>$root){
 if($pid!=$id)continue;
 if(count($root)){
 foreach($root as $key => $title){

 $n = $note[$id][$key];
 $cnt1 = $cnt[$id][$key];

 if($title=='') $title="4tree.ru";
 
 $n = strip_tags($n);
 $n = mb_strcut($n,0,4000);
 
 $nn = str_replace(' ','',$n);
  
 if ($cnt1==0) $cnt_text = '';
 else $cnt_text='<span class="ui-li-count">'.$cnt1.'</span>';
  
 if(strlen($nn) < 5) echo "<li style='white-space:normal;'><font>{$title}</font>";
 else echo "<li style='white-space:normal;'><h2>{$title}</h2><p style='white-space:normal;'>".$n."</p>";
 
 echo $cnt_text;
 
 if(count($tree[$key]))ShowTree($cnt,$note,$tree,$key);
 }
 }
 }
 echo "</ul>";
}    


if (isset($_GET['test-speed'])) 
  {
  $sqlnews = "SELECT * FROM tree";
$startTime = microtime();
  $result = mysql_query($sqlnews); 
$endTime = microtime();
$howLong = ($endTime-$startTime)*1000;

  while (@$sql = mysql_fetch_array($result))
  	{
  	$all_tree_id[$sql["parent_id"]][] = $sql["id"];
  	}
  	
  echo "Запрос '".$sqlnews."' выполнялся ".$howLong." мс.";
  }


if (isset($_GET['iphone'])) 
{
echo '
	<div data-role="content" > ';
		
  $sqlnews="SELECT *,(SELECT count(*) cnt FROM `tree` tr2 WHERE tr2.parent_id = tr1.id AND user_id=11) cnt FROM `tree` tr1 WHERE user_id=11 AND did != '1000-00-00 00:00:00'";
  $result = mysql_query($sqlnews); 
  while(@$row = mysql_fetch_assoc ($result))
    {
    $tree[$row['parent_id']][$row['id']] = $row['title'];
    $note[$row['parent_id']][$row['id']] = $row['text'];
    $cnt[$row['parent_id']][$row['id']] = $row['cnt'];
    }
  
//  print_r($tree);
  
  $key = 0;
  if(count($tree[$key]))ShowTree($cnt,$note,$tree,$key);
  
    
    
/*    
	echo '<li><a style="white-space:normal;font-size:0.95em;padding-top:3px;padding-bottom:3px;" href="#listViews3" href2="#node_'.$sql->id.'">'.$sql->title.'</a>';

	echo '<ul><li>901</li><li>902</li><li>903';

	echo '<ul><li>901</li><li>902</li><li>903</li></ul>';
	
	echo '</li></ul>';

	echo '</li>';	
	}*/
			
			
echo '		</div>';

}


if (isset($_POST['phone'])) 
{
$fpk_id = 11;
require_once("config.php");
$jstree = new json_tree();

setcookie('fpk_id',11,time()+60*60*24*60);

  $sqlnews="SELECT id FROM `tree` WHERE user_id=11 AND type='drive' AND title='_НОВОЕ'";
  $result = mysql_query($sqlnews); 
  @$sql = mysql_fetch_object ($result);

$startdate=parsedate(mysql_real_escape_string($_POST['mes']));

echo $_POST['mes'].$startdate.$sql->id.mysql_real_escape_string($_POST['mes']).'<hr>';
 
$dd = $jstree->create_node(array("id"=>$sql->id,"position"=>0,"title"=>mysql_real_escape_string($_POST['mes']),"date1"=>$startdate,"date2"=>"","remind"=>$startdate));

echo $dd;


//if (false)
//foreach ($_POST as $key=>$val)
//	$out.="$key=$val; ";
	
//	$out = str_replace('"','',$out);
 
// $sqlnews='UPDATE `tree` SET `text` = "'.mysql_real_escape_string($_POST['mes']).'" WHERE `id`=2 LIMIT 1';
// $result = mysql_query($sqlnews);
 
$fp = fopen('log-phone.txt', "a+");
@fwrite($fp, ' sql='.mysql_real_escape_string($_POST['mes']).' : '.$startdate.' : id='.$sql->id);
fclose($fp);
 


exit;
}

  require_once("config.php");


if (isset($HTTP_POST_VARS['reremember'])) 
{
$email = trim($HTTP_POST_VARS['email']);

$sqlnews="SELECT count(*) cnt FROM `tree_users` WHERE md5email = '".mysql_real_escape_string($email)."'";
$result = mysql_query_my($sqlnews); 
@$sql = mysql_fetch_object ($result);

$sqlnews1="SELECT email FROM `tree_users` WHERE md5email = '".mysql_real_escape_string($email)."'";
$result1 = mysql_query_my($sqlnews1); 
@$sql1 = mysql_fetch_object ($result1);

if($sql->cnt>0) 
   { 
   mail($sql1->email,'Вы просили восстановить пароль на 4tree.ru',"Восстанавливайте\nhttp://4tree.ru/sdf_dsfdSD5",
   		"From: 4tree-mailer <4tree@4tree.ru>\r\n");
   echo 'Проверьте свою почту.<br>Я отправил вам письмо c возможностью восстановить пароль.'; exit; 
   }
else
   {
   echo 'wrong';
   }

}

if (isset($HTTP_POST_VARS['login_me'])) 
{
$email = trim($HTTP_POST_VARS['email']);
$passw = $HTTP_POST_VARS['passw'];

$sqlnews="SELECT count(*) cnt FROM `tree_users` WHERE email = '".mysql_real_escape_string($email)."' AND password='".mysql_real_escape_string($passw)."' LIMIT 1";

$result = mysql_query_my($sqlnews); 
@$sql = mysql_fetch_object ($result);

if($sql->cnt>0) { echo 'Добро пожаловать!<br>Перенаправляю на сайт...'; exit; }
exit;
}

if (isset($HTTP_POST_VARS['registrate_me'])) 
{
$email = trim($HTTP_POST_VARS['email']);
$passw = $HTTP_POST_VARS['passw'];

$sqlnews="SELECT count(*) cnt FROM `tree_users` WHERE email LIKE '%".mysql_real_escape_string($email)."%' LIMIT 1";
$result = mysql_query_my($sqlnews); 
@$sql = mysql_fetch_object ($result);

if($sql->cnt>0) { echo $email.' уже зарегистрирован'; exit; }
else
 {
 	$hash = '4tree_'.substr(md5($email),5,10);
 	
	$sqlnews="INSERT INTO  `tree_users` (
						   `id` ,
						   `fio` ,
						   `mobilephone` ,
						   `cookie` ,
						   `email` ,
						   `md5email`,
						   `reg_date` ,
						   `password` ,
						   `confirm_email`
						   )
						   VALUES (
						   NULL ,  'Username',  '',  '', '".$email."', MD5('".$email.'990990'."'), NOW(), '".$passw."',  '".$hash."'
						   );";
						   
	$result = mysql_query_my($sqlnews); 
	
   $tree="<font color='#214516'>4</font><font color='#244918'>t</font><font color='#356d23'>r</font><font color='#42872c'>e</font><font color='#57b33a'>e</font>";

  $sqlnews="SELECT confirm_email FROM `tree_users` ORDER BY `tree_users`.`id`  DESC";
  $result = mysql_query_my($sqlnews); 
  @$sql = mysql_fetch_object ($result);
  $code = $sql->confirm_email;
  
  $real_email = str_replace('%40','@',$email);

   mail($real_email,'Вы только что зарегистрировались на 4tree.ru',"<font size='3em'>&nbsp;Привет,<br><br>Вы только что зарегистрировались на ".$tree.".<br>Чтобы подтвердить регистрацию, пожалуйста, пройдите по ссылке ниже:<br><a href='http://4tree.ru/?confirm=".$code."'><font size=5em><b>http://4tree.ru/?confirm=".$code."</b></font></a></font><br><br><br>Желаю успехов в делах, ваш ".$tree.".",
   		"From: 4tree-mailer <noreply@4tree.ru>\r\nContent-type: text/html; charset=utf8\r\n");

   mail('eugene.leonar@gmail.com',$real_email.' он только что зарегистрировался на 4tree.ru',"<font size='3em'>&nbsp;Привет,<br><br>Вы только что зарегистрировались на ".$tree.".<br>Чтобы подтвердить регистрацию, пожалуйста, пройдите по ссылке ниже:<br><a href='http://4tree.ru/?confirm=".$code."'><font size=5em><b>http://4tree.ru/?confirm=".$code."</b></font></a></font><br><br><br>Желаю успехов в делах, ваш ".$tree.".",
   		"From: 4tree-mailer <noreply@4tree.ru>\r\nContent-type: text/html; charset=utf8\r\n");

	
	$sqlnews="SELECT id FROM `tree_users` WHERE `confirm_email`!='' AND reg_date < (NOW() - INTERVAL 3 DAY)";
	$result = mysql_query_my($sqlnews); 
	while(@$sql = mysql_fetch_object ($result))
	  {
		$sqlnews2="DELETE FROM `tree` WHERE `user_id`='".$sql->id."'";
		$result2 = mysql_query_my($sqlnews2); 
	  
		$sqlnews2="DELETE FROM `tree_users` WHERE `id`='".$sql->id."'";
		$result2 = mysql_query_my($sqlnews2); 
	  }
	 echo 'Вы успешно зарегистрировались.<br>Перенаправляю на сайт...';
	 	
	
 }
exit;
}


if (isset($HTTP_GET_VARS['diary_guest'])) 
{
$q = strtolower($HTTP_GET_VARS["diary_guest"]);

   $sqlnews = "SELECT node_id,is_on FROM h116.tree_shortlink WHERE (shortlink='".$q."' OR longlink='".$q."')";
   $result = mysql_query_my($sqlnews); 
   @$sql = mysql_fetch_array($result);
   
      
   $node_id = $sql['node_id']; 
   $node_id_count = split(",",$node_id);
   $cnt_id = count($node_id_count)-1;

   if(($sql['is_on']==0) AND ($cnt_id>0)) { echo '<center>Такая заметка существует,<br>но владелец заметки отключил её просмотр</center><br>'; exit; }
   
   //заношу статистику посещения гостей в дневник, использую их ip
   $sqlnews = "UPDATE h116.tree_shortlink SET statistic = CONCAT(statistic,'".$_SERVER['REMOTE_ADDR'].",') WHERE shortlink='".$q."'";
   $result = mysql_query_my($sqlnews); 
   @$sql = mysql_fetch_array($result);

   if ($cnt_id == 0) { echo '<center>Заметки не существует</center><br><br>'; exit; }

   if ($cnt_id > 1) { $need_h = true; $cnt = $cnt_id; }
   else $need_h = false;

   $sqlnews = "SELECT * FROM h116.tree WHERE id IN (".$node_id."0) ORDER by id";
   $result = mysql_query_my($sqlnews); 
   $i = 1;
   while (@$sql = mysql_fetch_array($result))
     {
     $q = $sql['id'];
	 echo "<mynum>$q</mynum>";
     $title = $sql['title'];
     if($need_h) $title = $cnt." заметок из 4tree.ru";
     echo "<path>$title</path>";
     $title = $sql['title'];
     if($need_h) echo "<div class='divider' contenteditable='false' id='".$q."'><h2><span style='float:left'>".$i.'.</span> '.$title."</h2></div><div class='edit_text'><p>";
     echo $sql['text'];
     if($need_h) echo "</p></div>";
     $i++;
     }
   
   
   exit;
}



if( (!loginuser()) AND ( !isset($_POST['phone']) )) exit;

/////////////////////////////////////////////////////////////////////////////////////////////////////////
$user_id = $fpk_id;

if (isset($HTTP_GET_VARS['update_path'])) 
{
if($HTTP_GET_VARS['update_path']!='') $where = 'where id="'.$HTTP_GET_VARS['update_path'].'"';

$sqlnews = "SELECT * FROM tree $where ORDER by parent_id";
  $result = mysql_query_my($sqlnews); 
  $i=0;
  while (@$sql = mysql_fetch_array($result))
    {
    $path = my_path($sql['id']);
    $sqlnews2 = "UPDATE tree SET path = '$path' WHERE id=".$sql['id'];
	$result2 = mysql_query_my($sqlnews2); 
	}
  echo 'ok';
exit;
}

function now()
{
//    return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()).valueOf(); 

    return (integer)(microtime(true)*1000);
}


if (isset($HTTP_GET_VARS['sync3'])) 
{
echo get_all_share_children(11);
exit;
}

function sqltime($now)
{
return date("Y-m-d <b>H:i:s</b>",($now/1000+60*60));
}


if (isset($HTTP_GET_VARS['sync_new'])) 
{
$what_you_need = $HTTP_GET_VARS['what_you_need'];
$sync_id = $HTTP_GET_VARS['sync_new']; //индентификатор клиента
$client_time = $HTTP_GET_VARS['time']; $last_sync_client_time = $HTTP_GET_VARS['time'];  //время последней синхронизации  
$now_time = $HTTP_GET_VARS['now_time'];  //сколько сейчас времени на клиенте
$ch = $HTTP_GET_VARS['changes']; //POST
//if($_SERVER["HTTP_HOST"]=="localhost") 
$ch = stripslashes($ch);
$changes =  json_decode( $ch , true );  

$now = now();
$confirm = $HTTP_POST_VARS['confirm'];
$confirms =  json_decode( $confirm , true );  

$time_dif = $now - $now_time;

$confirm_id = "";
$display = false;
if($display) echo "<b>Индентификатор клиента:</b> ".$sync_id."<hr>";
if($display) echo "<b>Время последней синхронизации:</b> ".sqltime($client_time)." (".$client_time.")<hr>";
if($display) echo "<b>Время сейчас на сервере:</b> ".sqltime($now)." (".$now.")<hr>";
if($display) echo "<b>Необходима поправка времени:</b> ".$time_dif." микросекунд<hr>";

if($display) echo "<b>Время клиента:</b> ".sqltime($now_time)." (".$now_time.")<hr>";
if($display) echo "<b>ОБЩЕЕ ВРЕМЯ:</b> ".sqltime($now_time+$time_dif)." (".($now_time+$time_dif).")<hr>";

$countlines = count($changes);

if($display) echo "<b>Пришли изменения с сервера (</b>".$countlines." шт<b>):</b> <font style='font-size:7px'>".$ch."</font>";
//if($display) print_r($changes);
if($display) echo "<hr><b>Клиент успешно синхронизировал в прошлый раз:</b> ".$confirm."<hr>";
if($display) echo "<b>Начинаю обработку присланных от клиента ".$countlines." элементов:</b>";
for ($i=0; $i<$countlines; $i++)
	{
		$id = $changes[$i]['id'];
		if($id=="") continue;
		if($display) echo "<hr><li>".($i+1)." — ".$id."</li>";
		if($id<0)
		   {
		   		$old_id = $id; //сохраняю старый отрицательный id
		   		
		   		if($display) echo "Необходимо добавить элемент ".$id." (".$changes[$i]['title'].")<br>";
		   		
		   		$sqlnews5="DELETE FROM tree WHERE old_id='".$id."'";
		   		$result5 = mysql_query_my($sqlnews5); 
		   		if($display) if(mysql_affected_rows()>0) echo "Удалил дублирующую запись (".mysql_affected_rows()." шт)<br>";
		   		
		   		$sqlnews="INSERT INTO `tree` (old_id,user_id,changetime,title) VALUES ('".$id."','".$GLOBALS['user_id']."','".($now_time+$time_dif)."','".$changes[$i]['title']." (new)');";
		   		$result = mysql_query_my($sqlnews); 
		   		if($display) echo "<font style='font-size:9px'>".$sqlnews."</font><br>";
		   		$id = mysql_insert_id();
		   		if($display) echo "<b>Новый id</b> = ".$id."<br>";
		   		
		   		$sqlnews = "UPDATE tree SET parent_id =".$id." WHERE parent_id = '".$old_id."' ORDER by id DESC";	
		   		if($display) echo "<font style='font-size:9px'>".$sqlnews."</font><br>";
		   		
		   		for($j=0; $j<$countlines;$j++) //заменяю parent_id где он отрицательный в самом массиве изменений
		   		    {
		   		    if( @$changes[$j]['parent_id'] == $old_id ) 
		   		    	{ 
		   		    	$changes[$j]['parent_id'] = $id; 
			   		    if($display) echo "Заменил индекс родителя у дела: ".$changes[$j]['id']." — (".$changes[$j]['title'].") на ".$id."<br>";
		   		    	}
		   		    }
		   		$changes[$i]['old_id'] = $changes[$i]['id'];
		   		$changes[$i]['id']=$id;
		   }
    } //first for_i
if($display) echo "<hr><hr>Начинаю второй проход<br>";
$dont_send_ids = "";
//второй проход, с учётом добавленных элементов
for ($i=0; $i<$countlines; $i++)
	{
		$id = $changes[$i]['id'];
		if($id=="") continue;
		if($display) echo "<hr><li>".($i+1)." — ".$id."</li>";

		$sqlnews = "SELECT id,title,parent_id,changetime FROM tree WHERE id = '".$id."'";
		$result = mysql_query_my($sqlnews); 
		@$sql = mysql_fetch_array($result);
   		if($display) echo "<font style='font-size:9px'>".$sqlnews."</font><br>";
   		if($display) echo "Элемент в базе найден: <b>".$sql['title']."</b> (родитель: ".$sql['parent_id'].")<br>";

  		$change_time = (integer)$changes[$i]['time']+$time_dif; //время изменения заметки на клиенте
  		$fromdb_time = $sql['changetime'];
   		$dif = $fromdb_time - $change_time;

   		if($display) echo "Время изменения на клиенте: ".sqltime($change_time)." — время изменения на сервере: ".sqltime($fromdb_time).") = ".$dif."; ".@$changes[$i]['old_id']."<br>";

   		if($dif<0 OR @$changes[$i]['old_id']<0)
   			{
	   		if($display) echo "<span style='color:green'><b>Сохраняю этот элемент в базе данных</b></span><br>";
	   		sync_save_changes($changes,$i,$sql,$display,$now_time,$time_dif);
	   		$dont_send_ids .= " `id` != ".$id." AND ";
   			}
   		else
   			{
	   		if($display) echo "<span style='color:red'><b>Делаю резервную копию, но не сохраняю! Есть более свежие изменения сделанные ".$dif." мс. назад; ".@$changes[$i]['old_id']."</b></span><br>";
   			}
	   		sync_save_backup($changes,$i,$sql,$display,$now_time);
	   		$confirm_saved_id["saved"][$i]["id"] = "".$id;
	   		if(@$changes[$i]['old_id']) $confirm_saved_id["saved"][$i]["old_id"] = "".@$changes[$i]['old_id'];

	}

//сообщаю всем слушателям о том, что данные изменились
if( count($confirm_saved_id["saved"])>0 )
	{
    $message = array(
        'time' => now(), 
        'sync_id' => $sync_id,
        'type' => "need_refresh_id",
        'msg' => "Нужно обновиться",
        'txt' => json_encode($confirm_saved_id)
        );
        
	push(array($GLOBALS['user_id']),$message);
	}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
if($what_you_need != "save") //если клиент хочет только сохраниться, то не загружаю новые данные (для ускорения процесса)
	{
	$sqlnews = "SELECT id, changetime, lsync, parent_id, position, title, text, date1, date2, did, user_id, node_icon, remind, tab_order, old_id, del, fav, s FROM tree WHERE ( user_id=".$GLOBALS['user_id']." AND (changetime > '".($client_time+$time_dif)."' OR lsync>'".($client_time+$time_dif)."') AND ($dont_send_ids true))";
//	echo $sqlnews;
	//все объекты у которых дата изменения позже последней синхронизации или
	//которые синхронизировались позже последней синхронизации
	//и исключаю те данные, которые только что обновлял $dont_send_ids
	
	$result = mysql_query_my($sqlnews); 
	$i = 0;
	while(@$sql = mysql_fetch_array($result))
		{
		$date1 = $sql['date1'];
		$date2 = $sql['date2'];
		if($date1=="0000-00-00 00:00:00") $date1="";
		if($date2=="0000-00-00 00:00:00") $date2="";
		
		$did = $sql['did'];
		if($did=="0000-00-00 00:00:00") $did="";
		
		$server_changes[$i]['id']=($sql['id']);
		$server_changes[$i]['title']=($sql['title']);
		$server_changes[$i]['text']=($sql['text']);
		$server_changes[$i]['date1']=$date1;
		$server_changes[$i]['date2']=$date2;
		$server_changes[$i]['fav']=$sql['fav'];
		$server_changes[$i]['tab']=$sql['tab_order'];
		$server_changes[$i]['parent_id']=($sql['parent_id']);
		$server_changes[$i]['did']=($did);
		$server_changes[$i]['position']=($sql['position']);
		$server_changes[$i]['node_icon']=($sql['node_icon']);
		$server_changes[$i]['remind']=($sql['remind']);
		$server_changes[$i]['changetime']=((integer)$sql['changetime']-$time_dif);
		$server_changes[$i]['tab']=($sql['tab_order']);
		$server_changes[$i]['old_id']=($sql['old_id']);
		$server_changes[$i]['user_id']=($sql['user_id']);
		$server_changes[$i]['lsync']=($now_time);
		$server_changes[$i]['s']=($sql['s']);
		$server_changes[$i]['del']=($sql['del']);
		$i++;
		}
	
	
	} //end of LOAD_DATA

$confirm_saved_id["lsync"] = $now_time;
$confirm_saved_id["server_changes"] = $server_changes;
echo json_encode($confirm_saved_id);


exit;
}

function sync_save_changes($changes,$i,$sql,$display,$now_time,$time_dif)
{
global $db2;
if($display) echo "SAVE CHANGES<br>";

	$fields = array ("parent_id","position","title","tab_order","text",
					 "date1","date2","remind","did","s","fav","del","node_icon");

		$sqlnews2 = "UPDATE  `tree` SET ";

		for($iii=0;$iii<count($fields);$iii++) //меняем в базе только те поля, которые изменились и присланы из клиента
			{
			if(array_key_exists($fields[$iii], $changes[$i])) 			
				{
				$sqlnews2 .= " ".$fields[$iii]." = :".$fields[$iii].", ";
				}
			else
				{
				$sqlnews2 .= " `left` = :".$fields[$iii].", ";
				}
			}
		
		$sqlnews2 .= "changetime = :changetime, lsync = :lsync  WHERE  `tree`.`id` = :id; ";
   		if($display) echo "<font style='font-size:9px'>".$sqlnews2."</font><br>";

		$date1=$changes[$i]['date1'];
		$date2=$changes[$i]['date2'];
		if($date1=="") $date1="0000-00-00 00:00:00";
		if($date2=="") $date2="0000-00-00 00:00:00";

		$did=$changes[$i]['did'];
		if($did=="") $did="0000-00-00 00:00:00";

   		if(@$changes[$i]['text']) $note = @$changes[$i]['text'];
   		else $note = "";
   		
		if($changes[$i]['del']==1) $del=1; //флаг удаления дела
		else $del = 0;
   		
   		$changetime = $changes[$i]['time']+$time_dif;

		$values = array( ":id" => $changes[$i]['id'],
				":parent_id" =>  $changes[$i]['parent_id'],
				":position" => $changes[$i]['position'],
				":title" =>  $changes[$i]['title'],
				":tab_order" =>  $changes[$i]['tab'],
				":text" => $note,
				":date1" =>  $date1,
				":date2" =>  $date2,
				":lsync" =>  $now_time,
				":remind" => $changes[$i]['remind'],
				":did" =>  $did,
				":s" => $changes[$i]['s'],
				":fav" =>  $changes[$i]['fav'],
				":changetime" => $changetime,
				":del" => $del,
				":node_icon" => $changes[$i]['node_icon']);

		if($display) print_r($values);

		$query = $db2->prepare($sqlnews2);
		$query->execute($values);

					 

}

function sync_save_backup($changes,$i,$sql,$display,$now_time)
{
global $db2;
if($display) echo "SAVE BACKUP<br>";

	if(@$changes[$i]['text']) $note = @$changes[$i]['text'];
	else $note = "";
	$md5 = sha1($note.@$changes[$i]['time']); //для предотвращения повтороного сохранения того же
	
	$sqlnews2 = "SELECT count(*) cnt FROM `tree_backup` WHERE md5 ='".$md5."' AND user_id='".$GLOBALS['user_id']."'";
	if($display) echo $sqlnews2;
	$result2 = mysql_query_my($sqlnews2); 
	@$sql2 = mysql_fetch_array($result2);
		
	if(($note == "") OR ($sql2['cnt']>0)) 
		{
		if($display) echo "Сохранение резервной копии не требуется (заметка уже была или пуста).<br>";
		return false; //предотвращаю лишние сохранения и пустые заметки
		}

	$sql11 = "INSERT INTO `tree_backup` SET
	    	`id` = :id,
	    	`title` = :title,
	    	`text` = :text,
	    	`user_id` = :user_id,
	    	`changedate` = :changetime,
	    	`md5` = :md5";
	if($display) echo $sql11;
		
	$values11 = array( 
	    	":id" => $changes[$i]['id'],
	    	":title" =>  $changes[$i]['title'],
	    	":text" => $note,
	    	":user_id" => $GLOBALS['user_id'],
	    	":changetime" => $changes[$i]['time'],
	    	":md5" => $md5
	        );
	        
	$query1 = $db2->prepare($sql11);
	$query1->execute($values11);
}

/////////////////////Синхронизация/////////////////////////
if (isset($HTTP_GET_VARS['sync'])) 
{
$comment = "";
$id_counts="";
$do = true;
$show=false;
$server_time = now();
$need_to_confirm = "";

$share_ids = get_all_share_children($GLOBALS['user_id']); //все дочерние элементы, которые есть в таблице tree_share

$browser = $_SERVER['HTTP_USER_AGENT'];
$ip = $_SERVER['REMOTE_ADDR'];
$r_time = $_SERVER['REQUEST_TIME'];
$browser_info = "@".$ip."\n".$browser."\n".$r_time;    

$ids = "";


$sync_id = $HTTP_GET_VARS['sync']; //индентификатор клиента
$client_time = $HTTP_GET_VARS['time']; $last_sync_client_time = $HTTP_GET_VARS['time'];  //время последней синхронизации  
$now_time = $HTTP_GET_VARS['now_time'];  //сколько сейчас времени на клиенте
$ch = $HTTP_POST_VARS['changes'];
//$ch = $HTTP_GET_VARS['changes'];
$confirm = $HTTP_POST_VARS['confirm'];

$confirms =  json_decode( $confirm , true );  
//print_r( $confirms );

$conf = "-5";
for($i=0;$i<count($confirms);$i++)
	{
	$conf .= ",".$confirms[$i];
	}
$sqlnews4 = "UPDATE `tree_sync` SET confirm = '".$now_time."' WHERE `tree_sync`.`iid` IN (".$conf."); ";
$result4 = mysql_query_my($sqlnews4); 


if($show) echo $now_time.' - время сейчас на клиенте<br>'.$server_time.' - server_time<br>'.($server_time-$now_time)." - разница у сервера и клиента сейчас<br>".$client_time.' - clienttime (last_sync)<br>'.($server_time-$client_time).' - сколько секунд назад была синхронизация<hr>';

if($show) echo $ch.'<hr>';

//$changes =  json_decode( stripslashes($ch) , true );  

if($_SERVER["HTTP_HOST"]=="localhost") $ch = stripslashes($ch);

$changes =  json_decode( $ch , true );  

if($show) print_r($changes);
if($show) echo '<hr>';

////Перебираю присланные от клиента элементы
$all_id="";
$client_time = $HTTP_GET_VARS['time']; 
$last_sync_client_time = $HTTP_GET_VARS['time'];  //время последней синхронизации  
$now_time = $HTTP_GET_VARS['now_time'];  //сколько сейчас времени на клиенте

//обрабатываю новые элементы, у которых id < 0
for($i=0; $i<count($changes);$i++) //начало for changes
{
	$id = $changes[$i]['id'];
	
	$ids .= $id.",";
	
	if( $id<0 )
	  {
//	    print_r( $changes[$i] );
		$old_id = $changes[$i]['id']; //сохраняю отрицательный id
		$sqlnews5="DELETE FROM tree WHERE old_id='".$old_id."'";
		$result5 = mysql_query_my($sqlnews5); 
		
		$sqlnews="INSERT INTO `tree` (old_id,user_id,changetime) VALUES ('".$id."','".$GLOBALS['user_id']."','".($now_time)."');";
if($do)	$result = mysql_query_my($sqlnews); 

		$sqlnews = "SELECT * FROM tree WHERE ( user_id=".$GLOBALS['user_id']." OR id IN ($share_ids) ) AND old_id = '".$id."' ORDER by id DESC";
		$result = mysql_query_my($sqlnews); 
		@$sql = mysql_fetch_array($result);
		$id = $sql["id"];
		for($j=0; $j<count($changes);$j++) //заменяю parent_id где он отрицательный в самом массиве изменений
			{
			if( $changes[$j]['parent_id'] == $changes[$i]['id'] ) { $changes[$j]['parent_id'] = $id; }
			}
		
		$changes[$i]['old_id'] = $changes[$i]['id'];
		$changes[$i]['id']=$id;
	  }
}

//print_r($changes);
//ВТОРОЙ ПРОХОД
for($i=0; $i<count($changes);$i++) //начало for changes
{
	
	$id = $changes[$i]['id'];
	$old_id = $changes[$i]['id']; //сохраняю отрицательный id
		
	$all_id .= $changes[$i]['id'].',';	
	
	$sqlnews = "SELECT * FROM tree WHERE ( user_id=".$GLOBALS['user_id']." OR id IN ($share_ids) ) AND id = '".$id."'";
	$result = mysql_query_my($sqlnews); 
	@$sql = mysql_fetch_array($result);
			
	$change_time = $changes[$i]['time']; //время изменения заметки на клиенте
	$fromdb_time = $sql['changetime'];
	
	$dif = $fromdb_time - $change_time;
		
if($show)	echo "!!!".$dif.' change_time = '.$change_time." from_db_time=".$fromdb_time;
	////////////////////////////////////////////////////
	if(false OR ($dif<=0) OR ($changes[$i]['old_id']<0)) //если время изменилось или это новый элемент
		{
		$date1=$changes[$i]['date1'];
		$date2=$changes[$i]['date2'];
		if($date1=="") $date1="0000-00-00 00:00:00";
		if($date2=="") $date2="0000-00-00 00:00:00";

		$did=$changes[$i]['did'];
		if($did=="") $did="0000-00-00 00:00:00";
	if(array_key_exists("text", $changes[$i]))
		{
		$ar = parsenote( $id,$changes[$i]['text'] ); //ворую картинки
		$note = $ar[0];
		$icon = $ar[1];
		
		if( ($icon != $sql['node_icon']) )
		  {
		  $changes[$i]['node_icon'] = $icon;
		  }
		}

		if($note==$sql['text']) $changetime = $changes[$i]['time']; //если текст не изменился, то время то же
		else 
			{
			$changetime = $changes[$i]['time']; //???? надо ли это (тут было +1) !!!
			}

		if($old_id<0) $changetime = $now_time; //если это новое дело ставим время, чтобы синхронизировать далее (тут было +1). 

		if($changes[$i]['del']==1) $del=1; //флаг удаления дела
		else $del = 0;
		
		$fields = array ("parent_id","position","title","tab_order","text",
						 "date1","date2","remind","did","s","fav","del","node_icon");
		
		$sqlnews2 = "UPDATE  `tree` SET ";

//		$changes[$i] = str_replace("icon,","node_icon,",$changes[$i]);
		
		for($iii=0;$iii<count($fields);$iii++) //меняем в базе только те поля, которые изменились и присланы из клиента
			{
			if(array_key_exists($fields[$iii], $changes[$i])) 			
				{
				if($fields[$iii]=="text")  //делаем резервную копию текста заметки каждые 60 секунд
					{
					$sqlnews11 = "SELECT max(changedate) changetime FROM `tree_backup` WHERE id='".$changes[$i]['id']."'";
					$result11 = mysql_query_my($sqlnews11); 
					@$sql11 = mysql_fetch_array($result11);
					
					if ( ((int)$changetime - (int)$sql11['changetime']) > 60000 )
						{
						$sql11 = "INSERT INTO  `tree_backup` (
	    						`id` ,
	    						`title` ,
	    						`text` ,
	    						`user_id` ,
	    						`changedate` ,
	    						`id1`,
	    						`md5`
	    						)
	    						VALUES (
	    						:id,  :title,  :text,  :user_id, :changetime, NULL, :md5
	    						);
	    						
	    						";
	
	    				$values11 = array( ":id" => $changes[$i]['id'],
	    						":title" =>  $changes[$i]['title'],
	    						":text" => $note,
	    						":user_id" => $GLOBALS['user_id'],
	    						":changetime" => $changetime,
	    						":md5" => strlen($note)
	    					    );
	    					    
	    				$query1 = $db2->prepare($sql11);
	    				$query1->execute($values11);
	    				}
							
					 
					}
				$sqlnews2 .= " ".$fields[$iii]." = :".$fields[$iii].", ";
				}
			else
				{
				$sqlnews2 .= " `left` = :".$fields[$iii].", ";
				}
			}
		
		$sqlnews2 .= "changetime = :changetime  WHERE  `tree`.`id` = :id; ";
		if(array_key_exists("title1", $changes[$i])) echo "!!!YES!!!";

		
		$values = array( ":id" => $changes[$i]['id'],
				":parent_id" =>  $changes[$i]['parent_id'],
				":position" => $changes[$i]['position'],
				":title" =>  $changes[$i]['title'],
				":tab_order" =>  $changes[$i]['tab'],
				":text" => $note,
				":date1" =>  $date1,
				":date2" =>  $date2,
				":remind" => $changes[$i]['remind'],
				":did" =>  $did,
				":s" => $changes[$i]['s'],
				":fav" =>  $changes[$i]['fav'],
				":changetime" => $changetime,
				":del" => $del,
				":node_icon" => $changes[$i]['node_icon']
							  
							  );
		
		if($del == 1)
			{ //перебираю всех, кто был синхронизирован с этим делом, чтобы дать им комманду удалить
			$sqlnews5 = "SELECT sync_id FROM `tree_sync` WHERE id = ".$changes[$i]['id']." GROUP by sync_id";
			$result5 = mysql_query_my($sqlnews5); 
			while(@$sql5 = mysql_fetch_array($result5))
				{
				$my_sync_id = $sql5["sync_id"];
				$sqlnews6 = "INSERT INTO  `h116`.`tree_sync` (
						`iid` ,
						`id` ,
						`del`,
						`user_id` ,
						`host_id` ,
						`sync_id` ,
						`lsync` ,
						`lsync_d` ,
						`changetime` ,
						`changetime_d` ,
						`title` ,
						`text`
						)
						VALUES (
						'',  '".$changes[$i]['id']."', '1',  '".$GLOBALS['user_id']."', '',  '".$my_sync_id."', '0', '0',  '0', '0',  '".$changes[$i]['title']."',  '".$browser_info."'
						);";
			    $result6 = mysql_query_my($sqlnews6); 
				
				}
			
//			echo "Need Del=".$changes[$i]['id'];			
			}
		
//		echo "<hr>".$changes[$i]['id']." - ".$sqlnews2."<hr><hr>";
		
		
				
		$query = $db2->prepare($sqlnews2);
		$query->execute($values);
		

if($show) echo '<hr>'.$sqlnews2.'<hr>';
		
if($do)	$result2 = mysql_query_my($sqlnews2); 
		
		}
	else
		{
		}
					
	$id_counts .= '<br>'.$id.' ('.$dif.' - время изменения: client='.$client_time.', server='.$server_time.') '.$changes[$i]['title'];
	
	
} //конец for changes

$comment .= "<hr>Прислано от клиента ".count($changes)." эл.: $id_counts<hr>";
////////////////////////////////////////////////////////////
//тут нужно будет добавить журналирование по удалению

// echo $ids;

 if(false) //так было и работало (резервная копия)
	$sqlnews = "SELECT ts.changetime2, t.* from tree t LEFT OUTER JOIN (SELECT id, max(changetime) changetime2 FROM tree_sync WHERE (tree_sync.user_id='".$GLOBALS['user_id']."' OR tree_sync.id IN ($share_ids) ) AND tree_sync.sync_id='".$sync_id."' GROUP by id) ts ON (t.id=ts.id) WHERE ( (ts.changetime2 < t.changetime OR ts.changetime2 is NULL) AND (t.user_id='".$GLOBALS['user_id']."' OR t.id IN ($share_ids) ) AND t.del=0 ) OR t.id IN (".$ids."-5)";

	//ищем тех, чья синхронизация не подтверждена, это означает, что был сбой синхронизации
		$sqlnews = "SELECT * FROM tree_sync WHERE ( user_id=".$GLOBALS['user_id']." AND sync_id='".$sync_id."' AND confirm=0)";
		$result = mysql_query_my($sqlnews); 
		$ids_not_confirm = "-5";
		while(@$sql = mysql_fetch_array($result))
			{
			$ids_not_confirm .= ",".$sql['id'];
			$need_to_confirm[] = (integer)$sql['iid']; //какие строки синхронизации подтвердить в сл.раз
			}
		
	
	$sqlnews = "SELECT ts.changetime2, t.* FROM tree t LEFT OUTER JOIN (SELECT id, max(changetime) changetime2 FROM tree_sync WHERE (tree_sync.user_id='".$GLOBALS['user_id']."' OR tree_sync.id IN ($share_ids) ) AND tree_sync.sync_id='".$sync_id."' GROUP by id) ts ON (t.id=ts.id) WHERE ( (ts.changetime2 < t.changetime OR ts.changetime2 is NULL) AND (t.user_id='".$GLOBALS['user_id']."' OR t.id IN ($share_ids) ) AND t.del=0 ) OR t.id IN (".$ids.$ids_not_confirm.")";
	
	

	
if($show) 	echo "<hr>\n\rОтбор новых значений<hr>".$sqlnews."<hr>";

//	echo $sqlnews.' ; ';
	
	$result = mysql_query_my($sqlnews); 
	$i=0;
	$server_changes = '';
	while(@$sql = mysql_fetch_array($result))
		{
		$sqlnews2 = "INSERT INTO  `h116`.`tree_sync` (
				`iid` ,
				`id` ,
				`user_id` ,
				`host_id` ,
				`sync_id` ,
				`lsync` ,
				`lsync_d` ,
				`changetime` ,
				`changetime_d` ,
				`title` ,
				`text`
				)
				VALUES (
				'',  '".$sql['id']."',  '".$GLOBALS['user_id']."', '".$sql['user_id']."',  '".$sync_id."', '".$now_time."', '".sqldate($now_time)."',  '".$sql['changetime']."', '".sqldate( $sql['changetime'] )."',  '".$sql['title']."',  '".$browser_info."'
				);";
	    $result2 = mysql_query_my($sqlnews2); 
	    //тут можно удалить все предыдущие варианты синхронизаций, чтобы не занимали место
	    
	    
		$need_to_confirm[] = mysql_insert_id();

		
		
		
		
		
		$date1 = $sql['date1'];
		$date2 = $sql['date2'];
		if($date1=="0000-00-00 00:00:00") $date1="";
		if($date2=="0000-00-00 00:00:00") $date2="";
		
		$did = $sql['did'];
		if($did=="0000-00-00 00:00:00") $did="";
		
if($show) 		echo "<li>".$sql['id']."</li>";
		$server_changes[$i]['id']=($sql['id']);
		$server_changes[$i]['title']=($sql['title']);
		$server_changes[$i]['text']=($sql['text']);
		$server_changes[$i]['date1']=$date1;
		$server_changes[$i]['date2']=$date2;
		$server_changes[$i]['fav']=$sql['fav'];
		$server_changes[$i]['tab']=$sql['tab_order'];
		$server_changes[$i]['parent_id']=($sql['parent_id']);
		$server_changes[$i]['did']=($did);
		$server_changes[$i]['position']=($sql['position']);
		$server_changes[$i]['node_icon']=($sql['node_icon']);
		$server_changes[$i]['remind']=($sql['remind']);
		$server_changes[$i]['changetime']=($sql['changetime']);
		$server_changes[$i]['tab']=($sql['tab_order']);
		$server_changes[$i]['old_id']=($sql['old_id']);
		$server_changes[$i]['user_id']=($sql['user_id']);
		$server_changes[$i]['lsync']=($now_time);
		$server_changes[$i]['s']=($sql['s']);
		$server_changes[$i]['del']=($sql['del']);

		$sqlnews4 = "UPDATE  `tree` SET old_id = '0' WHERE  `tree`.`id` =".$sql['id']."; ";
//		echo "!".$sqlnews4."!";
		$result4 = mysql_query_my($sqlnews4); 
if($show) echo "<h1>".$sqlnews4."</h1>";
		$i++;
		}


//echo '<hr>';
//echo json_encode($server_changes);
//echo '<hr>';
//Что удалять:

	$sqlnews = "SELECT * FROM `tree_sync` WHERE del=1 AND sync_id = '".$sync_id."'";
//	echo $sqlnews;
	$result = mysql_query_my($sqlnews); 
	$j=0;
	while(@$sql = mysql_fetch_array($result))
		{
		$server_need_del[$j]['command'] = "del";
		$server_need_del[$j]['id'] = $sql['id'];
		
		$sqlnews4 = "UPDATE `tree_sync` SET del = '2' WHERE `tree_sync`.`iid` =".$sql['iid']."; ";
//		echo $sqlnews4;
		$result4 = mysql_query_my($sqlnews4); 
		
		$j++;
		}

	//Кому синхронизироваться
	$sqlnews = "SELECT * FROM `tree_sync` WHERE del=5 AND sync_id = '".$sync_id."'";
//	echo $sqlnews;
	$result = mysql_query_my($sqlnews); 
	while(@$sql = mysql_fetch_array($result))
		{
		$server_need_del[$j]['command'] = "sync_all";
		$sqlnews4 = "UPDATE `tree_sync` SET del = '6' WHERE `tree_sync`.`iid` =".$sql['iid']."; ";
		$result4 = mysql_query_my($sqlnews4); 
		$j++;
		}



$answer['sync_id']=$sync_id;
$answer['client_time']=$now_time+1;
$answer['server_time']=$server_time;
$answer['changes'] = $server_changes;
$answer['need_to_confirm'] = $need_to_confirm;
$answer['need_del'] = $server_need_del;

//if($HTTP_GET_VARS['sync2']) echo $comment;

echo ( json_encode($answer) );

/*
$.getJSON("do.php?sync",function(data){
	time = new Date();
	mytime = parseInt( time.getTime()/10 ); 
	console.info(data,mytime);
	});
*/

exit;
}

if (isset($HTTP_GET_VARS['get_all_data'])) 
{
$sync_id = $HTTP_GET_VARS['get_all_data'];

$sqlnews = "SELECT *, (SELECT count(*) FROM tree WHERE user_id=".$GLOBALS['user_id']." AND parent_id = tr.id) cnt FROM tree tr WHERE user_id=".$GLOBALS['user_id']." ORDER by parent_id, position";
  $result = mysql_query_my($sqlnews); 
  $i=0;
  while (@$sql = mysql_fetch_array($result))
    {





	$len = strlen( strip_tags($sql['text']) );
	
    $br_count = (integer)($len/150);

    $i = $sql['id'];
    $answer[ $sql['parent_id'] ][$i]['id']=$i;
    
    $title = $sql['title'];
    $title = str_replace("<br>","",$title);
    $title = str_replace("\n","",$title);
    $answer[ $sql['parent_id'] ][$i]['title']=$title;
    $answer[ $sql['parent_id'] ][$i]['position']=$sql["position"];

	$text = mb_substr( strip_tags( $sql['text'] ), 0,300,'UTF-8');
    $text = $hy_ru->hyphenate($text,'UTF-8');
    $answer[ $sql['parent_id'] ][$i]['text']=$text;

//    $answer[ $sql['parent_id'] ][$i]['count']=$sql['cnt'];
    $answer[ $sql['parent_id'] ][$i]['path']=$sql['path'];
    $icon = $sql['node_icon'];
    
    if($br_count==0) $br_count='clean';
    if(($len>10) && ($len<150)) $br_count=1;
    if($br_count>6) $br_count=6;
    
    if ($icon=='')
    	{
    	$img='';
    	$class="note-clean";
    	}
    else
    	{
    	$img=$icon;
    	if($icon=='jstree/_demo/file_note.png') $img="";
    	$class="note-".$br_count; //сколько строк показывать в иконке
	    }
	    
	    $answer[ $sql['parent_id'] ][$i]['img_class']=$class;
	    $answer[ $sql['parent_id'] ][$i]['icon']=$img;
	    
	    if($sql['date1']=="0000-00-00 00:00:00") $date1 = '';
	    else $date1 = $sql['date1'];
	    
	    $answer[ $sql['parent_id'] ][$i]['date1']=$date1;

	    if($sql['date2']=="0000-00-00 00:00:00") $date2 = '';
	    else $date2 = $sql['date2'];
	    
	    $answer[ $sql['parent_id'] ][$i]['date2']=$date2;

	}
//  print_r( $answer );
	echo json_encode($answer);
}

if (isset($HTTP_GET_VARS['send_mail_to'])) 
{
$emails = $_GET['send_mail_to'];
$mytitle = $_GET['mytitle'];
$mytxt = $_POST['changes'];

$sqlnews = "SELECT * FROM tree_users WHERE id=".$GLOBALS['user_id'];
$result = mysql_query_my($sqlnews); 
@$sql = mysql_fetch_array($result);

$myname = $sql["fio"];
$mymail = $sql["email"];
$myfoto = $sql["foto"];

//echo "foto = ".$myfoto;

if(strlen($myfoto)>3) $myfoto_html = "<img style='float:left;padding-right:10px' height='45px' src='http://4tree.ru/".$myfoto."'>";
else $myfoto_html = "";

$mytxt = str_replace('src="data','src="http://4tree.ru/data',$mytxt);
$mytxt = str_replace('src="upload','src="http://4tree.ru/upload',$mytxt);

$mytxt = "<h1>".$mytitle."</h1>".$mytxt."<br><br><br><hr>".$myfoto_html."Отправитель: <b>".$myname."</b> (<a href='mailto:".$mymail."'>".$mymail."</a>)<br><font color='lightgray' size='0.9em'>это сообщение отправлено при помощи 4tree.ru — мы заботимся о ваших деревьях,
чтобы у вас оставалось время строить и воспитывать.</font><br>";

$mytitle = $mytitle." — (отправитель ".$myname.")";

require_once('Zend/Mail.php');

/*$mail = new Zend_Mail_Storage_Imap(array('host' => 'mail.4tree.ru',
										 'user'=> '4tree@4tree.ru',
										 'password' => 'uuS4foos_VE')); */

$mail = new Zend_Mail("UTF-8");
//$mail->setBodyText('My Nice Test Text');
$mail->setBodyHtml($mytxt);
$mail->setFrom('4tree@4tree.ru', $myname);
$mail->setReplyTo($mymail, $myname);

$mail->addTo($emails, $emails);

$mail->setSubject($mytitle);
$mail->send();

$answer[]=$mymail;

echo json_encode($answer);  


exit;
}


if (isset($HTTP_GET_VARS['get_all_frends'])) 
{
$sqlnews = "SELECT * FROM tree_users WHERE id=".$GLOBALS['user_id']." OR frends LIKE '%".$GLOBALS['user_id']."%' ORDER by fio";

  $result = mysql_query_my($sqlnews);   
  $i=0;
  while (@$sql = mysql_fetch_array($result))
  	{
  	$answer["frends"][$i]["user_id"] = $sql["id"];
  	$answer["frends"][$i]["fio"] = $sql["fio"];
  	$answer["frends"][$i]["email"] = $sql["email"];
  	$answer["frends"][$i]["female"] = $sql["female"];
  	
  	if(!$sql["foto"]) $foto = "img/nofoto.png";
  	else $foto = $sql["foto"];
  	
  	$answer["frends"][$i]["foto"] = $foto;
  	$i++;
  	}
  	
  $sqlnews = "SELECT * FROM tree_share WHERE host_user=".$GLOBALS['user_id']." OR delegate_user=".$GLOBALS['user_id']."";
  
  $result = mysql_query_my($sqlnews);   
  $i=0;
  while (@$sql = mysql_fetch_array($result))
  	{
  	$answer["share"][$i]["tree_id"]=$sql["tree_id"];
  	$answer["share"][$i]["host_user"]=$sql["host_user"];
  	$answer["share"][$i]["delegate_user"]=$sql["delegate_user"];
  	$answer["share"][$i]["readed"]=$sql["readed"];
  	$answer["share"][$i]["parent_id_user"]=$sql["parent_id_user"];
  	$answer["share"][$i]["changetime"]=$sql["changetime"];
  	$answer["share"][$i]["block"]=$sql["block"];
  	$i++;
  	}
  	
  	
	echo json_encode($answer);  

}


function getAllChild($id)
{
global $main_array,$all_tree_id;
//  print_r( $all_tree_id );

//  $sqlnews = "SELECT * FROM tree WHERE parent_id=".$id;
//  $result = mysql_query_my($sqlnews); 
//  $share_id = "";
  
if(true)
  if(isset($all_tree_id[$id]))
	foreach ($all_tree_id[$id] as $key => $val)
  			{
		  	$main_array[] = $val;
		  	getAllChild($val);
	  		}
  
//  while (@$sql = mysql_fetch_array($result))
//  	{
//  	$main_array[] = $sql["id"];
//  	getAllChild($sql["id"]);
//  	}
  return $main_array;
}


function get_all_guest_nodes($user_id)
{
global $main_array;
//	$main_array[] = 4507;
//	$main_array[] = 4508;
}

function get_all_share_children($user_id)
{
global $main_array,$all_tree_id;

  $sqlnews = "SELECT id,parent_id FROM tree";
  $result = mysql_query_my($sqlnews); 
  while (@$sql = mysql_fetch_array($result))
  	{
  	$all_tree_id[$sql["parent_id"]][] = $sql["id"];
  	}


  $sqlnews = "SELECT * FROM tree_share WHERE host_user=".$user_id." OR delegate_user=".$user_id;
  $result = mysql_query_my($sqlnews); 
  $share_id = "";
  
  $main_array = "";
  
  while (@$sql = mysql_fetch_array($result))
  	{
  	$main_array[] = $sql["tree_id"];
  	getAllChild($sql["tree_id"]);
  	}
  	
	get_all_guest_nodes($user_id);

  $answerme = implode( ",",$main_array );
  
  if($answerme=="") $answerme = "false";

  return $answerme;
}

function sqldate($date)
{
if($date==0) return "";
return date("Y-m-d H:i:s",($date/1000));
}

if (isset($HTTP_GET_VARS['get_all_data2'])) 
{
$now_time = $HTTP_GET_VARS['get_all_data2'];

$share_ids = get_all_share_children($GLOBALS['user_id']); //все дочерние элементы, которые есть в таблице tree_share

$sync_id = $HTTP_GET_VARS['sync_id'];

$browser = $_SERVER['HTTP_USER_AGENT'];
$ip = $_SERVER['REMOTE_ADDR'];
$r_time = $_SERVER['REQUEST_TIME'];

$browser_info = $ip."\n".$browser."\n".$r_time;


$sqlnews = "SELECT * FROM tree WHERE (user_id=".$GLOBALS['user_id']." OR id IN (".$share_ids.")) AND del=0 ORDER by parent_id, position";

  $result = mysql_query_my($sqlnews); 
  $i=0;
  $sqlnews2 = "";
  while (@$sql = mysql_fetch_array($result))
    {
    
		$sqlnews2 .= "INSERT INTO  `h116`.`tree_sync` (
				`iid` ,
				`id` ,
				`user_id` ,
				`host_id` ,
				`sync_id` ,
				`lsync` ,
				`lsync_d` ,
				`changetime` ,
				`changetime_d` ,
				`title` ,
				`confirm`,
				`text`
				)
				VALUES (
				'',  '".$sql['id']."',  '".$GLOBALS['user_id']."', '".$sql['user_id']."',  '".$sync_id."',  '".$now_time."', '".sqldate($now_time)."',  '".$sql['changetime']."', '".sqldate( $sql['changetime'] )."',  '".$sql['title']."', '1', '".$browser_info."'
				); ";

	if($i>100) { $result2 = mysql_query($sqlnews2); $sqlnews2=""; } 

        
	$len = strlen( strip_tags($sql['text']) );
    $br_count = (integer)($len/150); //длина текста

    $i = $sql['id'];
    $answer[$i]['id']=$i;
    $answer[$i]['parent_id']=$sql['parent_id'];
    
    
    $title = $sql['title'];
    $answer[$i]['lsync']=(integer)$now_time;
    $answer[$i]['title']=$title;
    $answer[$i]['user_id']=$sql['user_id'];
    $answer[$i]['position']=$sql["position"];
    $answer[$i]['s']=$sql["s"];
    $answer[$i]['remind']=$sql["remind"];
    $answer[$i]['time']=(integer)$sql["changetime"];

	$text = mb_substr( strip_tags( $sql['text'] ), 0,300,'UTF-8');
    $text = $hy_ru->hyphenate($text,'UTF-8');
    $answer[$i]['text']=$sql['text'];

//    $answer[ $sql['parent_id'] ][$i]['count']=$sql['cnt'];
//    $answer[$i]['path']=$sql['path'];
    
    $icon = $sql['node_icon'];
    
    if($br_count==0) $br_count='clean';
    if(($len>10) && ($len<150)) $br_count=1;
    if($br_count>6) $br_count=6;
    
    if ($icon=='')
    	{
    	$img='';
    	$class="note-clean";
    	}
    else
    	{
    	$img=$icon;
    	if($icon=='jstree/_demo/file_note.png') $img="";
    	$class="note-".$br_count; //сколько строк показывать в иконке
	    }
	    
	    if($sql['did']=="0000-00-00 00:00:00") $did = '';
	    else $did = $sql['did'];
	    
	    $answer[$i]['tab']=$sql['tab_order'];
	    $answer[$i]['fav']=$sql['fav'];
	    $answer[$i]['del']=$sql['del'];
	    
	    $answer[$i]['img_class']=$class;
	    $answer[$i]['did']=$did;
	    $answer[$i]['icon']=$img;
	    
	    if($sql['date1']=="0000-00-00 00:00:00") $date1 = '';
	    else $date1 = $sql['date1'];
	    
	    $answer[$i]['date1']=$date1;

	    if($sql['date2']=="0000-00-00 00:00:00") $date2 = '';
	    else $date2 = $sql['date2'];
	    
	    $answer[$i]['date2']=$date2;

	}
	
if(true) { $result2 = mysql_query($sqlnews2); $sqlnews2=""; } 
	
//	echo $sqlnews2;
//  print_r( $answer );
	
	echo json_encode($answer);
}


function hightlight($text,$q)
{
//$result = mb_eregi_replace($q,"<b>".$q."</b>",$text);
$result = preg_replace("/".mb_strtoupper($q)."/i", "<b>".mb_strtoupper($q)."</b>", $text);

return $result;
}






function fixEncoding($s, $encoding = 'UTF-8') {   
    $s = @iconv('UTF-16', $encoding . '//IGNORE', iconv($encoding, 'UTF-16//IGNORE', $s)); 
    return str_replace("\xEF\xBB\xBF", '', $s);
}

function summarize($haystack, $needle, $wordLimit = 5) {

    $haystack = strip_tags(fixEncoding($haystack));
    $needle = fixEncoding($needle);
    
//    echo $haystack;
    
    // first get summary of text around key word (needle)
    $preg_safe = str_replace(" ", "\s", preg_quote($needle));

    $pattern = "/(\w*\S\s+){0,$wordLimit}\S*($preg_safe)\S*(\s\S+){0,$wordLimit}/iux";
    if (preg_match_all($pattern, $haystack, $matches)) {
        $summary = preg_replace("/".strtoupper($needle)."/iux", "<b>".strtoupper($needle)."</b>", $matches[0][0]) . '…';
    } else {
        $summary = false;
    }


	$summary = str_replace("\n"," ",$summary);

    return $summary;
}


function textswitch ($text) 
{
  $str_search = array(
  "й","ц","у","к","е","н","г","ш","щ","з","х","ъ",
  "ф","ы","в","а","п","р","о","л","д","ж","э",
  "я","ч","с","м","и","т","ь","б","ю"
  );
  $str_replace = array(
  "q","w","e","r","t","y","u","i","o","p","[","]",
  "a","s","d","f","g","h","j","k","l",";","'",
  "z","x","c","v","b","n","m",",","."
  );
  return str_replace($str_replace, $str_search,$text);
}


if (isset($HTTP_GET_VARS['search_panel'])) 
{
$q = strtolower($HTTP_GET_VARS["search_panel"]);


if(mb_strlen($q)<2) exit;

$sqlnews = "SELECT * FROM tree WHERE user_id=".$GLOBALS['user_id']." AND ((title LIKE '%".$q."%' OR text LIKE '%".$q."%' OR title LIKE '%".textswitch($q)."%' OR text LIKE '%".textswitch($q)."%'))  ORDER by level,parent_id";

  $result = mysql_query_my($sqlnews); 
  $i=0;
//  echo '<span id="calc_answer">&nbsp;</span>';
  while (@$sql = mysql_fetch_array($result))
    {
	if(strlen($sql['text'])>20)
    $icon = "true";
     else
    $icon = "false";
      
       
    $title = hightlight( $sql['title'], $q );    
	$addtitle = summarize($sql['text'],$q,20);
	if(!$addtitle) 	$addtitle = summarize($sql['text'],textswitch($q),20);
        
    $answer[$i]['id'] = $sql['id'];
    $answer[$i]['title'] = $title.' <div class="search_sample">'.$addtitle."</div>";
    $answer[$i]['hasnote'] = $icon;
    $answer[$i]['icon'] = $icon;
    
	    
	$len = strlen( strip_tags($sql['text']) );
    $br_count = (integer)($len/150);

    
	$text = mb_substr( strip_tags( $sql['text'] ), 0,300,'UTF-8');
    $text = $hy_ru->hyphenate($text,'UTF-8');
    $answer[$i]['text']=$text;

    $answer[$i]['path']=$sql['path'];
    $icon = $sql['node_icon'];
    
    if($br_count==0) $br_count='clean';
    if(($len>10) && ($len<150)) $br_count=1;
    if($br_count>6) $br_count=6;
    
    if ($icon=='')
    	{
    	$img='';
    	$class="note-clean";
    	}
    else
    	{
    	$img=$icon;
    	if($icon=='jstree/_demo/file_note.png') $img="";
    	$class="note-".$br_count; //сколько строк показывать в иконке
	    }
	    
	    $answer[$i]['img_class']=$class;
	    $answer[$i]['icon']=$img;
    
    
    
    
    
    
    
    $i++;
    
    }
       
echo json_encode($answer);

exit;
}

if (isset($HTTP_GET_VARS['diary'])) 
{
$q = strtolower($HTTP_GET_VARS["diary"]);

$q=str_replace('node_','',$q);


if(stristr($q,"week"))
  {
  $week = str_replace("week","",$q);
  
  $sqlnews = "SELECT id FROM tree WHERE user_id=".$GLOBALS['user_id']." AND title='".$week." неделя'";
  $result = mysql_query_my($sqlnews); 
  @$sql = mysql_fetch_array($result);
  $q = $sql['id'];
  echo "<path2><span style='font-size:19px;color:yellow;font-weight:100;'>Н е д е л я  № $week</span></path2>";
  
  }
else
  {
	$q = make_diary($q);
  }


echo "<mynum>$q</mynum>";

if (!$q) return;

$sqlnews = "SELECT text FROM tree WHERE user_id=".$GLOBALS['user_id']." AND id=".$q;
  $result = mysql_query_my($sqlnews); 
  $i=0;
  while (@$sql = mysql_fetch_array($result))
    {
    echo $sql['text'];
    }

exit;
}



if (isset($HTTP_GET_VARS['add_pomidor'])) 
{
$time = strftime("%d.%m.%G",time());
$q = make_diary($time);

$sqlnews = "SELECT text FROM tree WHERE user_id=".$GLOBALS['user_id']." AND id=".$q;
$result = mysql_query_my($sqlnews); 
@$sql = mysql_fetch_array($result);

if(!(stristr($sql['text'],'pomidor'))) $br = "<hr>";
else $br="";


$newtext = '<img src="img/pomidor.png" title="25 минут непрерывной работы">'.$br.$sql['text'];

$sqlnews = "UPDATE tree SET text = '$newtext' WHERE user_id=".$GLOBALS['user_id']." AND id=".$q;
$result = mysql_query_my($sqlnews); 


echo 'добавляю помидор '.$q;
exit;
}





function make_diary($mydate)
{
$quartil = array(1,1,1,2,2,2,3,3,3,4,4,4);
$weekname = array('воскресение','понедельник','вторник','среда','четверг','пятница','суббота');
$monthname = array('январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь');

$weather = array('зима','зима','весна','весна','весна','лето','лето','лето','осень','осень','осень','зима');


$d = strtotime($mydate);

$mydate = explode('.',$mydate);

$year = $mydate[2];
$quart = $quartil[(int)$mydate[1]-1];
$month = $mydate[1];
$mymonthname = $monthname[(int)$month-1];
$week = date('w',$d);
$week_num = (int)date('W',$d);
$day = $mydate[0];

$num_day = (int)(-(strtotime('01.01.'.$year.' 00:00:01')-$d)/3600/24);

$fulldate = $day.'.'.$month.'.'.$year.' - '.$weekname[$week]." (".$num_day.")";

$path = array($year.' год', $quart.' квартал', $mymonthname.' ('.$weather[(int)$month-1].')', $week_num.' неделя',$fulldate);

$answer = make_tree_path($path);


return $answer;
}

function make_tree_path($path)
{
require_once("config.php");

$jstree = new json_tree();

$parent=find_or_create($jstree,'_ДНЕВНИК','drive',1,4);


//проверить наличие _Дневник (без регистра), если нет, создать
//родителя зафиксировать в переменной

$path2 = "";
$element = 'Дневник';

for($i=0;$i<count($path);$i++)
	{
	$path2 .= $element.'→';
	$element = $path[$i];
	$parent = find_or_create($jstree,$element,'default',$parent,0);
	//проверить наличие $element у родителя, если есть, записать pid в переменной
	//если нет, создать и записать pid в переменной
	
	}

  echo "<path>$path2<br><b>$element</b></path>";
  echo "<path2>$element</path2>";
	
  return $parent;
}


function find_or_create($jstree,$folder,$type,$parent,$pos)
{
  $sqlnews="SELECT id FROM `tree` WHERE user_id=".$GLOBALS['user_id']." AND title='$folder' AND parent_id='".$parent."'";
  
  $result = mysql_query_my($sqlnews); 
  @$sql = mysql_fetch_object ($result);

  if(!$sql->id)
    {
	$id=$jstree->create_node(array("id"=>$parent,"position"=>$pos,"type"=>"$type","title"=>"$folder"));
	$answer = json_decode($id);
	$id = $answer->id;
	}
  else
    {
    $id=$sql->id; 
    }

	return $id;
}




//Прислали текст из контекстного меню расширения
if (isset($HTTP_GET_VARS['newtext'])) 
{
$text = '<h4>'.$_POST['title'].'</h4><a href="'.$_POST['url'].'">'.$_POST['url'].'</a><hr>'.$_POST['text'];

$jstree = new json_tree();

//setcookie('fpk_id',11,time()+60*60*24*60);

  $sqlnews="SELECT id FROM `tree` WHERE user_id='$user_id' AND type='drive' AND title='_НОВОЕ'";
  $result = mysql_query($sqlnews); 
  @$sql = mysql_fetch_object ($result);

$text = str_replace("script>","scr>",$text);
 
$dd = $jstree->create_node(array("id"=>$sql->id,"position"=>0,"title"=>mysql_real_escape_string($_POST['title']),"date1"=>"","date2"=>"","remind"=>$startdate,"text"=>$text));

echo 'dd='.$dd.' id='.$sql->id.' fpk_id='.$fpk_id;

exit;
}



if (isset($HTTP_GET_VARS['parse'])) 
{
echo parsedate($HTTP_GET_VARS['parse']);
exit;
}

if (isset($HTTP_GET_VARS['settings'])) 
{
	$leaf = $HTTP_GET_VARS['settings'];
	
	if ($leaf == '1')
	   	{
	   	$title = 'Основные настройки';
	   	}

	if ($leaf == '2')
	   	{
	   	$title = 'Сервис';
	   	}

	if ($leaf == '3')
	   	{
	   	$title = 'Горячие клавиши';
	   	}
	   	
		echo '<h1>'.$title.'<span id="leaf_close" toshow="cont"></span></h1>';
		echo '<div class="leaf_space"></div>';

	$sqlnews = "SELECT * FROM tree_settings WHERE leaf='".$leaf."' ORDER by myorder";
	$result = mysql_query_my($sqlnews); 
	while(@$sql = mysql_fetch_object ($result))
		{
		echo '<div class="section">';
		if ($sql->type=='checkbox') echo '<input style="width:auto !important; margin-right:-5px;" type="checkbox" "'.$sql->value.'">';
		else echo '<div class="clearboth"></div>';

		echo '<label>'.$sql->fullname;
		if($sql->text!='') echo '<div class="tip">'.$sql->text.'</div>';
		echo '</label>';
				
		if(($sql->type=='textfield') OR ($sql->type=='email') ) 
		  {
		  echo '<br><input value="'.$sql->value.'" placeholder="'.$sql->placeholder.'"><i class="'.$sql->icon.'"></i><br>';
		  }


		echo '</div>';
		if ($sql->need_hr=='1') echo '<div class="myhr"></div>';

		}


	exit;
}

if (isset($HTTP_GET_VARS['leaf_count'])) 
{ 

 for($i=1;$i<=6;$i++)
   	{
   	$sqlnews2 = '';
   	
   	if($i==1) $sqlnews = "SELECT COUNT(*) cnt FROM `tree` WHERE user_id=$user_id;";

   	if($i==2) 
   	  {
	  $sqlnews="SELECT COUNT(*) cnt FROM `tree` WHERE user_id=$user_id AND date1 LIKE '".date("Y-m-d",time())."%' AND date1!='0000-00-00 00:00:00' AND did = '0000-00-00 00:00:00' ORDER by date1;";

	  $sqlnews2="SELECT COUNT(*) cnt FROM `tree` WHERE user_id=$user_id AND date1 LIKE '".date("Y-m",time())."%' AND date1!='0000-00-00 00:00:00' AND did = '0000-00-00 00:00:00' ORDER by date1;";
   	  }

   	if($i==3) 
   	  {
	$sqlnews="SELECT COUNT(*) cnt  FROM `tree` WHERE user_id=$user_id AND did LIKE '".date("Y-m-d",time())."%' ORDER by date1;";

	$sqlnews2="SELECT COUNT(*) cnt  FROM `tree` WHERE user_id=$user_id AND did LIKE '".date("Y-m",time())."%' ORDER by date1;";
   	  }

   	if($i==4) 
   	  {
	$sqlnews="SELECT COUNT(*) cnt FROM `tree` WHERE user_id=$user_id AND date1 LIKE '".date("Y-m-d",time())."%' AND date1<=NOW() AND date1!='0000-00-00 00:00:00' AND did = '0000-00-00 00:00:00' ORDER by date1;";

	$sqlnews2="SELECT COUNT(*) cnt FROM `tree` WHERE user_id=$user_id AND date1<=NOW() AND date1!='0000-00-00 00:00:00' AND did = '0000-00-00 00:00:00' ORDER by date1;";
   	  }

   	if($i==5) 
   	  {
	$sqlnews="SELECT COUNT(*) cnt FROM `tree` WHERE user_id=$user_id AND adddate LIKE '".date("Y-m-d",time())."%' ORDER by date1;";

	$sqlnews2="SELECT COUNT(*) cnt FROM `tree` WHERE user_id=$user_id AND adddate LIKE '".date("Y-m",time())."%' ORDER by date1;";
   	  }
   	  
   	if($i==6)
   	  {
	  $sqlnews="SELECT 0 cnt FROM `tree`;";
   	  }
   	  

	$result = mysql_query_my($sqlnews); 
	@$sql = mysql_fetch_object ($result);
	$cnt1 = $sql->cnt;

	$result2 = mysql_query_my($sqlnews2); 
	@$sql2 = mysql_fetch_object ($result2);
   	if($sqlnews2 != '') $cnt2 = ' ('.$sql2->cnt.')';
   	else $cnt2 = '';
   	
	$js[$i]['amount'][0] = $cnt1.$cnt2;
	}
 
 echo json_encode($js); 	
 
exit;
}


function leafsqlnews($leaf,$flag)
{
global $user_id;

if($flag==0) $cnt = '*';
if($flag==1) $cnt = 'count(*) cnt';

if($leaf==1)
	{
	$title = "Ближайшие дела";
	$sqlnews="SELECT $cnt FROM `tree` WHERE user_id=$user_id AND (date1>=(NOW() - INTERVAL 365 DAY) AND date1<=(NOW() + INTERVAL 3 DAY)) AND did = '0000-00-00 00:00:00' ORDER by date1;";
	}

if($leaf==2)
	{
	$title = "Просроченные дела";
	$sqlnews="SELECT $cnt FROM `tree` WHERE user_id=$user_id AND date1<=NOW() AND date1!='0000-00-00 00:00:00' AND did = '0000-00-00 00:00:00' ORDER by date1;";
	}

if($leaf==3)
	{
	$title = "Дела на сегодня";
	$sqlnews="SELECT $cnt FROM `tree` WHERE user_id=$user_id AND date1 LIKE '".date("Y-m-d",time())."%' AND date1!='0000-00-00 00:00:00' AND did = '0000-00-00 00:00:00' ORDER by date1;";
	}

if($leaf==4)
	{
	$title = "Дела на завтра";
	$sqlnews="SELECT $cnt FROM `tree` WHERE user_id=$user_id AND date1 LIKE '".date("Y-m-d",strtotime('+ 1 day',time()))."%' AND date1!='0000-00-00 00:00:00' AND did = '0000-00-00 00:00:00' ORDER by date1;";
	}

if($leaf==5)
	{
	$title = "Все будущие дела";
	$sqlnews="SELECT $cnt FROM `tree` WHERE user_id=$user_id AND date1>=NOW() AND date1!='0000-00-00 00:00:00' AND did = '0000-00-00 00:00:00' ORDER by date1;";
	}

if($leaf==6)
	{
	$title = "Все выполненные дела";
	$sqlnews="SELECT $cnt FROM `tree` WHERE user_id=$user_id AND did != '0000-00-00 00:00:00' ORDER by date1 DESC;";
	}

if($leaf==7)
	{
	$title = "Все выполненные вчера дела";
	$sqlnews="SELECT $cnt FROM `tree` WHERE user_id=$user_id AND did LIKE '".date("Y-m-d",strtotime('- 1 day',time()))."%'  ORDER by date1 DESC;";
	}

if($leaf==8)
	{
	$title = "Все дела выполненные сегодня";
	$sqlnews="SELECT $cnt FROM `tree` WHERE user_id=$user_id AND did LIKE '".date("Y-m-d",time())."%' ORDER by date1 DESC;";
	}

if($leaf==9)
	{
	$title = "Сортировка по дате добавления";
	$sqlnews="SELECT $cnt FROM `tree` WHERE user_id=$user_id ORDER by adddate DESC,id DESC;";
	}

$d[0] = $sqlnews;
$d[1] = $title;

return $d;
}

if (isset($HTTP_GET_VARS['leaf'])) 
{
$leaf = $HTTP_GET_VARS['leaf'];

$d = leafsqlnews($leaf,0);

$sqlnews = $d[0];
$title = $d[1];

		echo '<div class="myh1">'.$title.'<span id="leaf_close" toshow="cont"></span></div>';
echo '<div class="leaf_space"></div>';

$result = mysql_query_my($sqlnews); 
while(@$sql = mysql_fetch_object ($result))
{
$text = $sql->text;

if( $sql->did != '0000-00-00 00:00:00' ) { $tt=' style="text-decoration: line-through"'; }
else $tt="";

echo '<div class="do_line" id="node_'.$sql->id.'" event="node_'.$sql->id.'" path="'.my_path($sql->id).'"><span class="rrr">'.$sql->date1.'</span><span class="text" '.$tt.'>'.$sql->title.'</span></div>';
}

echo '<br>';
echo '<br>';
echo '<br>';
exit;
}


if (isset($HTTP_GET_VARS['ext'])) 
{
$sqlnews="SELECT * FROM `tree` WHERE user_id=$user_id AND (date1>=(NOW() - INTERVAL 365 DAY) AND date1<=(NOW() + INTERVAL 3 DAY)) AND did = '0000-00-00 00:00:00' ORDER by date1;";
$result = mysql_query_my($sqlnews); 
while(@$sql = mysql_fetch_object ($result))
{
$text = $sql->text;

echo '<span class="text">'.$sql->title.'</span><span class="r">'.$sql->date1.'</span><br>';
}

exit;
}


function parsedate($text)
{
  	$did = false; $week_day=''; $week_date='';
  	$matches2 = 0;
  	//часы минуты 8:30 8ч 30м===============================================================
  	$shablon = "/(\d{1,2}ч|\d{1,2} ч)|(\d{2} м)|(\d{2}м)|(\d{1,2} \d{2}м)|([^,]\d{1,2} \d{2}[^\s\d])|(в \d{})|(в\d{1,2})|(\d{1,2}:\d{1,2})/";
  	preg_match_all($shablon,$text,$matches);
  	$answer = implode(' ',$matches[0]);
	//выцепляем цифры
  	preg_match_all("/\d{1,2}/",$answer,$matches2);
  	$answer = implode(':',$matches2[0]);
  	
  	$shablon = "/(дней|лет|нед|год|мес|день|дня|час)/";
  	if((stristr($text,'через')) AND (preg_match_all($shablon,$text,$matches)==0)) 
  	   { 
  	   $shablon = "/(\d{1,2}ч)|(\d{1,2} ч)/";
//  	   if (preg_match_all($shablon,$text,$matches)>0) echo $i.' '.$answer.'br';
  	   
  	   if($matches[0][0]=='час') $answer=''; $answer = '+ '.str_replace(':',' hours ',$answer).' minute'; $did=true; 
  	   }

  	$shablon = "/(час)/";
  	if((stristr($text,'через')) AND (preg_match_all($shablon,$text,$matches)==0)) 
  	   { 
//  	   if($matches[0][0]=='час') $answer=''; $answer = '+ '.str_replace(':',' hours ',$answer).' minute'; $did=true; 
  	   }

  	
  	if(count($matches2[0])==1)
  	  {
  	  //если не указаны минуты или часы
  	  if (preg_match_all("/(\d{1,2}м)|(\d{1,2} м)/",$text,$matches)>0)
  	     {
  	     //это минуты
  	     $answer = '+'.$matches2[0][0].' min';
  	     if(stristr($text,'через')) $did=true;
  	     }
  	  else
  	  	 {
  	  	 //это часы
		  	$shablon = "/(час)/";
		 if((stristr($text,'через')) AND (preg_match_all($shablon,$text,$matches)>0)) $answer='';
		  	else
  	     $answer = $matches2[0][0].':00';
  	  	 }
  	  }
  	//завтра===============================================================
  	$shablon = "/послезавтра/";
  	if (preg_match_all($shablon,$text,$matches)>0) 
  	   {
  	   $answer = $answer.' +2 day';
  	   $did = true; //анализировать больше не надо
  	   }
  	else
  	   {
	  	$shablon = "/завтра/";
  		if (preg_match_all($shablon,$text,$matches)>0) 
  		    {
  	   		$answer = $answer.' +1 day';
  	   		$did = true;
  	   		}

	  	$shablon = "/(сейчас|срочно|немедленно|сегодня)/";
  		if ((preg_match_all($shablon,$text,$matches)>0) && ($answer==''))
  		    {
  	   		$answer = $answer.' +15 minutes';
  	   		$did = true;
  	   		}

  	   }
  	   
  	if (!$did)
  	   {
  	   //Если указан день недели//////////////////////////////////////////////
  	   $shablon = "/(понед|вторн|сред|четв|пятн|субб|воскр)|((пн|вт|ср|чт|пт|сб|вс)[^а-я])/";
	   if (preg_match_all($shablon,$text,$matches)>0) 
  	      {
  	      $week_day = $matches[0][0];
  	      $week_ans = str_replace(array("понед","вторн","сред","четв","пятн","субб","воскр"),array('monday','tuesday','wednesday','thursday','friday','saturday','sunday'),$week_day);
  	      $week_ans = str_replace(array("пн","вт","ср","чт","пт","сб","вс"),array('monday','tuesday','wednesday','thursday','friday','saturday','sunday'),$week_ans);
  	      $answer = $week_ans.' '.$answer;
  	      $did = true;
  	      }
  	      
  	   $shablon = "/через (\d{1,} ..|нед|год|мес|день|дня)/";
	   if (preg_match_all($shablon,$text,$matches)>0) 
  	      {
  	      $week_day = $matches[0][0];
  	      $week_ans = str_replace(array("через","нед","год","мес","день","дня","дн","д","н","л","м","г","ч"),
  	      						  array('','week','year','month','day','day','day','day','week','year','month','year',"hour"),$week_day);
  	      $answer = $answer.' + '.$week_ans;
  	      $did = true;
  	      }

  	   $shablon = '/(\d{1,2}(.|\s|-|\/)\d{1,2}(.|\s|-|\/)\d{4})/';
	   if (preg_match_all($shablon,$text[$i],$matches)>0) 
  	      {
  	      $week_date = implode('.',$matches[0]);
  	      $answer = $answer.' '.$week_date;
  	      $did = true;
  	      }
  	      
  	      
  	      
  	   }
  	
  	
  	$time = strtotime($answer,time()+2*60*60);
  	if($time)
  		{
 	  	$time = strftime("%G-%m-%d %H:%M:00",$time);
 	  	}
  	
  	
	return $time;

}


if (isset($HTTP_GET_VARS['datetext'])) 
{
echo "<FORM method='POST' action='do.php?mes=2'>";

echo '<p><input type="text" name="phone"></p>
	<p><input type="text" name="mes"></p>
  <p><input type="submit" value="Отправить"></p>';

echo "<FORM>";
exit;
}



if (isset($HTTP_POST_VARS['current_tab'])) 
{
$sqlnews="UPDATE `tree_users` SET `cookie` = '".json_encode($_POST)."' WHERE id=$user_id";
echo $sqlnews;
$result = mysql_query_my($sqlnews); 
@$sql = mysql_fetch_object ($result);
print_r($_POST);
exit;
}

if (isset($HTTP_GET_VARS['getcookie'])) 
{
$sqlnews="SELECT `cookie` FROM `tree_users` WHERE id=$user_id";
$result = mysql_query_my($sqlnews); 
@$sql = mysql_fetch_object ($result);
echo $sql->cookie;

exit;
}

//http://localhost/fpk/990990/do.php?createdo=test&start=Thu%2C%2009%20Aug%202012%2007%3A00%3A00%20GMT&end=Thu%2C%2009%20Aug%202012%2009%3A30%3A00%20GMT&allday=false&manager=null
if (isset($_GET['createdo'])) 
{
require_once("config.php");

  $start = explode("GMT",$HTTP_GET_VARS['start']);
  $end = explode("GMT",$HTTP_GET_VARS['end']);

  $startdate=date("Y-m-d H:i:s",strtotime($start[0]));
  $enddate=date("Y-m-d H:i:s",strtotime($end[0]));

	echo $HTTP_GET_VARS['start'].'<hr>';
	echo $start[0].' - '.$startdate;

$jstree = new json_tree();


  $sqlnews="SELECT count(*) cnt FROM `tree` WHERE user_id=".$GLOBALS['user_id']." AND title='_НОВОЕ'";
  $result = mysql_query_my($sqlnews); 
  @$sql = mysql_fetch_object ($result);

  if($sql->cnt==0)
		$jstree->create_node(array("id"=>1,"position"=>0,"type"=>"drive","title"=>"_НОВОЕ"));

  $sqlnews="SELECT id FROM `tree` WHERE user_id=".$GLOBALS['user_id']." AND type='drive' AND title='_НОВОЕ'";
  $result = mysql_query_my($sqlnews); 
  @$sql = mysql_fetch_object ($result);

if ($HTTP_GET_VARS['start']=='') $startdate = '';
 
$jstree->create_node(array("id"=>$sql->id,"position"=>0,"title"=>$_GET["createdo"],"date1"=>$startdate,"date2"=>$enddate));

exit;
}




/**
 * @version 0.1
 * @author recens
 * @license GPL
 * @copyright Гельтищева Нина (http://recens.ru)
 */

/**
* Масштабирование изображения
*
* Функция работает с PNG, GIF и JPEG изображениями.
* Масштабирование возможно как с указаниями одной стороны, так и двух, в процентах или пикселях.
*
* @param string Расположение исходного файла
* @param string Расположение конечного файла
* @param integer Ширина конечного файла
* @param integer Высота конечного файла
* @param bool Размеры даны в пискелях или в процентах
* @return bool
*/
function resize($file_input, $file_output, $w_o, $h_o, $percent = false) {
	list($w_i, $h_i, $type) = getimagesize($file_input);
	if (!$w_i || !$h_i) {
		echo 'Невозможно получить длину и ширину изображения';
		return;
    }
    $types = array('','gif','jpeg','png');
    $ext = $types[$type];
    if ($ext) {
    	$func = 'imagecreatefrom'.$ext;
    	$img = $func($file_input);
    } else {
    	echo 'Некорректный формат файла';
		return;
    }
	if ($percent) {
		$w_o *= $w_i / 100;
		$h_o *= $h_i / 100;
	}
	if (!$h_o) $h_o = $w_o/($w_i/$h_i);
	if (!$w_o) $w_o = $h_o/($h_i/$w_i);
	$img_o = imagecreatetruecolor($w_o, $h_o);
	imagecopyresampled($img_o, $img, 0, 0, 0, 0, $w_o, $h_o, $w_i, $h_i);
	if ($type == 2) {
		return imagejpeg($img_o,$file_output,100);
	} else {
		$func = 'image'.$ext;
		return $func($img_o,$file_output);
	}
}

/**
* Обрезка изображения
*
* Функция работает с PNG, GIF и JPEG изображениями.
* Обрезка идёт как с указанием абсоютной длины, так и относительной (отрицательной).
*
* @param string Расположение исходного файла
* @param string Расположение конечного файла
* @param array Координаты обрезки
* @param bool Размеры даны в пискелях или в процентах
* @return bool
*/
function crop($file_input, $file_output, $crop = 'square',$percent = false) {
	list($w_i, $h_i, $type) = getimagesize($file_input);
	if (!$w_i || !$h_i) {
		echo 'Невозможно получить длину и ширину изображения';
		return;
    }
    $types = array('','gif','jpeg','png');
    $ext = $types[$type];
    if ($ext) {
    	$func = 'imagecreatefrom'.$ext;
    	$img = $func($file_input);
    } else {
    	echo 'Некорректный формат файла';
		return;
    }
	if ($crop == 'square') {
		if ($w_i > $h_i) {
			$x_o = ($w_i - $h_i) / 2;
			$min = $h_i;
		} else {
			$y_o = ($h_i - $w_i) / 2;
			$min = $w_i;
		}
		$w_o = $h_o = $min;
	} else {
		list($x_o, $y_o, $w_o, $h_o) = $crop;
		if ($percent) {
			$w_o *= $w_i / 100;
			$h_o *= $h_i / 100;
			$x_o *= $w_i / 100;
			$y_o *= $h_i / 100;
		}
    	if ($w_o < 0) $w_o += $w_i;
	    $w_o -= $x_o;
	   	if ($h_o < 0) $h_o += $h_i;
		$h_o -= $y_o;
	}
	$img_o = imagecreatetruecolor($w_o, $h_o);
	imagecopy($img_o, $img, 0, 0, $x_o, $y_o, $w_o, $h_o);
	if ($type == 2) {
		return imagejpeg($img_o,$file_output,100);
	} else {
		$func = 'image'.$ext;
		return $func($img_o,$file_output);
	}
}



function open_https_url($url,$refer = "",$usecookie = false) { 
    $ch = curl_init(); 
    curl_setopt($ch, CURLOPT_URL, $url); 
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE); 
    curl_setopt($ch, CURLOPTё_SSL_VERIFYHOST, 2); 
    curl_setopt($ch, CURLOPT_HEADER, 0); 
    curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.0)"); 
    if ($refer != "") { 
        curl_setopt($ch, CURLOPT_REFERER, $refer ); 
    } 
    curl_setopt($ch, CURLOPT_RETURNTRANSFER,1); 
	$result =curl_exec ($ch); 
	curl_close ($ch); 
	return $result; 
}


function parsenote($q,$text)
{
require_once 'dom/simple_html_dom.php';

$n = 105000;
// загружаем данный URL
$data = str_get_html($text);

// очищаем страницу от лишних данных, это не обязательно, но когда HTML сильно захламлен бывает удобно почистить его, для дальнейшего анализа
//foreach($data->find('script,link,comment') as $tmp)$tmp->outertext = '';


// находим все изображения на странице
if(count($data->find('img'))){
	$i = 0; $first=1;
	foreach($data->find('img') as $img){
		$i++;
		$name = explode('/',$img->src);
		$name = $name[count($name)-1];
//		if(substr($img->src,0,5)=="data/") { $icon = $img->src; continue; }
//		if(substr($img->src,0,5)=="uploa") continue;
//		if(substr($img->src,0,5)=="./upl") continue;
			
		$ext = explode('.',$name);
		$name = $ext[0];
		$ext = $ext[count($ext)-1];
		$ext = str_replace('\"','',$ext);
		$ext2=$ext[0].$ext[1].$ext[2];
	
	if ((stristr('png,jpg,jpeg,gif',$ext2)) OR (stristr($ext,'images?')))
		{
		// выводим на экран изображение <img height="50px" src="'.$img->src.'"/> '.
		// и скачиваем его в файл
		mkdir("data/u".$GLOBALS['user_id'],0777);
		mkdir("data/u".$GLOBALS['user_id']."/".$q,0777);
//		echo "data/u".$GLOBALS['user_id']."/".$q;
//		mkdir("data/".$q."/mini",0777);
		
		$newname = 'data/u'.$GLOBALS['user_id']."/".$q.'/'.($i).'_'.$name.'.'.$ext2;
		
//		echo $newname."<hr>";
		
		if(stristr($ext,'images?'))
		  {
			$rand = "";		  	
			$newname = 'data/u'.$GLOBALS['user_id']."/".$q.'/'.($i).'_googlepic_'.$rand.'.jpg';
		  }
		
		$img->src = str_replace('"','',$img->src);
		$img->src = str_replace('\\','',$img->src);
				
		if($i==1) $icon = $newname;		
				
		if(!file_exists($img->src) AND !stristr($img->src,"/mail/"))
			{
			$contents = file_get_contents($img->src);
			$width=50;
			$height=50;
			if(strlen($contents)>0)
			 	{
				file_put_contents($newname,$contents);
//				echo $newname."???";
				$data = str_replace($img->src,$newname,$data); //заменяю в статье все картинки на скаченные
//				$data = str_replace("'",'"',$data); //quote
			
				if( ($first==1) AND (false) )
	    		  {
				list($w, $h) = getimagesize($newname); // получаем размеры изображения
					if ($w < $h) { // если ширина меньше высоты
						 resize($newname,$newname_mini,$width,0); // уменьшаем по ширине
						 } else { // иначе
					 	resize($newname,$newname_mini,0,$height); //уменьшаем по высоте
						}
//				crop($newname_mini,$newname_mini,array(0,0,$width,$height)); // и обрезаем			
	    		  $first=0;
	    		  }
				if($i==1)  $icon = $newname; //определяю путь до иконки
			 	}
			
			}
		else
			{ //если файл уже существует
			if($i==1) { $icon = $img->src; $first=0; }
			$newname = $img->src;
//			$data = str_replace($img->src,$newname,$data); //заменяю в статье все картинки на скаченные
			$data = str_replace("'",'"',$data);
			}

		
		}
		if($i>$n)break; // выходим из цикла если скачали достаточно фотографий
	} //each
	
} //if count(img)
else
{
//Изображений нет
$icon='';
}

		//		  echo "!!!".$icon."!!!";

//echo '<b>'.$icon.'</b>';

return array($data,$icon);

}















if (isset($HTTP_GET_VARS['check_it'])) 
 {
 $id = (int)str_replace("node_","",$HTTP_GET_VARS['check_it']);

 $sqlnews="UPDATE `tree` SET did = NOW() WHERE user_id=".$GLOBALS['user_id']." AND id=".$id." LIMIT 1";
  
  $result = mysql_query_my($sqlnews); 
  
 exit;
 }

if (isset($HTTP_GET_VARS['uncheck_it'])) 
 {
 $id = (int)str_replace("node_","",$HTTP_GET_VARS['uncheck_it']);

 $sqlnews="UPDATE `tree` SET did = '0000-00-00 00:00:00' WHERE user_id=".$GLOBALS['user_id']." AND  id=".$id." LIMIT 1";
  
  $result = mysql_query_my($sqlnews); 

 exit;
 }


if (isset($HTTP_GET_VARS['date_to_do'])) 
 {
 $id = str_replace("node_","",$HTTP_GET_VARS['date_to_do']);
 $newtime2 = $HTTP_GET_VARS['date1'];

  $sqlnews="UPDATE `tree` SET date1 = '".$newtime2."' WHERE user_id=".$GLOBALS['user_id']." AND id=".$id." LIMIT 1";
  
  $result = mysql_query_my($sqlnews); 
  
  echo $newtime2;

 exit;
 }

if (isset($HTTP_GET_VARS['delete_date'])) 
 {
  $id = (int)$HTTP_GET_VARS['delete_date'];
  $sqlnews="UPDATE `tree` SET date1 = '0000-00-00 00:00:00' WHERE user_id=".$GLOBALS['user_id']." AND id=".$id." LIMIT 1";
  
  $result = mysql_query_my($sqlnews); 

 exit;
 }


if (isset($HTTP_GET_VARS['movedo'])) 
 {
//$('#bubu').load("do.php?movedo="+event.id+"&days="+delta+"&minutes="+minutedelta, function ()  
  $sqlnews="SELECT * FROM `tree` WHERE user_id=".$GLOBALS['user_id']." AND id=".$HTTP_GET_VARS['movedo'];
  $result = mysql_query_my($sqlnews); 
  @$sql = mysql_fetch_object ($result);
    
  $time = gmstrtotime($sql->date2)+$HTTP_GET_VARS['days']*24*60*60+$HTTP_GET_VARS['minutes']*60;
  $time2 = gmstrtotime($sql->date1)+$HTTP_GET_VARS['days']*24*60*60+$HTTP_GET_VARS['minutes']*60;
    
  if ($HTTP_GET_VARS['allday']==0) $newtime2 = gmdate("Y-m-d H:i:s",($time2));
  else  $newtime2 = gmdate("Y-m-d 00:00:00",($time2));
  
  if ($sql->date2 == '0000-00-00 00:00:00') $newtime = $sql->date2 ;
  
  
//  $newtime2 = gmdate("Y-m-d H:i:s",($time2));
  
//  echo $newtime;

  $sqlnews="UPDATE `tree` SET date2 = '".$newtime."', date1 = '".$newtime2."' WHERE user_id=".$GLOBALS['user_id']." AND id=".$HTTP_GET_VARS['movedo']." LIMIT 1";
  
  $result = mysql_query_my($sqlnews); 
  
  echo $newtime2;
  
//  echo "Перемещено дело №".$HTTP_GET_VARS['movedo'];
  
  
 exit;
 }



if (isset($HTTP_GET_VARS['load'])) 
{
$q = strtolower($_GET["load"]);
$q=str_replace('node_','',$q);
if (!$q) return;

$sqlnews = "SELECT date1,date2 FROM tree WHERE user_id=".$GLOBALS['user_id']." AND id=".$q;

  $result = mysql_query_my($sqlnews); 
  $i=0;
  while (@$sql = mysql_fetch_array($result))
    {
    $answer['info']['date1']=$sql['date1'];
    $answer['info']['date2']=$sql['date2'];
    }
  echo json_encode($answer);
exit;
}

if (isset($HTTP_GET_VARS['mytabs_order'])) 
{
$order = $HTTP_GET_VARS['mytabs_order'];

    $order = explode(",", $order);
    for ($i=0; $i<count($order)-1; $i++) {
    	  //echo $i.' - '.$order[$i].'<hr>';
    	  $ord = $i+1;
    	  
		  if ($order[$i] != 1) 
		     {
			  $sqlnews = "UPDATE tree SET tab_order = '".$ord."' WHERE id = '".$order[$i]."'";
			  //echo $sqlnews;
		      $result = mysql_query_my($sqlnews); 
		     }
    	}
echo 'ok - '.$i;

exit;
}

function make_short_text($text,$length)
{
$length_text = mb_strlen($text,'UTF-8');

$narrow = mb_substr_count($text,"!",'UTF-8');
$narrow += mb_substr_count($text,"|",'UTF-8');
$narrow += mb_substr_count($text,"(",'UTF-8');
$narrow += mb_substr_count($text,"?",'UTF-8');
$narrow += mb_substr_count($text,")",'UTF-8');
$narrow += mb_substr_count($text,"i",'UTF-8');
$narrow += mb_substr_count($text,"I",'UTF-8');
$narrow += mb_substr_count($text,"l",'UTF-8');
$narrow += mb_substr_count($text,".",'UTF-8');
$narrow += mb_substr_count($text,",",'UTF-8');

$length=$length+(float)$narrow/1.5; //узкие символы

if( $length_text>($length+3) )
	{
	$f_l = ((float)$length*0.6);
	$f_r = $length-$f_l;
	
	$first = mb_substr($text,0,$f_l,'UTF-8');
	$last = mb_substr($text,$length_text-$f_r,$length_text,'UTF-8');
	$text = $first.'<font style="font-size:0.8em">...</font>'.$last;
	}

return $text;
}

if (isset($HTTP_GET_VARS['panel_tabs'])) 
{
	$tabs =  "<ul>";


	$sqlnews = "select * from tree tr2 where  user_id=".$GLOBALS['user_id']." AND (title COLLATE  utf8_bin) LIKE Upper(title) AND ((title COLLATE  utf8_bin) NOT LIKE LOWER(title)) AND did='0000-00-00 00:00:00' ORDER by tab_order,title";

  	$result = mysql_query_my($sqlnews); 

	
    $tabs .= "<li>Все</li>";
  while (@$sql = mysql_fetch_array($result))
    {
    $title = make_short_text($sql['title'],20);
    
    $tabs .= "<li myid='".$sql['id']."' path='".my_path($sql['id'])."'>".$title."</li>";
    }
    
	$tabs .= "</ul>";

	echo $tabs;
	exit;
}


if (isset($HTTP_GET_VARS['mytabs'])) 
{
 
 $sqlnews = "select count(*) cnt FROM tree WHERE  user_id=".$GLOBALS['user_id']." AND did='0000-00-00 00:00:00'";
  $result = mysql_query_my($sqlnews); 
  @$sql2 = mysql_fetch_array($result);

$sqlnews = "select *, (SELECT count(*) CNT FROM tree tr WHERE user_id=".$GLOBALS['user_id']." AND did='0000-00-00 00:00:00' AND tr.left>=tr2.left AND tr.right<=tr2.right AND tr.id!=tr2.id) CNT from tree tr2 where  user_id=".$GLOBALS['user_id']." AND (title COLLATE  utf8_bin) LIKE Upper(title) AND ((title COLLATE  utf8_bin) NOT LIKE LOWER(title)) AND did='0000-00-00 00:00:00' ORDER by tab_order,title";

  $result = mysql_query_my($sqlnews); 

  echo '<ul id="tabs">';

    if ($HTTP_GET_VARS['mytabs']==1) $current = 'current';
	else $current = '';

  echo '	<li id="'.$current.'"><a myid="1" href="#" title="tab1" focus_node="1">ВСЕ&nbsp;&nbsp;'.' <span class="tabs_count">'.$sql2['cnt'].'</span></a></li>';

  
  while (@$sql = mysql_fetch_array($result))
    {
    if ($sql['id']==$HTTP_GET_VARS['mytabs']) $current = 'current';
	else $current = '';
	
	$img = '<i class="icon-pin" style="margin-left:-9px;margin-top:-5px;color:red !important;"></i>';
	$img = '';
	
	$path = my_path($sql['id']);
	//
	
	echo '	<li id="'.$current.'"><a  title="'.$sql['title'].'" href="#" title="tab'.$sql['id'].'" myid = "'.$sql['id'].'" focus_node="'.$sql['parent_id'].'" path="'.$path.'"><span class="tab_inside">'.$img.'<span class="ff">'.$sql['title'].'</span> </span><span class="tabs_count">'.$sql['CNT'].'</span></a></li>';
    }

	echo '</ul>';
exit;
}

function my_path($id)
{
  $jstree = new json_tree();
  //поиск родителя
	
	$child = $jstree->_get_path($id);
	
	$child = array_keys($child);
	
	$path='';
	for($i=0; $i<count($child); $i++)
		{
		$path .= $child[$i];
		if ($i!=count($child)-1) $path .= ',';
		}
return $path;
}

if (isset($HTTP_GET_VARS['save_blob'])) 
{
$today = date("m-Y"); 

$uploads_dir = "data/u".$GLOBALS['user_id']."/".$today."";

mkdir("data/u".$GLOBALS['user_id'],0777);
mkdir("data/u".$GLOBALS['user_id']."/".$today,0777);
mkdir($uploads_dir,0777);

$rnd = rand(1,9999);
$newname = $uploads_dir."/clip_".$rnd.".png";

move_uploaded_file($_FILES['file']['tmp_name'],$newname);

echo $newname;

exit;
}

if (isset($HTTP_GET_VARS['set_reminder'])) 
{
$sqlnews = "UPDATE `tree` SET remind=(date1 - INTERVAL 3 MINUTE) WHERE id = ".$_GET['set_reminder'];
$result = mysql_query_my($sqlnews); 
echo 'ok!';
exit;
}

if (isset($HTTP_GET_VARS['delete_reminder'])) 
{
$sqlnews = "UPDATE `tree` SET remind='0000-00-00 00:00:00' WHERE id = ".$_GET['delete_reminder'];
$result = mysql_query_my($sqlnews); 
echo 'ok!';
exit;
}

//Загрузка событий календаря
if (isset($HTTP_GET_VARS['calendar'])) 
{
$start = $HTTP_GET_VARS['start'];
$end = $HTTP_GET_VARS['end']+24*60*60;

//echo $start.' - '.$end.'<br>';
$startdate = date("Y-m-d",$start);
$enddate = date("Y-m-d",$end);



  $i=0;

for($d=$start; $d<=$end; $d=strtotime('+1 day',$d))
  {
  $dd = date("Y-m-d",$d);
//  echo $d.' - '.$dd.'<hr>';

  $mydate = explode('-',$dd);
  $year = $mydate[0];
  $month = $mydate[1];
  $day = $mydate[2];

//0 - внутри дня
//1 - ежедневные
//2 - понедельно
//3 - ежемесячно
//4 - ежегодно

//( SELECT * FROM tree_recurring WHERE ((`day`=08 AND `month`=10 AND `year`=2012) OR (recur_mode = '1' AND DATEDIFF( CONCAT('2012','-','10','-','08') , CONCAT(`year`,'-',`month`,'-',`day`) )  % `ndays` = 0 )) AND user_id=11 )


//Ежедневные дела
  $sqlnews = "( SELECT * FROM tree_recurring WHERE ((`day`=$day AND `month`=$month AND `year`=$year) OR (recur_mode = '1' AND DATEDIFF( CONCAT('$year','-','$month','-','$day') , CONCAT(`year`,'-',`month`,'-',`day`) ) % `ndays` = 0 )) AND user_id=".$GLOBALS['user_id']." AND DATEDIFF( CONCAT('$year','-','$month','-','$day') , CONCAT(`year`,'-',`month`,'-',`day`) )>0 )";
  
//  echo $sqlnews."<hr>";

  $sqlnews .= " UNION ";

//Еженедельные дела
  $sqlnews .= "( SELECT * FROM tree_recurring WHERE ((`day`=$day AND `month`=$month AND `year`=$year) OR (recur_mode = '2' AND WEEKDAY(CONCAT(`year`,'-',`month`,'-',`day`)) = WEEKDAY('$dd')) ) AND user_id=".$GLOBALS['user_id']." AND  DATEDIFF( CONCAT('$year','-','$month','-','$day') , CONCAT(`year`,'-',`month`,'-',`day`) )>0 )";
  
  $sqlnews .= " UNION ";

//Ежемесячные дела
  $sqlnews .= "( SELECT * FROM tree_recurring WHERE ((`day`=$day AND `month`=$month AND `year`=$year) OR (recur_mode = '3' AND DAYOFMONTH(CONCAT(`year`,'-',`month`,'-',`day`)) = DAYOFMONTH('$dd') ) ) AND user_id=".$GLOBALS['user_id']." AND DATEDIFF( CONCAT('$year','-','$month','-','$day') , CONCAT(`year`,'-',`month`,'-',`day`) )>0 )";

  $sqlnews .= " UNION ";

//Ежегодные дела
  $sqlnews .= "( SELECT * FROM tree_recurring WHERE ((`day`=$day AND `month`=$month AND `year`=$year) OR (recur_mode = '4' AND DAYOFMONTH(CONCAT(`year`,'-',`month`,'-',`day`)) = DAYOFMONTH('$dd') AND MONTH(CONCAT(`year`,'-',`month`,'-',`day`)) = MONTH('$dd')) ) AND user_id=".$GLOBALS['user_id'].' )';

//	echo $sqlnews.'<hr>';

  $result = mysql_query_my($sqlnews); 
  while (@$sql = mysql_fetch_array($result))
      {
//      echo $sql['node_id'].'<hr>';
	  if(($sql['hour']==0) AND ($sql['minute']==0))
	  	$allday = true;
	  else
	  	$allday = false;
	  $do[$i]['title']="Повтор ".$sql['node_id'];
	  $do[$i]['id']=666;
	  $do[$i]['start']=$dd.' '.$sql['hour'].':'.$sql['minute'].':00';
//	  $do[$i]['end']=$dd.' 16:00:00';
	  $do[$i]['path']='';
	  $do[$i]['allDay']=$allday;
	  
	  $i++;
	  }
  
  }


$sqlnews = "SELECT * FROM tree WHERE user_id=".$GLOBALS['user_id']." AND date1!='0000-00-00 00:00:00' AND date1 between '$startdate' AND '$enddate'";
//echo $sqlnews;

  $result = mysql_query_my($sqlnews); 
  while (@$sql = mysql_fetch_array($result))
    {
    $do[$i]['title']=$sql['title'];
    $do[$i]['id']=$sql['id'];
    $do[$i]['start']=$sql['date1'];
    $do[$i]['end']=$sql['date2'];
    $do[$i]['path']=my_path($sql['id']);

if($sql['did']!='0000-00-00 00:00:00')
    $do[$i]['className']='did';
	
	if (stristr($sql['date1'],'00:00:00')) $do[$i]['allDay']=true;
	else $do[$i]['allDay']=false;
	
    $i++;
    }
    

  echo json_encode($do);
exit;
}


if (isset($HTTP_GET_VARS['settings_do'])) 
{
$q = strtolower($_GET["settings_do"]);
$q=str_replace('node_','',$q);
if (!$q) return;

$sqlnews = "SELECT * FROM tree WHERE id='".$q."'";
$result = mysql_query_my($sqlnews); 
@$sql = mysql_fetch_array($result);

$date1 = $sql['date1'];

if($date1 != "0000-00-00 00:00:00") //Парсим первую дату
  {
  $date1 = explode("-", $date1);
  $date1_1 = explode(" ", $date1[2]); //отделяем кусок с временем
  $time1 = explode(":",$date1_1[1]);
  
  $s_date1 = $date1_1[0].'.'.$date1[1].'.'.$date1[0];
  $s_time1 = $time1[0].":".$time1[1];
  }
else
  {
  $s_date1 = '';
  $s_time1 = '00:00';
  }

$date2 = $sql['date2'];

if($date2 != "0000-00-00 00:00:00") //Парсим первую дату
  {
  $date2 = explode("-", $date2);
  $date2_1 = explode(" ", $date2[2]); //отделяем кусок с временем
  $time2 = explode(":",$date2_1[1]);
  
  $s_date2 = $date2_1[0].'.'.$date2[1].'.'.$date2[0];
  $s_time2 = $time2[0].":".$time2[1];
  }
else
  {
  $s_date2 = '';
  $s_time2 = '00:00';
  }


$answer['title'] = $sql['title'];
$answer['date1'] = $s_date1;
$answer['time1'] = $s_time1;

if($s_date1!='' AND $s_date2=='') $s_date2 = $s_date1;

$answer['date2'] = $s_date2;
$answer['time2'] = $s_time2;


echo json_encode($answer);
exit;
}


if (isset($HTTP_GET_VARS['save_time'])) 
{
print_r($HTTP_GET_VARS);
$id = $HTTP_GET_VARS['save_time'];

$date1 = $HTTP_GET_VARS['date1'];

$sqlnews = "UPDATE tree SET date1='".$date1."' WHERE  user_id=".$GLOBALS['user_id']." AND id=".$id;

echo $sqlnews;

$result = mysql_query_my($sqlnews); 


exit;

}

if (isset($HTTP_GET_VARS['save_do'])) 
{
print_r($HTTP_GET_VARS);
$id = $HTTP_GET_VARS['save_do'];
$title = $HTTP_GET_VARS['s_title'];

$date1 = $HTTP_GET_VARS['s_date1'];
$date1 = explode(".", $date1);
$date1 = $date1[2].'-'.$date1[1].'-'.$date1[0];

$time1 = $HTTP_GET_VARS['s_time1'];

$date2 = $HTTP_GET_VARS['s_date2'];
$date2 = explode(".", $date2);
$date2 = $date2[2].'-'.$date2[1].'-'.$date2[0];

$time2 = $HTTP_GET_VARS['s_time2'];

$allday = $HTTP_GET_VARS['s_allday'];

if($allday=='on') { 
	$date1 = $date1.' 00:00:00';
	$date2 = $date2.' 00:00:00';
	}
else {
	$date1 = $date1.' '.$time1.':00';
	$date2 = $date2.' '.$time2.':00';
	}

if ($HTTP_GET_VARS['s_date1']=='') {$date1=""; $date2="";}

$sqlnews = "UPDATE tree SET title='".$title."', date1='".$date1."', date2='".$date2."' WHERE  user_id=".$GLOBALS['user_id']." AND id=".$id;

echo $sqlnews;

$result = mysql_query_my($sqlnews); 


exit;
}


if (isset($HTTP_GET_VARS['notes'])) 
{
$q = strtolower($_GET["notes"]);
$q=str_replace('node_','',$q);

if (!$q) return;

  if($HTTP_GET_VARS['undo_level']!=0)
     {
     $undo_level = $HTTP_GET_VARS['undo_level'];


		$sqlnews = "SELECT text,adddate FROM tree_backup WHERE id=".$q." ORDER by adddate DESC LIMIT ".$undo_level.",1";
		  $result = mysql_query_my($sqlnews); 
		  $i=0;
		  while (@$sql = mysql_fetch_array($result))
		    {
		    echo $sql['text']."<hr>Резервная копия сделана: ".$sql['adddate'];
		    $i++;
		    }
		  	if($i==0) echo '<hr>Резервных копий больше нет';

     }
else
 {
     

$sqlnews = "SELECT text FROM tree WHERE ( FIND_IN_SET('-1',`share`) OR FIND_IN_SET(".$GLOBALS["user_id"].",`share`) OR user_id=".$GLOBALS['user_id']." ) AND id=".$q;
  $result = mysql_query_my($sqlnews); 
  $i=0;
  while (@$sql = mysql_fetch_array($result))
    {
    echo $sql['text'];
    }
  }
exit;
}

if(isset($HTTP_GET_VARS['update_all_images']))
{
//WHERE id=3826 OR id=3529
$sqlnews = "SELECT id,text FROM tree WHERE id=3836  ORDER by adddate DESC";

  $result = mysql_query_my($sqlnews); 
  $i=0;
  while (@$sql = mysql_fetch_array($result))
    {
//    echo $sql['text'];
echo '<br>'.	$q=$sql["id"];
	$ar = parsenote($q,$sql["text"]);
	$icon = $ar[1];
	
	echo '<img src="'.$icon.'"> '.$icon.'<br>';

    }

exit;
}


if (isset($HTTP_POST_VARS['savenote'])) 
{
$q = strtolower($_POST["savenote"]);
$q=str_replace('node_','',$q);

if (!$q) return;

//делаю резервную копию старого текста
$sqlnews = "insert into tree_backup (id, parent_id, title, text, user_id, changedate)
						       select id, parent_id, title, text, user_id, current_date() changedate from tree where id = ".$q."; ";
 	$result = mysql_query_my($sqlnews); 


$ar = parsenote($q,$_POST["text"]);
$note = str_replace("'","\'",$ar[0]);
$icon = $ar[1];

if ($icon=='') $ni = "";
else $ni = ', `node_icon`="'.$icon.'"';

if ($icon=='del') $ni = ', `node_icon`=""';

//$note = str_replace("'","''",$note);
//echo $note;
//$note = addslashes($note);

//$note = rawurldecode($note);
$note = str_replace("'",'"',$note);

$sqlnews = "UPDATE tree SET text='".$note."' $ni WHERE  user_id=".$GLOBALS['user_id']." AND id=".$q;
//echo $sqlnews;

if ($_POST["text"]!='none')
 	$result = mysql_query_my($sqlnews); 

  echo $icon;

exit;
}

function translit($string)
{
    $converter = array(
        'а' => 'a',   'б' => 'b',   'в' => 'v',
        'г' => 'g',   'д' => 'd',   'е' => 'e',
        'ё' => 'e',   'ж' => 'zh',  'з' => 'z',
        'и' => 'i',   'й' => 'y',   'к' => 'k',
        'л' => 'l',   'м' => 'm',   'н' => 'n',
        'о' => 'o',   'п' => 'p',   'р' => 'r',
        'с' => 's',   'т' => 't',   'у' => 'u',
        'ф' => 'f',   'х' => 'h',   'ц' => 'c',
        'ч' => 'ch',  'ш' => 'sh',  'щ' => 'sch',
        'ь' => "",  'ы' => 'y',   'ъ' => "",
        'э' => 'e',   'ю' => 'yu',  'я' => 'ya',
 
        'А' => 'A',   'Б' => 'B',   'В' => 'V',
        'Г' => 'G',   'Д' => 'D',   'Е' => 'E',
        'Ё' => 'E',   'Ж' => 'Zh',  'З' => 'Z',
        'И' => 'I',   'Й' => 'Y',   'К' => 'K',
        'Л' => 'L',   'М' => 'M',   'Н' => 'N',
        'О' => 'O',   'П' => 'P',   'Р' => 'R',
        'С' => 'S',   'Т' => 'T',   'У' => 'U',
        'Ф' => 'F',   'Х' => 'H',   'Ц' => 'C',
        'Ч' => 'Ch',  'Ш' => 'Sh',  'Щ' => 'Sch',
        'Ь' => "",  'Ы' => 'Y',   'Ъ' => "",
        'Э' => 'E',   'Ю' => 'Yu',  'Я' => 'Ya', ' ' => '_','#' => '', '!'=>'.', '?'=>'.', ','=>'.','$'=>'','%'=>'','@'=>'-','&'=>'_AND_','*'=>'','('=>'_',')'=>'_',
    );
    return strtr($string, $converter);
}

function statistic($text)
{
$text = split(',',$text);

arsort($text);

foreach ($text as $key => $val) {
    if ($val != '') $an[$val]=$an[$val]+1;
}

$i=1;
foreach ($an as $key => $val) {
    $answer .= $i.'. <a target="_blank" href="http://www.ip-ping.ru/ipinfo/?ipinfo='.$key.'">'.$key.'</a> посещений: '.$val.'<br>';
    $i++;
}


return $answer;
}

function new_shortcode() //сгенерировать новый короткий код и проверить не существует ли он уже
{
     $short_code = $GLOBALS['user_id']+$sql['id']+(int)(rand(0,10000));
     $short_code = compressNumber($short_code).(int)(rand(0,9));
     
//     $short_code = '6Xx';
     
	 $sqlnews = "SELECT shortlink FROM tree_shortlink WHERE shortlink='".$short_code."'";
     $result = mysql_query_my($sqlnews); 
     @$sql = mysql_fetch_array($result);
     
     if ($sql['shortlink']=='') { return $short_code; }
     else 
       {
       return new_shortcode();
       }
     
}

function short_me($text)
{
   $name=$text;

    $explodeName = explode(" ", $text);
    for ($i=0; $i<count($explodeName); $i++) {
	    if ($i==0) $name = $explodeName[$i];
        if ($i==1) $name.= ' '.$explodeName[$i];
        if ($i==2) $name.= ' '.$explodeName[$i];
	   }

return urlencode(translit($name));
}


if (isset($HTTP_GET_VARS['shortlink_list'])) 
{
  $q = $HTTP_GET_VARS['shortlink_list'];
  $list = "";
  
  $sqlnews = "SELECT * FROM `tree_shortlink` WHERE node_id NOT LIKE '%,%' AND node_id IN (SELECT id FROM tree WHERE user_id=".$GLOBALS['user_id']." AND del=0) AND is_on=1";
  $result = mysql_query_my($sqlnews);   
  while(@$sql = mysql_fetch_array($result))
  	{
  	$list[] = $sql["node_id"];
  	}
  
  echo json_encode($list);
 
exit; 
}



if (isset($HTTP_GET_VARS['onLink']))  //нужно добавить отбор только дел самого пользователя, от хакеров
{
  $q = $HTTP_GET_VARS['onLink'];
  $s1 = $HTTP_GET_VARS['shortlink'];
  $s2 = $HTTP_GET_VARS['longlink'];
  $is_on = $HTTP_GET_VARS['is_on'];
  

  $s1 = explode('/',$s1);
  $s1 = $s1[count($s1)-1];

  $s2 = explode('/',$s2);
  $s2 = $s2[count($s2)-1];
  
  $sqlnews = "SELECT count(*) cnt FROM tree_shortlink WHERE shortlink='$s1' LIMIT 1";
  $result = mysql_query_my($sqlnews);   
  @$sql = mysql_fetch_array($result);
  
  if ($sql['cnt']==0) 
    {
    //создать в базе короткую ссылку, включить её и сразу на выход
    $sqlnews = "INSERT INTO  `h116`.`tree_shortlink` (
				`id` ,
				`shortlink` ,
				`longlink` ,
				`node_id` ,
				`statistic` ,
				`is_on`
				)
				VALUES (
				NULL ,  '$s1',  '$s2',  '$q',  '',  '1'
				);";
    $result = mysql_query_my($sqlnews);   
    echo $sqlnews;
    exit;
    }

   //если запись уже существует, то включаем её или выключаем
   $sqlnews = "UPDATE tree_shortlink SET is_on = '".$is_on."' WHERE shortlink='$s1' LIMIT 5";
   echo $sqlnews;
   $result = mysql_query_my($sqlnews);   

  
  
 
  echo json_encode(0);
 
exit; 
}


if (isset($HTTP_GET_VARS['getLink'])) 
{
  $q = $HTTP_GET_VARS['getLink'];
  
  $sqlnews = "SELECT shortlink,longlink,statistic,is_on FROM tree_shortlink WHERE $q IN (node_id,'xxx')";
  $result = mysql_query_my($sqlnews); 
  @$sql = mysql_fetch_array($result);
  
  if($sql['is_on']) $is_on = $sql['is_on'];
  else $is_on = 0;
  
  if ($sql['shortlink']!='')  //такая ссылка уже существует, возвращаю её
     {     
     $answer['shortlink'] = $sql['shortlink'];
     $answer['longlink'] =  $sql['longlink'];
     $answer['statistic'] = statistic($sql['statistic']);
     $count = count( split(',',$sql['statistic']) ); //сколько посещений
     $count = $count - 1;
     $answer['stat_count'] = $count; 
     $answer['is_on'] = $is_on;
     echo json_encode($answer);
     }
  else
     {
     $short_code = new_shortcode();     
     
	 $sqlnews1 = "SELECT title FROM tree WHERE id IN (".trim($q)."0) LIMIT 0,1";
	 $result1 = mysql_query_my($sqlnews1); 
	 @$sql1 = mysql_fetch_array($result1);
     $name = $sql1['title'];
     
     
     $shortlink = $short_code;
     $longlink  = $short_code;     
     
     $answer['shortlink'] = $shortlink;
     $answer['longlink'] =  short_me($name).'_'.$longlink;
     $answer['statistic'] = '';
     $answer['is_on'] =  $is_on;
     $answer['stat_count'] = ""; //сколько посещений
     echo json_encode($answer);
     }
  
  
  while(@$sql = mysql_fetch_array($result)) 
    {
      $num = $GLOBALS['user_id']+$sql['id']+(int)(rand(0,10000));
	  $pre  = compressNumber($num);

//	  $addr = urlencode(translit($sql['title']));

	  echo 'http://4tree.ru/'.$pre.''.$addr.' '.$num.'<br>';
	}
exit;
}


function compressNumber($n) {
        $codeset = "123456789abcdefghijkmnopqrstuvwxyz";
        $base = strlen($codeset);
        $converted = "";
        while ($n > 0) {
                $converted = substr($codeset, ($n % $base), 1) . $converted;
                $n = floor($n/$base);
        }
        return $converted;
}

if (isset($HTTP_GET_VARS['mindmap'])) 
{
$parent = $HTTP_GET_VARS['mindmap'];
$map = '';
$map = get_map($parent,$map,0);
echo json_encode($map);
exit;
}


if (isset($HTTP_GET_VARS['mobile'])) 
{
$parent = $HTTP_GET_VARS['mobile'];
$map = '';
$map = get_map($parent,$map,1);
echo json_encode($map);
exit;
}


function get_map($parent,$map,$mobile)
{
	 $sqlnews1 = "SELECT * FROM tree WHERE user_id=".$GLOBALS['user_id']." AND id = '$parent'";
	 $result1 = mysql_query_my($sqlnews1); 
     @$sql1 = mysql_fetch_array($result1);
     
     $old_parent = $sql1['parent_id'];
     $old_title = $sql1['title'];
     
     //user_id=".$GLOBALS['user_id']." AND 
	 $sqlnews1 = "SELECT * FROM tree WHERE user_id=".$GLOBALS['user_id']." AND did = '0000-00-00 00:00:00' AND parent_id = '$parent' ORDER by level DESC LIMIT 0,200";
	 $result1 = mysql_query_my($sqlnews1); 

	 while(@$sql1 = mysql_fetch_array($result1))
	   {

		 $sqlnews2 = "SELECT count(*) cnt FROM tree WHERE user_id=".$GLOBALS['user_id']." AND did = '0000-00-00 00:00:00' AND parent_id = '".$sql1['id']."'";
		 $result2 = mysql_query_my($sqlnews2); 
		 @$sql2 = mysql_fetch_array($result2);


	   $have_child = $sql2['cnt'];
	   $map[$sql1['parent_id']][$sql1['id']]['old_parent'] = $old_parent;
	   $map[$sql1['parent_id']][$sql1['id']]['old_title'] = $old_title;
	   $map[$sql1['parent_id']][$sql1['id']]['id'] = $sql1['id'];
	   $map[$sql1['parent_id']][$sql1['id']]['title'] = $sql1['title'];
	   $map[$sql1['parent_id']][$sql1['id']]['parent_id'] = $sql1['parent_id'];
	   $map[$sql1['parent_id']][$sql1['id']]['node_icon'] = $sql1['node_icon'];
	   $map[$sql1['parent_id']][$sql1['id']]['have_child'] = $have_child;
if($mobile==1) $map[$sql1['parent_id']][$sql1['id']]['text'] = $sql1['text'];
	   
	   $map = get_map($sql1['id'],$map,$mobile);
	   }
	 return $map;
}

function directoryToArray($directory, $recursive) {
	$array_items = array();
	if ($handle = opendir($directory)) {
		while (false !== ($file = readdir($handle))) {
			if ($file != "." && $file != "..") {
				if (is_dir($directory. "/" . $file)) {
					if($recursive) {
						$array_items = array_merge($array_items, directoryToArray($directory. "/" . $file, $recursive));
					}
					$file = $directory . "/" . $file;
					$array_items[] = preg_replace("/\/\//si", "/", $file);
				} else {
					$file = $directory . "/" . $file;
					$array_items[] = preg_replace("/\/\//si", "/", $file);
				}
			}
		}
		closedir($handle);
	}
	return $array_items;
}

if (isset($HTTP_GET_VARS['scandirs'])) 
	{

//	print_r(directoryToArray("./upload",true));

	echo "<h1>DATA</h1>";

	$data = directoryToArray("./data",true);
	
	echo "<ol>";
	for($i=0;$i<count($data);$i++)
		{
			$filename = $data[$i];
			$filename = substr($filename,2,5000);
			 $sqlnews2 = "SELECT count(*) cnt FROM h116.tree WHERE text LIKE '%".$filename."%'";
			 $result2 = mysql_query_my($sqlnews2); 
		   	 @$sql2 = mysql_fetch_array($result2);
		   	 if($sql2['cnt']>0) echo "<li>".$filename." —".$sql2['cnt']."</li>";
		   	 else  echo "<li><font color='gray'>".$filename." —".$sql2['cnt']."</font></li>";
		}
	echo "</ol>";

	
	}


if (isset($HTTP_GET_VARS['history'])) 
	{
		   $sql2 = "";
		   $h = $HTTP_GET_VARS['history'];
		   
	   	   $share_ids = get_all_share_children($GLOBALS['user_id']); //все дочерние элементы, которые есть в таблице tree_share
		   
		   $txt = "";
		   $title = "История редактирования";
		   
		   $inside = "WHERE id = '$h'";
		   
		   if($h=="1") $inside="";
		   
		   $sqlnews = "SELECT * FROM h116.tree_backup $inside ORDER by changedate DESC  LIMIT 0,500";
		   
		   $result = mysql_query_my($sqlnews); 

			 $sqlnews2 = "SELECT * FROM h116.tree WHERE id = '$h' AND ( ('".$GLOBALS['user_id']."'=11) OR (user_id='".$GLOBALS['user_id']."' OR id IN ($share_ids) ) )";
			 
//			 echo $sqlnews2;
			 			 	
			 $result2 = mysql_query_my($sqlnews2); 
		   	 @$sql2 = mysql_fetch_array($result2);
		   	 
		   	 if(!$sql2['id']) return null;
		   	 
		     $divider = "<div class='divider_red' style='background:rgb(33, 73, 25) !important;' myid='".$h."'><div class='divider_count'>0</div>Текущее состояние заметки<h6 style='font-size:26px !important;'>".$sql2["title"]."</h6></div>";
		   	 
		   	 
		     $txt = $txt.$divider."<div class='edit_text'>".$sql2['text']."</div>";
	   	 	 $titleshort = $sql2['title'];


		   $i = 1;
		   while (@$sql = mysql_fetch_array($result))
		     {
		     $id = $sql['id'];
		     
		     $user_id2 = $sql['user_id'];
			 $sqlnews3 = "SELECT * FROM h116.tree_users WHERE id = '$user_id2'";
			 $result3 = mysql_query_my($sqlnews3); 
		   	 @$sql3 = mysql_fetch_array($result3);
		     
		     if($user_id2!=$GLOBALS['user_id'])
		     	{
		     	$user_name = "<div class='divider_face' title='Редактировал(а): ".$sql3['fio']."\n".$sql3['email']."'><img src='".$sql3['foto']."'></div>";
		     	
		     	}
		     else
		     	{
		     	$user_name = "<div class='divider_face' title='Редактировал(а): ".$sql3['fio']."\n".$sql3['email']."'><img style='opacity:0.3;' src='".$sql3['foto']."'></div>";
		     	}
		     
		     $dt = "время резервной копии:";
		     
		     if($h=="1") $mytitle=$sql[title];

		     
		     $divider = "<div class='divider_red' myid='".$id."'><div class='divider_count'>".$i."</div>".$user_name.$dt."<h6>".date('d-m-Y H:i:s', $sql['changedate']/1000+2*60*60)."</h6>".$mytitle."</div>";

		     
		     $txt = $txt.$divider."<div class='edit_text'>".$sql['text']."</div>";
		     $i++;
		     }
		     
		  $answer="";
		  $answer["text"] = $txt;
		  $answer["title"] = $titleshort;
		  echo json_encode($answer);
	
	}


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



if (isset($HTTP_GET_VARS['send_message'])) 
{
    $message = array(
        'time' => time(), 
        'type' => "need_refresh_now",
        'msg' => "Ты чего хочешь от меня",
        'txt' => "Уф уф"
    );

  echo push(array(11,12),$message);	
	
}


?>