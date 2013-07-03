var main_data, preloader, my_all_frends, old_parent=1, old_title="4tree.ru", is_mobile = true;
var start_sync_when_idle=false, myr, note_saved = false;

$( window ).on( "orientationchange", function( event ) {
  onResize();
});

var tmr;
function onResize() {
	clearTimeout(tmr);
	if(false)
	tmr = setTimeout(function(){
		if($("#menuContent").css("bottom")=="1px") $("#menuContent").css("bottom","0");
		else $("#menuContent").css("bottom","1");	
	},50);
	
	//var new_height = $(window).height()-110;
	//$("#menuContent").height( new_height );
	//$(".ui-panel-content-wrap").css( "min-height",new_height+110 );
}

function jsRefreshTree() {
	console.info("refresh_tree");
}

/*
$(document).on('pageinit', '#home', function () {
		// code 
		var _menuLoaded = false;
		$('#menuPanel').load('menu.html', function () {
			$(this).find(":jqmData(role=listview)").listview();
			$(this).trigger("updatelayout");
			$.mobile.loading("hide");
			_menuLoaded = true;
		});
 
		$("#menuPanel").on("panelopen", function (event, ui) {
			if (!_menuLoaded) {
				$.mobile.loading("show");
				return;
			}
			$("#menuPanel").off("panelopen");
		});
	});
*/

function showCalendar() {
	var hide_did = !$("#hide_show_did").hasClass("show_did");

	api4tree.jsGetEvents("2000-01-01 00:00:00","2020-01-01 23:59:59",function(events){ 
		
		var markup = "<ul data-role='listview' data-inset='false'>";

  		function compare(a,b) {
  	  		  if (a.start < b.start)
   	  		     return -1;
   	  		  if (a.start > b.start)
   	  		    return 1;
   	  		  return 0;
   	  		}
    	  
  		events = events.sort(compare); //сортирую табы по полю tab


		$.each(events,function(i,el){
			markup += "<li data-icon='false' date1='"+el.start+"'><a class= '"+el.className+"' href='#note-items?node="+el.id+"'>"+el.title+"</a></li>";
		});
		markup += "</ul>";

		$('#menuPanelRight :jqmData(role=content)').html(markup);

		$('#menuPanelRight').find(":jqmData(role=listview)").listview({
			autodividers: true,
			autodividersSelector: function (li){
				var mytitle = li.attr("date1");
				mytitle = mytitle.split(" ")[0];

				mytitle = mytitle.split("-");
				mytitle = mytitle[2]+"-"+mytitle[1]+"-"+mytitle[0];

				return mytitle;
			}
		});

		setTimeout(function(){
			$("#menuCalendar").scrollTo($("#menuCalendar a.pasted:last"),500);
		},500);
		
		$('#menuPanelRight').trigger("updatelayout");


	},hide_did);


}



