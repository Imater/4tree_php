Object.defineProperty(
    Object.prototype, 
    'renameProperty',
    {
        writable : false, // Cannot alter this property
        enumerable : false, // Will not show up in a for-in loop.
        configurable : false, // Cannot be deleted via the delete operator
        value : function (oldName, newName) {
            // Check for the old property name to 
            // avoid a ReferenceError in strict mode.
            if (this.hasOwnProperty(oldName)) {
                this[newName] = this[oldName];
                delete this[oldName];
            }
            return this;
        }
    }
);
/*
//переименование ключа объекта
function renameKey (this_obj, oldName, newName) {
    // Check for the old property name to avoid a ReferenceError in strict mode.
    if (this_obj.hasOwnProperty(oldName)) {
        this_obj[newName] = this_obj[oldName];
        delete this_obj[oldName];
    }
    return this_obj;
};
*/

function jsHideWelcome() {
	myjsPlumb2.detachEveryConnection();
	$("#start_welcome_page").removeClass("active");
	$(".mypanel").off("scroll.my");
	$("#welcome_screen").fadeOut(500);
    jsGetToken().done(function(token){
		var lnk = web_site + "do.php?access_token=" + token + "&off_welcome";
		$.getJSON(lnk, function(data,j,k) { //////////////A J A X/////////////////
		});
	});

}


function jsLoadWelcome() {
	var w_tm;
	$("#start_welcome_page").addClass("active");

	$("#welcome_screen").off("click","#hide_welcome").on("click","#hide_welcome",function(e){
		e.preventDefault();
		jsHideWelcome();
		return false;
	});


	$("#welcome_screen").off("click",".welcome_page a").on("click",".welcome_page a",function(e){
		e.preventDefault();
		api4others.open_in_new_tab($(this).attr("href"));
		return false;
	});

	$("#welcome_screen").off("click",".welcome_page").on("click",".welcome_page",function(){
		clearTimeout(w_tm);
		w_tm = setTimeout(function(){
			var next_point = $("#welcome_screen .pointer.active").next(".pointer");
			if(next_point.length) {
				next_point.click();
			} else {
				$("#welcome_screen .pointer:first").click();
			}
		},100);
		return false;
	});

	
	$("#welcome_screen").off("click",".pointer").on("click",".pointer",function(){
		var myid = $(this).attr("myid");
		$(".pointer.active").removeClass("active");
		$(this).addClass("active");
		$(".welcome_page.active").removeClass("active");;
		$(".welcome_page[myid='"+myid+"']").addClass("active");
		jsDrawWelcomeLine();
		return false;
	});
	var tm;
	$(".mypanel").on("scroll.my",function(){
		clearTimeout(tm);
		tm = setTimeout(function(){
			myjsPlumb2.setSuspendDrawing(false,true);
		}, 5);
		return false;
	});

	$("#welcome_screen").draggable({
		drag:function(){
					myjsPlumb2.setSuspendDrawing(false,true);
					clearTimeout(w_tm);
		}
	});

    jsGetToken().done(function(token){
		lnk = web_site + "do.php?access_token=" + token + "&load_welcome";
		$("#welcome_screen").load(lnk, function(){
			setTimeout(function(){ $("#welcome_screen").fadeIn(500,function(){
				jsDrawWelcomeLine();
			}); }, 500);
		});
	});
}

function jsDrawWelcomeLine(){
	myjsPlumb2.detachEveryConnection();
	jsPlumb.Defaults.Container = $("body");
	var stateMachineConnector = {				
		connector:"Bezier",
		paintStyle:{lineWidth:2,strokeStyle:"#005200"},
		endpoint:"Blank",
		anchor:"AutoDefault",
		Container:$("#wrap"),
		overlays:[ ["PlainArrow", {location:1, width:6, length:18} ]]
	};

	var line_to = $(".welcome_page.active").attr("line_to");
	var t_check;
    	if(line_to) {
    		if($(line_to).length) {
    			myjsPlumb2.connect({source:"welcome_screen", target: $(line_to), scope:"someScope"},stateMachineConnector);
    			myjsPlumb2.setSuspendDrawing(false,true);
    			if(line_to == ".tcheckbox:eq(2)") {
    				clearTimeout(t_check);
    				t_check = setTimeout(function(){ $(line_to).click(); }, 500 );
    			} else {
	    			clearTimeout(t_check);
	    			$(".makedone").hide();
    			}
    			
    	}
    }
   	jsPlumb.Defaults.Container = $(".mypanel");

}

function getWordAt(s, pos) {
  // make pos point to a character of the word
//  while (s[pos].toLowerCase() == s[pos].toUpperCase()) pos--;
  // find the space before that word
  // (add 1 to be at the begining of that word)
  // (note that it works even if there is no space before that word)
//  pos = s.lastIndexOf(" ", pos) + 1;
  // find the end of the word
  var end = s.indexOf(" ", pos);
  if (end == -1) end = s.length; // set to length if it was the last word
  // return the result
  return s.substring(pos, end);
}

function jsHighlightText(remove)
{
		var searchstring = $('#search_filter').val();
		if(searchstring.length<2 || remove) 
			{ 
			$(".search_panel_result").removeHighlight();
			$(".comment_text").removeHighlight();
			$(".redactor_").removeHighlight();
			$(".mypanel .n_title").removeHighlight();
			return true; 
			}
//		$(".highlight").contents().unwrap();
		$(".search_panel_result").highlight(searchstring,"highlight"); 
		$(".redactor_").highlight(searchstring,"highlight"); 

		var longtext = $(".redactor_").html().toLowerCase();
		var founded_match = diff_plugin.match_main( longtext, searchstring, 0 );
		if(founded_match!=-1){
			var searchstring_more = getWordAt(longtext, founded_match);
			console.info("Founded_more:",searchstring_more);
			if (searchstring_more != searchstring) {
				$(".redactor_").not(":has('.highlight')").highlight(searchstring_more,"highlight"); 
				$(".search_panel_result li").not(":has('.highlight')").highlight(searchstring_more,"highlight"); 
			}

		}
		$(".comment_text").highlight(searchstring,"highlight"); 
		$(".mypanel .n_title").highlight(searchstring,"highlight"); 
}



function sqldate(UNIX_timestamp){ //показываю время в виде mysql. timeConverter( jsFindLastSync ) используются для отладки
 var a = new Date(UNIX_timestamp);
 var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
     var year = a.getFullYear();
     var month = a.getMonth()+1;
     if(month<10) month = "0"+month;
     var date = a.getDate();
     if(date<10) date = "0"+date;
     var hour = a.getHours();
     if(hour<10) hour = "0"+hour;
     var min = a.getMinutes();
     if(min<10) min = "0"+min;
     var sec = a.getSeconds();
     if(sec<10) sec = "0"+sec;
     var msec = a.getMilliseconds();
     if(msec<10) msec = "0"+msec;
     var time = year+"-"+month+'-'+date+' '+hour+':'+min+':'+sec;
     return time;
 }


function sqltime(UNIX_timestamp){ //показываю время в виде mysql. timeConverter( jsFindLastSync ) используются для отладки
 var a = new Date(UNIX_timestamp);
     var hour = a.getHours();
     if(hour<10) hour = "0"+hour;
     var min = a.getMinutes();
     if(min<10) min = "0"+min;
     var time = hour+':'+min;
     return time;
 }




function jsCloneChat(user_id) //клонирую чат из template
{
		var new_chat = $(".chat_box[user_id='template']").clone().attr("user_id",user_id);
		user_el = jsFrendById(user_id);
		new_chat.find(".chat_user_name").html( user_el.fio );
		new_chat.find(".chat_user_img").html('<img src="image_remote.php?width=33&height=33&cropratio=1:1&image=/'+user_el.foto+'">');
		$("body").append(new_chat);
		
		var cnt=0;
		$(".chat_box[user_id!=template]").quickEach(function(el){
			console.info( $(this).css("top") );
			if( $(this).css("top")=="auto" )
				{
				cnt = cnt+1;
				}
			});
		var new_right = 30+(new_chat.width()+10)*(cnt-1);
		if( (new_right+new_chat.width()+50)>$("body").width() ) 
			{
			var new_right = 50+(new_chat.width()+10)*(cnt-1-$("body").width()/(new_chat.width()+50) );
			new_chat.css("bottom",new_chat.height()+80);
			}
		new_chat.css("right", parseInt(new_right) ).show().draggable({appendTo: "body", handle: ".chat_header"});
		
		var chat_editor = new_chat.find(".chat_editor_input");
		  myr_comment = chat_editor.redactor({ imageUpload: './redactor/demo/scripts/image_upload.php?user='+main_user_id, lang:'ru', focus:false, 		fileUpload: './redactor/demo/scripts/file_upload.php?user='+main_user_id, autoresize:true,  
  			buttons: ['bold' , 'italic' , 'deleted' , '|', 'orderedlist', '|' ,'image', 'video', 'file', 'link']
     });
	    myhtml="";
     	var chat_html = jsShowChatHistory( "chat_"+main_user_id+"_"+user_id );
     	new_chat.find(".chat_content").html(chat_html).scrollTop(99999999999);
     	


}

