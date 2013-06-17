#!/usr/bin/php
<?
//#!/usr/local/bin/php
//include_once "990990/public_html/smsc_api.php";
include_once "www/4tree.ru/smsc_api.php";
include_once "smsc_api.php";
/*…
list($sms_id, $sms_cnt, $cost, $balance) = send_sms("79999999999", "Ваш пароль: 123", 1);
...
list($sms_id, $sms_cnt, $cost, $balance) = send_sms("79999999999", "http://smsc.ru\nSMSC.RU", 0, 0, 0, 0, false, "maxsms=3");
...
list($sms_id, $sms_cnt, $cost, $balance) = send_sms("79999999999", "0605040B8423F0DC0601AE02056A0045C60C037761702E736D73632E72752F0001037761702E736D73632E7275000101", 0, 0, 0, 5, false);
...
list($sms_id, $sms_cnt, $cost, $balance) = send_sms("79999999999", "", 0, 0, 0, 3, false);
...
list($cost, $sms_cnt) = get_sms_cost("79999999999", "Вы успешно зарегистрированы!");
...
list($status, $time) = get_status($sms_id, "79999999999");
...
*/

error_reporting(E_ERROR | E_WARNING | E_PARSE);
$config = array(
   'themedir' => "themes/",     // path to dir with themes
   'mysql_host' => "localhost",
   'mysql_user' => "root",
   'mysql_password' => "See6thoh",
);

$db = mysql_connect ($config[mysql_host], $config[mysql_user], $config[mysql_password]);
mysql_query("SET NAMES utf8");
mysql_select_db('h116',$db);   
if (!$db) { $err = "Ошибка подключения к SQL :("; echo 'ошибка базы'; }




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
  	
  	
  	$time = strtotime($answer,time()+0*60*60);
  	if($time)
  		{
 	  	$time = strftime("%G-%m-%d %H:%M:00",$time);
 	  	}
  	
  	
	return $time;

}



function cutText($string, $setlength) { 
    $length = $setlength; 
    if($length<strlen($string)){ 
        while (($string{$length} != " ") AND ($length > 0)) { 
            $length--; 
        } 
        if ($length == 0) return substr($string, 0, $setlength); 
        else return substr($string, 0, $length); 
    }else return $string; 
} 



  $sqlnews="SELECT *, (date1-INTERVAL remind MINUTE) dateremind FROM h116.`tree` WHERE did = '0000-00-00 00:00:00' AND date1 != '0000-00-00 00:00:00' AND remind != '0' AND date1<(NOW() + INTERVAL 2 HOUR + INTERVAL remind MINUTE) ORDER BY `tree`.`remind` DESC";
  
  
  $result = mysql_query($sqlnews); 
while(@$sql = mysql_fetch_array ($result))
{
$phone='none';

	$user_id = $sql["user_id"];
	
	$sqlnews5="SELECT time_dif,mobilephone FROM tree_users WHERE id='".$user_id."'";
	$result5 = mysql_query($sqlnews5); 
	@$sql5 = mysql_fetch_array ($result5);
	
	$phone = $sql5["mobilephone"];

	$timezone = $sql5["time_dif"]+6;
	
	$remindtime = $sql["date1"];
	
	$tim = str_replace(" 00:"," 09:",$sql['dateremind']); //тут есть косяк с 00ч до 01ч

	$remind_date = date("d.m.y H:i", strtotime($tim) + ($timezone * 60*60) );

	//DDMMYYhhmm
//	$remind_date =date("d.m.y H:i",strtotime($tim));
/*

	if($sql['user_id']=='11')
		{
		$phone="79227444440";
		}
	if($sql['user_id']=='12')
		{
		$phone="79226379643";
		}
	if($sql['user_id']=='17')
		{
		$phone="79634709609";
		}
	if($sql['user_id']=='15')
		{
		$phone="79222392741";
		}
	if($sql['user_id']=='93')
		{
		$phone="79043012757";
		}
	if($sql['user_id']=='91')
		{
		$phone="79068901584";
		}
	if($sql['user_id']=='7')
		{
		$phone="79068948888";
		}		
	if($sql['user_id']=='131')
		{
		$phone="79068677635";
		}		
		*/
		
    echo $phone;
		
	
//	$remind_date =date()
	

if (date("i",strtotime($sql['date1']))=='00')
	$to = 'В '.date("H",strtotime($sql['date1'])).'ч';
else
	$to = 'В '.date("H:i",strtotime($sql['date1']));

	$text = $to.' '.cutText($sql['title'],122);
if($phone!='none')
	list($sms_id, $sms_cnt, $cost, $balance) = send_sms($phone, $text, 0,$remind_date,0,0,'4tree.ru');

	$txt='date='.date("m.d.y H:i:s").' phone='.$phone.' SMS['.$text.'] '.'id='.$sms_id.' cnt='.$sms_cnt.' cost='.$cost.' balance='.$balance." timeto".$remind_date."<br>";
	
	echo $txt;

  $sqlnews="UPDATE h116.`tree` SET remind = '0', lsync = '0', changetime = '".(integer)(microtime(true)*1000)."' WHERE id=".$sql['id'];
  $result = mysql_query($sqlnews); 

//	@$fp = fopen('990990/public_html/cron.html', "a+");
//	@fwrite($fp, $txt);
//	@fclose($fp);


	
}


//$fp = fopen('990990/public_html/cron.html', "a+");
//@fwrite($fp, 'date='.date("m.d.y H:i:s").' - дел в дереве='.$sql['cnt']."<br>");
//fclose($fp);

//function send_sms($phones, $message, $translit = 0, $time = 0, $id = 0, $format = 0, $sender = false, $query = "")


//list($sms_id, $sms_cnt, $cost, $balance) = send_sms("79090888883", "Женька пенька", 0,0,0,0,'4tree.ru');


?>