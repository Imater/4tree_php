#!/usr/bin/php
<html lang="ru" class="" manifest="">
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=utf-8">
<meta charset="utf-8">
<?

umask(0); 
if(!stristr(getcwd(),"4tree.ru")) 
	{
	set_include_path('www/4tree.ru/');
	chdir('www/4tree.ru');
	echo "http - folder";
	}
	
ini_set('memory_limit', '-1');

require_once('Zend/Mail/Storage/Imap.php');
include "db.php";

$mail = new Zend_Mail_Storage_Imap(array('host' => 'mail.4tree.ru',
										 'user'=> '4tree@4tree.ru',
										 'password' => 'uuS4foos_VE'));
                                         
echo $mail->countMessages() . " messages found<br>";

$show = false;

$i=1;
$s=1;


$db = mysql_connect ($config["mysql_host"], $config["mysql_user"], $config["mysql_password"]);
mysql_query_my("SET NAMES utf8");
mysql_select_db('h116',$db);   
if (!$db) { echo "Ошибка подключения к SQL :("; exit();}

  $db2 = new PDO('mysql:dbname=h116;host=localhost;', $config["mysql_user"], $config["mysql_password"]);
  $db2 -> exec("set names utf8");
  $db2->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
  $db2->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);


	    $message = array(
	        'time' => time(), 
	        'type' => "need_refresh_now",
	        'msg' => "Новое письмо пришло из скрипта",
	        'txt' => "Уф уф"
	    );
	
//	  echo push(11,$message);	


//print_r($mail);

//foreach ($mail as $message) {
if(isset($_GET['id']))
	{
		$kk = $_GET['id'];
		$txt = "";
		$j=0;
		ShowOneMessage($kk,$mail);

		$flags = $mail[$kk]->getFlags();
		unset($flags[Zend_Mail_Storage::FLAG_SEEN]);
		$mail->setFlags($kk, $flags);
	}
else
	{
	for($kk=count($mail); $kk>0; $kk--) {
		$txt = "";
		$j=0;
		if($mail[$kk]->hasFlag(Zend_Mail_Storage::FLAG_SEEN)) 
			{
			continue;		
			}
		else
			{
			echo $kk." - !!!<br>";
			}
		
		ShowOneMessage($kk,$mail);
		}
	}

function find_user_id($from)
{
  $answer="";
  $find = $from;
  	
  $sqlnews="SELECT * FROM tree_users WHERE 
  		('$find' LIKE CONCAT('%',email,'%') AND email!='') OR 
  		('$find' LIKE CONCAT('%',email1,'%') AND email1!='') OR 
  		('$find' LIKE CONCAT('%',email2,'%') AND email2!='') OR 
  		('$find' LIKE CONCAT('%',email3,'%') AND email3!='') OR 
  		('$find' LIKE CONCAT('%',email4,'%') AND email4!='')";
  
//  echo $sqlnews;
  
  $result = mysql_query($sqlnews); 
  while(@$sql = mysql_fetch_array($result))
  	{
  	$answer[]=$sql["id"];
  	}
  
  return $answer;
}

function ShowOneMessage($id,$mail)
{
global $txt,$show,$j,$today, $user_id;

$message = $mail[$id];


$txt["id"] = $id;

//print_r($message);

$txt["from"] = ( str_replace(array("<<",'>>'),array("(",')'), decode_mime_string($message->from)) );

if( isset($message->cc) ) { // or $message->headerExists('cc');
    $txt["cc"] = ( str_replace(array("<<",'>>'),array("(",')'), decode_mime_string($message->cc)) );
}

if( isset($message->to) ) { // or $message->headerExists('cc');
    $txt["to"] = ( str_replace(array("<<",'>>'),array("(",')'), decode_mime_string($message->to)) );
}


$user_id_from = find_user_id($txt["from"]);

$where_find = "";
if(isset($txt["to"])) $where_find .= $txt["to"];
if(isset($txt["cc"])) $where_find .= $txt["cc"];

$user_id_to = find_user_id($where_find);

if(isset($user_id_from[0])) $from_id = $user_id_from[0];

$user_id = $user_id_from;


if( $user_id_to=="" ) 
	{
	$user_id = $user_id_from;
	}
else
	{
	$user_id = $user_id_to;
	}
if( $user_id_from=="" )
	{
	if( $user_id_to=="" ) return false;
	else
		{
		$user_id = $user_id_to;
		}
	}

$today = date("m-Y"); 


if( isset($message->date) ) { // or $message->headerExists('cc');
    $txt["date"] = decode_mime_string($message->date);
}

$title = decode_mime_string( $message->subject ); //заголовок сообщения

$txt["title"] = $title;

if($show) echo "title = ".$title."<br>";

$part = $message;

$j=0;
myShowParts($message);
if($show) echo "<hr><hr>";
if($show) print_r($txt);
if($show) echo "<hr><hr>";


$html = composeHtml($txt);

for($a=0;$a<count($user_id);$a++)
	{
	CreateTreeNote($user_id[$a],$html,$txt);
	}

}