var last_message_sync_time = 0;


var progress_load=0;
function jsProgressStep()
{
	if(progress_load>=200) var how_long = 80;
	else var how_long = 20;

	progress_load = progress_load + 30;
	$("#inside_bar").animate({width:progress_load},how_long);
}	


////////////////////////////////////////////////////////////
var my_array;
	
jQuery.extend({ //добавляю функцию postJSON (ради названия)
   postJSON: function( url, data, callback) {
      return jQuery.post(url, data, callback, "json");
   }
});

function jsSpeechComplete() //после голосового ввода быстрого добавления заметки
{
$("#add_do").keyup();
}



function jsDryComments(data) //убираем все данные, кроме изменённых, чтобы экономить трафик в POST
{
	answer1 = new Array();
	
	$.each(data, function(i,node){
		changed_fields = node['new'];
		element = new Object;
		element.id = node.id;
		if((node.id<0) || (node["new"]=="") )  
			{
			element = jsFindComment(node.id);
			answer1.push(element);
			changed_fields = "";
			}
		else
		$.each(node, function(keyname, keyvalue)
			{
			if(changed_fields)
			  if(( changed_fields.indexOf(keyname+',') != -1 ) || keyname=="time" || keyname=="lsync1" )
				{
				element[keyname] = keyvalue;
				}
			});
		if(changed_fields) answer1.push(element);
		});
	
	return answer1;
}


var NeedToRefresh = false;
var sync_now=false;
var sync_now_timer,myrefreshtimer;

function jsShowChatHistory(tree_id) //возвращает комментарии являющиеся чатом (история) tree_id = "chat_11_12"
{
	var source = $("#chat_template").html();
	var parent_id = -1;
	template = Handlebars.compile(source);
	
	var chat = jsFindByTreeId(tree_id,parent_id);
	var html = "";
	$.each(chat, function(i,d)
		{
		var frend = jsFrendById(d.user_id);
		d.foto = frend.foto;
		d.name = frend.fio;
		d.tree_title = "";

		if(d.add_time=="0")  d.add_time_txt = "";
		else
			{
			var add_time = new Date( parseInt(d.add_time) );
			d.add_time_txt = add_time.jsDateTitleFull("need_short_format");
			}
		
		myhtml += template(d);
		
		if(jsFindByParentComments(d.id).length>0)
		  {
		  myhtml +="<ul>";
		  jsShowComments(tree_id, d.id);
		  myhtml +="</ul>";
		  }
		
		});
return myhtml;
}

function jsRefreshFrends()
{
	if(!my_all_frends) return false;
	var text = "";
	var m_len = my_all_frends.length;
	for(var i=0;i<m_len;i=i+1)
		{
		var el = my_all_frends[i];
		if(el.lastvisit!=0) { var lastvisit = "Последний визит:\n"+(new Date( parseInt(el.lastvisit) )).jsDateTitleFull(); }
		else lastvisit = "";
		
		var time_dif = parseInt( (jsNow()-el.lastvisit)/1000 );
		
		if( (time_dif)<20*60 ) var online_div = '<div class="contact_online contact_long" title="Online '+parseInt(time_dif/60)+' мин. назад"></div>';
		else var online_div = '';

		if( (time_dif)<3*60 ) var online_div = '<div class="contact_online" title="Online '+time_dif+' сек. назад"></div>';
		
		
		text += '<li user_id="'+el.user_id+'">'+
					online_div+
					'<img src="image_remote.php?width=33&height=33&cropratio=1:1&image=/'+el.foto+'" title="'+el.fio
						+"\n"+el.email+"\n"+lastvisit+'">'+
					'<div class="contact_round">'+el.user_id+'</div>'+
				'</li>';
		}
	$(".right_contacts").html(text);


}



function jsAddComment(tree_id,parent_id,text)
{
	var new_id = -parseInt(1000000+Math.random()*10000000);

	new_line = my_all_comments.length;
	my_all_comments[new_line]=new Object(); element = my_all_comments[new_line];

	element.id = new_id;
	element.parent_id = parseInt(parent_id);
	element.tree_id = tree_id;
	element.text = text;
	element.del = 0;
	element["new"] = "";
	element.time = jsNow();
	element.add_time = jsNow();
	element.lsync = jsNow()-1;
	element.user_id = main_user_id;
	
	jsSaveDataComment(new_id);

}


function jsGo(arrow)
{

var isTree = api4panel.isTree[ $(".tree_active").attr("id") ];


if(isMindmap) {
	if(arrow=='down')
		{
		lastclick = new Date();
		current = $(".mypanel.tree_active .selected");
		if(current.length==0) current = $(".mypanel.tree_active li:first").addClass("selected");
		prev = current.nextAll("li:first");
		if(prev.length==1) 
			{
			current.removeClass("selected");
			prev.addClass("selected");

			var el = prev;
			if(el.length) {
				var new_id = el.attr("id").replace("node_","");
				//api4panel.jsOpenNode(new_id);
				api4panel.jsSelectNode(new_id);		
			}

			//prev.find(".n_title:first").click();
			}
		}

	if(arrow=='up')
		{
		lastclick = new Date();
		current = $(".mypanel.tree_active .selected");
		if(current.length==0) current = $(".mypanel.tree_active li:first").addClass("selected");
		prev = current.prevAll("li:first");
		if(prev.length==1) 
			{
			current.removeClass("selected");
			prev.addClass("selected");

			var el = prev;
			if(el.length) {
				var new_id = el.attr("id").replace("node_","");
				//api4panel.jsOpenNode(new_id);
				api4panel.jsSelectNode(new_id);		
			}

			//prev.find(".n_title:first").click();
			}
		}

if(arrow=='right')
	{
	current = $(".mypanel.tree_active .selected");
	
	if(isTree)
		{
		if(current.hasClass("tree-open"))
			{
			
			var el = current.find("li:first");
			if(el.length) {
				var new_id = el.attr("id").replace("node_","");
				api4panel.jsOpenNode(new_id);
				api4panel.jsSelectNode(new_id);				
			}

			}
		else
			{
			current.click();
			jsGo("right");
			}
		}
	else
		{
		current.parents(".panel").nextAll(".panel:first").find("li:first").click();
		}

	}

if(arrow=="left")
	{
	current = $(".mypanel.tree_active .selected");
	
	if(isTree)
		{
		if(current.hasClass("tree-open"))
			{
			current.click();
			}
		else
			{
			var el = current.parents("ul:first").parent("li");
			if(el.length) {
				var new_id = el.attr("id").replace("node_","");
				api4panel.jsOpenNode(new_id);
				api4panel.jsSelectNode(new_id);		
			}
			
			}
		}
	else
		{
		current.parents(".panel").prevAll(".panel:first").find("li.old_selected").click();
		}
	}

if(isMindmap || isTree) {
				var offset_top = $(".mypanel.tree_active").height()/2;
				var offset_left = $(".mypanel.tree_active").width()/2;// - $(".selected").parent("ul:first").width()*1.5;
				if($(".tree_active .selected").length) {
					$(".mypanel.tree_active").stop().scrollTo($(".selected"),600,{offset:{ top: -offset_top, left: -offset_left}});
				}
			}
return true;
}


if(arrow=='up')
	{
	lastclick = new Date();
	current = $(".mypanel.tree_active .selected");
	if(current.length==0) current = $(".mypanel.tree_active li:first").addClass("selected");
	prev = current.prev("div").prev("li:visible").find("ul:first").find("li:visible:last");
	
	if(prev.length==0)
	  {
	  prev = current.prev('div').prev('li');
	  }
	if(prev.length==0)
	  {
	  prev = current.parents("li:visible:first");
	  }
	if(prev.length==0)
	  {
	  prev = current.parents("li:visible:first").parents("li:visible:last").prev('div').prev('li');
	  }
	if(prev.length==0)
	  {
	  prev = current.parents("li:visible:first").parents("li:visible:first").parents("li:visible:last").prev('div').prev('li');
	  }
	
	
	if(prev.length==1) 
		{
		current.removeClass("selected");
		prev.addClass("selected");
		prev.find(".n_title:first").click();
		}
	}

if(arrow=='down')
	{
	lastclick = new Date();
	current = $(".mypanel.tree_active .selected");
	if(current.length==0) current = $(".mypanel.tree_active li:first").addClass("selected");
	prev = current.find("li:visible:first");
	if(prev.length==0)
	  {
	  prev = current.next('div').next('li');
	  }
	if(prev.length==0)
	  {
	  prev = current.parents("li:visible:first").next('div').next('li');
	  }
	if(prev.length==0)
	  {
	  prev = current.parents("li:visible:first").parents("li:visible:first").next('div').next('li');
	  }
	if(prev.length==0)
	  {
	  prev = current.parents("li:visible:first").parents("li:visible:first").parents("li:visible:first").next('div').next('li');
	  }
	
	if(prev.length==1) 
		{
		current.removeClass("selected");
		prev.addClass("selected");
		prev.find(".n_title:first").click();
		}

	if(current.next(".add_do_panel_top").length) {
		current.next(".add_do_panel_top").find("input").focus();
	}

	}

if(arrow=='right')
	{
	current = $(".mypanel.tree_active .selected");
	
	if(isTree)
		{
		if(current.hasClass("tree-open"))
			{
			
			var el = current.find("li:first");
			if(el.length) {
				var new_id = el.attr("id").replace("node_","");
				api4panel.jsOpenNode(new_id);
				api4panel.jsSelectNode(new_id);		
			}

			}
		else
			{
			current.click();
			}
		}
	else
		{
		current.parents(".panel").nextAll(".panel:first").find("li:first").click();
		}
	}
if(arrow=="left")
	{
	current = $(".mypanel.tree_active .selected");
	
	if(isTree)
		{
		if(current.hasClass("tree-open"))
			{
			current.click();
			}
		else
			{
			var el = current.parents("ul:first").parent("li");
			if(el.length) {
				var new_id = el.attr("id").replace("node_","");
				api4panel.jsOpenNode(new_id);
				api4panel.jsSelectNode(new_id);		
			}
			
			}
		}
	else
		{
		current.parents(".panel").prevAll(".panel:first").find("li.old_selected").click();
		}
	}


jsFixScroll(2,"only_selected_panel");
}