function jsRegAllKeys() {

	$(".ui-panel-content-wrap").swiperight(function() {
    	
 		var left_closed = $("#menuPanel").hasClass("ui-panel-closed");
 		var right_closed = $("#menuPanelRight").hasClass("ui-panel-closed")

    	if( left_closed && right_closed ) {
    		$("#menuPanel").panel("open");    		    		
    	} else if (right_closed && !left_closed) {
    		$("#menuPanelRight").panel("open");   
    		showCalendar(); 		    		
    	} else if (!right_closed && left_closed) {
    		$("#menuPanelRight").panel("close");    		    		
    	}



	});
	
	$(".ui-panel-content-wrap").swipeleft(function() {

 		var left_closed = $("#menuPanel").hasClass("ui-panel-closed");
 		var right_closed = $("#menuPanelRight").hasClass("ui-panel-closed")

    	if( left_closed && right_closed ) {
    		$("#menuPanelRight").panel("open");  
    		showCalendar();  		    		
    	} else if (right_closed && !left_closed) {
    		$("#menuPanel").panel("close");    		    		
    	} else if (!right_closed && left_closed) {
    		return false;    		    		
    	}


	});

	$("#menuPanel").on( "swiperight", "li", function( e ) {
		if(!$(e.target)) return true;
		var attr_id =$(e.target).parents("li:first").attr("id");
		var myid = attr_id.replace("node_", "");
		jsOpenRed(myid);
		return false;
	});

	$("#show_calendar").on( "click", function( e ) {

			if($("#menuPanelRight").hasClass("ui-panel-closed")) {
				$("#menuPanel").panel("close");
				$("#menuPanelRight").panel("open");
				showCalendar();
			} else {
				$("#menuPanelRight").panel("close");
			}
			return false;
	});

	$("#scroll_to_today").on( "click", function( e ) {
		$("#menuCalendar").scrollTo($("#menuCalendar a.pasted:last"),1000);
		return false;
	});

	$("#hide_show_did").on( "click", function( e ) {
		if($("#hide_show_did").hasClass("show_did")) {
			$("#hide_show_did").removeClass("show_did");
		} else {
			$("#hide_show_did").addClass("show_did")
		}
		showCalendar();
		return false;
	});

	$("body").on( "click", ".node_icon_left", function( e ) {
		var myid = $(this).parents("li:first").attr("id").replace("node_","");
		api4editor.jsRedactorOpenRecursive(myid);
	});
	

	$("body").on( "click", "#view_menu li", function( e ) {
		var myid = $(this).attr("id");

		if(myid == "view_settings") {
			if(!$("#mainWindow").hasClass("hide_options")) {
				$("#mainWindow").addClass("hide_options");
			} else {
				$("#mainWindow").removeClass("hide_options");
			}
		} else if(myid == "view_calendar") {
			showCalendar();
			if($("#menuPanelRight").hasClass("ui-panel-closed")) {
				$("#menuPanelRight").panel("open");
			} else {
				$("#menuPanelRight").panel("close");
			}
		} else {
			$("#mainWindow").addClass("hide_options");
		}

		return false;
	});

	$("#load_from_server").on("click",function(){
		$(".ui-header h1:last").html("Загружаю...");
		api4tree.js_LoadAllDataFromServer().done(function(){
			$(".ui-header h1:last").html("Данные загружены успешно");
		});
	});

	$("body").on("click",".save_text",function(){
		var old_save_title = $(".save_text .ui-btn-text" ).html();
		$(".save_text .ui-btn-text" ).html( "Сохраняю.");
		var myid = $("#redactor").attr("myid");
		var new_text = $("#redactor").redactor("get");
		if(!myid) return false;
		api4tree.jsFindLongText(myid,new_text).done(function(){
			setTimeout(function(){ $(".save_text .ui-btn-text" ).html("Сохраняю.."); },200);
			api4tree.jsSync();
			setTimeout(function(){ $(".save_text .ui-btn-text" ).html("Сохраняю..."); },350);
			setTimeout(function(){ $(".save_text .ui-btn-text" ).html(old_save_title); },500);
		});
		start_sync_when_idle = true;
		return false;
	});


	$("body").on("click","#sync_now",function(){
		    $("#sync_now .ui-icon-refresh").css("background-color","#417b2e");
		api4tree.jsSync().done(function(){
			$("#sync_now .ui-icon-refresh").css("background-color","");
		});
	});


  $("*").on('mousedown.presize','#menuContent', function(e) {
		e.preventDefault();
		var start_y = e.pageY;
		var new_y = e.pageY;
		$("#menuContent").removeClass("slide_up");

		$("body").on("mousemove.presize",function(e){
			new_y = e.pageY;
			var dif = (new_y-start_y);

			if( dif>30 ) {
				$("#menuContent").removeClass("slide_up").css("margin-top",(0+dif/3));
			} else {
				$("#menuContent").addClass("slide_up").css("margin-top",0);
			}

			if( (dif)>150 ) {
				$("#menuContent").trigger("mouseup.presize");
			}

			return false;
		});

		$("body").on("mouseup.presize", function(){
			var dif = (new_y-start_y);
			if( (dif)>150 ) {
				api4tree.jsSync().done(function(){
					$("#menuContent").addClass("slide_up").css("margin-top",0);		
				});
			}
			
			$("body").off("mousemove.presize");
			$("body").off("mouseup.presize");
			return false;
		});

		return false;
  });

  kkk=0;
  $("body").on('touchstart','#menuContent', function(e) {

  		var touch = e.originalEvent.changedTouches[0] || e.originalEvent.touches[0];
		//e.preventDefault();
		//alert(1);
		var start_y = touch.pageY;
		var new_y = touch.pageY;
		$("h1:last").html(start_y+" : "+new_y);
		$("#menuContent").removeClass("slide_up");

		$("body").bind("touchmove",function(e){

			if($("#menuContent").scrollTop()!=0) return true;

			var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
			new_y = touch.pageY;

			var dif = (new_y-start_y);

			if( dif>30 ) {
				$("#menuContent").removeClass("slide_up").css("margin-top",(0+dif/3));
			} else {
				//$("#menuContent").addClass("slide_up").css("margin-top",0);
			}

			if( (dif)>150 ) {
				$("#menuContent").trigger("touchend");
			}
			if( (dif>0) ) return false;
			else return true;
		});

		$("body").bind("touchend", function(){
			var dif = (new_y-start_y);

			if($("#menuContent").scrollTop()!=0) return true;
			
			if( dif>150 ) {

				api4tree.jsSync().done(function(){
					setTimeout(function(){
						$("#menuContent").addClass("slide_up").css("margin-top",0);
					},300);
					
				});
				
				$("body").unbind("touchmove");
				$("body").unbind("touchend");
				return false;
			} else {
				$("#menuContent").addClass("slide_up").css("margin-top",0);		
			}
			
			$("body").unbind("touchmove");
			$("body").unbind("touchend");
			return true;
		});

		return true;
  });







}


