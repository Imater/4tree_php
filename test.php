<head>
<script src="js/jquery-1.10.1.min.js"></script>
<script src="js/jquery-ui-1.10.3.custom.min.js"></script>
<script src="js/mjs.js"></script>	  	  


<link rel="stylesheet" type="text/css" href="css/ui/css/smoothness/jquery-ui-1.8.21.custom.css"/>
</head>

<body>

<script>

$(document).ready(function(){
	$('.sortable').nestedSortable({
            handle: 'div',
            items: 'li',
            toleranceElement: '> div'
        });
});

</script>

<?

$url = "grant_type=password&username=8ab96bed02fc697de66ac528bcd4814f&password=b800d2f5131c9512e5644925479673eb&client_id=4tree_web&client_secret=4tree_passw&secret=888";


	if(class_exists('Memcache')){
  // Memcache is enabled.
  	echo "HELLO!!!";
  	}
  	
  	$memcache_obj = new Memcache;
  	$t = microtime();
  	$memcache_obj->connect('localhost', 11211);
  	echo (microtime()-$t)."<hr>";
  	$var_key = $memcache_obj->get('our_var');
  	if(!empty($var_key)) {
  	    //Если объект закэширован, выводим его значение
  	    echo $var_key;
  	} else {
	  	$memcache_obj->set('our_var', date('G:i:s'), false, 60000);
	  	echo $memcache_obj->get('our_var');
  	}
  	print_r( $memcache_obj->getStats() );
  	$memcache_obj->close();
?>


<ol class="sortable">
    <li><div>Some content</div></li>
    <li>
        <div>Some content</div>
        <ol>
            <li><div>Some sub-item content</div></li>
            <li><div>Some sub-item content</div></li>
        </ol>
    </li>
    <li><div>Some content</div></li>
</ol>
</body>