function jsMakeAnimatePanel(status)
{
var p1,p2;
	if(status==1) howlong = 0;
	if(status==2) howlong = 500;
	
	who_is_on_top = $(".place_of_top").children("div").attr("id");
	
if(howlong==0)
	if( who_is_on_top=='top_panel' )
		{
		  $("#p2").css("background", "#fefcca");
		  $("#p1").css("background", "#dddeec");
		}
	else
		{
		  $("#p1").css("background", "#fefcca");
		  $("#p2").css("background", "#dddeec");
		}

	if( remember_old_panel == who_is_on_top )
	  {
	  p1 = $("#p1");
	  p2 = $("#p2");
	  }
	else
	  {
	  p1 = $("#p2");
	  p2 = $("#p1");
	  }

	p1div = $(".place_of_top").children('div');
	
	p1.animate({"left":p1div.offset().left,"top":p1div.offset().top,"width":p1div.width()-2,"height":p1div.height()-2},howlong);

	if( who_is_on_top=='top_panel' )
		p1div = $(".bottom_left").children('div').children('div').next('div');
	else
		p1div = $(".bottom_left").children('div').children('div').next('div').next('div');
	
	
	p2.animate({"left":p1div.offset().left,"top":p1div.offset().top,"width":p1div.width()-2,"height":p1div.height()-2},howlong);

	p1div = $(".redactor_editor");
	$("#p3").animate({"left":p1div.offset().left,"top":p1div.offset().top,"width":p1div.width()+26,"height":p1div.height()+26},howlong);

	$("#p1,#p2,#p3").show();
	$("#content1").addClass("transparent");
	
if(howlong>0)	
	setTimeout( function() 
		{
		$("#content1").removeClass("transparent");
		$("#p1,#p2,#p3").fadeOut(400);
		},howlong);
		
	remember_old_panel = who_is_on_top; //запоминаю какая панель была вверху
		
	
}

function jsMakeView(view_type)
{
	return false;
	localStorage.setItem("view_type",view_type);

	$(".place_of_top").show();
	$(".place_of_top #calendar").show();
	$(".bottom_left,.bottom_right").show();
	if($("#below_footer .redactor_box").length==1) $(".redactor_box").appendTo($(".bottom_right"));
	
//	jsMakeAnimatePanel(1);
	$("html").removeClass("v4");	

//	setTimeout( function() { jsMakeAnimatePanel(2); },400);

	if($("#content1 .bottom_right").length==1)
		{
		$("#content1").removeClass("v2");
		$(".bottom_right").appendTo($("#bottom_panel"));
		}


  if(view_type=='v1')
    {
    	if( $(".place_of_top #calendar").length == 1 )
    		{
	    	$("#calendar").fullCalendar("destroy");
			$(".calendar_and_others").swapWith($(".top_panel"));
			jsShowCalendar();
			}
		$("html").removeClass("v4");
		$("#content1").attr("class","").addClass("v1");
		onResize();
    }
  if(view_type=='v3')
    {

    	if( $(".place_of_top #calendar").length == 0 )
    		{
	    	$("#calendar").fullCalendar("destroy");
			$(".calendar_and_others").swapWith($(".top_panel"));
			jsShowCalendar();
			}
		$("html").removeClass("v4");
		$("#content1").attr("class","").addClass("v3");
		onResize();
    }

  if(view_type=='v2')
    {
    	if( $(".place_of_top #calendar").length == 1 )
    		{
	    	$("#calendar").fullCalendar("destroy");
			$(".calendar_and_others").swapWith($(".top_panel"));
			jsShowCalendar();
			}
		$(".bottom_right").appendTo($("#content1"));
//		$(".all_editor_place").appendTo($("#below_footer"));
		$("html").removeClass("v4");
		$("#content1").attr("class","").addClass("v2");

		onResize();
    }

  if(view_type=='v4') //похож на v3
    {
    	if( $(".place_of_top #calendar").length == 0 )
    		{
	    	$("#calendar").fullCalendar("destroy");
			$(".calendar_and_others").swapWith($(".top_panel"));
			jsShowCalendar();
			}
		$(".all_editor_place").appendTo($("#below_footer"));

		$("html").addClass("v4");
		$("#content1").attr("class","").addClass("v4");
		onResize();
    } else {
   		$(".all_editor_place").appendTo($(".bottom_right"));
    }
    
	$('#fav_calendar li.active').click();



}

function jsFixScroll(type,only_selected_panel)
{
//	console.info("fix_scroll",type,only_selected_panel);
	
	if(only_selected_panel) var add_id = ".old_selected,"
	else var add_id = "";
	$(".mypanel.tree_active .panel").quickEach(function()
		{ 
		if(type==2) var add = ".selected";
		else var add = "";
		
		var selected = $(this).find(add_id+add);
		if(selected.length) 
		  	{
			//scrollto = selected.offset().top + $(this).scrollTop() - $(this).height()/2+30;
			
			var li_top = selected.offset().top;
			var li_height = selected.height();
			var panel_height = $(this).height();
			var panel_scroll = $(this).scrollTop();
			var scrollto = panel_scroll;
			
			if(li_top < 80)
			  {
			  scrollto = panel_scroll+li_top- 80;
			  }
			  
			if(li_top > panel_height-20)
			  {
			  if(li_height>50) var addheight = li_height-30;
			  else var addheight=0;
			  scrollto = li_top - panel_height + panel_scroll + 20 + addheight;
			  }
			$(this).scrollTop(scrollto);
			}
		});
}

function jsSetHashAndPath(new_id) {
	var id_hash = parseInt(new_id).toString(36);

	var mypath = api4tree.jsFindPath( api4tree.jsFind( new_id ) );
	if(!mypath) return true;
	var new_path = "/home";

	$.each(mypath.path, function(i, el) {
		  new_path += "/";
		  new_path += strip_tags(el.path.title).trim().replace(/ /ig,"_");

	});




	window.location.hash = new_path+"/"+id_hash;
}

function jsSethash(dont_open)
{
			if(ignorehashchange) return false;
		
			check_hash_add_do();
			var myhash = window.location.hash;
			if(false && myhash && myhash.indexOf("_")!=-1) {
				var id = myhash;	
			} else {
				var tmp_hash = myhash.split("/");
				var id_hash = tmp_hash[tmp_hash.length-1];

				//var id_hash = myhash.replace("#","");
		  		var id = parseInt(id_hash,36);
		  	}
	  		
	  		if(!dont_open) {
		  		if(("#"+id!=window.location.hash) && (id))
		  			{
					$(window).unbind('hashchange');
			  		api4panel.jsOpenPath( id );
					$(window).bind('hashchange', jsSethash );
		  			}
	  		}
	 return id;
}

function jsSaveDataComment(id_one,old_id,dontsync)
{
//last_local_sync = jsNow()+1000; //если менял данные, то отменяю локальную синхронизацию
start_sync_when_idle = false;
jsSync("save_only");
//if(!dontsync) jsStartSync("soon","SAVED DATA"); //запущу синхронизацию примерно через 15 секунд

//console.info("old_id",old_id);
var mc_len = my_all_comments.length;
for(var ik=0;ik<mc_len;ik++)
	{
	if(id_one) 
	  {
	  if(my_all_comments[ik].id == old_id)
	  	{
	  	localStorage.removeItem("c_"+ik);
	  	console.info("remove:","c_"+ik);
	  	}
	  if(my_all_comments[ik].id == id_one) 
		{
		localStorage.setItem("c_"+ik,JSON.stringify(my_all_comments[ik]));
		localStorage.setItem("c_length",my_all_comments.length);
//		console.info("savedata = ",ik,id_one);
		return false;
		}
	  }
	else
	  {
		   localStorage.setItem("c_"+ik,JSON.stringify(my_all_comments[ik]));
	  }
	}

localStorage.setItem("c_length",my_all_comments.length);

}

var db;

