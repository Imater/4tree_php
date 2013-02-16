<?php
include('db2.php');

$_GET['user']='JohnW';

if($_GET['user'])
{
$user=$_GET['user'];
?>


	
<div style="width:550px; float:left; margin:30px">





<ol id="update" >


</ol>

<div id="flash"></div>

<div>
<div align="left">
<table>
<tr><td>
<input type='text' class="textbox" name="content" id="content" maxlength="145" />
</td><td valign="top">
<input type="submit"  value=">>"  id="post" class="post" name="post"/>

</td></tr>
</table>

</div>

</div>

</div>


<?php 
}
else
{
echo "URL должно быть вида chat.php?user=yourname";
}
?>
