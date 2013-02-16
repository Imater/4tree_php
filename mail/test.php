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


$i=1;
$s=1;

$message = $mail[$_GET['id']];

$content = $message->getContent();

//echo $message->isMultipart();
$title = decode_mime_string( $message->subject );

echo "title = ".$title."<br>";
//echo "content = ".$content."<br>";

$part = $message;

$myparts = array();


function getPart($part)
{

  if($part->isMultipart()) 
  	{
  	$myparts[] = $part->getPart($part);
  	}
  	$myparts[] = $part;
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
   $msgBody = preg_replace("/([\w]+:\/\/[\w-?&;#~=\.\/\@]+[\w\/])/i","<A    TARGET=\"_blank\" HREF=\"$1\">$1</A>", $msgBody);
   $msgBody = preg_replace("/([\w-?&;#~=\.\/]+\@(\[?)[a-zA-Z0-9\-\.]+\.([a-zA-Z]{2,3}|[0-9]{1,3})(\]?))/i","<A    HREF=\"mailto:$1\">$1</A>",$msgBody);
   return $msgBody;
}

function DisplayMessage($part)
{
$answer = "";
	echo $part->contentType."<br>";
	$type = explode(";",$part->contentType);
	
	if($type[0]=="message/rfc822")
		{
		echo "<hr><hr>";
		$mymessage_txt = $part->getContent();
		
		$mymessage = new Zend_Mail_Message( array('raw' => $mymessage_txt) );
		
		myShowParts($mymessage);
		
		
		
		
		echo "<hr><hr>";
		}

	if($type[0]=="text/html") 
		{
		$answer = ( decode_mime_string( base64_decode($part->getContent()) ) );
//	    if(eregi("KOI8", $type[1]) OR true ) { $answer = iconv('KOI8-R', 'UTF-8', $answer); }
//	    $answer = transformHTML($answer);
		$answer = quoted_printable_decode ( decode_mime_string( ($part->getContent()) ) );
	    if(eregi("KOI8", $type[1]) ) { $answer = iconv('KOI8-R', 'UTF-8', $answer); }
	    if(eregi("windows-1251", $type[1])) { $answer = iconv('windows-1251', 'UTF-8', $answer); }
		}

	if($type[0]=="text/plain") 
		{
		//base64_decode
		$answer = txt_to_html( quoted_printable_decode( decode_mime_string( ($part->getContent()) ) ) );
	    if(eregi("koi8", $type[1]) ) { $answer = iconv('KOI8-R', 'UTF-8', $answer); }
	    if(eregi("windows-1251", $type[1])) { $answer = iconv('windows-1251', 'UTF-8', $answer); }
		}

	if( ($type[0]=="image/jpeg") || ($type[0]=="image/png") )
		{
		  $typename = $type[1];
		  $typename = decode_mime_string( $typename );
		  $filename = trim(ereg_replace('name=|"','',$typename));
		  $file = "upload/".$filename;
		  $content = base64_decode($part->getContent());
		  file_put_contents($file,$content);
		  $answer = "<br><img src='../mail/".$file."'><br>".$filename."<hr>";
		}

	if( in_array($type[0],array("application/msword","application/pdf","application/octet-stream","application/vnd.ms-excel")) )
		{
		  $typename = $type[1];
		  $typename = decode_mime_string( $typename );
		  $filename = trim(ereg_replace('name=|"','',$typename));
		  $file = "upload/".$filename;
		  $content = base64_decode($part->getContent());
		  file_put_contents($file,$content);
		  $answer = "<br><a href='../mail/".$file."'>".$filename."</a>";
		}

	
	return $answer."<br>";
}

$j=1;


myShowParts($message);

function myShowParts($message)
{
$counts = $message->countParts();
echo $message->contentType."<hr>";

for($ii=1; $ii<=$counts; $ii++)
	{
	echo $ii."<br>";
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
						echo DisplayMessage($part3);
						}
					}
			echo DisplayMessage($part2);
			}
		}
//	if($ii=3) print_r($part->countParts());
	echo DisplayMessage($part);
	}
}


exit;
//print_r($message->getPart(1));
//print_r($message->getPart(2));
print_r($message->getPart(3));

exit;

while ($part->isMultipart()) {
    $part = $message->getPart($j);
    echo DisplayMessage($part);
    $part2 = $part;
    
	$k = 1;
    while ($part2->isMultipart()) {
	    $part2 = $part->getPart($j);
	    echo "<b>".$k."</b> = ".$part2->contentType."<br>";
	    echo DisplayMessage($part2);
	    $k++;
	    }
    
    echo "<b>".$j."</b> - ".$part->contentType."<br>";
    echo DisplayMessage($part);

    //print_r($part);
    $j++;
    }


