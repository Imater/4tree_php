<div id="counter">0</div><!--progressbar-->
<?
set_time_limit(0); // это для того чтобы скрипт не отвалился через 30 секунд, если вддруг попадется медленный сайт донор
require_once 'simple_html_dom.php';
function getBigImage($url){
	$data = @file_get_contents($url);
	if(trim($data)=='')return false; // бывает что сайт недоступен, его фото мы не грузим
	$data = str_get_html($data);
	// находим фото
	if( count($data->find('#i-main-pic')) ){
		$dataimg = @file_get_contents($data->find('#i-main-pic',0)->src); // собачка нужна в если сервер нам вернул 404, это выозвет Warning:, поэтому экранируем ошибки
		if(trim($dataimg)=='')return false; // фото не доступно, его не грузим
		file_put_contents( 'data/'.md5($url).'.jpg', $dataimg ); // сохрпаняем в файл
	}
	$data->clear();// подчищаем за собой
	unset($data);
}
function getYandexImages($url,$findpages = true){
	global $i,$n;
	// загружаем данный URL
	$data = @file_get_contents($url);
	$data = str_get_html($data);
	// очищаем страницу от лишних данных, это не обязательно, но когда HTML сильно захламлен бывает удобно почистить его, для дальнейшего анализа
	foreach($data->find('script,link,comment') as $tmp)$tmp->outertext = '';
	// находим URL страниц только для первого вызова функции
	if( $findpages and count($data->find('div.b-pager__pages a'))){
		foreach($data->find('div.b-pager__pages a') as $a){	
			// довольно распространенный случай - локальный URL. Поэтому иногда url надо дополнять до полного
			if( !preg_match('#^http://#',$a->href) )$a->href = 'http://images.yandex.ru'.$a->href;
			// и еще дна тонкость, &amp; надо заменять на &
			$a->href = str_replace('&amp;','&',$a->href);
			// вызываем функцию для каждой страницы
			getYandexImages($a->href,false);
		}
	}
	// находим все изображения на странице, а точнее ссылки на них
	if(count($data->find('div.b-image a img'))){
		foreach($data->find('div.b-image a') as $a){
			if( !preg_match('#^http://#',$a->href) )$a->href = 'http://images.yandex.ru'.$a->href;
			$a->href = str_replace('&amp;','&',$a->href);
			getBigImage($a->href);
			if($i++>=$n)exit; // завершаем работу если скачали достаточно фотографий
			// этакий progressbar, будет показывать сколько фотографий уже загружено
			echo '<script>document.getElementById("counter").innerHTML = "Загружено: '.$i.' из '.$n.' фото";</script>';
			flush();
		}
	}
	$data->clear();// подчищаем за собой
	unset($data);
}
// поисковый URL
$i = 1;
$n = 20; // будем грабить 20 картинок
$url = 'http://images.yandex.ru/yandsearch?text='.urlencode('Джессика Альба').'&rpt=image';
getYandexImages($url);
?>