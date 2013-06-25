function jsDoFirst() {
	_connect("am");
}


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

function getMyDateFormat(date) {
    var d = date ? new Date(date) : new Date;
    var dt = [d.getFullYear(), d.getMonth(), d.getDay()].join("-"),
        tm = [d.getHours(), d.getMinutes(), d.getSeconds()].join(":");
    return dt + " " + tm;
}

function jsNow()
{
	return getMyDateFormat();
}

function _manageEvent(em) {
	  $(".icon-dot").fadeOut(100);
	  setTimeout(function(){ $(".icon-dot").fadeIn(100); }, 500);
      var chat = $("#chat");
      if (em != '') {
      	jsCreateOlIfNeed(em.from).prepend("<li>"+em.txt+"<span class='user' style='color:#"+(1000*parseInt(em.from))+"'>"+jsNow()+" : "+em.from+"</span></li>");
	  }        
      if( em.type == "need_refresh_now" ) { 
      }
      
}

function jsCreateOlIfNeed(user_id) {
if(user_id != parseInt(user_id)) user_id = "Others";
$(".log").css("border","1px solid transparent");

var el = $("#user_"+user_id);

el.css("border","1px solid green");

if(el.length) {
	return el.find("ol");
} else {
	var template = '<div class="log" id="user_'+user_id+'">'+
	'<h2>Log '+user_id+':</h2>'+
		'<ol reversed>'+
		'</ol>'+
	'</div>';
	
	$("#container").append(template);
	var el = $("#user_"+user_id);
	el.css("border","1px solid green");
	
	return el.find("ol");
	}	
}