//    $part = $message->getPart(2);
    
//    print_r($part);



exit;

foreach ($mail as $message) {
echo "<h1>$i</h1>";
echo "<hr><font color=blue>";

// get the first none multipart part
$part = $message;

$j=1;
while ($part->isMultipart()) {
    $part = $message->getPart($j);
    echo $j;
    //print_r($part);
    $j++;
    }

continue;

echo 'Type of this part is ' . strtok($part->contentType, ';') . "\n";
//echo "Content:\n";
//echo $part->getContent();
$content = base64_decode($part->getContent());

//echo $content;

echo "<h1>".strtok($part->contentType, ';')."</h1>";

if( strtok($part->contentType, ';') == 'image/jpeg' )
 {
  echo 'Going to save!!!!!!!!!!!!!!!!';
  $file = "upload/!!!image".$s.".jpg";
  $s++;
  echo file_put_contents($file,$content);
  echo "<img src='../image.php?width=250&height=250&cropratio=1.1:1&image=/mail/".$file."'><hr>";
 }
echo "</font><hr>";

//echo $message->getContent();
//echo '<b>return = '.$mail->getReturnPath().'</b>';

foreach ($message->getHeaders() as $name => $value) {
    if (is_string($value)) {
        echo "$name: $value<br>";
        continue;
    }
    foreach ($value as $entry) {
        echo "$name: $entry<br>";
    }
}

echo '<hr><hr>';
    $from = str_replace(array("<",">"),array("",""),decode_mime_string($message->from));
    echo "<hr>Mail from '{".$from."}'<br>\n";
    echo "<b>".decode_mime_string($message->subject).'</b><br>';
    print_r($mail->getSize()).'<br>';
    print_r($message->getHeader('received', 'array'));
    echo '<hr>';
    $messageheader = $mail->getMessage($i);
    print_r($messageheader);
    $i++;
    
    
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
    if(eregi("KOI8", $subject) OR true ) { $result = iconv('KOI8-R', 'UTF-8', $result); }
        
    return $result;
}



function printArray( $a ){

	$tt=var_export($a);
	$tt = str_replace(',',',<br>',$tt);  
	return $tt;

 }

?>

<?
/*
	$ServerName = "{mail.4tree.ru/imap:143}INBOX"; // For a IMAP connection    (PORT 143)

//	$ServerName = "{imap.gmail.com:993/imap/ssl/novalidate-cert/norsh}INBOX"; // For a IMAP connection    (PORT 143)
//   $ServerName = "{localhost/pop3:110}INBOX"; // For a POP3 connection    (PORT 110)

   $ServerName = "{mail.4tree.ru/pop3:110}INBOX"; // For a POP3 connection    (PORT 110)


	$ServerName = "{mail.4tree.ru:993/imap/ssl/novalidate-cert/norsh}INBOX"; // For a IMAP connection    (PORT 143)
   
   $UserName = "4tree@4tree.ru";
   $PassWord = "uuS4foos_VE";
   
   $mbox = imap_open($ServerName, $UserName,$PassWord) or die("Could not open Mailbox - try again later!");
   
   if ($hdr = imap_check($mbox)) {
	   echo "Num Messages " . $hdr->Nmsgs ."\n\n<br><br>";
   	$msgCount = $hdr->Nmsgs;
   } else {
   	echo "failed";
   }
   $MN=$msgCount;
   $overview=imap_fetch_overview($mbox,"1:$MN",0);
   $size=sizeof($overview);
   
   echo "<table border=\"0\" cellspacing=\"0\" width=\"582\">";
   
   for($i=$size-1;$i>=0;$i--){
   	$val=$overview[$i];
		$msg=$val->msgno;
   	$from=$val->from;
  		$date=$val->date;
		$subj=$val->subject;
   	$seen=$val->seen;
   
	   $from = ereg_replace("\"","",$from);
   
	   // MAKE DANISH DATE DISPLAY
   	list($dayName,$day,$month,$year,$time) = split(" ",$date); 
		$time = substr($time,0,5);
   	$date = $day ." ". $month ." ". $year . " ". $time;
   
   	if ($bgColor == "#F0F0F0") {
   		$bgColor = "#FFFFFF";
   	} else {
			$bgColor = "#F0F0F0";
		}
   
		if (strlen($subj) > 60) {
   		$subj = substr($subj,0,59) ."...";
		}
   
   	echo "<tr bgcolor=\"$bgColor\"><td colspan=\"2\">$from</td><td colspan=\"2\">$subj</td>
   		 <td class=\"tblContent\" colspan=\"2\">$date</td></tr>\n";
   }
	echo "</table>";
   imap_close($mbox);










exit;
*/
?>