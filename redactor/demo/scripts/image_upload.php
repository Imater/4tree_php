<?php
 
// This is a simplified example, which doesn't cover security of uploaded images. 
// This example just demonstrate the logic behind the process. 
 
$today = date("m-Y"); 
 
// files storage folder
$dir = '../../../upload/'.$_COOKIE['4tree_user_id'].'/'.$today."/";

mkdir('../../../upload/'.$_COOKIE['4tree_user_id'],0777);
mkdir('../../../upload/'.$_COOKIE['4tree_user_id'].'/'.$today,0777);

 
$_FILES['file']['type'] = strtolower($_FILES['file']['type']);
 
if ($_FILES['file']['type'] == 'image/png' 
|| $_FILES['file']['type'] == 'image/jpg' 
|| $_FILES['file']['type'] == 'image/gif' 
|| $_FILES['file']['type'] == 'image/jpeg'
|| $_FILES['file']['type'] == 'image/pjpeg')
{	
    // setting file's mysterious name
    $filename = substr(md5(date('YmdHis')),0,5).'.jpg';
    $file = $dir.$filename;


    // copying
    if(!copy($_FILES['file']['tmp_name'], $file)) 
       {
       print_r($_FILES);
       };

    // displaying file    
    $newurl = 'upload/'.$_COOKIE['4tree_user_id'].'/'.$today."/".$filename;
	$array = array(
		'filelink' => $newurl
	);
	
	echo stripslashes(json_encode($array));   
    
}
 
?>