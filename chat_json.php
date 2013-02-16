<?php
 header('Content-type: text/html; charset=utf8');
//echo '{ 
//         "posts": [ 
//		            {"m": { "id": "1", "user" : "John", "msg":"Женя1" }},
//		            {"m": { "id": "2", "user" : "Sergey", "msg":"Женя2" }},
//		            {"m": { "id": "3", "user" : "Andry", "msg":"Женя3" }}
//				  ]
//	  }';
// exit;

//echo '{ "posts" : [{"m": { "id":"16", "user":"Вецель Е.А.", "msg":"Вов приятного аппетита" }} ,{"m": { "id":"15", "user":"Вецель Е.А.", "msg":"Да все хорошо, не беспокойтесь!" }} ,{"m": { "id":"14", "user":"Вецель Е.А.", "msg":"Как дела?" }} ,{"m": { "id":"8", "user":"Вецель Е.А.", "msg":"Володя здорово!!!" }} ]}';
//exit;

include('db2.php');

$fpk_id=$_COOKIE['fpk_id'];

$user=($_GET['user']);
$touser=($_GET['touser']);

$sqlnews1="select fio from 1_users WHERE id=".$touser;
$sql = mysql_query($sqlnews1);
@$row=mysql_fetch_array($sql);

$tousername=$row['fio'];

$tousername=explode(' ',$tousername);

if ( $_GET['chathistory'] )
  {

echo '<center><a href="#" id="clear_history" user="'.$user.'" touser="'.$touser.'" >Очистить окно сообщений</a></center><hr>';

$sqlnews1="select * from chat WHERE (touser = '$user' AND user='$touser') OR (touser = '$touser' AND user='$user') order by messagedate";

$sql = mysql_query($sqlnews1);
while(@$row=mysql_fetch_array($sql))
{
   if ($row['readed']=='0000-00-00 00:00:00') $color='gray';
   else $color='#4f4f4f';
//   echo "<font color=$color>";

   if ($fpk_id==$row['user']) $css_to='2';
   else $css_to='';
   
   $days = $row['messagedate'];

   
   echo '<div class="chat-bubble'.$css_to.'"><div class="chat-bubble-glare'.$css_to.'"></div>'.$row['msg'].'<div class="chat-bubble-arrow-border'.$css_to.'"></div><div class="chat-bubble-arrow'.$css_to.'"></div></div><div class="chat_time">'.$days.'</div>';

}
   exit;
  }


function tweet($message, $username, $password)
{
  $context = stream_context_create(array(
    'http' => array(
      'method'  => 'POST',
      'header'  => sprintf("Authorization: Basic %s\r\n", base64_encode($username.':'.$password)).
                   "Content-type: application/x-www-form-urlencoded\r\n",
      'content' => http_build_query(array('status' => $message)),
      'timeout' => 5,
    ),
  ));
  $ret = file_get_contents('http://twitter.com/statuses/update.xml', false, $context);
 
  return false !== $ret;
}


if ( $_GET['chat'] )
  {
  
 // if ( tweet ('imater to you','imater','990990') ) echo 'Ok. Twitter.';
  
  
$sqlnews1="select *, (select 1_users.fio FROM 1_users WHERE 1_users.id = chat.user) fio, (select 1_users.brand FROM 1_users WHERE 1_users.id = chat.user) brand, (select 1_users.fio FROM 1_users WHERE 1_users.id = chat.touser) fioto from chat order by messagedate DESC LIMIT 200";
echo $sqlnews1;



$sql = mysql_query($sqlnews1);
while(@$row=mysql_fetch_array($sql))
{
   if ($row['readed']=='0000-00-00 00:00:00') $color='gray';
   else $color='#4f4f4f';
   echo "<font color=$color>";
   echo '<b>'.$row['fio'].' ('.$row['brand'].')</b>: ';
   
   
$dd=(int)( ((strtotime($row['messagedate']))-time() )/60/60*10)/10; 

if (($dd>24) or ($dd<-24)) 
   { 
    $dd=(int)($dd/24); 
    if ($dd>=0) $days="+ ".$dd." дн.";
       else
    $days=$dd." дн.";
   }

else
   { 
    if ($dd>=0) $days="+ ".$dd." ч.";
       else
    $days=$dd." ч.";
   }


   
   
   
   
   $days='<br><font size="-2px" color=lightgray>('.$days.' назад)</font>';
   echo $row['msg'].'('.$row['fioto'].') '.$days.'</font><br>';

}
   exit;
  }


//////Проверяю, есть ли сообщения////////
$sqlnews1="select * from chat WHERE touser = '$user' AND readed = '0000-00-00 00:00:00' order by messagedate";

$sql = mysql_query($sqlnews1);

$i=5;
echo '{ "posts" : [';
while(@$row=mysql_fetch_array($sql))
{
$datetime=$row['messagedate'];
$userx=$row['user'];
$id=$row['id'];
mysql_query("UPDATE chat SET readed = NOW() WHERE id = '$id'");
$msg=$row['msg'];
$touser=$row['touser'];

$sqlnews2="select fio,brand from 1_users WHERE id = '$userx'";
$sql2 = mysql_query($sqlnews2);
$row2=mysql_fetch_array($sql2);

$explodeName = explode(" ", $row2['fio']);

$name = $explodeName[0].' '.$explodeName[1][0].$explodeName[1][1].'.'.$explodeName[2][0].$explodeName[2][1].'.';
$firstname=$explodeName[1];

if ($userx==-2) 
  {
  $firstname='ФПК';
  $name = 'Уведомления ФПК';
  }

	    $sqlnews9="SELECT logo FROM 1_brands WHERE id=".$row2['brand'];
		$result9 = mysql_query($sqlnews9); @$sql9 = mysql_fetch_object ($result9);
		$logo=$sql9->logo;
		
		if ($logo=='') $logo='day.png';


if ($i==0) echo ','; else $i=0;
echo '{"m": ';
echo '
    {
	"id":"'.$id.'",
	"user":"'.$userx.'",
	"touser":"'.$touser.'",
	"name":"'.$name.'",
	"logo":"'.$logo.'",
	"firstname":"'.$firstname.'",
	"datetime":"'.$datetime.'",
	"msg":"'.$msg.'"
	}} ';	

}

echo ']}';



?>