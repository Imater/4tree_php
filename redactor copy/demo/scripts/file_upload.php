<?php

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
$date=explode(".", date("d.m.Y"));
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



// This is a simplified example, which doesn't cover security of uploaded files. 
// This example just demonstrate the logic behind the process.

$dir = '../../../upload/';

copy($_FILES['file']['tmp_name'], '../../../upload/files/'.$_FILES['file']['name']);

$fsize='<b>'.$_FILES['file']['name'].'</b> ('.russian_date().' — '.formatBytes($_FILES['file']['size']).')';
					
$array = array(
	'filelink' => './upload/files/'.$_FILES['file']['name'],
	'filename' => $fsize
);

echo json_encode($array);
	

?>