<?php

function translit($string)
{
    $converter = array(
        'а' => 'a',   'б' => 'b',   'в' => 'v',
        'г' => 'g',   'д' => 'd',   'е' => 'e',
        'ё' => 'e',   'ж' => 'zh',  'з' => 'z',
        'и' => 'i',   'й' => 'y',   'к' => 'k',
        'л' => 'l',   'м' => 'm',   'н' => 'n',
        'о' => 'o',   'п' => 'p',   'р' => 'r',
        'с' => 's',   'т' => 't',   'у' => 'u',
        'ф' => 'f',   'х' => 'h',   'ц' => 'c',
        'ч' => 'ch',  'ш' => 'sh',  'щ' => 'sch',
        'ь' => "",  'ы' => 'y',   'ъ' => "",
        'э' => 'e',   'ю' => 'yu',  'я' => 'ya',
 
        'А' => 'A',   'Б' => 'B',   'В' => 'V',
        'Г' => 'G',   'Д' => 'D',   'Е' => 'E',
        'Ё' => 'E',   'Ж' => 'Zh',  'З' => 'Z',
        'И' => 'I',   'Й' => 'Y',   'К' => 'K',
        'Л' => 'L',   'М' => 'M',   'Н' => 'N',
        'О' => 'O',   'П' => 'P',   'Р' => 'R',
        'С' => 'S',   'Т' => 'T',   'У' => 'U',
        'Ф' => 'F',   'Х' => 'H',   'Ц' => 'C',
        'Ч' => 'Ch',  'Ш' => 'Sh',  'Щ' => 'Sch',
        'Ь' => "",  'Ы' => 'Y',   'Ъ' => "",
        'Э' => 'E',   'Ю' => 'Yu',  'Я' => 'Ya', ' ' => '_','#' => '', '!'=>'.', '?'=>'.', ','=>'.','$'=>'','%'=>'','@'=>'-','&'=>'_AND_','*'=>'','('=>'_',')'=>'_',
    );
    return strtr($string, $converter);
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

$today = date("m-Y"); 
//$filename = translit($_FILES['file']['name']);
$filename = ($_FILES['file']['name']);

// This is a simplified example, which doesn't cover security of uploaded files. 
// This example just demonstrate the logic behind the process.
$dir = '../../../upload/files'.$_COOKIE['4tree_user_id'].'/'.$today."/";

mkdir('../../../upload/files/'.$_COOKIE['4tree_user_id'],0777);
mkdir('../../../upload/files/'.$_COOKIE['4tree_user_id'].'/'.$today,0777);

copy($_FILES['file']['tmp_name'], '../../../upload/files/'.$_COOKIE['4tree_user_id'].'/'.$today."/".$filename);

$fsize=''.$filename.' ('.russian_date().' — '.formatBytes($_FILES['file']['size']).')';
					
$array = array(
	'filelink' => './upload/files/'.$_COOKIE['4tree_user_id'].'/'.$today."/".$filename,
	'filename' => $fsize
);

echo json_encode($array);
	

?>