//добавление дела через поисковую строку
function check_hash_add_do()
{

var add_do = window.location.hash;
if(add_do.indexOf("add_do:")!=-1)
	{
	var text_of_do = decodeURIComponent(add_do).replace("#add_do:","").replace("+"," ");
	setTimeout(function() { 
	     	var new_id = api4tree.jsAddDo( "to_new_folder", text_of_do, undefined, undefined, "last" ); 
	     	api4panel.jsOpenPath(new_id.id);
			}, 500);
	}

}


Date.createFromMysql = function(mysql_string)
{ 
   if(mysql_string == "") return false;
   
   if(typeof mysql_string === 'string')
   {
      var t = mysql_string.split(/[- :]/);

      //when t[3], t[4] and t[5] are missing they defaults to zero
      return new Date(t[0], t[1] - 1, t[2], t[3] || 0, t[4] || 0, t[5] || 0);          
   }

   return null;   
}





function jsMakeDate(mydate)
{
	today = new Date;
	mylong = "";
	result = new Object();
	
	dd = Math.round((Date.createFromMysql(mydate).getTime()-today.getTime())/60/60/1000*10)/10;

	if(mydate.indexOf("00:00:00")!=-1 && (mydate.split(" ")[0] == today.toMysqlFormat().split(" ")[0] ))
		{
		   result.mydays = "0 дн";
		   result.myclass = "shortdate";
		   return result;
		}
	
	if (mydate=="") return '';

   if (dd>0) myclass='shortdate';
   else myclass='shortdatepast';

   ddd=dd;

if ((dd>24) || (dd<-24) || (mydate.search("00:00:00")!=-1)) 
   { 
    dd=Math.round(dd/24); 
    mylong="long";
    if (dd>=0) mydays="+ "+dd+" дн";
       else
    mydays=dd+" дн";
   }

else
   { 
    if (dd>=0) mydays="+ "+dd+" ч";
       else
    mydays=dd+" ч";
   }
   
   result.mydays = mydays;
   result.myclass = myclass+mylong;
   
   if(dd<-15000) result.mydays = "<font title='Много лет назад' size=3px>&infin;</font>";
   
   return result;


}

function jsPrepareDate()
{
  $(".date1").quickEach( function()
      {  
      if($(this).attr("childdate")) 
      	{
      	cur_date = jsMakeDate($(this).attr("childdate"));
      	$(this).html(cur_date.mydays);
      	$(this).addClass(cur_date.myclass);
      	$(this).addClass("fromchildren");
      	$(this).show();
      	}
      else	
       if($(this).attr("title")) 
      	{
      	cur_date = jsMakeDate($(this).attr("title"));
      	$(this).html(cur_date.mydays);
      	$(this).addClass(cur_date);
      	$(this).show();
      	}
      	
      	
      });
}

if (!Array.prototype.filter)
{
  Array.prototype.filter = function(fun /*, thisp */)
  {
    "use strict";

    if (this === void 0 || this === null)
      throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function")
      throw new TypeError();

    var res = [];
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in t)
      {
        var val = t[i]; // in case fun mutates this
        if (fun.call(thisp, val, i, t))
          res.push(val);
      }
    }

    return res;
  };
}

function jsIsThereElement(id)
{
if(id==-5) //отборы
	{
		element = new Object;

		element.date1 = "";
		element.date2 = "";
		element.icon = "";
		element.id = -5;
		element.img_class = "note-clean";
		element.parent_id = 1;
		element.position = "100";
		element.text = "";
		element.did = "";
		element.del = 0;
		element.tab = 0;
		element.fav = 0;
		element["new"] = "";
		element.time = 0;
		element.lsync = 1;
		element.user_id = main_user_id;
		element.s = 0;
		element.remind = 0;
		element.title = "<i class='icon-search'></i> Отборы";
		return element;
	}

if(id==-6) //по дате изменения
	{
		element = new Object;

		element.date1 = "";
		element.date2 = "";
		element.icon = "";
		element.id = -6;
		element.img_class = "note-clean";
		element.parent_id = 1;
		element.position = "100";
		element.text = "Все заметки, которые недавно редактировались";
		element.did = "";
		element.del = 0;
		element.tab = 0;
		element.fav = 0;
		element["new"] = "";
		element.time = 0;
		element.lsync = 1;
		element.user_id = main_user_id;
		element.s = 0;
		element.remind = 0;
		element.title = "<i class='icon-clock-3'></i> 100 недавних изменений";
		return element;
	}

if(id==-7) //по дате изменения
	{
		element = new Object;

		element.date1 = "";
		element.date2 = "";
		element.icon = "";
		element.id = -7;
		element.img_class = "note-clean";
		element.parent_id = 1;
		element.position = "100";
		element.text = "Все дела отсортированные по дате выполнения";
		element.did = "";
		element.del = 0;
		element.tab = 0;
		element.fav = 0;
		element["new"] = "";
		element.time = 0;
		element.lsync = 1;
		element.user_id = main_user_id;
		element.s = 0;
		element.remind = 0;
		element.title = "<i class='icon-calendar'></i> отсортированы по дате";
		return element;
	}

if(id==-8) //по дате изменения
	{
		element = new Object;

		element.date1 = "";
		element.date2 = "";
		element.icon = "";
		element.id = -8;
		element.img_class = "note-clean";
		element.parent_id = 1;
		element.position = "100";
		element.text = "Все заметки, в которых вы нажали <b>поделиться</b> и у которых есть короткая ссылка";
		element.did = "";
		element.del = 0;
		element.tab = 0;
		element.fav = 0;
		element["new"] = "";
		element.time = 0;
		element.lsync = 1;
		element.user_id = main_user_id;
		element.s = 0;
		element.remind = 0;
		element.title = "<i class='icon-export-1'></i> вы поделились";
		return element;
	}

if(id==-9) //по дате изменения
	{
		element = new Object;

		element.date1 = "";
		element.date2 = "";
		element.icon = "";
		element.id = -9;
		element.img_class = "note-clean";
		element.parent_id = 1;
		element.position = "100";
		element.text = "Отбор всех записей в названии которых есть символ [@]";
		element.did = "";
		element.del = 0;
		element.tab = 0;
		element.fav = 0;
		element["new"] = "";
		element.time = 0;
		element.lsync = 1;
		element.user_id = main_user_id;
		element.s = 0;
		element.remind = 0;
		element.title = "<i class='icon-mail'></i> электронная почта";
		return element;
	}

if(id==-10) //по дате изменения
	{
		element = new Object;

		element.date1 = "";
		element.date2 = "";
		element.icon = "";
		element.id = -10;
		element.img_class = "note-clean";
		element.parent_id = 1;
		element.position = "100";
		element.text = "всё что вы оборачиваете в двойные [[квадратные скобки]], становится wiki статьёй<br>При клике, создаётся новая запись с таким заголовком.";
		element.did = "";
		element.del = 0;
		element.tab = 0;
		element.fav = 0;
		element["new"] = "";
		element.time = 0;
		element.lsync = 1;
		element.user_id = main_user_id;
		element.s = 0;
		element.remind = 0;
		element.title = "[[wiki]] определения";
		return element;
	}


if(id==-3)
	{
		element = new Object;

		element.date1 = "";
		element.date2 = "";
		element.icon = "img/contacts.png";
		element.id = -3;
		element.img_class = "note-clean";
		element.parent_id = 1;
		element.position = "100";
		element.text = "";
		element.did = "";
		element.del = 0;
		element.tab = 0;
		element.fav = 0;
		element["new"] = "";
		element.time = 0;
		element.lsync = 1;
		element.user_id = main_user_id;
		element.s = 0;
		element.remind = 0;
		element.title = "<i class='icon-users'></i> Контакты";
		return element;
	}

if(id)
 if( (id.toString().indexOf("user_")!=-1) && (my_all_frends))
	{
				
				id = id.toString().replace("user_","");
				fio = my_all_frends.filter(function(el){ return el.user_id == id })[0].fio;
				
				if(id==main_user_id)
					{ this_is_you="&nbsp;&nbsp;<i title='Ветки которыми вы поделились' class='icon-export-2'></i>"; myorder = 1;  myicon="<i class='icon-heart'></i>"; }
				else
					{ this_is_you=""; myorder = 100; myicon="<i class='icon-vcard'></i>"; }
				
				element = new Object;
			   	element.date1 = "";
				element.date2 = "";
			   	element.icon = "";
			   	element.id = "user_"+id;
			   	element.share = id;
			   	element.img_class = "note-clean";
			   	element.parent_id = -3;
			   	element.position = myorder.toString();
			   	element.text = "";
			   	element.did = "";
			   	element.del = 0;
			   	element.tab = 0;
			   	element.fav = 0;
			   	element["new"] = "";
			   	element.time = 0;
				element.user_id = id;
			   	element.lsync = 1;
			   	element.s = 0;
			   	element.remind = 0;
			   	element.title = myicon+" "+fio+this_is_you;
			   	
			   	return element;
	}

}

