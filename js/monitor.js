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

var snd3 = new Audio("img/tick2.mp3"); // buffers automatically when created
snd3.play();


function getMyDateFormat(date) {
    var d = date ? new Date(date) : new Date;
    var dt = [d.getFullYear(), d.getMonth(), d.getDay()].join("-"),
        tm = [d.getHours(), d.getMinutes(), d.getSeconds()].join(":");
    return tm;
}

function jsNow()
{
	return getMyDateFormat();
}

function _manageEvent(em) {
	  snd3.play();
      var chat = $("#chat");
      if (em != '') {
      	jsCreateOlIfNeed(em.from).prepend("<li>"+em.txt+" <i>("+em.from+")</i><span class='user'>"+jsNow()+"</span></li>");
	  }        
      if( em.type == "need_refresh_now" ) { 
      }
      
}

function jsCreateOlIfNeed(user_id) {
if(user_id != parseInt(user_id)) user_id = "Others";
$(".log").css("border","3px solid transparent");

var el = $("#user_"+user_id);

el.css("border","3px solid green");

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
	el.css("border","3px solid green");
	el.find("h2").load("do.php?user_by_id="+user_id);
	return el.find("ol");
	}	
}
