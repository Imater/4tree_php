<?
require_once 'simple_html_dom.php';
$data = file_get_html('http://xdan.ru');
if($data->innertext!='' and count($data->find('a'))){
	foreach($data->find('a') as $a){
		echo '<a href="http://xdan.ru/'.$a->href.'">'.$a->plaintext.'</a></br>';
	}
}
function my_callback($element) {
       if ($element->tag=='span')
                $element->outertext = '<b>'.$element->innertext. '</b>';// заменим все span элементы на b
} 
$html  = str_get_html('<span>bar</span><span>pole</span><span>sushi</span><a>okno</a>');
// Регистрация функции обратного вызова с ее именем
$html->set_callback('my_callback');

	

?>