/**
Подбирает элементы, подходящие под критерии
**/
function jsFindByTreeId(tree_id,parent_id)
{
return false;
if(!tree_id) return false;	

var data = my_all_comments.filter(function(el) 
   {
   if(el.del == 1) return false;
   return ( (el.tree_id==tree_id) && ( (el.parent_id==parent_id) || (parent_id==-1) )); 
   });
   
return data;
}

function jsFindByParentComments(parent_id,need_did,need_add_line)
{
if(!parent_id) return false;	

var data = my_all_comments.filter(function(el) 
   {
   if(el.del == 1) return false;
   return ( (el.parent_id==parent_id) ); 
   });
   
return data;
}

var last_load_frends_time=0;


function strip_tags( str ){	// Strip HTML and PHP tags from a string
	// 
	// +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	if(!str) return "";
	answer = str.replace(/<\/?[^>]+>/gi, '');

	answer = answer.replace(/\n/gi, '');

	return answer;
}



function jsAddToTree(id_node)
{
	if($(".tree_active #node_"+id_node).length) return true; //если элемент уже есть, то добавлять не нужно

//	var isTree = $(".top_panel").hasClass("panel_type1");
	console.info("ADD TO TREE = ",id_node);
	var element = api4tree.jsFind(id_node);
	
	var render_node = api4panel.jsRenderOneElement( api4tree.jsFind(id_node) );
	
    if(isTree) {
    	where_to_add = $(".tree_active ul[myid="+element.parent_id+"]");
    } else {
    	where_to_add = $(".tree_active #panel_"+element.parent_id+" ul");
    }

	where_to_add.find(".divider_li:last").remove();
	var iii = element.position;
	var divider = "<div class='divider_li' pos='"+(iii+0.1)+"' myid='"+element.parent_id+"'></div>";
	
	var before_div = where_to_add.find(".divider_li[pos='"+iii+".1']");
	if(before_div.length)	$(render_node + divider).insertBefore(before_div);
	else where_to_add.append(render_node + divider);

}

function jsSnapShotMake(tree_id)
{
	var snapshot={};
	var tree_open = $("#"+tree_id+" .tree-open");
	
	snapshot.tree_open = []; //открытые папки
	var len = tree_open.length;
	for(var i=0;i<=len;i++)
	   {
	   if(tree_open[i]) snapshot.tree_open.push( $(tree_open[i]).attr("id") );
	   }

	snapshot.tree_selected = $("#"+tree_id+" .selected").attr("id");	  //выбранные

	snapshot.tree_old_selected = []; //ранее выбранные папки
	var tree_old_selected = $("#"+tree_id+" .old_selected");
	var len = tree_old_selected.length;
	for(var i=0;i<=len;i++)
	   {
	   if(tree_old_selected[i]) snapshot.tree_old_selected.push( $(tree_old_selected[i]).attr("id") );
	   }

	snapshot.tree_scroll = {};
	var tree_panel = $("#"+tree_id+" .panel");
	var len = tree_panel.length;
	for(var i=0;i<=len;i++)
	   {
	   if(tree_panel[i]) snapshot.tree_scroll[$(tree_panel[i]).attr("id")] = ( $(tree_panel[i]).scrollTop() );
	   }
	  
	return snapshot;
	
}

function jsSnapShotApply(tree_id, snapshot)
{
	var tree_active = $(".tree_active").attr("id");
	if(tree_active != tree_id) {
		$(".tree_active").removeClass("tree_active");
		$("#"+tree_id).addClass("tree_active");
	}
	
	api4panel.jsShowTreeNode("tree_1",1,false);

//	$("#"+tree_id+" .selected").removeClass(".selected");
//	$("#"+tree_id+" .old_selected").removeClass(".old_selected");
//	$("#"+tree_id+".tree_open").removeClass("tree_open");

	if(snapshot.tree_open)
	$.each(snapshot.tree_open, function(i,el){
		var id_to_open = el.replace("node_","");
		api4panel.jsOpenNode( id_to_open );
		$("#node_"+id_to_open).addClass("tree-open").find("ul:first").show();
//		$("#"+tree_id+" #"+el).
	})
	
	$("#"+tree_id+" .selected").removeClass("selected");
	$("#"+tree_id+" .old_selected").removeClass("old_selected");
	
	if(snapshot.tree_old_selected)
	$.each(snapshot.tree_old_selected, function(i,el){
		$("#"+tree_id+" #"+el).addClass("old_selected");
	})

	if(snapshot.tree_selected)
		$("#"+tree_id+" #"+snapshot.tree_selected).addClass("selected");

	if(snapshot.tree_scroll)
	$.each(snapshot.tree_scroll, function(i,el){
		$("#"+tree_id+" #"+i).scrollTop(el);
	})
	
	if(tree_active != tree_id) {
		$(".tree_active").removeClass("tree_active");
		$("#"+tree_active).addClass("tree_active");
	}
	
}

function jsRefreshOneFolder(panel_id)
{
	elements = $(".tree_active.mypanel li").clone();
	var len=elements.length;
	for(var i=0;i<len;i++)
		{
		var id = api4tree.node_to_id( $(elements[i]).attr("id") );
		var changetime_from_base = api4tree.jsFind(id).time;
		var changetime_from_screen = $(elements[i]).attr("time");
		
		if(changetime_from_base != changetime_from_screen) //если элемент на экране не совпадает с базой
			{
			var isFolderOpen = $(elements[i]).hasClass("tree-open");
			api4panel.jsRefreshOneElement(id);
			if(isFolderOpen) $(".tree_active.mypanel #node_"+id).addClass("tree-open");
//			console.info("Обновляю один элемент - "+id);
			}
		
		}
	
}




function jsMakeDrop() //обеспечивает элементам drag&drop
{
//return true;
		$("body").unbind("mousemove");
		$("body").unbind("mouseup");

	$(".mypanel li").not("ui-draggable").draggable({
				zIndex: 999,
				delay:100,
				revert: false,      // will cause the event to go back to its
				helper:"clone",
				appendTo: "body",
				start: function(event, ui) {
					console.info("start-drag");
					$(".mypanel").addClass("li_compact");
				},
				stop: function(event, ui) {
					console.info("stop-drag");
					$(".mypanel").removeClass("li_compact");
				}
//				revertDuration: 500  //  original position after the drag
			});
			
	$( ".mypanel .big_n_title,.divider_li" ).not("ui-droppable").droppable({
			accept: "li",
			activeClass: "ui-can-recieve",
			tolerance: "pointer",
			hoverClass: "ui-can-hover",
			over: function (event, ui) {
				//$(this).click();
				},
            drop: function( event, ui ) {
            	//console.info("drop-all",usedOverlays,ui,ui.draggable[0] );
            	
            	var i_am_from_tree = $(ui.draggable[0]).parents(".mypanel").attr("id");
            	var my_left = ui.position.left;
            	var drop_to_tree = $(event.target).parents(".mypanel").attr("id");
//            	$(event.target).offset().left;
            	
            	var left_panel_width = parseInt($("#tree_editor:visible").css("left").replace("px",""));
            	if(($(event.target).offset().left<$("#tree_left_panel").width()) && drop_to_tree=="tree_2" ) {
	            	console.info("second_drop_false!!!");
	            	return false;
            	}
            		
            	
            	console.info("tree=", i_am_from_tree, drop_to_tree, my_left, $(event.target).offset().left );
            	
            	if( (usedOverlays.length!=0) || ($(ui.draggable[0]).hasClass("fc-event")) ){ 
            		console.info("ignore_second_drop");
            		return true; 
            	} //если под делом есть другое дело, но мы над календарём

            	setTimeout(function(){ ignore_second_drop = false; }, 300);
            	
            	if(event.target.attributes.pos) //если уронили на разделитель
            		{
	            	dropto_pos = parseFloat(event.target.attributes.pos.nodeValue);
	            	dropto_parent_id = event.target.attributes.myid.nodeValue;
	            	dropto = event.target.attributes.myid.nodeValue;
	            	draggable = ui.draggable[0].attributes.myid.nodeValue;

	            	console.info("drop=",dropto,dropto_pos,draggable);

	            	el = api4tree.jsFind(dropto);
//					if(el) jsReorder( el.parent_id );
//					else return true;

					if(el.id && draggable && (draggable!=dropto_parent_id)) {
						
						var pos1 = parseFloat( $(event.target).prev("li").prev(".divider_li").attr("pos") );
						var pos2 = parseFloat( $(event.target).attr("pos") );
						if(!pos1) pos1 = pos2 - 5;
						var dif = (pos2 - pos1)/2;
						if(dif==0) dif = 0.01;
						newposition = pos1+dif;
						
						api4tree.jsFind(draggable,{ position:(newposition), parent_id : dropto_parent_id });
			   			setTimeout(function(){ 
			   				jsRefreshTree(); 
			   			},100);
						
					}


					//jsRefreshTree();
            		}
            	else //если уронили на другой элемент
            		{
            		if(!$(ui.draggable).attr("myid")) return true;
	            	dropto = $(event.target).parent("li").attr("myid");
	            	draggable = $(ui.draggable).attr("myid");
	            	
	            	var drop_to_element = api4tree.jsFind(dropto);
	            	
/*	          	if(jsFind(draggable).share)
	            	if( jsFind(dropto).share != jsFind(draggable).share ) 
	            		{ alert("Вы не можете переместить чужую заметку к себе — "+jsFind(draggable).share+"!="+jsFind(dropto).share); return true; }*/
	            	
	           		if(drop_to_element.id && (draggable!=dropto)) {
	           			api4tree.jsFind(draggable, {parent_id : dropto});
			   			setTimeout(function(){ 
			   				jsRefreshTree(); 
			   				$(".tree_active").removeClass("tree_active");
			   				$("#"+drop_to_tree).addClass("tree_active");
			   				api4panel.jsOpenPath(draggable);
			   			},100);
			   		}
			    	
		           	}
            	$(".fc-cell-overlay").remove();
   				$(".ui-draggable-dragging").remove();

        }});


}

