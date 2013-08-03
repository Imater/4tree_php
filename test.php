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