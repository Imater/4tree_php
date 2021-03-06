//v1.01
var myjsPlumb,isMindmap = false, isTree = true, is_mobile = false, my_connections = {};
var note_saved=true,myr,t1,t2,my_all_comments,my_all_share,
	my_all_frends,remember_old_panel="top_panel";
var main_x = 50; //ширина левой панели в процентах
var main_y = 250,pwidth=300;//высота верхней панели в пикселях
var preloader,clicknow,add_menu;
var calctabs_timer,show_help_timer,tttt2;
var tree_history = [],history_time,ignorehashchange,tttt;
var max_date1 = new Object,my_time_id,lastclick=null,lastclickelement=null;
var mytimer = new Array;
var fullscreen_mode = false;
var mymetaKey = false, diaryrewind=0,old_before_diary=0;
var autosave_timer,old_title,widthpanel,RestMin, show_hidden=false,show_childdate=true;
var is_rendering_now,last_input_click;
var timestamp=new Date().getTime(),start_sync_when_idle=false,there_was_message_about_change=false;
var hoverListener,is_changed,only_save=false,main_user_id;
var db, diff_plugin;
var top_of_panel = "<div class='add_do_panel_top'>"+
	"<div class='node_img note-clean'></div><input title='alt + (вниз, вправо) - добавляет дело' placeholder='добавить...'>"+
    "<i class='icon-plus'></i></div>";
//var top_of_panel = "";


