//v1.01
var myjsPlumb,isMindmap = false, isTree = false;
var note_saved=true,myr,t1,t2,my_all_data,my_all_comments,my_all_share,
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
	"<div class='node_img note-clean'></div><input title='alt + (вниз, вправо) - добавляет дело' placeholder='Добавить...'>"+
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
		     mypanel =$("#mypanel"); //номер лога
		     
		 pwidth = $.cookie('pwidth');
		 if(!pwidth) pwidth = 300;

		 this.jsCloseAllMenu = function(){
				  $(".all_screen_click").remove();
				  $(".favorit_menu ul,.tree_history ul").slideUp(200);
				  $("#myslidemenu").trigger("all_screen_click");
				  $(".send_mail_form").slideUp(300);
//				  $(".search_panel_result,.search_arrow").slideUp(200);
				  $("#minicalendar").remove();
				  $(".makedone,.makedone_arrow,.makedone_arrow2").slideUp(100);
				  $.Menu.closeAll();
		 }
		 
		 //клик по Названию дела. ntitle = $(".ntitle"). Нужно для определения двойного клика.
		 this.jsTitleClick = function(ntitle,from_n_title) {
		 	if (ntitle.attr("contenteditable")==true) return true;
		 	
		 	var nowtime = new Date();
		 	if(((nowtime-lastclick)<800) && (lastclickelement == ntitle.attr("myid"))) needtoedit = true;
		 	else 
		 		{
		 		var needtoedit = false;
		 		if(!from_n_title) ntitle.parents("li:first").click(); //противный клик
		 		var id = ntitle.attr("myid");
		 		this_db.jsOpenNode( id ); //открываю панель
		 		this_db.jsSelectNode( id ,'tree');
		 		}
		 	
		 	lastclickelement = ntitle.attr("myid");
		 	
		 	//запоминаю время последнего клика, чтобы переходить в режим редактирования только при двойном клике
		 	lastclick = new Date(); 
		 
		 	if( needtoedit )
		 		{
		 	  	ntitle.attr("contenteditable","true").attr("spellcheck","false").focus(); 
		 	  	ntitle.attr("old_title",ntitle.html());
		 	  	setTimeout(function(){ document.execCommand('selectAll',false,null); },70);

		 	  	}
		 	else 
		 		{
		 	    //document.execCommand('unselect');
		 		return true;
		 		}
		 
		 }
		 
		 
		 //регистрация всех кнопок и обработки событий связанных с деревом
		 this.jsRegAllKeys = function() {
			 
			/////lilili title click   
			$("#mypanel").delegate(".n_title","click", function () {
				var edit_now = $(this).attr("contenteditable");
				if (edit_now) {
					return false; 
				}
				api4panel.jsTitleClick($(this),"from_panel");
				return false;
			});
			 
			 
		    //Клик в LI открывает детей этого объекта LILILI
    	    $('#mypanel').delegate("li","click", function () {

    	        if( $(this).find(".ntitle").attr("contenteditable") ) return true; //если редактируется
    	        var dif_between_click = jsNow() - lastclick;
    	        lastclick = jsNow();
    	        
    	        if(isTree) { //если это дерево
    	          if( (dif_between_click)<150 ) {
    	        	var id = api4tree.node_to_id( $(this).attr("id") );
    	        	$(".panel li").removeClass("selected");
    	        	api4panel.jsOpenNode( id ); //открываю панель
    	        	api4panel.jsSelectNode( id ,'tree');
    	        	return false;
    	        	}
    	        }
    	        
    	        	var id = api4tree.node_to_id( $(this).attr("id") );

    	        if( $(this).hasClass('tree-closed') ) { //если ветка свёрнута
    	        	api4panel.jsOpenNode( id ); //открываю панель
    	        	api4panel.jsSelectNode( id ,'tree');
    	    
    	        	if( isTree && ($(this).find(".folder_closed").length!=0) ) { //если дерево и нужно открыть ветку
    	        		$(this).find(".date1").hide();
    	        		var timelong = parseInt($(this).find(".countdiv").html(),10)*15; 
    	        		if(timelong>1000) timelong=500; //большие ветки дольше
    	        		if(timelong<300) timelong=100;   //маленькие ветки открываются быстрее
    	        		var cache_this = $(this);
    	        		$(this).find("ul:first").slideDown(timelong,function(){ 
    	        			$(this).find("#mypanel .date1[title!='']").show(); 
							if(isMindmap) myjsPlumb.setSuspendDrawing(false,true);
							cache_this.removeClass("tree-closed").addClass("tree-open");
							
							console.info("repaint: Ветка отсутствует, открываю");
							
//    	        			setTimeout(function(){  },10);
    	        			console.info("rep-fol_closed");
    	        		});
    	        	}
    	        } else { //если ветка уже открыта, закрываю её
    	        	if(isTree) {
						$(this).removeClass("tree-open").addClass("tree-closed");
    	        		$(this).find("ul:first").slideUp(50,function(){
	    	        		if(isMindmap) myjsPlumb.setSuspendDrawing(false,true);
							console.info("repaint: Ветка просто свёрнута, открываю");
    	        		});
    	        	} else {
    	        		$(this).removeClass("tree-open").addClass("tree-closed");
    	        		var id = api4tree.node_to_id( $(this).attr("id") );
    	        		api4panel.jsOpenNode( id ); //открываю панель
    	        		api4panel.jsSelectNode( id ,'tree');
    	        		$(this).removeClass("tree-closed").addClass("tree-open");
    	        	}
    	        }
    	    
				jsHighlightText("remove");
    	        return false;
    	    }); //lili

			$("#mypanel").delegate(".n_title","blur", function () {
				if($(this).attr("contenteditable")) { //сохраняю заметку
					api4tree.jsSaveTitle( $(this), 1 ); 
				} 
				return true;
			});
			
			var timer_add_do;
			$("#mypanel").delegate(".n_title","keydown", function (e) {
				
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
		 
		 		 	
		 //открывает путь до указанного элемента
		 this.jsOpenPath = function( id, iamfrom ) {
		   if(id != parseInt(id)) return false;
		   if(!$("#mypanel #node_"+id).length) {
		 	var path1 = api4tree.jsFindPath( api4tree.jsFind(id) ).path;
		 	if(!path1) return true;
		 	if(path1.length<1) return false;
			
			var p_len = path1.length;
   			for(var ik=0; ik<p_len; ik=ik+1) {
   			   var toopen = path1[ik].path.id;
   			   if(ik==path1.length-1) {
   			   	  api4panel.jsOpenNode(toopen);
   			   } else {
   			   	  api4panel.jsOpenNode(toopen,'nohash');
   			   }
   			   var findli = $('#top_panel #node_'+toopen);
   			   findli.removeClass("tree-closed").addClass("tree-open");
   			   findli.find('ul:first').show();
   			}
		 
			if(isMindmap) myjsPlumb.setSuspendDrawing(false,true);
		   }//if length
		 	api4panel.jsOpenNode(id, false,iamfrom);
		 	if(iamfrom!="divider_click") api4panel.jsSelectNode( id , false,iamfrom);
		   
		 	findli = $('#top_panel #node_'+id);
		 	findli.removeClass("tree-closed").addClass("tree-open");
		 	findli.find('ul:first').show();
		 
		 	jsFixScroll(2); //делаю так, чтобы видно было все selected и old_selected
//		 	if(isMindmap) myjsPlumb.setSuspendDrawing(false,true);
			console.info("repaint: Ветка просто свёрнута, открываю");
			if(isMindmap || isTree) {
				var offset_top = $("#mypanel").height()/2 - $("#node_"+id+" .big_n_title").height()-50;
				var offset_left = $("#mypanel").width()/2 + $("#node_"+id+" .big_n_title").width()-150;
				$("#mypanel").scrollTo($("#node_"+id),1500,{offset:{ top: -offset_top, left: -offset_left}});
			} else {
//				$("#mypanel").scrollLeft(9999999);
				$("#mypanel").stop().animate({"scrollLeft":99999999},500);		 		
			}
			
		 }
		 			 			 
		 //заполняет массив разными данными элемента
		 function jsInfoFolder(data,parent_node) { 
		 	var add_text, search_sample, hide_it, need_sync, crossline, remind, add_class,img;
		 	if(!data) return true;
		 	if(parent_node==-1) //если это панель поиска
		 	  {
		 	  var ans = data.path;
		 	  var add_text = '<br><span class="search_path">'+ans+'</span>';
		 	  var search_panel_width = $(".bottom_left").width();
		 	  
		 	  var length = search_panel_width?(search_panel_width/4.5):100;
		 	  var findtext = $('#search_filter').val();
		 	  var founded_text = jsFindText(data.text,findtext,length);
		 	  
		 	  if(data.comment) 
		 	  	{
 	    			var findcomment = data.comment;
 	    			var fiocomment = api4tree.jsFrendById(data.comment.user_id).fio;
 	    			text_comment = '<div class="comment_founded"><i class="icon-comment"></i>'+
 	    							fiocomment+": "+strip_tags(data.comment.text)+'</div>';
		 	  	}
		 	  else var text_comment = "";
		 	  
		 	  search_sample = '<div class="search_sample">'+founded_text+'</div>'+text_comment;
		 	  } //parent_node = -1
		 	else { add_text = ''; search_sample = ''; }

		 //////
		 	if( ((data.lsync - data.time) > 0) || (data["new"]=="position,"))
		 	    hideit = " hideit";
		 	else
		 	    hideit = "";
		 
		 	needsync = "<div class='syncit'><i class='icon-arrows-cw sync_it_i"+hideit+"'></i></div>";
		 //////
		 	if(data.did!="") crossline = " do_did";
		 	else crossline = "";
		 //////
		 	if(data.remind==0) remind = "";
		 	else remind = "<i class='icon-bell-1' style='float:right;'></i>";
		 /////
		 	var make_icon = api4tree.jsMakeIconText(data.text);
		 	if(data.tmp_text_is_long==1) { 
		 		add_class="note-6"; 
		 	} else {
			 	add_class = make_icon.myclass;
		 	}
		 /////
		 	if(!data.icon) 
		 	  img = "<div class='node_img "+add_class+"'></div>";
		 	else 
		 	  {
		 	  var icon = data.icon.replace("mini/","");
	    	  var icon = icon?icon.replace(/http:\/\/upload.4tree.ru\//gi,"https://s3-eu-west-1.amazonaws.com/upload.4tree.ru/"):"";
		 	  var img = "<div class='node_img node_box' style='background-image:url("+icon+")'></div>";
		 	  }
		 /////
		 	var datacount = data.tmp_childrens?data.tmp_childrens:0;
		 	
		 	if(datacount>0) 
		 	  { 
		 	  var countdiv = "";
		 	  var isFolder="folder"; 
		 	  var add_class = make_icon.myclass;
		 	  var textlength = make_icon.mylength; 
		 
		 	  if(textlength>0) { var isFull = " full";
		 	  } else { var isFull = ""; }
		 	  
		 	  if(isMindmap || isTree) var display = "opacity:1;"; 
		 	  else var display = "opacity:1;";
		 	  
		 	  var img = "<div class='folder_closed"+isFull+"'>"+"<div class='countdiv'>"+datacount+"</div>"+"</div>";
		 	  var triangle = "<div class='icon-play-div' style='"+display+"'><i class='icon-play'></i></div>";
		 	  }
		 	else 
		 	  { 
		 	  var countdiv = ''; 
		 	  var isFolder = "";
		 	  if(data.parent_id==1) { var display = "opacity:0;";
		 	  } else { var display = "opacity:0;"; }
		 	  
		 	  var triangle = "<div class='icon-play-div' style='"+display+"'><i class='icon-play'></i></div>";
		 	  }
		 /////////////////////////////////////////////////
		 	var icon_share = "";
		 
		 	if( data.user_id != main_user_id ) {
		 	  	var this_frend = api4tree.jsFrendById(data.user_id);
		 	  	if(this_frend) {
		 	  		icon_share = "<div title='"+this_frend["fio"]+" ("+this_frend["email"]+
		 	  					  ")\nделится с вами СВОЕЙ веткой' class='share_img'><img src='"+
		 	  					  this_frend["foto"]+"'></div>";
		 	  	}
	 	  	}
		 	  
		 	var comment_count = data.tmp_comments?data.tmp_comments:"";
		 		    
		 return {comment_count:comment_count?comment_count:"",
		 	     countdiv:countdiv, //кол-во элементов внутри папки
		 	     isFolder:isFolder, 
		 	     img: img, 
		 	     triangle:triangle, 
		 	     icon_share:icon_share, 
		 	     add_text:add_text, 
		 	     search_sample:search_sample, 
		 	     mytitle:data.title, 
		 	     remind:remind, 
		 	     crossline:crossline, 
		 	     needsync:needsync};

		 } //jsInfoFolder
		 
		 //возвращает один элемент для отображения в дереве
		 this.jsRenderOneElement = function(data, ii, parent_node) {
		 	var info = jsInfoFolder(data,parent_node);
		 	
		 	var position = (typeof ii!=undefined)?ii:(parseFloat(data.position)); // - 0.9
		 	
		 	myli = "<div class='divider_li' pos='"+position+"' myid='"+data.parent_id+"'>"+"</div>"; //разделитель
		 	myli +=  "<li id='node_"+data.id+"' time='"+data.time+"' myid='"+data.id+"' class='tree-closed "+info.isFolder+"'>";
		 	myli += "<div class='big_n_title'>";
		 	myli += "<div class='tcheckbox fav_color_"+data.fav+"' title='"+data.id+":"+position+"'>"+info.comment_count+"</div>" + info.icon_share;
		 	myli += "<div class='date1' myid='"+(data.tmp_next_id?data.tmp_next_id:"")+"' childdate='"+(data.tmp_nextdate?data.tmp_nextdate:"")+"' title='"+data.date1+""+(data.tmp_next_title?data.tmp_next_title:"")+"'></div>";
		 	myli += info.remind + info.triangle + info.countdiv + info.img + info.needsync;
		 	myli += "<div class='n_title"+info.crossline+"' myid='"+data.id+"'>";
		 	myli += info.mytitle; 
		 	myli += "</div>"+info.add_text + info.search_sample;
		 	myli += "<div class='note_part'></div>";
		 	myli += "</div>"; //big_n_title
		 	myli += "</li>";

		 	return myli;
		 } //jsRenderOneElement

		 //обновляет элемент на экране
		 this.jsRefreshOneElement = function(myid) {
		    var el = $("#mypanel #node_"+myid);
		    var make_class="";
		    if (el.hasClass("selected")) make_class = "selected";
		    if (el.hasClass("old_selected")) make_class = "old_selected";
		    el.prev(".divider_li").remove();
		    var myul = el.find("ul:first").clone(); //сохраняю вложенный список
		    el.replaceWith( api4panel.jsRenderOneElement( api4tree.jsFind(myid) ) );
		    $(myul).appendTo("#node_"+myid); //вставляю вложенный список обратно
		    if(make_class!="") {
		 	    $("#node_"+myid).addClass(make_class);
    		}
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
		 this.jsPrepareDate = function() {
		   $(".date1").quickEach( function(){  
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
		 	$("#mypanel .panel").quickEach(function() {
			 		if( $(this).next(".presize").length==0 ) {
			 			$("<div class='presize'></div>").insertAfter($(this)); 
			 		} else {
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
		 
		 //нумерация позиций для сортировки
		 function jsReorder(mydata) {
		 
			return mydata;
			var j=1;
			$.each( mydata, function(i,dd) {
				if(dd.id.toString().indexOf("_")==-1) {
					if((dd.position != j) && (dd.did=="")) { //если позиция не корректная
						api4tree.jsFind(dd.id,{position : j});
					}
					if(dd.did=="") j++;
				}
			});
			return mydata;
		 }
		 
		 //функция отображения панели для дерева		 
		 this.jsShowTreeNode = function(parent_node,isTree1,other_data, where_to_add) {
		 	


		 	if(other_data) { //если данные внешние
		 		$(".search_panel_result ul").html('');
		 	}
		 
		 	if(parent_node==-1) { 
		 		var mydata = other_data;
		 		mydata = mydata.sort(sort_by_path); //сортирую
		 	} else { 
		 		var mydata = api4tree.jsFindByParent(parent_node,null,true); 
		 		var my_diary_id = api4tree.jsCreate_or_open(["_ДНЕВНИК"]);

		 		if( ($("#node_"+my_diary_id).hasClass("old_selected")) && (parent_node!=1) ) {
			 		mydata = mydata.sort(sort_by_title); //сортирую
		 		} else {
			 		mydata = mydata.sort(sort_by_position); //сортирую
		 		}

		 		if((parent_node.toString().indexOf("_")==-1)) { //если это не синтетическая папка
		 			mydata = jsReorder(mydata); //перенумирую элементы
		 		}
		 	}
		 	
		 	if(mydata.length==0) 
		 		{
		 		$(".panel[myid='"+parent_node+"']").remove();
		 		return true;
		 		}
		 	var h3_search_already_added = false;
		 	if(!myjsPlumb.isSuspendDrawing() && isMindmap) myjsPlumb.setSuspendDrawing(true, true);
		 	console.info("set_suspend");
		 	
		 	$.each(mydata, function(i,data) {
		 		  if(!data)	return true;

		 		  if(parent_node!=-1) {//если мы находимся не в поиске
			 		  if(i==0) {
			 		  	if(isTree && parent_node!=1) {  // если это дерево
			 		  		if( $(".ul_childrens[myid="+parent_node+"]").length==0 ) {
			 		  			$("#top_panel #node_"+parent_node).
			 		  				append("<ul class='ul_childrens' myid="+parent_node+"></ul>");
			 		  		} else {
			 		  			return false;
			 		  		}
			 		  	} else {
			 		  		var parent_node_panel = $("#panel_"+parent_node);
			 		  		if (parent_node_panel.length != 1) //если панель ещё не открыта
			 		  			{
			 		  			var mypanel = $("#mypanel");
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
		 		  
		 		  if(!where_to_add) {
		 		 		  if(isTree) where_to_add = $("ul[myid="+parent_node+"]");
		 		  		else where_to_add = $("#panel_"+parent_node+" ul");
		 		  }
		 		  
		 		  if(parent_node==-1) { //функция отображения результатов поиска//
			 		  	where_to_add = $(".search_panel_result ul");
		 		  		if((data.path.indexOf("_ДНЕВНИК")!=-1) && (!h3_search_already_added)) {
							where_to_add.append("<h3>Дневник</h3>");
							h3_search_already_added = true;		 		  		    
		 		  		}

		 		  	}

		 		  where_to_add.append( api4panel.jsRenderOneElement(data,data.position,parent_node) );
		 		  
		 		  if(parent_node!=1 && parent_node!=-1) {
		 		  if(isMindmap) {
			 		  myjsPlumb.connect({source:"node_"+parent_node+" .big_n_title:first", 
			 		  					 target: "node_"+data.id+" .big_n_title:first", scope:"someScope"});
		 		  }
		 		  }
		 		  
		 	}); //each(mydata)
		 	if(!isTree && !isMindmap && parent_node != -1) if(where_to_add) where_to_add.append(top_of_panel);
//		 	if(parent_node!=1) myjsPlumb.repaint("node_"+parent_node);
//		 	console.info("suspend_repaint");
//		 	if(isMindmap) myjsPlumb.setSuspendDrawing(false,true);		 	
		 	
 	 	    api4panel.jsPrepareDate();
		 	  
		 	if(parent_node==-1) return true;
		 	  	
		 
		 	if(isTree) 
		 	  	{
		 	  	}
		 	else
		 	  	{
		 	  	var w=0; 
		 	  	$("#mypanel .panel").each(function(){w+=$(this).width()});
		 	  	
		 		thisWidth = w;
		 	if(!$(".makedone").is(":visible"))
		 		if(!isTree && !isMindmap) {
			 		if($('#mypanel').scrollLeft()!=thisWidth) mypanel.stop().animate({"scrollLeft":thisWidth},700);		 		
		 		}
		 		}
		 	
		 	if(!isTree) 
		 		{
		 		jsPresize();
		 		}
		 	
		 	jsMakeDrop();
		 	
		 } //jsShowTreeNode
		 
		 var set_title_timer,repaint_timer;
		 
		 //открыть заметку с номером, если она на экране (make .selected)
		 this.jsOpenNode = function(id,nohash,iamfrom) {
			      $(".makedone,.makedone_arrow,.makedone_arrow2").hide();
			      $.Menu.closeAll();

		 	var element = api4tree.jsFind(id);
	 		$("#mypanel .selected").addClass("old_selected").removeClass("selected");
	 		var myli = $("#top_panel #node_"+id+":last");
	 		if(element) $("#panel_"+element.parent_id+" li").removeClass("old_selected");

	 		myli.addClass("selected");

	 		if(!isTree) myli.removeClass('tree-closed').addClass('tree-open'); //???
	 		
	 		if(isTree) $(".old_selected").removeClass("old_selected");
	 		
//	 		myli.parents(".panel").find("li").removeClass("old_selected");
	 		
		 	$("#wiki_back_button").hide();
		 	clearTimeout(hash_timer);

		 	if(!nohash)	{ //если есть хэш
		 		var num_id;
		 		if(!parseInt(id,10)) num_id=id;
		 		else num_id = parseInt(id,10);
		 		
		 		hash_timer = setTimeout(function()
		 			{ 
		 			ignorehashchange = true; //делаю так, чтобы изменение хэша не привело к переходу на заметку
		 			setTimeout( function() { ignorehashchange=false; }, 200 );
		 			if(window.location.hash.indexOf("edit")==-1) if(num_id) window.location.hash = num_id.toString(36); 
		 			},1000);
		 	}
		 		
	 		var mypanel = myli.parents(".panel");
	 		
	 		mypanel.nextAll(".panel").remove();
	 		    	
	 		if(!isTree) {
	 			$(".panel li").removeClass("tree-open").addClass("tree-closed");
	 			$(".selected,.old_selected").removeClass("tree-closed").addClass("tree-open");
	 			} else {
		 			//$(".selected,.old_selected").removeClass("tree-closed").addClass("tree-open");
	 			}
	 		
	 		var title = $(".selected:last").find(".n_title").html(); //название для шапки сайта
	 		if (!title)	title = $(".old_selected:last").find(".n_title").html();
	 		
	 		var path = myli.attr('path');
	 		
	 		clearTimeout(set_title_timer);
	 		set_title_timer = setTimeout(function(){
	 			this_db.jsSetTitle(id);
	 		}, 100);
	 			
	 		var mytitle = myli.find(".n_title").html();
	 
	 		if(mytitle && !nohash) {
	     		document.title = "4tree.ru: "+api4others.jsShortText( strip_tags(mytitle), 150 );
	 		}
	 
	 		if( myli.find('.countdiv').length==1 ) {//если это папка, создаю панель
	     		this_db.jsShowTreeNode( id, isTree );
	     	} else {
	     		if( ($("#content1").hasClass("v1")) || ($("#content1").hasClass("v4")) ) {
	 		  		if(!pwidth) pwidth = 300;

 		  			if(pwidth>130) {
     		  			var pw = pwidth+"px";
     		  		} else {
     		  			var pw = "auto";
     		  		}

	 		  		if(!isMindmap && !isTree) {
	     				$("#mypanel").append("<div id='panel_"+element.id+"' class='panel' style='width:"+pw+"'><ul>"+top_of_panel+"</ul></div>"); 
	     			}
	 		  		jsPresize();
	     		}
	     	}
//	     if(isMindmap) myjsPlumb.setSuspendDrawing(false,true);
//		 console.info("rep-open_node_1");
	     
	     clearTimeout(repaint_timer);
	     if(isMindmap) repaint_timer = setTimeout(function(){myjsPlumb.setSuspendDrawing(false,true);},5);

		 } //jsOpenNode
		 
		 this.jsSetTitle = function(id) {
		 		return false;
		 		var element = api4tree.jsFind(id);
		 		if(!element) return false;
			 	var new_title = "";			 	
			 	var path = api4tree.jsFindPath( element );
			 	var ul_text = "";
			 	$.each(path.path, function(i,el) {
				 	new_title = api4others.jsShortText( el.path.title, 35 );
			 		ul_text += "<li myid='"+el.path.id+"'><a>"+new_title+"</a>";
			 		ul_text += "</li>";
			 	});
			 	
			 	$(".header_text").next("ul").html(ul_text);
			 	$("#myslidemenu ul,#myslidemenu li").removeAttr("style");
			 	jqueryslidemenu.buildmenu("myslidemenu", arrowimages);

		 }

		 //выбрать заметку и загрузить в редакторе
		 this.jsSelectNode = function(id,nohash,iamfrom) { //открыть заметку в календаре и в редакторе
		 //	i_am_from - кто вызвал: redactor, calendar, tree, diary
//		 	mypanel.find("#node_"+id).addClass("selected");
//			if(isMindmap) myjsPlumb.setSuspendDrawing(false,true);
		 	clearTimeout(open_redactor_timer);
		 	open_redactor_timer = setTimeout(function()
		 		{
		 	 	api4editor.jsRedactorOpen([id],iamfrom); 
		 	 	jsCalendarNode(id);
		 	 	jsAddFavRed("",id);
		 	 	$(".redactor_").blur();
		 	 	},50 );
		 
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
		   var mytitle = $("#mypanel .selected").find(".n_title").html();
		   if(mytitle) {
    		   document.title = "4tree.ru: "+api4others.jsShortText( strip_tags(mytitle) ,150 );
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
		
			var lnk = "do.php?get_files="+mytype;
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
							api4others.jsShortText(el.filename,30)+"</a>"+
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
		
		}


		//сокращает текст до определённой длины
		this.jsShortText = function(text, lng) {
		    if(!text) return "";
		    text = strip_tags(text);
			if( text.length>(lng+3) ) {
				var f_l = parseInt(lng*0.7,10);
				var f_r = lng-f_l;
			
				var first = text.substr(0,f_l);
				var last = text.substr(text.length-f_r,text.length);
				return first + '…' + last;
			} else {
				return text;
			}
		
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
	      	$("#pomidoro_icon").hide();
	
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
	           setTimeout(function(){ $("#pomidoro_icon").show(); },1200); //отображаю панель с помидорками
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

///////////////////////////////////////////////////////////////////////////////////
var DB_INTERFACE = function(global_table_name){  //singleton
	 if (typeof arguments.callee.instance=='undefined')
	 {
	  arguments.callee.instance = new function()
		  {
		    var db = new ydn.db.Storage('4tree_db');    
	    	console.info("tree_db started"); 
		    
		    this.calculate_md5 = function() //проверяю целостность данных
		    	{
		    	var d=$.Deferred();
		    	db.values('tree',null,9999999999999999999).done(function(records) {
		    	  var longtext=[];
			      for(var i=0; len = records.length, i<len; i=i+1 )
			      	{
			      	el = records[i];
			      	var alldata = (el.id?el.id:"") + (el.title?el.title:"") + (el.text?el.text:"") + 
			      				  (el.date1?el.date1:"") + (el.date2?el.date2:"") + 
			      				  (el.did?el.did:"");
//			      	alldata = el.id+":"+(el.title?el.title:"")+", ";
				if(el.id==6679) console.info("Сверка md5:"+alldata);
					var mymd5 = hex_md5( alldata ).substr(0,5);
					
			      	longtext.push({ id:el.id, md5:mymd5 });
			      	}
		    	  d.resolve(longtext);
		    	  });
		    	return d.promise();
		    	}
		    
		    this.clear_all_data = function() //очищаю всю базу данных
		    	{
		    	var d=$.Deferred();
		    	if( JSON.stringify(db.getSchema().stores).indexOf('"tree"') != -1 ) //если таблицы tree нет
			    	db.clear().done(function(){ d.resolve(); });
			    else
			    	d.resolve();
		    	return d.promise();
		    	}

		    this.clear_tree_data = function() //Очищаю таблицу в базе данных "tree"
		    	{
		    	var d=$.Deferred();
		    	
		    	if( JSON.stringify(db.getSchema().stores).indexOf('"tree"') != -1 ) //если таблицы tree нет
		    		{
		    		db.clear("tree").done(function(){ d.resolve(); });
		    		}
		    	return d.promise();
		    	}
		    	
		    this.FindByParent = function(parent_id)
		    	{
		    	var d=$.Deferred();
		    	db.executeSql("SELECT * FROM tree WHERE 1273 = 1273").done(function(records){ d.resolve(records) });
		    	return d.promise();
		    	}
		    	
		    this.setItem = function(param_name, param_value)
		    	{
		    	var d=$.Deferred();
		    	if( typeof param_value == 'undefined' ) //считать параметр
		    		{
			    	var iter = ydn.db.KeyRange.only(param_name);
			    	db.values("tree_settings",iter).done(function(records) {
				    	var x = records[0].value;
				    	d.resolve(x); 
				    	});
		    		}
		    	else
		    		{
			    	db.put('tree_settings', {value:param_value}, param_name).
			    						done(function(){ d.resolve(param_value); }); 
		    		}
		    	return d.promise();
		    	}
		    	
		    this.compare_md5_local_and_server = function()
		    	{
		    	return true;
		    	var d=$.Deferred();
		    	var sync_id = this_db.jsGetSyncId();
		    	//передаю время, чтобы заполнить время последней синхронизации
				var lnk = "do.php?get_all_data2="+jsNow()+"&sync_id="+sync_id+"&only_md5=1"; 
	
				$.getJSON(lnk,function(data){
			    	tree_db.calculate_md5().done(function(md5)
			    		{ 
			    			var test_ok = "выполнил успешно.";
				    		$.each(md5, function(i,el)
					    		{ 
					    		if( (el.id>0) && (el.md5!=data.md5[el.id]) )
					    			{
						    		console.info("!!!!!MD5!!!!!Данные на сервере не совпадают"+
						    					 " с локальными:",el.id,el.md5, data.md5[el.id],jsFind(el.id)); 
						    		
						    		trampampam = api4tree.jsFind(el.id,{lsync:0}); //восстанавливаю целостность, забирая элемент с сервера
						    		jsSync();
						    		test_ok = "ПРОВАЛИЛ!!!!!!!!! :( ИСПРАВЛЯЮ :).";
						    		}
					    		});
					    console.info("Сверку с сервером по md5 "+test_ok);
   				    	d.resolve(test_ok);
			    		});
			    	});
			    return d.promise();
		    	}
		    	
		    	
		    this.load_from_server = function()
		    	{
		    	var d=$.Deferred();
		    	var sync_id = this_db.jsGetSyncId();
		    	//передаю время, чтобы заполнить время последней синхронизации
				var lnk = "do.php?get_all_data2="+jsNow()+"&sync_id="+sync_id; 
				preloader.trigger('show');
	
				$.getJSON(lnk,function(data){
					if(!data.all_data) 
						{
						tree_db.clear_all_data();
						alert("Данные с сервера не доступны");
						}
					jsTitle('Данные загружены с сервера');
					if(data.time_dif) localStorage.setItem("time_dif",data.time_dif);
					localStorage.setItem("last_sync_time",jsNow());
					localStorage.setItem("sync_time_server",jsNow());
					localStorage.setItem("sync_id",sync_id);
					my_all_data = $.map(data.all_data, function (value, key) { return value; });
					my_all_comments = $.map(data.comments, function (value, key) { return value; });
					if(!my_all_data) my_all_data=[];
					if(!my_all_comments) my_all_comments=[];
					tree_db.save_data();
//					jsSaveDataComment();
					preloader.trigger('hide');
					console.info("my_all_data:",my_all_data);
					console.info("my_all_comments:",my_all_comments);
					});

		    	return d.promise();
		    	}

		    this.save_data = function(id) //сохраняю my_all_data в базу данных, 
		    	{ 
		    	var d=$.Deferred();
			    var my_length = my_all_data.length;
			    var elements = [], ids = [];
			    for(i=0;i<my_length;i=i+1)
			    	{
			    	var el=my_all_data[i];
			    	if(typeof id == 'undefined' || el.id==id) //если есть id, то сохраняю не всё
			    		{
				    	elements.push( el );
				    	ids.push( parseInt(el.id) );
				    	}
			    	}

			    if(typeof id == 'undefined')
				    {
				    tree_db.clear_tree_data().done( function()
				    	{ 
				    	db.put('tree', elements, ids).done(function(){ d.resolve(); }); 
				    	});
				    }
				else //если нужно сохранить один элемент
					{
				    	db.put('tree', elements, ids).done(function(){ d.resolve(); }); 
					}
			    
			    return d.promise();
		    	};
		    
		    //считаю кол-во элементов t=tree_db.count_lines().done(function(x){console.info("lines="+x)})
		    this.count_lines = function() 
		    	{
		    	var d=$.Deferred();
		    	db.count('tree').done(function(x) 
		    		{
		    		console.info(x);
				    d.resolve(x);
				    });
				return d.promise();
		    	};
		    
		    //загружаю все данные в my_all_data
		    this.load_data = function() 
		    	{
		    	var d=$.Deferred();
		    	db.values('tree',null,9999999999999999999).done(function(records) {
			      my_all_data = $.map(records, function (value, key) { return value; });
		    	  d.resolve(records);
		    	});
				return d.promise();
		    	};
		    
		  };
	 }
	 return arguments.callee.instance;
};

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
			
			var recur_dates = my_all_data.filter(function(el,i) 
				{ 
				if(!el) return false;
				if(el.date1) 
					if ((el.del!=1) && (el.date1!="")) 
						if(el.r)
							if(el.r!="") return true;
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
		
		jsPlumb.Defaults.Container = $("#mypanel");
		myjsPlumb = jsPlumb.getInstance({
			DragOptions: { cursor: 'pointer', zIndex: 2000 },
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

		jsPlumb.Defaults.Container = $("#mypanel");

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
                prevText: '&#x3c;Пред',
                nextText: 'След&#x3e;',
                currentText: 'Сегодня',
                monthNames: ['Январь','Февраль','Март','Апрель','Май','Июнь',
                'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
                monthNamesShort: ['Янв','Фев','Мар','Апр','Май','Июн',
                'Июл','Авг','Сен','Окт','Ноя','Дек'],
                dayNames: ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'],
                dayNamesShort: ['вск','пнд','втр','срд','чтв','птн','сбт'],
                dayNamesMin: ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'],
                weekHeader: 'Не',
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
	api4panel = new API_4PANEL($("#mypanel"));
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
		jsProgressStep();
		jsDoAfterLoad(); //главная функция
		jsProgressStep();
		api4tree.jsSync();
		progress_load=200;
		jsProgressStep();
		api4tree.jsMakeMakedoneKeys(); //кнопки меню элемента (где дата и поделиться)
		var view_type = localStorage.getItem("view_type");
		if(view_type) jsMakeView(view_type);
		setTimeout(function() { 
			jsFotoDoFirst(); //инициализируем фото-редактор
			//jsLoadWelcome();
			jsProgressStep(); $("#load_screen").hide();  
			check_hash_add_do();
//			$("#tab_files").click();
		},50); //отображаю страницу
	}); //загружаю таблицу из памяти
} //jsDoFirst

//запускается после загрузки всех данных из базы	 
function jsDoAfterLoad() {
	api4others.jsRerememberPomidor(); //вспоминает запущенные помидорки
	
	if(typeof(test)!="undefined") { jsTestIt2(); }; //запуск теста, если необходимо
	
	main_user_id = $.cookie("4tree_user_id");
	
	_connect(main_user_id);
	
	if( window.location.hash.indexOf("edit") !=-1 ) { //если открыли заметку в новом окне
	  	fullscreen_mode = true;
	} else {
	  	fullscreen_mode = false;
	}
	
	jsSetDiaryDate(0); //устанавливаю сегодняшнюю дату в дневнике в заголовке
	
	preloader = $('#myloader').krutilka("show"); //глобально регистрирую крутилку
				
	$(window).bind('hashchange', jsSethash ); //при смене хеша, запускать функцию перехода на заметку
			
	api4tree.jsZoomTree(-2000); //размер шрифта в дереве забираю из localStorage
		
	$.ajaxSetup({cache:false}); // запрещаю пользоваться кэшем в ajax запросах
	
	main_x = parseFloat( localStorage.getItem('main_x') ); //ширина левой панели в процентах
	main_y = parseFloat( localStorage.getItem('main_y') );//высота верхней панели в пикселях
		
	if(!main_x) main_x = parseFloat(50);
	if(!main_y) main_y = parseFloat(250);
		
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

	api4panel.jsShowTreeNode(1,false);
		
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

		var myhash = window.location.hash;
    	if(myhash && myhash.indexOf("_")!=-1) {
    		var id = myhash.replace("#","");	
    	} else {
      		var id = parseInt(myhash.replace("#",""),36);///перехожу на заметку указанную в hash
      	}
      	fullscreen_mode = false;
      	if(!id) id = api4tree.jsCreate_or_open(["_НОВОЕ"]).toString();
    }
				
	if(!isTree) {
	  	if(!(!id)) {
		  			api4panel.jsOpenPath( id ); //перехожу на заметку в hash
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

  var shorttitle = api4others.jsShortText( mytitle , 15 );

  $("<li fix=0 myid='"+id+"' title='"+mytitle+"'>"+shorttitle+"</li>").insertBefore("#fav_red ul li:first");
  api4tree.jsCalcTabs();
}

//выбирает блок текста вокруг найденного слова
function jsFindText(text,findtext,length) {

text = text.replace(/'/g, "&apos;").replace(/"/g, "&quot;").replace(/<\/p>/g, " ").
		    replace(/<\/div>/g, " ").replace(/<br>/g, " ").replace(/<\/li>/g, " ").replace(/<\/span>/g, " ");

text = strip_tags(text);

var length = parseInt(length,10);
var lower_text = text.toLowerCase()
var lower_findtext = findtext.toLowerCase()

var findstart = lower_text.indexOf(lower_findtext);

if(findstart==-1 && (lower_findtext.toLowerCase() != lower_findtext.toUpperCase()) ) {
	var findstart = diff_plugin.match_main( lower_text, lower_findtext, 0 );
	if(findstart!=-1){
		var lower_findtext = getWordAt(text, findstart);

		setTimeout(function(){ 
			$(".search_panel_result li").not(":has('.highlight')").highlight(lower_findtext,"highlight"); 
		}, 5000);
		
	} else {
		return text.substr(0,length);
	}
}


for(var i=findstart;i>0;i=i-1)
   {
   if( (text[i]=='.') || (text[i]=='!') || (text[i]=='?') || (text[i]==';') ) { i=i+1; break; }
   }

if( i<(findstart-10) ) i=findstart-10;
answer = text.substr(i,length+(findstart-i));

//answer = answer.replace(findtext.toLowerCase(),"<b>"+findtext.toLowerCase()+"</b>");

if(i>0) answer = '…'+answer;
if(length+findstart<text.length) answer = answer+'…';

return answer;

}



function jsRefreshTreeFast(element,arrow,date1)
{
//var element = jsFind(myid);
if(element)
	{
		var id = api4tree.node_to_id( $("li.selected").attr("id") );
//		console.info("I GOING TO ADD:",id,element.parent_id,element,arrow);
		if(arrow == "right" || date1) //если я добавляю к родителю
			{
				if(isTree) {
					var where_to_add = $("ul[myid="+element.parent_id+"]");
					$("#node_"+element.parent_id).removeClass("tree-closed").addClass("tree-open");
				} else {
					var where_to_add = $("#panel_"+element.parent_id).find("ul");
				}
//				var iii = $("#panel_"+element.parent_id+" li").length;
				var iii = element.position;
				where_to_add.find(".divider_li:last").remove();
//				var divider = "<div class='divider_li' pos='"+(iii+0.2)+"' myid='"+element.parent_id+"'></div>";
				var myrender = api4panel.jsRenderOneElement(element,iii);
				where_to_add.append( myrender );
			}
		else
			{
				var iii = element.position;
				console.info("Render Position:",iii);
//				var divider = "<div class='divider_li' pos='"+(iii+0.2)+"' myid='"+element.parent_id+"'></div>";
				$( api4panel.jsRenderOneElement(element,iii) ).insertAfter( $("li.selected") );
			}

	  if((element.parent_id!=1) && (isMindmap)) {
	      if(isMindmap) {
			  myjsPlumb.connect({source:"node_"+element.parent_id+" .big_n_title:first", 
			  					 target: "node_"+element.id+" .big_n_title:first", scope:"someScope"});
			  myjsPlumb.setSuspendDrawing(false,true);
		  }
      }

	}
	

}



var last_refresh;
var need_to_re_refresh;
//обновление дерева
function jsRefreshTree() {

var myselected,myold_selected,old_scroll;
last_refresh = jsNow();

//если открыто редактирование дерева, то запрет на обновление и повтор через 5 секунд
if ( ($("#mypanel .n_title[contenteditable=true]").length > 0) || ($("#mypanel #minicalendar").length > 0) ) 
	{
	clearTimeout(myrefreshtimer);
	console.info("Пользователь редактирует, попробую обновить дерево через 3 секунды");
	myrefreshtimer = setTimeout(function(){ jsRefreshTree(); },3000);
	return false;
	}

var scrollleft = $("#mypanel").scrollLeft();

if(isTree) {
	scrollleft=0;
	jsRefreshOneFolder(1);
} else {

		$(".panel").quickEach( function() 
			{ 
			if( $(this).attr('id') )
				{
				myselected = api4tree.node_to_id( $(this).find(".selected").attr('id') ); 
				myold_selected = api4tree.node_to_id( $(this).find(".old_selected").attr('id') ); 
				old_scroll = $(this).scrollTop();
				api4panel.jsShowTreeNode( $(this).attr("id").replace("panel_","") ); 
				$(this).scrollTop(old_scroll);
				$("#node_"+myselected).addClass("selected").removeClass("tree-closed").addClass("tree-open"); 
				$("#node_"+myold_selected).addClass("old_selected").removeClass("tree-closed").addClass("tree-open"); 
				
				}
			});
  }
$('#calendar').fullCalendar( 'refetchEvents' ); 
$("#mypanel").stop().scrollLeft(scrollleft);
jsFixScroll(2);

}


function _manageEvent(eventMessage) {
      var chat = $("#chat");
      if (eventMessage != '') {
//        var values = $.parseJSON(eventMessage);
       	var mysync_id = api4tree.jsGetSyncId();
        if(mysync_id!=eventMessage.sync_id) {
        	console.info("@mymessage:",eventMessage);
        } else {
	    	console.info("@mymessage:","Разослал сообщение о изменениях...")    
        }
        
        if( eventMessage.type == "need_refresh_now" ) { 
        		api4tree.jsSync(); 
        		setTimeout(function(){ alert("Пришло новое письмо!");},800); 
        }
        if( eventMessage.type == "need_refresh_id" ) //сообщение о изменившихся данных от do.php
        	{ 
        	there_was_message_about_change = true;
        	if(mysync_id!=eventMessage.sync_id) //не нужно обновлять, если сообщение пришло благодаря этому клиенту
        		{
	        		if( jsNow() - last_message_sync_time > 500 )
	        			{
	        			 setTimeout(function()
	        			 	{ 
		        			last_message_sync_time = jsNow();
	        			 	if($("#mypanel .n_title[contenteditable=true]").length == 0) api4tree.jsSync(); 
	        			 	},300); 
	        			 jsTitle("Ваши данные изменились на другом комьютере. Обновляю.",5000); 
	        			}
	        		console.info(eventMessage.sync_id,eventMessage.txt);
        		}
        	}
      }
    };

function _statuschanged(state) {
      if (state == PushStream.OPEN) {
        $(".icon-dot").show();
        $(".icon-dot").attr("title","Online соединение установленно ("+pushstream.wrapper.type+")");
      } else {
        $(".icon-dot").hide();
        $("#mode").html("");
      }
    };

function _connect(channel) {
      if(!channel) return true;
      pushstream.removeAllChannels();
      try {
        pushstream.addChannel(channel);
        pushstream.connect();
      } catch(e) {alert(e)};

      $("#chat").val('');
    }

PushStream.LOG_LEVEL = 'debug';
//PushStream.LOG_OUTPUT_ELEMENT_ID = "tree_news";

var pushstream = new PushStream({
      host: "4do.me", //window.location.hostname
      port: window.location.port,
      modes: "websocket|longpolling" //websocket|longpolling|eventsource|stream
    });

pushstream.onmessage = _manageEvent;
pushstream.onstatuschange = _statuschanged;



