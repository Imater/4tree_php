<?
require_once("db.php");



if (isset($HTTP_GET_VARS['send_message'])) 
{
  push(array("am"),array('type' => "check", 'from' => "11", 'txt' => "Проверка связи"));	
}

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=utf-8">
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width">

<html>
<head>
<title>4tree.ru — монитор</title>

<link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
<link rel="icon" href="favicon.ico" type="image/x-icon" />


<link rel="stylesheet" type="text/css" href="css/monitor.css">

<script src="js/jquery.js"/></script>
<script src="js/pushstream.js"/></script>
<script src="js/monitor.js"/></script>
</head>


<body onload="javascript:jsDoFirst();" style="font-size:10px;">
<h1>Монитор <span class="icon-dot">&middot;</span></h1>
<div id="container"></div>

</body>
</html>
