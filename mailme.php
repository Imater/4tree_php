<?php
//#!/usr/bin/php

require_once('Zend/Mail/Storage/Pop3.php');

$mail = new Zend_Mail_Storage_Pop3(array('host' => 'mail.4tree.ru',
										 'user'=> '4tree@4tree.ru',
										 'password' => 'uuS4foos_VE'));
                                         
echo $mail->countMessages() . " messages found\n";

$i=1;
$s=1;


foreach ($mail as $message) {
echo "<h1>$i</h1>";
echo "<hr><font color=blue>";

// get the first none multipart part
$part = $message;
while ($part->isMultipart()) {
    $part = $message->getPart(1);
}
echo 'Type of this part is ' . strtok($part->contentType, ';') . "\n";
//echo "Content:\n";
//echo $part->getContent();
$content = base64_decode($part->getContent());

echo "<h1>".strtok($part->contentType, ';')."</h1>";

if( strtok($part->contentType, ';') == 'image/jpeg' )
 {
  echo 'Going to save!!!!!!!!!!!!!!!!';
  $file = "/upload/!!!image".$s.".jpg";
  $s++;
  echo file_put_contents($file,$content);
 }
echo "<img src='/".$file."'><hr>";
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
    if(eregi("koi8", $subject)) { $result = iconv('koi-8', 'UTF-8', $result); }
    
    return $result;
}



function printArray( $a ){

	$tt=var_export($a);
	$tt = str_replace(',',',<br>',$tt);  
	return $tt;

 }





exit;

function getFileExtension($fileName){
   $parts=explode(".",$fileName);
   return $parts[count($parts)-1];
}

$server = 'mail.4tree.ru';
$user_name = '4tree@4tree.ru';
$password = 'uuS4foos_VE';


$imap = imap_open($server, $username, $password) or die("imap connection error");
$message_count = imap_num_msg($imap);
for ($m = 1; $m <= $message_count; ++$m){

    $header = imap_header($imap, $m);
    print_r($header);

    $email[$m]['from'] = $header->from[0]->mailbox.'@'.$header->from[0]->host;
    $email[$m]['fromaddress'] = $header->from[0]->personal;
    $email[$m]['to'] = $header->to[0]->mailbox;
    $email[$m]['subject'] = $header->subject;
    $email[$m]['message_id'] = $header->message_id;
    $email[$m]['date'] = $header->udate;

    $from = $email[$m]['fromaddress'];
    $from_email = $email[$m]['from'];
    $to = $email[$m]['to'];
    $subject = $email[$m]['subject'];

    echo $from_email . '</br>';
    echo $to . '</br>';
    echo $subject . '</br>';

    $structure = imap_fetchstructure($imap, $m);

    $attachments = array();
    if(isset($structure->parts) && count($structure->parts)) {

        for($i = 0; $i < count($structure->parts); $i++) {

            $attachments[$i] = array(
                'is_attachment' => false,
                'filename' => '',
                'name' => '',
                'attachment' => ''
            );

            if($structure->parts[$i]->ifdparameters) {
                foreach($structure->parts[$i]->dparameters as $object) {
                    if(strtolower($object->attribute) == 'filename') {
                        $attachments[$i]['is_attachment'] = true;
                        $attachments[$i]['filename'] = $object->value;
                    }
                }
            }

            if($structure->parts[$i]->ifparameters) {
                foreach($structure->parts[$i]->parameters as $object) {
                    if(strtolower($object->attribute) == 'name') {
                        $attachments[$i]['is_attachment'] = true;
                        $attachments[$i]['name'] = $object->value;
                    }
                }
            }

            if($attachments[$i]['is_attachment']) {
                $attachments[$i]['attachment'] = imap_fetchbody($imap, $m, $i+1);
                if($structure->parts[$i]->encoding == 3) { // 3 = BASE64
                    $attachments[$i]['attachment'] = base64_decode($attachments[$i]['attachment']);
                }
                elseif($structure->parts[$i]->encoding == 4) { // 4 = QUOTED-PRINTABLE
                    $attachments[$i]['attachment'] = quoted_printable_decode($attachments[$i]['attachment']);
                }
            }
        }
    }

    foreach ($attachments as $key => $attachment) {
        $name = $attachment['name'];
        $contents = $attachment['attachment'];
        file_put_contents($name, $contents);
    }

    //imap_setflag_full($imap, $i, "\\Seen");
    //imap_mail_move($imap, $i, 'Trash');
}

imap_close($imap);




exit;
	
	$txt = "test";
	$fp = fopen('www/4tree.ru/upload/mytext.txt', "a+");
	echo "hi".$fp;
	fwrite($fp, $txt);
	fclose($fp);
	
exit;



?>