var tm_resize;
function onResize() //вызывается при каждом ресайзе страницы
{	
	clearTimeout(tm_resize);
	if(isMindmap) tm_resize = setTimeout(function(){ myjsPlumb.setSuspendDrawing(false,true) },1000);
	
	if($(".ui-resizable-resizing").length) return true;
	
			var w = $(document).width();
			var y = $(document).height();							
							
			//ресайзим ширину главных панелей
			$("#tree_editor").css("left",main_x+'px');
			if(main_x) $("#tree_left_panel").css("width",(main_x)+'px');
			
			
			$(".resize_me").css("left",main_x+"px");

			$("#tree_editor .all_editor_place").css('bottom',main_y);
			$("#tree_editor .calendar_and_others").css('height',main_y);
			
			
			var newheight=$('#calendar').parent("div").height()-30-10;
			if( $("#content1").hasClass("v3")  ) newheight += 0;
			$('#calendar').fullCalendar('option','contentHeight', newheight); //высота календаря
			$(".search_panel_result").height(newheight-21+9);
			$("#tree_news").height(newheight-21+9);
			$("#tree_files_panel").height(newheight-21+9);			

			jsSetTimeNow(); //обновляю указатель текущего времени
			
			api4tree.jsCalcTabs();

}



//дописывает ноль к цифре
function twoDigits(d) {
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d.toString();
}

//Перевожу дату new Date в mySQL формат
Date.prototype.toMysqlFormat = function() {
    return this.getFullYear() + "-" + twoDigits(1 + this.getMonth()) + "-" + twoDigits(this.getDate()) + " " + twoDigits(this.getHours()) + ":" + twoDigits(this.getMinutes()) + ":" + twoDigits(this.getSeconds());
};


var caldata;

function jsShowCalendar() //отображаю календарь
{

		var date = new Date();
		var d = date.getDate();
		var m = date.getMonth();
		var y = date.getFullYear();

//Большой календарь ##calendar
	if(true)
		calend = $('#calendar').fullCalendar({
			editable:true,
			firstHour: firstHour,
			slotMinutes: 15,
			timeFormat: 'H:mm',
			axisFormat: 'H:mm',
			contentHeight:361,
			weekends:true,
			defaultView:'basicWeek', //agendaWeek
			droppable:true,
			eventResize: function(event,dayDelta,minuteDelta,revertFunc) {
        
        console.info(event.id,dayDelta,minuteDelta);

		var el = api4tree.jsFind(event.id);
		
		if(el.date2<el.date1) 
			{
			var mydate1 = Date.createFromMysql( el.date1 );
			mydate1.setMinutes( mydate1.getMinutes() + 60 );
			el.date2 = mydate1.toMysqlFormat();
			console.info("Был глюк с датой", el.date2);
			}

		var mydate = Date.createFromMysql( el.date2 );
		
		mydate.setMinutes( mydate.getMinutes() + parseInt(minuteDelta,10) );
		mydate.setDate( mydate.getDate() + parseInt(dayDelta,10) );
		
		var mydate2 = mydate.toMysqlFormat();
		api4tree.jsFind(event.id,{date2:mydate2});
		
		console.info("newdate = ",mydate,mydate2);
		api4tree.jsSetSettings( $(".makedone").attr("myid") );
        

    		},
			drop: function(date1,allday,ev,et)
			  { 
////////////////После того как элемент дерева брошен на календарь, присваиваем дату при помощи AJAX и обновляем календарь			  			
			 if(ev.target.attributes.myid) {
			 	 var mynode = ev.target.attributes.myid.nodeValue;
				
				var newdate = date1.toMysqlFormat();
				console.info("drop=",date1,allday,ev,et);
				api4tree.jsFind(mynode,{ date1:newdate });
				jsRefreshTree();
				}
			 else
			 if(et.data)
 			   et.data.obj.each(function()
			     { 
			    var mynode = this.id;
			    var mydate = encodeURIComponent(date1.toMysqlFormat());
			    api4tree.jsFind(mynode, { date1 : mydate });
			 	$('#calendar').fullCalendar( 'refetchEvents' ); 
			    jsRefreshTree();
			    
			    var lnk=web_site + "do.php?phonegap=" + phonegap_user_id + "&date_to_do="+$(this).attr('id')+"&date1="+mydate+"&allday="+allday;
		 		$('#bubu').load(lnk, function () 
		 		  { 
		 		    var new_date = $('#bubu').html();
		 		    $("#"+mynode).attr('date1',new_date);
			 		jsRefreshDate(mynode.replace('node_',''));
			 		$('#calendar').fullCalendar( 'refetchEvents' ); 

		 		  });
			     });
			  
			  api4tree.jsSetSettings( $(".makedone").attr("myid") );

			  },
			header: {
				left: 'prev,next today',
				center: 'title',
				right: 'agendaWeek,agendaDay,month,basicWeek,basicDay'
			},
			firstDay: 1,

		
			eventSources: [{ events: function(start, end, callback){ api4tree.jsGetEvents(start, end, callback); }, 
							 className: 'my_event' }],					
					
			eventMouseover: function (event) 
			   { 			   			   
			   },					
			eventAfterAllRender: function() { jsSetTimeNow(); },
			eventMouseout: function (event) 
			   { 
			   },					
			eventClick: function(event) {
				console.info(event);
				api4panel.jsOpenPath( event.id );
				if(!$(".makedone_page_1").is(":visible")) $("li[myid=makedone_page_1]").click(); 
				//(,"calendar");
			},
			eventDrop: function(event, delta, minutedelta, allday) {
			   
			   var today = new Date( event.start );
			   
			   if(allday) 
			    	{
			    	today.setHours(0);
			    	today.setMinutes(0);
			    	today.setSeconds(0);
			    	}
			   
			   api4tree.jsFind(event.id,{ date1 : today.toMysqlFormat() });
			   jsRefreshTree();
			   api4tree.jsSetSettings( $(".makedone").attr("myid") );
			   
			  
			},
			
			loading: function(bool) {
				if (bool) {
					$('#loading').show();
				}else{
					$('#loading').hide();
					jsSetTimeNow();
					$('#time_now_to').scrollTop(400);
				}
			},
			selectable: true,
			selectHelper: true,
			select: function(start, end, allDay) {
			console.info(end-start);
			var dif = end-start;
			if( dif <= 900000 && dif!=0 ) { 	calend.fullCalendar('unselect'); return true; }
				var title = prompt('Название события:');
				if (title) { 
				var manager = encodeURIComponent($('#selectmanager').html()); 
				
			if(allDay==false)
				{	
				var st = start.toString();
				var en = end.toString();
				}
			else
			 	{
				var st = start.toDateString();
				var en = end.toDateString();
			 	}
				
				console.info(start.toMysqlFormat(),end.toMysqlFormat(), title);
				api4tree.jsAddDo("to_new_folder",title, start.toMysqlFormat(),end.toMysqlFormat() );

				};
				calend.fullCalendar('unselect');
				$('#calendar').fullCalendar( 'refetchEvents' ); 
				
			}
			
			
		});
				


}

function jsSetTimeNow() //устанавливаю красную полоску - показывающую текущую дату
{
//		if(typeof is_mobile != "undefined") return true;
		var cur_view = calend.fullCalendar('getView').name;
		var myl,myleft,mywidth;
		
		
		if ((cur_view=='agendaWeek') || (cur_view=='agendaDay'))
			$("* #time_now_to").quickEach(function(){				
				if ($(this).children('.fc-mynow').html()==null)
				   $('<div class="fc-mynow"></div>').prependTo(this);
				   
		if (cur_view=='agendaWeek')
		           {
		           if($('.fc-today').height()) myl = $('.fc-today').offset().left;
		           else { myl=0; $('.fc-mynow').remove(); }
		           
		           
		           var swap = parseInt( $('#tree_editor').css("left").replace("px","") );
		           
				   myleft=myl-$('.fc-agenda-axis').width()-swap+29;
				   				   				   				   
				   mywidth=$('.fc-today').width()+2; //ширина указателя текущего времени
				   
				   }
		if (cur_view=='agendaDay')
		           {
		           myleft=$('.fc-agenda-axis').width()+7;
				   mywidth='100%';
				   }
				   
				   $(this).children('.fc-mynow').css('top',0).css('width',mywidth).css('left',myleft);
				   
				   
					var currentTime=new Date;
					var tim=currentTime.getHours() + currentTime.getMinutes()/60;
					var timenow=$(this).height()/24*(tim);
					$(this).children(".fc-mynow").css({"top": timenow});
				   
				   });

}

