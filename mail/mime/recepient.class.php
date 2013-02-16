<?php
class recepient{
	public $name;
	public $email;
	function __construct($addr){
		preg_match("@([^<]*)<(.*)>@is",$addr,$rez);
		if($rez){
			$this->name=trim($rez[1]);
			$this->email=trim($rez[2]);
		}
		else{
			$this->email=trim($addr);
		}
		//$this->orig=$addr;
	}
}