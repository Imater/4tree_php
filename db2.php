<?php
//Все индивидуальные настройки предприятия

$mysql_password = "See6thoh";

$mysql_hostname = "localhost";
$mysql_user = "root";
$mysql_database = "h116";
$bd = mysql_connect($mysql_hostname, $mysql_user, $mysql_password) 
or die("Opps some thing went wrong");
mysql_query("SET NAMES utf8");
mysql_select_db($mysql_database, $bd) or die("Opps some thing went wrong");


$config = array(
   'themedir' => "themes/",     // path to dir with themes
   'mysql_host' => "localhost",
   'mysql_user' => "root",
   'mysql_password' => $mysql_password,
);


$dbName = 'h116';
$dbUser = 'root';
$dbPass = $mysql_password;
$dbHost = 'localhost';

function cheltime($time)
{
//Прибавить 6 часов разницы во времени (часовые пояса) чтобы по Гринвичу
 return $time+(6)*60*60;
}





?>