function jsLoadAllData() {
	api4tree.js_LoadAllFromLocalDB().done(function(){
		$("#open_menu").click();
		api4tree.jsSync();
	});
}

function jsOpenRed(myid){
		
	if(myid) api4editor.jsRedactorOpen([myid]);

}


function jsDoFirstMobile()
{
	var focus_time;
	onResize();
	$.mobile.buttonMarkup.hoverDelay = 10;
	$.mobile.defaultPageTransition = "none";
	$.mobile.touchOverflowEnabled = true;
	$.mobile.tapholdTriggersTap = false;

	main_user_id = $.cookie("4tree_user_id");

	api4tree = new API_4TREE("4tree_db");
	api4editor = new API_4EDITOR($("#redactor"));
	api4editor.initRedactor();

	var mydb = api4tree.js_InitDB(); 

		if(false)
		  	myr = $('#redactor').redactor({ imageUpload: 'do.php?save_file='+11,
		  		  lang:'ru', focus:false, 
		  		  toolbarExternal: "#fav_redactor_btn",
		  		  fileUpload: './do.php?save_file='+11,
		  		  imageUpload: './do.php?save_file='+11,
		  		  focusCallback: function(e)
					{
					clearTimeout(focus_time);
					focus_time = setTimeout(function(){
						var btn_top = $("#fav_redactor_btn").offset().top;
						var scr_top = $("body").scrollTop();
						var edit_top = $("#editor_content").scrollTop();

						if(scr_top>btn_top) {
							$("body").scrollTo($("#fav_redactor_btn"),1000,function(){
								var dif=$("body").scrollTop()-scr_top;
								$("#editor_content").scrollTop(edit_top-(dif));
								$("#editor_content").blur().focus();

							});
							
						}

						
					},500);
					
					}
		  	   });
 	
 	preloader = $('#myloader').krutilka("show"); //глобально регистрирую крутилку

    jsRegAllKeys();

    jsLoadAllData();

    api4tree.jsMakeIdleFunction();
/*
   main_data = JSON.parse(localStorage.getItem("alltree"));

   main_node = 1;
   $.getJSON( "do.php?mobile="+main_node ,function(data)
	{
	main_data = data;
	localStorage.setItem("alltree",JSON.stringify(main_data));
	console.info(data);
    }).error(function() 
        { 
        alert("Нет соединения с интернетом, использую резервную копию дерева"); 
        });
*/



function showCategory( urlObj, options ) //показывает список
{
	//console.info(urlObj,options,main_data);
	
	var categoryName = urlObj.hash.replace( /.*node=/, "" );

	var category = api4tree.jsFindByParent(categoryName);
	var pageSelector = urlObj.hash.replace( /\?.*$/, "" ); //шаблон страницы
		
	//console.info(categoryName,category,pageSelector);

	if ( category ) {

		var first_li = "";//<li id='refresh_list'><i class='icon-cd'></i></li>";

		var markup = "<ul data-role='listview' data-inset='false'>"+first_li,
			cItems = category,
			numItems = cItems.length;
		
		$.each(cItems, function(i,data) {
		
		  var text_length = data.text?strip_tags(data.text).length:0;

		  var my_time = '<p class="ui-li-aside"><strong>9:18</strong></p>';

		  if(data.tmp_childrens>0)
			{
			a1 = "<a class='tree_li' href='#category-items?node="+data.id+"'>";
			a2 = "<p>"+data.text.replace(/<\/?[^>]+>/gi, ' ')+"</p>"+my_time+"</a>";

			var icon_img = "<div class='folder_closed'><b>"+data.tmp_childrens+"</b></div>";
			if(text_length>5) {
				var icon_img = "<div class='folder_closed full'><b>"+data.tmp_childrens+"</b></div>";
			}
			}
		  else 
		    {
		    var note_icon = api4tree.jsMakeIconText(data.text).myclass;
			var icon_img = "<div class='node_img "+note_icon+"'></div>";
		    if(true)
		    	{
				a1 = "<a class='tree_li' href='#note-items?node="+data.id+"'>";
				a2 = "<p>"+data.text.replace(/<\/?[^>]+>/gi, ' ')+"</p></a>";
		    	}
		    else
		        {
		        a1 = a2 = '';
		        }
		    }

		  	a2="";
			
			markup += "<li id='node_"+data.id+"' data-icon='false'>" + 
					  "<div class='node_icon_left'>" + icon_img + "</div>" +
					  a1 +
					  "<div class='li_header'>" + data.title + "</div></a>" + 
					  a2 +
					  "</li>";
			
			old_parent = data.parent_id;
			old_title = data.title;

		
		});

		if(old_parent && old_parent != 1) old_parent = api4tree.jsFind(old_parent).parent_id;
		

		/*if(text_note.length>5) {
			myr.redactor("set",text_note);
		}*/
		//markup += "<div id='editor'><br><h1 style='center'>Заметка: "+title_note+"</h1><p>"+text_note+"</p></div>";
		markup += "</ul>";
		//window.location.hash = categoryName.toString(36); 
		 
		//$content.html( markup );
		//$page.page();

		//$content.find( ":jqmData(role=listview)" ).listview();
		//options.dataUrl = urlObj.href;
		
			
		

		//console.info("page",$page);
		
		//$.mobile.changePage( $page, options );

		$('#menuPanel :jqmData(role=content)').html(markup);
		$('#menuPanel').find(":jqmData(role=listview)").listview({
			autodividers: false,
			autodividersSelector: function (li){
				return "Hello";
			}
		});
		$('#menuPanel').trigger("updatelayout");
		
		$(".back1").attr("href","#category-items?node="+old_parent);	

		if(categoryName) jsOpenRed(categoryName);
		/*function () {
			$(this).find(":jqmData(role=listview)").listview();
			$(this).trigger("updatelayout");
			$.mobile.loading("hide");
			_menuLoaded = true;
		});*/
	}
}




function showCategory1( urlObj, options ) //показываю заметки
{
	var categoryName = urlObj.hash.replace( /.*node=/, "" ),

		
		pageSelector = urlObj.hash.replace( /\?.*$/, "" );
		var the_data = api4tree.jsFind(categoryName);
		if(!the_data) return true;

		var $page = $( pageSelector );
		$header = $page.children( ":jqmData(role=header)" );
		$content = $page.children( ":jqmData(role=content)" );
		$footer = $page.children( ":jqmData(role=footer)" );
		title_note = the_data.title;
		//text_note = data.text;



		$footer.find( ".save_text .ui-btn-text" ).html( "Сохранить: " + title_note);
		//$content.html( text_note );

		//$.mobile.changePage( $page, options );
				
		old_parent = (the_data.parent_id==1)?1:the_data.parent_id;
		$(".save_text").attr("href","#category-items?node="+old_parent);

		jsOpenRed(the_data.id);
		
		
		
		

}



	$(document).bind( "pagebeforechange", function( e, data ) {
	if ( typeof data.toPage === "string" ) {
		var u = $.mobile.path.parseUrl( data.toPage ),
			re = /^#category-item/;
		if ( u.hash.search(re) !== -1 ) {
			showCategory( u, data.options );
			e.preventDefault();
		}
			re = /^#note-items/;
		if ( u.hash.search(re) !== -1 ) {
			showCategory1( u, data.options );
			e.preventDefault();
		}

		
	}
	});




}

