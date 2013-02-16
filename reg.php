<?

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


$text[] = 'завтра в 6:00 помыть машину';
$text[] = 'завтра в 8:30';
$text[] = '12:30 в четверг';
$text[] = 'напомнить про Сергея в 8ч';
$text[] = 'задуматься о программе через 30 минут';
$text[] = 'задуматься о программе через 2 часа 30 минут';
$text[] = 'задуматься о программе через 2часа 30минут';
$text[] = 'задуматься о программе через 8ч 30м';
$text[] = 'подойти к нему чт 22:39';
$text[] = 'помыть машину в пятницу';
$text[] = 'по пятницам собрание в 12ч 30м';
$text[] = '8ч через 10 дней';
$text[] = '8ч 30 м в воскресение';
$text[] = 'воскресение';
$text[] = 'суббота';
$text[] = '12ч вс напомнить про бритву';
$text[] = 'напомни мне позвонить сейчас';
$text[] = 'помыть окна сегодня в 8:30';
$text[] = 'завтра 8ч';
$text[] = 'через 8 недель';
$text[] = 'через 8 лет';
$text[] = 'через 160 дней';
$text[] = 'через 3 месяца';
$text[] = '12:30 12.05.1978';
$text[] = 'через 2 часа';
$text[] = 'через 18 минут';
$text[] = 'через 18 часов';


for($i=0;$i<count($text);$i++)
  	{
  	echo parsedate($text[$i]).' : '.$text[$i].'<br>';
	}





?>