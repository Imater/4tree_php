<?php
require_once('mail.class.php');
require_once('recepient.class.php');
class mailParser{
	/**
	 * Enter description here...
	 *
	 * @param stdClass $mail
	 * @return mail
	 */
	function niceClass($mail){
		$ret=new mail();
		$ret->date=date("Y-m-d H:i:s",strtotime($mail->header['Date']));
		$ret->from=new recepient($mail->header['From']);
		$ret->to=self::exportAdresses($mail->header['To']);
		$ret->cc=self::exportAdresses($mail->header['CC']);
		$ret->subject=$mail->header['Subject'];
		$ret->text=self::exportContent($mail,'text');
		$ret->html=self::exportContent($mail,'html');
		$ret->attachments=self::exportAttachments($mail,'html');

		return $ret;
	}
	function exportAttachments($from){
		$ret=array();
		if(is_object($from)){
			if(isset($from->header['Content-ID']) || $from->header['Content-Transfer-Encoding']=='base64'){
				$contentId=$from->header['Content-ID'];
				$contentId=preg_replace('@^.@is','',$contentId); 
				$contentId=preg_replace('@.$@is','',$contentId);
				$from->header['Content-ID']=$contentId;
				$contentType=$from->header['Content-Type'];
				$contentEncoding=$from->header['Content-Transfer-Encoding'];
				preg_match("@name=\"(.+)\"@Uis",$contentType,$name);
				$from->name=$name[1];
				if(!$from->name){
					if(strstr($contentType,'somethinglikeapp-pdf?/')){
					}
					else{
						preg_match("@/([^\s]+)@is",$contentType,$ext);
						$from->name='attachment.'.$ext[1];
					}
				}
				
				if(!$from->name){
					$from->name='unknown.strange';
				}
				if($contentEncoding=='base64'){
					$from->text=base64_decode($from->text);
				}
				$ret[]=$from;
			}
			else {
				$rez=self::exportAttachments($from->text);
				if(count($rez)){
					$ret=array_merge($ret,$rez);
				}
			}
		}
		elseif(is_array($from)){
			foreach ($from as $v){
				$rez=self::exportAttachments($v);
				if(count($rez)){
					$ret=array_merge($ret,$rez);
				}
			}
		}
		return $ret;
	}
	function exportContent($from,$type,$prevHeader=null){
		$delimitator="\n\n\n---------------------------------\n\n\n";
		$text=array();
		if($type=='text')$preg="@text.plain@is";
		if($type=='html')$preg="@text.html@is";
		if(!$preg)return ;

		if(is_object($from)){
			$exp=self::exportContent($from->text,$type,$from->header['Content-Type']);
			if($exp)$text[]=trim($exp);
		}
		elseif(is_array($from)){
			foreach ($from as $v){
				$exp=self::exportContent($v,$type);
				if($exp)$text[]=trim($exp);
			}
		}
		else{
			if($prevHeader==null || preg_match($preg,$prevHeader))
			$text[]=trim($from);
		}
		return implode($delimitator,$text);

	}
	function exportAdresses($tos){
		$tos=explode(';',$tos);
		foreach ($tos as $to){
			if(is_object($retTo))$retTo=array($ret->to);
			if(is_array($retTo)){
				$retTo[]=new recepient($to);
			}
			else{
				$retTo=new recepient($to);
			}
		}
		return $retTo;
	}
	function parse($mail){
		$mail=self::changeBoundries($mail);
		$mail=self::expPart($mail);
		$mail=self::clean($mail);
		$mail=self::expCont($mail);
		$mail=self::expHeaders($mail);
		return $mail;
	}
	function genBoundry(){
		return "--------".rand(100,999).rand(100,999).microtime(true)*100;
	}
	function changeBoundries($eml){
		$pregStart=preg_quote('boundary=',"@");
		$pregEnd=preg_quote('"',"@");
		preg_match_all("@{$pregStart}[\"']{0,1}([^\"'\s]+)@is",$eml,$boundries);
		$boundries=$boundries[1];
		$genBoundries=array();
		foreach ($boundries as $b) {
			$hash=sha1($b);
			if(!isset($genBoundries["{$hash}"])){
				$genBoundries["{$hash}"]=self::genBoundry();
			}
			$newBoundry=$genBoundries["{$hash}"];
			$eml=str_replace($b,$newBoundry,$eml);
		}
		return $eml;
	}
	function expHeader($header){
		$headers=array();
		if(!is_array($header) && !is_object($header)){
			$header=str_replace("\r\n","\n",$header);
			$header=str_replace("\n\r","\n",$header);
			$header=str_replace("\r","\n",$header);
			$linii=explode("\n",$header);
			foreach ($linii as $r){
				if(preg_match("@^[a-z0-9\-]+:@is",$r) || $r==''){
					$headers[]=trim($r);
				}
				else{
					$headers[count($headers)-1].=' '.trim($r);
				}
			}
			$headersTmp=$headers;
			unset($headers);
			foreach ($headersTmp as $k=>$h){
				preg_match("@^([a-z0-9\-]+):@is",$h,$name);
				$val=substr($h,strlen($name[0]));
				if(isset($headers["{$name[1]}"]) && !is_array($headers["{$name[1]}"]))$headers["{$name[1]}"]=array($headers["{$name[1]}"]);
				if(is_array($headers["{$name[1]}"]))
				{
					$headers["{$name[1]}"][]=trim($val);
				}
				else{
					$headers["{$name[1]}"]=trim($val);
				}
			}
		}
		return $headers;
	}
	function expHeaders($mail){
		if(is_object($mail)){
			$mail->header=self::expHeader($mail->header);
		}
		if(is_array($mail->text)){
			foreach ($mail->text as $k=>$v){
				if(is_object($v)){
					$mail->text["{$k}"]=self::expHeaders($v);
				}
			}
		}
		elseif(is_object($mail->text)){
			$mail->text=self::expHeaders($mail->text);
		}
		return $mail;
	}
	function expCont($mail){
		if(is_object($mail)){
			foreach ($mail->text as $k=>$v){
				$mail->text[$k]=self::expCont($v);
			}
		}
		else{
			$randuriTmp=explode("\n",$mail);
			$mail=new stdClass();
			$mail->header=array();
			$mail->text=array();
			$prevHeader=false;
			foreach ($randuriTmp as $r){
				if(!count($mail->text) && preg_match("@^[a-z0-9\-]+:@is",$r)){
					$mail->header[]=$r;
					$prevHeader=true;
				}
				elseif ($prevHeader && $r!==''){
					$mail->header[count($mail->header)-1].=$r;
					$prevHeader=true;
				}
				else{
					$prevHeader=false;
					$mail->text[]=$r;
				}
			}
			$implode="\n";
			$mail->header=trim(implode($implode,$mail->header));
			if(strstr($mail->header,'base64'))$implode="";
			$mail->text=trim(implode($implode,$mail->text));

		}
		if(strstr($mail->header,'quoted-printable') && is_string($mail->text)){
			$mail->text=quoted_printable_decode($mail->text);
		}
		return $mail;
	}
	function expPart($eml){
		preg_match("@(\n|\r)([-]{4,}[0-9]+)@is",$eml,$fPart);
		$fPart=$fPart[2];
		$ePart=$fPart.'--';
		$startPart=strpos($eml,$fPart);
		$endPart=strpos($eml,$ePart);
		
		$part=new stdClass();
		$part->header=substr($eml,0,$startPart);
		$part->text=substr($eml,$startPart+strlen($fPart),$endPart-$startPart);
		//$part->footer=substr($eml,$endPart,strlen($eml)-$startPart-strlen($ePart));
		
		$part->text=explode("\n".$fPart."\n",$part->text);
		foreach ($part->text as $k=>$v){
			if(strstr($v,"boundary=")){
				$v=self::expPart($v);
			}
			$part->text["{$k}"]=$v;
		}
		
		
		return $part;
	}
	function clean($part){
		if(is_object($part)){
			foreach ($part as $k=>$v){
				$part->$k=self::clean($v);
			}
		}
		elseif (is_array($part)){
			foreach ($part as $k=>$v){
				$part[$k]=self::clean($v);
			}
		}
		else{
			$part=self::cleanBoundry($part);
		}
		return $part;
	}
	function cleanBoundry($part){

		$part= preg_replace("@^(\n|\t|\s|\r)@is",'',$part);
		$part= preg_replace("@(\n|\t|\s|\r)$@is",'',$part);
		$part=preg_replace("@^([-]{4,}[0-9]+)--@is","",$part);
		$part=preg_replace("@^([-]{4,}[0-9]+)@is","",$part);
		$part=preg_replace("@([-]{4,}[0-9]+)--$@is","",$part);
		$part=preg_replace("@([-]{4,}[0-9]+)$@is","",$part);
		$part= preg_replace("@^(\n|\t|\s|\r)@is",'',$part);
		$part= preg_replace("@(\n|\t|\s|\r)$@is",'',$part);
		return $part;
	}
}