function CreateTreeNote($userid,$html,$txt)
{
global $db2;
  $sqlnews="SELECT id FROM `tree` WHERE parent_id = 1 AND user_id = '".$userid."' AND title = '_НОВОЕ'";
  $result = mysql_query($sqlnews); 
  @$sql = mysql_fetch_array($result);
  
  if(!(@$sql["id"])) 
  		{
		$sqlnews2 = "INSERT INTO `h116`.`tree` (`id`, `parent_id`, `position`, `left`, `right`, `level`, `title`, `type`, `text`, `date1`, `date2`, `did`, `user_id`, `node_icon`, `remind`, `adddate`, `short`, `share`, `tab_order`, `comments`, `changetime`, `old_id`, `del`, `fav`, `s`) VALUES (NULL, '1', '', '', '', '', '_НОВОЕ', NULL, '', '', '', '', '".$userid."', '', '', CURRENT_TIMESTAMP, '', '', '0', '', '', '', '0', '0', '0');";
		
		  $result2 = mysql_query($sqlnews2); 
		  @$sql2 = mysql_fetch_array($result2);

		$sqlnews="SELECT id FROM `tree` WHERE parent_id = 1 AND user_id = ".$userid." AND title = '_НОВОЕ'";
  		$result = mysql_query($sqlnews); 
  		@$sql = mysql_fetch_array($result);
  		};
  		
  $parent_id = $sql["id"];

  if($parent_id)
  	{
	  $sql11 = "INSERT INTO `h116`.`tree` SET user_id = :user_id, title = :title, text = :text, parent_id = :parent_id";
	
	
	  $values11 = array( ":user_id" => $userid,
	      	":title" =>  "[@] ".$txt["title"],
	      	":parent_id" =>  $parent_id,
	      	":text" => $html
	          );
	          
	          
	  $query1 = $db2->prepare($sql11);
	  $query1->execute($values11);

	  echo "<hr>".$html."<hr>".mysql_error($db);

	    $message = array(
	        'time' => time(), 
	        'type' => "need_refresh_now",
	        'msg' => "Новое письмо пришло!!!",
	        'txt' => "Уф уф"
	    );
	
	  echo push($userid,$message);	

  	}
  
  echo $parent_id;

echo $html;
}

function composeHtml($txt)
{
	$html_text="";
	$plain_text="";

	$hasHtml = false;
	for($i=0;$i<count($txt["parts"]);$i++)
		{
		$type = $txt["parts"][$i]["type"];
		if($type=="text/html") $hasHtml = true;
		}

	for($i=0;$i<count($txt["parts"]);$i++)
		{
		$type = $txt["parts"][$i]["type"];
		if($type=="text/html") $html_text .= $txt["parts"][$i]["txt"];
		if($type=="text/plain") $plain_text .= $txt["parts"][$i]["txt"];
		if( stristr($type,"application") || stristr($type,"video/") || stristr($type,"image") ) 
			{
			$html_text .= "<ul>";
			if(!isset($txt["parts"][$i]["inline_img"]))
				{
				if($hasHtml) $html_text .= $txt["parts"][$i]["txt"];
				else $plain_text .= $txt["parts"][$i]["txt"];
				}
			$html_text .= "</ul>";
			}
		}

	if($hasHtml)
		for($i=0;$i<count($txt["parts"]);$i++)
			{
			if(isset($txt["parts"][$i]["inline_img"]))
				{
				if(isset($txt["parts"][$i]["inline_img"])) $inline_img = $txt["parts"][$i]["inline_img"];
				else $inline_img="";
				if($inline_img) 
					$html_text = str_replace("cid:".$inline_img, $txt["parts"][$i]["image"], $html_text);
				}
			}


	if($hasHtml) $html_text = $html_text;
	else $html_text = $plain_text;
	
	$cc = ""; $mymessagedate = "";
	
	if(isset($txt["cc"])) $cc = "<br>Копия была направлена: ".$txt["cc"];

	if(isset($txt["date"])) $mymessagedate = " [".$txt["date"]."]";

	$html_text = "<h30>".$txt["title"]."</h30>".$html_text."<div class='mailfrom'>".$txt["from"]." отпр. это письмо для ".$txt["to"]." ".$mymessagedate.$cc."<div>";
	
	return $html_text;	
}