function jsMakeLeftRightPanelResizable() //настраиваю ресайзы и джойстик
{



if(false)
  $("body").on('mousedown.presize','.presize', function(e)
     { 
			  e.preventDefault();
			  widthpanel = $(this);
			  var oldleft = e.pageX-25;		
			  var oldwidth = widthpanel.prev(".panel").width();
			  $('.bottom_left,.resize_me i').addClass('noselectable');

		$("body").on("mousemove.presize",function(e){
			  neww = oldwidth - oldleft+e.pageX-25;			  
			  if(mymetaKey) $(".mypanel .panel").width(neww);
			  else
			  	if(widthpanel) widthpanel.prev(".panel").width(neww);
			  
			  return false;
		      });

  $("body").on("mouseup.presize", function()
     { 
		$("body").off("mousemove.presize");
		$("body").off("mouseup.presize");
	    $('#left').removeClass('noselectable');
		if(mymetaKey) { 
			$.cookie('pwidth',widthpanel.prev(".panel").width(),{ expires: 300 });			
			pwidth = widthpanel.prev(".panel").width();
			if(pwidth<130) {
				$(".mypanel .panel").width("auto");
				jsTitle("Включена автоматическая ширина панелей");
			}
		}
//		$.cookie('main_y',main_y,{ expires: 300 });			
		jsMakeDrop();
		return false;
     });

		return false;
     });







	   
	
/////////////////////////////////////////

}

//переход в календаре на указанный id заметки
var anotherday = false;
function jsCalendarNode(id)
{
	var i_am_scroll;
	if(!(element = api4tree.jsFind(id))) return true;
	var gotodate = element.date1;
	if ((gotodate!='0000-00-00 00:00:00') && (gotodate)) //прыгаем календарем на выбранную делом дату 
		  {
		  gotodate = Date.createFromMysql(gotodate);
		  i_am_scroll = 1;
		  anotherday = true;
		  }
	else  {
		  if(!anotherday) return false;
		  anotherday = false;
		  gotodate = new Date;
		  i_am_scroll = 0;
		  }
	
		  if(!gotodate) return false;
	
		  var d = gotodate.getDate();
		  var m = gotodate.getMonth();
		  var y = gotodate.getFullYear();

		  var h = gotodate.getHours();
		  var slot = parseInt((95/24)*h,10)-6;

		  $('#calendar').fullCalendar('gotoDate',y,m,d);		  
		  
		  $(".fc-event").removeClass('event-selected');
		  setTimeout( function() 
		  	{ 
				if((slot!=0) && (i_am_scroll == 1))
					{
					$('* #slot_scroll').each(function() 
					  { 
					  	if(slot<0) return true;
					  	var slot2 = $(this).find('.fc-slot'+slot);
					  	if(slot2.offset())
					  	  {
							var selected_event = $(".fc-event[myid="+id+"]:visible:first");
							selected_event.addClass("event-selected");
							var offset = $("#calendar").height()/2-80;
							$(this).stop().scrollTo(selected_event[0],400,{offset:-offset}); 
						  }
					  });
					}
				else
					i_am_scroll = 1;

				var selected_event = $(".fc-event[myid="+id+"]:visible:first");
				selected_event.addClass("event-selected");
		  	},100 );
		  
}

var t2;

function jsTitle(title,tim) //вывод подсказок в левый нижний угол
{
var mytim = tim;
if (!tim) mytim = 15000;

 $('.f_text').html(title).fadeIn('slow');
 clearTimeout(t2);
 if(mytim<60000) t2 = setTimeout(function() { $('.f_text').fadeOut('slow',function(){ $('.f_text').html(''); });} ,mytim);

}

//меняет элементы на странице местами
jQuery.fn.swapWith = function(to) {
	console.info("swap");
    return this.quickEach(function() {
        var copy_to = $(to).clone(true);
        var copy_from = $(this).clone(true);
        $(to).replaceWith(copy_from);
        $(this).replaceWith(copy_to);
    });
};

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
}; //подсчёт кол-ва элементов в объектах

Date.prototype.jsDateTitleFull = function(shortit) //вывожу полную дату с днём недели
{
if(!shortit) 
	{
	var months = [" января", " февраля", " марта", " апреля", " мая", " июня", " июля", " августа", " сентября", " октября", " ноября", " декабря"];
	var days = ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"];
	}
else 
	{
	var months = [" янв", " фев", " мар", " апр", " мая", " июн", " июл", " авг", " сен", " окт", " ноя", " дек"];
	var days = ["ВС", "ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ"];
	}

	if(shortit=="veryshort") {
	var n = this.getDate() + "" + months[this.getMonth()] + " " + days[this.getDay()];
	return n;

	}

var n = this.getDate() + "" + months[this.getMonth()] + " " + this.getFullYear() + ", " + days[this.getDay()] + " — " + (this.getHours()<10?"0":"") +this.getHours()+":"+(this.getMinutes()<10?"0":"")+this.getMinutes();
return n;
}



if (!Array.prototype.filter)
{
  console.info(".FILTER IS NOT HERE");
  Array.prototype.filter = function(fun /*, thisp */)
  {
    if (this == null)
      throw new TypeError();
 
    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun != "function")
      throw new TypeError();
 
    var res = [];
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in t)
      {
        var val = t[i]; // in case fun mutates this
        if (fun.call(thisp, val, i, t))
          res.push(val);
      }
    }
 
    return res;
  };
}





/**
 * Copyright (c) 2007-2012 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
 * Dual licensed under MIT and GPL.
 * @author Ariel Flesler
 * @version 1.4.3.1
 */
(function($){var h=$.scrollTo=function(a,b,c){
setTimeout(function(){ if(scrolltimer) clearTimeout(scrolltimer); },800);

$(window).scrollTo(a,b,c)};h.defaults={axis:'xy',duration:parseFloat($.fn.jquery)>=1.3?0:1,limit:true};h.window=function(a){return $(window)._scrollable()};$.fn._scrollable=function(){return this.map(function(){var a=this,isWin=!a.nodeName||$.inArray(a.nodeName.toLowerCase(),['iframe','#document','html','body'])!=-1;if(!isWin)return a;var b=(a.contentWindow||a).document||a.ownerDocument||a;return/webkit/i.test(navigator.userAgent)||b.compatMode=='BackCompat'?b.body:b.documentElement})};$.fn.scrollTo=function(e,f,g){if(typeof f=='object'){g=f;f=0}if(typeof g=='function')g={onAfter:g};if(e=='max')e=9e9;g=$.extend({},h.defaults,g);f=f||g.duration;g.queue=g.queue&&g.axis.length>1;if(g.queue)f/=2;g.offset=both(g.offset);g.over=both(g.over);return this._scrollable().each(function(){if(e==null)return;var d=this,$elem=$(d),targ=e,toff,attr={},win=$elem.is('html,body');switch(typeof targ){case'number':case'string':if(/^([+-]=)?\d+(\.\d+)?(px|%)?$/.test(targ)){targ=both(targ);break}targ=$(targ,this);if(!targ.length)return;case'object':if(targ.is||targ.style)toff=(targ=$(targ)).offset()}$.each(g.axis.split(''),function(i,a){var b=a=='x'?'Left':'Top',pos=b.toLowerCase(),key='scroll'+b,old=d[key],max=h.max(d,a);if(toff){attr[key]=toff[pos]+(win?0:old-$elem.offset()[pos]);if(g.margin){attr[key]-=parseInt(targ.css('margin'+b))||0;attr[key]-=parseInt(targ.css('border'+b+'Width'))||0}attr[key]+=g.offset[pos]||0;if(g.over[pos])attr[key]+=targ[a=='x'?'width':'height']()*g.over[pos]}else{var c=targ[pos];attr[key]=c.slice&&c.slice(-1)=='%'?parseFloat(c)/100*max:c}if(g.limit&&/^\d+$/.test(attr[key]))attr[key]=attr[key]<=0?0:Math.min(attr[key],max);if(!i&&g.queue){if(old!=attr[key])animate(g.onAfterFirst);delete attr[key]}});animate(g.onAfter);function animate(a){$elem.animate(attr,f,g.easing,a&&function(){a.call(this,e,g)})}}).end()};h.max=function(a,b){var c=b=='x'?'Width':'Height',scroll='scroll'+c;if(!$(a).is('html,body'))return a[scroll]-$(a)[c.toLowerCase()]();var d='client'+c,html=a.ownerDocument.documentElement,body=a.ownerDocument.body;return Math.max(html[scroll],body[scroll])-Math.min(html[d],body[d])};function both(a){return typeof a=='object'?a:{top:a,left:a}}})(jQuery);



/*

highlight v4

Highlights arbitrary terms.

<http://johannburkard.de/blog/programming/javascript/highlight-javascript-text-higlighting-jquery-plugin.html>

MIT license.

Johann Burkard
<http://johannburkard.de>
<mailto:jb@eaio.com>

*/

