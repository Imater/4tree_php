var main_data, preloader, my_all_frends, old_parent=1, old_title="4tree.ru", is_mobile = true;
var start_sync_when_idle=false, myr, note_saved = false, isMindmap = false, isTree = false;

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

		 //сортировка по полю position
		 function sort_by_position(a,b) {
		   if (parseFloat(a.position) < parseFloat(b.position))
		      return -1;
		   if (parseFloat(a.position) > parseFloat(b.position))
		     return 1;
		   if (a.position == b.position && a.title && b.title) {
			   if(a.title>b.title) return -1;
			   if(a.title<b.title) return 1;
		   }
		     
		 }


		 function sort_by_path(a,b) {

		   var aa = a.path?a.path:"_";
		   var bb = b.path?b.path:"_";
		   
		   var year_position = aa.indexOf(" год → ");
		   if(year_position!=-1) {
			   var for_date = a.title.split(".");
			   var mydate = "."+for_date[1]+"."+for_date[0];
			   aa = aa.substr(0, year_position)+" "+mydate;
		   }

		   var year_position = bb.indexOf(" год → ");
		   if(year_position!=-1) {
			   var for_date = b.title.split(".");
			   var mydate = "."+for_date[1]+"."+for_date[0];
			   bb = bb.substr(0, year_position)+" "+mydate;
		   }
		   
		   if( (a.id.toString().indexOf("_")!=-1) || (a.id.toString().indexOf("_")!=-1) ) return -1;

		   aa = aa.replace("_ДНЕВНИК","яяя_дневник");

		   bb = bb.replace("_ДНЕВНИК","яяя_дневник");

		   if (aa < bb)
		      return -1;
		   if (aa > bb)
		     return 1;

		   if (a.title < b.title)
		      return -1;
		   if (a.title > b.title)
		     return 1;
		     
		 }

		 //сортировка по полю title для дневника
		 function sort_by_title(a,b) {
		   var aa = a.title?a.title:"_";
		   var bb = b.title?b.title:"_";
		   
		   if( (a.id.toString().indexOf("_")!=-1) || (a.id.toString().indexOf("_")!=-1) ) return -1;

		   aa = aa.replace("январь","01").replace("февраль","02").replace("март","03").
		        replace("апрель","04").replace("май","05").replace("июнь","06").
		        replace("июль","07").replace("август","08").replace("сентябрь","09").
		        replace("октябрь","10").replace("ноябрь","11").replace("декабрь","12");

		   bb = bb.replace("январь","01").replace("февраль","02").replace("март","03").
		        replace("апрель","04").replace("май","05").replace("июнь","06").
		        replace("июль","07").replace("август","08").replace("сентябрь","09").
		        replace("октябрь","10").replace("ноябрь","11").replace("декабрь","12");

		   if (aa < bb)
		      return -1;
		   if (aa > bb)
		     return 1;
		     
		 }



function jsRenderOneElement(data, parent_id) {
	var info = api4tree.jsInfoFolder( data , parent_id);
	console.info("info = ", info);

	var li = "<li id='node_"+data.id+"' class='tree_li' data-icon='false'>" + 
			  "<span class='wrapper'>" +
			  	"<span class='title_left'>" + 
			  		info.img + 
			  	"</span>" +

			  	"<span class='title_right'>"+
			  		data.title + 
			  	"</span>" +
			   "</span>" +
			  "</li>";
	return li;
}

function jsShowTreePanel(childs, parent_id) {


		 	if(parent_id==-1) { 
		 		childs = childs.sort(sort_by_path); //сортирую
		 	} else { 
		 		var my_diary_id = api4tree.jsCreate_or_open(["_ДНЕВНИК"]);

		 		if( $("span[myid='"+my_diary_id+"']").length ) {
			 		childs = childs.sort(sort_by_title); //сортирую
		 		} else {
			 		childs = childs.sort(sort_by_position); //сортирую
		 		}

		 	}



	var markup = "<ul data-role='listview' data-inset='false'>";
	$.each(childs,function(i,el){
		markup += jsRenderOneElement(el, parent_id);
	});
	markup += "</ul>";
	$('#menuPanel :jqmData(role=content)').html(markup);
	$('#menuPanel').find(":jqmData(role=listview)").listview({
		autodividers: false,
		autodividersSelector: function (li){
			return "Hello";
		}
	});
	$('#menuPanel').trigger("updatelayout");
		
	//$(".back1").attr("href","#category-items?node="+old_parent);	
}