function jsList()
{
}



$(function() {
    // WARNING: Extremely hacky code ahead. jQuery mobile automatically
    // sets the current "page" height on page resize. We need to unbind the
    // resize function ONLY and reset all pages back to auto min-height.
    // This is specific to jquery 1.8

    // First reset all pages to normal
    $('[data-role="page"]').css('min-height', 'auto');

    // Is this the function we want to unbind?
    var check = function(func) {
        var f = func.toLocaleString ? func.toLocaleString() : func.toString();
        // func.name will catch unminified jquery mobile. otherwise see if
        // the function body contains two very suspect strings
        if(func.name === 'resetActivePageHeight' || (f.indexOf('padding-top') > -1 && f.indexOf('min-height'))) {
            return true;
        }
    };

    // First try to unbind the document pageshow event
    try {
        // This is a hack in jquery 1.8 to get events bound to a specific node
        var dHandlers = $._data(document).events.pageshow;

        for(x = 0; x < dHandlers.length; x++) {
            if(check(dHandlers[x].handler)) {
                $(document).unbind('pageshow', dHandlers[x]);
                break;
            }
        }
    } catch(e) {}

    // Then try to unbind the window handler
    try {
        var wHandlers = $._data(window).events.throttledresize;

        for(x = 0; x < wHandlers.length; x++) {
            if(check(wHandlers[x].handler)) {
                $(window).unbind('throttledresize', wHandlers[x]);
                break;
            }
        }
    } catch(e) {}
});