function DisplayMessage($part)
{
global $j,$txt,$show,$user_id,$today;
//print_r($part);
$answer = "";
if($show) 	echo $part->contentType."<br>";
	if($show) print_r( $part );
	$type = explode(";",$part->contentType);

	$answer = $part->getContent();
	
	$header=$part->getHeaders();
	@$header_encoding = $header["content-transfer-encoding"];
	
//	echo $header_encoding."<br>";
//	print_r( $header );
	
	if($header_encoding=="base64") $answer =  ( base64_decode( $answer ) );
	if($header_encoding=="binary") $answer = imap_base64(imap_binary($answer));
	if($header_encoding=="quoted-printable") $answer =  ( quoted_printable_decode( $answer ) );
	if($header_encoding=="8bit") $answer =  ( quoted_printable_decode( imap_8bit($answer) ) );
	if($header_encoding=="7bit") { $answer =  ( quoted_printable_decode( imap_8bit($answer) ) );  }
	
//	echo $type[0]."<br>";
//    echo "<b>".$type[0]."</b>, ";
	
	if($type[0]=="message/rfc822")
		{
		$mymessage_txt = $part->getContent();
		$mymessage = new Zend_Mail_Message( array('raw' => $mymessage_txt) );
//		echo $mymessage_txt;
		myShowParts($mymessage);
		}

	if($type[0]=="text/html") 
		{
		$answer = decode_mime_string( $answer );
//	    if(eregi("KOI8", $type[1]) OR true ) { $answer = iconv('KOI8-R', 'UTF-8', $answer); }
//	    $answer = transformHTML($answer);
//		$answer = ;
		$answer = myTranslateCharset($answer,$type);
	    $txt["parts"][$j]["type"] = $type[0];
	    $txt["parts"][$j]["txt"] = $answer;
	    $j++;
		}

	if($type[0]=="text/plain") 
		{
		//base64_decode
		$answer = txt_to_html( decode_mime_string($answer) );
		$answer = myTranslateCharset($answer,$type);
	    $txt["parts"][$j]["type"] = $type[0];
	    $txt["parts"][$j]["txt"] = $answer;

	    $j++;
		}

	if( ($type[0]=="image/jpeg") || ($type[0]=="image/png") )
		{
		  $typename = $type[1];
		  $typename = decode_mime_string( $typename );
		  $filename = trim(ereg_replace('name=|"','',$typename));
		  $file = "upload/files/".$user_id[0]."/".$today."/mail/".$filename;
//			echo "<h1>".$file."</h1>";
		  if(file_exists($file)) 
		  		{
		  		$filename = rand(0,9999999)."-".$filename;
				$file = "upload/files/".$user_id[0]."/".$today."/mail/".$filename;
//				echo "<h2>".$file."</h2>";
		  		}

		  $content = $answer;
		  @mkdir("upload/files",0777);
		  @mkdir("upload/files/".$user_id[0],0777);
		  @mkdir("upload/files/".$user_id[0]."/".$today,0777);
		  @mkdir("upload/files/".$user_id[0]."/".$today."/mail",0777);
		  
//		  echo $file;
		  
		  $size = file_put_contents($file,$content);
		  @chmod($file, 0777); 
		  
//		  echo getcwd()." ".$file."<br>";
		  
		  $answer = "<li><img class='mail_image' style='padding-top:20px;max-width:600px;max-height:600px;vertical-align:middle;' src='http://4tree.ru/".$file."'><br><a target='blank' href='http://4tree.ru/".$file."'>".$filename."</a> (".russian_date()." — ".formatBytes($size).")</li>";
		  		
		  $txt["parts"][$j]["type"] = $type[0];
	      $txt["parts"][$j]["txt"] = $answer;

//		  		print_r($header);
		  if(@stristr($header["content-disposition"],"inline") || true) 
		  		{
//		  		print_r($header);
		  		if(isset($header["content-id"]) || isset($header["x-attachment-id"]))
		  			{
		  			if(isset($header["content-id"])) $myid = $header["content-id"];
		  			if(isset($header["x-attachment-id"])) $myid = $header["x-attachment-id"];
		  			$txt["parts"][$j]["inline_img"]=str_replace(array("<",">"),array("",""),$myid);
			    	$txt["parts"][$j]["image"] = "http://4tree.ru/".$file;
			    	}
			    else
			    	{
			    	}
		  		}

	      $j++;
		}

	if( stristr($type[0],"application/") || stristr($type[0],"video/"))
		{
		  $myname="";
//		  print_r($type);
		  for($k=1; $k<count($type); $k++)
		  	{
		  	$name1 = $type[$k];
		  	$name = explode("=",$name1);
		  	if(count($type)>2 && count($name)!=1) $myname .= trim($name[1]);
		  	else $myname = trim( decode_mime_string($type[1]) );
		  	}
		  $filename = trim(ereg_replace('name\*1=|name\*0=|name=|"|x-unix-mode=','',$myname));
		  $filename = trim(ereg_replace('.d oc','.doc',$filename));
		  $typename = decode_mime_string( $filename );
		  
		  if(!stristr($filename,"."))
		  	{
		  	if($type[0]=="application/pdf") $filename = $filename.".pdf";
		  	if($type[0]=="application/msword") $filename = $filename.".doc";
		  	if($type[0]=="application/vnd.ms-excel") $filename = $filename.".xls";
		  	if($type[0]=="application/zip") $filename = $filename.".zip";
		  	if(stristr($type[0],"xml")) $filename = $filename.".xml";
		  	}
		  	
		  $file = "upload/files/".$user_id[0]."/".$today."/mail/".$filename;
		  
		  if(file_exists($file)) 
		  		{
		  		$filename = rand(0,9999999)."-".$filename;
				if(file_exists($filename)) 
			  		$filename = rand(0,9999999)."-".$filename;
		  						
				$file = "upload/files/".$user_id[0]."/".$today."/mail/".$filename;
		  		}
		  
		  $content = $answer;
		  @mkdir("upload/files",0777);
		  @mkdir("upload/files/".$user_id[0],0777);
		  @mkdir("upload/files/".$user_id[0]."/".$today,0777);
		  @mkdir("upload/files/".$user_id[0]."/".$today."/mail",0777);
		  $size = file_put_contents($file,$content);
  		  @chmod($file, 0777); 

		  $answer = "<li><a target='blank' href='http://4tree.ru/".$file."'>".$filename."</a>"." (".russian_date()." — ".formatBytes($size).")</li>";
		  $txt["parts"][$j]["type"] = $type[0];
	      $txt["parts"][$j]["txt"] = $answer;
	      $j++;
		}

	
	return $answer."<br>";
}