/////////////////////////////////////PANEL/////////////////////////////////////////
var API_4PANEL = function(global_panel_id,need_log) {
	 if ( (typeof arguments.callee.instance=='undefined') || true)
	 {
	  arguments.callee.instance = new function(){
		 var this_db = this,
		     last_log_time=jsNow(), //время последнего вывода лога
		     log_i=1,
		     lastclickelement, lastclick, //время последнего клика по title
		     hash_timer, lastclick, open_redactor_timer,
		     mypanel =$(".mypanel"); //номер лога
		     
		 pwidth = $.cookie('pwidth');
		 if(!pwidth) pwidth = 300;

		 this.jsCloseAllMenu = function(){
				  $(".all_screen_click").remove();
				  $(".favorit_menu ul,.tree_history ul").slideUp(200);
				  $("#myslidemenu").trigger("all_screen_click");
				  $(".send_mail_form").slideUp(300);
//				  $(".search_panel_result,.search_arrow").slideUp(200);
				  $("#minicalendar").remove();
//				  $(".makedone,.makedone_arrow,.makedone_arrow2").slideUp(100);
				  //$.Menu.closeAll();
		 }
		 		 
		 		 
		 function start_rename_current( ntitle ) {
		 	if( $(".tree_active .selected .n_title:first").toString() == ntitle.toString() ) {
 		 	  	ntitle.attr("contenteditable","true").attr("spellcheck","false").focus(); 
		 	  	ntitle.attr("old_title",ntitle.html());
		 	  	setTimeout(function(){ 
		 	  		if(ntitle.is(":focus")) document.execCommand('selectAll',false,null); 
		 	  	},70);
		 	}
		 }
		 		 
		 var rename_timer;
		 //клик по Названию дела. ntitle = $(".ntitle"). Нужно для определения двойного клика.
		 this.jsTitleClick = function(ntitle,from_n_title) {
 			var isTree = api4panel.isTree[ $(".tree_active").attr("id") ];
			var isMindmap = api4panel.isMindmap[ $(".tree_active").attr("id") ];

		 	if (ntitle.attr("contenteditable")==true) return true; 
		 	
		 	if(ntitle.parents("li:first").hasClass("selected")) {
		 		rename_timer = setTimeout(function(){
//			 		start_rename_current(ntitle);
		 		}, 600);
		 	}
		 	
		 	var nowtime = new Date();
		 	if(((nowtime-lastclick)<500) && (lastclickelement == ntitle.attr("myid"))) needtoedit = true;
		 	else 
		 		{
		 		var needtoedit = false;
		 		ntitle.parents("li:first").click(); //противный клик
		 		var id = ntitle.attr("myid");
		 		}
		 	
		 	lastclickelement = ntitle.attr("myid");
		 	
		 	//запоминаю время последнего клика, чтобы переходить в режим редактирования только при двойном клике
		 	lastclick = new Date(); 
		 
		 
		 }


		 //выбрать заметку и загрузить в редакторе
		 this.jsSelectNode = function(id,iamfrom) { //открыть заметку в календаре и в редакторе
		 //	i_am_from - кто вызвал: redactor, calendar, tree, diary
		    
		    $(".tree_active .selected").removeClass("selected");
		 	$(".tree_active #node_"+id).addClass("selected");
//			if(isMindmap) myjsPlumb.setSuspendDrawing(false,true);
		 	clearTimeout(open_redactor_timer);
		 	api4tree.jsSelectTag(id);
		 	open_redactor_timer = setTimeout(function()
		 		{
			 	api4panel.jsDrawMindmap();


			 	$("#wiki_back_button").hide();
			 	clearTimeout(hash_timer);
			 	
			 	if(true)	{ //если есть хэш - то устанавливаем его в адресную строку
			 	    var num_id;
			 	    if(!parseInt(id,10)) num_id=id;
			 	    else num_id = parseInt(id,10);

			 		var element = api4tree.jsFind(id);
			 		var title = element.title; //название для шапки сайта
			 		if (!title)	title = "4tree.ru";
			 		    
			 		clearTimeout(set_title_timer);
			 		set_title_timer = setTimeout(function(){
			 		    this_db.jsSetTitle(id);
			 		}, 100);
			 		    
			 		if(title) {
			 		    document.title = "4tree.ru: "+api4tree.jsShortText( strip_tags(title), 150 );
			 		}
			 	    
			 	    hash_timer = setTimeout(function()
			 	    	{ 
			 	    	ignorehashchange = true; //делаю так, чтобы изменение хэша не привело к переходу на заметку
			 	    	setTimeout( function() { ignorehashchange=false; }, 200 );
			 	    	if(window.location.hash.indexOf("edit")==-1) if(num_id) {
			 	    			jsSetHashAndPath(num_id);  
			 	    			//window.location.hash = num_id.toString(36); 
			 	    		}
			 	    	},100);
			 	}

		 	 	api4editor.jsRedactorOpen([id],iamfrom).done(function(){
				 	this_db.jsPathTitle(id); //устанавливаем путь в шапку
			 		api4tree.jsSetSettings(id);
			 	 	jsCalendarNode(id);
	//		 	 	jsAddFavRed("",id);
			 	 	$(".redactor_").blur();
		 	 	}); 
		 	 	},50 );
		 
		 }

		 this.isTree = {}; //обозначаем элементы - дерево ли это
		 this.isTree["tree_1"] = $("#tree_1").parent("div").hasClass("panel_type1");
		 this.isTree["tree_2"] = $("#tree_2").parent("div").hasClass("panel_type1");

		 this.isMindmap = {}; //обозначаем элементы - карта ума ли это
		 this.isMindmap["tree_1"] = $("#tree_1").parent("div").hasClass("mindmap");
		 this.isMindmap["tree_2"] = $("#tree_2").parent("div").hasClass("mindmap");
		 
		 
		 
		 var set_title_timer,repaint_timer;
		 
		 //открыть заметку с номером, если она на экране (make .selected)
		 this.jsOpenNode = function(id,nohash,iamfrom) {

			var isTree = api4panel.isTree[ $(".tree_active").attr("id") ];
			var isMindmap = api4panel.isMindmap[ $(".tree_active").attr("id") ];
		 	var element = api4tree.jsFind(id);
	 		var myli = $(".tree_active #node_"+id+":last");
	 		var mypanel = myli.parents(".panel");
	 		
	 		if( myli.length ) {
	 				var left_offset = $(".tree_active #node_"+id).offset().left;
	 				if(left_offset==0) left_offset = -1;
	 		}

	 		if(isTree) {
		 		$(".tree_active.mypanel .selected").removeClass("selected");
	 		} else {
		 		mypanel.nextAll(".panel").remove(); ////REMOVE_PANEL////

		 		$(".tree_active.mypanel .selected").addClass("old_selected").removeClass("selected");
		 		//в текущей панели убираем
		 		mypanel.find("li").removeClass("old_selected").removeClass("tree-open"); 
		 		
		 		myli.addClass('tree-open'); //устанавливаем значёк открытой папки

//	 			$(".tree_active .selected,.tree_active .old_selected").removeClass("tree-closed").addClass("tree-open");

	 		}

	 		myli.addClass("selected"); //ставим selected на выбранный элемент
	 		
	 
	 		if( !element || (api4tree.jsFindByParent(id).length>0) ) {//если это папка, создаю панель
		 		tree_id = $(".tree_active").attr("id");
		 		if( !$(".tree_active ul[myid="+id+"] li").length ) { 
		 			this_db.jsShowTreeNode( tree_id, id, isTree ); //вывожу детей этого элемента 
		 		} else {
			 		$("ul[myid="+id+"]").show();
		 		}
	     	} else {
	     		if( !isTree ) {
	 		  		if(!pwidth) pwidth = 285;

 		  			if(pwidth>130) {
     		  			var pw = pwidth+"px";
     		  		} else {
     		  			var pw = "auto";
     		  		}

	 		  		if(!isMindmap && !isTree) {
	     				$(".tree_active.mypanel").append("<div id='panel_"+element.id+"' class='panel' style='width:"+pw+"'><ul>"+top_of_panel+"</ul></div>"); 
	     			}
	 		  		jsPresize();
	     		}
	     	}


		    		if(left_offset && !isMindmap && !isTree) {

		    			need_width = 0;
		    			//need_width += mypanel.nextAll(".panel:not(.width_panel):last").width()+2;

		    			var new_left_offset = $(".tree_active #node_"+id).offset().left;
		    			//console.info("old_offset = ",left_offset, "new_offset = ", new_left_offset);
		    			var dif = left_offset - new_left_offset;

		    			need_width = -dif + $(".tree_active.mypanel").width() - $(".tree_active .presize:last").offset().left + 50 + parseInt( $("#tree_editor").css("left").replace("px","") );
		     			if(dif!=0) $(".tree_active.mypanel").append("<div class='panel width_panel' style='width:"+need_width+"px;max-width:"+need_width+"px;'></div>");

		    			$(".tree_active.mypanel").stop().scrollLeft( $(".tree_active.mypanel").scrollLeft() - dif );

		    			var dif_left = $(".tree_active .selected").offset().left - $(".tree_active.mypanel").offset().left;

							var old_left = $(".tree_active.mypanel").scrollLeft();

		    			if(dif_left < 0) {		    				
		    				$(".tree_active.mypanel").stop().animate({"scrollLeft":old_left+dif_left - 60 },500, "swing");	
		    			}

		    			var next_panel_div = $(".tree_active .selected").parents(".panel").nextAll(".panel:not(width_panel):first").find("li");
							var next_panel = next_panel_div.width()+60;


							
		    			var dif_right = ($(".tree_active .selected").offset().left + $(".tree_active .selected").width()) - ($(".tree_active.mypanel").offset().left + $(".tree_active.mypanel").width()) + next_panel;
		    			//console.info("dif_right = ",dif_right);

		    			if(dif_right > 0) {

		    				$(".tree_active.mypanel").stop().animate({"scrollLeft":old_left+dif_right },500);		
		    			}



		     		} else {

		 	  			var w=0; 
		 			  	$(".tree_active.mypanel .panel").quickEach(function(){w+=$(this).width()});
		 	  			//console.info("OH END");
					 		var thisWidth = w;
						 	if(!$(".makedone").is(":visible"))
						 		if(!isTree && !isMindmap) {
							 		//if($('.mypanel').scrollLeft()!=thisWidth) $(".mypanel").stop().animate({"scrollLeft":thisWidth},500);		 		
						 		}

					 	} //if(need_width)


//	     if(isMindmap) myjsPlumb.setSuspendDrawing(false,true);
//		 console.info("rep-open_node_1");
	     
		 jsRepaint("OpenNode");		 		 
		 } //jsOpenNode
		 
		 
		 
		 //регистрация всех кнопок и обработки событий связанных с деревом
		 this.jsRegAllKeys = function() {
			 
			/////lilili title click   
			$(".mypanel").delegate(".n_title","click", function () {
    	    	$(".tree_active").removeClass("tree_active");
    	    	var tree_id = $(this).parents(".mypanel").addClass("tree_active").attr("id");

				var edit_now = $(this).attr("contenteditable");
				if (edit_now) {
					return false; 
				}
				api4panel.jsTitleClick($(this),"from_panel");
				return false;
			});
			 
			 
		    //Клик в LI открывает детей этого объекта LILILI
    	    $('.mypanel').delegate("li","dblclick", function () {
    	    	console.info("dblclick");
    	    	clearTimeout(rename_timer);
    	    	clearTimeout(li_click_timer);
    	    	var tree_id = $(this).parents(".mypanel").addClass("tree_active").attr("id");
   	        	var id = api4tree.node_to_id( $(this).attr("id") );
				api4panel.jsShowFocus(tree_id, id,  "need_select_first");    	    	
				return false;
    	    });

			var li_click_timer;
		    //Клик в LI открывает детей этого объекта LILILI
    	    $('.mypanel').delegate("li","click", function () {
    	    	console.info("click");
    	    	$(".tree_active").removeClass("tree_active");
    	    	var tree_id = $(this).parents(".mypanel").addClass("tree_active").attr("id");
				var isTree = api4panel.isTree[ $(".tree_active").attr("id") ];
				var isMindmap = api4panel.isMindmap[ $(".tree_active").attr("id") ];
				
    	    	
    	        if( $(this).find(".ntitle").attr("contenteditable") ) return true; //если редактируется
    	        $(".ntitle[contenteditable=true]").blur();
    	        $(".mypanel .n_title").trigger("blur");
    	        var dif_between_click = jsNow() - lastclick;
    	        lastclick = jsNow();
    	        
    	        if(isTree) { //если это дерево
    	          if( (dif_between_click)<150 ) {
    	        	var id = api4tree.node_to_id( $(this).attr("id") );
    	        	$("#"+tree_id+" .panel li").removeClass("selected");
    	        	api4panel.jsOpenNode( id ); //открываю панель
    	        	api4panel.jsSelectNode( id ,'tree');
    	        	return false;
    	        	}
    	        }
    	        
    	        	var id = api4tree.node_to_id( $(this).attr("id") );

    	        if( !$(this).hasClass('tree-open') ) { //если ветка свёрнута
    	        	if( !$(this).find("ul:first li").length ) api4panel.jsOpenNode( id ); //открываю панель
    	        	api4panel.jsSelectNode( id ,'tree');
    	    
    	        	if( isTree && (!$(this).hasClass("tree-open")) ) { //если дерево и нужно открыть ветку
//    	        		$(this).find(".date1").hide();
    	        		var timelong = api4tree.jsFindByParent(id).length*15; 
    	        		if(timelong>1000) timelong=500; //большие ветки дольше
    	        		if(timelong<300) timelong=100;   //маленькие ветки открываются быстрее
    	        		if(isMindmap) timelong = 0;
    	        		var cache_this = $(this);
    	        		setTimeout(function(){
	    	        		cache_this.find("ul:first").slideDown(timelong,function(){ 
								if(isMindmap) jsRepaint("li click");
								cache_this.addClass("tree-open");
								
								console.info("repaint: Ветка отсутствует, открываю");
								
	//    	        			setTimeout(function(){  },10);
	    	        			console.info("rep-fol_closed");
	    	        		});
    	        		}, timelong);
    	        	}
    	        } else { //если ветка уже открыта, закрываю её
    	        	if(isTree) {
	    	        	api4panel.jsSelectNode( id ,'tree');
						$(this).removeClass("tree-open");
						var cache_this2 = $(this);
    	        		setTimeout(function(){
	    	        		cache_this2.find("ul:first").slideUp(50,function(){
		    	        		if(isMindmap) jsRepaint("li click2");
								console.info("repaint: Ветка просто свёрнута, открываю");
	    	        		});
	    	        	},200);
    	        	} else {
    	        		$(this).removeClass("tree-open");
    	        		var id = api4tree.node_to_id( $(this).attr("id") );
    	        		if( !$(this).find("ul:first li").length ) api4panel.jsOpenNode( id ); //открываю панель
    	        		api4panel.jsSelectNode( id ,'tree');
    	        		$(this).addClass("tree-open");
    	        	}
    	        }
    	    
				jsHighlightText("remove");
    	        return false;
    	        
    	    }); //lili
    	    

			$(".mypanel").delegate(".n_title","blur", function () {
				if($(this).attr("contenteditable")) { //сохраняю заметку
					api4tree.jsSaveTitle( $(this), 1 ); 
				} 
				return true;
			});

			$("#tree_editor").delegate(".makedone_h1","blur", function () {
				api4tree.jsSaveTitle( $(this), 1 ); 
				$(".redactor_").focus();
				return true;
			});

			$("#tree_editor").delegate(".makedone_h1","focus", function () {
				$(this).attr("old_title",$(this).html()); 
				return true;
			});

			$("#tree_editor").delegate(".makedone_h1","keydown", function (e) {
				if(e.keyCode==13) {
					  e.preventDefault();
					  $(this).blur(); //enter - увожу фокус, при этом сохраняется заметка
					  return false;
				}
				if(e.keyCode==27) {
				  e.preventDefault();
				  api4tree.jsSaveTitle( $(this), -1 );
				  $(this).blur(); //enter - увожу фокус, при этом сохраняется заметка
				  return false;
				  }

				  //////////////// analyse parse date ///////////////

			     if(",39,37,40,38,".indexOf(","+event.keyCode+",")!=-1) return true;
			     var this_n_title = $(this);
			     clearTimeout(timer_add_do);
			     timer_add_do = setTimeout(function(){
			     var mynewdate = api4tree.jsParseDate( this_n_title.html() );
			     if( mynewdate.date == "") { $(".header_text").html(""); return true; }
			     $(".header_text").html( mynewdate.date.jsDateTitleFull()+mynewdate.sms );
			     $(".header_text").attr( "title", mynewdate.date.jsDateTitleFull() );
			     jsTitle(mynewdate.title,15000);
			     },200);

				return true;
			});
			
			var timer_add_do;
			$(".mypanel").delegate(".n_title","keydown", function (e) {
				
				if( !$(this).attr("contenteditable") ) { return true; }
				
				if(e.keyCode==13) {
					  e.preventDefault();
					  $(this).blur(); //enter - увожу фокус, при этом сохраняется заметка
					  return false;
				}

				if(e.keyCode==27) {
				  e.preventDefault();
				  api4tree.jsSaveTitle( $(this), -1 );
				  $(this).blur(); //enter - увожу фокус, при этом сохраняется заметка
				  return false;
				  }
				  //////////////// analyse parse date ///////////////

			     if(",39,37,40,38,".indexOf(","+event.keyCode+",")!=-1) return true;
			     var this_n_title = $(this);
			     clearTimeout(timer_add_do);
			     timer_add_do = setTimeout(function(){
			     var mynewdate = api4tree.jsParseDate( this_n_title.html() );
			     if( mynewdate.date == "") { $(".header_text").html(""); return true; }
			     $(".header_text").html( mynewdate.date.jsDateTitleFull()+mynewdate.sms+"&nbsp;&nbsp;<i class='icon-back-alt'></i>" );
			     $(".header_text").attr( "title", mynewdate.date.jsDateTitleFull() );
			     jsTitle(mynewdate.title,15000);
			     },200);





			    return true;
			});	
				
			 
		 }
		   		 
		 //логирование любых 5 параметров в консоль  		 
		 this.log = function(x1,x2,x3,x4,x5) { 
		 	var time_dif = jsNow()-last_log_time;
		    last_log_time=jsNow();
		    if(need_log) { 
		    	console.info(log_i+". log("+time_dif+"ms): ",x1?x1:" ",x2?x2:" ",x3?x3:" ",x4?x4:" ",x5?x5:" "); 
		      	log_i++;
		    }
		 } //log
		 
		 
		 $(".tree_history_arrows").on("click","i",function() {
			var isBack = $(this).attr("class").indexOf("left")!=-1;
			api4panel.jsHistoryBack(!isBack);
		 });
		 
		 my_all_history = { 
		 						"tree_1": { "list":[], "list_forward":[], current:"0", focus_id:"1" },
								"tree_2": { "list":[], "list_forward":[], current:"0", focus_id:"1" } 
							  };
							  
		 this.jsGetHistory = function() {
			return my_all_history; 
		 };

		 this.jsHistoryBack = function(forward) {

			 var tree_id = $(".tree_active").attr("id");
			 var now_focus_id = $(".tree_active").attr("focus_id");
			 
			 forward = forward?"_forward":"";
			 
			 
			 var the_list = my_all_history[tree_id]["list"+forward];
			 
			 if(!forward) { var dif = 2; } else { var dif = 1; }
			 
			 
			 var prev_element = the_list[ the_list.length-dif ];
			 
			 if(prev_element) {
			 	
			 	 var current_element_id = api4tree.node_to_id( $(".tree_active li.selected").attr("id") );
				 if(!forward) {
				 	api4panel.jsSaveIdToHistory(tree_id, current_element_id, "_forward", "force"); //сохраняю текущую позицию для кнопки вперёд
				 } else {
				 	api4panel.jsSaveIdToHistory(tree_id, current_element_id, false, "force"); //сохраняю текущую позицию для кнопки назад
				 }
			 	
			 	 if( now_focus_id && now_focus_id!=prev_element.focus_id ) {
				 	 api4panel.jsShowFocus(tree_id, prev_element.focus_id, undefined, undefined, undefined, "from_history");
			 	 }


				 
				 $(".tree_history_arrows i:last").removeClass("disabled");
			 	 
				 api4panel.jsOpenPath( prev_element.id, "from_history" );
				 the_list = the_list.slice(0, the_list.length-1); //-1 так как там предыдущий элемент
				 my_all_history[tree_id]["list"+forward] = the_list;
				 console.info("my_all_history", my_all_history); 
			 }
			 console.info("Hist_back", my_all_history);
			 if(my_all_history[tree_id]["list"].length==1) { 
			 	$(".tree_history_arrows i:first").addClass("disabled");
			 }
			 if(my_all_history[tree_id]["list_forward"].length==0) { 
			 	$(".tree_history_arrows i:last").addClass("disabled");
			 }
			 
		 }

		 this.jsSaveIdToHistory = function (tree_id, id, to_forward, force) {
		    
			 var focus_id = $(".tree_active").attr("focus_id");
			 focus_id = focus_id?focus_id:1;
			 
			 to_forward = to_forward?to_forward:"";
			 
			 var title = api4tree.jsFind(id);
			 if(title) title=title.title;

		 	 var history_item = {};
		 	 history_item.id = id;
		 	 history_item.tree_id = id;
		 	 history_item.focus_id = focus_id;
		 	 history_item.isFolder = api4tree.jsFindByParent(id).length>0;
		 	 history_item.title = title?title:"";
		 	 
		 	 var cnt = my_all_history[tree_id]["list"+to_forward].length-1;
		 	 if(my_all_history[tree_id]["list"+to_forward].length) {
		 	 var old_focus_id = my_all_history[tree_id]["list"+to_forward][cnt].focus_id;
		 	 } else old_focus_id = -2;
		 	 
		 	 
			 if(focus_id != old_focus_id || to_forward || force) {
			 	my_all_history[tree_id]["list"+to_forward].push( history_item );
			 
			 	if(my_all_history[tree_id]["list"].length==2) $(".tree_history_arrows i:first").removeClass("disabled");

//			 my_all_history[tree_id]["current"] = my_all_history[tree_id]["list"].length-1;
			 
			 	console.info("!!!SAVED History:", my_all_history );
			 } else {
				 console.info("!!!Save ignore");
			 }
		 }
		 		 		 	
		 //открывает путь до указанного элемента
		 this.jsOpenPath = function( id, iamfrom ) {

			 

 		 	var isTree = false;
			isTree = $(".tree_active").parent("div").hasClass("panel_type1");
			var isMindmap = api4panel.isMindmap[ $(".tree_active").attr("id") ];


		   if(id != parseInt(id)) return false;
		   if(!$(".mypanel.tree_active #node_"+id).is(":visible")) {
		    var mypath = api4tree.jsFindPath( api4tree.jsFind(id) );
		 	var path1 = mypath.path;
		 	if(!path1) return true;
		 	//if(path1.length<0) return false;
		 	
		 	var focus_id = $(".tree_active").attr("focus_id");
		 	
		 	if(focus_id!=1) { //проверяем, нужно ли выйти из текущего фокуса
			 	var all_childrens_of_focus_id = api4tree.jsRecursive(focus_id);
			 	var need_focus_to_root = true;
			 	$.each(all_childrens_of_focus_id, function(i, el){
				 	if( el && el.id == id ) need_focus_to_root = false;
			 	});
			 	all_childrens_of_focus_id = "";
			 	if(need_focus_to_root) api4panel.jsShowFocus($(".mypanel.tree_active").attr("id"), 1);
		 	}
			
			var p_len = path1.length;
   			for(var ik=0; ik<p_len; ik=ik+1) {
   			   var toopen = path1[ik].path.id;
   			   console.info( "to-open", toopen, $(".tree_active").attr("focus_id") );
   			   if(ik==path1.length-1) {
   			   	  api4panel.jsOpenNode(toopen);
   			   } else {
   			   	  api4panel.jsOpenNode(toopen,'nohash');
   			   }
   			   var findli = $('.tree_active #node_'+toopen);
   			   findli.addClass("tree-open");
   			   findli.parents("li").addClass("tree-open").find("ul").show();
   			   findli.find('ul:first').show();
   			}
		 
			if(isMindmap) jsRepaint("jsOpenPath");
		   }//if length
		 	api4panel.jsOpenNode(id, false,iamfrom);
		 	if(iamfrom!="divider_click") api4panel.jsSelectNode( id , iamfrom);
		   
		 	findli = $('.tree_active #node_'+id);
		 	findli.addClass("tree-open");
		 	findli.find('ul:first').show();
		 
		 	jsFixScroll(2); //делаю так, чтобы видно было все selected и old_selected
//		 	if(isMindmap) myjsPlumb.setSuspendDrawing(false,true);
			console.info("repaint: Ветка просто свёрнута, открываю");
			if(isMindmap || isTree) {
				var offset_top = $(".mypanel.tree_active").height()/2 - $(".tree_active #node_"+id+" .big_n_title").height()-50;
				var offset_left = $(".mypanel.tree_active").width()/2 + $(".tree_active #node_"+id+" .big_n_title").width()-150;
				the_node = $(".tree_active #node_"+id);
				if(the_node.length) {
					$(".mypanel.tree_active").scrollTo($(".tree_active #node_"+id),1500,{offset:{ top: -offset_top, left: -offset_left}});
				}
			} else {
//				$(".mypanel").scrollLeft(9999999);
				//$(".mypanel").stop().animate({"scrollLeft":99999999},500);		 		
			}
			api4panel.jsDrawMindmap();
			
		 }
		 			 			 
		 //заполняет массив разными данными элемента
		 
		 //возвращает один элемент для отображения в дереве
		 this.jsRenderOneElement = function(data, ii, parent_node) {
		 	var info = api4tree.jsInfoFolder(data,parent_node);
		 	
		 	var position = (typeof ii!=undefined)?ii:(parseFloat(data.position)); // - 0.9

//		 	if( (data.did!=0 && settings.show_did==false) || (data.del!=0) ) isVisible = "style='display:none;'";
		 	var isVisible = "";
		 	
		 	var tags_html = api4tree.jsGetTagsForElement( data );
		 	
		 	myli = "<div "+isVisible+" class='divider_li' pos='"+position+"' myid='"+data.parent_id+"'>"+"</div>"; //разделитель
		 	myli +=  "<li "+isVisible+"id='node_"+data.id+"' time='"+data.time+"' myid='"+data.id+"' class='"+info.isFolder+info.crossline+"'>"; 
		 	myli += "<div class='big_n_title'>";
		 	info.comment_count = info.comment_count?info.comment_count:"<i class='icon-down-open'></i>";
		 	myli += "<div class='tcheckbox' title='Меню для "+data.id+"'><b>"+info.comment_count+"</b></div>" + info.icon_share;
		 	myli += "<div class='date1' myid='"+(data.tmp_next_id?data.tmp_next_id:"")+"' childdate='"+(data.tmp_nextdate?data.tmp_nextdate:"")+"' title='"+data.date1+""+(data.tmp_next_title?data.tmp_next_title:"")+"'></div>";
		 	myli += info.remind + info.triangle + info.countdiv + info.img + info.needsync;
		 	myli += "<div class='n_title' myid='"+data.id+"'>";
		 	myli += info.mytitle; 
		 	myli += "</div>"+tags_html + info.add_text + info.search_sample;
		 	myli += "<div class='note_part'></div>";
		 	myli += "</div>"; //big_n_title
		 	myli += "</li>";

//		 	if( (data.did!=0 && settings.show_did==false) || (data.del!=0) ) myli = "";

		 	return myli;
		 } //jsRenderOneElement

		 //обновляет элемент на экране
		 this.jsRefreshOneElement = function(myid) {
		    var elements = $(".mypanel #node_"+myid);
		    $.each(elements, function(i, el){
		    	el = $(el);
			    var make_class="";
			    if (el.hasClass("selected")) make_class = "selected";
			    if (el.hasClass("old_selected")) make_class = "old_selected";
			    el.prev(".divider_li").remove();
			    var myul = el.find("ul:first").clone(); //сохраняю вложенный список
			    el.replaceWith( api4panel.jsRenderOneElement( api4tree.jsFind(myid) ) );
			    $(myul).appendTo(".tree_active #node_"+myid); //вставляю вложенный список обратно
			    if(make_class!="") {
			 	    $(".tree_active #node_"+myid).addClass(make_class);
	    		}
		    });
		    this_db.jsPrepareDate();
		    jsMakeDrop();
		 }

		 //преобразует дату в (-2дн)
		 function jsMakeDate(mydate) {
		 	var today = new Date;
		 	var mylong = "",myclass,mydays;
		 	var result = new Object();
		 	
		 	var dd = Math.round( (Date.createFromMysql(mydate).getTime()-today.getTime())/60/60/1000*10 )/10;
		 
		 	if(mydate.indexOf("00:00:00")!=-1 && (mydate.split(" ")[0] == today.toMysqlFormat().split(" ")[0] )) {
		 		   result.mydays = "0 дн";
		 		   result.myclass = "shortdate";
		 		   return result;
		 	}
		 	
		 	if (mydate=="") return "";
		 
		    if (dd>0) myclass='shortdate';
		    else myclass='shortdatepast';
		 
		    if((dd>24) || (dd<-24) || (mydate.search("00:00:00")!=-1)) {
		        dd=Math.round(dd/24); 
		        mylong="long";
		        if (dd>=0) mydays="+ "+dd+" дн";
		           else
		        mydays=dd+" дн";
		    } else { 
		        if (dd>=0) mydays="+ "+dd+" ч";
		        else mydays=dd+" ч";
		    }
		    
		    result.mydays = mydays;
		    result.myclass = myclass+mylong;
		    
		    return result;
		 }
		 
		 //сканирую все даты на странице и превращаю в (-2дн)
		 this.jsPrepareDate = function( where_to_find ) {

		 	 var dates = where_to_find?( where_to_find.find(".date1") ):($(".date1"));

		   dates.quickEach( function(){  
		       if(this.attr("childdate")) {
			       	var cur_date = jsMakeDate($(this).attr("childdate"));
			       	if(cur_date.mydays!=$(this).html()) {
				       	var for_change = $(this).clone();
				       	for_change.html(cur_date.mydays);
				       	for_change.addClass(cur_date.myclass);
				       	for_change.addClass("fromchildren");
				       	for_change.show();
				       	$(this).replaceWith(for_change);
				    }
		       }
		       else	if($(this).attr("title")){
			       	var cur_date = jsMakeDate($(this).attr("title"));
			       	if(cur_date.mydays!=$(this).html()) {
				       	var for_change = $(this).clone();
				       	for_change.html(cur_date.mydays);
				       	for_change.addClass(cur_date.myclass);
				       	for_change.show();
				       	$(this).replaceWith(for_change);
				       	}
			    }
		       	
		       	
		    });
		 }
		 
		 //удаляю и добавляю узкие полоски для регулировки ширины панелей
		 function jsPresize() { 
		 	$(".mypanel .panel").quickEach(function() {
			 		if( $(this).next(".presize").length==0 ) {
			 			$("<div class='presize'></div>").insertAfter($(this)); 
			 		} else {
			 			$(this).next(".presize").next(".presize").remove();
			 			$(this).next(".presize").next(".presize").remove();
			 			$(this).next(".presize").next(".presize").remove();
			 			$(this).next(".presize").next(".presize").remove();
			 			$(this).next(".presize").next(".presize").remove();
			 			$(this).next(".presize").next(".presize").remove();
			 			$(this).next(".presize").next(".presize").remove();
			 		}
		 		});
		 }
		 
		 //добавляет новую заметку в нужное место панели
		 this.jsAddToTree = function(id_node) {
		 	var where_to_add;
		 	if($("#node_"+id_node).length) return true; //если элемент уже есть, то добавлять не нужно
		 
		 	console.info("ADD TO TREE = ",id_node);
		 	var element = api4tree.jsFind(id_node);
		 	
		 	var render_node = api4panel.jsRenderOneElement( element );
		 	
		     if(isTree) {
		     	where_to_add = $("ul[myid="+element.parent_id+"]");
		     } else {
		     	where_to_add = $("#panel_"+element.parent_id+" ul");
		     }
		 
		 	where_to_add.find(".divider_li:last").remove();
		 	var iii = element.position;
		 	var divider = "<div class='divider_li' pos='"+(iii+0.1)+"' myid='"+element.parent_id+"'></div>";
		 	
		 	var before_div = where_to_add.find(".divider_li[pos='"+iii+".1']");
		 	if(before_div.length) { 
		 		$(render_node + divider).insertBefore(before_div);
		 	} else {
		 		where_to_add.append(render_node + divider);
		 	}
		 
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

		   var aa = strip_tags(a.path?a.path:"_");
		   var bb = strip_tags(b.path?b.path:"_");
		   
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
		   var aa = strip_tags(a.title?a.title:"_");
		   var bb = strip_tags(b.title?b.title:"_");
		   
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
		 
		 //нумерация позиций для сортировки
		 this_db.jsReorder = function(mydata) {
		 
//®			return mydata;
			var j=1;
			$.each( mydata, function(i,dd) {
				if( !( /_/ig.test(dd.id) ) && (dd.user_id == main_user_id) && dd.id != '6562' ) {
					if((dd.position != j) && (dd.did=="")) { //если позиция не корректная
						api4tree.jsFind(dd.id,{position : j});
					}
					if(dd.did=="") j++;
				}
			});
			return mydata;
		 }
		 
		 this.jsShowFocus = function(tree_id, id, need_select_first_element, expand_all, snapshot, iamfrom) {

		 	 console.info("SNAPSHOT:", snapshot);
		 	 if(api4tree.jsFindByParent(id).length==0) return false;
		  	 var element = api4tree.jsFind(id);
		  	 var parent_id = id;
		 	 $("#"+tree_id+".mypanel").html("<div id='panel_"+parent_id+"' class='panel'><ul myid='"+parent_id+"'></ul></div>").attr("focus_id",parent_id);

		 	 if( tree_id=="tree_1" || api4panel.isMindmap["tree_2"] ) {
		 	 var html = api4panel.jsGetNodeHtml({tree_id:tree_id, parent_id: parent_id, html: "", focus_id: parent_id, snapshot:snapshot, expand: expand_all});
		 	 $("#"+tree_id).html( html );
		 	 
		 	 api4panel.jsPrepareDate( $("#"+tree_id) );

		 	 } else {
				 api4panel.jsShowTreeNode(tree_id, parent_id, false, undefined, undefined, expand_all);
			 }
			 
			 if(need_select_first_element) {
				 var first_id = $("#"+tree_id+" li:first").attr("myid");
				 api4panel.jsSelectNode(first_id);
			 }
			 	if(iamfrom != "from_history") {
			 		api4panel.jsSaveIdToHistory( $(".tree_active").attr("id"), id); //сохраняю в истории переходов
			 	}
			 jsMakeDrop();
		 }
		 
		 //tree_id, parent_id, other_data
		 this.jsGetNodeHtml = function(params) {
		 	var isMindmap = $("#"+params.tree_id).parent("div").hasClass("mindmap");
		 	
		 	if(isMindmap) var visible_block = "display:inline-block;";
		 	else var visible_block = "display:block;";
		 
		 	if(params.parent_id==-1) { 
		 		var mydata = params.other_data;
		 		mydata = mydata.sort(sort_by_path); //сортирую
		 	} else { 
		 		var mydata = api4tree.jsFindByParent(params.parent_id,null,true); 

		 		var isDiary = /_ДНЕВНИК/ig.test( api4tree.jsFindPath(api4tree.jsFind(params.parent_id)).textpath );

		 		if( (isDiary) && (params.parent_id!=1) ) { //test
			 		mydata = mydata.sort(sort_by_title); //сортирую
		 		} else {
			 		mydata = mydata.sort(sort_by_position); //сортирую
		 		}

		 		if(params.parent_id && (params.parent_id.toString().indexOf("_")==-1)) { //если это не синтетическая папка
		 			mydata = api4panel.jsReorder(mydata); //перенумирую элементы
		 		}
		 	}
		 	
		 	var this_parent_data = api4tree.jsFind(params.parent_id);
		 	if(!this_parent_data) return params.html;
		 	
 		    if( ((/_/ig.test(params.parent_id.toString())) || ( params.parent_id==1 && (mydata.length>50)) ) || (!params.expand) ) var dont_expand = true;
 		    else var dont_expand = false;
 		    
 		    if( params.parent_id==params.focus_id ) dont_expand = false;
 		    
 			if( typeof params.snapshot != "undefined" && params.snapshot.snapshot.indexOf("node_"+params.parent_id)!=-1) {
 				dont_expand = false;
 				console.info("FOUND IN SNAPSHOT",params.parent_id);
 			}
 			
 			if(dont_expand) visible_block = "";
		 	
		 	var ul = "";
		 	
		 	if(params.parent_id==params.focus_id) { 

 		    	if(params.parent_id==1) {
 		    		var title_center = "4tree.ru";
 		    		var add_ = "<i class='icon-home'></i>";
 		    	} else {
	 		    	var title_center = api4tree.jsFind(this_parent_data.parent_id).title;
	 		    	var add_ = "<i class='icon-fast-bw'></i>";
 		    	}
 		    	
 		    	var mindmap_center = ("<div id='mindmap_center'><b>"+add_+title_center+"</b></div>");

 				
		 		var ul_first = "<ul class='ul_childrens' style='"+visible_block+"' myid="+params.parent_id+"><div>"; 
		 		var ul_last = "</div></ul>";
		 		var parent_li = "<div class='panel' id='panel_"+params.parent_id+"'>"+mindmap_center+"<ul>";
		 		parent_li += api4panel.jsRenderOneElement(this_parent_data,this_parent_data.position?this_parent_data.position:0,params.parent_id);
		 		parent_li += "</ul></div>";
		 	} else {
			 	var ul_first = "<ul class='ul_childrens' style='"+visible_block+"' myid="+params.parent_id+"><div>";
		 		var ul_last = "</div></ul>";
		 		var parent_li = api4panel.jsRenderOneElement(this_parent_data,this_parent_data.position?this_parent_data.position:0,params.parent_id);
		 	}

 		    
 		    
 		    if(!dont_expand) {

	 		    if(mydata.length>0) ul += ul_first;

			 	$.each(mydata, function(i,data) {
			 		  if(!data) return params.html;
				 	  ul += api4panel.jsGetNodeHtml({tree_id:params.tree_id, parent_id: data.id, html:ul, focus_id:params.focus_id, expand: params.expand,
					 	  							 snapshot:params.snapshot});
			    });
				
				ul += "<div class='divider_li' pos='100000' myid='"+params.parent_id+"'></div>";

				if(mydata.length>0) { 
				    ul += ul_last;
				    var new_p = $("<div>"+parent_li+"</div>");
				    new_p.find("li:first").append( ul );
				    if(!dont_expand || params.parent_id==params.focus_id) new_p.find("li:first").addClass("tree-open");
				    parent_li = new_p.html();
				}

			}
		 	
 		    

 		    
// 		    $(parent_li).find("li").addClass("tree-open").find("ul").show();
 		    
 		    params.html = parent_li;
// 			console.info(params.parent_id,params.html);
		 	jsPrepareDate();
		 	return params.html;
		 }
		 

		 this.jsShowTreeNodeInside = function(tree_id, parent_node,isTree1,other_data, where_to_add, expand_all) {

		 	var h3_search_already_added = false;
		 	var isTree = api4panel.isTree[ $(".tree_active").attr("id") ];
		 	var isMindmap = api4panel.isMindmap[ $(".tree_active").attr("id") ];

		 	if(parent_node==-1) { 
		 		var mydata = other_data;
		 		mydata = mydata.sort(sort_by_path); //сортирую
		 	} else { 
		 		var mydata = api4tree.jsFindByParent(parent_node,null,true); 

		 		var isDiary = /_ДНЕВНИК/ig.test( api4tree.jsFindPath(api4tree.jsFind(parent_node)).textpath )

		 		if( (isDiary) && (parent_node!=1) ) {
			 		mydata = mydata.sort(sort_by_title); //сортирую
		 		} else {
			 		mydata = mydata.sort(sort_by_position); //сортирую
		 		}

		 		if(parent_node && (parent_node.toString().indexOf("_")==-1)) { //если это не синтетическая папка
		 			mydata = api4panel.jsReorder(mydata); //перенумирую элементы
		 		}
		 	}
		 	
		 	if(mydata.length==0)  //если папку уже удалили, скрываю её
		 		{
		 		$("#"+tree_id+" .panel[myid='"+parent_node+"']").remove();
		 		return "";
		 		}

		 	var where_to_add_cache = $("<div></div>");
		 	
		 	$.each(mydata, function(i,data) {
		 		  if(!data)	return "";

		 		  if(parent_node!=-1) {//если мы находимся не в поиске
			 		  if(i==0) {
			 		  	if(isTree && parent_node!=1) {  // если это дерево
			 		  		if( $("#"+tree_id+" .ul_childrens[myid="+parent_node+"]").length==0 ) {
			 		  		
//			 		  			var childrens = api4panel.jsShowTreeNode(tree_id, parent_id, false, undefined, undefined, expand_all);
								var childrens = api4panel.jsShowTreeNodeInside(tree_id, data.id,isTree1,other_data, where_to_add, expand_all);
								if(expand_all && !(childrens == "") ) 
									childrens = childrens.html();
								else childrens = "";
								console.info("!!!",data.id, where_to_add);
			 		  		
			 		  			$("#"+tree_id+" #node_"+parent_node).append("<ul class='ul_childrens' myid="+parent_node+">"+childrens+"</ul>");
			 		  				
			 		  		} else {
			 		  			//alert(1);
			 		  			//return false;
			 		  		}
			 		  	} else {
			 		  		var parent_node_panel = $("#"+tree_id+" #panel_"+parent_node);
			 		  		if (parent_node_panel.length != 1) //если панель ещё не открыта
			 		  			{
			 		  			var mypanel = $("#"+tree_id+".mypanel");
			 		  			if(pwidth>130) {
				 		  			var pw = pwidth+"px";
				 		  		} else {
				 		  			var pw = "auto";
				 		  		}
			 		  			mypanel.append("<div id='panel_"+parent_node+"' class='panel' style='width:"+pw+"'><ul myid='"+parent_node+"'></ul></div>");
			 		  			}
			 		  		else //если панель уже открыта, нужно её очистить
			 		  		 	{
			 		  		 	parent_node_panel.find("ul").html('');
			 		  		 	}
			 		  	}
			 		  } //if(i==0) Если это первый элемент, создать место, куда добавлять.
		 		  } //-1 -2
		 		  
		 			if((/_ДНЕВНИК/.test(data.path)) && (!h3_search_already_added) && (parent_node==-1))  {
							where_to_add_cache.append("<h3>Дневник</h3>");
							h3_search_already_added = true;		 		  		    
				  }


		 		  where_to_add_cache.append( api4panel.jsRenderOneElement(data,data.position,parent_node) );
		 		  
		 		  
		 	}); //each(mydata)
		 	
		    var divider = "<div class='divider_li' pos='100000' myid='"+parent_node+"'></div>";
		 	where_to_add_cache.append(divider);
		 	return where_to_add_cache;

	     }
		 
		 //функция отображения панели для дерева		 
		 this.jsShowTreeNode = function(tree_id, parent_node,isTree1,other_data, where_to_add, expand_all) {
		 	
 		 	var isTree = false;
			isTree = $("#"+tree_id).parent("div").hasClass("panel_type1");
			var isMindmap = api4panel.isMindmap[ $(".tree_active").attr("id") ];
//			isMindmap = ((tree_id == "tree_2"));
			
			if(isMindmap) focus_id = $("#tree_2").attr("focus_id");

		 	if(other_data) { //если данные внешние
		 		$(".search_panel_result ul").html('');
		 	}
		 

		 	if(!myjsPlumb.isSuspendDrawing() && isMindmap) {
		 		myjsPlumb.setSuspendDrawing(true, true);
		 		console.info("set_suspend");
		 	}

		 	//Цикл
		 	where_to_add_cache = api4panel.jsShowTreeNodeInside(tree_id, parent_node,isTree1,other_data, where_to_add, expand_all);
		 	


		 	if(!where_to_add) {
		 		  if(isTree) where_to_add = $("#"+tree_id+" ul[myid="+parent_node+"]");
		 			else where_to_add = $("#"+tree_id+" #panel_"+parent_node+" ul");
		 	}
		 	
		 	if(parent_node==-1) { //функция отображения результатов поиска//
			  	where_to_add = $(".search_panel_result ul");
		 	}

		 	api4panel.jsPrepareDate( where_to_add_cache );

		 	where_to_add.html( where_to_add_cache );
		 	
 		    if(parent_node==$("#tree_2").attr("focus_id")) {
 		    	if(parent_node==1) {
 		    		var title_center = "4tree.ru";
 		    	} else {
	 		    	var title_center = api4tree.jsFind(parent_node).title;
 		    	}
 		    	
 		    	where_to_add.parents(".panel:first").prepend("<div id='mindmap_center'><b>"+title_center+"</b></div>");
 		    }

 		  if(isMindmap && false) {

 		    $.each(line_cache, function(i, el){
 		    	
 		    	if( !my_connections[ el.target ] && !my_connections[ el.target ]) {
 		    	
 		    		if(el.source == "mindmap_center") {
	 		    	  var p1 = myjsPlumb.addEndpoint("tree_2 #mindmap_center b", { anchor: [ 1, 0.5, 1, 0, -1, -1 ]});	
	 		    	  var LineType = "Bezier";
 		    		} else {
 		    	      var p1 = myjsPlumb.addEndpoint("tree_2 #"+"node_"+el.source+" .big_n_title:first", { anchor: [ 1, 1, 1, 0, -1, -1 ]});
 		    	      if( api4tree.jsFindByParent(el.source).length>10 ) var LineType = "Bezier";
 		    	      else var LineType = "Bezier";
 		    	    }
 		    	    var p2 = myjsPlumb.addEndpoint("tree_2 #"+"node_"+el.target+" .big_n_title:first", { anchor: [ 0, 1, -1, 0, 1, -1 ]});
 		    	    
 		  		  	xxx = myjsPlumb.connect({source: p1, target: p2, scope:"someScope", deleteEndpointsOnDetach:true, connector:[ LineType, { curviness: 30 } ]});
 		  		  	console.info("connect_to", strip_tags(api4tree.jsFind(el.target).title), el.target );
 		  		  	my_connections[ el.target ] = xxx; //кэшируем все линии, чтобы потом пользоваться
 		  		  } else {
 		  		  	console.info("Линии уже есть");
 		  		  }
 		  	});

 		  }


		 	if(!isTree && !isMindmap && parent_node != -1) if(where_to_add) where_to_add.append(top_of_panel);
//		 	if(parent_node!=1) myjsPlumb.repaint("node_"+parent_node);
//		 	console.info("suspend_repaint");
//		 	if(isMindmap) myjsPlumb.setSuspendDrawing(false,true);		 	
		 	
 	 	    
		 	  
		 	if(parent_node==-1) return true;
		 	  	
		 
		 	if(isTree) 
		 	  	{
		 	  	}
		 	else
		 	  	{
/*		 	if(!$(".makedone").is(":visible"))
		 		if(!isTree && !isMindmap) {
			 		if($('.mypanel').scrollLeft()!=thisWidth) mypanel.stop().animate({"scrollLeft":thisWidth},700);		 		
		 		}*/
		 		}
		 	
		 	if(!isTree) 
		 		{
		 		jsPresize();
		 		}
		 	
		 	jsMakeDrop();
		 	
		 } //jsShowTreeNode
		 
		 
		 $("body").on("click","#mindmap_center", function(){
			var tree_id = $(this).parents(".mypanel").attr("id");
			var id = $(this).parents(".mypanel").attr("focus_id");
		 	var focus_id = $("#tree_2").attr("focus_id");

			if(focus_id==1) {
				var parent_id = 1;
			} else {
				var parent_id = api4tree.jsFind(id).parent_id;
			}
			api4panel.jsShowFocus(tree_id, parent_id, true);
		 });

		 $("#tree_1_home").on("click", function(){
		 	api4panel.jsShowFocus("tree_1", 1, "true", false);
		 });

		 
		 $("#tree_1_collapse").on("click", function(){
		 	 $(this).find("i").css("background", "#888");
		 	 var i = $(this);
		 	 setTimeout(function(){
				 api4panel.jsExpandAll("tree_1", false);
				 i.find("i").css("background", "none");
		 	 },0);
		 });

		 $("#tree_1_expand").on("click", function(){
		 	 $(this).find("i").css("background", "#888");
		 	 var i = $(this);
		 	 setTimeout(function(){
				 api4panel.jsExpandAll("tree_1", "expand_all");
				 i.find("i").css("background", "none");
		 	 },0);
		 });
		 
		 var mindmap_font_size = 10;

		 $("#tree_2_zoom_out").on("click", function(){
		 	if(mindmap_font_size>5)	mindmap_font_size -= 1;
		 	$("#tree_2").css("font-size",mindmap_font_size+"px");
		 	jsRepaint();
		 });

		 $("#tree_2_zoom_in").on("click", function(){
		 	if(mindmap_font_size<25)	mindmap_font_size += 1;
		 	$("#tree_2").css("font-size",mindmap_font_size+"px");
		 	jsRepaint();
		 });

		 $("#tree_2_home").on("click", function(){
		 	api4panel.jsShowFocus("tree_2", 1, "true", false);
		 });

		 
		 $("#tree_2_collapse").on("click", function(){
		 	 $(this).find("i").css("background", "#888");
		 	 var i = $(this);
		 	 setTimeout(function(){
				 api4panel.jsExpandAll("tree_2", false);
				 i.find("i").css("background", "none");
		 	 },0);
		 });

		 $("#tree_2_expand").on("click", function(){
		 	 $(this).find("i").css("background", "#888");
		 	 var i = $(this);
		 	 setTimeout(function(){
				 api4panel.jsExpandAll("tree_2", "expand_all");
				 i.find("i").css("background", "none");
		 	 },0);
		 });

		 $("#mindmap_on").on("click", function(){
		 
		 	var id = api4tree.node_to_id( $(".tree_active li.selected").attr("id") );
			 if( $("#tree_2").parent("div").hasClass("mindmap") ) {
			 		$("#tree_center .top_panel_header").hide();
			 		$(this).removeClass("active");
				 	$("#tree_2").parent("div").removeClass("mindmap").removeClass("panel_type1").addClass("panel_type3");
				 	api4panel.isMindmap["tree_2"] = $("#tree_2").parent("div").hasClass("mindmap");
				 	api4panel.isTree["tree_2"] = $("#tree_2").parent("div").hasClass("panel_type1");
				 	myjsPlumb.reset();
				 	jsRefreshTree();
				 	api4tree.jsZoomTree(-2000);
			 } else {
			 		if( $("body").hasClass("params_hide")  ) $(".tree_view_center").click();
			 		$("#tree_center .top_panel_header").show();
			 		$(this).addClass("active");
			 		$("#tree_2 .panel").nextAll(".panel").hide();
				 	$("#tree_2").parent("div").addClass("mindmap").addClass("panel_type1").removeClass("panel_type3");
				 	api4panel.isMindmap["tree_2"] = $("#tree_2").parent("div").hasClass("mindmap");
				 	api4panel.isTree["tree_2"] = $("#tree_2").parent("div").hasClass("panel_type1");
				 	jsRefreshTree();
			 }
		 	 api4panel.jsOpenPath(id);
		 });


		 
		 this.jsExpandAll = function(tree_id, expand) {
		 
		 	var focus_id = $("#"+tree_id).attr("focus_id");
		 	api4panel.jsShowFocus(tree_id, focus_id, "true", expand);
		 	
		 }

		 this.jsDrawMindmap = function() {

			if( !api4panel.isMindmap["tree_2"] ) return true;
		 	console.info("DRAW LINES");

		 	
		 	var line_cache = [];
		 	
		 	var focus_id = $("#tree_2").attr("focus_id");
		 	
		 	if(!$("#tree_2 #node_"+focus_id+" .big_n_title:first").hasClass("_jsPlumb_endpoint_anchor_")) {
			 	line_cache.push( {source: "mindmap_center", target: focus_id} );
			}
		 	
		 	$("#tree_2 ul:visible").each(function(){
		 		var ul_id = $(this).attr("myid");
		 		var childs = api4tree.jsFindByParent(ul_id);
		 		var focus_id = $("#tree_2").attr("focus_id");
			 	$.each(childs, function(i,el){
				 	var target = el.id;
				 	if(!$("#tree_2 #node_"+target+" .big_n_title:first").hasClass("_jsPlumb_endpoint_anchor_")) {
					 	var parent_id = el.parent_id;
					 	
					 	//if(parent_id == focus_id) parent_id = "mindmap_center";
					 	line_cache.push( {source: parent_id, target: target} );
				 	}
			 	});
		 	});
		 	
		 	if(line_cache.length>400) {
		 		jsTitle("Слишком много элементов, воспользуйтесь фокусом (2 клика): "+ line_cache.length, 50000);
		 		line_cache = line_cache.reverse().splice(0,400);
		 	}
		 	
		 	if(line_cache.length) {
			 	if(!myjsPlumb.isSuspendDrawing() && isMindmap) {
			 		myjsPlumb.setSuspendDrawing(true, true);
			 		console.info("set_suspend");
			 	}
		 	}
		 	
		 	
 		    $.each(line_cache, function(i, el){
 		    	
 		    	if( true ) {
 		    	
 		    		if(el.source == "mindmap_center") {
     		    	  var p1 = myjsPlumb.addEndpoint("tree_2 #mindmap_center b", { anchor: [ 1, 0.5, 1, 0, -1, -1 ]});	
     		    	  LineType = "Bezier";
 		    		} else {
 		    	      var p1 = myjsPlumb.addEndpoint("tree_2 #"+"node_"+el.source+" .big_n_title:first", { anchor: [ 1, 1, 1, 0, -1, -1 ]});
 		    	      ;
 		    	      var count = api4tree.jsFindByParent(el.source).length;
 		    	      if( count > 20 ) {
	 		    	      var LineType = "Flowchart";
 		    	      } else {
 		    	      	  var LineType = "Bezier";
 		    	      }
 		    	      
 		    	      if(count<4) var LineType = "Straight";
 		    	      
 		    	    }
 		    	    var p2 = myjsPlumb.addEndpoint("tree_2 #"+"node_"+el.target+" .big_n_title:first", { anchor: [ 0, 1, -1, 0, 1, -1 ]});
 		    	    
 		  		  	xxx = myjsPlumb.connect({source: p1, target: p2, scope:"someScope", deleteEndpointsOnDetach:true, connector:[ LineType, { curviness: 30, cornerRadius: 20 } ]});
					xxx = true;
 		  		  	my_connections[ el.target ] = xxx; //кэшируем все линии, чтобы потом пользоваться
 		  		  } else {
 		  		  	console.info("Линии уже есть");
 		  		  }
 		  	});
		 	if(line_cache.length) {
			 		jsRepaint("Draw Mindmap");
			}
		 }


		 this.jsPathTitle = function(id) {
		 		var mypath = api4tree.jsFindPath( api4tree.jsFind( id ) );
		 		if(!mypath) return true;
				var new_folder = api4tree.jsCreate_or_open(["_НОВОЕ"]);
		 		var new_path = "<li myid='"+new_folder+"'>&nbsp;&nbsp;<i class='icon-home'></i></li>";
		 		$.each(mypath.path, function(i, el) {
		 			  new_path += "<i class='icon-right-open'></i>";
		 				new_path += "<li myid='"+el.path.id+"'>"+el.path.title+"</li>"

		 		});
		 		$("#path_tree ul").html( new_path );
		 		var top_panel_width_proc = ($(".path_line").width()-95*2) / ($(".path_line").width()) * 100;
			
		 		var width = parseInt( top_panel_width_proc / (mypath.path.length) )-1;
		 		$("#path_tree li").css("max-width",width+"%");
		 }


		 
		 this.jsSetTitle = function(id) {
		 		return false;
		 		var element = api4tree.jsFind(id);
		 		if(!element) return false;
			 	var new_title = "";			 	
			 	var path = api4tree.jsFindPath( element );
			 	var ul_text = "";
			 	$.each(path.path, function(i,el) {
				 	new_title = api4tree.jsShortText( el.path.title, 35 );
			 		ul_text += "<li myid='"+el.path.id+"'><a>"+new_title+"</a>";
			 		ul_text += "</li>";
			 	});
			 	
//			 	$(".header_text").next("ul").html(ul_text);
			 	$("#myslidemenu ul,#myslidemenu li").removeAttr("style");
			 	jqueryslidemenu.buildmenu("myslidemenu", arrowimages);

		 }




	  } //arguments.callee.instance
	 } //if typeof
	 
	 return arguments.callee.instance;
}


/////////////////////////////////////OTHERS////////////////////////////////////////
var API_4OTHERS = function() {
	 if ( (typeof arguments.callee.instance=='undefined') || true)
	 {
	  arguments.callee.instance = new function(){
		var this_db = this;
		var finishtime, resttime, mypomidor, my_min;
		
		//открывает ссылку в новом tab тестированно в chrome
		this.open_in_new_tab = function (url) {  
		  window.open(url, '_blank');
		  window.focus();
		}		
		
		//устанавливает заголовок окна с title выбранного элемента
		this.jsSetTitleBack = function() {
		   var mytitle = $(".tree_active.mypanel .selected").find(".n_title").html();
		   if(mytitle) {
    		   document.title = "4tree.ru: "+api4tree.jsShortText( strip_tags(mytitle) ,150 );
		   } else {
		   	   document.title = "4tree.ru";
		   }
	    }


		function find_icon_for_file_type(filename_title) {
			var ext = filename_title.split(".");
			var extension = ext[ext.length-1].toLowerCase();
			
			var i_have_file_types = ["aac","ai","aiff","avi","bmp","c","cpp","css",
									 "dat","dmg","doc","dotx","dwg","dxf","eps",
									 "exe","flv","gif","h","hpp","html",
									 "ics","iso","java","jpg","key","mid","mp3",
									 "mp4","mpg","odf","ods","odt","otp","zip",
									 "ots","ott","pdf","php","png","ppt","psd",
									 "py","qt","rar","rb","rtf","sql","tga","tgz",
									 "tiff","txt","wav","xls","xlsx","xml","yml"];
			if(i_have_file_types.indexOf(extension)!=-1) {
				var filename = "img/file-type-icons/32px/"+extension+".png";
			} else {
				var filename = "img/file-type-icons/32px/_blank.png";
			}
			
			return "<img title='"+filename_title+"' class='file_icon' src='"+filename+
				   "' height='16px' width='16px'>";
		}

		function readableFileSize(size) {
			size = parseInt(size);
		    var units = ['byte', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
		    var i = 0;
		    while(size >= 1024) {
		        size /= 1024;
		        ++i;
		    }
		    return size.toFixed(1) + ' ' + units[i];
		}
		//показываю панель файлов
		this.jsShowFiles = function(mytype) {
		
			api4tree.jsFindFilesLinkFromTexts();
		
		  jsGetToken().done(function(token){
			var lnk = web_site + "do.php?access_token=" + token + "&get_files="+mytype;
		    var html = "";
		    
		    if(mytype=="all") html = "<ul class='files_list'>";
		    				
			$.getJSON(lnk,function(data){
				$.each(data,function(i,el) {
					if(mytype=="images") {
						html += "<div class='one_foto' link='"+el.link+"'>"+
									"<img src='"+el.preview1+"'>"+
									"<div class='foto_delete' title='Удалить'><i class='icon-cancel'></i></div>"+
								"</div>";
					} else if (mytype=="all") {
						var date1 = sqldate( parseInt(el.add_time) );
						html += "<li><a href='"+el.link+"'>"+find_icon_for_file_type(el.filename)+
							api4tree.jsShortText(el.filename,30)+"</a>"+
							"<div class='date1 fromchildren' title='"+date1+
							"'></div>"+
							"<div class='file_size'>"+readableFileSize(el.filesize)+
							"</div>"+
							"</li>";
					}
				});
				
				if(mytype=="all") html += "</ul>";
				
				$("#tree_files_content").html(html);
				jsPrepareDate();
				});
		  }); //jsGetToken
		}

		
		//выбирает случайную шутку для завршённой помидорки
		function getRandomPomidorJoke() {
			var pomidor_text = ['Отлично. Но нужно отвлечься',
					'Вы молодец. Сейчас прогуляйтесь и подумайте над следующим делом',
					'Так держать. Вам можно доверить самое ответственное дело',
					'Супер! Вам все завидуют',
					'Хорошо, но можно было сделать это проще',
					'Вот это да. Вы хорошо работаете',
					'Вы наш герой. Мы берём с вас пример',
					'Так вы далеко продвинитесь',
					'Извините, что отвлекаю, но вам лучше отдохнуть',
					'Неплохо. Теперь вам нужно сделать мини-зарядку',
					'Ещё одним делом-лягушкой меньше',
					'Так по одной котлетке, вы съедите целого слона',
					'Очень хорошо. Вы умеете сделать всё в лучшем виде',
					'Это было превосходно. Вы должны научить этому других',
					'Уже лучше. Теперь отдохните.',
					'Отличная работа. Мы знаем, что вы умеете быть в кураже',
					'Превосходная работа. Но вы увлеклись, отдохните',
					'У вас отлично получается. Продолжим после отдыха',
					'Я начинаю думать, что вы трудоголик. Разомнитесь',
					'Трудно, но вы справляетесь. Я в вас верю',
					'Вы, похоже, не знаете, что такое лень. Столько всего уже переделали',
					'Ваш мозг, как машина. Теперь отдохните, скоро научитесь держать темп',
					'Чувствуете, что вы совсем не устали. Вы упорны',
					'Гениально, но я думаю, вам нужно ещё раз подумать, что вы сделали',
					'Ваш труд восхищает. Время летит незаметно, но вы его обгоняете',
					'Я смотрю, вы получаете удовольствие от работы. Так держать',
					'25 минут пролетели незаметно, но вы много сделали',
					'Я в вас верю. Уж я то знаю',
					'Все бы так работали, не думая о своих нелепых комплексах',
					'Вы заслужили чашку чая, расслабьтесь',
					'Вы заслужили похвалу. Погладьте себя',
					'Побалуйте себя, вы отлично сегодня работаете',
					'Все лентяи вам завидуют',
					'Вы хорошо продвинулись',
					'Ваш мозг гениален',
					'Поработали наславу. Желаю приятного отдыха',
					'Отлично! Сходите умыть лицо, сбодритесь',
					'Превосходная работа. Сделайте зарядку.',
					'Хорошо поработали, только держите осанку',
					'Вы заслужили горячий кофе',
					'Ого! Вы так замечательно работаете',
					'Хорошо, но в следующий раз, постарайтесь не отвлекаться',
					'Хорошо, но вам необходимо прогуляться',
					'Хорошо, теперь подышите свежим воздухом',
					'Отлично. Лучший отдых, смена деятельности. Протрите, пожалуйста, монитор',
					'Хорошо, но ваши глаза уже устали. Отдохните',
					'Отдохнув, вы сможете работать быстрее. Прогуляйтесь',
					'Хорошая работа. Закройте глаза и помечтайте.',
					'Как всегда хорошо, но не сидите всё время за компьютером. Отдохните',
					'Очень рад, что вы были сконцентрированны',
					'Вот видите, пока вы делали это дело, мир остался на том же месте, а вы продвинулись',
					'Хорошо, но вам необходимо прогуляться',
					'Очень хорошо, только мне кажется у вас клавиатура требует протирки',
					'Отлично, теперь сходите похвалите кого нибудь',
					'Отличная работа! А вы давно звонили родителям? Порадуйте их',
					'Отличная работа! Теперь разомнитесь',
					'Хорошо, но обычно вы делаете всё гораздо лучше',
					'Вы замечательно потрудились, теперь посжимайте пальцы',
					'Очень хорошо, теперь сделайте повороты шеи несколько раз и отдохните',
					'Отлично, теперь встаньте со стула и прогуляйтесь',
					'Рады за вас, вы умеете работать',
					'Молодец! Вы заслужили отдых',
					'Супер! Теперь вам срочно нужно посмотреть на природу',
					'Извините, но вы могли бы сделать это лучше',
					'Великие люди тоже были увлечены',
					'Хорошо, сохраняйте кураж',
					'Молодец, вы можете собой гордиться',
					'Очень хорошо, теперь посмотрите в окно, там так красиво',
					'Вы отлично знаете своё дело. Отдохните, отвлекитесь от компьютера',
					'Вы отлично знаете своё дело, но старайтесь не отвлекаться',
					'Молодец! Не отвлекаясь, вы делаете всё быстрее',
					'Хмм… Вы отлично справляетесь',
					'Хмм… Вам просто необходим свежий воздух',
					'Вы время зря не теряете',
					'Вы далеко пойдёте',
					'Отлично, а сейчас отдохните и подумайте, что вас беспокоит',
					'Неплохо, теперь закройте глаза и вспомните самый счастливый момент своей жизни',
					'Отлично, теперь вспомните, что вы хотите больше всего в жизни',
					'Отвлекитесь, но знайте, вы отлично продвинулись',
					'У вас отличные задатки, только старайтесь концентрироваться лучше',
					'Я обожаю вас за то, что вы умеете работать',
					'Отлично! Вы знаете как делать трудные дела',
					'Молодец! Ещё одно дело не нужно теперь откладывать',
					'Вы не теряете время даром',
					'Превосходно, вы как марафонец',
					'Очаровательно, вы, похоже, получаете огромное удовольствие',
					'Вы замечательно работаете, по крайней мере, все так думают',
					'Ничего себе. Ваши завистники умрут от горя',
					'Мы вами восхищаемся. Вы многое успели',
					'Хорошо, но следующее дело делайте неспеша',
					'Хорошо, может, теперь чего-нибудь горяченького',
					'Вот это да. Вы можете свернуть горы',
					'Целых 25 минут концентрации. Вам можно доверять',
					'Вы восхищаете меня уже не первый раз',
					'Плохо. Вам нужно подумать, тем ли вы занимались',
					'Так держать, но не забывайте себя баловать',
					'Отлично, но вы заслужили право немного полениться',
					'Вы отлично сконцентрированны. Но отдых вам пригодится',
					'Хорошо, что вы не отвлекались'];

      	        var joke_id = parseInt(Math.random()*pomidor_text.length,10); 
      	        return pomidor_text[joke_id];
		}
		
		function RestMin(restsec) {//сколько осталось минут
			var dots=":",my_nul;
			var min = parseInt(restsec/60,10);
			var sec = parseInt(restsec-min*60,10);
			
		    if (sec<'10') { 
		    	my_nul = '0';
		    } else {
		    	my_nul = '';
		    }
			return min + dots + my_nul + sec + " — осталось";
		}
		
		
		//запуск помидорки, если установленно время финиша
		this.goPomidor = function() { 

	      var now = new Date().getTime();
	      finishtime = parseInt(endtime,10)+(-my_min*60*1000);
	      resttime = (finishtime-now)/1000;
	
	      if ((!resttime) || (resttime<0)) { //если время уже давно вышло, сбрасываю
	      	$("#pomidoro_icon i").removeClass("pomidor_now");
	      	$("#left_panel").removeClass("show_pomidors");
	
	      	localStorage.setItem("pomidor_id","0"); 
	        localStorage.setItem("pomidor_endtime","0");
	      	this_db.jsSetTitleBack();
	      	return true; 
	      }
	
	  	  $("#pomidor").css("opacity","1");
	  	  
	  	  var snd3 = new Audio("img/tick2.mp3"); // buffers automatically when created
	  	  snd3.play();
	  	  
	  	  var snd = new Audio("img/bell.wav"); // buffers automatically when created
	
	      //Сохраняю параметры, чтобы при перезагрузки сайта таймер тикал дальше
	      if($(".pomidor_now").attr('id')) 
	        {
	        var id = parseInt( $(".pomidor_now").attr('id').replace("pomidor",""),10 );
	        localStorage.setItem("pomidor_id",id);
	        }
	      else
	        {
	        localStorage.setItem("pomidor_endtime","0");
	        }
	      localStorage.setItem("pomidor_endtime",endtime);
	      localStorage.setItem("pomidor_my_min",my_min);
			      
			      
		  clearInterval(mypomidor);
    	  mypomidor =
    	     setInterval(function(){
    	        var now = new Date().getTime();
    	        finishtime = parseInt(endtime,10)+(-my_min*60*1000);
    	        resttime = (finishtime-now)/1000;
    	        document.title=RestMin(resttime);
    	        
    	        //сдвигаю ползунок
    	        $("#pomidor_scale").css("margin-left",parseInt(-resttime*513/80/60,10));
    	  
    	        if (parseInt(resttime)==15) snd3.play();
    	  
    	        if (resttime<=0) {
				  this_db.jsSetTitleBack();
    	      	  console.info("<=","скрываю");
    	          $("#pomidor_scale").css("margin-left",0); 
    	  
    	          var my_min3 = -my_min;
    	      	  var my_min2 = my_min3 - parseInt(my_min3/10,10)*10;
    	      	  var word_end,word_end2;
    	          if((my_min2==2) || (my_min2==3) || (my_min2==4)) { 
    	          	word_end = 'ы'; word_end2 = 'у';
    	          } else { 
    	          	word_end = ''; word_end2 = 'у'; 
    	          }
    	          if((my_min2==1)) { word_end = 'а'; word_end2 = 'ё'; }
    	           
    	      	  snd.play();
    	          if($("#pomidoro_icon i").hasClass("pomidor_now")) { //если это помидорка
    	      	        var id = parseInt( $(".pomidor_now").attr('id').replace("pomidor",""),10 );
    	      	        if (id==8) id=0;
    	      	        id = id+1;
    	      	        var text = $("#pomidor"+id).attr("text");
    	      	        //выбираю случайную шутку из массива:
    	      	        
    	      	        if($("#pomidor"+id).attr("time")!="-25") {
    	      	           var joke = getRandomPomidorJoke()+".\n\n";  //тут нужно добавить помидорку в дневник
    	      	        } else { 
    	      	           var joke="";
    	      	        }
    	      	        
    	      	        if(id==2 || id==4 || id==6 || id==8) {
       	      	        	var last_title = localStorage.getItem("pomidor_last_title");
       	      	        	if(!last_title) last_title = "Мой проект";

    	      	        	var answer = prompt("Прошло 25 минут.\n\nКак описать эту \"помидорку\" в сегодняшнем дневнике?", last_title);
    	      	        	if(answer) {
	    	      	        	localStorage.setItem("pomidor_last_title", answer);
				  				api4tree.log("Тут я добавлю в дневник Помидорку с описанием: "+answer);
				  				api4tree.jsDiaryTodayAddPomidor(answer);
				  				}
    	      	        }
    	  
			  			if(confirm(joke +text+ "\n\nЗапустить таймер Pomodoro?")) {
			  			     $("#pomidoro_icon i").removeClass("pomidor_now");
			  			     $("#pomidor"+id).addClass("pomidor_now").click();
			  			} else {
			  			     $("#pomidoro_icon i").removeClass("pomidor_now");			    
			  			     clearInterval(mypomidor); return; 
			  			}
    	          } else {
    	             alert('Вы просили напомнить, когда пройд'+word_end2+'т '+(my_min3)+' минут'+word_end+'.'); 
					 clearInterval(mypomidor); return; 
    	      	  }
    	        } //resttime<0
    	     },1000) //setInterval
			
			}

		//вспоминаю установки помидорок, нужно после перезагрузки
		this.jsRerememberPomidor = function() {
		   var pomidor_id = localStorage.getItem("pomidor_id");
	       var pomidor_endtime = localStorage.getItem("pomidor_endtime");
		   var pomidor_my_min = localStorage.getItem("pomidor_my_min");
		
		   if(pomidor_id && pomidor_endtime && pomidor_my_min ) {
					$("#pomidor"+pomidor_id).addClass("pomidor_now");
					my_min = pomidor_my_min;
					endtime = pomidor_endtime;
					var now = new Date().getTime();
					if(endtime<now) this_db.goPomidor();
			}
		}
		
		 //регистрация иконок работы с помидорро
		this.jsMakePomidorKeys = function() {
		
			$("#show_pomidors_panel").on("click", function() {
			   $("#tree_left_panel").toggleClass("show_pomidors");
			   api4tree.jsCurrentOpenPanelsAndTabsSave();
			   return false;
			});

			$("#myslidemenu").on("click",".timer_button", timer_button_click);
	        $('#pomidoro_icon').on("click","i", timer_button_click);

	           function timer_button_click() {
	           api4tree.log("Кликнул в помидорку");
//	           var myid=parseInt($(this).attr('id').replace('pomidor',''),10); //номер кликнутой помидорки
	           
	           $("#pomidoro_icon i,#myslidemenu .timer_button").removeClass("pomidor_now");
	           $(this).addClass("pomidor_now"); //отмечаю текущую помидорку зелёным
	           
	           var now = new Date().getTime();
	           endtime = now; //текущее время
	           my_min = $(this).attr('time'); //через сколько минут остановить таймер
	           
	           var new_x = parseInt(my_min*513/80,10);
	           $("#pomidor_scale").stop().animate({"margin-left":new_x-5},500).animate({"margin-left":new_x},100);
	           setTimeout(function(){ $("#left_panel").addClass("show_pomidors"); },10); //отображаю панель с помидорками
	       	   api4others.goPomidor();
	       	   return false;
	        };
	        
	        //отмена помидорки
	        $('#myslidemenu').delegate("#cancel_timer","click", function ()
	          {
	           $("#pomidoro_icon i").removeClass("pomidor_now");
	           
	           if ($(this).attr('time') == 0) {
	       		 localStorage.setItem("pomidor_endtime","0");
	       		 localStorage.setItem("pomidor_my_min","0");
	       		 localStorage.setItem("pomidor_id","0");
	       		 this_db.jsSetTitleBack();
	       	     $("#pomidor_scale").animate({"margin-left":0},500); 
	           	 clearInterval(mypomidor); 
	           	 return; 
	           }
	     
	           var now = new Date().getTime();
	           endtime = now;
	           my_min = $(this).attr('time');
	           
	           
	           var new_x = parseInt(my_min*513/80,10);
	           $("#pomidor_scale").stop().animate({"margin-left":new_x-5},700);
	           $("#pomidor_scale").animate({"margin-left":new_x},100);
			   clearInterval(mypomidor); 		
			   api4others.goPomidor();
	     
	          return false;
	          });
	     
	     
	     
	     $('#pomidor_scale').mousedown( function(e)
	        { 
	       		  this_db.jsSetTitleBack();
	       		  $("#pomidor").css("opacity","1");
	        		  clearInterval(mypomidor); 
	        		  startX = e.pageX;
	        		  startPomidor = parseFloat($("#pomidor_scale").css("margin-left"));
	       		  e.preventDefault();
	     
	       	$(window).mousemove(function(e){
	       		  myX = e.pageX-startX+startPomidor;
	       		  my_min = parseInt(parseFloat(myX)*80/513,10);
	       		  if (-my_min>85) my_min = -85;
	       		  if (-my_min<0) my_min = 0;
	       		  new_x = parseInt(my_min*513/80,10);
	       		  $("#pomidor_scale").stop().animate({"margin-left":new_x},20);
	       		  
	       	    });
	     
	     $(window).mouseup( function()
	        { 
	       	$(window).unbind("mousemove");
	       	$(window).unbind("mouseup");
	           startPomidor = parseFloat($("#pomidor_scale").css("margin-left"));
	           var now = new Date().getTime();
	           endtime = now;
	       	
	     		clearInterval(mypomidor); 		
	       	api4others.goPomidor();
	        });
	     
	        });

		 }
		
	 }
	 return arguments.callee.instance;
	 }
}


/////////////////////////////////////CALENDAR//////////////////////////////////////
var API_4CALENDAR = function() {
	 if ( (typeof arguments.callee.instance=='undefined') || true) {
		  arguments.callee.instance = new function(){
			var this_db = this;
		 
			this.jsInitCalendar = function(){
				alert("INIT CALENDAR");
			}

			//поиск повторяющихся дел
			function jsFindRecur(date) {
			
			var recur_dates = [];
			$.each(my_all_data2, function(i,el) {
				if(el && el.date1 && ((el.del!=1) && (el.date1!="")) && (el.r) && 
					(el.r!="") ) recur_dates.push(el);
			});	
			/* r = recur_type
			//0 - внутри дня
			//1 - ежедневные
			//2 - понедельно
			//3 - ежемесячно
			//4 - ежегодно
			n - каждые n дней
			w - дни недели: 1,2,3,4,5,6,7. 0 - если все дни */
			
			//  $sqlnews .= "( SELECT * FROM tree_recurring WHERE ((`day`=$day AND `month`=$month AND `year`=$year) OR (recur_mode = '2' AND WEEKDAY(CONCAT(`year`,'-',`month`,'-',`day`)) = WEEKDAY('$dd')) ) AND user_id=".$GLOBALS['user_id']." AND  DATEDIFF( CONCAT('$year','-','$month','-','$day') , CONCAT(`year`,'-',`month`,'-',`day`) )>0 )";
			
			var week_dates = recur_dates.filter(function(el,i) 
				{ 
				if(el.date1.split(" ")[0]==date.split(" ")[0]) return true; //если это тот-же день
			
				if(el.r == 4) //каждый год в определенный день и месяц
					{
					el_date = Date.createFromMysql(el.date1);
					el_month = el_date.getMonth();
					el_day = el_date.getDate();
					
					sample_date = Date.createFromMysql(date);
					sample_month = sample_date.getMonth();
					sample_day = sample_date.getDate();
					
					if(el_month==sample_month)
					  if(el_day==sample_day)
						if(el.date1<=date) return true;
					}
			
			
				if(el.r == 3) //каждый месяц в определённый день
					{
					el_date = Date.createFromMysql(el.date1);
					el_month = el_date.getMonth();
					el_day = el_date.getDate();
					
					sample_date = Date.createFromMysql(date);
					sample_month = sample_date.getMonth();
					sample_day = sample_date.getDate();
					
					if(el_day==sample_day)
						if(el.date1<=date) return true;
					
					}
				
				if(el.r == 2) //еженедельно в определенные дни недели
				  	{
					el_week = Date.createFromMysql(el.date1).toString().substr(0,3);
					sample_week = Date.createFromMysql(date).toString().substr(0,3);
					week_num = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].indexOf(sample_week)+1;
			
					if(el.w=="" || !el.w)
						{
						is_week = (sample_week == el_week);
						}
					else
						{
						is_week = !(el.w.split(",").indexOf(week_num.toString()) == -1);
						}
					
						console.info("week=",el.w,week_num,is_week,date);
			
					if(is_week) 
						if(el.date1<=date) return true;
				  	}
				});	
			
			return week_dates;
			}
			
			//обработка формы выбора повторения дела
			function jsMakeShortRecur() {
			 
					var weekday=new Array(7);
					weekday[0]="воскресение";
					weekday[1]="понедельник";
					weekday[2]="вторник";
					weekday[3]="среда";
					weekday[4]="четверг";
					weekday[5]="пятница";
					weekday[6]="суббота";
			
				if( $('select[name=SelectRemindType] option:selected').val()=='1' ) 
					{
					my_col = $("select[name=SelectRemindInterval] option:selected").val();
					if( my_col == 1 )
						var text = 'каждую неделю';
					else
						{
						var text = 'кажд. '+my_col+' нед.';
						}
					}
				
				n='';
				
				if(!$(".r_week").is(":checked"))
					{
					var d=$("input[name=recur_date1]").datepicker("getDate");
					if(d) var n = ' — '+weekday[d.getDay()];
					}
				else
					{
					n = ' — ';
					i = 0;
					$(".r_week:checked").quickEach(function(){
						myday = $(this).attr('name').replace("w","");
						if(i != 0) mycoma = ', ';
						else mycoma = '';
						n = n + mycoma + weekday[myday];
						i = i + 1;
						});
					if(i==7) n = ' — все дни';
					}
				
				if( $("input[name=recur_end_radio]:checked").val() == 2 ) //если указано кол-во повторений
				  {
				  if($(".recur_col").val() != '') n = n + ', ' + $(".recur_col").val() + ' раз(а)';
				  }
			
				if( $("input[name=recur_end_radio]:checked").val() == 3 ) //если указана дата повторений
				  {
				  if($("input[name=recur_date2]").val()!='') n = n + ', до ' + $("input[name=recur_date2]").val();
				  }
			
				$(".recur_label_right b").html(text+n);
				
			
			}

		 
		 }
		 return arguments.callee.instance;
	 }
	
}
///////////////////////////////////////////////////////////////////////////////////


//вывожу дату на русском языке для правого нижнего угла	 
Date.prototype.jsDateTitle = function() {
	var months = [" января", " февраля", " марта", " апреля", " мая", " июня", " июля", " августа", " сентября", " октября", " ноября", " декабря"];
	var days = ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "Суббота"];
	var n = this.getDate() + months[this.getMonth()] + ", " + days[this.getDay()];
	return n;
}