function jsOpenNode(id, no_editor) {
	var childs = api4tree.jsFindByParent(id);

	var element = api4tree.jsFind(id);
	if(element && element.parent_id!=0) {
		
		if(childs.length>0) $(".back1").attr("myid", element.parent_id);

		var paths = api4tree.jsFindPath(element).path;
		
		var mypath = "<span class='mypath' myid='1'>&nbsp;&nbsp;<i class='icon-home'></i></span>";
		$.each(paths,function(i,el){
			var title = el.path.title;
			mypath += " → ";
			mypath = mypath + "<span class='mypath' myid='"+el.path.id+"'>"+api4tree.jsShortText(title,15)+"</span>";
		});

		$("#editor_header").html( mypath );

	}


	if(childs.length>0) {
		jsShowTreePanel(childs, 1);
	} else {

	}
	if(!no_editor) jsOpenRed(id);

	$("#node_title").val(element.title);

	if(element.date1!="") {
		var to_value = "";
		var mydate1 = Date.createFromMysql( element.date1 );
		if(mydate1 && mydate1.toISOString()) to_value = mydate1.toISOString().split(".")[0]
		$("#node_date").attr( "value", to_value );
	} else {
		$("#node_date").attr( "value", "" );
	}


}


var search_timer;
function jsRegAllKeys() {



		  $('body').delegate("#search_filter", "keyup", function(event) {
			     if(",39,37,40,38,".indexOf(","+event.keyCode+",")!=-1) return true;
	     		 clearTimeout(search_timer);
	     		 var searchtxt = $('#search_filter').val();
	     		 var len=searchtxt.length;

	     		 if (len<=2) { 
	     		 	var search_timeout = 3000;
	     		 } else if (len<=3) { 
	     		 	var search_timeout = 2000; 
	     		 } else if (len>3) {
		     		var search_timeout = 700;
	     		 }
	     		 
	     		 search_timer = setTimeout(function() {
			 		jsHighlightText("remove");
			    	var searchstring = $('#search_filter').val();
    		    	if(searchstring.length<2) return false;
    		    	searchstring = searchstring.toLowerCase();

					preloader.trigger("show");

    		        var tt = '';
    		        try {  //пробую вычислить как калькулятор
    		           var calc_answer = Parser.evaluate( searchtxt.replace(",","."));
    		           var digits = calc_answer.toString().split(".");
    		           var d1 = digits[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    		           var d2 = digits[1]?("."+digits[1]):"";
    				   tt = ' = '+ d1 + d2;
    				} catch (e) {
    				   try {
						   Parser.evaluate( searchtxt.replace(",",".")+"0" );    		    				   
						   tt = '=';
    				   } catch (e) {
	    				   tt = '';
    				   }
    				}
    		    	if(tt!='') 
    		    		{ 
    		    		jsTitle(tt,100000); //показываю вычисленное значение
    		    		if(tt!="=") { 
    		    			if(!$(".search_panel_result ul").find(".calculator").length) {
	    		    			var old_exp = localStorage.getItem("user_calculator");
								if(old_exp && (old_exp.length>200000)) old_exp = "";
								$(".search_panel_result ul").html(old_exp);
							}
    		    			setTimeout(function(){
    		    				$(".search_panel_result").scrollTop(9999999999);
    		    			},2000);
    		    			var this_answer = "<li class='calculator'>"+searchtxt+"<strong>"+
    		    							  tt+"</strong></li>";
    		    			if( $(".search_panel_result ul li:last").html() != $(this_answer).html()) {
    		    			$(".search_panel_result ul").append(this_answer);
    		    			}
    		    			
    		    			$(".search_panel_result").scrollTop(9999999999);
    		    			localStorage.setItem("user_calculator",$(".search_panel_result ul").html());
    		    			}
    		    		} else {
	    		    	   	jsTitle("...");
						}
	     		 				    	
					var dfdArrayComments =[]; //для объектов работы с асинхронными функциями
					var comment_ids_found=new Array; //поиск по комментариям
					var element_founded = [];
					var my_all_comments = [];
					searchstring = searchstring.toLowerCase();

					$.each(my_all_comments,function(i,el){ //ищу комментарии, чтобы забрать из другой базы
					    if(el) {
					    	var done_element = this_db.jsFindComment(el.id).done(function(comment){
					    		var longtext = comment.text;
								if(longtext && (longtext.toLowerCase().indexOf(searchstring)!=-1)){
										 var new_i = el.tree_id;
										 comment_ids_found[new_i] = el;
					    		}
					    	});
					    	
					    	dfdArrayComments.push( done_element );
					    };
					});

			$.when.apply( null, dfdArrayComments ).then( function(x){ 
					var dfdArray = [];   			    	
					var my_all_data2 = api4tree.js_my_all_data2();
					$.each(my_all_data2,function(i,el){ //ищу длинные тексты, чтобы забрать из другой базы
					    if(el) {
					    	var done_element = api4tree.jsFindLongText(el.id).done(function(longtext){
								if( (comment_ids_found && comment_ids_found[el.id]) ||
									(longtext && 
								    ((longtext.toLowerCase().indexOf(searchstring)!=-1) ||
								    ((false && diff_plugin.match_main(longtext.toLowerCase(),
								    searchstring,longtext.length)!=-1) && searchstring.length>3 && searchstring.toLowerCase() != searchstring.toUpperCase()) ) ) ||
									(el && el.title && el.title.toLowerCase().indexOf(searchstring)!=-1) ){
										 var new_i = element_founded.length;
										 element_founded[new_i] = el;
										 
										 
										 if(comment_ids_found && comment_ids_found[el.id]) {
											 element_founded[new_i].comment = comment_ids_found[el.id];
										 }
										 element_founded[new_i].text = longtext;
										 element_founded[new_i].searchstring = searchstring;
										 element_founded[new_i].path = api4tree.jsFindPath(el).textpath;
					    		}
					    	});
					    	
					    	dfdArray.push( done_element );
					    };
					});
					
					//выполняю тогда, когда все длинные тексты считаны
					$.when.apply( null, dfdArray ).then( function(x){ 
						preloader.trigger("hide");
						if(element_founded.length>0) {
							if( $('#search_filter').val().toLowerCase()==element_founded[0].searchstring.toLowerCase() ) {
								//api4panel.jsShowTreeNode(-1,false,element_founded);
								console.info(element_founded);
								jsShowTreePanel(element_founded,-1);
								jsTitle("Найдено: " + element_founded.length + " шт",5000);

								setTimeout( function() {
								    jsHighlightText(); //подсвечиваю поисковое слово
								    jsPrepareDate();  //обрабатываю даты в поиске
								}, element_founded.length*50);

							}
						} else {
							if(tt=='' && searchstring.toLowerCase() != searchstring.toUpperCase()) {
								$(".search_panel_result ul").html('Фраза "'+searchstring+'" не найдена');
								jsTitle("Найдено: 0 шт ("+searchstring+")",5000);
							}
						}
						   			    	
						   			    	
						if( (searchstring!='') && element_founded ) { 			   
						    $("#tab_find").click();
						    $("#search_empty").fadeIn(200); 
						}
					}); //when dfdArray
			}); //when dfdArrayComments
					
					//поиск удовлетворяющих поисковой строке условий
/*					var data = my_all_data.filter(function(el) { 
					   if(!(!el.title)) 
					     return ( (el.title.toLowerCase().indexOf(searchstring.toLowerCase())!=-1) ||
					      		   (el.text.toLowerCase().indexOf(searchstring.toLowerCase())!=-1) ||
					      		   comment_ids_found.indexOf(el.id)!=-1 ); 
					   }); */
	     		          
	     		 }, search_timeout);
			  
			     return false;
			  
			     });







	FastClick.attach(document.body);

	//setTimeout(function(){jsOpenNode(599);},1000);

	$("#tree_home").on("click", function(){
		jsOpenNode(1);
	});

	$("body").on("click", ".back1, .mypath", function(){
		var id = $(this).attr("myid");
		jsOpenNode(id);
	});

	$("body").on("click", ".divider_red", function(){
		var id = $(this).attr("myid");
		var parent_id = api4tree.jsFind(id).parent_id;
		jsOpenNode(parent_id,"dont_open_redactor");
		$(".selected").removeClass("selected");
		$("#node_"+id).addClass("selected");
	});


	$("#menuContent").on( "click", ".node_icon_left, .countdiv, .folder_closed", function( e ) {
		var myid = $(this).parents("li:first").attr("id").replace("node_","");
		api4editor.jsRedactorOpenRecursive(myid);
		return false;
	});

	$("#menuContent").on("click", "li", function(e){

		$(".selected").removeClass("selected");
		$(this).addClass("selected");
		var id = $(this).attr("id").replace("node_","");
		jsOpenNode(id);
	});


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


  $("body").on('mousedown.presize','#menuContent', function(e) {
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

		if($("#menuContent").scrollTop()!=0) return true;

  		var touch = e.originalEvent.changedTouches[0] || e.originalEvent.touches[0];
		//e.preventDefault();
		//alert(1);
		var start_y = touch.pageY;
		var new_y = touch.pageY;
		$("h1:last").html(start_y+" : "+new_y);
		$("#menuContent").removeClass("slide_up");

		$("body").bind("touchmove",function(e){


			var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
			new_y = touch.pageY;


			var dif = (new_y-start_y);

			if( dif>50 ) {
				$("#menuContent").removeClass("slide_up").css("margin-top",(0+dif/4));
			} else {
				//$("#menuContent").addClass("slide_up").css("margin-top",0);
			}

			if( (dif)>180 ) {
				$("#sync_status i").addClass("rotate180");
				//$("#menuContent").trigger("touchend");
			} else {
				$("#sync_status i").removeClass("rotate180");

			}
			if( (dif>0) ) return false;
			else return true;
		});

		$("body").bind("touchend", function(){
			var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
			new_y = touch.pageY;
			var dif = (new_y-start_y);
			start_y = touch.pageY;
			$("body").unbind("touchmove");
			$("body").unbind("touchend");

			if($("#menuContent").scrollTop()!=0) return true;
			
			if( dif>180 ) {

				$("#menuContent").addClass("slide_up").css("margin-top",40);
				api4tree.jsSync().done(function(){
					setTimeout(function(){
						$("#menuContent").addClass("slide_up").css("margin-top",0);
						$("body").unbind("touchmove");
						$("body").unbind("touchend");
						$("#sync_status i").removeClass("rotate180");
					},600);
					
				});
				
				return false;
			} else {
				$("#menuContent").addClass("slide_up").css("margin-top",0);		
				$("#sync_status i").removeClass("rotate180");
			}
			
			return true;
		});

		return true;
  });







}


function jsLoadAllData() {
	if(!$.cookie("4tree_passw") && !$.cookie("4tree_social_md5")) {
		$.mobile.changePage("#user-login");
	} else {
		api4tree.js_LoadAllFromLocalDB().done(function(){
			jsOpenNode(1);
			$("#menuPanel").panel("open");
			api4tree.jsSync();

		});
	}
}

var open_redactor_timer;
function jsOpenRed(myid){
clearTimeout(open_redactor_timer);
if(myid) open_redactor_timer = setTimeout(function(){
		api4editor.jsRedactorOpen([myid]);
		setTimeout(function() { 
			jsHighlightText(); 
			if($(".highlight:first").length) $("#editor_content").scrollTo($(".highlight:first"),1000);

		}, 800);
	},100);

}


function jsDoFirstMobile()
{
	var focus_time;
	onResize();

	//initFastButtons();
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
 	
 	preloader = $('#myloader').krutilka({color: "#FFF", petalWidth: "2px", size:"22"}); //глобально регистрирую крутилку

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



	$(document).bind( "pagebeforechange222", function( e, data ) {
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