/////////////////////////////////////////////////////////////////

function myTranslateCharset($answer,$type)
{
$charset = false;
for($l=0;$l<count($type);$l++)
	{
//	echo $type[$l];
	if(stristr($type[$l],"koi8")) $charset = "KOI8-R";
	if(stristr($type[$l],"windows-1251")) $charset = "windows-1251";
	}

   if($charset) $answer = iconv($charset, 'UTF-8', $answer);
   return $answer;
   
}


function myShowParts($message)
{
global $show;
$counts = $message->countParts();
if($show) echo $message->contentType."<hr>";

if($counts==0) $sh = DisplayMessage($message);

for($ii=1; $ii<=$counts; $ii++)
	{
	if($show) echo $ii."<br>";
	$part = $message->getPart($ii);
	if($part->isMultipart()) 
		{
		for($jj=1; $jj<=$part->countParts(); $jj++)
			{
			$part2 = $part->getPart($jj);
				if($part2->isMultipart()) 
					{
					for($jk=1; $jk<=$part2->countParts(); $jk++)
						{
						$part3 = $part2->getPart($jk);
						$sh = DisplayMessage($part3);
						if($show) echo $sh;
						}
					}
			$sh = DisplayMessage($part2);
			if($show) $sh;
			}
		}
//	if($ii=3) print_r($part->countParts());
	$sh = DisplayMessage($part);
	if($show) echo $sh;
	}
}


