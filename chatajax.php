<?php
include('db2.php');
header('Content-type: text/html; charset=utf8');

$user=( $_POST['user'] );
$touser=( $_POST['touser'] );
$msg=( $_POST['msg'] );

$msg=str_replace('/n','',$msg);

$sqlnews1 = "insert into chat(user,msg,touser,messagedate,readed)values('$user','$msg','$touser',now(),'0000-00-00 00:00:00')";

mysql_query($sqlnews1);



$user=str_replace($user,'я',$user);
?>

<?php   
$css_to='2';
$days='';
echo '<div class="chat-bubble'.$css_to.'"><div class="chat-bubble-glare'.$css_to.'"></div>'.$msg.'<div class="chat-bubble-arrow-border'.$css_to.'"></div><div class="chat-bubble-arrow'.$css_to.'"></div></div><div class="chat_time">'.$days.'</div>';
?>