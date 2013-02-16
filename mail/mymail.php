<html lang="ru" class="" manifest="">
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=utf-8">
<meta charset="utf-8">
<?
ini_set('memory_limit', '-1');
require_once('Zend/Mail/Storage/Imap.php');

$mail = new Zend_Mail_Storage_Imap(array('host' => 'mail.4tree.ru',
										 'user'=> '4tree@4tree.ru',
										 'password' => 'uuS4foos_VE'));
                                         
echo $mail->countMessages() . " messages found<br>";

$show = false;

$i=1;
$s=1;

//foreach ($mail as $message) {
if(isset($_GET['id']))
	{
		$kk = $_GET['id'];
		$txt = "";
		$j=0;
		ShowOneMessage($kk,$mail);
	}
else
	{
	for($kk=count($mail); $kk>0; $kk--) {
		$txt = "";
		$j=0;
		ShowOneMessage($kk,$mail);
		echo "<br><br><br><hr><h1>- - - - - - - - - - - ".$kk." - - - - - - - - - - - - </h1><br><br><br><br>";
		}
	}

function ShowOneMessage($id,$mail)
{
global $txt,$show,$j;

$message = $mail[$id];
$txt["id"] = $id;

$title = decode_mime_string( $message->subject ); //заголовок сообщения

$txt["title"] = $title;

if($show) echo "title = ".$title."<br>";

$part = $message;

$j=0;
myShowParts($message);
if($show) echo "<hr><hr>";
if($show) print_r($txt);
if($show) echo "<hr><hr>";
echo composeHtml($txt);
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
			if($hasHtml) $html_text .= $txt["parts"][$i]["txt"];
			else $plain_text .= $txt["parts"][$i]["txt"];
			}
		}

	if($hasHtml) $html_text = $html_text;
	else $html_text = $plain_text;
	

	$html_text = "<h1>".$txt["title"]."</h1>".$html_text;
	
	return $html_text;	
}


function DisplayMessage($part)
{
global $j,$txt,$show;
$answer = "";
if($show) 	echo $part->contentType."<br>";
	if($show) print_r( $part );
	$type = explode(";",$part->contentType);

	$answer = $part->getContent();
	
	$header=$part->getHeaders();
	@$header_encoding = $header["content-transfer-encoding"];
	
//	echo $header_encoding."<br>";
	
	if($header_encoding=="base64") $answer =  ( base64_decode( $answer ) );
	if($header_encoding=="binary") $answer = imap_base64(imap_binary($answer));
	if($header_encoding=="quoted-printable") $answer =  ( quoted_printable_decode( $answer ) );
	if($header_encoding=="8bit") $answer =  ( quoted_printable_decode( imap_8bit($answer) ) );
	if($header_encoding=="7bit") { $answer =  ( quoted_printable_decode( imap_8bit($answer) ) );  }
	
//	echo $type[0]."<br>";
    echo "<b>".$type[0]."</b>, ";
	
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
	    if(eregi("KOI8", $type[1]) ) { $answer = iconv('KOI8-R', 'UTF-8', $answer); }
	    if(eregi("windows-1251", $type[1])) { $answer = iconv('windows-1251', 'UTF-8', $answer); }
	    $txt["parts"][$j]["type"] = $type[0];
	    $txt["parts"][$j]["txt"] = $answer;
	    $j++;
		}

	if($type[0]=="text/plain") 
		{
		//base64_decode
		$answer = txt_to_html( decode_mime_string($answer) );
	    if(eregi("koi8", $type[1]) ) { $answer = iconv('KOI8-R', 'UTF-8', $answer); }
	    if(eregi("windows-1251", $type[1])) { $answer = iconv('windows-1251', 'UTF-8', $answer); }
	    $txt["parts"][$j]["type"] = $type[0];
	    $txt["parts"][$j]["txt"] = $answer;
	    $j++;
		}

	if( ($type[0]=="image/jpeg") || ($type[0]=="image/png") )
		{
		  $typename = $type[1];
		  $typename = decode_mime_string( $typename );
		  $filename = trim(ereg_replace('name=|"','',$typename));
		  $file = "upload/".$filename;
		  if(file_exists($file)) 
		  		{
		  		$filename = rand(0,9999999)."-".$filename;
				$file = "upload/".$filename;
		  		}
		  $content = $answer;
		  file_put_contents($file,$content);
		  $answer = "<br><img width='200' src='../mail/".$file."'><br>".$filename."<hr>";
		  $txt["parts"][$j]["type"] = $type[0];
	      $txt["parts"][$j]["txt"] = $answer;
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
		  	
		  $file = "upload/".$filename;
		  
		  if(file_exists($file)) 
		  		{
		  		$filename = rand(0,9999999)."-".$filename;
				$file = "upload/".$filename;
		  		}
		  
		  $content = $answer;
		  file_put_contents($file,$content);
		  $answer = "<br><a href='../mail/".$file."'>".$filename."</a>";
		  $txt["parts"][$j]["type"] = $type[0];
	      $txt["parts"][$j]["txt"] = $answer;
	      $j++;
		}

	
	return $answer."<br>";
}

/////////////////////////////////////////////////////////////////

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
    if(($pos = strpos($string,"=?")) === false) return $string;
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
   $msgBody = preg_replace("/([\w-?&;#~=\.\/]+\@(\[?)[a-zA-Z0-9\-\.]+\.([a-zA-Z]{2,3}|[0-9]{1,3})(\]?))/i","<A    HREF=\"mailto:$1\">$1</A>",$msgBody);
   return $msgBody;
}


?>