//устанавливаю дату и номер недели в правый нижний угол
function jsSetDiaryDate(skipdays) { 
	var today = new Date( jsNow() ); 
	
	$(".todaydate").html( today.jsDateTitle() ); 
	$(".todayweek").html( "(" + today.getWeek() + " неделя)");
}
	 
	 
	 
//////////////////////////////////DO FIRST///////////////////////////////////////
//эта функция запускается первой
function jsDoFirst() { //функция, которая выполняется при запуске
//		jsPlumb.draggable($(".window"));
		
		jsPlumb.Defaults.Container = $(".mypanel");
		myjsPlumb = jsPlumb.getInstance({
			DragOptions: { cursor: 'pointer', zIndex: 2000 },
			PaintStyle:{ 
			  lineWidth:1, 
			  strokeStyle:"#888"
//			  outlineColor:"black", 
//			  outlineWidth:1 
			},
			Connector:[ "Bezier", { curviness: 30 } ],
			Endpoint:[ "Blank", { radius:5 } ],
			EndpointStyle : { fillStyle: "#567567"  },
			Anchors : [[ 1, 1, 1, 0, -1, -1 ],[ 0, 1, -1, 0, 1, -1 ]]
		});

		jsPlumb.Defaults.Container = $(".mypanel");

		myjsPlumb2 = jsPlumb.getInstance({
			DragOptions: { cursor: 'pointer', zIndex: 2000 },
			Container:$("body"),
			PaintStyle:{ 
			  lineWidth:2, 
			  strokeStyle:"#777"
//			  outlineColor:"black", 
//			  outlineWidth:1 
			},
			Connector:[ "Bezier", { curviness: 30 } ],
			Endpoint:[ "Blank", { radius:2 } ],
			EndpointStyle : { fillStyle: "#567567"  },
			Anchors : [[ 1, 1, 1, 0, -1, -1 ],[ 0, 1, -1, 0, 1, -1 ]]
		});
		

		
        $.datepicker.regional['ru'] = {
                closeText: 'Закрыть',
                prevText: '&#x3c;Назад',
                nextText: 'Вперёд&#x3e;',
                currentText: 'Сегодня',
                monthNames: ['Январь','Февраль','Март','Апрель','Май','Июнь',
                'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
                monthNamesShort: ['Янв','Фев','Мар','Апр','Май','Июн',
                'Июл','Авг','Сен','Окт','Ноя','Дек'],
                dayNames: ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'],
                dayNamesShort: ['вск','пнд','втр','срд','чтв','птн','сбт'],
                dayNamesMin: ['вс','пн','вт','ср','чт','пт','сб'],
                weekHeader: '',
                dateFormat: 'dd.mm.yy',
                firstDay: 1,
                isRTL: false,
                showMonthAfterYear: false,
                yearSuffix: ''};
        $.datepicker.setDefaults($.datepicker.regional['ru']);

	jsProgressStep();
	api4tree = new API_4TREE("4tree_db");
	api4tree.jsMakeTheme();
	var mydb = api4tree.js_InitDB(); //инициализирую соединение с базой
	api4tree.jsLoadUserSettings() //загружаю установки пользователя
	jsProgressStep();
	api4panel = new API_4PANEL($(".mypanel"));
	jsProgressStep();
	api4editor = new API_4EDITOR($("#redactor"));
	jsProgressStep();
	api4others = new API_4OTHERS();
	jsProgressStep();
	api4calendar = new API_4CALENDAR();
	jsProgressStep();
	api4editor.initRedactor();
	jsProgressStep();
	api4tree.jsRegAllKeys();
	jsProgressStep();
	api4tree.js_LoadAllFromLocalDB().done(function(){ 
		api4tree.log("Таблица загружена!"); 
   	    api4tree.jsLoadTags().done( function() {api4tree.jsShowAllTags();} );
   	    
		
		jsProgressStep();
		jsDoAfterLoad(); //главная функция
		jsProgressStep();
		api4tree.jsSync();
		progress_load=200;
		jsProgressStep();
		api4tree.jsMakeMakedoneKeys(); //кнопки меню элемента (где дата и поделиться)
		api4tree.jsCurrentOpenPanelsAndTabsRestore(); //восстанавливаем все открытые пользователем панели и вкладки
		setTimeout(function() { 
			//jsFotoDoFirst(); //инициализируем фото-редактор
			//jsLoadWelcome();
			jsProgressStep(); $("#load_screen").hide();  
			check_hash_add_do();
			onResize();
//			$("li[myid=makedone_page_1]").click();
//			$("#open_params").click();
//			$("#tab_files").click();
			//$('.mypanel').dragscrollable({dragSelector: '.mypanel', acceptPropagatedEvent: true, preventDefault: false});
		},5); //отображаю страницу
	}); //загружаю таблицу из памяти
} //jsDoFirst

//запускается после загрузки всех данных из базы	 
function jsDoAfterLoad() {
	api4others.jsRerememberPomidor(); //вспоминает запущенные помидорки
	
	if(typeof(test)!="undefined") { jsTestIt2(); }; //запуск теста, если необходимо
	
	var oauth2 = localStorage.getItem( "oauth2" );

	if( oauth2 ) {
		main_user_id = JSON.parse(oauth2).user_id;
	}
	
	_connect(main_user_id);
		
	jsSetDiaryDate(0); //устанавливаю сегодняшнюю дату в дневнике в заголовке
	
	//preloader = $('#myloader').krutilka("show"); //глобально регистрирую крутилку
	preloader = $('#myloader').krutilka({color: "#777777", petalWidth: "3px", size:"19"}); //глобально 
	preloader.trigger("hide");
				
	$(window).bind('hashchange', jsSethash ); //при смене хеша, запускать функцию перехода на заметку
			
	api4tree.jsZoomTree(-2000); //размер шрифта в дереве забираю из localStorage
		
	$.ajaxSetup({cache:false}); // запрещаю пользоваться кэшем в ajax запросах
	
	main_x = parseFloat( localStorage.getItem('main_x') ); //ширина левой панели в процентах
	main_y = parseFloat( localStorage.getItem('main_y') );//высота верхней панели в пикселях
	main_y_top = parseFloat( localStorage.getItem('main_y_top') );//высота верхней панели в пикселях
	main_x_right = parseFloat( localStorage.getItem('main_x_right') );//высота верхней панели в пикселях
		
	if(!main_x) main_x = parseFloat(250);
	if(!main_y || main_y < 100) main_y = parseFloat(250);
	if(!main_y_top || main_y_top < 100) main_y_top = parseFloat(249);
	if(!main_x_right || main_x_right < 100) main_x_right = parseFloat(200);

	if(main_x<200) main_x = 250;
		
    current_tab = 1;
	
	jsShowTreePanel(); //показываю панель с деревом
		
	jsMakeLeftRightPanelResizable(); //включаю работу джойстика
		
	var date = new Date();
	var d = date.getDate();
	var m = date.getMonth();
	var y = date.getFullYear();
	currentTime=new Date;
	firstHour=currentTime.getHours() - 2;

    jsShowCalendar(); //показываю календарь с текущим временем - 2 часа
	
	api4tree.jsMakeTabs(1); //запускаю вкладки избранны TABS
	
	onResize();	//отлаживаю все размеры	
}

//показывает панель дерева	 
function jsShowTreePanel() {//запускается единожды

 	var isTree = false;
	isTree = $(".tree_active").parent("div").hasClass("panel_type1");
	var isMindmap = api4panel.isMindmap[ $(".tree_active").attr("id") ];

//	api4panel.jsShowTreeNode("tree_1",1,false);
//	api4panel.jsShowTreeNode("tree_2",1,false);

	api4panel.jsShowFocus("tree_1", 1, "need_select_first");    	    	
	api4panel.jsShowFocus("tree_2", 1, "need_select_first");    	    	

		
	if( window.location.hash.indexOf("edit") !=-1 ) {
      	$(".bottom_right").addClass("fullscreen");
      	fullscreen_mode = true;

    	if( window.location.hash.indexOf("edit_current_week") !=-1 ) {
    		my_week_num = (new Date()).getWeek();
    		window.title="4tree: "+my_week_num+" неделя";
    	    api4tree.jsGetDateRangeOfWeek( my_week_num );
    	    api4tree.jsSync().done(function(){
	    	    setTimeout(function(){ 
	    	    	var my_week_num = api4tree.jsDiaryPath(jsNow(),1,1);
	    	    	api4editor.jsRedactorOpenRecursive(my_week_num); 
	    	    },2000);
    	    });
    	    return true;
    	}

    	if( window.location.hash.indexOf("edit_all") ==-1 ) {
    	  	var id = window.location.hash.replace("#edit/",""); ///перехожу на заметку указанную в hash
   		} else {
    		var id = window.location.hash.replace("#edit_all/",""); ///перехожу на заметку указанную в hash + все внутренние
    		jsOpenRedactorRecursive(id); //если полноэкранный режим и несколько заметок
    		return true;
    	}
    } else {

/*		var myhash = window.location.hash;
    	if(myhash && myhash.indexOf("_")!=-1) {
    		var id = myhash.replace("#","");	
    	} else {
      		var id = parseInt(myhash.replace("#",""),36);///перехожу на заметку указанную в hash
      	}*/
      	var id = jsSethash();
      	fullscreen_mode = false;
      	if(!id) id = api4tree.jsCreate_or_open(["_НОВОЕ"]).toString();
    }
				
	if(true) {
	  	if(!(!id)) {
		  			api4panel.jsSelectNode( id ); //перехожу на заметку в hash
  		}
	}


} //jsShowTreePanel

//добавляет закладку под редактор
function jsAddFavRed(mytitle,id) {
  var myel = api4tree.jsFind(id);
  if(!myel) return true;
  mytitle = strip_tags( myel.title );
  var elel = $("#fav_red li[myid='"+id+"']");
  if(elel.length>0) {
	$("#fav_red ul li:first").before(  elel );
  	return true;
  	}

  var shorttitle = api4tree.jsShortText( mytitle , 15 );

  $("<li fix=0 myid='"+id+"' title='"+mytitle+"'>"+shorttitle+"</li>").insertBefore("#fav_red ul li:first");
  api4tree.jsCalcTabs();
}




function jsRefreshTreeFast(element,arrow,date1)
{
var isTree = api4panel.isTree[ $(".tree_active").attr("id") ];
var isMindmap = api4panel.isMindmap[ $(".tree_active").attr("id") ];

//var element = jsFind(myid);
if(element)
	{
		var id = api4tree.node_to_id( $(".tree_active li.selected").attr("id") );
//		console.info("I GOING TO ADD:",id,element.parent_id,element,arrow);
		if(arrow == "right" || date1) //если я добавляю к родителю
			{
				if(isTree) {
					var where_to_add = $(".tree_active ul[myid="+element.parent_id+"]").show();
					$(".tree_active #node_"+element.parent_id).addClass("tree-open");
				} else {
					var where_to_add = $(".tree_active #panel_"+element.parent_id).find("ul");
				}
//				var iii = $("#panel_"+element.parent_id+" li").length;
				var iii = element.position;
				where_to_add.find(".divider_li:last").remove();
//				var divider = "<div class='divider_li' pos='"+(iii+0.2)+"' myid='"+element.parent_id+"'></div>";
				var myrender = api4panel.jsRenderOneElement(element,iii);
				where_to_add.append( myrender );
				$(".tree_active #panel_"+element.parent_id).find(".add_do_panel_top").appendTo($(".tree_active #panel_"+element.parent_id+" ul"));
			}
		else
			{
				var iii = element.position;
				console.info("Render Position:",iii);
//				var divider = "<div class='divider_li' pos='"+(iii+0.2)+"' myid='"+element.parent_id+"'></div>";
				$( api4panel.jsRenderOneElement(element,iii) ).insertAfter( $(".tree_active li.selected") );
			}

	  if(false && (element.parent_id!=1) && (isMindmap)) {
	      if(isMindmap) {
			  myjsPlumb.connect({source:"node_"+element.parent_id+" .big_n_title:first", 
			  					 target: "node_"+element.id+" .big_n_title:first", scope:"someScope"});
			  myjsPlumb.setSuspendDrawing(false,true);
		  }
      }
    api4panel.jsDrawMindmap();
	}
	

}

function jsConnectLines() {
/*	  myjsPlumb.connect({source:"node_"+element.parent_id+" .big_n_title:first", 
	  					 target: "node_"+element.id+" .big_n_title:first", scope:"someScope"}); */
	  myjsPlumb.detachEveryConnection();
	  
	  $("#tree_2 ul:visible").each(function(i,el){
		  $(this).find("li").each(function(j,li) {
			 console.info("li_to", $(this)) ;
		  });
	  });
	
}


var last_refresh;
var need_to_re_refresh;
//обновление дерева
function jsRefreshTree( tree_id ) {
	console.info("RefreshTree");
		

	var myselected,myold_selected,old_scroll;
	last_refresh = jsNow();

	//если открыто редактирование дерева, то запрет на обновление и повтор через 5 секунд
	if ( $(".mypanel .n_title[contenteditable=true]").length > 0 ) {
		clearTimeout(myrefreshtimer);
		console.info("Пользователь редактирует, попробую обновить дерево через 3 секунды");
		myrefreshtimer = setTimeout(function(){ jsRefreshTree(); },3000);
		return false;
	}
	
	if(!tree_id || tree_id == "tree_1") {
		jsSnapShotApply("tree_1", jsSnapShotMake("tree_1") ); //обновляем правое дерево
	}

	
	if(!tree_id || tree_id =="tree_2") {
	
	    if( $("#tree_2").parent("div").hasClass("mindmap") ) {
	
				myjsPlumb.setSuspendDrawing(true,true);
	    		var snapshot = jsSnapShotMake("tree_2");
			    myjsPlumb.reset();		
		    	setTimeout(function(){
					jsSnapShotApply("tree_2", snapshot ); //обновляем правое дерево
					api4panel.jsDrawMindmap();		    	
		    	},0);
	
	    } else {
				var scrollleft = $("#tree_2.mypanel").scrollLeft();
				
				$("#tree_2 .panel").quickEach( function() {
			    	var id = $(this).attr('id');
			    	if(id) {
				    	var panel_id = id.replace("panel_","");
				    	if( api4tree.jsFindByParent( panel_id ).length >0 ) {
				    		myselected = api4tree.node_to_id( $(this).find(".selected").attr('id') ); 
				    		myold_selected = api4tree.node_to_id( $(this).find(".old_selected").attr('id') ); 
				    		old_scroll = $(this).scrollTop();
				    		api4panel.jsShowTreeNode( "tree_2", panel_id ); 
				    		$(this).scrollTop(old_scroll);
				    		$("#tree_2 #node_"+myselected).addClass("selected").addClass("tree-open"); 
				    		$("#tree_2 #node_"+myold_selected).addClass("old_selected").addClass("tree-open"); 
			    		} else {
				    		$(this).remove();
			    		}
			    	}
			    });
	    }
	}
		
	$('#calendar').fullCalendar( 'refetchEvents' ); 
	$("#tree_2.mypanel").stop().scrollLeft(scrollleft);
	jsFixScroll(2);

}