jQuery.fn.highlight = function(pat) {
 function innerHighlight(node, pat) {
  var skip = 0;
  if (node.nodeType == 3) {
   var pos = node.data.toUpperCase().indexOf(pat);
   if (pos >= 0) {
    var spannode = document.createElement('span');
    spannode.className = 'highlight';
    var middlebit = node.splitText(pos);
    var endbit = middlebit.splitText(pat.length);
    var middleclone = middlebit.cloneNode(true);
    spannode.appendChild(middleclone);
    middlebit.parentNode.replaceChild(spannode, middlebit);
    skip = 1;
   }
  }
  else if (node.nodeType == 1 && node.childNodes && !/(script|style)/i.test(node.tagName)) {
   for (var i = 0; i < node.childNodes.length; ++i) {
    i += innerHighlight(node.childNodes[i], pat);
   }
  }
  return skip;
 }
 return this.length && pat && pat.length ? this.each(function() {
  innerHighlight(this, pat.toUpperCase());
 }) : this;
};

jQuery.fn.removeHighlight = function() {
 return this.find("span.highlight").each(function() {
  this.parentNode.firstChild.nodeName;
  with (this.parentNode) {
   replaceChild(this.firstChild, this);
   normalize();
  }
 }).end();
};


jQuery.uaMatch = function( ua ) {
	ua = ua.toLowerCase();

	var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
		/(webkit)[ \/]([\w.]+)/.exec( ua ) ||
		/(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
		/(msie) ([\w.]+)/.exec( ua ) ||
		ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
		[];

	return {
		browser: match[ 1 ] || "",
		version: match[ 2 ] || "0"
	};
};

// Don't clobber any existing jQuery.browser in case it's different
if ( !jQuery.browser ) {
	matched = jQuery.uaMatch( navigator.userAgent );
	browser = {};

	if ( matched.browser ) {
		browser[ matched.browser ] = true;
		browser.version = matched.version;
	}

	// Chrome is Webkit, but Webkit is also Safari.
	if ( browser.chrome ) {
		browser.webkit = true;
	} else if ( browser.webkit ) {
		browser.safari = true;
	}

	jQuery.browser = browser;
}


var stemmer = (function() {
    
    var DICT = {
        RVRE: /^(.*?[аеиоуыэюя])(.*)$/i,
        PERFECTIVEGROUND_1: /([ая])(в|вши|вшись)$/gi,
        PERFECTIVEGROUND_2: /(ив|ивши|ившись|ыв|ывши|ывшись)$/i,
        REFLEXIVE: /(с[яь])$/i,
        ADJECTIVE: /(ее|ие|ые|ое|ими|ыми|ей|ий|ый|ой|ем|им|ым|ом|его|ого|ему|ому|их|ых|ую|юю|ая|яя|ою|ею)$/i,
        PARTICIPLE_1: /([ая])(ем|нн|вш|ющ|щ)$/gi,
        PARTICIPLE_2: /(ивш|ывш|ующ)$/i,
        VERB_1: /([ая])(ла|на|ете|йте|ли|й|л|ем|н|ло|но|ет|ют|ны|ть|ешь|нно)$/gi,
        VERB_2: /(ила|ыла|ена|ейте|уйте|ите|или|ыли|ей|уй|ил|ыл|им|ым|ен|ило|ыло|ено|ят|ует|уют|ит|ыт|ены|ить|ыть|ишь|ую|ю)$/i,
        NOUN: /(а|ев|ов|ие|ье|е|иями|ями|ами|еи|ии|и|ией|ей|ой|ий|й|иям|ям|ием|ем|ам|ом|о|у|ах|иях|ях|ы|ь|ию|ью|ю|ия|ья|я)$/i,
        DERIVATIONAL: /.*[^аеиоуыэюя]+[аеиоуыэюя].*ость?$/i,
        DER: /ость?$/i,
        SUPERLATIVE: /(ейше|ейш)$/i,
        I: /и$/i,
        P: /ь$/i,
        NN: /нн$/i
    };
    
    return function stemmer(word) {
        word = word.replace(/ё/gi, 'e');
        var wParts = word.match(DICT.RVRE);
        if (!wParts) {
            return word;
        }
        var start = wParts[1];
        var rv = wParts[2];
        var temp = rv.replace(DICT.PERFECTIVEGROUND_2, '');
        if (temp == rv) {
            temp = rv.replace(DICT.PERFECTIVEGROUND_1, '$1');
        }
        if (temp == rv) {
            rv = rv.replace(DICT.REFLEXIVE, '');
            temp = rv.replace(DICT.ADJECTIVE, '');
            if (temp != rv) {
                rv = temp;
                temp = rv.replace(DICT.PARTICIPLE_2, '');
                if (temp == rv) {
                    rv = rv.replace(DICT.PARTICIPLE_1, '$1');
                }
            } else {
                temp = rv.replace(DICT.VERB_2, '');
                if (temp == rv) {
                    temp = rv.replace(DICT.VERB_1, '$1');
                }
                if (temp == rv) {
                    rv = rv.replace(DICT.NOUN, '');
                } else {
                    rv = temp;
                }
            }
        } else {
            rv = temp;
        }
        rv = rv.replace(DICT.I, '');
        if (rv.match(DICT.DERIVATIONAL)) {
            rv = rv.replace(DICT.DER, '');
        }
        temp = rv.replace(DICT.P, '');
        if (temp == rv) {
            rv = rv.replace(DICT.SUPERLATIVE, '');
            rv = rv.replace(DICT.NN, 'н');
        } else {
            rv = temp;
        }
        return start + rv;
    };
})();

var index = [];

function jsIndex(){
	var my_all_data2 = api4tree.js_my_all_data();
	$.each(my_all_data2,function(i,el){ //ищу длинные тексты, чтобы забрать из другой базы
	    if(el) {
	    	var done_element = api4tree.jsFindLongText(el.id).done(function(longtext){
	    		if(longtext.length) {
		    		longtext = strip_tags( longtext ).toLowerCase();
		    		var words = split_to_words(longtext);
		    		if(words.length)
		    		$.each(words,function(i,el){
			    		if(el) var stem = stemmer(el);
			    		console.info( stem );
			    		if(stem && stem.length>2 && (["nbsp"].indexOf(stem)==-1)) 
			    			index[stem]=(el.id);
		    		});
	    		}
			});
		}
	});
}

function split_to_words(str) {
var aStr = str.match(/\w+|"[^"]+"/g), i = aStr?aStr.length:0;
while(i--){
    aStr[i] = aStr[i].replace(/"/g,"");
}
return aStr;
}




function jsDoPasteClipboard(e) {
    console.info("my_paste",e);
    var items = e.originalEvent.clipboardData.items;
    
    var need_text = false;
    
    if( (e.originalEvent.clipboardData.getData("text/html").indexOf("xml")!=-1) )
    	if( !confirm("Преобразовать документ Office в картинку?") ) {
       			need_text=true;
       		}
    
    if(!need_text) {

       for (var i = 0; i < items.length; ++i) {
    	   console.info("asFile = ",items[i].getAsFile());
    		
           if (items[i].kind == 'file' && items[i].type.indexOf('image/') !== -1) {
    		   e.stopPropagation();					
               var blob = items[i].getAsFile();
    
               window.URL = window.URL || window.webkitURL;
               var blobUrl = window.URL.createObjectURL(blob);
     
               //var img = document.createElement('img');
               //img.src = blobUrl; 
               
              if($(".redactor_editor:focus").hasClass("comment_enter_input"))
              	{
              	var insert_red = $('.comment_enter_input'); //???
              	}
              else
              	{
              	var insert_red = $("#redactor");
              	}
              	
			  	insert_red.redactor("insertHtml","<img class=\'tmp_img\' title=\'Из буфера обмена "+
    		  									  Date()+"\' src=\'"+blobUrl+"\'>"); 
    		   var fd = new FormData();
    		   fd.append('file', blob);
    		   console.info(fd);
               
               return false;
               
    		   
          } else {
	          need_text = true;
          }
      } //for
	} //if needtext
	return need_text;
}


//быстрый перебор
jQuery.fn.quickEach = (function() {
  var jq = jQuery([1]);
  return function(c) {
   var i = -1,
       el, len = this.length;
   try {
    while (++i < len && (el = jq[0] = this[i]) && c.call(jq, i, el) !== false);
   } catch (e) {
    delete jq[0];
    throw e;
   }
   delete jq[0];
   return this;
  };
 }());



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
	        			 	if($(".mypanel .n_title[contenteditable=true]").length == 0) api4tree.jsSync(); 
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
      } else {
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



function jsRedactorInsert(what_insert) {
	api4panel.jsCloseAllMenu();
	$(".redactor_").focus();
	$('#redactor').redactor('setCaret', last_cursor, last_cursor_offset);
	
	if(what_insert == "checkbox") {
		var node=$('<l><input type=checkbox>&nbsp;</l>'); 		
	} else if (what_insert == "datetime") {
		var node=$('<l>'+ (new Date()).jsDateTitleFull() +'</l>'); 		
	}
	
	$('#redactor').redactor('insertNode', node);
}