function decode_mime_string($subject) {
    
	$newresult = "";
    $string = str_replace('?= =?','?==?',$subject);
    if(($pos = strpos($string,"=?")) === false) 
    	{
//		$string = str_replace(array("<",">"),array("(",")"),$string);
    	$result = make_mail_lnk( $string );
    	return $string;
    	}
    while(!($pos === false)) {
        $newresult .= substr($string,0,$pos);
        $string = substr($string,$pos+2,strlen($string));
        $intpos = strpos($string,"?");
        $charset = substr($string,0,$intpos);
        $enctype = strtolower(substr($string,$intpos+1,1));
        $string = substr($string,$intpos+3,strlen($string));
        $endpos = strpos($string,"?=");
        $mystring = substr($string,0,$endpos);
        $string = substr($string,$endpos+2,strlen($string));
        if($enctype == "q") $mystring = quoted_printable_decode(ereg_replace("_"," ",$mystring));
        else if ($enctype == "b") $mystring = base64_decode($mystring);
        $newresult .= $mystring;
        $pos = strpos($string,"=?");
    }

    $result = $newresult.$string;
    if(eregi("KOI8", $subject) ) { $result = iconv('KOI8-R', 'UTF-8', $result); }
	if(eregi("windows-1251", $subject)) { $result = iconv('windows-1251', 'UTF-8', $result); }
	        
	$result = str_replace(array("<",">"),array("(",")"),$result);
    $result = make_mail_lnk ($result);
        
    return $result;
}



function printArray( $a ){

	$tt=var_export($a);
	$tt = str_replace(',',',<br>',$tt);  
	return $tt;

 }


function transformHTML($str) {
   if ((strpos($str,"<HTML") < 0) || (strpos($str,"<html")    < 0)) {
  		$makeHeader = "<html><head><meta http-equiv=\"Content-Type\"    content=\"text/html; charset=iso-8859-1\"></head>\n";
   	if ((strpos($str,"<BODY") < 0) || (strpos($str,"<body")    < 0)) {
   		$makeBody = "\n<body>\n";
   		$str = $makeHeader . $makeBody . $str ."\n</body></html>";
   	} else {
   		$str = $makeHeader . $str ."\n</html>";
   	}
   } else {
   	$str = "<meta http-equiv=\"Content-Type\" content=\"text/html;    charset=iso-8859-1\">\n". $str;
   }
   	return $str;
 }
   

function txt_to_html($dataTxt)
{
   $msgBody = ereg_replace("\n","<br>",$dataTxt);
   $msgBody = preg_replace("/([^\w\/])(www\.[a-z0-9\-]+\.[a-z0-9\-]+)/i","$1http://$2",    $msgBody);
   $msgBody = preg_replace("/([\w]+:\/\/[\w-?&;#~=\.,\/\@]+[\w\/])/i","<A    TARGET=\"_blank\" HREF=\"$1\">$1</A>", $msgBody);
   $msgBody = make_mail_lnk($msgBody);
   return $msgBody;
}


function make_mail_lnk($string)
{
 return preg_replace("/([\w-?&;#~=\.\/]+\@(\[?)[a-zA-Z0-9\-\.]+\.([a-zA-Z]{2,3}|[0-9]{1,3})(\]?))/i","<A    HREF=\"mailto:$1\">$1</A>",$string);
 return $string;
}


function formatBytes($b,$p = null) {
    /**
     * 
     * @author Martin Sweeny
     * @version 2010.0617
     * 
     * returns formatted number of bytes. 
     * two parameters: the bytes and the precision (optional).
     * if no precision is set, function will determine clean
     * result automatically.
     * 
     **/
    $units = array("B","kB","MB","GB","TB","PB","EB","ZB","YB");
    $c=0;
    if(!$p && $p !== 0) {
        foreach($units as $k => $u) {
            if(($b / pow(1024,$k)) >= 1) {
                $r["bytes"] = $b / pow(1024,$k);
                $r["units"] = $u;
                $c++;
            }
        }
        return number_format($r["bytes"],2) . " " . $r["units"];
    } else {
        return number_format($b / pow(1024,$p)) . " " . $units[$p];
    }
}


function russian_date(){
$date=explode(".", date("j.m.Y"));
switch ($date[1]){
case 1: $m='января'; break;
case 2: $m='февраля'; break;
case 3: $m='марта'; break;
case 4: $m='апреля'; break;
case 5: $m='мая'; break;
case 6: $m='июня'; break;
case 7: $m='июля'; break;
case 8: $m='августа'; break;
case 9: $m='сентября'; break;
case 10: $m='октября'; break;
case 11: $m='ноября'; break;
case 12: $m='декабря'; break;
}
return $date[0].'&nbsp;'.$m.'&nbsp;'.$date[2];
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




?>
