var my_all_parents = {}, settings = {show_did:false}, is_mobile = false; //все параметры;
if(is_mobile) {
	var phonegap_user_id = "11";
	var web_site = "http://192.168.0.52/fpk/4tree/";
} else {
	var phonegap_user_id = "";
	var web_site = "";
}

/////////////////////////////////////TREE//////////////////////////////////////////
var API_4TREE = function(global_table_name,need_log){  //singleton
	 if ( (typeof arguments.callee.instance=='undefined') || true) //true - отключает singleton
	 {
	  arguments.callee.instance = new function()
		  {
		  var my_all_data3=[], my_all_data2 = {},my_all_comments=[], my_all_frends=[], my_all_share=[],my_tags = [],
		  	  recursive_array=[],
		  	  scrolltimer, myhtml_for_comments ="",
		  	  old_before_diary,
		  	  member_old_id = false, //для запоминания id выбранной заметки на время пользования дневником
		  	  sync_now = false, //true - если идёт синхронизация
		  	  sync_now_timer, maketimer, timer_add_do, search_timer, show_help_timer,last_sos_click,
		  	  allmynotes, allmydates, //заметки и даты для календариков
		      db, //объект соединения с базой
		      last_log_time=jsNow(), //время последнего вывода лога
		      log_i=1, //номер лога
		      tree_font=1,did_timeout,files_link_from_texts = [],
		      this_db = this, //эта функция
		      MAX_VALUE = 1000000000000000, //максимальное кол-во в базе
		      LENGTH_OF_LONG_TEXT = 200; //длина, после которой текст считается длинным и переносится в другую базу
		      

		  this.jsCallPrint = function(element)
			  {
			   var prtContent = $(element);
			   var prtCSS = '<link rel="stylesheet" href="/templates/css/template.css" type="text/css" />';
			   var WinPrint = window.open('','','left=50,top=50,width=800,height=640,toolbar=0,scrollbars=1,status=0');
			   WinPrint.document.write('<div id="print" class="contentpane">');
			   WinPrint.document.write(prtCSS);
			   WinPrint.document.write(prtContent.html());
			   WinPrint.document.write('</div>');
			   WinPrint.document.close();
			   WinPrint.focus();
			   WinPrint.print();
			   WinPrint.close();
			   prtContent.innerHTML=strOldOne;
			  }

		  this.jsRefreshParents = function() {
		  	  my_all_parents = {};
		  	  
			  $.each(my_all_data2, function(i,el){
				 var parent_id = el.parent_id;
				 if(parent_id) {
				 	 if(!my_all_parents["p"+parent_id]) my_all_parents["p"+parent_id] = [];
					 my_all_parents["p"+parent_id].push( el );
				 }
			  });
			  console.info(my_all_parents);
		  }

		  /* !Добавление нового дела */
		  this.jsAddDoLeftRight = function(arrow, myparent, mytitle, 
		  								   date1, date2, icon) {
		   var isTree = api4panel.isTree[ $(".tree_active").attr("id") ];

		   var panel,iii;
		   if(icon) {
			  var pre_icon = "<i class='"+icon+"'></i> "; 
		   } else {
			  var pre_icon = ""; 
		   }
		  
		   var sender = $(".tree_active .selected");
		   
		   if(!sender.length) {
		   		$( "#node_"+api4tree.jsCreate_or_open(["_НОВОЕ"]).toString() ).addClass("selected");
		   		var sender = $(".tree_active .selected");
		   }
		  		   
		   if(arrow == 'down') {
		     	if(isTree) {
		    	 	panel = sender.parents("ul:first").attr("myid");
		     	} else {
		    	 	panel = sender.parents(".panel").attr('id').replace("panel_","");
				 	$("#panel_"+panel).nextAll(".panel").remove();
		    	}
		   }
		   if(arrow == 'right') {
			   	panel = api4tree.node_to_id( sender.attr('id') );
			   	
			   		if(isTree) {
			      		if( $(".ul_childrens[myid="+panel+"]").length==0 ) {
			    			$(".tree_active #node_"+panel).append("<ul class='ul_childrens' myid="+
			    												panel+"></ul>");
						}
						sender.find(".node_img").addClass('folder_closed').removeClass("node_box").
			   				   html("<i class='icon-folder-1'><div class='countdiv'>1</div></i>").removeClass("node_img").
			   				   removeAttr("style");
			   		} else {
			   			sender.parents(".panel").nextAll(".panel").not("#panel_"+panel).remove();
						sender.find(".node_img").addClass('folder_closed').removeClass("node_box").
			   				   html("<i class='icon-folder-1'><div class='countdiv'>1</div></i>").removeClass("node_img").
			   				   removeAttr("style");
			   			iii = $("#panel_"+panel).length; 
			   			if(iii==0) $(".tree_active.mypanel").append("<div id='panel_"+panel+
			   											"' class='panel hexhex'><ul></ul></div>");
			   		}
		   	} //right
		  
		  
	     	if(isTree) {
        	 	parent = sender.parents("ul:first").attr("myid");
         	} else {
        	 	parent = sender.parents(".panel").attr('id').replace("panel_","");
        	}
		  
		    var count = sender.parents(".panel ul").children("li").length;
		    newposition = parseFloat($(".tree_active .selected").prev(".divider_li").attr("pos"))+0.01;
		    if(!newposition) newposition = count+0.9;
		    
		    if(arrow=="right") { 
		    	newposition = $(".tree_active #panel_"+panel).find("li:last").prev(".divider_li").attr("pos")+10;
		    	if(!newposition) newposition = 10;
		    	if(!isTree) sender.addClass("old_selected"); 
        	 	parent = panel;
		    } else {
			    var pos1 = parseFloat( $(".tree_active .selected").prev(".divider_li").attr("pos") );
			    var pos2 = parseFloat( $(".tree_active .selected").next(".divider_li").attr("pos") );
			    if(!pos2) pos2 = pos1 + 10;
			    var dif = (pos2 - pos1)/2;
			    if(dif==0) dif = 0.01;
			    newposition = pos1+dif;
			    
			    console.info("@@@@newposition = ", newposition, "pos1 = ",pos1,"pos2 = ",pos2, "dif=",dif);
			}
		    
		    var new_element = api4tree.jsAddDo(parent, pre_icon+"Новая заметка", 
		    								   null, null, newposition); 
		    								   
		    console.info("SAVED-POSITION:",new_element.position);
		    var new_id = new_element.id;
		    jsRefreshTreeFast(new_element,arrow,date1);	
		    api4tree.jsSetSettings(new_id);
//		    jsRefreshTree();
		    if(isTree) jsAddToTree(new_id);
		    $('#calendar').fullCalendar( 'refetchEvents' ); 	
	    	li = $(".tree_active.mypanel #node_"+new_id);
		  
	    	api4editor.jsRedactorOpen([new_id],"adddo");		
		  
		    $(".tree_active.mypanel li").removeClass("selected");
		    li.addClass("selected");
		    	
		setTimeout(function(){
	       	var ntitle = $(".tree_active .selected").find(".n_title");
	      	ntitle.attr("contenteditable","true").attr("spellcheck","false").focus(); 
	      	ntitle.attr("old_title",ntitle.html());
	      	if(ntitle.is(":focus")) { document.execCommand('selectAll',false,null); }
	      	jsMakeDrop();
	      	}, 1);
		  
		  return new_id;
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


/*		this.jsFindComment = function(id,fields)
		{
				var answer = my_all_comments.filter(function(el,i) 
					{ 
					if(el)
						if( el.id==id ) 
							return true; 
					} );
				if(!answer) return false;

		if(answer.length>0 && fields) //если нужно присваивать значения
			{
			if(answer[0]["new"]) changed_fields = answer[0]["new"]; //беру список изменённых полей
			else changed_fields = "";
			
			is_changed=false;
			$.each(fields, function(namefield,newvalue) 
				{ 		
				if(answer[0][namefield] != newvalue) 
					{
					if( (namefield!="new") )
						{ 
						if(changed_fields.indexOf(namefield+",")==-1) changed_fields = changed_fields + namefield + ","; 
						}
					else changed_fields = "UPS"; //сохраняю список полей, которые были изменены, если есть new, то обнуляю
					is_changed=true; //фиксирую, что произошли изменения
								
					answer[0][namefield] = newvalue; //присваиваю новое значение
					}

				} );

			answer[0]["new"] = changed_fields;
			if(is_changed) 
				{
				if( changed_fields.indexOf("time,")==-1 ) //если не меняли время вручную
					{
					if(answer[0]) answer[0].time = parseInt(jsNow(),10); //ставлю время изменения (для синхронизации)
				    var need_to_save_id=id;
				    }
				else
					{
					answer[0]["new"] = "";
					}
					
				    clearTimeout(mytimer[need_to_save_id]);
				    
				    mytimer[need_to_save_id] =
				    setTimeout(function() 
				    	{ 
				    	if( localStorage.getItem("c_length") ) jsSaveDataComment(need_to_save_id); 
				    	else jsSaveDataComment(1);
				    	},80); //сохряню этот элемент в localStorage через 80 миллисекунд

				}
			}

			
		return answer[0];
		}*/



		this.jsShowNews = function(type) //отображение всех комментариев
		{
		$("#tree_news_content").html("");
		if(type==0)
			{
			var source = $("#comment_template").html();
			template = Handlebars.compile(source);
			
			   var data = my_all_comments.filter(function(el,i) //поиск всех дел написанных БОЛЬШИМИ буквами и не начинающиеся с цифры
				    { 
				    return el.del==0 && api4tree.jsFind(el.tree_id);
				    } );

				function compare(a,b) {
				  if (parseFloat(a.add_time) < parseFloat(b.add_time))
				     return 1;
				  if (parseFloat(a.add_time) > parseFloat(b.add_time))
				    return -1;
				  return 0;
				}

				chat = data.sort(compare); //сортирую табы по полю tab

			var dfdArray = [];
			var chat_limited = [];
			$.each(chat, function(i,d) {

				if(i<50) dfdArray.push( api4tree.jsFindComment(d.id).done( function(el){
					d.text = el.text;
					chat_limited.push(d);
				})
				);

			});



			$.when.apply( null, dfdArray ).then( function(x){ 
						var i;
						var txt="";
						var myhtml = "";
						$.each(chat_limited, function(i,d)
							{
							var frend = api4tree.jsFrendById(d.user_id);
							d.foto = frend.foto;
							d.name = frend.fio;
							if(api4tree.jsFind(d.tree_id)) {
								d.tree_title = "<b>["+api4tree.jsShortText( api4tree.jsFind(d.tree_id).title, 50 )+"]</b>";
							}

							if(d.add_time=="0") {
								d.add_time_txt = "";	
							} else {
								var add_time = new Date( parseInt(d.add_time,10) );
								d.add_time_txt = add_time.jsDateTitleFull("need_short_format");
							}
							
							myhtml += template(d);
							if(i>100) return true;
							});

								$("#tree_news_content").append(myhtml);
		    	});			
			
			}
		}


		  //проверяет текст на wiki ссылки и помечает их цветом
		  this.jsMakeWiki = function(myr) { //находит всё что в квадратных скобках и заменяет на тег <wiki>
			  var txt = myr.redactor("get");
			  var wiki_words = txt.match(/\[\[(.*?)\]\]/ig);
			  if(!wiki_words) 
			  	{
			  	return true; //если нет символов WIKI
			  	}
			  else
			  	{
			  	txt = myr.redactor("get");
			  	wiki_words = txt.match(/\[\[(.*?)\]\]/ig);
			  	}
			  
			  if(!wiki_words) 
			  	{
			  	return true; //если нет символов WIKI
			  	}
			  
			  var newtxt = txt;
			  var need_refresh = false;
			  $.each(wiki_words, function(i,myword){
			  	if(strip_tags(myword).length>4) 
			  		{
			  			var mynewword = myword.replace("[[","").replace("]]","");
			  			console.info(i,myword, mynewword);
			  			newtxt = newtxt.replace(myword,"[&nbsp;<span class='wiki' title='Кликните, чтобы создать определение Wiki'>"+mynewword+"</span> ]");
			  			need_refresh = true;
			  		}
			  	else
			  		{
			  		}
			  	});
			  if(need_refresh) 
			  	{
			  	myr.redactor("set", newtxt);
			  	note_saved = false;
			  	api4tree.jsRestoreCursor();
			    api4editor.jsSaveAllText(1);
			    api4tree.jsParseWikiLinks(myr.attr("myid"));
			  	}
		  } //jsMakeWiki
		  
		  //обрабатывает wiki ссылки (ищет статьи)
		  this.jsParseWikiLinks = function(parent_id) {
	  			var wiki = $(".redactor_").find(".wiki");
      			if(wiki.length) {
      			    var wiki_founded;
      			    wiki.each(function(i,el) {
      			     	mytitle = strip_tags( $(el).html() );

      			     	if(!parent_id) {
      			     		var divider = $(el).prevAll(".divider_red:first");
      			     		if(!divider) {
      			     			parent_id = divider.attr("myid");
      			     		} else {
      			     			parent_id = $("#redactor").attr("myid");
      			     		}
      			     	}

      			     	wiki_founded = jsFindWikiForParent(parent_id, mytitle);
      			     	if(wiki_founded) {
      			     		var mini_text = wiki_founded.text.replace(/<div>/g," ").replace(/<p>/g," ").replace(/&nbsp;/g," ").replace(/&#x200b;/ig,"").trim();
      			     		mini_text = api4tree.jsShortText( strip_tags(mini_text),500);
      			     		
      			     		$(el).addClass("wiki_founded").attr("title", mini_text );
      			     	} else {
      			     		$(el).removeClass("wiki_founded");
      			     	}
      			     }); //wiki.each
      			}
		  	}
		  	

		  //поиск wiki статей	
		  function jsFindWikiForParent(parent_id, mytitle) {
		  		var mytitle = mytitle.replace("&nbsp;", " ").trim();
		  		var mytitle = strip_tags(mytitle.trim());
		  	
		  		var childrens = api4tree.jsFindByParent(parent_id);
		  		var myfilter="[["+mytitle+"]]".toLowerCase();
		  		

		  		var mynewdata = childrens.filter(function(el) { //ищу в первую очередь среди детей		  				
		  				if(el.did!="") return false;
		  				if(el.del==1) return false;
		  				if(el.title) return el.title.indexOf(myfilter)!=-1;
		  		});
		  					
		  		if(!mynewdata.length) { //теперь ищу по всему дереву, где я создатель заметки		  			
		  			
		  			var mynewdata = [];
		  			$.each(my_all_data2, function(i,el) {
		  				if ( !(el.did!="") && !(el.del==1) && (el.title) && (el.user_id==main_user_id) && 
		  					  (el.title.toLowerCase().indexOf(myfilter)!=-1) ) mynewdata.push(el);
		  			});
		  			
		  		}
		  	
		  		if(!mynewdata.length) { //теперь ищу по всему дереву, где не только я создатель заметки
		  			var mynewdata = [];
		  			$.each(my_all_data2, function(i,el) {
		  				if ( !(el.did!="") && !(el.del==1) && el.title && (el.user_id!=main_user_id) && 
		  					   el.title.toLowerCase().indexOf(myfilter)!=-1 ) mynewdata.push(el);
		  			});
		  		}
		  			
		  		if(mynewdata.length) {
		  			return mynewdata[0];
		  		}		
		  }
		  	
		  //открытие wiki ссылки
		  this.jsOpenWikiPage = function(parent_id, mytitle, myr) {
		  		api4tree.log("Кликнули в "+parent_id+" wiki ссылку");
   			 	var back_title = $(".tree_active .selected .n_title").html();
		  		var mynewdata = jsFindWikiForParent(parent_id, mytitle);
		  		
		  		if(!mynewdata) 
		  			{
		  			var element = api4tree.jsAddDo(parent_id,"[["+mytitle+"]]");
		  			if(element) api4panel.jsOpenPath(element.id);
		  			}
		  		else
		  			{
		  			api4panel.jsOpenPath(mynewdata.id);
		  			jsFixScroll(2);
		  			}

		  		setTimeout(function(){
	   			 	$("#wiki_back_button").html('<i class="icon-left-bold"></i>вернуться к '+back_title);			  		
	   			 	$("#wiki_back_button").show().attr("myid",parent_id);
		  		}, 500);
		  			
		  		setTimeout(function(){ $(".redactor_").focus(); },200);
		  }



		 this_db.jsInfoFolder = function(data,parent_node) { 
		 	var add_text, search_sample, hide_it, need_sync, crossline, remind, add_class,img;
		 	if(!data) return true;
		 	if(parent_node==-1) //если это панель поиска
		 	  {
		 	  var ans = data.path;
		 	  var add_text = '<br><span class="search_path">'+ans+'</span>';
		 	  var search_panel_width = $("#tree_editor").width();
		 	  
		 	  var length = search_panel_width?(search_panel_width/3):100;
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
		 
		 	needsync = "<div class='syncit'><i class='icon-dot sync_it_i"+hideit+"'></i></div>";
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
	    	  icon = icon.replace(/http:\/\//ig,"images/");
	    	  icon = icon?icon.replace(/http:\/\/upload.4tree.ru\//gi,"https://s3-eu-west-1.amazonaws.com/upload.4tree.ru/"):"";
		 	  var img = "<div class='node_img node_box' style='background-image:url("+icon+")'></div>";
		 	  }
		 /////
		 	var datacount = api4tree.jsFindByParent(data.id).length; //data.tmp_childrens?data.tmp_childrens:0; //TEST
		 	
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
		 	  img = "<div class='folder_closed"+isFull+"'>"+ "<i class='icon-folder-1 fav_color_"+data.fav+"'>"+"<div class='countdiv'>"+datacount+"</div>"+"</i></div>";
		 	  var triangle = "<div class='icon-play-div' style='"+display+"'><i class='icon-right-dir'></i></div>";
		 	  }
		 	else 
		 	  { 
		 	  var countdiv = ''; 
		 	  var isFolder = "";
		 	  if(data.parent_id==1) { var display = "opacity:0;";
		 	  } else { var display = "opacity:0;"; }
		 	  
		 	  var triangle = "<div class='icon-play-div' style='"+display+"'><i class='icon-right-dir'></i></div>";
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


		 //выбирает кол-во полосок в иконке при кол-ве текста
		 this.jsMakeIconText = function(text) { 
		  	var mylength = strip_tags(text).replace(/\t/ig,"").replace(/&#x200b;/ig,"").length;
		  	var i_size = parseInt( mylength/50,10 );
		  	if(i_size>6) i_size=6;
		  	if(mylength<100) i_size = "1";	
		  	if(mylength==0) { i_size = "clean"; }
		  	
		  	var mylength1 = parseInt(mylength/30,10)/10;
		  	if(mylength>0 && mylength1==0) mylength1 = 0.1;
		  	if(mylength1>1) mylength1 = 0.7;
		  	
		  	if(text=="<p>&#x200b;</p>") i_size="clean";
		  	
		  	return { myclass:("note-"+i_size), mylength:mylength1 };
		 }

		 //поиск всех родителей
		 this.jsFindPath = function(element) { 
		 		 if(!element || element.id==1) return false;
		 		 var parent_id = element.parent_id;
		 		 var answer = [];
		 		 var j=0,textpath="";
				 while(j<1000) {//не больше 1000 уровней вложенности, чтобы исключить бесконечность
				 	if(element.title) {
						answer.push({path:{id:element.id, title:element.title}});
					 	textpath =  element.title+" → "+textpath;
					 	element = api4tree.jsFind(parent_id);
					 	if(!element) break;
					 	parent_id=element.parent_id;
					 	
					 	if((parent_id==1) || (!parent_id)) {
						 	answer.push({path:{id:element.id, title:element.title}});
						 	textpath =  element.title+" → "+textpath;
					 		break;
					 	}
				 	}
				 	j++;
				 }
				 	
			return {path:answer.reverse(), textpath:textpath};
		 } //jsFindPath


		  this.jsFindIdByLink = function(link) {
		  	  link = link.toLowerCase();
		  	  var encode_link = decodeURIComponent( link.toLowerCase() );
		  	  
			  var answer = files_link_from_texts.filter(function(el,i){
				  if( el && el.links && ( (el.links.toLowerCase().indexOf(link)!=-1) ) ) return true;
				  if( el && el.links && ( (el.links.toLowerCase().indexOf(encode_link)!=-1) ) ) return true;
			  });
			  return answer;
		  }

		  //собирает все ссылки и ссылки на картинке среди всех текстов
		  this.jsFindFilesLinkFromTexts = function() {
		      files_link_from_texts = [];
		  
		      var dfdArray = []; //массив для объектов работы с асинхронными функциями
		      
		      $.each(my_all_data2,function(i,el){ //ищу длинные тексты, чтобы забрать из другой базы
		          if(el) {
		          	var done_element = this_db.jsFindLongText(el.id).done(function(longtext){
		      			if(longtext) {
				  			var regex = /(href=['|"][^'|"]*?['|"])|(src=['|"][^'|"]*?['|"])/ig;
				  			var src = longtext.match(regex);
				  			if(src) {
				  				var links = src.join();
				  				try {
				  				links += decodeURIComponent(links);
				  				} catch(e) {}
				  				
				  				if(links.indexOf("upload.4tree")!=-1) {
				  					files_link_from_texts.push({id:el.id, links: links});
				  				}
				  			}
		      			}
		          	});
		          	
		          	dfdArray.push( done_element );
		          };
		      });
		      
		      //выполняю тогда, когда все длинные тексты считаны
		      $.when.apply( null, dfdArray ).then( function(x){ 
		      });
		      
		  }


		  //собираю все события с датами для календаря
    	  this.jsGetEvents = function(start, end, callback, no_did) {
    	  
    	  	  function safe_title(title) {
    	  	  	  title = strip_tags(title);
	    	  	  return title;
    	  	  }
    	  
	    	  setTimeout(function() {
	    	  	 var caldata2=[];
	    	  	

	    	  	 var caldata = [];

	    	  	 $.each(my_all_data2, function(i,el) {
	    	  		    if( el && !(no_did && el.did!=0) && !(el.date1<start || el.date1>end) && (el.date1!="" && el.del!=1 )) {
	    	  				caldata.push(el);	    	  		   
	    	  			} 
	    	  	 });

	    	  			
	    	  	
	    	  	var answer1=[];
	    	  	var datenow = sqldate( jsNow() );
	    	  			
	    	  	$.each(caldata,function(i,d){
	    	  		if( typeof d.date1 == "string") {
		    	  		if(d.date1 && d.date1.indexOf("00:00:00")>-1) allday = true;
		    	  		else allday = false;
		    	  		
		    	  		if(d.did=="")
		    	  			var isdid = "";
		    	  		else
		    	  			var isdid = "did";
		    	  		
		    	  		if(d.date1<datenow) isdid = isdid+" pasted";
		    	  		
		    	  		var sms = "";
		    	  		if(d.remind>0) sms = '<i class="icon-bell-1 sms_remind"></i>';
		    	  		
		    	  		answer1.push({title:safe_title(d.title)+sms, start:d.date1, end:d.date2, 
		    	  					  allDay:allday, id:d.id,className: isdid });	
			  		}
	    	  	});
	    	  
	    	  	$.each(caldata2,function(i,d)
	    	  		{
	    	  		console.info("c2=",d.id,d.date1);
	    	  		
	    	  		var element = api4tree.jsFind(d.id);
	    	  		
	    	  		if(d.date1.indexOf("00:00:00")>-1) var allday = true;
	    	  		else var allday = false;
	    	  		
	    	  		if(element.did=="")
	    	  			var isdid = "";
	    	  		else
	    	  			var isdid = "did";
	    	  		answer1.push({title:safe_title(element.title), start:d.date1, allDay:allday, id:element.id,className: isdid });	
	    	  		});
	    	  
	    	  
	    	  	callback(answer1);
	    	  },1);
    	  } 

		  //сохраняет название заметки
    	  this.jsSaveTitle = function( sender, needsave ) {
    	  	var from_makedone = sender.hasClass("makedone_h1");

    	  	if(!from_makedone) sender.removeAttr("contenteditable");
    	  	//.scrollTop(0);
    	  	console.info(sender.html(),"?");
    	  	if(needsave==1 && strip_tags(sender.html()) != "")
    	  	  {
    	  	  document.execCommand('unselect');
    	  	  
    	  	  if ( sender.html() != sender.attr("old_title") ) //если текст изменился
    	 	  		{
			 	  	$(".header_text").html("");
			 	  	jsTitle("");
			 	  	var newdate = api4tree.jsParseDate(sender.html());
			 	  	var setdate = newdate.date?newdate.date:"";

    	 	  		sender.attr("old_title",sender.html());
    	 	  		
    	 	  		if(!from_makedone) {
    	 	  			var id = api4tree.node_to_id( sender.parents("li").attr('id') );
    	 	  		} else {
    	 	  			var id = $(".makedone").attr("myid");
    	 	  			$("#node_"+id+" .n_title").html(title);
    	 	  		}
    	 	  		
    	 	  		var fav = $("<div>"+sender.html()+"</div>").find("i").attr("class");
    	 	  		var title=sender.html();
    	 	  		title = strip_tags(title).trim().replace("<br>","");
    	 	  		$(".tree_tab_menu li[myid="+id+"] a").html(title);

    	 	  		window.title = "4tree.ru: "+title;
    	 	  		if(fav) title = "<i class='"+fav+"'></i> "+title;
    	 	  		$(".makedone_h1").html(title);
    	 	    	 	  		
    	 	  		api4tree.jsFind(id,{ title : title });
				 	api4panel.jsPathTitle(id); //устанавливаем путь в шапку
    	 	  		if(setdate) {
    	 	  			var myel = api4tree.jsFind(id,{ date1 : setdate.toMysqlFormat(), date2 : "" });
    	 	  		}
    	 	  		//api4panel.jsRefreshOneElement(id);
    	  			api4others.jsSetTitleBack();
    	  			api4tree.jsMakeTabs();	
    	  //			if(id<0) jsStartSync("soon","IF NEW ELEMENT");
    	  			sender.removeAttr("old_title");
			 		api4tree.jsSetSettings(id);
			 		if( sender.parents(".mypanel:first").attr("id")=="tree_2" )	jsRefreshTree("tree_1");
			 		else jsRefreshTree();
    	  			}
    	  	  }
    	  	else
    	  	  {
    	  	  sender.html( sender.attr("old_title") ); //возвращаю текст обратно
    	  	  sender.removeAttr("old_title");
    	  	  jsTitle("Изменения отменены",5000);
    	  	  document.execCommand('unselect');
    	  
    	  	  }
    	  
    	  
    	  }

    	  this.jsGetTabs = function() {

    	  	   var data = [];

    	  	   $.each(my_all_data2, function(i,el) { 
    	  		    if(el && (el.did==0) && (el.del==0) && (el.user_id==main_user_id) && el.title && !(/\[\@\]/.test(el.title)) && !(/\[\[/.test(el.title)) && el.parent_id>0 ) {
    	  		      				var shablon = /[a-z]|[а-я]+/; 
    	  							var matches = el.title.match(shablon);
    	  
    	  		      				shablon = /(^\d{1,100})/; 
    	  							var matches2 = el.title.match(shablon);
    	  							
    	  		      				if( !matches && !matches2 ) 
    	  		      					if( el.title==el.title.toUpperCase() ) {
    	  		      						data.push(el);
    	  		      					}; 
    	  		      				}
    	  		    } );
    	  
    	  		function compare(a,b) {
    	  		  if (parseFloat(a.tab) < parseFloat(b.tab))
    	  		     return -1;
    	  		  if (parseFloat(a.tab) > parseFloat(b.tab))
    	  		    return 1;
    	  		  return 0;
    	  		}
    	  
    	  		data = data.sort(compare); //сортирую табы по полю tab

    	  		return data;

    	  }
    	  
    	  
    	  this.jsLoadTags = function() {
    	  	var dfd = new $.Deferred();
			jsGetToken().done(function(token){
				var lnk = web_site + "do.php?access_token=" + token + "&get_tags";
				
				$.getJSON(lnk,function(data){
					my_tags = $.map(data, function(a) { return a });
					if(my_tags) localStorage.setItem("my_tags",JSON.stringify(my_tags));
					dfd.resolve();
				});

			});
			return dfd.promise();
	    	  
    	  }
    	  

    	  
    	  this.jsFindTagsByParent = function(parent_id) {
			  var answer = my_tags.filter(function(el,i) {
				 return el.parent_id == parent_id; 
			  });

			  return answer;
    	  }

    	  this.jsFindTag = function(id) {
			  var answer = my_tags.filter(function(el,i) {
				 return el.id == id; 
			  });

			  return answer;
    	  }
    	  

		  this.jsLoadTagsFromLocalStorage = function() {
     	  	  if(!my_tags || !my_tags.length) {
  	          	  var my_tags_json = localStorage.getItem("my_tags");
  	          	  if(my_tags_json) {
					 my_tags = JSON.parse(my_tags_json);
  	          	  }

    	  	  }
		  }

    	  var save_tag_timer;
    	  $("#right_tags").on("click", ".label,.label_mini", function() {
	    	  $(this).parent("li").find("ol:first").slideToggle(200);
	    	  clearTimeout(save_tag_timer);
	    	  save_tag_timer = setTimeout(function(){ 
	    	  	api4tree.jsSaveTagsFromScreen(); 
	    	  }, 3000);
	    	  return false;
    	  });
    	  
    	  $("#right_tags").on("click", ".tag_checkbox", function() {
    	  	  $(this).parents("li:first").toggleClass("checked");
    	  	  
    	  	  var tag_id = parseInt( $(this).parents("li:first").attr("myid") );
			  var id = api4tree.node_to_id( $(".tree_active .selected").attr('id') );
    	  	  
    	  	  if($(this).parents("li:first").hasClass("checked")) {
	    	  	 api4tree.jsSetTagToId(id, tag_id);
	    	  	 api4tree.jsRefreshAllTagsContent();
	    	  	 api4panel.jsRefreshOneElement(id);
    	  	  } else {
	    	  	 api4tree.jsRemoveTagToId(id, tag_id);  
	    	  	 api4tree.jsRefreshAllTagsContent();
	    	  	 api4panel.jsRefreshOneElement(id);
    	  	  }
    	  	  return false;
		  });    	
		  
    	  $("#right_tags").on("click", ".tags_content li", function() {
    	  	  var id = $(this).attr("myid");
    	  	  api4tree.jsSelectTag(id);
    	  	  api4panel.jsOpenPath(id);
    	  	  return false;
    	  });
		  
		  this.jsSelectTag = function(id) {
      	  	  $("#right_tags .tags_selected").removeClass("tags_selected");
    	  	  $("#right_tags .tags_content li[myid='"+id+"']").addClass("tags_selected");
		  }
		  		  
		  this.jsSetTagsCheckboxes = function(id) {
		  		var element = api4tree.jsFind(id);
  			    $("#right_tags .checked").removeClass("checked");
			    if(element.smth) {
			    	var tags_array = JSON.parse(element.smth);
			    	var need_tags = tags_array["tags"];
			    	$.each(need_tags, function(i,el) {
						$("#right_tags li[myid="+el+"]").addClass("checked");
			    	});
			    }
		  }

		  		  
		  this.jsGetTagsForElement = function(element) {
		  	  if(!my_tags) return "";
		  	  var answer = "";
			  if(element.smth) {
		    	  var smth = JSON.parse(element.smth);
		    	  var tags = smth["tags"];
		    	  answer = " <span class='tree_tags'>";
		    	  $.each(tags, function(i, el){
			    	  var the_tag = api4tree.jsFindTag(el);
			    	  if(the_tag.length) {
				    	  if(i!=0) var comma = " ";
				    	  else comma = " ";
				    	  answer += comma+"<b title='@"+the_tag[0].title+"'><a>"+the_tag[0].title+"</a></b>";
			    	  }
		    	  });
		    	  answer += "</span>";
			  } 
			  return answer;
		  }
    	  
    	  this.jsSetTagToId = function (id, tag_id) {
	    	  var element = api4tree.jsFind(id);
	    	  if(element.smth) {
		    	  var smth = JSON.parse(element.smth);
		      } else {
		          var smth = {tags:[]};
		      }

	    	  var tags = smth["tags"];
	    	  tags = tags?tags:[];
        	  
        	  if(tags.indexOf(tag_id)==-1) {
        	  	tags.push( parseInt(tag_id) );
        	  	smth["tags"] = tags;
        	  	var save_smth = JSON.stringify(smth);
        	  	
        	  	api4tree.jsFind(id, {smth: save_smth});
        	  } 
        	  
	    	  
    	  }

    	  this.jsRemoveTagToId = function (id, tag_id) {
	    	  var element = api4tree.jsFind(id);
	    	  if(element.smth) {
		    	  var smth = JSON.parse(element.smth);
		      } else {
		          var smth = {tags:[]};
		      }

	    	  var tags = smth["tags"];
	    	  tags = tags?tags:[];
	    	  
	    	  var sliced = false;
	    	  $.each(tags, function(i,tag) {
				  if(tag==tag_id) {
				  	 tags.splice(i,1);
				  	 console.info(tags);
				  	 sliced = true;
				  };
	    	  });
        	  
        	  if(sliced) {
        	  	smth["tags"] = tags;
        	  	var save_smth = JSON.stringify(smth);
        	  	
        	  	api4tree.jsFind(id, {smth: save_smth});
        	  } 
        	  
	    	  
    	  }
    	  
    	  this.jsFindByTag = function (tag_id) { //все дела этого тега
		      var answer = [];
		      	$.each(my_all_data2, function(i,el) { //все дела с датами (нужно для календариков)
  	            if(!el) return false;
		      	if(el.smth) {
		      		if ((el.del!=1) && ( (el.did=="") || settings.show_did==true ) ) {
		      			var tags = JSON.parse(el.smth)["tags"];
		      			if(tags.indexOf(tag_id)!=-1) answer.push(el);
		      		}
		      	}
		      });		    	  
		      return answer;
    	  }
    	  
		  this.jsRefreshAllTagsContent = function() {
		      var html_cache = $("#tags_ul").clone();
		      html_cache.find(".tags_content").html("");
		      html_cache.find(".count").html("0");
		      
		      var old_selected = $("#right_tags .tags_selected:first").attr("myid");
		     
		      
		   	  $.each(my_all_data2, function(i,el) { //все дела с датами (нужно для календариков)
  	            if(!el) return false;
		      	if(el.smth) {
		      		if ((el.del!=1) && ( (el.did=="") || settings.show_did==true ) ) {
		      			var tags = JSON.parse(el.smth)["tags"];
		      				$.each(tags, function(i, the_tag) {
		      					var li = html_cache.find("li[myid='"+the_tag+"']");
		      					li.find(".count:first").html( parseInt(li.find(".count:first").html())+1 );
			      				var tags_ul = li.find(".tags_content:first");
				  				
				  				var date1 = "<div class='date1' title='"+el.date1+"'></div>";
			      				
			      				tags_ul.append("<li myid='"+el.id+"'>"+el.title+date1+"</li>");
		      				});
		      		}
		      	}
		      });	
		      
		      $("#tags_ul").html(html_cache.html());
		      
		      api4panel.jsPrepareDate($("#tags_ul"));

			  api4tree.jsSelectTag(old_selected);

	    	  $("#tags_ul").sortable({stop:jsSaveTags});
	    	  $("#tags_ul ul").sortable({stop:jsSaveTags});
			  
		  }
		  
		  function jsSaveTags() {
  	    	  clearTimeout(save_tag_timer);
	    	  save_tag_timer = setTimeout(function(){ 
	    	  	api4tree.jsSaveTagsFromScreen(); 
	    	  }, 3000);

		  }
		  
		  this.jsSaveTagsFromScreen = function() {
			 $("#right_tags .tag").each(function(i, el){
			 	 var title = $(el).find(".title").html();
			 	 var id = $(el).attr("myid");
			 	 var is_open = $(el).find(".tags_content:first").is(":visible");
			 	 var parent_id = $(el).attr("parent_id");
			 	 var element = api4tree.jsFindTag(id)[0];
			 	 element.id = id;
			 	 element.parent_id = parent_id;
			 	 element.position = i;
			 	 element.is_open = is_open?1:0;				 
			 });
			 
			jsGetToken().done(function(token){
				
				var lnk = web_site + "do.php?access_token=" + token + "&save_tags";
				var my_tags_json = JSON.stringify(my_tags);
				var changes = 'my_tags='+encodeURIComponent(my_tags_json);
				
				$.postJSON(lnk,changes, function(data,j,k) { //////////////A J A X/////////////////
				});

			});
			 
		  }
		  
    	  
    	  var output = "", tags_level = 0;
    	  this.jsShowAllTags =function() {

    	  	  output = "";
    	  	  tags_level = 0;
	    	  api4tree.jsShowAllTagsByParent(1);
	    	  $("#right_tags").html(output);
			  var id = api4tree.node_to_id( $(".tree_active .selected").attr('id') );
	    	  api4tree.jsSetTagsCheckboxes(id);

	    	  api4tree.jsRefreshAllTagsContent();
	    	  	    	  
	    	  return output;
    	  };
    	  
    	  
    	  this.jsShowAllTagsByParent = function(parent_id) {
    	      	  
			  if(tags_level>50) return false;
    	  	  var top_tags = api4tree.jsFindTagsByParent(parent_id);
    	  	  if(top_tags.length>0) {
	    	  	  if(parent_id==1) {
	    	  	  	  output += '<ul id="tags_ul">';    	  	  
			  	  	  var isTop = "top_label";
	    	  	  } else {
		    	  	  output += '<ul>';    	  	  
				  	  var isTop = "";
	    	  	  }
	    	  	  
		    	  $.each(top_tags, function(i,el) {
		    	    if(el.is_open==1) var is_open="display:block;";
		    	    else var is_open = "";
		    	    
		    	  	output += '<li myid="'+el.id+'" parent_id="'+el.parent_id+'" class="'+isTop+' tag">';

				  	label_for_contextmenu = "<div class='tags_contextmenu' title='Управление тегом. Добавление нового.'><i class='icon-down-dir'></i></div>";
				  	
				  	output += label_for_contextmenu;

		    	  	if(el.parent_id==1) {
		    	  		output += '<div class="tag_checkbox"></div><div class="label">@<span class="title">'+el.title+'</span> (<span class="count">0</span>)</div>';
		    	  	} else {
		    	  		output += '<div class="tag_checkbox"></div><div class="label_mini"><span class="title">'+el.title+'</span> (<span class="count">0</span>)</div>';
		    	  	}
		    	  	
		    	  	output += '<ol class="tags_content" style="'+is_open+'">';			    	  													output += '</ol>';
		    	  	
					
		    	  	api4tree.jsShowAllTagsByParent(el.id);
		    	  	output += '</li>';
		    	  });
		    	  output += "</ul>";
   	 	    	  return "";
	    	  } else {
		    	  return "";
	    	  }
	    	  
    	  }

	      //создаю закладки из всех дел написанных большими буквами
    	  this.jsMakeTabs = function() { 
    		   //поиск всех дел написанных БОЛЬШИМИ буквами и не начинающиеся с цифры

			var data = api4tree.jsGetTabs();

    	  	var alltabs="";
    	  	var d_len = data.length;
    	  	for(i=0; i<d_len; i=i+1)
    	  		{
    	  		if(data[i].title.length>10) title = data[i].title;
    	  		else title = "";
    	  		alltabs = alltabs + "<li title='"+title+"' myid='"+
    	  				  data[i].id+"'><a>"+api4tree.jsShortText(data[i].title,20)+"</a></li>";
    	  				  //<i class='icon-folder-1'></i>
    	  		}
    	  	//alltabs= alltabs+ "<div id='fav_help'>Заголовки дерева написанные БОЛЬШИМИ буквами</div>";
    	  		
    	  	$('#right_fav_folders ul').html("").append(alltabs);	
    	  
    	  	this_db.jsCalcTabs();  //раcсчитываю ширину табов и перекидываю лишние в всплывающий список
    	  }
    	  this.jsOpenTab = function(id) {

	    	  var tab_exist = $("#tree_header li[myid="+id+"]");
	    	  var element = api4tree.jsFind(id);
	    	  if(!element) return false;
	    	  var title = element.title;
	    	  
	    	  if(tab_exist.length) {
		    	  $("#tree_header li.active").removeClass("active");
		    	  tab_exist.addClass("active");
	    	  } else {
	    	  	  var temp_li = $(".tree_tab_menu li.temp");
	    	  	  if( temp_li.length ) {
			    	  $("#tree_header li.active").removeClass("active");
		    	  	  temp_li.attr("myid",id).addClass("active").find("a").html(title);
	    	  	  } else {
			      	  var new_tab = '<li><a>'+ title +'</a><i class="icon-cancel"></i></li>';
				      $(".tree_tab_menu .add_tab").before(new_tab);
			      	  $(".tree_tab_menu").find(".active").removeClass("active");
				      $(".tree_tab_menu li:not(.add_tab):last").addClass("active").addClass("temp").attr("myid",id);		    	  	  
					  api4tree.jsCurrentOpenPanelsAndTabsSave();
	    	  	  }
		    	  
	    	  }
	    	  api4tree.jsCalcTabs();
			  $("#tree_header ul").sortable({axis:"x", appendTo: "body", tolerance: "intersect", zIndex: 3, containment: "document", stop: function(){
					  api4tree.jsCurrentOpenPanelsAndTabsSave();
			  	  },
			  items: "li:not(.add_tab)"
			  });
    	  }
    	  		      
		  this.jsCalcTabs = function() {//устанавливает ширину табов у дневника и у избранных
	    	  clearTimeout(calctabs_timer);
	    	  calctabs_timer = setTimeout(function()
	    	  	{
	    	  	var tabs_count = $("#tree_header li:not(.add_tab)").length;
	    	  	var w = $(".tree_tab_menu").width();
	    	  	new_width = parseInt( (w/(tabs_count)) -40 )+"px";
	    	  	$("#tree_header li:not(.add_tab)").animate({"width":new_width},100);
				});
    	  
    	  }
		      
		  //заполняю массив allmynotes,allmydates всеми непустыми заметками из дневника (для календариков)
		  this.jsGetAllMyNotes = function() {
		  		return false;
		      if(!my_all_data2) return false;
		      allmynotes = [];
		      	$.each(my_all_data2, function(i,el) { //все заметки длиннее 3 символов (без тегов)
		        	if(el && el.title && (el.del!=1) && (el.title.indexOf(" - ")!=-1) && (el.title[el.title.length-1]==")") && (strip_tags(el.text).length>3)) {
		        		allmynotes.push(el);
		        	}return true;
		  		});	
		      	
		      allmydates = my_all_data2.filter(function(el,i) { //все дела с датами (нужно для календариков)
  	            if(!el) return false;
		      	if(el.date1) 
		      		if ((el.del!=1) && (el.date1!="")) return true;
		      });	
		      return [allmynotes,allmydates];
		  }
		      
		  //поиск всех заметок на эту дату (нужно для календариков)
		  this.jsDiaryFindDateNote = function(date) { 
			  if(!my_all_data2) return false;
			  
			  var today = date;
			  var year = today.getFullYear();
			  var month = today.getMonth()+1; if(month<10) month = "0"+month;
			  var day = today.getDate(); if(day<10) day = "0"+day;
			  
			  var finddate = day +"."+ (month) + "."+year+" - ";
			  
			  var answer = [];
	      	  $.each(my_all_data2, function(i,el) { //все заметки длиннее 3 символов (без тегов)
		        	if(el && el.title && (el.del!=1) && ( /-/.test(el.title) ) && ( /\)/.test(el.title) ) && (el.title.indexOf(finddate)!=-1) && (el.text.length>3)) {
		        		answer.push(el);
		        	}
	  		  });	


			  /*allmynotes.filter(function(el,i) {
			      if(el.parent_id) return (el.title.indexOf(finddate)!=-1); 
			  });	*/
			  
			  if(answer.length!=0) {
			      var text = answer[0].text;
			      text = text.replace("</p>"," ").replace("</div>"," ").replace("<br>"," ").replace("</li>"," ");

			      var mytext = strip_tags(text).trim();  
			  //	mytext = mytext.replace("@@@","___\r");
			      return [true,mytext]; 
			      }
			       
			  else return [false,""];
		 }

		  //поиск всех событий назначенных на эту дату (нужен для календариков)
		  this.jsDiaryFindDateDate = function(date) { 
			  if(!my_all_data2 ) return false;
			  
			  var today = date;
			  var year = today.getFullYear();
			  var month = today.getMonth()+1; if(month<10) month = "0"+month;
			  var day = today.getDate(); if(day<10) day = "0"+day;
			  
			  var finddate = year +"-"+ (month) + "-"+ day +" ";
			  
			  var answer = [];
	      	  $.each(my_all_data2, function(i,el) { //все заметки длиннее 3 символов (без тегов)
		        	if(el && el.title && (el.del!=1) && (typeof el.date1 == "string") && (el.date1.indexOf(finddate)!=-1) ) {
		        		answer.push(el);
		        	}
	  		  });	

/*
			  var answer = allmydates.filter(function(el,i) 
			      { 
			      if((el.parent_id) && (typeof el.date1 == "string")) return (el.date1.indexOf(finddate)!=-1); 
			      });	
*/			  
			  
			  if(answer.length!=0) 
			      { 
			      var mytext = "";
			      var a_len = answer.length;
			      for(i=0;i<a_len;i=i+1)
			      	{
			      	mytext = mytext + "— "+answer[i].title;
			      	if(i!=answer.length-1) mytext = mytext+"\r";
			      	}
			      return [true,mytext]; 
			      }
			       
			  else return [false,""];
		 }
		 
    	  //определяет номер недели у любой даты (new Date()).getWeek() 
    	  Date.prototype.getWeek = function () {  
    	      // Create a copy of this date object  
    	      var target  = new Date(this.valueOf());  
    	    
    	      // ISO week date weeks start on monday  
    	      // so correct the day number  
    	      var dayNr   = (this.getDay() + 6) % 7;  
    	    
    	      // ISO 8601 states that week 1 is the week  
    	      // with the first thursday of that year.  
    	      // Set the target date to the thursday in the target week  
    	      target.setDate(target.getDate() - dayNr + 3);  
    	    
    	      // Store the millisecond value of the target date  
    	      var firstThursday = target.valueOf();  
    	    
    	      // Set the target to the first thursday of the year  
    	      // First set the target to january first  
    	      target.setMonth(0, 1);  
    	      // Not a thursday? Correct the date to the next thursday  
    	      if (target.getDay() != 4) {  
    	          target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);  
    	      }  
    	    
    	      // The weeknumber is the number of weeks between the   
    	      // first thursday of the year and the thursday in the target week  
    	      return 1 + Math.ceil((firstThursday - target) / 604800000); 
    	      // 604800000 = 7 * 24 * 3600 * 1000  
    	  }  
    	      
    	  //определяет сколько дней прошло с начала года
    	  Date.prototype.getDOY = function() {
    	  	var onejan = new Date(this.getFullYear(),0,1);
    	  	return Math.ceil((this - onejan + 1) / 86400000);
    	  }
    	  
    	  //определяет путь до дневника и переходит на эту дату jsDiaryPath(new Date())
    	  this.jsDiaryPath = function(mydate,dontopen,need_week) {
    		  var quartil = new Array(1,1,1,2,2,2,3,3,3,4,4,4); //номера кварталов
    		  var weekname = new Array('воскресение','понедельник','вторник','среда',
    		  						   'четверг','пятница','суббота');
    		  var monthname = new Array('январь','февраль','март','апрель','май','июнь','июль',
    		  							'август','сентябрь','октябрь','ноябрь','декабрь');
    		  var weather = new Array('зима','зима','весна','весна','весна','лето',
    		  						  'лето','лето','осень','осень','осень','зима');
    		  
    		  var today = new Date(mydate);
    		  
    		  var year = today.getFullYear();
    		  var weathername_text = weather[today.getMonth()];
    		  var monthname_text = monthname[today.getMonth()];
    		  var month = today.getMonth()+1; if(month<10) month = "0"+month;
    		  var quartilname_text = quartil[today.getMonth()];
    		  var weekname_text = weekname[today.getDay()];
    		  var weeknum = today.getWeek();
    		  var day = today.getDate(); if(day<10) day = "0"+day;
    		  
    		  if(false) return new Date(t[0], t[1] - 1, t[2], t[3] || 0, t[4] || 0, t[5] || 0);          
    		  
    		  var path = ["_ДНЕВНИК",year+" год", 
    		  			  quartilname_text + " квартал", 
    		  			  monthname_text +" ("+weathername_text+")", 
    		  			  weeknum + " неделя"];
    		  	
    		  if(!need_week) {
	    		  path.push( day +"."+ (month) + "."+year+" - "+weekname_text+" ("+today.getDOY()+")" );
	    	  } else {
		    	  
	    	  }
    		  
    		  var id = api4tree.jsCreate_or_open(path);
    		  
    		  if(!dontopen) 
    		  	api4panel.jsOpenPath( id );
    		  return id;
    	  }
    	  
    	  //открывает если есть или создаёт jsCreate_or_open(["Мужики","Блондины","Петя-блондин"])
    	  this.jsCreate_or_open = function(path) {
    	  	var parent_id=1;
    	  	var p_len = path.length;
    	  	for(var i=0;i<p_len;i++)
    	  		{
    	  		var id = api4tree.jsFindByTitle(parent_id, path[i]);  //ищу запись у родителя
    	  		if(!id) var id = this_db.jsAddDo(parent_id, path[i],undefined,undefined,undefined,"dont_parse_date").id; //создаю, если нет такой записи
    	  		parent_id = id;
    	  		}
    	  	return id;	
		  }
		  
		  this.jsFindByTitle = function(parent_id, title) {
		      var elements = [];

		      childs = api4tree.jsFindByParent(parent_id);

		      $.each(childs, function(i, el){
		      	 if (el && el.parent_id && el.parent_id==parent_id && el.did==0 && el.del==0 && el.title && el.title.indexOf(title)!=-1) {
		      	 	elements.push(el);
		      	 }
		      });

		   
/*
		      my_all_data.filter(function(el){ 
		      	return (el && el.parent_id && el.parent_id==parent_id && el.did==0 && el.del==0 && el.title && el.title.indexOf(title)!=-1); 
		      }); */
		      
		      if(elements.length) return elements[0].id;
		  }
		  
		  //Добавляет текст в дневник
		  this.jsDiaryTodayAddPomidor = function(text, color) { 
		  	var d = new $.Deferred();
		 	var id = this_db.jsDiaryPath( jsNow(), "dont_open" ); //id текущего дня в дневнике
		 	api4editor.jsSaveAllText();
		 	if(!color) color = "rgb(48,134,0);"; //зелёный листочке
		 	else color = "rgb(142, 185, 96);"; //если листочек добавлен вручную, он светло-зелёный
		 	this_db.jsFindLongText(id).always(function(old_text){
		 		var new_text = old_text;
		 		var text_div = $("<div>"+old_text+"</div>");
		 		var my_pomidor = text_div.find(".my_pomidors");
		 		if(!my_pomidor.length) {
		 			var descript = "Успешно выполненные блоки работы по 25 минут (Система Pomodorro)";
		 			new_text = "<div class='my_pomidors' title='"+descript+"'><ol></ol></div>"+new_text;
		 			text_div = $("<div>"+new_text+"</div><div contenteditable='false'></div><p>...</p>");
			 		my_pomidor = text_div.find(".my_pomidors");
		 		}
		 		
		 		if(old_text=="") text_div.append("<p>...</p>");
		 		
		 		var time = new Date();
		 		var stime = time.getHours()+":"+
		 			((time.getMinutes().toString().length==1)?("0"+time.getMinutes()):time.getMinutes());
		 		
		 		my_pomidor.find("ol").append("<li><span style='display:inline-block;width:100%;vertical-align:top;'><i class='icon-record' style='color:"+color+"'></i> "+
		 									  text+"<b>"+stime+"</b></span></li>");
		 		
		 		global_id = id;
		 		
		 		this_db.jsFindLongText(global_id, text_div.html()).always(function(){
		 			jsRefreshTree();
		 		});
		 		
		 		if($("#redactor").attr("myid")==global_id) { //если заметка дневника сейчас открыта
			 		setTimeout(function(){ 
				 		api4editor.jsRedactorOpen([global_id],"diary_add_pomidor","dont-save-before");
			 		}, 100);
			 	}
		 		
		 		return d.resolve(text_div);
		 		
		 	});
		  return d.promise();
		  }
		  
		  //Пересчитывает помидорки в дневнике
		  this.jsRecalculatePomidors = function() { 
		  }

		  //преобразование #node_id в id
		  this.node_to_id = function(id) {
			  if(id) return id.replace("node_", "");
		  }
		  
		  //преобразование id в #node_id
		  this.id_to_node = function(id) {
			  if(id) return "node_"+id;
		  }
		  		  
		  //выдаёт всех детей и внуков
		  function recursive_by_parent(id) {
			var answer = this_db.jsFindByParent(id,settings.show_did);
			
			$.each(answer,function(i,el) { //обходим все элементы с датой
				recursive_array.push(el);
			    recursive_by_parent(el.id);
			});
		  return recursive_array;
		  }
		  
		  //выбирает всех детей и внуков элемента id (44ms)
		  this.jsRecursive = function(id) {
		  	recursive_array = [];
			this_db.log("start recursive");
		  	recursive_array = recursive_by_parent(id,recursive_array);
			this_db.log("finish recursive");
		  	return recursive_array;
		  	
		  }//jsRecursive
		  
 		  //Загружает параметры установленные в LocalStorage
		  this.jsLoadUserSettings = function() { 
			  //скрываю панель настройки
//			  $(".makedone").hide();		  
		  	  //показывать ли выполненные дела
		  	  var get_show_did = localStorage.getItem('show_did');
		  	  if(get_show_did=="true") { 
		  	  	settings.show_did = true; 
		  	  	$("#on_off_hide_did").attr("checked",true); 
		  	  } else { 
		  	  	settings.show_did = false; 
		  	  	$("#on_off_hide_did").removeAttr("checked"); 
		  	  }
		  	  
		  	  
		  	  
		  }
		  
		  
		  //загружает ссылку для расшаривания
		  this.jsStartShare = function(id,need_to_off) { 
			if (navigator.onLine == false) { //если интернета нет
				if($("#on_off_share").prop("checked")==true) {
					is_rendering_now = true;
					$("#on_off_share").prop("checked",false).iphoneStyle("refresh");
					is_rendering_now = false;
				}
				jsTitle("Интернет отсутствует, кнопка поделиться пока не работает", 10000);
				return false;
			}
			
			//включаю или выключаю ссылку
			if(need_to_off==0 || need_to_off==1) { 
			
			jsGetToken().done(function(token){

				var lnk = web_site + "do.php?access_token=" + token + "&onLink="+id+"&is_on="+need_to_off+"&shortlink="+
						   $("#makeshare").val().split("/")[1];
				
				$.getJSON(lnk,function(data){
						if(data == "1") {
							$("#makesharestat_count").hide();
							$("#makesharestat").html("").hide();
							    is_rendering_now = true;
								$("#on_off_share").prop("checked",true).iphoneStyle("refresh");
								is_rendering_now = false;
								$(".makesharediv").show();
						} else {
							$("#makesharestat_count").hide();
							$("#makesharestat").html("").hide();
							    is_rendering_now = true;
								$("#on_off_share").prop("checked",false).iphoneStyle("refresh");
								is_rendering_now = false;
								$(".makesharediv").hide();
						}
				});
			}); //jsGetToken
				return true;
				}
			
			jsGetToken().done(function(token){
			
				//считываю ссылку и статистику
				var lnk = web_site + "do.php?access_token=" + token + "&getLink="+id;
				$.getJSON(lnk,function(data){
				$("#makesharestat_count span").text("0");
				$("#makeshare").val("4tree.ru/"+data.shortlink);
				if(data.is_on=="0") {
					$("#makesharestat_count").hide();
					$("#makesharestat").html("").hide();
					if($("#on_off_share").prop("checked")==true) {
						is_rendering_now = true;
						$("#on_off_share").prop("checked",false); $("#on_off_share").iphoneStyle("refresh");
						is_rendering_now = false;
						$(".makesharediv").hide();
					}
					
				} else {
					if($("#on_off_share").prop("checked")==false) {
						is_rendering_now = true;
						$("#on_off_share").prop("checked",true); $("#on_off_share").iphoneStyle("refresh");
						is_rendering_now = false;
						$(".makesharediv").show();
					}
				}
			
				$("makesharestat_count").html(data.stat_count);
				
				if(data.stat_count==0 || data.stat_count=="") {
					$("#makesharestat_count").hide();
					$("#makesharestat").html("").hide();
				} else {
					$("#makesharestat_count span").html(data.stat_count);
					$("#makesharestat_count").show();
					$("#makesharestat").html(data.statistic);
				}
			
					
			});
			
			});
			
			
		  }

		  
		  //удаление из базы определённого id и удаление его же в LocalStorage
		  function jsDelId(id) {
		  		var element = api4tree.jsFind(id);
		  		if(!element) return false;
		  		sync_now = true;
		  		var answer = false;

		  		delete my_all_data2["n"+id];
		  		api4tree.jsRefreshParents();


				var dfdArray = [];
					      		
   	    		dfdArray.push( db.remove(global_table_name,id) );
   	    		dfdArray.push( db.remove(global_table_name+"_texts",id) );

				$.when.apply( null, dfdArray ).then( function(x){ 
					$("#node_"+id).remove();
					$("#panel_"+id).remove();
					if( $("#redactor").attr("myid") == id ) {
				     	var parent_id = api4tree.jsCreate_or_open(["_НОВОЕ"]);
				     	if(typeof api4panel != "undefined") api4panel.jsOpenPath(parent_id);
					}
					if($('#calendar').length) $('#calendar').fullCalendar( 'refetchEvents' );
					sync_now = false;
				});
		  
		  		return answer;
		  }

		  function jsDeleteInside(id) //рекурсивное удаление дочерних элементов
		  {
		  	   var show_did_was = settings.show_did;
		  	   settings.show_did = true;
		  	   var mychildrens = this_db.jsFindByParent(id);
		  	   settings.show_did = show_did_was;
		  
		      
		      if( mychildrens.length > 0 )
		      	{
		      	$.each(mychildrens,function(i,dd)
		      	   {
		      	   jsDeleteInside(dd.id);
		      	   this_db.jsFind(dd.id,{ del:1 });
		      	   console.info("Удалил = ",dd.id);
		      	   });
		      	}
		  }

		  //удаление элемента и его детей
		  this.jsDeleteDo = function(current) {
			  
			  var id = api4tree.node_to_id( current.attr('id') );
			  var next = current.nextAll("li:first");
			  if(!next.length) next = current.parents("li:first");
			  
			  jsDeleteInside(id);
			  this_db.jsFind(id,{ del:1 });
			  
			  $("#panel_"+id).remove();
		      jsRefreshTree();
			 
			  
		  }
		  
		  //делает дело выполненным
		  this.jsMakeDid = function(id) { //выполняю одно дело
		  	   var mydatenow = new Date();
		  	   var did_time = mydatenow.toMysqlFormat();
		  	   var elements = api4tree.jsRecursive(id);
		  	   $.each(elements,function(i,el){
		  		   this_db.jsFind(el.id,{ did:did_time });
		  		   $("#node_"+el.id).addClass("do_did");
		  	   });

		  	   this_db.jsFind(id,{ did:mydatenow.toMysqlFormat() });
	  		   $("#node_"+id).addClass("do_did");

		  	   clearTimeout(did_timeout);
		  	   if(!settings.show_did) {
		  	   		did_timeout = setTimeout(function() {
		  				$(".do_did").slideUp(300,function(){ 
		  					jsRefreshTree(); 
		  				});	   			
	  	   			},20000);
		  	   		jsTitle("Выполненные дела будут скрыты через 20 секунд",20000);
		  	   } else {
		  	   		jsRefreshTree();
		  	   }
		  	   $('#calendar').fullCalendar( 'refetchEvents' );
		  }
		  

		  //делает дело выполненным
		  this.jsMakeUnDid = function(id) { //выполняю одно дело
		  	   var show_did_was = settings.show_did;
		  	   settings.show_did = true;
		  	   var elements = api4tree.jsRecursive(id);
		  	   settings.show_did = show_did_was;
		  	   $.each(elements,function(i,el){
		  		   this_db.jsFind(el.id,{ did:"" });
		  		   $("#node_"+el.id).removeClass("do_did");
		  	   });

		  	   this_db.jsFind(id,{ did:"" });
		  	   
		  	   
		  	   
	  		   $("#node_"+id).removeClass("do_did");
		  	   jsRefreshTree();
		  	   $('#calendar').fullCalendar( 'refetchEvents' );
		  }
		  
		  //парсер даты (позвонить послезавтра)
		  this.jsParseDate = function(title) {
		  
		  	title = title.replace(" один"," 1").replace(" один"," 1").replace(" два"," 2").replace(" три"," 3").replace(" четыре"," 4").replace(" пять"," 5").replace(" шесть"," 6").replace(" семь"," 7").replace("восемь","8").replace("девять","9").replace("десять","10").replace("одинадцать","11").replace("двенадцать","12").replace("тринадцать","13").replace("четырнадцать","14").replace("пятнадцать","15").replace(" шестнадцать"," 16").replace(" семнадцать"," 17").replace(" двадцать"," 20").replace(" ноль"," 0");
		  
		  	if(title) title = title.toLowerCase();
		  	var answer = "";
		  	var did = false;
		  	var mytime = "";
		  	var mydate = new Date();
		  	var newdate = new Date();
		  	
		  	var d = new Object;
		  	
		  	d.myhours = 0;
		  	d.myminutes = 0;
		  	d.mydays = 0;
		  	d.mymonth = 0;
		  	d.myyears = 0;
		  	d.myweek = 0;
		  	
		  	
		  	var shablon = /(\d{1,2}.\d{1,2}.\d{4})/g; 
		  	var matches = title.match(shablon);
		  	
		  	if(matches) {
		  		shablon = /(\d{1,4})/g; 
		  		var matches2 = matches[0].match(shablon);
		  	    newdate.setDate(matches2[0]);
		  	    newdate.setMonth(matches2[1]-1);
		  	    newdate.setFullYear(matches2[2]);
		  	    answer = matches2[0] + "." + matches2[1] + "." + matches2[2];
		  	    did = true;
		  	}
		  	
		  	shablon = /(\d{1,2} янв)|(\d{1,2} фев)|(\d{1,2} мар)|(\d{1,2} апр)|(\d{1,2} мая)|(\d{1,2} май)|(\d{1,2} июн)|(\d{1,2} июл)|(\d{1,2} авг)|(\d{1,2} сен)|(\d{1,2} окт)|(\d{1,2} ноя)|(\d{1,2} дек)/g; 
		  	matches = title.match(shablon);
		  	
		  	if(matches) {
		  	  	console.info(matches);
		  		shablon = /(\d{4})/g; 
		  		matches2 = title.match(shablon); //найти год
		  	
		  		shablon = /(янв)|(фев)|(мар)|(апр)|(мая)|(май)|(июн)|(июл)|(авг)|(сен)|(окт)|(ноя)|(дек)/g; 
		  		matches3 = title.match(shablon); //найти месяц
		  	
		  		shablon = /(\d{1,2})/g; 
		  		matches4 = matches[0].match(shablon); //найти дату
		  	
		  		if(matches3[0]=="янв") var mymonth = 1;
		  		if(matches3[0]=="фев") var mymonth = 2;
		  		if(matches3[0]=="мар") var mymonth = 3;
		  		if(matches3[0]=="апр") var mymonth = 4;
		  		if(matches3[0]=="мая") var mymonth = 5;
		  		if(matches3[0]=="май") var mymonth = 5;
		  		if(matches3[0]=="июн") var mymonth = 6;
		  		if(matches3[0]=="июл") var mymonth = 7;
		  		if(matches3[0]=="авг") var mymonth = 8;
		  		if(matches3[0]=="сен") var mymonth = 9;
		  		if(matches3[0]=="окт") var mymonth = 10;
		  		if(matches3[0]=="ноя") var mymonth = 11;
		  		if(matches3[0]=="дек") var mymonth = 12;
		  		
		  	    newdate.setDate(matches4[0]);
		  	    newdate.setMonth(mymonth-1);
		  	
		  	    if(matches2) newdate.setFullYear(matches2[0]);
		  	    
		  	    answer = matches4[0] + " " + matches3[0];
		  	    did = true;
		  	}
		  	
		  	shablon = /(вчера)|(позавчера)|(сегодня)|(завтра)|(послезавтра)/g; 
		  	matches = title.match(shablon);
		  	if(matches) {
		  		if(matches[0]=="позавчера") var add_days = -2;
		  		if(matches[0]=="вчера") var add_days = -1;
		  		if(matches[0]=="сегодня") var add_days = 0;
		  		if(matches[0]=="завтра") var add_days = +1;
		  		if(matches[0]=="послезавтра") var add_days = +2;
		  		
		  		newdate.setDate( newdate.getDate() + add_days );
		  	    answer=" + " + matches[0];
		  	    did = true;
		  	}
		  	
		  	shablon = /(\d{1,2}ч|\d{1,2} ч)|(в \d{1,2}:\d{1,2})|(в\d{1,2}:\d{1,2})|(\d{2} ми)|(\d{2}ми)|(\d{1,2} \d{2}м)|(в \d{1,2})|(в\d{1,2})|(\d{1,2}:\d{1,2})/g; 
		  	matches = title.match(shablon);
		  	
		  	if(matches) {
			  	if(matches.length==1) {
			  		mytime = matches;
			  	} else {
			  		mytime = matches.join(" ");
			  	}
		  	}
		  	
		  	var matches2 = title.match(/\d{1,4}/g); //все двух-значные цифры
		  	
		  	var plus;
		  	shablon = /(дней|лет|нед|год|мес|день|дня|час|мин|\d{1,2}м|\d{1,2} м)/g;
		  	matches = title.match(shablon);
		  	//если "через 2 часа 30 минут"
		  	if( ( (title.indexOf("назад")!=-1) || (title.indexOf("через")!=-1) ) && matches ) {
		  		if (title.indexOf("через")!=-1) { plus = "+";
		  		} else { plus = "-"; }
		  		
	  			if(matches[0]=="час") //если указаны часы и минуты
      				{
      				if(matches2)
      					{
      					answer = plus;
      					if(matches2[0]) { answer += matches2[0] + " час."; d.myhours=plus+matches2[0]; }
      					if(matches2[1]) { answer += " "+matches2[1] + " мин."; d.myminutes=plus+matches2[0]; }
      					mytime = ""; //это не время
      					}
      				}
      			if(matches[0]=="мин" || (matches[0][matches[0].length-1]=="м" && (title.indexOf("мес")==-1 ))) //если указаны только минуты
      				{
      				if(matches2)
      					{
      					answer = plus;
      					if(matches2[0]) { answer += " "+matches2[0] + " minute"; d.myminutes=plus+matches2[0]; }
      					mytime = ""; //это не время
      					}
      				}
      			if(matches[0]=="нед") //если указаны только недели
      				{
      				if(matches2)
      					{
      					answer = plus;
      					if(matches2[0]) { answer += ""+matches2[0] + " нед."; d.myweek = plus+matches2[0]; };
      					}
      				if(title.indexOf("через нед")!=-1) { answer = "+ 1 нед."; d.myweek = plus+1 };
      				}
      			if(title.indexOf("месяц")!=-1) //если указаны только месяцы
      				{
      				if(matches2)
      					{
      					answer = plus;
      					if(matches2[0]) { answer += ""+matches2[0] + " мес."; d.mymonth = plus+matches2[0]; };
      					}
      				if(title.indexOf("через мес")!=-1) { answer = "+ 1 мес."; d.mymonth = plus+1; };
      				}
      			if( (title.indexOf(" год")!=-1) || (title.indexOf(" лет")!=-1) ) //если указаны только месяцы
      				{
      				if(matches2)
      					{
      					answer = plus;
      					if(matches2[0]) { answer += ""+matches2[0] + " год.";  d.myyears = plus+matches2[0]; };
      					}
      				if(title.indexOf("через год")!=-1) { answer = "+ 1 год.";  d.myyears = plus+1; };
      				}
      	
      			if( (title.indexOf(" день")!=-1) || (title.indexOf(" дня")!=-1) || (title.indexOf(" дней")!=-1) ) //если указаны только месяцы
      				{
      				if(matches2)
      					{
      					answer = plus;
      					if(matches2[0]) { answer += ""+matches2[0] + " дн."; d.mydays = plus+matches2[0]; };
      					}
      				if(title.indexOf("через год")!=-1) { answer = "+ 1 дн."; d.mydays = plus+1; };
      				}
		  	}
		  	
		  	if(mytime!="") {
		  		///анализ времени
		  		shablon = /(в \d{1,2})|(в\d{1,2})|(\d{1,2}:\d{1,2})/g; 
		  		matches = mytime.toString().match(shablon);
		  		
		  		if((matches))
		  			{
		  			need_analyse = mytime.toString().match(/(в \d{1,2} в \d{1,2})|(\d{1,2} \d{1,2}м)|(\d{1,2}ч\d{1,2}м)|(\d{1,2}ч \d{1,2}м)|(\d{1,2}:\d{1,2})/g);
		  			
		  			shablon1 = /(в \d{1,2}:\d{1,2})|(в\d{1,2}:\d{1,2})/g; 
		  			matches1 = mytime.toString().match(shablon1);
		  			if(matches1) need_analyse=false;
		  			
		  			
		  			if(!need_analyse)
		  			 	{
		  				mytime = mytime.toString().replace("в ","").replace("в","");
		  				if(!matches1) mytime += ":00";
		  				}
		  			else
		  				{
		  				matches3 = mytime.toString().match(/\d{1,4}/g); //все двух-значные цифры
		  				
		  				if(matches3)
		  					if(matches3.length==1) mytime = matches3;
		  					else mytime = matches3.join(":");
		  				}
		  			}
		  	
		  	}
		  	
		  	if(mytime!="") var add = "[" + mytime+"]";
		  	else var add="";
		  	
		  	if( (mytime!="") )
		  		{
		  		
		  		if(mytime.toString().match(/\d{1,2}:\d{1,2}/g))
		  			{
		  			newtime = mytime.toString().split(":");
		  			mydate.setHours(parseInt(newtime[0]),10 );
		  			mydate.setMinutes(parseInt(newtime[1],10) );
		  			mydate.setSeconds(0);
		  			}
		  		else
		  			{
		  			mytime = "";
		  			}
		  		
		  		}
		  	
		  	if(did) 
		  		{
		  		newdate.setHours( mydate.getHours() + parseInt(d.myhours,10) );
		  		newdate.setMinutes( mydate.getMinutes() + parseInt(d.myminutes,10) );
		  		newdate.setSeconds(0);
		  		mydate = newdate;
		  		}
		  	else
		  		{
		  		mydate.setHours( mydate.getHours() + parseInt(d.myhours,10) );
		  		mydate.setMinutes( mydate.getMinutes() + parseInt(d.myminutes,10) );
		  		mydate.setSeconds(0);
		  		}
		  	
		  	mydate.setDate( mydate.getDate() + parseInt(d.mydays,10) + parseInt(d.myweek*7,10));
		  	mydate.setMonth( mydate.getMonth() + parseInt(d.mymonth,10) );
		  	mydate.setYear( mydate.getFullYear() + parseInt(d.myyears,10) );
		  	
		  	shablon = /(понед)|(вторн)|(сред)|(четв)|(пятн)|(субб)|(воскр)/g; 
		  	matches = title.match(shablon);
		  	if(matches) {
		  		week = 0;
		  		if(matches[0]=="понед") week = 1;
		  		if(matches[0]=="вторн") week = 2;
		  		if(matches[0]=="сред") week = 3;
		  		if(matches[0]=="четв") week = 4;
		  		if(matches[0]=="пятн") week = 5;
		  		if(matches[0]=="субб") week = 6;
		  		if(matches[0]=="воскр") week = 7;
		  		if(week != 0) 
		  			{
		  			mydate = nextWeekDay(mydate,week);
		  			answer = matches[0];
		  			}
		  	}
		  	
		  	if((answer=="") && (mytime =="")) mydate = "";
		  	
		 	if(title.toLowerCase().indexOf("смс")!=-1 || 
		 	   title.toLowerCase().indexOf("sms")!=-1 || 
		 	   title.toLowerCase().indexOf("напомни")!=-1 ) {
		 	   		var remind_time_default = localStorage.getItem("remind_time");
		 	   		remind_time = remind_time_default?remind_time_default:15;		    
		 	   		add += " | <i class='icon-bell'></i> за "+remind_time+" м";
		 	   		var sms = " | <i class='icon-bell'></i> за "+remind_time+" м";
		 	} else {
			 	var sms = "";
		 	}
		 	
		 	
		  	
		  	
		  	return {title:answer+" "+add,date:mydate, sms:sms};
		  	} //jsParseDate
		  	
		  function nextWeekDay(date,day){ //поиск следующего дня недели
		  		(day = (Math.abs(+day || 0) % 7) - date.getDay()) < 0 && (day += 7);
		  		return day && date.setDate(date.getDate() + day), date;
		  };
		  	
		  //создаёт заметки на всю неделю
		  this.jsGetDateRangeOfWeek = function(weekNo) {
	  			weekNo = weekNo - 1;
      			var d1 = new Date();
      			var numOfdaysPastSinceLastMonday = eval(d1.getDay()- 1);
      			d1.setDate(d1.getDate() - numOfdaysPastSinceLastMonday);
      			var weekNoToday = d1.getWeek();
      			var weeksInTheFuture = eval( weekNo - weekNoToday );
      			var startDate = d1.setDate(d1.getDate() + eval( 7 * weeksInTheFuture ));
      			d1.setDate(d1.getDate() + 6);		
      			for(var ik=0; ik < 7; ik+=1) {
      				cur_date = d1.setDate( d1.getDate() + 1 );
      				console.info("d=", sqldate( cur_date ) );
      				api4tree.jsDiaryPath( cur_date , true );
      			}
		  			
		  }
		  
		  this.jsZoomTree = function(zoom_step) { //масштабируем шрифты в дереве
		  	var current_size = tree_font;
		  	tree_font = parseFloat(current_size) + parseFloat(zoom_step);
		  
		  	if(tree_font<0.4) tree_font = 0.4;
		  	if(tree_font>3) tree_font = 3;
		  	
		  	if(zoom_step == -1000) tree_font=0.95; //Alt + 0 - дефолтное значение
		  	if(zoom_step == -2000) //вспоминаю размер из кукиса
		  		{
		  		tree_font = localStorage.getItem('main_tree_font');			
		  		if(!tree_font) tree_font=0.95;
		  		}
			  		
		  		
		  
		  	$(".mypanel").css("font-size",tree_font+'em');
			if((zoom_step!=-2000) &&(isMindmap)) jsRepaint("Zoom");
		  	
		    localStorage.setItem('main_tree_font',tree_font);	
//		    onResize();		
		  
		  }
		  
		//выбирает случайную шутку для завршённой помидорки
		function jsJoke2() {
			var pomidor_text = [
					'добро пожаловать.',
					'здравствуйте.',
					'приветствуем.',
					'рады видеть вас.',
					'добрый день.'
					];

      	        var joke_id = parseInt(Math.random()*pomidor_text.length,10); 
      	        return pomidor_text[joke_id];
		}
		  
		  
		  this.jsMakeTheme = function() { //применяю тему, так как система оффлайн
		  
  			jsGetToken().done(function(token){

		  	  	  var lnk = web_site + "do.php?access_token=" + token + "&get_settings=true";
		  	  	  console.info(lnk);
		  	  	  $.getJSON(lnk, function(data,j,k) { //////////////A J A X/////////////////
				     if(j=="success") {
				     	var themes_div = "";
				     	
				     	if(data.welcome == 0) jsLoadWelcome();
				     	
				     	if(data.fio) {
					     	var name = data.fio.split(" ");
					     	data.fio = name[name.length-1];
				     	}
				     	
				     	jsTitle(data.fio+", "+jsJoke2(), 7000);
				     	
					 	/*$(".header_text").html(data.fio+", "+jsJoke2());
					 	setTimeout(function(){
						 	if($(".header_text").html().indexOf(", ")!=-1) $(".header_text").fadeOut(500,function(){
							 	$(this).html("").show();
						 	});
					 	}, 30000); */
				     	$.each(data.themes,function(i,el){
				     		if(el.active) {
					     		//$("html").attr("class","theme_"+el.dark).attr("style","background-image:url("+el.img+")");
				     		}
				     	});
				     }
				  });
		  	});
			  
		  }
		  
		  function jsConvertMySqlDate(the_date) {
  			        var split_date = the_date.split("-");
			        var split_time = split_date[2].split(" ");
			        var mydate = split_time[0] + "." + split_date[1] + "." + split_date[0];
			        var spl_time = split_time[1].split(":");
					return {date:mydate, time: (spl_time[0]+":"+spl_time[1]) };
		  }
		  		  
		  
		  this.jsSetSettings = function(id) {
			    	   
			    $(".makedone").attr("myid",id);
			    	   
			    api4tree.jsOpenTab(id);	   
			    
			    if( $(".makedone_page_2").is(":visible") ) {
			    	api4tree.jsStartShare(id); //приводит к постоянным запросам в сеть
			    }
			    	   			    		   
			    var element = api4tree.jsFind(id);
			    $(".makedone_h1").html(element.title).attr("old_title",element.title);
			    
			    var remind_time = localStorage.getItem("remind_time");
			    
			    if(remind_time) {
				   $("#remind_time").html(remind_time+" мин.")
			    }
			    
			    if(element.date1=="") { //устанавливаю дату в makedone
					$("#makedone_date1").val("");
					$("#makedone_time1").val("");
	    	    } else {
	    	    	mydate = jsConvertMySqlDate(element.date1);
			        $("#makedone_date1").val(mydate.date);
			        $("#makedone_time1").val(mydate.time);
			    }

			    if(element.date2=="") { //устанавливаю дату в makedone
					$("#makedone_date2").val("");
					$("#makedone_time2").val("");
	    	    } else {
	    	    	mydate = jsConvertMySqlDate(element.date2);
			        $("#makedone_date2").val(mydate.date);
			        $("#makedone_time2").val(mydate.time);
			    }

			  
			    if(element.did=="") { //устанавливаю переключатель выполнения дела
			       if($("#on_off_did").prop("checked")==true) {
			       		$("#on_off_did").prop("checked",false);
			       	}
			    } else {
			       if($("#on_off_did").prop("checked")==false) {
		     		   $("#on_off_did").prop("checked",true);
		     		   
			       }
			    }
			  
	       		if(element.remind>0) $("#remind_time").html(element.remind+" мин.");
	       		
			    if(parseInt(element.remind,10)==0) { //устанавливаю переключатель SMS напоминалки
			       if($("#on_off_sms").prop("checked")==true) {
						is_rendering_now = true;
			       		$("#on_off_sms").prop("checked",false).iphoneStyle("refresh");
				   		is_rendering_now = false;
		       	   }
			    } else {
			       if($("#on_off_sms").prop("checked")==false) {
						is_rendering_now = true;
		     		    $("#on_off_sms").prop("checked",true).iphoneStyle("refresh");
			 			is_rendering_now = false;
		     		    
			       }
			    }
			    
			    ///устанавливаем выбранные теги
			    api4tree.jsSetTagsCheckboxes(id);
			     
		        return false;
			 }; //jsSetSettings

		  
		  //кнопки панели дерева
		  function jsMakePanelKeys() {
		  
/*
		   	  $("#top_panel_header").on("click","i",function(){
		   	    var view_type = $(this).attr("data-view");
		   	    $(".top_panel").attr("class", view_type);
		   	    if(view_type=="panel_type1") {
			   	    isTree=true;
		   	    } else {
			   	    isTree=false;
		   	    }
		      	$("#tree_1 .mypanel").html("");
			  	api4panel.jsShowTreeNode("tree_1",1);
		      	onResize();
		   	    
		   	  	return false;
		   	  });
*/		  
		  
		   	  $(".tree_tab_menu").on("click","li",function(){
		   	  	var id = $(this).attr("myid");
		   	  	$(this).removeClass("temp");
		      	$(".tree_tab_menu").find(".active").removeClass("active");
		      	$(this).addClass("active");
				api4panel.jsOpenPath(id);
//				api4panel.jsSelectNode(id);
		      	return false;
		      });
		      
		      $(".tree_tab_menu").on("click", ".add_tab", function() {

				var text_of_do = "Новая заметка";
				var new_id = api4tree.jsAddDo( "to_new_folder", text_of_do, undefined, undefined, "last" ); 
		      	var new_tab = '<li myid="'+new_id.id+'"><a>Новая заметка</a><i class="icon-cancel"></i></li>';
			    $(".tree_tab_menu .add_tab").before(new_tab);
		      	$(".tree_tab_menu").find(".active").removeClass("active");
			    $(".tree_tab_menu li:last").addClass("active");
			    api4tree.jsCalcTabs();

				api4panel.jsOpenPath(new_id.id);


			    $(".makedone_h1").focus();
			    setTimeout(function(){
	    		  	document.execCommand('selectAll',false,null);				    
			    }, 100);


		      })

			  $("#close_all_tabs_except_current").on("click", function() {
				  $(".tree_tab_menu li:not(.active):not(.add_tab)").remove();
				  api4tree.jsCurrentOpenPanelsAndTabsSave();
			  });

		   	  $(".tree_tab_menu").on("click",".icon-cancel",function(){
		   	  	var next_li;
		   	  	var parent_li = $(this).parents("li:first");
		   	  	if(parent_li.hasClass("active")) {
			   	  	if(parent_li.next("li").length) {
			   	  		var next_li = parent_li.next("li");
			   	  	} else {
			   	  		var next_li = parent_li.prev("li");
			   	  	}
		   	  	}
		      	parent_li.animate({width:'toggle'},200,function(){
					$(this).remove();
					if(next_li) next_li.addClass("active");
					api4tree.jsCalcTabs();
					api4tree.jsCurrentOpenPanelsAndTabsSave();
		      	});
		      	return false;
		      });

		      $("#footer_horizont").on("click",function(){
		      	$("body").toggleClass("horizont_split");
		      	onResize();
				//api4tree.jsCurrentOpenPanelsAndTabsSave();
				return false;		      	
		      });
		      
		      $("body").on("click",".f_text", function() {
			      $(this).fadeOut(200);
			      return false;
		      });
		      
		      $(".tree_view_center").on("click",function(){
		      	$("body").toggleClass("params_hide");
		      	onResize();
				api4tree.jsCurrentOpenPanelsAndTabsSave();
				return false;		      	
		      });

		      $(".tree_view_left,.tree_footer .icon-left-open.left").on("click",function(){
		      	$("body").toggleClass("left_panel_hide");
		      	onResize();
				api4tree.jsCurrentOpenPanelsAndTabsSave();		      	
		      });
		      
		      $(".tree_view_right,.tree_footer .icon-left-open.right").on("click",function(){
		      	$("body").toggleClass("hide_right_panel");
		      	onResize();
				api4tree.jsCurrentOpenPanelsAndTabsSave();		      	
		      });
		      
		      $("#open_favorits").on("click",function(){
		      	$("#tree_right_panel").toggleClass("hide_ul");
     		    onResize();	
				api4tree.jsCurrentOpenPanelsAndTabsSave();		      	
		      });
		      
		      
		  
			  $("#tree_themes").on("click", ".theme_el", function(){
			  	var img = $(this).attr("style");
			  	var dark_class = $(this).attr("dark");
			  	$("#tree_themes .theme_selected").removeClass("theme_selected");
			  	$(this).addClass("theme_selected");
			  	$("html").attr("style",img).attr("class",dark_class);
			  	
			  });

		  	  $("#myslidemenu").on("click", "#show_settings", function(){
			  	  api4panel.jsCloseAllMenu();
			  	  
 	  			jsGetToken().done(function(token){

			  	  var loginform = '<b>Разрешить вход через соц.сервисы:</b>'+
			  	  				  '<script src="//ulogin.ru/js/ulogin.js"></script>'+
			  	  				  '<div id="uLogin" data-ulogin="display=small;'+
			  	  				  'fields=first_name,email;optional=photo,phone,bdate,sex,city,country,photo_big;'+
								  'providers=vkontakte,odnoklassniki,google,mailru,facebook,yandex,twitter;'+
			  	  				  'hidden=other;redirect_uri=https://4tree.ru/login.php?set_to_current_account_'+
			  	  				  token+
			  	  				  '"></div>';
			  	  			  	  
			  	  $("#tree_settings #login_social_form").html(loginform);
			  	  

		  	  	  var lnk = web_site + "do.php?access_token=" + token + "&get_settings=true";
		  	  	  console.info(lnk);
		  	  	  $.getJSON(lnk, function(data,j,k) { //////////////A J A X/////////////////
				     if(j=="success") {
				     	console.info(data);
				     	$("#tree_settings_form input[name=email1]").val( data.email1 );
				     	$("#tree_settings_form input[name=email2]").val( data.email2 );
				     	$("#tree_settings_form input[name=email3]").val( data.email3 );
				     	$("#tree_settings_form input[name=email4]").val( data.email4 );

				     	$("#tree_settings_form input[name=fio]").val( data.fio );
				     	$("#tree_settings_form input[name=mobilephone]").val( data.mobilephone );
				     	$("#tree_settings_form input[name=foto]").val( data.foto );
				     	if(data.female=="0") {
						 	$("#tree_settings_form input[value=male]").click();
				     	} else {
						 	$("#tree_settings_form input[value=female]").click();
				     	}
				     	
				     	var themes_div = "";
				     	$.each(data.themes,function(i,el){
				     		if(el.active) var active = " theme_selected";
				     		else var active = "";
				     		themes_div += "<div class='theme_el theme_"+el.dark+active+"' dark='theme_"+el.dark+"' style='background-image:url("+el.img+")' theme_img='"+el.img+"'><i>"+i+"</i></div>"
				     	});
					    $("#tree_themes").html(themes_div);

					 	$("#tree_settings").slideDown(900);
				     }
				  });
		  	  	  
		  	  	 });
			  	  return false;
		  	  });
		  	  
		  	  $("#remind_time").click(function(){
			  	 var val=prompt("За сколько минут прислать SMS?", 15);
			  	 val = parseInt(val);
			  	 if(val>=0 && val<1000) {
			  	 if(val==0) val=1;
				 $("#remind_time").html(val+" мин.");
				 localStorage.setItem("remind_time",val);
				 var checkboxnow = $("#on_off_sms");
				 var value = checkboxnow.nextAll(".iPhoneCheckLabelOn").width()>10
				 api4tree.jsChangeMakedoneCheckbox(checkboxnow, value);
				 
			  	 } else {
				  	 jsTitle("Недопустимое значение");
			  	 }
			  
		  	  });

		  	  $("#tree_settings").on("click", "#close_settings", function(){
				  $("#tree_settings").slideUp(500);
			  	  return false;
		  	  });

		  	  $("#tree_settings").on("click", "#send_settings", function(){
		  	  	  var params =  $("#tree_settings_form").serialize();
		  	  	  var sel = $("#tree_settings .theme_selected");
		  	  	  params += "&theme="+ encodeURIComponent(sel.attr("theme_img"))+"&dark="+sel.attr("dark");
		  	  	  
   			jsGetToken().done(function(token){

		  	  	  var lnk = web_site + "do.php?access_token=" + token + "&send_settings=true&"+params;
		  	  	  console.info(lnk);
		  	  	  $.getJSON(lnk, function(data,j,k) { //////////////A J A X/////////////////
				     if(j=="success") {
						$("#tree_settings").slideUp(200);
				     	jsTitle("Настройки успешно сохранены",10000);
				     	start_sync_when_idle = true;
				     }
				  });

  	  	    }); //jsGetToken
							  	  	  
			  	  return false;
		  	  });
		  		  
			  $("#tree_files_content").delegate(".one_foto,.files_list li","click", function () {
			  
			    var link = $(this).attr("link");
			    if(!link) link = $(this).find("a").attr("href");
			    
			    var link_short = link.substr(7,link.length-11); //чтобы найти любые размеры
				var ids = api4tree.jsFindIdByLink(link_short);
				console.info(link, ids)
				if(ids.length) {
					api4panel.jsOpenPath( ids[0].id, "divider_click" );
					var need_open = [];
					$.each(ids, function(i,el){ need_open.push(el.id) });
					api4editor.jsRedactorOpen(need_open);
					jsTitle("Фотография используется в заметках: "+ids.length+" раз(а)",10000);
					setTimeout(function(){ 
						var images = $(".redactor_box img[src*='"+link_short+"']:first");
						var links = $(".redactor_box a[href*='"+link_short+"']:first");

						var mytop = 0;
						if(links.length) mytop = links.offset().top;
						if(images.length) mytop = images.offset().top;
						var now_scroll = $(".redactor_box").scrollTop();

						if(images.length) $(".redactor_box").scrollTo(images,800,{offset:-100}); 
						if(links.length) {
							var myred = $(".redactor_box");
							$(".redactor_box").scrollTo(links,800,{offset:-(myred.height()/2)}); 
							$(".redactor_").highlight(links.html(),"highlight"); 
						}
					}, 800);
				} else {
					api4others.open_in_new_tab(link);
				}
			  	return false;
			  	});
		  	

			  $("body").delegate(".m_zoom_in","click", function () {
			  	var step = parseFloat(0.02);
			    api4tree.jsZoomTree(step);
			  	return false;
			  	});
			  
			  $("body").delegate(".m_zoom_out","click", function () {
			  	var step = parseFloat(-0.02);
			    api4tree.jsZoomTree(step);
			  	return false;
			  	});
			  
			  $("body").delegate(".m_zoom_default","click", function () {
			  	var step = parseFloat(-1000);
			    api4tree.jsZoomTree(step);
			  	return false;
			  	});

			 //джойстик управляет размером 3х окон и запускает синхронизацию
			 $('#resize_me_right').mousedown( function(e) {
			       e.preventDefault();
	       		   var move_t;
	       		   var parent_div_height = $("body").width();
			       $("body").mousemove(function(e) {
		     			  main_x_right = parent_div_height-e.pageX;//высота верхней панели в пикселях
			     		  onResize();	
			     	});
			   
			       $("body").mouseup( function() {
			         	$("body").unbind("mousemove");
			         	localStorage.setItem('main_x_right',main_x_right);	
			         	jsMakeDrop();		
			          	return false;
			       });
			  }); //mousedown


			 //джойстик управляет размером 3х окон и запускает синхронизацию
			 $('#resize_me1').mousedown( function(e) {
			       e.preventDefault();
	       		   var move_t;
	       		   var parent_div_height = $("#tree_center").offset().top;
			       $("body").mousemove(function(e) {
		     			  main_y_top = e.pageY - parent_div_height;//высота верхней панели в пикселях
			     		  onResize();	
			     	});
			   
			       $("body").mouseup( function() {
			         	$("body").unbind("mousemove");
			         	localStorage.setItem('main_y_top',main_y_top);	
			         	jsMakeDrop();		
			          	return false;
			       });
			  }); //mousedown

			 //джойстик управляет размером 3х окон и запускает синхронизацию
			 $('#resize_me2').mousedown( function(e) {
			       e.preventDefault();
	       		   var move_t;
	       		   var parent_div_height = $("body").height();
			       $("body").mousemove(function(e) {
		     			  main_y = parent_div_height - e.pageY;//высота верхней панели в пикселях
			     		  clearTimeout(move_t);
			     		  move_t = setTimeout(function(){
	   		      			  myjsPlumb2.setSuspendDrawing(false,true);
			     		  },20);
			     		  onResize();	
			     	});
			   
			       $("body").mouseup( function() {
			         	$("body").unbind("mousemove");
			         	localStorage.setItem('main_y',main_y);	
			         	jsMakeDrop();		
			          	return false;
			       });
			  }); //mousedown


			 //джойстик управляет размером 3х окон и запускает синхронизацию
			 $('.resize_me').mousedown( function(e) {
			       e.preventDefault();
			       last_sos_click = jsNow();
			       
			       if( e.pageY > ($(".sos").offset().top+21) ) {
			       	var may_vertical = false;
			       } else { 
			       	var may_vertical = true; //в каких направлениях ресайзить
			       }
			   
			       $('.bottom_left,.resize_me i').addClass('noselectable');
			   
	       		   var move_t;
			       $("body").mousemove(function(e) {
			     		  var w = $(document).width();
			     		  var neww = e.pageX-2;			  
			     		  if(may_vertical) {//меняю только горизонтальный размер
			     			var newy = e.pageY-$("#header").height()-15;
			     			main_y = newy;//высота верхней панели в пикселях
			     		  }
			     		  main_x = neww;
			     		  clearTimeout(move_t);
			     		  move_t = setTimeout(function(){
	   		      			  myjsPlumb2.setSuspendDrawing(false,true);
			     		  },20);
			     		  onResize();	
			     	});
			   
			       $("body").mouseup( function() {
			         	if(jsNow()-last_sos_click<200) { 
			     	     	console.info("sync_now");
			         		api4tree.jsSync();
			         	}
			         	
			         	$("body").unbind("mousemove");
			           $('.bottom_left,.resize_me i').removeClass('noselectable');
			       
			         	localStorage.setItem('main_x',main_x);			
			         	localStorage.setItem('main_y',main_y);	
			         	jsMakeDrop();		
			          	return false;
			       });
			
			
			  }); //mousedown
			   	    	  



			  //нажатие на кнопку вызова меню настройки элемента
			  $('.mypanel').delegate(".tcheckbox","click", function(e) {
/*			      var id = api4tree.node_to_id( $(this).parents("li:first").attr("id") );
			      var did = api4tree.jsFind(id).did;

			  	  if(!did) {
				  		api4tree.jsMakeDid(id);
				    } else {
				    	api4tree.jsMakeUnDid(id);
				    }*/
				   $(this).contextmenu();

/*			      api4panel.jsSelectNode(id);
			      setTimeout(function(){
				      api4editor.jsRedactorOpenRecursive(id); //открываем все заметки
			      }, 500);*/
			      return false;			   	 
			  });
			  
			  
			  //при случайном нажатии в разделитель между title в панели
			  $(".mypanel").delegate(".divider","click",function() {
			      return false;
		      });
			  
			  //при клике в дату дела или дату следующего действия
			  $(".mypanel").delegate(".makedate,.date1","click",function() {
			      if($(this).hasClass("fromchildren")) { //открываю следующее действие
			      	var id=$(this).attr("myid");
			      	api4panel.jsOpenPath(id);
			      } else {
			      	$(this).parent("li").find(".tcheckbox").click(); //открываю makedone
			      }
			      return false;		
			  });
			  
			  //клик в fullscreen
			  $("#main_window").delegate(".fullscreen_button","click",function() {
			      var panel = $(this).parent("div");
			      if(!panel.hasClass("fullscreen")) {
			      	panel.addClass("fullscreen");
			      	$(this).addClass("icon-resize-small");
			      } else {
			      	panel.removeClass("fullscreen");
			      	$(this).removeClass("icon-resize-small");
			      }
			      onResize();
			      return false;
			  });
			  
			  //закрываю всё, если клик в экран
			  $("#wrap").bind("click",function() {   
			      if(jsNow() - last_input_click > 50) {
			      		$("input.active").removeClass("active");
				  		$(".header_text").html("").attr("title","");
			      }
//			      $(".makedone,.makedone_arrow,.makedone_arrow2").slideUp(100);
			      jsTitle("");
			      return true;
			  } );  	
			  
			  $("body").delegate(".all_screen_click","click", function () {
			  	  api4panel.jsCloseAllMenu();
				  return false;
			  });
			  
			  
		  }
		  
		  //все перетаскиваемые элементы
		  function jsMakeDraggable() {
			$("#test-div").draggable({appendTo: "body"});
			$(".chat_box").draggable({appendTo: "body", handle: ".chat_header"});
//			$(".one_book").draggable();
		 }    
		 
		 
		 
		 var old_title_of_screensaver, time_timer;
		 this.jsScreenSaver = function(is_on) {		 	 
			 if(is_on) {
			 	function jsSetTheTime() {
					var now_time = (new Date());
			  	  	var time1 = twoDigits(now_time.getHours())+":"+twoDigits(now_time.getMinutes());
					$(".screen_saver_icon").html(time1);					 	
			 	}
//				$("#tree_left_panel").addClass("blur");
//				$("#tree_editor").addClass("blur");
//				$("body").append('<div class="screen_saver_icon"></div>');
//				jsSetTheTime();
				time_timer = setInterval(function(){
//					jsSetTheTime();
				},30000);
//				old_title_of_screensaver = window.document.title;
//				window.document.title = "4tree.ru - Screensaver...";
				api4tree.js_Compare_md5_local_vs_server();
			 } else {
//				$("#tree_left_panel").removeClass("blur");
//				$("#tree_editor").removeClass("blur");
//				$(".screen_saver_icon").remove();
				clearInterval(time_timer);
//				if(old_title_of_screensaver) window.document.title = old_title_of_screensaver;
			 }
		 }
		 
		  //функция запуска при бездействии пользователя ЖОПА//
		  this_db.jsMakeIdleFunction = function() {

		  setInterval(function(){
		  	jsSetTimeNow();
		  },30000);

			$.idleTimer(5*1000);
			
			window.onblur = function(){
				$("#hotkeyhelper").hide();			
			};

			
			$(document).bind("active.idleTimer", function(){
				jsSetTimeNow();
				clearTimeout(screensaver_tm);
				this_db.jsScreenSaver(false);
			});
			$(document).bind("idle.idleTimer", function(){
				jsSetTimeNow();
				screensaver_tm = setTimeout(function(){
					this_db.jsScreenSaver(true);
				}, 20*60*1000);
			    if(start_sync_when_idle) { this_db.jsSync(only_save); only_save=false; }
			});
		  }
		  
		  //кнопки чата
		  function jsMakeChatKeys() {
		  	$("body").delegate(".chat_box","click",function(e){
			    $(".chat_box").css("z-index",50);
			    $(this).css("z-index",51);
			  	});
			
			$("body").delegate(".chat_close","click",function(e){
			    var chat_box = $(this).parents(".chat_box:first");
			    chat_box.remove();		
			    return false;
			    });
			
			$("body").delegate(".chat_fullscreen","click",function(e){
			    var chat_box = $(this).parents(".chat_box:first");
			    if(!chat_box.hasClass("fullscreen")) chat_box.addClass("fullscreen");		
			    else chat_box.removeClass("fullscreen");		
			    return false;
			    });
			
			$("body").delegate(".chat_header","click",function(e){
			    var chat_box = $(this).parent(".chat_box");
			    if(chat_box.height()<30) 
			    	{
			    	chat_box.height( $(".chat_box[user_id=template]").height() );
			    	chat_box.find(".chat_inner").show();
			    	}
			    else 
			    	{
			    	chat_box.height( $(".chat_box[user_id=template]").find(".chat_header").height() );
			    	chat_box.find(".chat_inner").hide();
			    	}
			    return false;
			});
			
			$("body").delegate(".chat_send_button","click",function(){ //добавляю сообщение в чат
			    var to_user_id = $(this).parents(".chat_box:first").attr("user_id");
			    var text = $(this).parents(".chat_box:first").find(".redactor_editor").redactor("get");
			    api4tree.jsAddComment("chat_"+main_user_id+"_"+to_user_id,-1,text);
			
			    myhtml="";
			 	var chat_html = jsShowChatHistory( "chat_"+main_user_id+"_"+to_user_id );
			 	$(this).parents(".chat_box:first").find(".chat_content").html(chat_html);
			 	$(this).parents(".chat_box:first").find(".chat_content").scrollTop(1234567890);
			
			    return false;
			});
			

		  }
		  
		  //кнопки боковых панелей
		  function jsMakeSidePanelsKeys() {

			
			$('body').on("click","#left_panel_opener1",function(){
			    if($("#left_panel").css("width") != "0px") {
			    	$("#left_panel").animate({"width":"0"},200,function(){ $(this).hide(); });
			    	$("#main_window").animate({"left":"0"},200);
			    	$("#left_panel_opener").animate({"left":"0"},200);
			    	$("#search_panel").animate({"left":"16"},200, function(){ 
			    				$("#left_panel_opener .icon-left-open").attr("class","icon-right-open");
			    				onResize();
			    				});
			    	console.info("closed_left_panel");
			    } else {
			    	$("#left_panel").css({"width":"0"}).show().animate({"width":"150"},300);
			    	$("#left_panel_opener").animate({"left":"150"},300);
			    	$("#main_window").animate({"left":"150"},300);
			    	$("#search_panel").animate({"left":"50"},300, 
			    		function(){ 
			    				$("#left_panel_opener .icon-right-open").attr("class","icon-left-open");
			    				onResize();
			    				});
			    	console.info("opened_left_panel");
			    }
			    return false;
			});
			
			$('#content1').on("click","#right_panel_opener1",function(){
			    var right_width = 50;
			    if($("#right_panel").css("width") != "0px") {
			    	$("#right_panel").animate({"width":"0"},200,function(){ $(this).hide(); });
			    	$("#main_window").animate({"right":"0"},200);
			    	$("#right_panel_opener").animate({"right":"0"},200);
			    	localStorage.setItem("s_right_open",0);
			    	$("#search_panel").animate({"left":"16"},200, function(){ 
			    				$("#left_panel_opener .icon-left-open").attr("class","icon-right-open");
			    				onResize();
			    				});
			    	console.info("closed_left_panel");
			    } else {
			    	$("#right_panel").css({"width":"0"}).show().animate({"width":right_width},300);
			    	$("#right_panel_opener").animate({"right":right_width},300);
			    	$("#main_window").animate({"right":right_width},300);
			    	localStorage.setItem("s_right_open",1);
			    	$("#search_panel").animate({"left":"166"},300, 
			    		function(){ 
			    				$("#left_panel_opener .icon-right-open").attr("class","icon-left-open");
			    				onResize();
			    				});
			    	console.info("opened_left_panel");
			    }
			    return false;
			});
			//открываю панель, если она раньше была открыта
			if(localStorage.getItem("s_right_open")==1) $("#right_panel_opener").click();
		  }
		  
		  function jsAddIcons() {
			  var icons = [], html = "";
			  icons[0] = ["progress-0","progress-1","progress-2","progress-3","dot","dot-2","dot-3","star-empty","star","record"];
			  icons[1] = ["check","heart-empty","heart","bookmark-empty","bookmark","ok-2","help","wallet","mail-2","cloud"];
			  icons[2] = ["tree","chat-2","article-alt","volume","flash","aperture-alt","layers","steering-wheel","skiing","flight"];
			  icons[3] = ["lock-open","lock","umbrella","camera","book-open","clock-1","plus","minus","trash","music"];
			  icons[4] = ["calculator","address","pin","vcard","basket-1","swimming","youtube","leaf","mic","target"];
			  icons[5] = ["monitor","phone","download","bell","at","pause","play","stop-1","flag","key"];
			  icons[6] = ["users-1","eye","inbox","brush","moon","college","fast-food","coffee","top-list","bag"];
			  icons[7] = ["chart-area","info","home-1","hourglass","attention","scissors","tint","guidedog","archive","flow-line"];
			  icons[8] = ["emo-grin","emo-happy","emo-wink","emo-sunglasses","emo-thumbsup","emo-sleep","emo-unhappy","emo-devil","emo-surprised","emo-tongue"];
			  icons[9] = ["plus","minus","keyboard","fast-fw","to-end","to-start","cancel-circle","check","flash","feather"];
			  icons[10] = ["plus-circle","pencil-alt","target-1","chart-pie","adjust","user-add","volume","install","flow-cascade","sitemap"];
			  icons[11] = ["minus-circle","clock-1","light-down","light-up","lamp","upload","picture-2","dollar","gift","link-1"];

			  $.each(icons, function(j, icons_row ) {
				  $.each(icons_row, function(i, icon) {
					  html += "<i class='icon-"+icon+"'></i>";
				  });
				  html += "<div class='gradient_line'></div>";
			  });
  		  	  $("#icons_and_colors").html(html);
  		  	 
		  }
		  
		  //кнопки в меню элемента
		  this.jsMakeMakedoneKeys = function() {
		  
			  jsAddIcons();		  
		  
			  $("#left_calendar").datepicker({
			    	numberOfMonths: 1,
			    	showButtonPanel: false,
			    	dateFormat:"dd.mm.yy",
			    	showWeek:true,
			    	selectOtherMonths:true,
			    	showOtherMonths:true,
			    	beforeShowDay : function(date) {
			    	  var highlight_class = "ui-has-note";
			    	  var finddate = api4tree.jsDiaryFindDateDate(date);
			    	  if( finddate[0] ) highlight_class = 'ui-has-note';
			    	  else highlight_class = "";
			    	  
			    	  return [true, highlight_class, finddate[1]];
			    	},
			    	onSelect:function(dateText, inst) {
			    		var selected_date = $("#left_calendar").datepicker('getDate');
			    		api4tree.jsDiaryPath(selected_date);
			    	}
			  });					  

		  	  //календарик для makedone
		  	  //this_db.jsGetAllMyNotes();
		  	  
		  	  
		  	  function jsGetTime(field_num) {
			  	  var date1 = $("#makedone_date"+field_num).val();
			  	  var time1 = $("#makedone_time"+field_num).val();
			  	  var delta_minutes = 30;
			  	  			  	  
			  	  if(date1) {
			  	  	  var now_time = (new Date());
					  if(field_num == 2) {
						  delta_minutes = 60;
						  time_field1 = $("#makedone_time1").val();
						  if(time_field1 && time_field1!="00:00") { 
						  	var tf = time_field1.split(":");
						  	now_time = new Date();
						  	now_time.setHours(tf[0]);
						  	now_time.setMinutes(tf[1]);
						  }
					  }
			  	  	  var now_time = new Date(now_time.getTime() + delta_minutes*60000);
			  	  	  alert(time1);
				  	  if(!time1 && time1!="00:00") {
				  	  	time1 = twoDigits(now_time.getHours())+":"+twoDigits(now_time.getMinutes());
				  	  	$("#makedone_time"+field_num).val(time1);
				  	  }
				  	  if( (field_num == 1) && ($("#makedone_date2").val()=="") ) { //если первая дата есть, а второй нет
					  	$("#makedone_date2").val(date1);
				  	  }
				  	  return { date:date1, time:time1 };
				  } else {
					  return { date:"", time:"" };
				  }
				  

		  	  }
		  	  
		  	  this_db.js_add_dif = function(d1,dif) {
		  	  	d1_split = d1.split(".");
		  	  	
			  	date1 = new Date();
			  	date1.setDate (parseInt(d1_split[0]));
			  	date1.setMonth(parseInt(d1_split[1])-1);
			  	date1.setYear (parseInt(d1_split[2]));
			  	
			  	var date2 = date1.getTime() + dif;
			  			  	
			  	date2 = new Date(date2);		  	
			  			  	
			  	return twoDigits(date2.getDate())+"."+twoDigits(date2.getMonth()+1)+"."+date2.getFullYear();		  	  	
			  }
			  
		  	  this_db.js_days_between = function(d1,d2) {
			  	if(!d1 || !d2) return 0;
				var date1 = Date.createFromMysql(d1);			  	
				var date2 = Date.createFromMysql(d2);			  	
			  	var dif = date2.getTime() - date1.getTime();
			  	
			  	if(!dif || dif<0) dif=0;
			  	
			  	return dif;

		  	  }	  	  
		  	  	
		  	  function jsNeedDate(d1, t1) {
		  	  	if(!d1) return "";
		  	  	if(!t1) t1 = "00:00";
		  	  
		  	  	d1_split = d1.match(/(\d+)/g);
		  	  	t1_split = t1.match(/(\d+)/g);
		  	  	
		  	  	if(d1_split.length<3) return "";
		  	  	if(t1_split.length<2) t1_split = ["00","00"];
		  	  	
			  	date1 = new Date();
			  	date1.setDate (parseInt(d1_split[0]));
			  	date1.setMonth(parseInt(d1_split[1])-1);
			  	date1.setYear (parseInt(d1_split[2]));

			  	date1.setHours  (parseInt(t1_split[0]));
			  	date1.setMinutes(parseInt(t1_split[1]));
			  	date1.setSeconds(0);
			  	
			  	return sqldate(date1.getTime());
			  	  
		  	  }	  	  
		  	  
		  	  function jsSaveSettings(date_id) {
				  	  
			  	  var d1 = $("#makedone_date1").val();
			  	  var t1 = $("#makedone_time1").val();
			  	  var d2 = $("#makedone_date2").val();
			  	  var t2 = $("#makedone_time2").val();
			  	  
			  	  var id = $(".makedone").attr("myid");

				  var element = api4tree.jsFind( id );
			  	  
			  	  var date_dif = api4tree.js_days_between(element.date1, element.date2);
			  	  //alert(date_dif + " : " + api4tree.js_add_dif(d1, date_dif) );
			  	  
			  	  if(d2 && date_id==1) {
			  	  	  var new_date2 = api4tree.js_add_dif(d1, date_dif);
				  	  $("#makedone_date2").val( new_date2 );
				  	  d2 = new_date2;
			  	  }
				  
				  var date_sql1 = jsNeedDate(d1, t1);
				  var date_sql2 = jsNeedDate(d2, t2);
				  
				  console.info(id, {date1: date_sql1, date2: date_sql2});
				  api4tree.jsFind(id, {date1: date_sql1, date2: date_sql2});
				  jsRefreshTree();
				  	  
		  	  }
		  	  
		  	  $("#makedone_time1").on("change",function(){
			  	 jsSaveSettings(1); 
		  	  });

		  	  $("#makedone_time2").on("change",function(){
			  	 jsSaveSettings(2); 
		  	  });
		  	  
		  	  $("#clear_dates").on("click", function() {
			  	 $("#makedone_date1,#makedone_date2,#makedone_time1,#makedone_time2").val("");
			  	 jsSaveSettings(1);
		  	  });

		  	  $("#clear_times").on("click", function() {
			  	 if( $("#makedone_date1").val() ) $("#makedone_time1").val("00:00");
			  	 if( $("#makedone_date2").val() ) $("#makedone_time2").val("00:00");
			  	 jsSaveSettings(1);
		  	  });
		  	  
			  $("#makedone_date1,#makedone_date2").datepicker({
			    	numberOfMonths: 1,
			    	showButtonPanel: true,
			    	dateFormat:"dd.mm.yy",
			    	showWeek:true,
			    	
			    	beforeShowDay : function(date) {
			    	  var highlight_class = "ui-has-note";
			    	  var finddate = api4tree.jsDiaryFindDateDate(date);
			    	  if( finddate[0] ) highlight_class = 'ui-has-note';
			    	  else highlight_class = "";
			    	  
			    	  return [true, highlight_class, finddate[1]];
			    	},
			    	onSelect:function(dateText, inst) {
						if( ($(inst).attr("id")=="makedone_date1") )  {
							jsSaveSettings(1);
						}
						if( ($(inst).attr("id")=="makedone_date2") )  {
							jsSaveSettings(2);
						}
			    	}
			  });			

			  
			  $(".makedone_page_3").on("click","#clear_all_icons",function(){
			      var id = $(".makedone").attr("myid");
			      var title = api4tree.jsFind(id).title;
			      title = strip_tags(title).trim();
			      if(id) { 
			      	api4tree.jsFind(id, {title:title}); jsRefreshTree(); 
			      	$(".tree_tab_menu li[myid='"+id+"'] a").html(title);
				  	api4panel.jsPathTitle(id); //устанавливаем путь в шапку
			      }			  	
			  });
		  	  //иконки для заголовка элемента
			  $("#icons_and_colors").on("click","i",function(){
			      var fav = $(this).attr("class");
			      var id = $(".makedone").attr("myid");
			      var title = api4tree.jsFind(id).title;
			      title = strip_tags(title).trim();
			      title = "<i class='"+fav+"'></i> "+title;
			      if(id && fav) { 
			      	api4tree.jsFind(id, {title:title}); jsRefreshTree(); 
			      	$(".tree_tab_menu li[myid='"+id+"'] a").html(title);
				  	api4panel.jsPathTitle(id); //устанавливаем путь в шапку
			 		api4tree.jsSetSettings(id);
			      }
			      console.info("icon=",fav,id);
			      return false;
			  });
			  
			  //цвет правого квадратика рядом с делом
			  $(".makedone_page_3").on("click",".fav_color",function(){
				 	var fav = $(this).attr("fav");
				 	var id = $(".makedone").attr("myid");
				 	if(id) { api4tree.jsFind(id, {fav:fav}); jsRefreshTree(); }
				 	console.info(fav,id);
				 	return false;
			  });
			  
			  //запуск редактора карт ума
			  $("#root-menu-div").on("click",".show_mindmap",function(){
			      var id = $(".makedone").attr("myid");
			      var href = "http://4tree.ru/mm.php?mindmap="+id;
			      api4others.open_in_new_tab(href);
			      return false;
			  });
			  
			  //кнопка отправки электронной почты
			  $(".send_mail_form").on("click","#send_mail",function(){
			      var mytitle = $("#title_enter").val();
			      var mailto = $("#email_enter").val();
			      api4editor.jsSendMail(mytitle, mailto);
			      $(".all_screen_click").click();
			      return false;
			  });
			  
			  //поле ввода адреса электронной почты
			  $(".send_mail_form").on("keyup","#email_enter",function(){
			      localStorage.setItem("mylastmail", $(this).val());
			      return false;
			  });
			  
			  //отправить по почте
			  $("#myslidemenu").on("click",".send_by_mail",function(){
			      $(".all_screen_click").remove();
			      $("#wrap").append("<div class='all_screen_click'></div>");
			  
			      var mytitle = $(".tree_active .selected .n_title").html();
			      $("#title_enter").val(mytitle);
			  
			      var lastmail = localStorage.getItem("mylastmail");
			      if(!lastmail) lastmail = "4tree@4tree.ru";
			      $("#email_enter").val(lastmail);
			  
			      $(".send_mail_form").slideDown(200);
			      return false;
			  });
			  
			  //статистика посещений короткой ссылки
		  	  $('#makesharestat_count').delegate("b","click", function () {
			    	$('#makesharestat').slideToggle(200);
			  	    return false;
			  });

			  //удаление элемента
			  $("#params_header").delegate(".makedel","click", function () {
			  	   var id = $(".makedone").attr("myid");
			       var title = api4tree.jsFind(id).title;
			       var id_element = $(".tree_active.mypanel #node_"+id);
			       
			       var childrens = api4tree.jsFindByParent(id,true).length;
			       if(childrens > 0) {
			       		var child_text = "\r\rСодержимое папки ("+childrens+" шт.), тоже будет удалено.";
			       } else {
			       		var child_text = "";
			       }
			       
			      if(id) {
			        if (confirm('Удалить "'+title+'" ?'+child_text)) { 
			       		this_db.jsDeleteDo( id_element ); 
			        } else {
			        return false;
			        }
			      }
//			     $(".makedone,.makedone_arrow,.makedone_arrow2").slideUp(100);
			     return false;
			     });

			  
		  }

		  this.jsDelComment = function(comment_id) {
		  	var d = $.Deferred();
		  	if(api4tree.jsFindByParentCommentFast(comment_id).length>0) 
		  		{
		  		var dfd = api4tree.jsFindComment(comment_id,{text:
		  										"<font color='lightgray'>комментарий удалён</font>"});
		  		dfd.done(function(){ d.resolve(); });
		  		}
		  	else
		  		{
		  		var dfd = api4tree.jsFindComment(comment_id,{del:1});
		  		dfd.done(function(){ 
		  			d.resolve(); 
		  		});
		  		}
		  	return d.promise();
		  }

		  
		  //кнопки для комментариев
		  function jsMakeCommentKeys() {
			  $("#tree_news").delegate(".comment_box","click",function(){
			      var comment_id = $(this).attr("id");
			      if(comment_id) comment_id = comment_id.replace("comment_","");
			      api4tree.jsFindComment(comment_id).done(function(el){
			      		api4panel.jsOpenPath( el.tree_id );
			      		setTimeout(function(){
			      			$(".redactor_box:first #comment_"+el.id).addClass("highlight");
			      			$(".redactor_box:first").scrollTo( $("#comment_"+el.id), 800, function(){
			      			  setTimeout(function(){ $(".redactor_box:first #comment_"+el.id).removeClass("highlight"); },1000);
			      			} );
			      		},500);

			      });
			      
			      return false;
			      });
			  
			  $("#tree_comments").delegate(".comment_reply","click",function(){
			      $(this).parents(".comment_box:first").append( $("#comment_enter") );
			      onResize();
			      $(".comment_enter_input").focus();
			      return false;
			      });
			      
			  $("#tree_comments").delegate(".comment_del","click",function(){
				  var id = api4tree.node_to_id( $(".tree_active .selected").attr('id') );
			      if (!confirm('Удалить комментарий?')) return false;
			      $(".comment_edit_now").removeClass("comment_edit_now");
			      $("#comment_enter_place").append( $("#comment_enter") );
			      var comment_id = $(this).parents(".comment_box:first").attr("id");
			      if(comment_id) comment_id = comment_id.replace("comment_","");
			      if(!comment_id) return false;
			      api4tree.jsDelComment( comment_id ).done(function(){
   		  			  api4tree.jsUpdateCommentsCnt(id);
				      api4tree.jsShowAllComments(id);
				      jsRefreshTree();
					  onResize();
			      });
			      return false;
			      });
			  
			  $("#tree_comments").delegate(".comment_edit","click",function(){
			      $(this).parents(".comment_box:first").append( $("#comment_enter") );
			      $(".comment_edit_now").removeClass("comment_edit_now");
			      $(this).parents(".comment_box:first").addClass("comment_edit_now");
			      var comment_id = $(this).parents(".comment_box:first").attr("id");
			      if(comment_id) comment_id = comment_id.replace("comment_","");
			      if(!comment_id) return false;
			      api4tree.jsFindComment(comment_id).done(function(this_comment){
				      $(".comment_enter_input").redactor("set", this_comment.text);
					  onResize();
			      });
			      return false;
			      });
			      
			 $('#comment_enter').delegate(".comment_send_button","click",function(){
			 	 var dfdArray = [];
			     var id = api4tree.node_to_id( $(".tree_active .selected").attr('id') );
			     if( (!id) ) return false;
			     var txt = $(".comment_enter_input").redactor("get");
			     if(txt=="")	
			     	{
			     	if($(".comment_enter_input").html()=="") return false;
			     	else txt = $(".comment_enter_input").redactor("get");
			     	}
			     
		    	 if($(".comment_edit_now").length) {
   	         		var comment_id = $(".comment_edit_now").attr("id");
   	         		if(comment_id) comment_id = comment_id.replace("comment_","");
   	         		console.info(comment_id,{text:txt});
   	         		var dfd = api4tree.jsFindComment(comment_id,{text:txt}).done(function(){
   		         		console.info("Текст обновлён");
   	         		});
   	         		dfdArray.push( dfd );
    	    	 } else {
   	         		var comment_id = $(this).parents(".comment_box:first").attr("id");
   	         		if(comment_id) comment_id = comment_id.replace("comment_","");
   	         		else comment_id = 0;
   	         		api4tree.jsAddComment( id , comment_id, txt );
    	         }
			        	
				 $.when.apply( null, dfdArray ).then( function(x){ 
				     $("#comment_enter_place").append( $("#comment_enter") );
				     $(".comment_enter_input").redactor("set", "");
				     if(comment_id!=0) var old_scroll = $("#tree_comments_container").scrollTop();
				     api4tree.jsShowAllComments(id);
				     if(comment_id==0) $("#tree_comments_container").scrollTop(99999999);
				     else $("#tree_comments_container").scrollTop(old_scroll);
				     $(".comment_enter_input").focus();
				     api4tree.jsSync("save_only");
				 });
			     return false;
			 });
			 
			 $('.comment_box').delegate(".comment_like","click",function(){
			     var id = $(this).attr("id").replace("");
			     if(!id) return false;
			     api4tree.jsAddComment( id , 0, $(".comment_enter_input").html() );
			     $(".comment_enter_input").html("");
			     api4tree.jsShowAllComments(id);
			     return false;
			 });
			 
			 var rt;
			 $("body").delegate(".comment_enter_input","keydown",function(event){
			     //console.info(event.keyCode, event);
			     if( (event.keyCode == 13) && ( event.altKey || event.ctrlKey || event.metaKey ) ) {
			     	event.preventDefault();
			     	$(".comment_send_button").click();
	    	 	 }
			     return true;
			 });
			      
		  
		  }
		  
		  var save_panels_timer;
		  this.jsCurrentOpenPanelsAndTabsSave = function() {
		  	  clearTimeout(save_panels_timer);
		  	  save_panels_timer = setTimeout(function(){
		  	  var to_save = {};
			  to_save.makedone = (v=$(".makedone_header li.active").attr("myid"))?v:false;
			  to_save.calendar_buttons = (v=$(".tree_footer_menu2 li.active").attr("id"))?v:false;

			  to_save.is_left_open = !( $("body").hasClass("left_panel_hide") );
			  to_save.is_show_pomidors = $("#tree_left_panel").hasClass("show_pomidors");
			  to_save.is_show_top_tree = $("body").hasClass("params_hide");
			  to_save.is_show_right_panel = !$("body").hasClass("hide_right_panel");

			  to_save.top_tabs = [];
			  $("#tree_header .tree_tab_menu li:not(.temp)").each(function(i,el) {
				  to_save.top_tabs.push( {myid: $(this).attr("myid"), title: $(this).html(), active: $(this).hasClass("active") });
			  });
			  var answer = JSON.stringify(to_save);
			  localStorage.setItem("users_opened_panels", answer);
			  //setTimeout(function(){ onResize(); }, 500);
//			  console.info( answer );
			  }, 800);
		  }

		  this.jsCurrentOpenPanelsAndTabsRestore = function() {
			  var to_load = localStorage.getItem("users_opened_panels");
			  if(to_load) {
				  to_load = JSON.parse(to_load);
				  console.info(to_load);
				  if(to_load.makedone) {
				  		$(".makedone_header li[myid='"+to_load.makedone+"']").click();
				  }
				  if(to_load.calendar_buttons) {
				  		$(".tree_footer_menu2 li#"+to_load.calendar_buttons).click();
				  }
				  if(!to_load.is_left_open) {
				  		$("body").addClass("left_panel_hide");
				  }
				  if(to_load.is_show_pomidors) {
				  		$("#tree_left_panel").addClass("show_pomidors");
				  }
				  if(to_load.is_show_top_tree) {
				  		$("body").addClass("params_hide");
				  } else {
				  		$("body").removeClass("params_hide");
				  }
				  if(!to_load.is_show_right_panel) {
				  		$("body").addClass("hide_right_panel");
				  } else {
				  		$("body").removeClass("hide_right_panel");
				  }
				  
				  $.each(to_load.top_tabs, function(i, el){
					  api4tree.jsOpenTab(el.myid );
					  $("#tree_header .temp").removeClass("temp");
				  });
				  
			  }
			  
		  }
		  
		  //кнопки табов под редактором и календарём
		  function jsMakeFavTabsKeys() {
		  
			  $('.makedone_header').delegate("li","click",function() {
			  	var page_id = $(this).attr("myid");
			  	if( $(this).hasClass("active") ) {
					$('.makedone_pages .page').slideUp(100);  	
				  	$(this).removeClass("active");
			  	} else {
				  	var is_visible = $('.makedone_pages .page:visible').length;
				  	$('.makedone_pages .page').hide();
				  	if(!is_visible)	{ 
				  		$("."+page_id).slideDown(100);
				  	} else {
					  	$("."+page_id).show();
				  	}
				  	$(".makedone_header .active").removeClass("active");
				  	$(this).addClass("active");
  				    if( $(".makedone_page_2").is(":visible") ) {
			    		api4tree.jsStartShare( $(".makedone").attr("myid") ); //приводит к постоянным запросам в сеть
			    	}
			    }
				api4tree.jsCurrentOpenPanelsAndTabsSave();
			  	return false;
			  });
			  
		  
			  $('#files_header').delegate("li","click",function() {
			      $('#files_header .active').removeClass("active");
			      $(this).addClass("active");
			      var mytype = $(this).attr("mytype");
 			      api4others.jsShowFiles(mytype);
 				  return false;
		      });

			  //клик в табы дерева - переключают режим отображения
			  /*
			  $('#fav_mypanel').delegate("li","click",function() {
			  	  if($(this).attr("myid")) return true;
			      $('#fav_mypanel .active').removeClass("active");
			      $(this).addClass("active");
			      var tab_name = $(this).attr("id");

			      if( tab_name == "tree_view_panels" ) {
				  	isMindmap = false;
				  	isTree = false;
			      	$(".top_panel").attr("class","panel_type3");
			      	$(".mypanel").html("");
				  	api4panel.jsShowTreeNode(1);
			      	onResize();
			      } else if( tab_name == "tree_view_tree" ) {
				  	isMindmap = false;
				  	isTree = true;
			      	$(".top_panel").attr("class","panel_type1");
			      	$(".mypanel").html("");
				  	api4panel.jsShowTreeNode(1);
			      	$("#panel_1").nextAll(".panel").remove();
			      	onResize();
			      } else if( tab_name == "tree_view_mindmap" ) {
				  	isMindmap = true;
				  	isTree = true;
			      	$(".top_panel").attr("class","panel_type1 mindmap");
			      	$(".mypanel").html("");
				  	api4panel.jsShowTreeNode(1);
			      }
			  });
			  */

		  	  //клик в табы под календарем
			  $('#fav_calendar,.favorit_menu,.tree_footer_menu2').delegate("li","click",function() {
			  	  if($(this).attr("myid")) return true;
			  	  var old_selected = $('.tree_footer_menu2 .active').attr("id");
			  	  var new_selected = $(this).attr("id");
			      $('.tree_footer_menu2 .active').removeClass("active");
			      if( (old_selected == new_selected) || !$("#tree_editor").hasClass("bottom_open")) {
					    $("#tree_editor").toggleClass("bottom_open").toggleClass("bottom_open_no");  
			      } 
			      if( $("#tree_editor").hasClass("bottom_open") ) { 
			      	$(this).addClass("active");
			      }
			      var tab_name = $(this).attr("id");

			      if( tab_name == "tab_calendar" ) {
			      	$("#calendar").show();
			      	onResize();
			      } else {
			      	$("#calendar").hide();
			      }
			  
			      if( tab_name == "tab_find" ) {
			      	$("#search_filter").addClass("active").focus();			      	
			      	$(".search_panel_result").show();
		      	  } else {
			      	$("#search_filter").removeClass("active");
			      	$(".search_panel_result").hide();
			      }

			      if( tab_name == "tab_files" ) {
				    var mytype = $("#files_header .active").attr("mytype");
	 			    api4others.jsShowFiles(mytype);
			        
			      	$("#tree_files_panel").show();
		      	  } else {
			      	$("#tree_files_panel").hide();
			      }
			  
			      if( tab_name == "tab_news" ) {
			      	$("#tree_news").show();
			      	api4tree.jsShowNews(0);
			      } else {
			      	$("#tree_news").hide();
			      }
				  api4tree.jsCurrentOpenPanelsAndTabsSave();
			      return false;
			 });
			  
			 //клик в табы избранных заметок дерева
			 $('.basket_panel, #fav_tabs, #fav_tabs+ .favorit_menu, .tree_history,' + 			
			   '.search_panel_result,.go_to_li_menu,#right_fav_folders').delegate("li","click", function() {
			     api4panel.jsOpenPath( $(this).attr("myid") );
			     setTimeout(function(){ 
			     	jsHighlightText(); 
			     	var myred = $(".redactor_box");
			     	var highlighted = myred.find(".highlight:first");
					if(highlighted.length) myred.scrollTo(highlighted,700,{offset:-(myred.height()/2)}); 
			     	
			     },1000);
			     return false;
			 });
			  
			 //клик в табы под редактором
			 $('#fav_red,#fav_red_mini').delegate("li","click", function() {
			     var id = $(this).attr("myid");
			     api4panel.jsOpenPath( id, 'fav_red' );
			     return false;
			 });
			 
			 //клик в список табов, которые не влезли в экран
			 $(".favorit_menu").on("click", function () {
			 	$(".all_screen_click").remove();
			 	$("#wrap").append("<div class='all_screen_click'></div>");
			 	$(this).find("ul:first").slideDown(200);
			 	return false;
			 	});
			 
		  
		  }
		  
		  //кнопки для быстрого добавления дел и поиска
		  function jsMakeAddDoAndSearchKeys() {
		  	  //клик в быстрое добавление дел
			  $('#add_do_panel').delegate("input","focus", function () {
			      if(!$(this).hasClass("active")) {
			      	$(this).addClass("active");
			      	$(".header_text").addClass("active");
//			      	$(this).focus();
//			        setTimeout(function(){ document.execCommand('selectAll',false,null); },50);
				    var inp = this;
				    setTimeout(function() {
				        inp.select();
				    }, 1);
				    $("#add_do").trigger("keyup");
				  }
			      //last_input_click = jsNow();
			      return true;
		      });
			  //при покидании add_do, свернуть его
			  $('#add_do_panel').delegate("input","blur", function () {
		      	  $(this).removeClass("active");
		      	  $(".header_text").removeClass("active");
		  		  $(".header_text").html("").attr("title","");
			      return true;
		      });
			  //при клике в поиск    
			  $('#search_panel').delegate("input","focus", function () {
			  	  if( !$(this).hasClass("active") ) {
	  				  var inp = this;
					  setTimeout(function() {
					      inp.select();
					  }, 1);
			  	  }
			      $(this).addClass("active");
			      //$(".search_panel_result").slideDown(500);
			      return false;
		      });
			  //при покидании поиска
			  $('#search_panel').delegate("input","blur", function () {
			  	  if( !$("#tab_find").hasClass("active") ) {
		      	  	$(this).removeClass("active");
		      	  }
			      return true;
		      });
		      
			  //при нажатии кнопок в быстрое добавление дел		      
			  $('.mypanel').undelegate(".add_do_panel_top input", "keyup").delegate(".add_do_panel_top input", "keyup", function(event) {
			  	 if(event.keyCode==38) {
			  	 	$(this).blur();
			  	 	return true;
			  	 }

			     if(",39,37,40,38,".indexOf(","+event.keyCode+",")!=-1) return true;
			     var this_cache = $(this);
			     if(event.keyCode==27) { //отмена добавления нового дела
			     	this_cache.val("");
			    	this_cache.blur();
			    	return false;
			     }
			     if((event.keyCode==13) && ($(this).val().length>0)) { //добавление нового дела
			        //создаю новую заметку в текущей папке
			        var parent_id = $(this).parents(".add_do_panel_top").parents(".panel:first").attr("id").replace("panel_","");
			     	var new_id = api4tree.jsAddDo( parent_id, strip_tags($(this).val()), undefined, undefined, "last" ); 
//			     	jsRefreshTree();
//			     	api4panel.jsOpenPath(new_id.id);
					jsRefreshTree();
					api4panel.jsOpenNode(new_id.id);
					api4panel.jsSelectNode(new_id.id);
			     	setTimeout(function(){ 
			     		$("#panel_"+parent_id+" .add_do_panel_top input").focus(); 
			     	},200);
			    	return false;
			     }
			    		
			     clearTimeout(timer_add_do);
			     timer_add_do = setTimeout(function(){
			     $(".add_do_panel_top input").not(this_cache).val("");
			     var mynewdate = api4tree.jsParseDate( this_cache.val() );
			     if( mynewdate.date == "") { $(".header_text").html(""); return true; }
			     $(".header_text").html( mynewdate.date.jsDateTitleFull()+mynewdate.sms+"&nbsp;&nbsp;<i class='icon-left-1'></i>" );
			     $(".header_text").attr( "title", mynewdate.date.jsDateTitleFull() );
			     jsTitle(mynewdate.title,15000);
			     },200);
			     return false;
			  }); //add_do
		      
		      
			  //при нажатии кнопок в быстрое добавление дел		      
			  $('#add_do_panel').undelegate("#add_do", "keyup").delegate("#add_do", "keyup", function(event) {
			     if(",39,37,40,38,".indexOf(","+event.keyCode+",")!=-1) return true;
			     if(event.keyCode==27) { //отмена добавления нового дела
			    	$("#add_do").blur();
			    	$("#wrap").click(); //убираю полноэкранный div
			    	return false;
			     }
			     if(event.keyCode==13) { //добавление нового дела
			        //создаю новую заметку в папке новое
			     	var new_id = api4tree.jsAddDo( "to_new_folder", $("#add_do").val(), undefined, undefined, "last" ); 
//			     	jsRefreshTree();
			     	api4panel.jsOpenPath(new_id.id);
			     	$("#add_do").val("");
			     	setTimeout(function(){ $(".redactor_").focus(); },200);
			    	return false;
			     }
			    		
			     clearTimeout(timer_add_do);
			     timer_add_do = setTimeout(function(){
			     var mynewdate = api4tree.jsParseDate( $("#add_do").val() );
			     if( mynewdate.date == "") { $(".header_text").html(""); return true; }
			     $(".header_text").html( mynewdate.date.jsDateTitleFull()+mynewdate.sms+"&nbsp;&nbsp;<i class='icon-left-1'></i>" );
			     $(".header_text").attr( "title", mynewdate.date.jsDateTitleFull() );
			     jsTitle(mynewdate.title,15000);
			     },200);
			     return false;
			  }); //add_do

			  
			  //нажатие клавиш в поиске
			  $('.tree_search').delegate("#search_filter", "keyup", function(event) {
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
					$.each(my_all_data2,function(i,el){ //ищу длинные тексты, чтобы забрать из другой базы
					    if(el) {
					    	var done_element = this_db.jsFindLongText(el.id).done(function(longtext){
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
								api4panel.jsShowTreeNode("tree_1",-1,false,element_founded);
								jsTitle("Найдено: " + element_founded.length + " шт ("+searchstring+")",5000);

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
						    if(!$(".search_panel_result").is(":visible")) $("#tab_find").click();
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
			  
		  $("body").on("click",function(){ api4panel.jsCloseAllMenu() });
			  
		  } //jsMakeAddDoAndSearchKeys
		  
		  
		  
		  //кнопки связанные с календарём
		  function jsMakeCalenarKeys() {
			  //открываю всю неделю в редакторе
			  $('body').delegate(".ui-datepicker-week-col","click", function () {
			      var year = $(this).parents(".ui-datepicker").find(".ui-datepicker-year").html();
			      var week = $(this).html();
			      
			      var dd = [];
			      $.each(my_all_data2, function(i,el){ 
			      	if( el.title==year+" год" ) dd.push(el); 
			      });
			      if(!dd) return false;
			      
			      recursivedata=[];
			      var recursive = this_db.jsRecursive(dd[0].id);
			      
			      var dd = recursive.filter(function(el){ return el.title==week+" неделя"; });
			      if(!recursive) return false;
			  
			      recursive=[];
			  
			      if(!dd) return false;
			      
			      if(dd[0]) { var id=dd[0].id; 
			      	api4editor.jsRedactorOpenRecursive(id);
			      }
			      		
			      return false;
			  });
			  
			  $("body").delegate(".open_calendars","click",function() {
			      $(this).toggleClass("active");
			      if( $(this).hasClass("active") )
			      	{
			      	//this_db.jsGetAllMyNotes();
			      	if(!$(".diary_calendar").hasClass("hasDatepicker")) 
			      	  {
			      	  var currentdate = new Date();		
			      	  $(".diary_calendar").datepicker({
			      			numberOfMonths: 2,
			      			defaultDate:currentdate,
			      			showButtonPanel: false,
			      			dateFormat:"dd.mm.yy",
			      			showWeek:true,
			      			onSelect:function(dateText, inst) 
			      			  { 
			      			  console.info(dateText,inst);
			      			  api4tree.jsDiaryPath( $(this).datepicker("getDate") );
			      			  },
				  			beforeShowDay : function(date) {
				  			  var highlight_class = "ui-has-note";
				  			  var finddate = api4tree.jsDiaryFindDateNote(date);
				  			  if( finddate[0] ) highlight_class = 'ui-has-note';
				  			  else highlight_class = "";
				  			  
				  			  return [true, highlight_class, finddate[1]];
				  			}
			      			  
			      			});
			      			
			      			
			      			
			       	  $(".diary_calendar .ui-icon-circle-triangle-w").click(); //перематываю на один месяц назад
			      	  }
			      	
			      	$(".diary_calendar").slideDown(300, function() { $(".redactor_editor").css({bottom:210}); } );
			      	$(".diary_arrow").show();
			      	}
			      else
			      	{
			      	$(".redactor_editor").css({bottom:27});
			      	$(".diary_calendar").slideUp(300);
			      	$(".diary_arrow").hide();
			      	}
			      return false;
			  });
			  
			  
			  
		  
			  $('#root-menu-div').delegate(".show_all_in_redactor","click", function () {
			      var id = $(".makedone").attr("myid");
			      api4editor.jsRedactorOpenRecursive(id);
			      return false;
			      });
			  //при клике в папку, открывает всех детей и внуков в редакторе
			  $(".mypanel").on("click",".folder_closed",function(e){
			  });

			  //клик по кнопке "текущая неделя"
			  $('#diary_panel').on("click", ".todayweek", function() {
			  	var my_week_num = (new Date()).getWeek();
        	    api4tree.jsGetDateRangeOfWeek( my_week_num );
    	    	var my_week_num = api4tree.jsDiaryPath(jsNow(),1,1);
    	    	api4editor.jsRedactorOpenRecursive(my_week_num); 
			    
			    return false;
			  });
			    
			  //переход в дневник и обратно
			  $('body').delegate(".todaydate","click", function ()
			    {
	   			 if(!$("#wiki_back_button").is(":visible")) {
	   			 	var member_old_id = api4tree.node_to_id( $(".tree_active .selected").attr('id') );
	   			 	var back_title = $(".tree_active .selected .n_title").html();
	   			 } else {
	   			  	var member_old_id = 0;
	   			 }
	   			 
	   		     this_db.jsDiaryPath( jsNow() );
	   			 if(member_old_id) {
	   			 	$("#wiki_back_button").attr("myid",member_old_id);
	   			 	$("#wiki_back_button").html('<i class="icon-left-bold"></i>вернуться к '+back_title);
	   			 }
	   			 $("#wiki_back_button").show()
			     setTimeout(function(){ $(".redactor_").focus(); },200);
			     return false;
			    });
			    
			  
		  }
		  
		  //кнопки редактора
		  function jsMakeEditorKeys() {


		  
		  
		  
			  $('.redactor_box').on("click",".divider_red", function () {
			      var id = $(this).attr("myid");
			      api4panel.jsOpenPath(id,"divider_click");
			      return false;
			  });
			  
			  //открывает ссылку в редакторе
			  $(".redactor_box,#tree_comments_container").on("click","a",function() {
			      var href = ( $(this).attr("href") );
			      if(href.indexOf("javascript:")!=-1) return true;
			  
			      if(href.indexOf("4tree.ru/#")!=-1) { //если это внутренняя ссылка
			      	var a = href.substr(href.indexOf("#")+1,100);
			      	window.location.hash = a;
			      } else {
			      	api4others.open_in_new_tab(href);
			      }
			      return false;
			  });		
			  
			  //открыть историю изменений заметки
			  $('.makedone_page_4').on("click",".show_all_history_redactor", function () {
			      var id = $(".makedone").attr("myid");
			      var add = crc32(id).substr(0,10);
			      api4others.open_in_new_tab("web.php?note_history="+add+id);
			      return false;
			      });
			  
			  $(".bottom_right>.redactor_box").scroll(function() {
			    	clearTimeout(scrolltimer);
			    	var id = $('#redactor').attr("myid");
			    	if(id!="") {
			    	  scrolltimer = setTimeout(function() {
			      			var scroll = $(".bottom_right>.redactor_box").scrollTop();
			      			console.info("save_scroll", scroll);
			      			var delta = scroll-api4tree.jsFind(id).s;
			      			if( Math.abs(delta) > 100  ) api4tree.jsFind(id, { s:scroll });
			    	  },1500);
			    	} 
			  });
			   
			  //открытие редактора в новом окне
			  $('.bottom_right').on("click",".red_new_window", function () {
			    var id = api4tree.node_to_id( $(".tree_active .selected").attr('id') );
			    if(id<0) {
			        alert("Синхронизируюсь, попробуйте через 2 секунды…");
			        api4tree.jsSync();
			        return false;
			    }
			    api4others.open_in_new_tab(document.location.origin+document.location.pathname+"#edit/"+id);
			    return false;
			  });
			   
			  
		  }
		  
		  //кнопки для панели настройки регулярных задач
		  function jsMakeRecurKeys() {

			  $('body').delegate("#recur_panel input,#recur_panel select, .recur_col","change", function () {
			      if( $(this).hasClass("recur_col") ) 
			      	$(":radio[name=recur_end_radio][value=2]").prop("checked",true);
			  
			      if( $(this).hasClass("recur_date1") ) 
			      	$(":radio[name=recur_end_radio][value=3]").prop("checked",true);
			  
			      jsMakeShortRecur();
			      return false;
			  });
			  
			  $('#recur_panel').delegate("#s_save","click", function () {
			      $("#s_recur_check").attr("checked","checked");
			      $("#s_recur_label").html('Повторить: ');
			      $("#s_recur_text").html( $(".recur_label_right b").html() );
			      
			      $("#all_screen").fadeOut('slow');
			      return false;
			  });
			  
			  
			  $('body').delegate(".recur_close,#recur_panel #s_close","click", function (d1,d2) {
			      console.info(d1,d2);
			      $("#all_screen").fadeOut('slow');
			      return false;
			  });
			  
			  $('body').delegate("#s_recur_check,#s_recur_change","click", function () {
			      if($(this).attr('checked')) 
			        {
			        $("#all_screen").fadeIn('slow');
			        return false;
			        } else {
			        $("#s_recur_label").html('Повторить…');
			        $("#s_recur_check").removeAttr("checked");
			        $("#s_recur_text").html('');
			        }
			  });
			  
//			  $('.recur_date1').datepicker({numberOfMonths: 1,
//			      showButtonPanel: true,showOtherMonths:true, selectOtherMonths:true, 
//			      		dateFormat:"dd.mm.yy",changeMonth:true, changeYear:true,
//			      		onClose:function(date){}
//			  });
			  
		  }
		  
		  
		  $("#makedatebutton").on("change","input",function() {
//			    if(!$(this).attr("checked")) $(this).attr("checked", true);
//			    else $(this).removeAttr("checked");
				console.info("CHECKBOX", $(this).prop("checked"));
		  		api4tree.jsChangeMakedoneCheckbox( $(this) , $(this).prop("checked") );
		  		return true;
		  		});
		  
		  var hide_timer;
		  this_db.jsChangeMakedoneCheckbox = function(element,value) {
				    if(is_rendering_now) return true;
				  	var id_element = element.attr("id");
				    
				    if(id_element == "on_off_hide_did") {
					   if(value) { //
						   settings.show_did = true;
						   localStorage.setItem('show_did',settings.show_did);
						   clearTimeout(hide_timer);
						   api4tree.jsUpdateChildrenCnt();
						   jsRefreshTree(); //обновляю дерево
						   setTimeout(function(){ jsTitle("Выполненные дела отображаются",10000); }, 500);
					   } else {
						   settings.show_did = false;
						   localStorage.setItem('show_did',settings.show_did);
						   hide_timer = setTimeout(function(){ $(".do_did").hide(); },1000);
						   api4tree.jsUpdateChildrenCnt();
						   jsRefreshTree(); //обновляю дерево
						   setTimeout(function(){ jsTitle("Выполненные дела скрыты",10000); }, 500);
						   
					   }
				    }

				    //чекбоксы в makedone
				    var id = element.parents(".makedone").attr("myid");
				    var node = api4tree.jsFind(id);
				    if(!id || !node) return false;
				  
				  	if(id_element == "on_off_did") { //did - undid
				  	   if(value) {
				    		api4tree.jsMakeDid(id);
				  	   } else {
				    		api4tree.jsMakeUnDid(id);
				  	   }
				  	}
				  
				  	if(id_element == "on_off_date") { //дата начала
				  	   if(value) {
				  	   		$("#makedate").slideDown(200);
				    	    setTimeout(function(){ 
				    	    	$("#makedatetime").change(); jsRefreshTree();
				    	    },300);
				    		$('#calendar').fullCalendar( 'refetchEvents' ); 
				  	   } else {
				  	   		$("#makedate").slideUp(200);
				    	    this_db.jsFind(id, { date1:"", date2:"", remind:0 });
				    	    setTimeout(function(){ jsRefreshTree(); },300);
				    		$('#calendar').fullCalendar( 'refetchEvents' ); 
				  	   }
				  	}
				  
				  	if(id_element == "on_off_sms") { //переключатель SMS
				  	   if(value) {
				  	   		var remind_time = parseInt( $("#remind_time").html() );
				  	   		if(!remind_time) remind_time = 15;
				       		this_db.jsFind(id,{ remind: remind_time });
				    	    setTimeout(function(){ jsRefreshTree(); },300);
				  	   } else {
				       		this_db.jsFind(id,{ remind: 0 });
				    	    setTimeout(function(){ jsRefreshTree(); },300);
				  	   		}
				  	   }
				  	   
				  	if(id_element == "on_off_share") { //поделиться
				  	   if(value) {
				  	   		$(".makesharediv").slideDown(200,function(){ if( parseInt($("#makesharestat_count span").text(),10)>0 ) $("#makesharestat_count").show(); });
				  	   		$("#makeshare").focus().select();
				    		api4tree.jsStartShare(id,1);
				  	   		console.info("share_on!!!",is_rendering_now);
				  	   		jsTitle("Нажмите ctrl+c, чтобы скопировать ссылку в буфер", 10000);
				  	   } else {
				    		$("#makesharestat_count").hide();   
				    		api4tree.jsStartShare(id,0);
				  	   		$(".makesharediv").slideUp(200);
				  	   }
				  	}
				  	   
				  	} //onchange iphoneStyle
				  	


		  this.jsShowMaster = function() {

		  };


		  var encryption_params = { count:2048,salt:"yes1",ks:128, adata:"4tree", iter: 1000 };
		  
		  $("#password_lock_now").on("click",function(){
			     var password_md5 = hex_md5( $(".encrypt_note input").val() );
				 api4tree.jsToggleEncrypt(password_md5); 
			 return false;
		  });

		  var master_password = "", user_password = "";

		  $("#password_lock_now_master").on("click",function(){

		  		 if(!$(".encrypt_note").hasClass("master_active")) {  //если не активен Мастер-пароль

		  		 	if($(".encrypt_note input").val().length) {
		  		 		$(".encrypt_note input").val("");
		  		 		if( $("#password_lock_now_user").hasClass("encrypted") ) {
			  		 		console.info("Сначала расшифровываем заметку Индивидуальным паролем");
			  		 		$("#password_lock_now_user").removeClass("encrypted");
			  		 		$(".encrypt_note").addClass("master_active");
			  		 		return true;
		  		 		}
		  		 	} else {
		  		 		if( $("#password_lock_now_user").hasClass("encrypted") ) {
		  		 			jsTitle('Сначала введите "Индивидуальный" пароль, чтобы расшифровать заметку',15000);
		  		 			$(".encrypt_note input").focus();
		  		 			return true;
		  		 		} else {
		  		 			$(".encrypt_note").addClass("master_active")
		  		 			return true;
		  		 		}
		  		 	}
		  		 } else { //если активен Мастер пароль
	  		 		master_password = $(".encrypt_note input").val();

		  		 	if($(".encrypt_note input").val().length) {
		  		 		if($("#password_lock_now_master").hasClass("encrypted")) {
			  		 		console.info("Расшифровываем заметку Мастер-паролем");
			  		 		$("#password_lock_now_master").removeClass("encrypted");
			  		 		return true;
		  		 		} else {
			  		 		console.info("Зашифровываем заметку Мастер-паролем");
			  		 		$("#password_lock_now_master").addClass("encrypted");
			  		 		$(".encrypt_note").addClass("master_active")
			  		 		return true;
		  		 		}
		  		 		$(".encrypt_note input").val(master_password);
		  		 	} else {
		  		 		jsTitle('Введите "Общий" пароль, чтобы расшифровать заметку',15000);
		  		 		$(".encrypt_note input").focus();
		  		 		return true;
		  		 	}

		  		 }
				 $(".encrypt_note").addClass("master_active");
			 	 return false;
		  });

		  $("#password_lock_now_user").on("click",function(){ //клик в индивидуальный пароль
		  		 if($(".encrypt_note").hasClass("master_active")) {  //если активен Мастер-пароль
	  		 		master_password = $(".encrypt_note input").val();

		  		 	if($(".encrypt_note input").val().length) {
		  		 		$(".encrypt_note input").val("");
		  		 		if( $("#password_lock_now_master").hasClass("encrypted") ) {
				  		 		console.info("Сначала расшифровываем заметку Общим паролем");
				  		 		$("#password_lock_now_user").removeClass("encrypted");
				  		 		$("#password_lock_now_master").removeClass("encrypted");
				  		 		$(".encrypt_note").removeClass("master_active");
				  		 		return true;
				  		 }
		  		 	} else {
		  		 		if( $("#password_lock_now_master").hasClass("encrypted") ) {
			  		 		jsTitle('Сначала введите "Общий" пароль, чтобы расшифровать заметку',15000);
			  		 		$(".encrypt_note input").focus();
			  		 		return true;
		  		 		} else {
		  		 			$(".encrypt_note").removeClass("master_active");
		  		 			return true;
		  		 		}
		  		 	}
		  		 } else { //если не активен Мастер пароль

		  		 	if($(".encrypt_note input").val().length) {
		  		 		if($("#password_lock_now_user").hasClass("encrypted")) {
			  		 		console.info("Расшифровываем заметку Индивидуальным паролем");
			  		 		$("#password_lock_now_user").removeClass("encrypted");
			  		 		return true;
		  		 		} else {
			  		 		console.info("Зашифровываем заметку Индивидуальным паролем");
			  		 		$("#password_lock_now_user").addClass("encrypted");
			  		 		$(".encrypt_note").removeClass("master_active")
			  		 		return true;
		  		 		}
		  		 	} else {
		  		 		jsTitle('Введите "Индивидуальный" пароль, чтобы зашифровать заметку',15000);
		  		 		$(".encrypt_note input").focus();
		  		 		return true;
		  		 	}

		  		 }
				 $(".encrypt_note").addClass("master_active");
			 return false;
		  });
		  
		  
		  this.jsToggleEncrypt = function(password) {
			  
		      var text = $("#redactor").redactor("get");
		      text = text.match(/{(.*?)}/ig);
		      if(text) text = text[0];
			  

			  if(/"cipher":"aes"/ig.test(text)) {
			  	  var js = JSON.parse(text);
			  	  delete js.encrypted;
			  	  text = JSON.stringify(js);
			      var decrypted_text = api4tree.jsDecrypt(password, text);
			      if(decrypted_text) {
				    	$("#redactor").redactor("set", decrypted_text);  
				    	$("#password_lock_now").attr("class","icon-lock-open");
			      } else {
				      alert("Ошибка в пароле");
			      }
			  } else {
				  var js = api4tree.jsEncrypt(password,$("#redactor").redactor("get")); 
				  $("#redactor").redactor("set",js);
				  $("#password_lock_now").attr("class","icon-lock");
			  }
		  };
				  	
		  this.jsEncrypt = function(somePassword, message) {
			  if(/"cipher":"aes"/ig.test(message)) {
			  	console.info("Message already encrypted. Nothing to do...");
			  	return message;
			  }
		  	  var salt = "yes1";
			  var answer = sjcl.encrypt(somePassword,message,{count:2048,salt:salt,ks:128, adata:"4tree" });			  
			  
			  answer = JSON.parse(answer);
			  delete answer.adata;
			  delete answer.count;
			  delete answer.iter;
			  delete answer.ks;
			  delete answer.mode;
			  delete answer.salt;
			  delete answer.ts;
			  delete answer.v;
			  return JSON.stringify( answer );
		  } 	
		  
		  this.jsDecrypt = function(somePassword, message_encrypted) {

		      	message_encrypted = message_encrypted.match(/{(.*?)}/ig)[0];

			    if(/"cipher":"aes"/ig.test(message_encrypted)) { //если текст зашифрован
				  	  var salt = "yes1";
				  	  var js = JSON.parse( message_encrypted );
					  js.adata = encryption_params.adata;
					  js.count = encryption_params.count;
					  js.iter = encryption_params.iter;
					  js.ks = encryption_params.ks;
					  js.mode = "ccm";
					  js.salt = encryption_params.salt;
					  js.ts = 64;
					  js.v = 1;
					  
					  message_encrypted = JSON.stringify(js);
				  	  try {
					  var answer = sjcl.decrypt(somePassword, message_encrypted);
					  } catch(e) {
					  	  console.info(e);
						  return false;
					  }
			    } else {
			    	answer = message_encrypted;
			    }
			  return answer;
		  } 	
		  
		  var copy_id={ id:0, cut: false };
		  
		  //////////////////////////////////////////////////////////////////
		  jsNeedAction = function(key, options) { //выполнение всех действий контекстновго меню дел
			   	var id = api4tree.node_to_id( $(".tree_active .selected").attr('id') ); 
	        	var tree_id = $(".tree_active").attr("id");
			   	
	            if( key=="add_down" ) {
		            api4tree.jsAddDoLeftRight('down');
	            } else if(key=="add_right") {
		            api4tree.jsAddDoLeftRight('right');	            
	            } else if(key=="add_pomidor") {
			        this_db.jsAskForPomidor();
	            } else if(key=="add_diary") {
		            var id = this_db.jsDiaryPath( jsNow() );
				    api4panel.jsOpenPath(id);
	            } else if(key=="rename") {
		            jsStartRenameSelected();
	            } else if(key=="delete") {
			        var title = $(".tree_active .selected .n_title").html();
				    if(title) {
			    	  api4tree.jsDeleteDo($(".tree_active .selected"));
					}
	            } else if(key=="date_remove") {
		            api4tree.jsFind(id, {date1: "", date2: "", remind: 0});
		            api4panel.jsSelectNode(id);
		            jsRefreshTree();
	            } else if(key=="date_one_day_back") {
	            	api4tree.jsAddDayToDate(id,+1);
		            api4panel.jsSelectNode(id);
	            	return false;
	            } else if(key=="date_one_day_forward") {
	            	api4tree.jsAddDayToDate(id,-1);		            
		            api4panel.jsSelectNode(id);
	            	return false;
	            } else if(key=="date+0") {
		            api4tree.jsAddDayToDate(id,0,"today");
		            api4panel.jsSelectNode(id);
	            	return false;
	            } else if(key=="date+1") {
		            api4tree.jsAddDayToDate(id,+1,"today");
		            api4panel.jsSelectNode(id);
	            	return false;
	            } else if(key=="date+2") {
		            api4tree.jsAddDayToDate(id,+2,"today");
		            api4panel.jsSelectNode(id);
	            	return false;
		        } else if(key=="date+7") {
		            api4tree.jsAddDayToDate(id,+7,"today");
		            api4panel.jsSelectNode(id);
	            	return false;
		        } else if(key=="dublicate") {

					var clone_id = api4tree.jsClone(id);		        
			 	    jsRefreshTree();			        
			 	    api4panel.jsSelectNode(clone_id);
			 	    
		        } else if(key=="focus_in") {
			        api4panel.jsShowFocus(tree_id, id, "need_select_first");
		        } else if(key=="focus_out") {		        	
			        api4panel.jsShowFocus(tree_id, 1, "need_select_first");
			        api4panel.jsOpenPath(id);
		        } else if(key=="copy") {
			        console.info("copy_id",id);
			        copy_id.id = id;
			        copy_id.cut = false;
			        jsTitle("<b><i class='icon-docs'></i>В буфере:</b> "+api4tree.jsFind(id).title, 5*60000);
		        } else if(key=="cut") {
			        console.info("copy_id",id);
			        copy_id.id = id;
			        copy_id.cut = true;
			        jsTitle("<b><i class='icon-scissors'></i>В буфере:</b> "+api4tree.jsFind(id).title, 5*60000);
		        } else if(key=="paste_down") {
		        	var click_element = api4tree.jsFind(id);
					var parent_id = click_element.parent_id;
					var position = parseFloat(click_element.position)+0.1;
		        	if(copy_id.cut) {
						if( api4tree.jsCheckIncest(parent_id, copy_id.id) ) {
							api4tree.jsFind(copy_id.id, {parent_id: parent_id, position: position});
							console.info("Вставляю:", copy_id.id, {parent_id: parent_id, position: position} );
							jsRefreshTree();
							api4panel.jsSelectNode(copy_id.id);
						}			        	
		        	} else {
						if( api4tree.jsCheckIncest(parent_id, copy_id.id) ) {
							console.info("Копирую:", copy_id.id);
							var clone_id = api4tree.jsClone(copy_id.id, parent_id );
							api4tree.jsFind(clone_id, {position: position});
							jsRefreshTree();
							api4panel.jsSelectNode(clone_id);
						}			        	
		        	}
		        	  
		        } else if(key=="paste_right") {

		        	var click_element = api4tree.jsFind(id);
					var parent_id = click_element.id;
					var position = 10000;
		        	if(copy_id.cut) {
						if( api4tree.jsCheckIncest(parent_id, copy_id.id) ) {
							api4tree.jsFind(copy_id.id, {parent_id: parent_id, position: position});
							console.info("Вставляю:", copy_id.id, {parent_id: parent_id, position: position} );
							jsRefreshTree();
							api4panel.jsSelectNode(copy_id.id);
						}			        	
		        	} else {
						if( api4tree.jsCheckIncest(parent_id, copy_id.id) ) {
							console.info("Копирую:", copy_id.id);
							var clone_id = api4tree.jsClone(copy_id.id, id);
							api4tree.jsFind(clone_id, {position: position});
							
							jsRefreshTree();
							api4panel.jsSelectNode(clone_id);
						}			        	
		        	}

			        
		        } else if(key=="edit_all") {
			    	api4editor.jsRedactorOpenRecursive(id);    
		        }
		        
		  }
		  
		  this.jsCheckIncest = function(old_id, new_id) {
	            	var path_of_dropto = api4tree.jsFindPath(api4tree.jsFind(old_id)); //проверяем на "инцест"
	            	no_incest = true;
	            	if(old_id != 1)
	            	$.each(path_of_dropto.path, function(i, el) {
	            		if(el.path.id == new_id ) {
	            			no_incest = false;
	            			jsTitle("Не могу переместить родителя внутрь своих потомков",10000);
	            		}
	            	});
	            	return no_incest;			  
		  }
		  
		  
		  function jsDublicate(id, to_new_parent, is_first_level) {
		        	var element = api4tree.jsFind(id);
			 	    var copy = clone( element );
			 	    var newposition = element.position + 0.3;
			 		var new_element = api4tree.jsAddDo(element.parent_id, "Клон", null, null, newposition); 

			 		copy.id = new_element.id;
			 		copy.newposition = newposition;
			 		my_all_data2["n"+new_element.id] = copy;
					
					if(is_first_level) { var pre_word = "Копия "; } else 
									   { var pre_word = ""; }
					
					api4tree.jsFind(new_element.id, { parent_id: -800} );
					api4tree.jsFind(new_element.id, { parent_id: to_new_parent, title: pre_word+element.title} );	
					
					api4tree.jsFindLongText(id).done(function(text){
						api4tree.jsFindLongText(new_element.id, text);
					});
					
					console.info("Дублирую "+ element.title, id, to_new_parent, "new_id=", new_element.id);
					
					return new_element.id;
		  }
		  
		  this.jsClone = function(id, new_parent_id) {
		  	  var show_did_was = settings.show_did;
			  settings.show_did = true;

			  if(new_parent_id) {
			  	var parent_id = new_parent_id;
			  } else {
			  	var parent_id = api4tree.jsFind(id).parent_id;
			  }
			  
			  var _parent_id = jsCloneChilds(id, parent_id, "first_level");

			  settings.show_did = show_did_was;
			  
			  return _parent_id;
		  }

		  function jsCloneChilds(id, new_parent_id, is_first_level) {
			  var clone_parent_id = jsDublicate(id, new_parent_id, is_first_level);
		  	  
		  	  var childs = api4tree.jsFindByParent(id);
		  	  if(childs.length>0) {
				  $.each(childs, function(i, the_child) {
					 jsCloneChilds(the_child.id, clone_parent_id); 
				  });
			  	  
		  	  }
		  	  return clone_parent_id;
		  	  
		  }
		  
		  ///////////////////////////////////////////////////////////////////
		  this.jsAddDayToDate = function(id,add_days,from_today) {
		  	  if(from_today) { 
	  	  	      var date1 = sqldate(jsNow()); 
	  	  	      var date2 = "";
		  	  } else {
			  	  var date1 = api4tree.jsFind(id).date1;
			  	  var date2 = api4tree.jsFind(id).date2;
		  	  }
		  	  if(date1!="") {
	            date1 = Date.createFromMysql(date1);
				date1.setDate(date1.getDate()+add_days);	            

				if(date2) {
		            var date2 = Date.createFromMysql(date2);
					date2.setDate(date2.getDate()+add_days);	            
					api4tree.jsFind(id, { date2: sqldate(date2) });
				}
				api4tree.jsFind(id, { date1: sqldate(date1) });
			  } else { //если даты нет, ставлю сегодня
			  	  var today = new Date();
			  	  today.setHours(0);
			  	  today.setMinutes(0);
			  	  today.setSeconds(0);
			  	  today.setMilliseconds(0);
				  api4tree.jsFind(id, {date1: sqldate(today) })
			  }
			  	jsRefreshTree();
				return sqldate(date1);
	      }

		  
		  //пункты меню
		  function jsMakeMenuKeys() {
			 
			 $('.tree_add_new_element').on("click", function(){
			 	$('.tree_add_new_element').contextmenu();
				return false; 
			 });
			 
			 
			 $("#tags_collapse").on("click", function(){
				$("#right_tags .tags_content").slideUp(100);
			 });

			 $("#tags_expand").on("click", function(){
				$("#right_tags .tags_content").slideDown(300);
			 });
			 
			 $('#tree_1_add').on("click", function(){
			 	$('#tree_1_add').contextmenu();
				return false; 
			 });
			 
			 
			 $('.tree_history_arrows').on("contextmenu", "i", function(){

			 var items = {};
							  
			 var my_all_history = api4panel.jsGetHistory();
        	 var tree_id = $(".tree_active").attr("id");			 
			 var the_history = my_all_history[tree_id]["list"].reverse();
			 $.each(the_history, function(i,el){
			 	if(el.isFolder) var icon = "icon-folder-1";
			 	else var icon = "icon-docs-landscape";
				if(i<25) items[el.id] = { name: el.title, icon: icon };
			 });
			 
			 $.contextMenu("destroy",".tree_history_arrows");
			 $.contextMenu({
			         selector: '.tree_history_arrows', 
			         trigger: 'none',
			         callback: function(key, options) {
			         	api4panel.jsOpenPath(key);
			         },
			         delay:0,
			         events: { show: function(opt){ 
			 				console.info("!!",opt);
			         	},
			         	hide: function(opt){ 
			         	}  
			         },
			         items: items
			 		});		  



			 $(".tree_history_arrows").contextmenu();
			 });
			 
			$("#right_tags").on("click", ".tags_contextmenu", function(){
				$(this).contextmenu();
				return false;
			});
			 
			
$.contextMenu({
        selector: '.tags_contextmenu', 
        trigger: 'none',
        callback: function(key, options) {
        	var tag_id = $(this).parents("li:first").attr("myid");
        	
            if( key=="add_tag_down" || key=="add_tag_right" ) {
     	      var answer = prompt("Напишите название тега (без @):", "Срочно");
	          if(answer) {
	          	 var max_id = 0;
	          	 var parent_id = "1";
	          	 console.info(my_tags);
	          	 $.each(my_tags, function(i, el){
		          	 if(el.id>max_id) max_id = parseInt(el.id);
		          	 if(el.id==tag_id) { parent_id = el.parent_id;
		          	 console.info(el.parent_id, tag_id, el);
		          	 }
	          	 });
	          	 
	          	 if(key=="add_tag_right") parent_id = tag_id;
	          	 
		    	 my_tags.push({id:(max_id+1), title: answer, parent_id: parent_id}); 
		    	 api4tree.jsShowAllTags();
		    	 api4tree.jsSaveTagsFromScreen(); //сохраняю все теги на сервер
	          }
	        } else if (key=="remove_tag") {
		        alert("Удалить тег?"+tag_id);
		         var delete_id = false;
	          	 $.each(my_tags, function(i, el){
		          	 if(el.id==tag_id) { 
		          	 	delete_id = i;
		          	 }
	          	 });
	          	 
	          	 if(delete_id) my_tags.splice(delete_id,1); //удаляю тег из массива
	          	 
		    	 api4tree.jsShowAllTags();
		    	 api4tree.jsSaveTagsFromScreen(); //сохраняю все теги на сервер
				 jsRefreshTree();
	        } else if (key=="rename_tag") {
     	      var answer = prompt("Напишите новое название тега (без @):", api4tree.jsFindTag(tag_id)[0].title );
     	      if(answer) api4tree.jsFindTag(tag_id)[0].title = answer;
	    	  api4tree.jsShowAllTags();
		      api4tree.jsSaveTagsFromScreen(); //сохраняю все теги на сервер
		      jsRefreshTree();
		        
	        }
        },
        delay:0,
        events: { show: function(opt){ 
				console.info("!!",opt);
        	},
        	hide: function(opt){ 
        	}  
        },
        items: {
        	"add_tag_down": {"name":"Добавить тег вниз", "icon": "icon-down-1"},
        	"add_tag_right": {"name":"Добавить тег внутрь", "icon": "icon-right-1"},
        	"rename_tag": {"name":"Переименовать тег", "icon": "icon-edit-1"},
        	"sep1": "--------",
        	"remove_tag": {"name":"Удалить тег", "icon": "icon-trash"}
		}
		});		  
		  
$.contextMenu({
        selector: '.tree_add_new_element, #tree_1_add', 
        trigger: 'none',
        callback: function(key, options) {
            if( key=="add_down" ) {
	            api4tree.jsAddDoLeftRight('down');
            } else if(key=="add_right") {
	            api4tree.jsAddDoLeftRight('right');	            
            } else if(key=="add_pomidor") {
		        this_db.jsAskForPomidor();
            } else if(key=="add_diary") {
	            var id = this_db.jsDiaryPath( jsNow() );
			    api4panel.jsOpenPath(id);
            }
        },
        delay:0,
        events: { show: function(opt){ 
				console.info("!!",opt);
        	},
        	hide: function(opt){ 
        	}  
        },
        items: {
        	"add_down": {"name":"Добавить дело вниз<b>alt + <i class='icon-down-1'></i></b>", "icon": "icon-down-1"},
        	"add_right": {"name":"Добавить дело внутрь<b>alt + <i class='icon-right-1'></i></b>", "icon": "icon-right-1"},
        	"sep1": "--------",
        	"add_diary": {"name":"Дневник на сегодня<b>alt + D</b>", "icon": "icon-calendar-2"},
        	"add_pomidor": {"name":"Добавить помидорку в дневник<b>alt + P</b>", "icon": "icon-record"}
		}
		});		  
		  
////////////////////////////////////Главное контекстное меню//////////////////////////////////////////		  
$.contextMenu({
        selector: '.panel .big_n_title, .panel .tcheckbox ,.fc-event', 
//        triger: "right",
        events: { show: function(opt){ 
		        var id = $(this).parents("li:first").attr("myid"); 
        		$(this).parents("li:first").parents(".mypanel").find(".selected").removeClass("selected");
				$(this).parents("li:first").addClass("selected").parents(".mypanel").addClass("tree_active");
				$(".tree_active").removeClass("tree_active");
				$(this).parents(".mypanel").addClass("tree_active");
				if(api4tree.jsFind(id).did!=0)	opt.items.context_make_did1.selected = true;
				else opt.items.context_make_did1.selected = false;
        	},
        	hide: function(opt){ 
        	}  
        },
        callback: jsNeedAction,
        build: function(trigger, e){
	        console.info($(this), trigger, e);
        },
        delay:0,
        items: {
            "add_down": {"name": "Добавить вниз<b>alt + <i class='icon-down-1'></i></b>", "icon": "icon-down-1"},
            "add_right": {"name": "Добавить вправо<b>alt + <i class='icon-right-1'></i></b>", "icon": "icon-right-1"},
            "sep1": "---------",
            "rename": {"name": "Переименовать<b>Enter</b>", "icon": "icon-edit-1"},
            "delete": {"name": "Удалить<b>Del</b>", "icon": "icon-trash"},
            "sep2": "---------",
            "context_make_did10": {"name": "Дата начала", "icon": "icon-calendar",
	            "items": {
                            "date_remove": {"name": "Удалить дату",  icon: "icon-cancel"},
                            "date_one_day_back": {"name": "1 день вперёд", icon: "icon-fast-fw"},
                            "date_one_day_forward": {"name": "1 день назад", icon: "icon-fast-bw"},
							"sep6": "---------",
                            "date+0": {"name": "Сегодня", icon: "icon-dot"},
                            "date+1": {"name": "Завтра",  icon: "icon-dot-2"},
                            "date+2": {"name": "Послезавтра", icon: "icon-dot-3"},
                            "date+7": {"name": "Через неделю", icon: "icon-to-end"}
	            }
            },
            "context_make_did101": {"name": "Правка", "icon": "icon-edit",
	            "items": {
					"copy": {"name": "Копировать", "icon": "icon-docs", "disabled":false},
					"cut": {"name": "Вырезать", "icon": "icon-scissors", "disabled":false},
					"sep61166": "---------",
					"paste_down": {"name": "Вставить вниз", "icon": "icon-down"},
					"paste_right": {"name": "Вставить вправо", "icon": "icon-right"},
					"sep611": "---------",
					"dublicate": {"name": "Дублировать", "icon": "icon-docs"}
	            }
            },

            "context_make_did1011": {"name": "Просмотр", "icon": "icon-eye", 
	            "items": {
					"focus_in": {"name": "Фокус", "icon": "icon-zoom-in"},
					"focus_out": {"name": "Фокус снять", "icon": "icon-zoom-out"},
					"edit_all": {"name": "Редактировать вложенные заметки", "icon": "icon-th-list-2"}
/*					"context_make_did5": {"name": "Цвет папки", "icon": "icon-right"},
					"sep611": "---------",
					"context_make_did9": {"name": "Поделиться", "icon": "icon-export",
					    "items": {
					                "fold2-key51": {"name": "Короткая ссылка 4tree"},
					                "fold2-key511": {"name": "Отправить на эл.почту"},
					    			"sep61": "---------",
					                "fold2-key61": {"name": "Facebook"},
					                "fold2-key21": {"name": "vKontakte"},
					                "fold2-key31": {"name": "Google+"}
					    }
					}*/
	            }
            },
			"sep131": "--------",
            "context_make_did1": {"name": "Выполнено", type: "checkbox", events:{ click:function(){
		   			   var id = api4tree.node_to_id( $(".tree_active .selected").attr('id') ); 
			           var value = $(this).prop("checked");
			           
				  	   if(value) {
				    		api4tree.jsMakeDid(id);
				  	   } else {
				    		api4tree.jsMakeUnDid(id);
				  	   }
            	}}
            }
            
        }
    });		  
		  
		  
			  $("#exit_and_purge").on("click",function(){
				    progress_load=0;
				    $("#load_screen #pload_text").html("Синхронизация перед выходом...");
					$("#load_screen").show();
					jsProgressStep();
				    api4tree.jsSync().done(function(){ 
						jsProgressStep();
						localStorage.clear();
				        setTimeout(function(){
							jsProgressStep();
							$("#load_screen #pload_text").html("Очистка данных в браузере...");

							api4tree.jsClearCurrentBase().done(function(){
									jsProgressStep();
									setTimeout(function(){
										$("#load_screen #pload_text").html("Очистка произведена успешно. Выход.");
										jsProgressStep();
										setTimeout(function(){
											jsProgressStep();
											$.cookie("4tree_passw",null);
											$.cookie("4tree_email",null);
											$.cookie("4tree_email_md",null);
											$.cookie("4tree_user_id",null);
											$.cookie("4tree_social_md5",null);
											$.cookie("main_tree_font",null);
											$.cookie("main_x",null);
											$.cookie("main_y",null);
											$.cookie("pwidth",null);
											$.cookie("sh",null);
											window.location.href="login.php?exit_and_purged_local_data";
											
										},1000);
									}, 1500);
							});
				        }, 500);
						console.info("did"); 
				    });
					jsProgressStep();
					return false;
			  })
		  
			  var hide_timer;
			  //меню добавления дел
			  $("#myslidemenu").delegate(".add_do_down","click", function () {
			  	api4panel.jsCloseAllMenu();
			    api4tree.jsAddDoLeftRight('down');
			  	return false;
			  	});


			  $(".path_line").delegate("li","click", function () {
			  	var myid = $(this).attr("myid");
			  	if(myid) {
			  		api4panel.jsOpenPath(myid);
			  	}

			  	return false;
			  });

			  var mydontclose = false;
			  $("#myslidemenu").delegate("li","click", function () {
			  	var myid = $(this).attr("myid");
			  	if(myid) {
			  		api4panel.jsOpenPath(myid);
			  		return false;
			  	}

			  	if(!$(this).attr("dont_close") && !mydontclose) {
			  		api4panel.jsCloseAllMenu();
			  		mydontclose = false;
			  	} else {
			  		mydontclose = true;
			  		setTimeout(function(){ mydontclose=false; },200);
			  	}
			  	return true;
			  });
			     
			  //меню добавления дел
			  $("#myslidemenu").delegate(".add_do_right","click", function () {
			  	api4panel.jsCloseAllMenu();
			    api4tree.jsAddDoLeftRight('right');
			  	return false;
			  	});

			  //синхронизация с сервером		  
			  $("#myslidemenu").on("click", ".m_refresh", function () {
		  	    api4panel.jsCloseAllMenu();
			    api4tree.jsSync();
			  	return false;
			  	});

		      //
			  $('body').delegate(".show_hidden_do","click", function() {
		   		is_rendering_now = true;
			    $("#on_off_hide_did").prop("checked",true).iphoneStyle("refresh");
		   		is_rendering_now = false;
			    return false;
			  });
			    		
			  $("#myslidemenu").on("click", ".m_refresh_all", function () {
			    progress_load=0;
			  	$("#load_screen").show();
			  	jsProgressStep();
			  	this_db.js_LoadAllDataFromServer().done(function(){
				  	jsProgressStep();
				  	jsRefreshTree();
				  	jsProgressStep();
				  	$("#load_screen").fadeOut(1000);
				  	jsProgressStep();
				  	jsTitle("Данные загружены с сервера заново",10000);
				  	jsRefreshTree();
			  	});
			    return false;
			  });

			  $('.on_off').iphoneStyle({ checkedLabel: 'да&nbsp;&nbsp;', uncheckedLabel: 'нет',         
				  onChange: api4tree.jsChangeMakedoneCheckbox
				});

		if(false)		
			  $('#on_off_did').iphoneStyle({ checkedLabel: '<i class="icon-progress-3"></i>', uncheckedLabel: '<i class="icon-progress-1"></i>',         
				  onChange: api4tree.jsChangeMakedoneCheckbox
				});
			     
			  
		  } //jsMakeMenuKeys
		  
		  function jsStartRenameSelected() {
  			       	var ntitle = $(".tree_active .selected").find(".n_title:first");
			      	ntitle.attr("contenteditable","true").attr("spellcheck","false").focus(); 
			      	ntitle.attr("old_title",ntitle.html());
			      	if(ntitle.is(":focus")) { document.execCommand('selectAll',false,null); }

		  }
		  
		  function jsMakeHelpKeys(key_help){
		  	  if($("#hotkeyhelper ul").html()!="") return true;
		  	  var myhtml = "";
			  $.each(key_help, function(i,el) {
				  if(el.title=="") {
				  	myhtml +="<div class='help_divider'></div>";
				  } else {
				  	if(!el.no_alt) var alt = "<b>alt </b><span class='help_plus'>+</span>";
				  	else alt = "<b style='opacity:0'>alt </b><span  style='opacity:0' class='help_plus'>+</span>";
				  	myhtml += "<li>"+alt+"<b>"+el.key+
				  			"</b><span class='help_title'>- "+el.title+"</span></li>";
				  }
			  });
			  $("#hotkeyhelper ul").html(myhtml);
		  }
		  
		  this.jsAskForPomidor = function() {
			  
	   	           var last_title = localStorage.getItem("pomidor_last_title");
  	      	       if(!last_title) last_title = "Мой проект";
     	           var answer = prompt("Ручное добавление 25 минутного блока работы.\n\nКак описать этот \"листочек\" в сегодняшнем дневнике?", last_title);
    	      	   if(answer) { 
   	      	        	localStorage.setItem("pomidor_last_title", answer);
    	      	   		api4tree.jsDiaryTodayAddPomidor(answer,"green"); 
    	      	   		}
    	  }

		  
		  //обработка клавиш клавиатуры
		  function jsMakeWindowKeyboardKeys() {
			  var alt_hide_timer, alt_show_timer_started = false;
			  
			  function jsHide_help() {
			  	 	clearTimeout(alt_hide_timer);
			  	 	alt_hide_timer = setTimeout(function(){
				  	 	alt_show_timer_started = false;
				  	 	clearTimeout(show_help_timer);
				  	 	$("#hotkeyhelper").hide();
				  	 	mymetaKey = false;
//				  	 	console.info("HIDING...");
			  	 	},100);
			  }
			  
			  $(window).keyup(function(e){
			    
			  	 if((e.keyCode==16)) { //Shift
			  	 	mymetaKey = false;
			     }
			  	
			  	 if(alt_show_timer_started==true) { //alt - при отпускании, скрывает подсказку
			  	 	jsHide_help();
			  	 }
			    });
			  
			  $(window).keydown(function(e){
		  	     var key_help = [];
			  	 
//			     console.info("нажата клавиша", e.keyCode);
			  
			  	 if(e.keyCode==16) { 
				  	if(alt_show_timer_started == false)  {
				  	 	alt_show_timer_started = true;
				  	 	show_help_timer = setTimeout(function(){ mymetaKey = true; },50);
			  	 	}
			  	  
			  	 } 
			  	 
			  	 if((e.altKey==true) && (e.keyCode==18)) { //нажатый альт вызывает помощь по горячим клавишам
				  	if(alt_show_timer_started == false)  {
				  	 	alt_show_timer_started = true;
				  	 	show_help_timer = setTimeout(function(){ $("#hotkeyhelper").show(); },1700);
//				  	 	console.info("STARTING...");
			  	 	}
		  	 	 }
			  
			     key_help.push({key:"D",title:"открыть дневник"}); 
			  	 if( (e.altKey==true) && (e.keyCode==68) )  { //D - открыть дневник alt+d
			    	   e.preventDefault();					   
			    	   jsHide_help();
			      	   var id = this_db.jsDiaryPath( jsNow() );
			      	   api4panel.jsOpenPath(id);
		         }
			  
			     key_help.push({key:"A",title:"добавить дело"});
			  	 if( (e.altKey==true) && (e.keyCode==65) )  { //alt+A - быстрое добавление дел
				       e.preventDefault();
			    	   jsHide_help();
				  	   if(!$("#add_do").hasClass("active")) {
				  	   		$("#add_do").focus();
		  	   		   } else {
				  	   		if( $("#add_do").is(":focus") ) {
				      	   		$("#add_do").blur();
				      	   		$("#wrap").click();
			      	   		} else {
				      	   		$("#add_do").focus();
				    		  	document.execCommand('selectAll',false,null);
				      	   	}
				  	   }
				  	   return false;
			  	 }
			       
			     key_help.push({key:"R",title:"синхронизировать с сервером"});
			  	 if( (e.altKey==true) && (e.keyCode==82) ) { //alt+R - обновляю дерево
			       e.preventDefault();
		    	   jsHide_help();
			  	   $(".m_refresh")[0].click();
			  	   return false;
		  	     }

			     key_help.push({key:"P",title:"добавить одну Pomidorro"});
			  	 if( (e.altKey==true) && (e.keyCode==80) ) { //alt+P - обновляю дерево
			       e.preventDefault();
				   jsHide_help();
			       this_db.jsAskForPomidor();
			  	   return false;
			  	 }
			     key_help.push({key:"G",title:"Стартовать таймер Pomidorro"});
			  	 if( (e.altKey==true) && (e.keyCode==71) ) { //alt+G - стартую помидорку
			       e.preventDefault();
				   jsHide_help();
				   if(!$(".pomidor_now").attr('id')) {
				       var id=1;				   	
				   } else {
	   	      	       var id = parseInt( $(".pomidor_now").attr('id').replace("pomidor",""),10 );
	   	      	       if (id==8) id=0;
	   	      	       id = id+1;
   	      	       }
	  			   $("#pomidoro_icon i").removeClass("pomidor_now");
	  			   $("#pomidor"+id).addClass("pomidor_now").click();
			  	   return false;
			  	 }
			     key_help.push({key:"F",title:"развернуть редактор"});
			     key_help.push({key:"",title:""});
			  	 if( (e.altKey==true) && (e.keyCode==70) ) { //alt+F - полноэкранный режим редактора
			       e.preventDefault();
				   jsHide_help();
			  	   $(".fullscreen_editor").click();
			  	   return false;
			  	 }
			     key_help.push({key:"1",title:"вкладка №1"});
			  	 if( (e.altKey==true) && (e.keyCode==49) ) {
			       e.preventDefault();
				   jsHide_help();
			  	   $("#tree_header li:eq(0)").click();
			  	 }
			     key_help.push({key:"2",title:"вкладка №2"});
			  	 if( (e.altKey==true) && (e.keyCode==50) ) {
			       e.preventDefault();
				   jsHide_help();
			  	   $("#tree_header li:eq(1)").click();
			  	 }
			     key_help.push({key:"3",title:"вкладка №3"});
			  	 if( (e.altKey==true) && (e.keyCode==51) ) {
			       e.preventDefault();
				   jsHide_help();
			  	   $("#tree_header li:eq(2)").click();
			  	 }
			     key_help.push({key:"4",title:"вкладка №4"});
			  	 if( (e.altKey==true) && (e.keyCode==52) ) {
			       e.preventDefault();
				   jsHide_help();
			  	   $("#tree_header li:eq(3)").click();
			  	 }
			     key_help.push({key:"5",title:"вкладка №5"});
			  	 if( (e.altKey==true) && (e.keyCode==53) ) {
			       e.preventDefault();
				   jsHide_help();
			  	   $("#tree_header li:eq(4)").click();
			  	 }
			     key_help.push({key:"6",title:"вкладка №6"});
			  	 if( (e.altKey==true) && (e.keyCode==54) ) {
			       e.preventDefault();
				   jsHide_help();
			  	   $("#tree_header li:eq(5)").click();
			  	 }
			     key_help.push({key:"7",title:"вкладка №7"});
			  	 if( (e.altKey==true) && (e.keyCode==55) ) {
			       e.preventDefault();
				   jsHide_help();
			  	   $("#tree_header li:eq(6)").click();
			  	 }
			     key_help.push({key:"8",title:"вкладка №8"});
			  	 if( (e.altKey==true) && (e.keyCode==56) ) {
			       e.preventDefault();
				   jsHide_help();
			  	   $("#tree_header li:eq(7)").click();
			  	 }
			     key_help.push({key:"9",title:"вкладка №9"});
			  	 if( (e.altKey==true) && (e.keyCode==57) ) {
			       e.preventDefault();
				   jsHide_help();
			  	   $("#tree_header li:eq(8)").click();
			  	 }
			  	   
			     key_help.push({key:"+",title:"увеличить шрифт"});
			  	 if( (e.altKey==true) && ((e.keyCode==187) || (e.keyCode==61) || (e.keyCode==231)) ) {
			       e.preventDefault();
				   jsHide_help();
			  	   $(".m_zoom_in")[0].click();
			  	 }

			     key_help.push({key:"–",title:"уменьшить шрифт"});
			  	 if( (e.altKey==true) && ((e.keyCode==189) || (e.keyCode==173) ) ) {
			       e.preventDefault();
				   jsHide_help();
			  	   $(".m_zoom_out")[0].click();
			  	 }

			     key_help.push({key:"0",title:"шрифт по умолчанию"});
			     key_help.push({key:"",title:""});
			  	 if( (e.altKey==true) && (e.keyCode==48) ) {
			       e.preventDefault();
				   jsHide_help();
			  	   $(".m_zoom_default")[0].click();
			  	 }

			  	 if( (e.altKey==true) && (e.keyCode==67) ) {
			       e.preventDefault();
			       jsRedactorInsert('checkbox');
			  	 }
			  	 if( (e.altKey==true) && (e.keyCode==88) ) {
			       e.preventDefault();
			       jsRedactorInsert('datetime');
			  	 }

			  	   
			     key_help.push({key:"<i class='icon-down-bold'></i>",title:"добавить дело вниз"});
			  	 if( (e.altKey==true ) && (e.keyCode==40) ) { //alt + вниз
			       e.preventDefault();
				   jsHide_help();
				   api4tree.jsAddDoLeftRight('down');
			  	 }
			     key_help.push({key:"<i class='icon-right-bold'></i>",title:"добавить дело вправо"});
			  	 if( (e.altKey==true) && (e.keyCode==39) ) { //alt + вправо
			       e.preventDefault();
				   jsHide_help();
				   api4tree.jsAddDoLeftRight('right');
			  	 }

			     if( (e.altKey==false) && (e.keyCode==9) ) { //TAB - в редактор / в дерево	
			        e.preventDefault();
				    jsHide_help();
			        if( !$("#redactor").is(":focus") ) {
			        	$(".redactor_").focus();
			        } else {
			        	$(".tree_active.mypanel").focus();
			        	console.info("tree_focus");
			        }
			     }
			  	   
			  if( (!($("input").is(":focus"))) && 
			  	  (!($(".redactor_editor:first").is(":focus"))) && 
			  	  (!($(".redactor_editor:last").is(":focus"))) && 
			  	  (!($("#redactor").is(":focus"))) && 
			  	  ($(".n_title[contenteditable='true']").length==0) && 
			  	  (!$(".makedone_h1").is(":focus")) && 
			  	  (!$(".comment_enter_input").is(":focus")) ) { //если мы не в редакторе




			     if( (e.altKey==false) && (e.keyCode==13) ) { //enter - запускаем редактирование
			        e.preventDefault();
					jsHide_help();
					jsStartRenameSelected();
			     }
			  	 if( (e.altKey==false) && (e.keyCode==40) ) { //вниз
			       e.preventDefault();
			       jsGo('down');
			  	 }
			  	 if( (e.altKey==false) && (e.keyCode==38) ) { //вверх
			       e.preventDefault();
			       jsGo('up');
			  	 }
			  	 if( (e.altKey==false) && (e.keyCode==37) ) { //влево
			       e.preventDefault();
			       jsGo('left');
			  	 }
			  	 if( (e.altKey==false) && (e.keyCode==39) ) { //вправо
			       e.preventDefault();
			       jsGo('right');
			  	 }
			  
			  	 if( (e.metaKey==false) && (e.keyCode==46) ) { //кнопка Del
			       e.preventDefault();
			       var title = $(".tree_active .selected .n_title").html();
			       if(title) {
				       if (confirm('Удалить "'+title+'"?')) {
				    	  api4tree.jsDeleteDo($(".tree_active .selected"));
				       }
				   }
			  	 }
			    } //если мы не в редакторе
			  	   
			     key_help.push({key:"",title:""});
			     key_help.push({key:"Enter",title:"редактирование заголовка", no_alt:true});
			     key_help.push({key:"Tab",title:"перейти в редактор/обратно", no_alt:true});

			  	 jsMakeHelpKeys(key_help); //заполнение подсказки клавиш
			 }); //keydown
			  
			  
		  }
		  
		  function jsMakeViewKeys() {
		  	  /*
			  $(".header_toolbar").delegate(".h_button","click", function () {
				  	if($(this).attr('id')=='pt4') { //дерево
				  		$(".top_panel").removeClass("panel_type2").
				  						removeClass("panel_type3").addClass("panel_type1");
				  	}
				  	if($(this).attr('id')=='pt3') { //большие иконки
				  		$(".top_panel").removeClass("panel_type2").
				  						removeClass("panel_type1").addClass("panel_type3");
				  		$(".top_panel .ul_childrens").remove();
				  		//$(".mypanel").scrollLeft(60000);
				  	}
				  
				  	if($(this).attr('id')=='pt2') { //панели
				  		$(".top_panel").removeClass("panel_type3").
				  						removeClass("panel_type1").addClass("panel_type2");
				  		$(".mypanel").scrollLeft(60000);
				  	}
				  	
				  	return false;
			  });
			  
			  
			  $("body").delegate("#v1,#v2,#v3,#v4","click", function () {
				  	if($(".view_selected").attr('id')!=$(this).attr('id')) {
				  		jsMakeView( $(this).attr("id") );
				  	}
				  	$("#v1,#v2,#v3,#v4").removeClass("view_selected");
				  	$(this).addClass("view_selected");
			  	return false;
			  });
			  */
			  
		  }
		  
	      //РЕГИСТРАЦИЯ ВСЕХ КНОПОК И СОБЫТИЙ
		  this.jsRegAllKeys = function() {
		  
		  	$("#start_welcome_page").on("click",function(){
			  if( !$("#welcome_screen").is(":visible") ) {
			  	jsLoadWelcome();
			  } else {
			  	jsHideWelcome();
			  }
			  return false;
			});

		  	(function startDropDownMenu(){
				var options = {minWidth: 420, arrowSrc: 'b_menu/demo/arrow_right.gif'};
				$('#main_menu').menu(options);
				
				var options = {minWidth: 320, arrowSrc: 'b_menu/demo/arrow_right.gif'};
				$('#makedone_menu').menu(options);
				
				var options = {minWidth: 320, arrowSrc: 'b_menu/demo/arrow_right.gif'};
				add_menu = $('#add_menu').menu(options);
		  	})(); //запускает выпадающее меню
			this_db.jsMakeIdleFunction(); //при бездействии системы
			jsMakeDraggable(); //перетаскиваемые элементы  
			api4others.jsMakePomidorKeys(); //система Помидорро
			api4editor.jsMakeWikiKeys(); //клики по ссылкам wiki
			jsMakeAddDoAndSearchKeys(); //кнопки для быстрого добавления дел
			api4panel.jsRegAllKeys(); //регистрирую кнопки панели
			jsMakePanelKeys(); //клавиши панели
			jsMakeChatKeys(); //клики связанные с чатом
			jsMakeSidePanelsKeys(); //боковые панели
			jsMakeCommentKeys(); //кнопки для комментариев
			jsMakeFavTabsKeys(); //кнопки нижних закладок под календарём и панелями
			jsMakeCalenarKeys(); //кнопки календариков и календаря
			jsMakeEditorKeys(); //кнопки редактора
			jsMakeRecurKeys(); //кнопки для панели настройки регулярных задач
			jsMakeMenuKeys(); //кнопки для меню
			jsMakeViewKeys(); //кнопки смена вида
			jsMakeWindowKeyboardKeys(); //регистрация всех горячих клавиш
			   
		  } //jsRegAllKeys
		      
		  //проверка, есть ли интернет    
		  this.jsIsOnline = function() {
		  	if (navigator.onLine == false) { //если интернета нет
				jsTitle("Интернет соединение отстутствует. Работаю локально.", 10000); 
				preloader.trigger("hide");
			   	return false;
		    } else {
		       	return true;
		    }
		  }
		  
		  //логирование любых 5 параметров в консоль
		  this.log = function(x1,x2,x3,x4,x5) { 
		    var time_dif = jsNow()-last_log_time;
		    last_log_time=jsNow();
		    if(need_log) { 
		      	console.info(log_i+". log("+time_dif+"ms): ",x1?x1:" ",x2?x2:" ",x3?x3:" ",x4?x4:" ",x5?x5:" "); 
		      	log_i++;
		    }
		  }

		  //установка главного массива снаружи и возврат его значения
		  this.js_my_all_data = function(set_my_all_data) {
		  	if(set_my_all_data) my_all_data2 = set_my_all_data;
		  	return my_all_data2;
		  }


		  //установка главного массива снаружи и возврат его значения
		  this.js_my_all_data2test = function(set_my_all_data) {
		  	var t1 = jsNow();
		  	var mysum = 0;
		  	for(j=0; j<100; j++)
		  	$.each(my_all_data,function(i,el){
		  		var ddd = my_all_data2["n"+el.id];
		  		if(ddd) if(set_my_all_data) mysum = crc32(ddd.text+mysum);
		  	});


		  	return jsNow()-t1;
		  }

		  //установка главного массива снаружи и возврат его значения
		  this.js_my_all_data2test3 = function(set_my_all_data) {
		  	var t1 = jsNow();
		  	var mysum = 0;
		  	for(j=0; j<100; j++)
		  	$.each(my_all_data,function(i,el){
		  		var ddd = my_all_data2["n"+el.id];
		  		if(ddd) if(set_my_all_data) mysum = crc32(ddd.text+mysum);
		  	});

		  	//Object.keys( aa ).length
		  	return jsNow()-t1;
		  }


		  this.js_my_all_data2test2 = function(set_my_all_data) {
		  	var t1 = jsNow();
		  	var mysum = 0;
		  	for(j=0; j<100; j++)
		  	$.each(my_all_data,function(i,el){

				var len = my_all_data.length;
				for(var i=0;i<len;i++) {
					var ell = my_all_data[i];
					if(ell && ell.id==el.id) {
						var ddd = my_all_data[i];
						break;
					}
				}
		  	
		  		if(set_my_all_data) mysum = crc32(ddd.text+mysum);
		  	});


		  	return jsNow()-t1;
		  }


		  //установка главного массива снаружи и возврат его значения
		  this.js_my_all_data2 = function(set_my_all_data) {
		  	if(set_my_all_data) my_all_data2 = set_my_all_data;
		  	return my_all_data2;
		  }

		  //установка главного массива комментариев снаружи и возврат его значения
		  this.js_my_all_comments = function(set_my_all_comments) {
		  	if(set_my_all_comments) my_all_comments = set_my_all_comments;
		  	return my_all_comments;
		  }

		  //инициализация базы данных
		  this.js_InitDB = function() {
		    api4tree.jsLoadTagsFromLocalStorage();
		  	diff_plugin = new diff_match_patch();
		  
		  	//схема структуры базы данных
		  	var author_store_schema = { //схема базы данных
	      	  name: global_table_name,  //для каждой таблицы своя схема
	      	  keyPath: 'id', // optional, 
	      	  autoIncrement: false // optional. 
	      	};
		  	
		  	var texts_store_schema = { //схема базы данных
	      	  name: global_table_name+"_texts",  //для каждой таблицы своя схема
	      	  keyPath: 'id', // optional, 
	      	  autoIncrement: false // optional. 
	      	};

		  	var comments_store_schema = { //схема базы данных комментариев
	      	  name: global_table_name+"_comments",  //для каждой таблицы своя схема
	      	  keyPath: 'id', // optional, 
	      	  autoIncrement: false // optional. 
	      	};

		  	var schema = {
		  	  stores: [author_store_schema, texts_store_schema, comments_store_schema]
		  	}; 
		  		  	
		  	if( navigator.userAgent.toLowerCase().indexOf("android") !=-1 ) {	  	
		  	var options = {mechanisms: ['websql', 'indexeddb']}; 
		  	alert("Добро пожаловать Андроид.");
		    } else {
		    	var options = {}; 
		    }
	  		db = new ydn.db.Storage('_all_tree', schema, options);
		  	
		  	this_db.log("(js_InitDB) База данных инициализирована");
		  	return db;
		  } //js_InitDB
		  		  	
		  //поиск любого элемента или установка его значений		  	
		  this.jsFind = function(id,fields,save_anyway) {
		    if(!my_all_data2) return false;
/*
			var len = my_all_data.length;
			for(var i=0;i<len;i++) {
				var el = my_all_data[i];
				if(el && el.id==id) {
					var answer = my_all_data[i];
					break;
				}
			}*/
			var answer = my_all_data2["n"+id];
//			var answer = my_all_data.filter(function(el,i) {
//				return el && el.id==id;
//			})[0];
			
			var add_auto_folder = this_db.jsFindAutoFolder("", id);
			if(add_auto_folder.length) {
				answer = [];
				$.each(add_auto_folder, function(i,el) {
					answer.push(el);
				});
				answer = answer[0];
			}
			
			
  		    if(answer && fields && !(/_/ig.test(answer.id.toString())) ) { //если нужно присваивать значения
			   var record;
  		       var is_changed = false;
  		       var fields_changed = JSON.stringify(fields);
  		       record = answer;
  		       //поле, где записаны все изменённые не синхронизированные поля:
  		       var changed_fields = record["new"]; 
  		       $.each(fields, function(namefield,newvalue) 
  		       	{ 		
  		       	if( (record[namefield]!=newvalue) || save_anyway) 
  		       		{
  		       		is_changed = true;

  		       		if(namefield=="id") { //если меняем id
						
						var element = record;
  		       			var old_id = id;
  		       			var new_id = newvalue;


			       		api4tree.jsFindLongText(old_id).done( function(longtext) {
			       			if(element.tmp_text_is_long>0) {
					       		db.put(global_table_name+"_texts", {id: new_id, text: longtext} ).done(function(){ 
					      			db.remove(global_table_name+"_texts",old_id.toString()).done(function(){
					      				console.info("Удалил элемент с длинным текстом id<0: ",old_id);
					      			});
				  	          	});
				       		} //если текст длинный


			  	        });

			  	        element.id = new_id;			  	        

   			       		db.put(global_table_name, element).done(function(){ 
			      			db.remove(global_table_name,old_id.toString()).done(function(){
			      				this_db.log("Удалил элемент с старым id<0: ",old_id);
			      			});
		  	          	});


  		       			answer = my_all_data2.renameProperty("n"+id, "n"+newvalue); //переименовываем в главном массиве
  		       			record = answer = my_all_data2["n"+newvalue];
  		       			
  		       			my_all_parents_clone = clone( my_all_parents["p"+old_id] );

  			   		if(my_all_parents_clone) 
  			   			$.each(my_all_parents_clone, function(k,child) {
	  			   			api4tree.jsFind(child.id, {parent_id: new_id});
	  			   			console.info("NEW ID!!!",child.id, {parent_id: new_id});
  			   			});

  			   			api4tree.jsRefreshParents();

  		       		} // namefield == "id"


  		       		if(namefield!="id") record[namefield] = newvalue;   //главное присвоение !!!!!!!!!!!!!!!!!!!

  		       		if(namefield=="parent_id") {
	  			   		api4tree.jsRefreshParents();
  		       		}


  		       		if(namefield=="text") {
		 	  		    if(newvalue.length==0) 
		       		       record["tmp_txt_md5"] = "";
		       		    else
		       		       record["tmp_txt_md5"] = ""; //crc32(newvalue).substr(0,5); //md5 штамп текста, для сверки с сервером
  		       		}
  		       		
  		       		//console.info("need_save: ",namefield," = ",newvalue);
  		   	   	  if((changed_fields.indexOf(namefield+",")==-1) && (namefield.indexOf("tmp_")==-1))
  		   	   	  		{ 
  		   	   	  		changed_fields = changed_fields + namefield + ","; 
  		   	   	  		}
  		       		}
  		       	});
  		       	
  		       if(is_changed) {
  		         record["new"] = changed_fields;

  		         //если не меняли время вручную и это не временное поле
  		         if( (!(/new,/ig.test(changed_fields)) && !(/time,/ig.test(changed_fields)) && 
  		         	  !(/tmp_/ig.test(fields_changed)) && (save_anyway != "dont_sync")) || 
  		         	  (save_anyway=="need_sync")) 
  		             {
  		             //если не скроллинг
  		             if(changed_fields!="s,") $("#node_"+id+" .sync_it_i:first").removeClass("hideit"); 
  		             record.time = parseInt(jsNow(),10); //ставлю время изменения (для синхронизации)
  		             start_sync_when_idle = true;
  		             }
  		         else
  		             {
  		             record["new"] = "";
  		             }
  		         
  		         var after_save1 = function() {};
  		         var after_save2 = function() {};
  		         
  		         if( (typeof fields.did   != "undefined") || //если нужно будет пересчитать следующие действия
	  		         (typeof fields.title != "undefined") ||
	  		         (typeof fields.date1 != "undefined") ||
	  		         (typeof fields.date2 != "undefined") ||
	  		         (typeof fields["del"]   != "undefined") ||
	  		         (typeof fields.id    != "undefined") ) {
   		         	after_save1 = function() { this_db.jsUpdateNextAction(); /*jsRefreshTree();*/ };
		  		 }

  		         if(typeof fields.parent_id != "undefined") { //если нужно пересчитать детей у родителей всего дерева
	  		         	after_save1 = function() { this_db.jsUpdateChildrenCnt(); };
		  		 }

  		         if( (typeof fields.did   != "undefined") || //если нужно будет пересчитать детей у родителя
	  		         (typeof fields["del"]   != "undefined") ||
	  		         (typeof fields.date1 != "undefined") ||
	  		         (typeof fields.date2 != "undefined") ||
	  		         (typeof fields.id    != "undefined") ) {
	  		         	after_save2 = function() { this_db.jsUpdateChildrenCnt( record.parent_id ); 
	  		         	};
		  		 }

	  		     //сохраняю в локальную базу данных    
		         db.put(global_table_name, record).done(function(){ after_save1(); after_save2(); });
  		       } 

		  	}
			
			return answer;
		  } //jsFind
		  
		  this.jsAddComment = function(tree_id,parent_id,text) {
		  	var new_id = -parseInt(1000000+Math.random()*10000000);
		  
		  	var new_line = my_all_comments.length;
		  	my_all_comments[new_line]=new Object(); 
		  	var element = my_all_comments[new_line];
		  
		  	element.id = new_id.toString();
		  	element.parent_id = parseInt(parent_id);
		  	element.tree_id = tree_id;
		  	element.text = text;
		  	element["del"] = 0;
		  	element["new"] = "";
		  	element.time = jsNow();
		  	element.add_time = jsNow();
		  	element.lsync = jsNow()-1;
		  	element.user_id = main_user_id;
		  	

			db.put(global_table_name+"_comments",element).done(function(){ 
				console.info("Новый элемент записан в базу: "+element.id); 
				start_sync_when_idle=true;
			});
			
			api4tree.jsUpdateCommentsCnt(element.parent_id);

		    return new_id;
		  }
		  
		  //находит комментарий
		  this.jsFindCommentFast = function(id,fields,save_anyway) {
		  	var d = new $.Deferred();
		  	
			var answer = my_all_comments.filter(function(el,i) {
				return el && el.id==id;
			})[0];
			
			return answer;
		  }
		  
		  //находит комментарий
		  this.jsFindComment = function(id,fields,save_anyway) {
		  	var d = new $.Deferred();
		  	
			var answer = my_all_comments.filter(function(el,i) {
				return el && el.id==id;
			})[0];
			
			if(answer) { //если комментарий найден
			  	var my_element = [];
				my_element.push(answer);
				db.get(global_table_name+"_comments",id.toString()).done(function(record) {
		    	    
		    	    var the_text = record?record.text.replace(/http:\/\/upload.4tree.ru\//gi,"https://s3-eu-west-1.amazonaws.com/upload.4tree.ru/"):"";
   	  				my_element[0].text = the_text;

   	  				if(fields) { //если нужно присваивать значения
   	  				   var record;
   	  				   var is_changed = false;
   	  				   var fields_changed = JSON.stringify(fields);
   	  				   record = answer;
   	  				   //поле, где записаны все изменённые не синхронизированные поля:
   	  				   var changed_fields = record["new"]; 
   	  				   $.each(fields, function(namefield,newvalue) {
   	  				   	if( (record[namefield]!=newvalue) || save_anyway) {
   	  				   		is_changed = true;
   	  				   		record[namefield] = newvalue;
   	  				   		
   	  				   		if((changed_fields.indexOf(namefield+",")==-1) && 
   	  				   		   (namefield.indexOf("tmp_")==-1)) {
   	  				   	  		changed_fields = changed_fields + namefield + ","; 
   	  				   	    }
   	  				   	}
   	  				   }); //each(fields)
   	  				   	
   	  				   if(is_changed) {
   	  				     record["new"] = changed_fields;
   	  				
   	  				     //если не меняли время вручную и это не временное поле
   	  				     if( ((changed_fields.indexOf("new,")==-1) && 
   	  				     	  (changed_fields.indexOf("time,")==-1) && 
   	  				     	  (fields_changed.indexOf("tmp_")==-1) && 
   	  				     	  (save_anyway != "dont_sync")) || 
   	  				     	  (save_anyway=="need_sync")) {
   	  				         //если не скроллинг
   	  				         if(changed_fields!="s,") $("#node_"+id+" .sync_it_i").removeClass("hideit"); 
   	  				         record.time = parseInt(jsNow(),10); //ставлю время изменения (для синхронизации)
   	  				         start_sync_when_idle = true;
   	  				     } else {
   	  				         record["new"] = "";
   	  				     }
   	  				     
   	  				     var after_save1 = function() { this_db.jsUpdateCommentsCnt(record.tree_id)};
   	  				
   	  				     //сохраняю в локальную базу данных    
   	  				     db.put(global_table_name+"_comments",record).done(function(){ 
   	  				     	after_save1(); 
   	  					 	d.resolve(my_element[0]);
   	  				     });
   	  				   } 
   	  				
   	  				} else {
	   	  				d.resolve(my_element[0]);
	   	  			}
   	  			});
   	  		} else {
	   	  		d.resolve();
   	  		}
			
			return d.promise();
		  }
		  
		  
		  
		  this.redo_last_step = function(id,text) {

			  var element = api4tree.jsFind(id);
			  
			  if(element) {
				  if(element.tmp_redo && element.tmp_redo != "[]") {
					var tmp_redo = JSON.parse( element.tmp_redo );
				  } else {
				  	var tmp_redo = [];
				  }				  
			  
			  if(tmp_redo.length==0) return false;
			  
			  var last_step_in_history = tmp_redo[tmp_redo.length-1];
			  var delta = last_step_in_history.delta;

			  var restored_text = diff_plugin.patch_apply(delta, text)[0];

			  api4tree.jsFindLongText(id, restored_text).done(function(x) { //сохраняю восстановленный текст
				  var element = api4tree.jsFind(id);
			  	  api4editor.jsRefreshRedactor(element);
				  console.info( last_step_in_history.md5, "?=" ,crc32(restored_text), restored_text );
				  tmp_redo = tmp_redo.slice(0,tmp_redo.length-1); //удаляем использованную delta
				  var json_tmp = JSON.stringify(tmp_redo);
				  api4tree.jsFind(id, {tmp_redo: json_tmp } );				 				  
			  }); 
			  
			  }
			  
		  }
		  
		  
		  this.undo_last_step = function(id,text) {

			  var element = api4tree.jsFind(id);
			  
			  if(element) {
			  
			  
				  if(element.tmp_undo && element.tmp_undo != "[]") {
					var tmp_undo = JSON.parse( element.tmp_undo );
				  } else {
				  	var tmp_undo = [];
				  }				  
			  
			  if(tmp_undo.length==0) return false;
			  
			  var last_step_in_history = tmp_undo[tmp_undo.length-1];
			  var delta = last_step_in_history.delta;

			  var restored_text = diff_plugin.patch_apply(delta, text)[0];

			  api4tree.save_text_dif_snapshot(id, restored_text, "tmp_redo"); //сохраняем для redo

			  api4tree.jsFindLongText(id, restored_text).done(function(x) { //сохраняю восстановленный текст
				  var element = api4tree.jsFind(id);
			  	  api4editor.jsRefreshRedactor(element);
				  console.info( last_step_in_history.md5, "?=" ,crc32(restored_text), restored_text );
				  tmp_undo = tmp_undo.slice(0,tmp_undo.length-1); //удаляем использованную delta
				  
				  
				  
				  var json_tmp = JSON.stringify(tmp_undo);
				  api4tree.jsFind(id, {tmp_undo: json_tmp } );				 				  
			  }); 
			  
			  }
			  
		  }
		  
		  this.save_text_dif_snapshot = function(id, text, tmp_redo) {
		  	  var tmp_redo = tmp_redo?tmp_redo:"tmp_undo";
		      var d=$.Deferred();
		      

			  element = api4tree.jsFind(id);
			  
			  if(element) {
				  if(element[tmp_redo]) {
					var tmp_undo = JSON.parse( element[tmp_redo] );
				  } else {
				  	var tmp_undo = [];
				  }				  
				  
				  api4tree.jsFindLongText(id).done(function(old_text){ //нахожу старый текст
					  var new_text = text;
					  
					  var delta = diff_plugin.patch_make(new_text, old_text);
					  
//					  console.info("DELTA of "+id+" =",delta);
//					  console.info("new=",crc32(new_text),new_text);
//					  console.info("old=",crc32(old_text),old_text);
					  
					  tmp_undo.push( {md5:"", md5new: "", delta: delta} );
	
					  if(tmp_undo.length>100) tmp_undo=tmp_undo.slice(1);
	
					  var json_tmp = JSON.stringify(tmp_undo);
					  var to_save = {};
					  to_save[tmp_redo] = json_tmp;
					  api4tree.jsFind(id, to_save );
					  d.resolve();					  
				  });

			  } //if(element)

/*		  	  if($(".redactor_").html().length<20) return 0;
			  if(!old_text) old_text = $(".redactor_").html();
			  var answer = this_db.savedif(1, old_text, $(".redactor_").html());
			  old_text = $(".redactor_").html(); */



			  return d.promise();
			  
		  }
		  
		  
			
		 //находит или меняет текст. Если текст длинный, закидывает в базу _texts
		 //api4tree.jsFindLongText(6796).done(function(text){console.log(text);})
		 this.jsFindLongText = function(id, newtext, dont_sync) {
	    	var d=$.Deferred();
			
		 	if(!id) { d.resolve(); return d.promise(); } //если нет id

			if(dont_sync=="dont_sync") { var save_anyway = "dont_sync"; }
			else { var save_anyway = "need_sync"; }
        	
        	if(typeof newtext != "undefined") { //если текст изменился
    			var element = this_db.jsFind(id);
    			if(!element) { d.resolve(); return d.promise(); }

 	  		    if(newtext.length==0) {
       		       element["tmp_txt_md5"] = "";
       		    } else {
       		       element["tmp_txt_md5"] = ""; //crc32(newtext).substr(0,5); //md5 штамп текста, для сверки с сервером
       		    }
       		    
       		    api4tree.save_text_dif_snapshot(id, newtext).done(function(x){

	    			if(newtext.length > LENGTH_OF_LONG_TEXT) { //если текст длинный
	    				var short_text = strip_tags(newtext).substr(0, LENGTH_OF_LONG_TEXT/2);
						
	    				this_db.jsFind(id,{ text:short_text, tmp_text_is_long:1 }, save_anyway);
	
	    	    		db.put(global_table_name+"_texts",{id:id.toString(),text:newtext}).done(function(){
	    		    		start_sync_when_idle = true; //запустим синхронизацию, когда пользователь будет бездействовать
	    	    			this_db.log("Сохранил длинный текст", newtext.length);
	    		    		d.resolve(newtext);
	    	    		});
	    			} else { //если текст короткий
	   		    		start_sync_when_idle = true; //запустим синхронизацию, когда пользователь будет бездействовать
	    				this_db.jsFind(id, { text:newtext, tmp_text_is_long:0 }, save_anyway);
	    	    		db.remove(global_table_name+"_texts",id).done(function(){});
	    				d.resolve(); 
	    				return d.promise();
	        		}

	       		    
       		    });

        	} else {
        		var myelement = api4tree.jsFind(id);
    			if(!myelement) { d.resolve(); return d.promise(); }
        		if(myelement.tmp_text_is_long!=1) {
	    	  		var the_text = myelement?myelement.text:"";
        			d.resolve(the_text);
        		} else {
	    	  		db.get(global_table_name+"_texts",id.toString()).done(function(record) {

	    	  			var the_text = (record && record.text)?record.text:"";
    		  			d.resolve(the_text);
			  			});
			  	}
    	  	}

	  		only_save = true; //следующая синхронизация будет односторонней и очень быстрой
    	  	return d.promise();
		 } //jsFindLongText
		 
		 this.jsProxyImage = function(text) {
		 	if( /http:/ig.test(text) ) {
//		 		console.info("PROXY IMAGES SAVED");
		 		
		 		var text_div = $("<div>"+text+"</div>");
		 		text_div.find("img").each(function(){
		 			var link = $(this).attr("src");
		 			if(/http:\/\//ig.test(link)) {
//		 				console.info("old_link_of_image", link);
		 				link = link.replace(/http:\/\//ig,"images/");
		 				console.info("new_link_for_image", link);
		 				$(this).attr("src", link); //присваиваем новую ссылку на прокси
		 				
		 			}
		 		});
		 		text = text_div.html();
//		 		console.info(text);
		 		
		 	}
		 	return text;
		 };
		 
		 this.jsFindLongTextComment = function(id,newtext) {
			 var d = $.Deferred();
   	  		 db.get(global_table_name+"_comments",id.toString()).done(function(record) {
   	  		 	if(newtext) {
   	  		 		record.text = newtext;
   	  		 		db.put(global_table_name+"_comments",record).done(function(record) {
   	  		 			console.info("Сохранил длинный текст = ", record.id);
	   	  		 		d.resolve(record?record:"");
   	  		 		});
   	  		 	} else {
   	  		 		d.resolve(record?record:"");
   	  		 	}
   	  		 	});
   	  		 return d.promise();
			 
		 }
		   	
		 function clone(obj) {
		     if (null == obj || "object" != typeof obj) return obj;
		     var copy = obj.constructor();
		     for (var attr in obj) {
		         if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
		     }
		     return copy;
		 }		   	
		   	
		 this.jsFindAutoFolder = function(parent_id,id) {
		 	 var answer=[];
		 	 
		 	 if(parent_id && (parent_id!=1) && ( !( /_/.test(parent_id) ) ) ) return answer;
		 	 	
		 	 if( (id && ( id.toString().indexOf("_")==-1 )) && id != 1) return answer;
		 	 	
		 	 var shablon={};
		 	 
			 shablon.id = -1;
			 shablon.title = "Title";
			 shablon.date1 = "";
			 shablon.date2 = "";
			 shablon.icon = "";
			 shablon.img_class = "note-clean";
			 shablon.parent_id = parent_id?parent_id.toString():"";
			 shablon.position = "999";
			 shablon.text = "<p>&#x200b;</p>";
			 shablon.did = "";
			 shablon["del"] = 0;
			 shablon.tab = 0;
			 shablon.fav = 0;
			 shablon.pas = "";
			 shablon.smth = "";
			 shablon.time = jsNow();
			 shablon.lsync = jsNow()+1;
			 shablon.user_id = main_user_id;
			 shablon.remind = 0;
			 shablon["new"] = "";
			 shablon.s = 0;
			 shablon.tmp_childrens = 0;
			 shablon.tmp_comments = 0;
			 shablon.tmp_text_is_long = 0;
			 
			 if(id == 1) {
				 	 var element = clone( shablon );
				 	 element.id = 1;
				 	 element.parent_id = 0;
				 	 element.position = "0";
				 	 element.title = "<i class='icon-home'></i> 4tree.ru";
				 	 element.tmp_childrens = api4tree.jsFindByParent(1).length;
					 answer.push(element);
			 }
		 	 
		 	 
			 if(parent_id==1 || id) {
			 
			 	 if(!id || id=="_contacts") {
				 	 var element = clone( shablon );
				 	 element.id = "_contacts";
				 	 element.parent_id = 1;
				 	 element.position = "998";
				 	 element.title = "<i class='icon-users'></i> Контакты";
				 	 element.tmp_childrens = 5;
					 answer.push(element);
				 }

			 	 if(!id || id=="_filters") {
				 	 var element = clone( shablon );
				 	 element.id = "_filters";
				 	 element.parent_id = 1;
				 	 element.position = "999";
				 	 element.title = "<i class='icon-shuffle'></i> Отборы";
				 	 element.tmp_childrens = 5;
					 answer.push(element);
				 }
			 }
			 
			 if(my_all_share && parent_id && (parent_id.toString().indexOf("tree_of_")!=-1)) {
			 	var frend_user_id = parent_id.replace("tree_of_","");
			 	var share_tree_id = my_all_share.filter(function(el,i){
				 	if(el.host_user == frend_user_id) {
					 	answer.push(api4tree.jsFind(el.tree_id));
				 		return true;
				 	}
			 	});
			 console.info("Tree_share:",share_tree_id);

			 }
			 
			 if(my_all_frends && parent_id && (parent_id=="_contacts" || id)) {
				 	
				 if(!id) {
				 	$.each(my_all_frends,function(i,frend){
					 	 var element = clone( shablon );
					 	 element.id = "user_"+frend.user_id;
					 	 element.icon = frend.foto;
					 	 element.parent_id = "_contacts";
					 	 element.position = i;
					 	 element.tmp_childrens = "3";
					 	 element.user_id = frend.user_id;
					 	 element.title = "<i class='icon-user'></i> "+frend.fio;
						 answer.push(element);
				 	});
				 }
			 }
			 
			 if(parent_id && parent_id.toString().indexOf("user_")!=-1) {
				 		 var user_id = parent_id.toString().replace("user_","")
				 		 var frend = api4tree.jsFrendById(user_id);
				 		 
					 	 var element = clone( shablon );
					 	 element.id = "tree_of_"+user_id;
					 	 element.parent_id = "user_"+user_id;
					 	 element.position = 1;
					 	 element.tmp_childrens = "2";
					 	 element.user_id = user_id;
					 	 if(frend.female == "1") {
 	 					 	 element.title = "<i class='icon-export-1'></i> поделилась со мной";
					 	 } else {
 	 					 	 element.title = "<i class='icon-export-1'></i> поделился со мной";
					 	 }
						 answer.push(element);

					 	 var element = clone( shablon );
					 	 element.id = "i_am_share_to_"+user_id;
					 	 element.parent_id = "user_"+user_id;
					 	 element.position = 2;
					 	 element.tmp_childrens = "2";
					 	 element.user_id = user_id;
					 	 if(frend.female == "1") {
 	 					 	 element.title = "<i class='icon-lock-open'></i> я делюсь с ней";
					 	 } else {
 	 					 	 element.title = "<i class='icon-lock-open'></i> я делюсь с ним";
					 	 }
						 answer.push(element);

					 	 var element = clone( shablon );
					 	 element.id = "chat_to_"+user_id;
					 	 element.parent_id = "user_"+user_id;
					 	 element.position = 3;
					 	 element.tmp_childrens = "2";
					 	 element.user_id = user_id;
					 	 element.title = "<i class='icon-chat-3'></i> Наши беседы";
						 answer.push(element);
						 
						 
			 }

			 if(parent_id=="_filters" || id) {
			 
			 	 if(!id || id=="_bytime") {
				 	 var element = clone( shablon );
				 	 element.id = "_bytime";
				 	 element.parent_id = "_filters";
				 	 element.position = 0;
				 	 element.tmp_childrens = "100";
				 	 element.title = "<i class='icon-clock-1'></i> 100 недавних изменений";
					 answer.push(element);
				 }

			 	 if(!id || id=="_bydate1") {
				 	 var element = clone( shablon );
				 	 element.id = "_bydate1";
				 	 element.parent_id = "_filters";
				 	 element.position = 1;
				 	 element.title = "<i class='icon-calendar'></i> По дате начала";
					 answer.push(element);
				 }

			 	 if(!id || id=="_share") {
				 	 var element = clone( shablon );
				 	 element.id = "_share";
				 	 element.parent_id = "_filters";
				 	 element.position = 2;
				 	 element.title = "<i class='icon-export'></i> Вы поделились";
					 answer.push(element);
				 }

			 	 if(!id || id=="_email") {
				 	 var element = clone( shablon );
				 	 element.id = "_email";
				 	 element.parent_id = "_filters";
				 	 element.position = 3;
				 	 element.title = "<i class='icon-mail-2'></i> Электронная почта";
					 answer.push(element);
				 }

			 	 if(!id || id=="_wiki") {
				 	 var element = clone( shablon );
				 	 element.id = "_wiki";
				 	 element.parent_id = "_filters";
				 	 element.position = 4;
				 	 element.title = "<i class='icon-link'></i> [[Wiki]] определения";
					 answer.push(element);
				 }

			 } //filters
			 
			 if(parent_id=="_bytime") {
				 var filtered_elements = []
				 $.each(my_all_data2, function(i, el) {
				     if (!((settings.show_did==false) && (el.did!=0)) && el && el.del!=1 ) filtered_elements.push(el);
				 });
				 
				 var clone_of_filtered = clone(filtered_elements);
				 
				 //сортировка по полю add_time
				 function sort_by_change_time(a,b) {
				   if (a.time < b.time)
				      return 1;
				   if (a.time > b.time)
				     return -1;
				 }
				 
				 clone_of_filtered.sort(sort_by_change_time);
			 
			 	$.each(clone_of_filtered, function(i,el){
			 	  if(i<100) {
				 	  el.position = i;
//				 	  el.parent_id = "_bytime";
					  answer.push(el);
				  }
			 	});
			 }
			 

			 return answer;
		 }
		   	
		 //поиск всех элементов родителя  	
		 this.jsFindByParent = function(parent_id) {

		 	var answer = [];
		 	var found = my_all_parents["p"+parent_id];

			/*var answer = my_all_data.filter(function(el,i) {
				if((settings.show_did==false) && (el.did!=0)) return false;
				return el && el.del!=1 && el.parent_id==parent_id;
			});*/

			//if(!answer) return [];
			if(found) {
				$.each(found, function(i, el){
					if( ((settings.show_did==true) || (el.did==0)) && (el.del==0)) {
						answer.push(el);
					}
				});
			}
			
			
			var add_auto_folder = this_db.jsFindAutoFolder(parent_id);
			if(add_auto_folder) {
				$.each(add_auto_folder, function(i,el) {
					answer.push(el);
				});
			}

			return answer;
		 }



		 //показываю все комментарии
		 this.jsShowAllComments = function(tree_id) {

		 	$("#comment_enter_place").append( $("#comment_enter") );
		 	var element = api4tree.jsFind(tree_id);
		 	if(!element) return false;
		 	
		 	
		 	
		 	this_db.jsFindByTreeIdComment(tree_id).done(function(comments){
			 	 var comments_count = this_db.jsFindByTreeIdCommentFast(tree_id).length;
			 	 myhtml_for_comments = '<h3><i class="icon-comment"></i> Комментарии ('+comments_count+')</h3>';
			 	
				 //сортировка по полю add_time
				 function sort_by_add_time(a,b) {
				   if (a.add_time < b.add_time)
				      return -1;
				   if (a.add_time > b.add_time)
				     return 1;
				     
				 }
				comments = comments.sort(sort_by_add_time);
			 	this_db.jsShowComments(comments,tree_id, 0); //комменты добавляются в myhtml_for_comments
			 	
			 	if(comments_count==0 || !comments_count) comments_count = "<i class='icon-down-open'></i>";
			 	$("#tree_1 #node_"+tree_id+" .tcheckbox:first").html(comments_count);
			 	$("#tree_2 #node_"+tree_id+" .tcheckbox:first").html(comments_count);
			 	myhtml_for_comments += "";
			 	$("#tree_comments_container").html(myhtml_for_comments); //выводим на экран
			 	//onResize(); 
			 	//if( $("#tree_news").is(":visible") ) api4tree.jsShowNews(0);
			});
		 }

		 function jsFilterCommentsByParent(comments,parent_id) {
			 	var answer = comments.filter(function(el,i) {
			 	    return el && el.del!=1 && el.parent_id==parent_id;
			 	});
			 	return answer;
		 }

		 //рекурсивно заполняет глобальную переменную myhtml_for_comments сообщениями комментариев
		 this.jsShowComments = function(comments,tree_id, parent_id) 
		 {
		 	var source = $("#comment_template").html();
		 	template = Handlebars.compile(source);
		 	
			 	var this_level_comments = jsFilterCommentsByParent(comments, parent_id);
			 	
			 	$.each(this_level_comments, function(i,d)
			 		{
			 		var frend = this_db.jsFrendById(d.user_id);
			 		d.foto = frend?frend.foto:"";
			 		d.name = frend?frend.fio:"";
			 		d.tree_title = "";
			 
			 		if(d.add_time=="0")  d.add_time_txt = "";
			 		else
			 			{
			 			var add_time = new Date( parseInt(d.add_time) );
			 			d.add_time_txt = add_time.jsDateTitleFull("need_short_format");
			 			}
			 		
			 		myhtml_for_comments += template(d);
			 		
			 		if(jsFilterCommentsByParent(comments,d.id).length>0)
			 		  {
			 		  myhtml_for_comments +="<ul>";
			 		  this_db.jsShowComments(comments,tree_id, d.id);
			 		  myhtml_for_comments +="</ul>";
			 		  }
			 		
			 	});
		 }
		 
		 //информация о друге
		 this.jsFrendById = function(user_id) {
		 	if(!my_all_frends) return false;
		 	var answer = my_all_frends.filter(function(el,i) 
		 			{ 
		 			return el.user_id == user_id;
		 			});
		 	return answer[0];
		 }		 

		 //отбор комментариев по tree_id без текстов
		 this.jsFindByTreeIdCommentFast = function(tree_id) {
			
			if(!my_all_comments) return false;

			var myanswers = my_all_comments.filter(function(el,i) {
				if(el["del"] == 1) return false;
				return el && el.tree_id==tree_id;
			});
			
			return myanswers;
		 }

		 //отбор комментариев по tree_id с текстами
		 this.jsFindByTreeIdComment = function(tree_id) {
		  	var d = new $.Deferred();
		  	
			var myanswers = my_all_comments.filter(function(el,i) {
				return el && el.tree_id==tree_id;
			});
			
			if(myanswers) { //если комментарий найден
				var dfdArray = [];
				var my_elements =[];
				$.each(myanswers, function(i, element){
					var id = element.id;
					var done_element = this_db.jsFindLongTextComment(id.toString()).done(function(record) {
	   	  				my_elements.push( record ); 
	   	  			});
	   	  			dfdArray.push( done_element );
   	  			}); //each

   	  			$.when.apply( null, dfdArray ).then( function(x){ //выполняю тогда => все длинные тексты считаны
   	  			    d.resolve(my_elements);
   	  			});
   	  		 } else {
	   	  		 d.resolve(); //если ничего не найдено
   	  		 } //if(answer)

			return d.promise();
		 }

		 //отбор комментариев по parent_id		 
		 this.jsFindByParentComment = function(parent_id) {
		  	var d = new $.Deferred();
		  	
			var myanswers = my_all_comments.filter(function(el,i) {
				return el && el.parent_id==parent_id;
			});
			
			if(myanswers) { //если комментарий найден
				var dfdArray = [];
				var my_elements =[];
				$.each(myanswers, function(i, element){
					var id = element.id;
					var done_element = this_db.jsFindLongTextComment(id.toString()).done(function(record) {
	   	  				my_elements.push( record ); 
	   	  			});
	   	  			dfdArray.push( done_element );
   	  			}); //each

   	  			$.when.apply( null, dfdArray ).then( function(x){ //выполняю тогда => все длинные тексты считаны
   	  			    d.resolve(my_elements);
   	  			});
   	  		 } else {
	   	  		 d.resolve(); //если ничего не найдено
   	  		 } //if(answer)

			return d.promise();
		 }

		 //отбор комментариев по parent_id		 
		 this.jsFindByParentCommentFast = function(parent_id) {

			var myanswers = my_all_comments.filter(function(el,i) {
				if(el.del==1) return false;
				return el && el.parent_id==parent_id;
			});
			
			return myanswers;
		 }

		 
		 //добавление нового элемента в базу к родителю parent_id
		 this.jsAddDo = function(parent_id,title,date1,date2,position,dont_parse_date) {
			var remind_time = 0;
			if(parseInt(parent_id)) {
				$("#node_"+parent_id).find(".icon-play-div:first").css("opacity",1);
			}
			
			//если новый элемент нужно положить в папку "_НОВОЕ"
		 	if(parent_id=="to_new_folder") {
		     	var parent_id = api4tree.jsCreate_or_open(["_НОВОЕ"]);
		 	} //to_new_folder
 
			var new_id = -parseInt(1000000+Math.random()*10000000);
			
			//var new_line = my_all_data.length;
			my_all_data2["n"+new_id] = {}; 
			var element = my_all_data2["n"+new_id];
			if(!my_all_parents["p"+parent_id]) my_all_parents["p"+parent_id] = [];
			my_all_parents["p"+parent_id].push(element);


		 	if(!dont_parse_date) {
			 	var mynewdate = api4tree.jsParseDate(title).date;
			 	if(mynewdate!="") {
				 	date1 = mynewdate.toMysqlFormat();
				 	if(title.toLowerCase().indexOf("смс")!=-1 || 
				 	   title.toLowerCase().indexOf("sms")!=-1 || 
				 	   title.toLowerCase().indexOf("напомни")!=-1 ) {
				 	   		var remind_time_default = localStorage.getItem("remind_time");
				 	   		remind_time = remind_time_default?remind_time_default:15;		    
				 	}
				}
			}

			if(position == "last") {
				var max= -100000000; 
				$.each(api4tree.jsFindByParent(parent_id),function(i,el){ current_p = parseFloat(el.position); if(max<current_p) max=current_p; });
				if (max == -100000000) max = 1;
				position = max + 10;
			}
			
			title = strip_tags(title).substr(0,2000);
			
			element.id = new_id.toString();
			element.title = title;
			element.date1 = date1?date1:"";
			element.date2 = date1?date2:"";
			element.icon = "";
			element.img_class = "note-clean";
			element.parent_id = parent_id.toString();
			element.position = position?position:0;
			element.text = "<p>&#x200b;</p>";
			element.did = "";
			element["del"] = 0;
			element.tab = 0;
			element.fav = 0;
			element.pas = "";
			element.smth = "";
			element.time = jsNow();
			element.lsync = jsNow()-1;
			element.user_id = main_user_id;
			element.remind = remind_time;
			element["new"] = "";
			element.s = 0;

			db.put(global_table_name,element).done(function(){ 
				console.log("Новый элемент записан в базу: "+element.id,element.text); 
				start_sync_when_idle=true;
			});
			api4tree.jsUpdateChildrenCnt(element.parent_id);
			
			return element;
		 }
		 
		 var update_timer1;
		     		  
		 //кэширует в базе tmp_next (id следующего по дате дела)    
		 this.jsUpdateNextAction = function(id) {
		 	clearTimeout(update_timer1);
		 	update_timer1 = setTimeout(function(){			 	
				 	console.info("jsUpdateNextAction",id);
					this_db.log("Start filter Date");
					var answer = []
					$.each(my_all_data2, function(i, el) {
					    if(el.tmp_nextdate) {  //стираю временные поля установленные ранее
					   		this_db.jsFind(el.id,{tmp_nextdate:"",
					   							  tmp_next_id:"", 
					   							  tmp_next_title:""});
					    }
					    if (!((el.del==1) || (el.did!=0)) && el && el.date1!="" ) answer.push(el);
					});
					
					//console.info("Найдено "+answer.length+" записей с датой");
					
					$.each(answer,function(i,el) { //обходим все элементы с датой
					    var id_parent = el.id;
					    var j=0,old_id;
					    
					    while(j<100) {//не больше 100 уровней вложенности, чтобы исключить бесконечность
					    	old_id = id_parent;
					    	element = this_db.jsFind(id_parent);
					    	if(!element) {
					    		j++; console.info(id_parent,"!!!Не обнаружен"); 
					    		api4tree.jsFind( el.id, {parent_id:"1"});
					    		continue;
					    	}
					    	id_parent=element.parent_id;
					    	
					    	if( ((!element.tmp_nextdate) || (element.tmp_nextdate > el.date1)) && (el.id!=element.id)) {
					    		element.tmp_nextdate = el.date1; //устанавливаю новые поля
					    		element.tmp_next_id = el.id;
					    		element.tmp_next_title = el.title;
					    		this_db.jsFind(element.id,{tmp_nextdate:el.date1,
					    								   tmp_next_id:el.id, 
					    								   tmp_next_title:el.title});
					    	}
					    	
					    	if((id_parent==1) || (!id_parent)) break;
					    	j++;
					    }
					 });
					 this_db.log("finish jsUpdateNextAction");
		 	}, 500);
		 } //jsUpdateNextAction
		    
		 //кэширует в базе кол-во комментариев
		 this.jsUpdateCommentsCnt = function(id) {
		 	console.info("jsUpdateCommentsCnt",id);
			this_db.log("start jsUpdateCommentsTmpCnt: id="+id);
			if(!id) { //если нужно обработать все элементы базы
				$.each(my_all_data2, function(i, el){ 
			        if(el) {
			    	   	var tmp_comments = this_db.jsFindByTreeIdCommentFast(el.id).length;
			    	   	this_db.jsFind(el.id.toString(),{tmp_comments:tmp_comments});
			    	}
			    });
			} else { //если нужно посчитать детей только id родителя
	    	   	var tmp_comments = this_db.jsFindByTreeIdCommentFast(id).length;
				this_db.jsFind(id.toString(),{tmp_comments:tmp_comments});
			}
			this_db.log("finish jsUpdateCommentsTmpCnt");
		 }
		     
		 //кэширует в базе tmp_childrens, для быстрой работы (кол-во детей)
		 this.jsUpdateChildrenCnt = function(id) {
		 
		 	return false;
		 	console.time("updateCnt");
			this_db.log("start jsUpdateChildrenTmpCnt: id="+id);
			if(!id) { //если нужно обработать все элементы базы
				$.each(my_all_data2, function(i, el){ 
			        if(el) {
			    	   	var tmp_childrens = 0; //this_db.jsFindByParent(el.id).length; /TEST
			    	   	this_db.jsFind(el.id.toString(),{tmp_childrens:tmp_childrens});
			    	}
			    });
			} else { //если нужно посчитать детей только id родителя
				this_db.jsFind(id.toString(),{tmp_childrens:this_db.jsFindByParent(id).length});
			}
		 	console.timeEnd("updateCnt");
			this_db.log("finish jsUpdateChildrenTmpCnt");
		 } //jsUpdateChildrenCnt
		   	
		   	
		 this.jsClearCurrentBase = function() { //очищаем существующую базу данных
		    	var d=$.Deferred();
		 
		    	if( JSON.stringify(db.getSchema().stores).indexOf('tree') != -1 ) //если таблицы tree нет


					db.clear(global_table_name+"_comments").done(function(){
					   	jsProgressStep();
					   	db.clear(global_table_name).done(function(){
					   	    jsProgressStep();
						   	db.clear(global_table_name+"_texts").done(function(){
							   	 jsProgressStep();
							   	 console.info("db cleared"); 
							   	 d.resolve(); 
							});
					    });
					});
		    	return d.promise();
		 }
		   	
		   	
		   	
		 //загружаю данные с сервера в внутреннюю базу данных
		 this.js_LoadAllDataFromServer = function() {
		 	var d = new $.Deferred();
		 	var d1 = new $.Deferred();
		 	var d2 = new $.Deferred();
		 	var d3 = new $.Deferred();
		 	if(!this_db.jsIsOnline) return true; //есть ли интернет
		 	setTimeout(function(){ this_db.log("Тип базы данных: "+db.getType());},500 );
		 	this_db.log("Удаляю локальную DB");
		    var dfdArray = [];


		db.clear(global_table_name+"_texts").done(function(){
		 	db.clear(global_table_name+"_comments").done(function(){
			   jsProgressStep();
		 	   db.clear(global_table_name).done(function(){
			 	jsProgressStep();
		 	    this_db.log("Удалил локальную DB. Читаю данные с сервера.");
		 	    var sync_id = this_db.jsGetSyncId();
		 	    
   			jsGetToken().done(function(token){

		 	    var lnk = web_site + "do.php?access_token=" + token + "&get_all_data2="+jsNow()+"&sync_id="+sync_id; 
		 	    $.getJSON(lnk,function(data){
		 	       jsProgressStep();
			   	   this_db.log("Загрузил с сервера ",Object.size(data.all_data)," элементов");
		      	   
		      	   var long_texts=[]; //длинные тексты храню в отдельной базе данных
		      	   my_all_data2 = {}; //стираю главный массив
		      	   my_all_parents = {}; //стираю родителей
		      	   var lsync_now = jsNow()+500; //дата последней синхронизации +40, чтобы не синхронизировалось сразу
		      	   var my_all_data_tmp = [];

		    	   $.each(data.all_data, function(i, value) {

		        	    value["new"] = "";
		        	    value.lsync = lsync_now;
		   
		        	    if(value["text"].length==0) 
		        	    	  value["tmp_txt_md5"] = "";
		        	    else
		        	       value["tmp_txt_md5"] = "";
		        	       	
		        	    if(value["text"].length>LENGTH_OF_LONG_TEXT) {
	        	    		long_texts.push({id:value.id, text:value.text});
	        	    		value.text = strip_tags(value.text).substr(0,LENGTH_OF_LONG_TEXT/2); //preview
	        	    		value.tmp_text_is_long = 1;
        	    		} else {
        	    			value.tmp_text_is_long = 0;
        	    		}

		    	    	my_all_data2["n"+value.id] = value;
		    	    	if(!my_all_parents["p"+value.parent_id]) {
		    	    		my_all_parents["p"+value.parent_id]=[];
		    	    	}
		    	    	my_all_parents["p"+value.parent_id].push( value );
		    	    	my_all_data_tmp.push(value);
		    	    });
 
		      	   this_db.log("Создал массив. Сохраняю локально.");
			  	   jsProgressStep();		      	   
		      	   if(data.comments) {
			      	    my_all_comments = [];
		      	   		$.each(data.comments, function(i, value) {
			      	   		value["new"]="";
			      	   		value["lsync"] = lsync_now;
			      	   		my_all_comments.push(value);
		      	   		});
			      	   	var dfd1 = db.put(global_table_name+"_comments", my_all_comments).done(function(ids){
							console.info("saved_comments",ids);
							my_all_comments = [];
							$.each(data.comments, function(i, value) {
							    value["text"]="";
							    my_all_comments.push(value);
							});
							console.info(my_all_comments);
							d1.resolve();
			      	   	}).fail(function(e){ console.info("error",e); });
			      	   	d1.promise();
   			      	    dfdArray.push(d1);

			      	   	
		      	   } else {
			      	    my_all_comments = [];
		      	   }
		      	   jsProgressStep();

		      	   var dfd2 = db.put(global_table_name, my_all_data_tmp).done(function(ids) { //сохраняю главный массив
		      	       this_db.log(ids.length+' записей записано в лок.базу = '+this_db.SizeOfObject(my_all_data_tmp)+'b');
		      	       jsProgressStep();
		      	       d2.resolve();
		      	   }, function(e) {
		      	       throw e;
		      	   }).fail(function(e){ console.info("error",e); });
		      	   d2.promise();
		      	   dfdArray.push(d2);
		      	   console.info("Копирую в базу длинные тексты: "+this_db.SizeOfObject(long_texts));

		      	var dfd_longtext = [];

		      	$.each( long_texts, function(i, one_long_text) {
		      	   dfd_longtext[one_long_text.id] = new $.Deferred();
		      	   var dfd3 = db.put(global_table_name+"_texts", one_long_text).done(function(ids) { //сохраняю длинные тексты
//		      	       console.info(ids.length+' длинный текст = '+this_db.SizeOfObject(one_long_text)+'b');
		      	       dfd_longtext[one_long_text.id].resolve();
		      	   }, function(e) {
		      	       throw e;
		      	   }).fail(function(e){ console.info("error",e); });
		      	   dfd_longtext[one_long_text.id].promise();
		      	   dfdArray.push(dfd_longtext[one_long_text.id]);
		      	});

					$.when.apply( null, dfdArray ).done( function(x){
		      	       jsProgressStep();
		      	       long_texts="";//очищаю память
		      	       this_db.jsUpdateNextAction();
		      	       jsProgressStep();
		      	       this_db.jsUpdateChildrenCnt();
		      	       this_db.jsUpdateCommentsCnt();
		      	       jsProgressStep();
		      	       setTimeout(function(){ d3.resolve(); },1500);
		      	       
		      	       $(this_db).triggerHandler({type:"SyncIsFinished",value:jsNow()});		    	
						d.resolve();
					});

		 	    }); //getJSON
		 	    
		 	});//jsGetToken    
		 	    
		 	  }); //clear(4tree_db)
		 	}); //comments_db_clear
		});



			return d.promise();
	  	 } //js_loadAllDataFromServer
		     
		 //загружаю в массив все данные из локальной DB

		 this.js_LoadAllFromLocalDB = function() {
		 	
	  		var d=new $.Deferred();
	  				this_db.log("Начинаю загрузку данных из локальной DB");
		    		db.values(global_table_name,null,MAX_VALUE).done(function(records) {
		    			this_db.log("Загрузил из локальной DB: " + records.length + " записей");
		    			//my_all_data = records; //?????

		    			var len = records.length;
		    			for(var i=0;i<len;i++) {
		    				var element = records[i];
		    				my_all_data2["n"+element.id] = element;
		    				if(!my_all_parents["p"+element.parent_id]) {
		    					my_all_parents["p"+element.parent_id]=[];
		    				}
		    				my_all_parents["p"+element.parent_id].push( element );
		    			}
		    			

		    			if(records.length==0) {
		    				this_db.log("База пуста! Загружаю с сервера.");
		    				
	    				    //база пустая, загружу всё с сервера
	    					$("#pload_text").html("Загружаю данные с сервера...<br>На запросы браузера разрешить локальное хранение данных, отвечайте <b>разрешить (увеличить)</b>.");
	    					jsProgressStep();
	    					api4tree.js_LoadAllDataFromServer().done(function(){ 
	        					jsProgressStep();
   								this_db.jsUpdateChildrenCnt();
	        					jsProgressStep();
   								this_db.jsUpdateNextAction();		    						
	        					jsProgressStep();
	    						d.resolve(); 
	    					});
	    				return d.promise();
		    			} else {

   					    //загружаю комментарии
   						db.values(global_table_name+"_comments",null,MAX_VALUE).done(function(records) {
   							my_all_comments = [];
   							var len=records.length;
   							for(var i=0; i<len; i++) {
   								rec = records[i];
   								rec.text = "";
	   							my_all_comments.push( rec );
   							}
   							jsProgressStep();
   							jsProgressStep();
   							setTimeout(function(){
   								this_db.jsUpdateChildrenCnt();
   								this_db.jsUpdateNextAction();		    						
   							}, 2000);

   							d.resolve();
   						});
		    			} //else records.length != 0
		    		});
		    		
	  		return d.promise();
	  	 } //js_LoadAllFromLocalDB
		     
	     //грубый подсчёт размера массива объектов
		 this.SizeOfObject = function( object ) {
			 		var objectList = [];
			 		var recurse = function( value )
			 		{
			 		    var bytes = 0;
			 		    if ( typeof value === 'boolean' ) {
			 		        bytes = 4;
			 		    }
			 		    else if ( typeof value === 'string' ) {
			 		        bytes = value.length * 2;
			 		    }
			 		    else if ( typeof value === 'number' ) {
			 		        bytes = 8;
			 		    }
			 		    else if
			 		    (
			 		        typeof value === 'object'
			 		        && objectList.indexOf( value ) === -1
			 		    )
			 		    {
			 		        objectList[ objectList.length ] = value;
			 		        for( i in value ) {
			 		            bytes+= 8; // an assumed existence overhead
			 		            bytes+= recurse( value[i] )
			 		        }
			 		    }
			 		
			 		    return bytes;
			 		}
			 		return recurse( object );
		 } //SizeOfObject
		 
		 //создаёт архив всех заметок из 4tree
		 this.jsZipTree = function() {
		   var zip = new JSZip();
		   
		   $.each(my_all_data2,function(i,el){
		   		if(el && el.del!="" && el.did=="") {
				 	var d=new Date; 
				 	var today_date = d.jsDateTitleFull();  
				 	  
				 	var path = api4tree.jsFindPath(api4tree.jsFind(el.id)).textpath;
				 	path = path.replace(" → ","/").replace(" → ","/").replace("→","/");
				 	path = strip_tags(path);
				 
				   	var text = el.text;
				   	text = text.replace('data/','http://4tree.ru/data/');
				   	text = text.replace('.upload/','http://4tree.ru/upload/');
				   	text = text.replace('"upload/','"http://4tree.ru/upload/');
				   	text = text.replace('"data/','"http://4tree.ru/data/');
				   	
				   	text = "<h2>"+el.title+"</h2>"+text;
				   	
				   	var mytitle = el.title;
				   	if(mytitle) {
				   		mytitle = strip_tags( mytitle.replace("/","|").replace("→","/") );
			   		}
				   	
				   	if(text.length>1) {
				   	  	zip.file("4tree-Архив ("+today_date+")/"+path+mytitle+".html", text);
			   	  	}
				}
		   	})
		 
		   // data URI
		 //  var content = zip.generate();
		   $("#wrap").append("<div id='download-zip-div'><a id='zip-archive' href=''>ZIP архив всего вашего дерева</a><br><br><br><a href='#' class='close_zip'>закрыть окно</a></div>");
		     
		   $(".close_zip").on("click",function(){ $("#download-zip-div").remove(); });
		     
		   // Blob
		   var blobLink = document.getElementById('zip-archive');
		   try {
		     blobLink.download = "4tree_archive_"+sqldate(jsNow())+".zip";
		     blobLink.href = window.URL.createObjectURL(zip.generate({type:"blob"}));
		   } catch(e) {
		     blobLink.innerHTML += " (not supported on this browser)";
		   }
		 }
		     
		 //api4tree.js_Calculate_md5_from_local_DB().done(function(x){console.info(x)})
		 //вычисляю md5 всех данных из локальной DB
	     this.js_Calculate_md5_from_local_DB = function() { 
         	var d=$.Deferred();
         	var dfdArray = [];
         	db.values(global_table_name,null,MAX_VALUE).done(function(records) {
         	   var answer=[],len;
//         	   console.info(records)
    	       $.each(records, function(i,el)
    	       	{
    	       	
			   	var done_element = this_db.jsFindLongText(el.id).done(function(longtext){

			   		var tmp_txt_md5 = hex_md5(longtext).substr(0,5);
	    	       	var alldata = (el.id?el.id:"") + (el.title?el.title:"") + (tmp_txt_md5?tmp_txt_md5:"") + 
    		       				  (el.date1?el.date1:"") + (el.date2?el.date2:"") + 
				   				  (el.did?el.did:"");

			   		var mymd5 = hex_md5( alldata ).substr(0,5);
//			   		console.info(el.id)
			   		if(el.id==6403 && false) {
				   		console.info("3340 = ",alldata,mymd5);
			   		}
			   		answer.push({ id:el.id, md5:mymd5 });

			   	});
					    	
			    dfdArray.push( done_element );
    	       	
    	       	});
    	       	
			   	$.when.apply( null, dfdArray ).then( function(x){
				   	d.resolve(answer);
			   	});
    	       	
         	  
         	});
         	return d.promise();
         }
		     

		 //сверяю md5 сервера с локальной DB
	     this.js_Compare_md5_local_vs_server = function() { 
		    if(!this_db.jsIsOnline) { d.resolve(); return d.promise(); } //есть ли интернет
	     	var d=$.Deferred();
	     	var sync_id = this_db.jsGetSyncId();
   		jsGetToken().done(function(token){

	     	var lnk = web_site + "do.php?access_token=" + token + "&get_all_data2="+jsNow()+"&sync_id="+sync_id+"&only_md5=1"; 
	     
  			var fixed_count = 0;
	     	$.getJSON(lnk,function(data){
	         	api4tree.js_Calculate_md5_from_local_DB().done(function(md5) {
	     			var test_ok = "выполнил успешно.";
	 	    		$.each(md5, function(i,el)
	 		    		{ 
	 		    		if( (el.id>0) && (el.md5!=data.md5[el.id]) )
	 		    			{
	 			    		console.info("!!!!!MD5!!!!!Данные на сервере не совпадают"+
	 			    					 " с локальными:",el.id,el.md5, data.md5[el.id],api4tree.jsFind(el.id)); 
	 			    		fixed_count += 1;
	 			    		
	 			    		if(fixed_count<100) {
	 			    		trampampam = this_db.jsFind(el.id,{lsync:0, time:0}); //восстанавливаю целостность, забирая элемент с сервера
	 			    		}
	 			    		test_ok = "сделал. Исправил ошибки.";
	 			    		}
	 		    		});

	    		if(fixed_count>0) api4tree.jsSync();
	
	 		    jsTitle("Сверку с сервером "+test_ok, 30000);
   	 	    	d.resolve(test_ok);
	     		}); //done
	         }); //JSON
	     	
	     }); //jsGetToken
	     
	         return d.promise();
	     }
	     	
	     //убираем все данные, кроме изменённых, чтобы экономить трафик в POST
	     function jsDry(data,i_am_from_comments) {
	         var answer1 = new Array();
	         $.each(data, function(i,node){
	         	var changed_fields = node['new'];
	         	var element = new Object;
	         	element.id = node.id;
	         	if((node.id<0) || (node["new"]=="") ) { //если нужно отправить все данные
	         		if(i_am_from_comments) {
		         		element = node;	
	         		} else {
		         		element = this_db.jsFind(node.id);
		         	}
	         		answer1.push(element);
	         		changed_fields = "";
	         	} else {
		         	$.each(node, function(keyname, keyvalue) { //если нужно отправить только изменившиеся поля
		         		if(changed_fields)
		         		  if(( changed_fields.indexOf(keyname+',') != -1 ) || keyname=="time" || keyname=="lsync1" )
		         			{
		         			element[keyname] = keyvalue;
		         			}
		         	});
	         	}
	         	
	         	if(changed_fields) answer1.push(element);
	         	});
	         
	         return answer1;
	     }

	     	
	     //отображает статусы начала и окончания синхронизации
	     function startSync(status) { 
	     	if(status=="start") {
				preloader.trigger("show");
				//$(".sos").css("opacity","1");
				//$(".sos .icon-cd").css("color","#417b2e");
				this_db.log("Начинаю синхронизацию.");
				sync_now = true;
				clearTimeout(sync_now_timer);
				sync_now_timer = setTimeout(function(){ 
					startSync();
				}, 30000); //если синхр.не прошла сама
			} else {
				preloader.trigger("hide");
				//$(".sos").css("opacity","");
				//$(".sos .icon-cd").css("color","");
				this_db.log("Синхронизация завершена.");
				sync_now = false;
				clearTimeout(sync_now_timer);
			}
			
     	 }
	     	
     	 //Устанавливаю индентификационный код (емайл + текущее время + инфо о браузере)
	     this.jsGetSyncId = function() { 
	     	var sync_id = localStorage.getItem("sync_id"); 
	     	if(!sync_id) {
	     		var time_id = $.cookie("4tree_email_md") + '-' + jsNow() + '-' + navigator.userAgent;
	     		sync_id = crc32(time_id).substr(0,5)+"@"+sqldate( jsNow() )+"";
	     		localStorage.setItem("sync_id",sync_id);
	     		sync_id = localStorage.getItem("sync_id");
	     	}
	     	return sync_id;
	     }
	     	
	     //нахожу время последней синхронизации, ориентируюсь на поле .time и .lsync
	     this.jsFindLastSync = function() {
	     	var maxt = 0; 
	     	var mint = Number.MAX_VALUE,lsync,changetime; 
	     	
	     	if(my_all_data2) {
		     	
	     		$.each(my_all_data2, function(i,el){

		     		if(!el) return true;
		     		lsync = el.lsync; 
		     		changetime = el.time; 
		     		if(lsync>maxt) maxt=lsync; 
		     		if( (changetime>lsync) && (changetime<mint) && el.id!=6562 ) {
		     			mint=parseInt(changetime,10); 
		     			console.info("for_mint", el.id, el);
		     		}
		     	
	     		});
	     	}
	     	
		 	if(my_all_comments)
		 	{
		 	var mc_len = my_all_comments.length;
		 	for(i=0;i<mc_len;i++) 
		 		{ 
		 		var lsync = my_all_comments[i].lsync; 
		 		var changetime = my_all_comments[i].time; 
		 		if(lsync>maxt) maxt=lsync; 
		 		if(changetime>lsync) 
		 			if( mint>changetime ) mint=parseInt(changetime,10); 
		 		}
		 	}
	     	
	     	
	     	if(mint<maxt) return mint;
	     	else return maxt;
	     }
	     	
	     //заменяет отрицательный id на положительный
	     function jsChangeNewId(from_server_data) {
	   	    var old_id = from_server_data.old_id;
	   	    var new_id = from_server_data.id;
	   	
	   		var element = this_db.jsFind(old_id);
	   		if(element) {

	      		element = this_db.jsFind(old_id, {id: new_id, "new":""}); ///Главная замена внутри всей базы

  	        }
	   	 
	   		$("#panel_"+old_id).attr("id","panel_"+new_id); //заменяю индексы видимых панелей
	   		$('.redactor_editor[myid='+old_id+']').attr("myid", new_id);
	   		$('#redactor[myid='+old_id+']').attr("myid", new_id);
	   	    $('.divider_red[myid="'+old_id+'"]').attr('myid',new_id);
	   	    $('.divider_li[myid="'+old_id+'"]').attr('myid',new_id);
	   	    $('.ul[myid="'+old_id+'"]').attr('myid',new_id);
	   	    $(".makedone[myid="+old_id+"]").attr("myid",new_id); //заменяю индексы makedone
	   	    $("#node_"+old_id).attr("id", "node_"+new_id).find(".tcheckbox").attr("title", new_id);
	   	    $("#node_"+new_id).find(".n_title").attr("myid",new_id);
	   		$(".tree_tab_menu li[myid="+old_id+"]").attr("myid", new_id);
	   	    $("#node_"+new_id).attr("myid",new_id);
	   		if($('#calendar').length) $('#calendar').fullCalendar( 'refetchEvents' );
	   	    
	   		var id = parseInt(window.location.hash.replace("#",""),36); //меняем хэш в адресной строке
	   		if(id==old_id) {
	   			$(window).unbind('hashchange');
	   			jsSetHashAndPath(new_id);  
	   			$(window).bind('hashchange', jsSethash );
   			}
	     		
	     } //jsChangeNewId

		 function jsChangeNewIdComments(d, lsync) { //заменяет отрицательный id на положительный
		     
		    var all_children = this_db.jsFindByParentCommentFast(d.old_id);
		     
		    $.each(all_children,function(i,ddd) {
		      	this_db.jsFindComment(ddd.id,{parent_id:d.id},"dont_sync");
	      	});		//заменяю всех отрицательных родителей на положительных
		 
		 	$(".comment_box[id=comment_"+d.old_id+"]").each(function()
		     	{ 
		     	$(this).attr("id","comment_"+d.id); 
		     	});
		 
	      	this_db.jsFindComment(d.old_id,{id:d.id, lsync: lsync, "new":""},"dont_sync").done(function(){
   				db.remove(global_table_name+"_comments",d.old_id.toString()).done(function(){
   					console.info("Удалил коммент с старым id<0: ",d.old_id);
       			});
	 		 });
		 }


		 //сохраняет изменения с сервера или добавляет новый элемент	     
		 function jsSaveElement(d) {
		 	var def = new $.Deferred();
		 	var need_to_add=false;
		 	if(!d) return false;
		 	
		 	if( (!this_db.jsFind(d.id)) && (d.id>0) )  //если такого id нет, то создаю (создан в другом месте)
		 		{
					var new_id = d.id;
					my_all_data2["n"+new_id] = {}; 
					var element = my_all_data2["n"+new_id];
					if(!my_all_parents["p"+d.parent_id]) my_all_parents["p"+d.parent_id] = [];
					my_all_parents["p"+d.parent_id].push(element);

		 			element.date1 = "";
		 			element.date2 = "";
		 			element.icon = "";
		 			element.id = d.id;
		 			element.img_class = "note-clean";
		 			element.parent_id = d.parent_id;
		 			element.position = d.position.toString();
		 			element.text = "<p>&#x200b;</p>";
		 			element.did = "";
		 			element.del = 0;
		 			element.time = parseInt(d.changetime);
		 			element.lsync = parseInt(jsNow()); //зачем это? чтобы пересинхронизироваться?
		 			element.user_id = $.cookie("4tree_user_id"); //уверен? а вдруг это дело добавил другой юзер?
		 			element.remind = 0;
		 			element["new"] = "";
		 			element.s = 0;
		 			element.tab = 0;
		 			element.fav = 0;
		 			element.pas = "";
		 			element.smth = "";
		 			element.title = "Новая заметка (new)";
		 			db.put(global_table_name,element).done(function(){ 
		 			    this_db.log("Новый элемент записан в базу: "+element.id); 
		 			});


		 			need_to_add = true;
		 			console.info("new-element",element);
		 		}
		 				
		 	var myelement = this_db.jsFind(d.id);
		 	if(!myelement) return false;
		 	myelement.title = d.title;
		 	myelement.parent_id = d.parent_id;
		 	myelement.did = d.did;
		 	myelement.fav = d.fav;
		 	myelement.pas = d.pas;
		 	myelement.smth = d.smth;
		 	myelement.date1 = d.date1;
		 	myelement.date2 = d.date2;
		 	myelement.tab = d.tab;
		 	myelement.del = 0;
		 	myelement.time = parseInt(d.changetime)-1;
		 	myelement["new"] = ""; //обнуляю new, чтобы скрыть иконку синхронизации
		 	myelement.position = d.position.toString();
		 	myelement.icon = d.node_icon;
		 	myelement.lsync = parseInt(d.lsync);
		 	myelement.user_id = d.user_id;
		 	myelement.remind = d.remind;
		 	myelement.s = d.s;

		 	api4tree.jsFindLongText(myelement.id, d.text,"dont_sync").done(function(){
				def.resolve();			 	
		 	});
		 	
 			db.put(global_table_name,myelement).done(function(){ 
 			    this_db.log("Новый элемент отредактирован: "+myelement.id); 
 			});
		 	
		 	if(need_to_add) { 
		 		if(typeof api4panel != "undefined" ) api4panel.jsAddToTree(d.id); 
		 	} else {
		 		if(typeof api4panel != "undefined") api4panel.jsRefreshOneElement(d.id);
		 	}
		 return def.promise();
		 }
		 
		 //сохранение комментариев
		 function jsSaveElementComment(d) {
		 	if(!d) return false;

		 	var element = api4tree.jsFindCommentFast(d.id);
		 	
		 	//если такого id нет, то создаю (создан в другом месте)
		 	if( (!element) && (d.id>0) ) {
		 			var new_line = my_all_comments.length;
		 			my_all_comments[new_line]=new Object(); 
		 			var element = my_all_comments[new_line];
		 			element.id = d.id;
		 			element.parent_id = d.parent_id;
		 			element.tree_id = d.tree_id;
		 			element.add_time = d.add_time;
		 			element.text = "<p>&#x200b;</p>";
		 			element.time = parseInt(d.changetime);
		 			element.lsync = parseInt(jsNow()); //зачем это? чтобы пересинхронизироваться?
		 			element["new"] = "";
		 			console.info("new-element-comment",element);
		 	}
		 				
		 	if(!element) return false;
    	 	element.parent_id = d.parent_id;
    	 	element["new"] = ""; //обнуляю new, чтобы скрыть иконку синхронизации
    	 	element.lsync = parseInt(d.lsync);
    	 	element.user_id = d.user_id;
    	 	element.add_time = d.add_time;
    	 	element.tree_id = d.tree_id;
    	 	element["del"] = d.del;
    	 	element.text = d.text;
    	 	
    	 	db.put(global_table_name+"_comments",element).done(function(){ 
    	 	    console.info("Новый элемент записан в базу: "+element.id); 
    	 	//    start_sync_when_idle=true;
    	 	});
		 
//		 	jsSaveDataComment(d.id,d.old_id,"dontsync"); //не надо, так как есть уже в jsFind
		 	
		 
		 }

		 var tm_del_comment;
		 function jsDelCom(id) { //удаление из базы определённого id
		 		if(!api4tree.jsFindCommentFast(id)) return true;
		 
		 		$.each(my_all_comments, function(i,el){
		     		if(el) if(el.id == id) { my_all_comments.splice(i,1); }
		     		});
			 	
   	    		db.remove(global_table_name+"_comments",id).done(function(){
   	    			clearTimeout(tm_del_comment);
   	    			tm_del_comment = setTimeout(function(){ api4tree.jsUpdateCommentsCnt();},400);
   	    		});
		 }
		 
		 function jsSaveBlobImage(blob_src) {
			   var d= new $.Deferred();

		 	   if(!blob_src || blob_src.toLowerCase().indexOf("http")==0 || blob_src.toLowerCase().indexOf("https")==0) { //если файл не blob
			 	   d.resolve(blob_src);
			 	   return d.promise();
		 	   }
		 	   
		 	   
   			jsGetToken().done(function(token){
		 	   
		 	   
    		   var fd = new FormData();

			   var xhr = new XMLHttpRequest();
			   xhr.open('GET', blob_src, true);
			   xhr.responseType = 'blob';
			   xhr.onload = function(e) {
			     if (this.status == 200) {
			       var myBlob = this.response;
			       
			       if(!myBlob) { resolve(""); return d.promise(); }
			       
				   console.info(fd,myBlob);

				   fd.append('file', myBlob);
				   
				   
				   $.ajax({
				       type: 'POST',
				       url: 'do.php?access_token=' + token + '&save_file=clipboard',
				       data: fd,
				       processData: false,
				       contentType: false
				   }).done(function(data) {
				          if( (data=="") || !data) { d.resolve(); return false; }
				   
				          var answer = JSON.parse(data);
				          if(answer) {
				          	var filename = answer.filelink;
				          	console.info("BLOB SAVED TO AMAZONE",filename);
				          	d.resolve(filename);
				    	  	}
				   }); 			       
			       
			       
			       // myBlob is now the blob that the object URL pointed to.
			     }
			   };
			   xhr.send();
			   
			 }); //jsGetToken

			 return d.promise();
		 }
		 
		 
		 this.jsThumbnail = function(src, id) {
		 	  var d= new $.Deferred();
		 	  
   			jsGetToken().done(function(token){
		 	  
		 
		 	  if(!src) { d.resolve(""); return d.promise(); }
		 	  
			  var split_name = src.split("/");
			  var icon_name = split_name[split_name.length-1];
			  var current_icon = api4tree.jsFind(id).icon;

		  	  var try_this_url = icon_name.replace(".jpg","_p2.jpg").replace(".jpeg","_p2.jpeg").
				  	 	   replace(".gif","_p2.gif").replace(".png","_p2.png").replace(".JPG","_p2.JPG");

			  //если нужна новая иконка
			  if( (current_icon.indexOf(icon_name)==-1) && (current_icon.indexOf(try_this_url)==-1) ) { 
			  	  //console.info("Генерирую новую иконку",src,id);			  	
			  	  if(src && src.indexOf("upload.4tree.ru/")!=-1) {
				  	  var p2_url = src.replace(".jpg","_p2.jpg").replace(".jpeg","_p2.jpeg").
				  	  				   replace(".gif","_p2.gif").replace(".png","_p2.png");
			  	  	  d.resolve(p2_url);		  	  	  
			  	  } else if(src) {
			  	  	  var lnk = web_site + "do.php?access_token=" + token + "&save_thumb_remote="+encodeURIComponent(src);
				  	  $.getJSON(lnk,function(data){
				  	  	 console.info("thumb",data);
				  	  	 p2_url = data.filelink;
				  	  	 d.resolve(p2_url);
				  	  });
			  	  }
			  } else {
		  	    console.info("Иконка ок",src,id);			  	
			  	d.resolve(""); //если иконку менять не нужно
			  }
			  
			  });//jsGetToken
			  
			  return d.promise();
		  }
		 
		 
	     var myrefreshtimer,comment_tm;
	     //синхронизация данных с сервером
	     this.jsSync = function(save_only) { 

	     	 //api4editor.jsSaveAllText(1);  //сохраняю все несохранённые тексты

	     	 console.time("PrepareSync");
			 if ( ($(".mypanel .n_title[contenteditable=true]").length > 0) ) 
			 	{
				start_sync_when_idle=true;
				sync_now = false;
			 	clearTimeout(myrefreshtimer);
			 	console.info("Пользователь редактирует, попробую обновить дерево через 3 секунды");
			 	myrefreshtimer = setTimeout(function(){ api4tree.jsSync(save_only); },3000);
			 	return false;
			 	}
	     
		    start_sync_when_idle=false;
			var d = new $.Deferred();
     	    if (navigator.onLine == false) { jsTitle("Нет сети",5000); d.resolve(); return d.promise(); }

			if(sync_now) { 
				this_db.log("Синхронизация уже идёт. Отменяю новый вызов."); 
				return true; 
			} else {
				if(!this_db.jsIsOnline()) return true;
				startSync("start"); //показываю пользователю, что синхронизация началась	
			}
			var sync_id = this_db.jsGetSyncId();
			
			local_data_changed = [];
			$.each(my_all_data2,function(i,el){
				if (( (el.id<-1000) || 
				   (el.time>=el.lsync) || 
				   ((el["new"]!="") && (el["new"])) ) && !( /^_/.test(el.id.toString()) )) {
						local_data_changed.push(el);
				}
			});
			/*
			var local_data_changed = my_all_data2.filter(function(el) { //данные, которые буду отправлять на сервер
				if(el) return (( (el.id<-1000) || 
								(el.time>=el.lsync) || 
								((el["new"]!="") && (el["new"])) ) && ( el.id.toString().indexOf("_")==-1 )); 
			});
			*/
			var dfdArray = []; //массив для объектов работы с асинхронными функциями
			var local_data_changed_tmp = [];
			$.each(local_data_changed,function(i,el){ //ищу длинные тексты, чтобы забрать из другой базы
				
				
				var blob_def = new $.Deferred();
				dfdArray.push(blob_def);
				
				if(el) {
					dfdArray.push( this_db.jsFindLongText(el.id).done(function(longtext){
						this_db.log(el.id, longtext.length); 
						var dfdArray_blob = [];

						if(longtext && longtext.indexOf("tmp_img")!=-1) {
							jsTitle("Отправляю изображение из буфера обмена...",15000);
							var blob_text1 = $("<div>"+longtext+"</div>");
							
							blob_text1.find("img.tmp_img").each(function(i,el){
								var blob_src = $(el).attr("src");
								
								try {
								var done_element = jsSaveBlobImage(blob_src).done(function(filename){
									$(el).attr("src", filename).removeClass("tmp_img");
								});
								} catch(e) {
								var done_element = null;	
								}
								
								dfdArray_blob.push( done_element );
							});
							
							//когда все картинки загрузились на сервер
						}
						$.when.apply( null, dfdArray_blob ).then( function(x){
							if(blob_text1) { 
								jsTitle("Изображение сохранено на сервер",5000);
								
								var first_image = blob_text1.find("img:first").attr("src");
				
								api4tree.jsThumbnail(first_image, el.id).done(function(new_icon){
									if(new_icon) {
										api4tree.jsFind(el.id, {icon:new_icon});
										console.info("new_thumb=",new_icon);
										jsRefreshTree();
									}
								});
								
								longtext = blob_text1.html(); //если были blob картинки
								api4tree.jsFindLongText(el.id, longtext, "dont_sync").done(function(x){
									//тут нужно будет обновить редактор
						 			setTimeout(function(){ api4editor.jsRefreshRedactor(el); }, 500);
								});
							}
							var new_i = local_data_changed_tmp.length;
							local_data_changed_tmp[new_i] = el;
							local_data_changed_tmp[new_i].text = longtext;
							blob_def.resolve();
						});
							
					}) );
				};
			});
			
			//////////////////комментарии/////////////////
			var local_comments_changed = my_all_comments.filter(function(el) { //изменившиеся комментарии
				if(el) return ( (el.id<-1000) || 
								(el.time>=el.lsync) || 
								((el["new"]!="") && (el["new"])) ); 
			});
			

			var local_comments_changed_tmp = [];
			$.each(local_comments_changed,function(i,el){ //ищу длинные тексты, чтобы забрать из другой базы
				
				var blob_def_comment = new $.Deferred();
				dfdArray.push(blob_def_comment);
				
				if(el) {
					dfdArray.push( this_db.jsFindLongTextComment(el.id).done(function(element){
						this_db.log("COMMENT-CHANGED = ",el.id, element.text.length); 
						
						var dfdArray_blob_comment = [];

						if(element && element.text && element.text.indexOf("tmp_img")!=-1) {
							var blob_text = $("<div>"+element.text+"</div>");
							
							blob_text.find("img.tmp_img").each(function(i,el){
								var blob_src = $(el).attr("src");
								
								var done_element = jsSaveBlobImage(blob_src).done(function(filename){
									$(el).attr("src", filename).removeClass("tmp_img");
								});
								
								dfdArray_blob_comment.push( done_element );
							});
							
							//когда все картинки загрузились на сервер
						}
						$.when.apply( null, dfdArray_blob_comment ).then( function(x){
							if(blob_text) {
								element.text = blob_text.html(); //если были blob картинки
								api4tree.jsFindComment(el.id,{text:element.text}).done(function(x){
									clearTimeout(comment_tm);
									comment_tm = setTimeout(function(){
									   	var myselected = api4tree.node_to_id( $(".tree_active .selected").attr('id') ); 
									   	api4tree.jsShowAllComments(myselected);
									}, 1000);
								});
							}
							var new_i = local_comments_changed_tmp.length;
							local_comments_changed_tmp[new_i] = el;
							local_comments_changed_tmp[new_i].text = element.text;
							blob_def_comment.resolve();
						});
						
						
						
					}) );
				};
			});
			
			///////////////////////////////////
			$.when.apply( null, dfdArray ).then( function(x){ //выполняю тогда, когда все длинные тексты считаны
				this_db.log("Отправляю на сервер "+Object.size(local_data_changed)+" элементов",local_data_changed,local_data_changed_tmp);
				
				
				//"высушиваю" данные и превращаю в JSON строку:
				var local_data_changed_json_dry = JSON.stringify( jsDry(local_data_changed_tmp) ); 	
				var changes_comments = JSON.stringify( jsDry(local_comments_changed_tmp,"comment") ); 
				
			
				this_db.log("Высушил данные, отправляю на сервер:",	local_data_changed_json_dry);	
				
				var changes = 'changes='+encodeURIComponent(local_data_changed_json_dry)+'&confirm=';
				changes = changes + '&changes_comments='+encodeURIComponent(changes_comments);

				if(!save_only) {
					var what_to_do = "save_and_load";
				} else {
					var what_to_do = "save_only";
					console.info("Быстрая синхронизация...");
				}
				
				var lastsync_time_client = api4tree.jsFindLastSync();
				
				var offsetdate = new Date();
				var timezone = offsetdate.getTimezoneOffset()/60;
				var this_vers = encodeURIComponent($("#this_version").html());
				
			jsGetToken().done(function(token){
				
				var lnk = web_site + "do.php?access_token=" + token + "&sync_new="+sync_id+"&time="+lastsync_time_client+"&now_time="+jsNow(true)+"&what_you_need="+what_to_do+"&timezone="+timezone+"&version="+this_vers;

				
				this_db.log(lnk);
				
				var need_refresh = false;
				console.timeEnd("PrepareSync");
				console.time("LoadedFromServer");
				$.postJSON(lnk,changes, function(data,j,k) { //////////////A J A X/////////////////
					 console.timeEnd("LoadedFromServer");
					 console.time("FinishParsing");
				     if(j=="success") {
				     	this_db.log("Получен ответ от сервера: ",data);
				     	if(data.saved) { //данные, которые сервер успешно сохранил. Отмечаю им lsync = jsNow().
					     	$.each(data.saved, function(i,d) {
					     		if(d.old_id) { //если нужно присвоить выданный id вместо отрицательного
					     			jsChangeNewId(d);
						 			$(".panel li[myid='"+d.id+"'] .sync_it_i").addClass("hideit"); 
						 			//скрываю зелёный кружок
					     		}
   				 	    	$(".panel li[myid='"+d.id+"'] .sync_it_i").addClass("hideit"); //скрываю зелёный кружок
			 		   		var lsync = parseInt(data.lsync);
   				 	    	this_db.jsFind(d.id,{"new":"",lsync: lsync},"save_anyway");

					     	});
				     	}
				     	
				     	//эти данные сохранены на сервере, можно отметить lsync = now()
					 	if(data.saved_comments) {
					 	   $.each(data.saved_comments,function(i,d) {
				 		   		var lsync = parseInt(data.lsync);
					 	       	if(d.old_id) { //если присвоен новый id
					 	       		jsChangeNewIdComments(d,lsync); //заменяет отрицательный id на положительный
				 	       		}
				 		   		this_db.jsFindComment(d.id,{"new":"",lsync: lsync},"save_anyway");
					 	       	});
				     	}
				     	
				     	
				     	
				     	if(data.server_changes) { //обновляем изменения
				     		$.each(data.server_changes, function(i,el) {
				     			jsSaveElement(el).done(function(){
						 			api4editor.jsRefreshRedactor(el);
					     			//this_db.log("Получен новый элемент",el);
				     			});
				     			need_refresh = true;
				     		});
				     	}

					 	var myselected = api4tree.node_to_id( $(".tree_active .selected").attr('id') ); 
					 	if(data.server_changes_comments) {
						 	//эти данные сохранены на сервере, можно отметить lsync = now()
					 	 	$.each(data.server_changes_comments,function(i,d) { 
					 	 	    	jsSaveElementComment(d);
					 	 	    	if(myselected == d.tree_id) {
					 	 	    		api4tree.jsShowAllComments(d.tree_id);
					 	 	    	}
					 	 	    	if( $("#tree_news").is(":visible") ) api4tree.jsShowNews(0);
					 	 	    	//обновить панель комментариев
					 	 	    	api4tree.jsUpdateCommentsCnt();
					 	 	    	need_refresh = true;
					 	 	    	//my_console("Пришли новые комментарии с сервера: "+d.id);
					 	 	    	});
					 	}
				     	
					 	if(data.need_del) { //удаляем по команде сервера из массива и базы
					 	  $.each(data.need_del,function(ii,dd) {
						 	   if(dd.command == 'del') {
							 	   	console.info("По команде сервера, удаляю №",dd.id);
							 	   	jsDelId(dd.id);
							 	   	need_refresh = true;
						 	   } 
					 	  });
					 	}
					 	
					 	if(data.need_del_comment)
					 	  $.each(data.need_del_comment,function(ii,dd)
					 	   {
					 	   console.info("need_del_comment",dd);
					 	   if(dd.command == 'del') 
					 	   	{
					 	   	jsDelCom(dd.id);
					 	   	var myselected = api4tree.node_to_id( $(".tree_active .selected").attr('id') ); 
					 	   	api4tree.jsShowAllComments(myselected);
					 	   	}
					 	   need_refresh=true;
					 	   });
					 	
					 	
					 	if(data.frends) {
					 	   //my_all_share = data.frends.share;
					 	   my_all_frends = data.frends.frends;
					 	   my_all_share = data.frends.share;
					 	   //jsRefreshOneElement(-3);
					 	   jsRefreshFrends();
					 	}
					 	
					 	if(data.need_confirm_email) {
					 	   jsTitle("Не забудьте подтвердить свою электронную почту",60000);
					 	}
					 	

				     	//(компенсация часовых поясов за счёт единого времени от сервера в jsNow)
					 	localStorage.setItem("time_dif",data.time_dif); 
				     	
				     } //if success
				startSync("finish");
				console.timeEnd("FinishParsing");
				d.resolve();	

				
				if(need_refresh) {
	   		        this_db.jsUpdateNextAction();
	   				this_db.jsUpdateChildrenCnt();
					jsRefreshTree();
	   			}
				
				
				}); //postJSON
				
		    }); //jsGetToken
				
				
			}); //$.when
						
			return d.promise();			
	     } //jsSync
		      				  	
		 }
	 }
	 return arguments.callee.instance;
} ///end of api4tree






////////////////////////////////////REDACTOR///////////////////////////////////////
var API_4EDITOR = function(global_panel_id,need_log) {
	 if ( (typeof arguments.callee.instance=='undefined') || true)
	 {
	  var my_autosave=true;
	  arguments.callee.instance = new function(){

		  var myr, 
		  	  myr_comment, 
		  	  this_db=this,
		  	  last_log_time=jsNow(),
		  	  log_i=1,
		  	  scrolltimer,
		  	  text_history=[], history_i=0, old_text;

		  
		  
		  
		  //логирование любых 5 параметров в консоль
		  this.log = function(x1,x2,x3,x4,x5) { 
		    var time_dif = jsNow()-last_log_time;
		    last_log_time=jsNow();
		    if(need_log) { 
		      	console.info(log_i+". log("+time_dif+"ms): ",x1?x1:" ",x2?x2:" ",x3?x3:" ",x4?x4:" ",x5?x5:" "); 
		      	log_i++;
		    }
		  }
		  

		  $(".all_editor_place").on("click", ".redactor_editor", function(){
			  api4editor.jsSaveCurrentCursor();
		  });
		  
		  this.jsRestoreCursor = function() {
 			  	$(".redactor_").focus();
			  	$('#redactor').redactor('setCaret', last_cursor, last_cursor_offset);
		  }

		  this.jsSaveCurrentCursor = function(){
		  	   var cursor = $('#redactor').redactor('getCurrent');
		  	   if(cursor) {
		  		   var offset = $('#redactor').redactor('getCaretOffset', cursor);
		  		   last_cursor = cursor;
		  		   last_cursor_offset = offset;
	  		   }
		  }
		  
		  function save_all_text_in_a_while_2(e,html) { //чтобы не сохранять только-что открытый текст
		  	  if((jsNow() - last_open_redactor_time)>800) {
			  	save_all_text_in_a_while(e, html);
			  } else {
				  console.info("Не сохраняю");
			  }
		  }

		  function save_all_text_in_a_while(e, html) {
			  		   

	  		  		  if(",39,37,40,38,".indexOf(","+e.keyCode+",")!=-1) return true;
  					  note_saved=true;
  					  //console.info("start_change_timer");
  					  clearTimeout(my_autosave);
  					  my_autosave = setTimeout( function() { 
  					  	  console.info("savetext");
	  					  api4editor.jsSaveCurrentCursor();
  					      api4editor.jsSaveAllText(1); 
  					  }, 90 );
		  }			  
		  
		  function refresh_file_panel() {
			  $('#fav_calendar li.active').click();
		  }

		  //создаёт редактор на странице и регистрирует глобальную переменную myr
		  this.initRedactor = function() {
		  
   			jsGetToken().done(function(token){

		  	myr = $('#redactor').redactor({ imageUpload: 'do.php?access_token=' + token + '&save_file='+main_user_id,
		  		  lang:'ru', focus:false, 
		  		  fileUpload: 'do.php?access_token=' + token + '&save_file='+main_user_id,
		  		  imageUpload: './do.php?access_token=' + token + '&save_file='+main_user_id,
		  		  clipboardUploadUrl: './do.php?access_token=' + token + '&clipboard=true&save_file='+main_user_id,
		  		  plugins: ['fontsize','fontfamily', 'fontcolor', 'fullscreen'],
		  		  autoresize:true, 
		  			focusCallback: function() {
		  			   $("#fav_redactor_btn").show();
		  			   $("#fav_redactor_btn_comment").hide();
		  			},
		  		  buttonsAdd: ['|', 'button1','checkbox'],
		  		  blurCallback:function(){
		  		  },
		  		  toolbar:true,
		  		  toolbarExternal: "#fav_redactor_btn", // ID selector 
//		  		  focusCallback: function() { $("#tree_header li.active.temp").removeClass("temp"); },
		  		  keydownCallback: save_all_text_in_a_while,
		  		  keyupCallback: save_all_text_in_a_while,
		  		  changeCallback: save_all_text_in_a_while_2,
		  		  execCommandCallback: save_all_text_in_a_while,
		  		  imageUploadCallback: refresh_file_panel,
		  		  fileUploadCallback: refresh_file_panel,
		  		  undoCallback: function(){ 
			  		var id = api4tree.node_to_id( $(".tree_active .selected").attr('id') );
			  		api4tree.jsFindLongText(id).done(function(text){
			  		  	api4tree.undo_last_step(id, text);
			  		});
		  		  },
		  		  redoCallback: function(){ 
			  		var id = api4tree.node_to_id( $(".tree_active .selected").attr('id') );
			  		api4tree.jsFindLongText(id).done(function(text){
			  		  	api4tree.redo_last_step(id, text);
			  		});
		  		  }
/*™		  	      buttonsCustom: {
		  	        button1: {
		  	           title: 'Спойлер (скрытый текст)', 
		  	           callback: function(obj, event, key) {
	  	  				  myr.execCommand('insertHtml',"<p><div class='spoiler_header'><b>&nbsp;Скрытый текст<br></b></div><div class='spoiler' style='display: block; '><div>Скрытый<br>текст</div></div></p>&nbsp;");
 	                   }
		  	        },
  	                checkbox: {
		  	           title: 'Галочка', 
		  	           callback: function(obj, event, key) {
	  	  				  myr.execCommand('insertHtml',"<input type='checkbox'>&nbsp;");
		  	           }  
		  	        } 
		  	     }*/
		  	   });
		  	
		  	   
		  	
//		  	$(".redactor_toolbar").insertBefore(".redactor_box");
		  	$(".redactor_box").append('<div class="comment_in"></div>');
		  	$(".redactor_box").prepend('<div class="settings_in"></div>');
		  	$(".settings_in").append( $(".makedone") );
		  	$(".comment_in").append( $("#tree_comments") );
		  	
		  	myr_comment = $('.comment_enter_input').redactor({imageUpload: './do.php?access_token=' + token + '&save_file='+main_user_id, lang:'ru', focus:false, fileUpload: 'do.php?access_token=' + token + '&save_file='+main_user_id, autoresize:false, toolbarExternal: "#fav_redactor_btn_comment",
		  			toolbar: true,
		  			clipboardUploadUrl: './do.php?access_token=' + token + '&clipboard=true&save_file='+main_user_id,
		  			focusCallback: function() {
		  			   $("#fav_redactor_btn").hide();
		  			   $("#fav_redactor_btn_comment").show();
		  			}
//		  			buttons: ['bold' , 'italic' , 'deleted' , '|', 'orderedlist', '|' ,'image', 'video', 'file', 'link']
		  	   });
		  }); //jsGetToken
		  
		  }
		  
		  //открывает заметки в редакторе [12,4556,4433]
		  this.jsRedactorOpen = function(some_ids,iamfrom,dont_save) {
		  	var dfd = new $.Deferred();
		  	last_open_redactor_time = jsNow();
			if(!note_saved && !dont_save) {
				this_db.jsSaveAllText(); //сохраняю старый текст
			}
			var all_texts = [];
			var dfdArray = []; //для одновременного завершения асинхронных функций
			
	
		    $.each(some_ids,function(i,id) { //перебираем все id и находим тексты
    	    	dfdArray.push( api4tree.jsFindLongText(id).done(function(text){

    	    	  	var element = api4tree.jsFind(id);
    	    	  	if(element) {
    	    	  		var path = api4tree.jsFindPath(element);
    	    	  		if( (( strip_tags(text).replace(/\t/ig,"") =="") || (text.indexOf("<")==-1)) && (/img/ig.test(text)==false)) {
    	    	  			text = "<p>&#x200b;</p>";
    	    	  			//api4tree.jsFind(id,{text:text},"dont_sync");
    	    	  		}
			  			text = api4tree.jsProxyImage(text);
				  		all_texts.push({id:id, text:text, path:path, title:element.title, s:element.s});
	
    	    	  	}
    	    	}) );
    	    });
    	    
    	    //сортировка по path, с учётом месяцев
		    function sort_by_path(a,b) {
		      var aa = a.path.textpath?a.path.textpath:"_";
		      var bb = b.path.textpath?b.path.textpath:"_";
		      
		      aa.replace("январь","01").replace("февраль","02").replace("март","03").
		      	 replace("апрель","04").replace("май","05").replace("июнь","06").
		      	 replace("июль","07").replace("август","08").replace("сентябрь","09").
		      	 replace("октябрь","10").replace("ноябрь","11").replace("декабрь","12");

		      bb.replace("январь","01").replace("февраль","02").replace("март","03").
		      	 replace("апрель","04").replace("май","05").replace("июнь","06").
		      	 replace("июль","07").replace("август","08").replace("сентябрь","09").
		      	 replace("октябрь","10").replace("ноябрь","11").replace("декабрь","12");
		    
		    
		      if (aa < bb)
		         return -1;
		      if (aa > bb)
		        return 1;
		      return 0;
		    }
						  
			$.when.apply( null, dfdArray ).then( function(x) { //когда все тексты собраны
				var mytext="";
				
				if(all_texts.length==1) { //если нужно загрузить только один текст
					var el = all_texts[0];
					mytext = el.text;
					myr.attr("md5", crc32( el.text ));
					myr.attr("myid", el.id);
					var scroll_top = el.s; //вспоминаю скроллинг
				} else {
					myr.attr("md5", "");
					myr.attr("myid", "");
					all_texts = all_texts.sort(sort_by_path); //сортирую табы по полю tab
					$.each(all_texts,function(i,el) { //перебираю все найденные тексты
						var count_div = "<div class='divider_count'>"+ (i+1) +"</div>";
						var divider = "<div class='divider_red' contenteditable='false' md5='"+crc32( el.text ) + 
									  "' myid='"+el.id+"'>" + count_div + el.path.textpath +"<h6>" +
									  el.title+"</h6></div>";
						mytext = mytext + divider + "<div class='edit_text'>" + el.text + "</div>";
					});
					var scroll_top = 0;
				}
				//console.profile("loading_text");
				myr.redactor("set",  mytext, false ); //загружаю текст в редактор
				$('.redactor_box pre').each(function(i, e) { hljs.highlightBlock(e); });
				dfd.resolve();
				//console.profileEnd("loading_text");
//			    setTimeout(function() {api4editor.save_text_dif_snapshot(mytext); }, 1000);
				$(".bottom_right>.redactor_box").scrollTop(scroll_top);
				api4tree.jsParseWikiLinks();
		 	 	if(el) api4tree.jsShowAllComments(el.id); //показываю комментарии


			});
			  
			 			  
			  
			return dfd.promise();  
		  } //jsRedactorOpen
		  
		  //рекурсивно открывает все заметки детей и внуков
		  this.jsRedactorOpenRecursive = function(id) {
		    var this_id = api4tree.jsFind(id).id;
		    var elements_from_recursive = api4tree.jsRecursive(id);
		    if(elements_from_recursive.length>100 &&
		      (!confirm("Вы действительно хотите открыть "+elements_from_recursive.length+" замет.? \n(Это может привести к нестабильной работе)"))) {
		    return false;
		    }
//			var amount = parseInt(recursivedata.length,10);
	   		var need_open = [];
	   		
	   		need_open.push(this_id);
	   		$.each(elements_from_recursive,function(i,el)
	   			{ 
	   			need_open.push(el.id);
	   			});
	   			
	   		this_db.jsRedactorOpen(need_open,"all_notes");
	   		setTimeout(function(){ 
	   			jsTitle("Загрузил все заметки ("+need_open.length+" шт.) в один редактор",20000); 
	   		}, 1000)
	   		
//	   		$(".makedone,.makedone_arrow,.makedone_arrow2").slideUp(300);
//	   		$.Menu.closeAll();
		  }
		  		  
		  //сохраняет текст в DB и выбирает ему иконку
		  function jsSaveOneTextIfChanged(id, md5text, text) {
//			    api4editor.save_text_dif_snapshot(id, text);

				var now_icon = api4tree.jsFind(id);
				now_icon = now_icon?now_icon.icon:"";
				
				var ico = now_icon.split("/");
				
				if(text.indexOf(ico[ico.length-1])==-1) {
	
					if(/<img/ig.test(text)) { 
						var blob_text1 = $("<div>"+text+"</div>");								
						var first_image = blob_text1.find("img:first").attr("src");				
						api4tree.jsThumbnail(first_image, id).done(function(new_icon){
								if(new_icon) {
									api4tree.jsFind(id, {icon:new_icon});
									console.info("new_thumb!!!=",new_icon);
									jsRefreshTree();
								}				
							});
					} else if( now_icon && (now_icon!="") && ($(".divider_red").length==0) ) {
						api4tree.jsFind(id, {icon:""});
						jsRefreshTree();
					}
				}

		  		api4tree.jsFindLongText(id, text);
		  		
		  		var note_class = api4tree.jsMakeIconText(text).myclass;
		  		$("#node_"+id+" .node_img").attr("class", "node_img "+note_class);
		  		api4tree.jsMakeWiki(myr);
		  }

		  var reopen_editor_timer;		  
		  //обновляет текст редактора из массива
		  this.jsRefreshRedactor = function(d) {
		  	var divider = $(".divider_red[myid='"+d.id+"']");
		  	
		  	if(divider.length==0) {	//если открыта одна заметка
	  	    	var id_node = myr.attr("myid");
	  	    	var md5text = myr.attr("md5");
	  	    	
	  	    	//если с сервера прислали новый текст, то обновляю редактор. 
	  	    	//Нужно дописать, если открыто несколько заметок. bug. никогда не запускается.
	  	    	if( (id_node==d.id) && ( crc32(d.text) != md5text )) {
		  	    	  var old_scroll = $(".redactor_box:first").scrollTop();
		  	    	  clearTimeout(scrolltimer);
		  	    	  clearTimeout(reopen_editor_timer);
		  	    	  reopen_editor_timer = setTimeout(function(){
			  	    	  api4editor.jsRedactorOpen([d.id],"FROM SYNC EDITOR");		
			  			  $(".redactor_box:first").scrollTop(old_scroll);
		  	    	  }, 2);
	  	    	}
		  	} else {	  //если открыто несколько заметок
  	    	    var old_scroll = $(".redactor_editor").scrollTop();
  	    	    clearTimeout(scrolltimer);
  	    	    if(d) { 
	  	    	    divider.next(".edit_text").html(d.text);
	  	    	    divider.attr("md5", crc32( d.text ));
	  	    	}
  	    	    
  	    	    $(".redactor_editor").scrollTop(old_scroll);
		    }
		  }
		  
		  //сохраняет весь видимый текст
		  this.jsSaveAllText = function() {
//	  		$(".redactor_ .highlight").contents().unwrap();
			$(".redactor_").removeHighlight();
		  	var html_from_editor = myr.redactor("get");
		  	var divider_red = $("<div>"+html_from_editor+"</div>").find(".divider_red");
		  	
			if(divider_red.length) { //если текстов несколько
			  	divider_red.quickEach(function(i,el){
			  		var id = $(el).attr('myid');
			  		var text = $("<div>"+html_from_editor+"</div>").find(".divider_red[myid='"+ id +"']").
			  					next(".edit_text:first").html();
			  		var md5text = $(el).attr('md5');
			  		if(md5text=="-1651830642") md5text = "1213863317";
			  		var new_md5 = crc32(text);
					if( new_md5 != md5text ) { 
						jsSaveOneTextIfChanged(id, md5text, text); 
						$(".redactor_ .divider_red[myid='"+id+"']").attr("md5",new_md5);
					}
			  	});
			    myr.redactor('sync');
			} else { //если текст один
					var id = myr.attr("myid");
					var text = html_from_editor;
					var md5text = myr.attr("md5");
			  		var new_md5 = crc32(text);
			  		if(md5text=="-1651830642") md5text = "1213863317";
//			  		console.info("new_length:",text.length,text);
					if( (new_md5 != md5text) ) { 
						jsSaveOneTextIfChanged(id, md5text, text);
						myr.attr("md5",new_md5); 
					}
			}


		  note_saved=true;	
		  }
		  
		  this.jsMakeWikiKeys = function() {
		  	  
		  	  $(".redactor_").on("click","input[type=checkbox]",function(e){
			  	  if( !$(this).attr("checked") ) {
				  	  $(this).attr("checked","true");
			  	  } else {
				  	  $(this).removeAttr("checked");
			  	  }
			  	  myr.redactor("sync");
			  	  $(".redactor_").blur();

		  	  })
		  	  
		  	  //ссылка внутри статьи на wiki определение
			  $(".redactor_").on("click",".wiki",function() {
			  	var mytitle = strip_tags( $(this).html() ); 
			    var id = api4tree.node_to_id( $(".tree_active .selected").attr('id') );
			    api4tree.jsOpenWikiPage(id,mytitle,myr);
			  	return false;
			  });
			  	
			  //кнопка "назад" к основной статье
			  $("#tree_editor").on("click","#wiki_back_button",function() {
			  	var myid = $(this).attr("myid");
			  	$(this).hide();
			  	api4panel.jsOpenPath(myid);
			  	return false;
		      });
		  }
		  
		  
  		  //отправляет содержимое редактора по электронной почте
		  this.jsSendMail = function (mytitle, mailto) {
		  	var mynote = myr.redactor("get");
		  	mynote = 'changes='+encodeURIComponent(mynote);
		  	
		  	var mailto_uri = encodeURIComponent(mailto);
		  	var mytitle_uri = encodeURIComponent(mytitle);
		  	
		  jsGetToken().done(function(token){
		  	
		  	var lnk = web_site + "do.php?access_token=" + token + "&send_mail_to="+mailto_uri+"&mytitle="+mytitle_uri;
		  	$.postJSON(lnk,mynote,function(data,j,k){
		  		alert('Письмо "'+mytitle+'" для '+"\r"+mailto+"\rуспешно отправлено.");
		  		});
		  }); //jsGetToken
		  
		  }
	  
	  }
	 }
	 return arguments.callee.instance;
}
/////////////////////////////////////////////



    var table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";     
 
    /* Number */ 
    crc32 = function( /* String */ str, /* Number */ crc ) { 
        if( crc == window.undefined ) crc = 0; 
        var n = 0; //a number between 0 and 255 
        var x = 0; //an hex number 
 
        crc = crc ^ (-1); 
        for( var i = 0, iTop = str.length; i < iTop; i+=1 ) { 
            n = ( crc ^ str.charCodeAt( i ) ) & 0xFF; 
            x = "0x" + table.substr( n * 9, 8 ); 
            crc = ( crc >>> 8 ) ^ x; 
        } 
        return (crc ^ (-1)).toString(); 
    }; 