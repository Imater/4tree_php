var compare_timer;

function my_console(text,text2) //вывод лога в консоль
{
	if(!$(".sync_console:visible").length) return true;

	if(!text2) var text2 = "";
	$(".sync_console > ul").append("<li><font color='lightgray'>"+ (new Date).toLocaleTimeString() + "</font> — " + text+" <b>"+text2+"</b></li>");
	$(".sync_console").scrollTop(50000);
	
	if(text == "clean") { $(".sync_console ul").html(""); }
		
	
	
	
}


function jsStartSyncNew(when_need_sync)
{
var soon = 15*1000; //сколько секунд до синхронизации

if(when_need_sync=="soon")
	{
	setTimeout(function(){}, soon)
	}

}


function jsSync(save_only)
{
	if (navigator.onLine == false) //если интернета нет
		{ jsTitle("Интернет отсутствует, попробуйте синхронизироваться позже", 5000); }

    if(sync_now) return true; //если синхронизация уже идёт
    sync_now = true;
    clearTimeout(sync_now_timer);
    sync_now_timer = setTimeout(function(){ sync_now = false; start_sync_when_idle=false; }, 60000);
	start_sync_when_idle=false;
   	there_was_message_about_change = false;
 
    preloader.trigger('show');
    $(".icon-cd").css("color","#517c5d");
	
	my_console("clean");

	var sync_id = jsGetSyncId();
	my_console("Начинаю синхронизацию. Клиент:",sync_id);

	var mytime = parseInt(localStorage.getItem("last_sync_time"));
	var timedif = jsNow() - mytime;
	my_console("Синхронизировался последний раз:",sqldate(mytime) + " ("+ parseInt(timedif/1000) +" сек.назад)");
	
	var lastsync_time_client = jsFindLastSync();
	my_console("Время последней синхронизации из дел:",sqldate(lastsync_time_client));

	//данные, которые буду отправлять на сервер
	var data = my_all_data.filter(function(el) 
			{ 
			if(el) 
				return ( (el.parent_id<-1000) || (el.id<-1000) || (el.time>=el.lsync) || ((el.new!="") && (el.new)) ); } );
	
	var title_txt = "<ul style='font-size:0.7em'>";
	$.each(data,function(i,d)
		{ 
		title_txt = title_txt + "<li><b>"+ d.id +" - " +d.title+ "</b> (изменились: "+ d.new +")</li>"; 
		});
		
	title_txt = title_txt + "</ul>";

	my_console("Отправляю на сервер <b>"+data.length+"</b> изменившихся элементов:", title_txt);
	
	var changes = JSON.stringify( jsDry(data) ); //высушиваю данные и превращаю в JSON строку
	my_console("Высушил данные в JSON и добавил в консоль. Длина:" + changes.length + " байт");
	console.info(changes);

	var myconfirms = JSON.parse(localStorage.getItem("need_to_confirm"));
	my_console("Подтверждаю успешное обновление прошлых данных:",localStorage.getItem("need_to_confirm"));

	var confirm_ids = JSON.stringify( myconfirms ); //высушиваю данные и превращаю в JSON строку
	
	//отправляю изменившиеся комментарии
	if(my_all_comments)
	var data_comments = my_all_comments.filter(function(el) 
			{ 
			if(el) 
				return ( (el.parent_id<-1000) || (el.id<-1000) || (el.time>=el.lsync) || ((el.new!="") && (el.new)) ); } );
	
	
	if(my_all_comments)
		var changes_comments = JSON.stringify( jsDryComments(data_comments) ); //высушиваю данные и превращаю в JSON строку
	else
		var changes_comments = "";
	
	var changes = 'changes='+encodeURIComponent(changes)+'&confirm='+encodeURIComponent(confirm_ids);
	changes = changes + '&changes_comments='+encodeURIComponent(changes_comments);
	//what_you_need = save,load,all
	
	if(!save_only) var what_to_do = "save_and_load";
	else var what_to_do = "save_only";
	
	var lnk = "do.php?sync_new="+sync_id+"&time="+lastsync_time_client+"&now_time="+jsNow(true)+"&what_you_need="+what_to_do;
	my_console("Отправляю серверу запрос:",lnk);
	$.postJSON(lnk,changes,function(data,j,k){ //////////////A J A X/////////////////
		 if(j=="success")
		 	{
		 	if(data.saved)
			 	$.each(data.saved,function(i,d) //эти данные сохранены на сервере, можно отметить lsync = now()
			 	    	{
			 	    	if(d.old_id) 
			 	    		{
			 	    		jsChangeNewId(d); //заменяет отрицательный id на положительный
			 	    		}

			 	    	$("li[myid='"+d.id+"'] .sync_it_i").addClass("hideit");
			 	    	var myelement1=jsFind(d.id);
		 	    		myelement1.lsync = parseInt(data.lsync);
		 	    		myelement1.new = "";
		 	    		jsSaveData(d.id);
			 	    	});
			 if(data.saved_comments)
			 	$.each(data.saved_comments,function(i,d) //эти данные сохранены на сервере, можно отметить lsync = now()
			 	    	{
			 	    	if(d.old_id) 
			 	    		{
			 	    		jsChangeNewIdComments(d); //заменяет отрицательный id на положительный
			 	    		}

			 	    	var myelement1=jsFindComment(d.id);
		 	    		myelement1.lsync = parseInt(data.lsync);
		 	    		myelement1.new = "";
		 	    		jsSaveDataComment(d.id);
			 	    	});

			 	var countit=0;
		 	if(data.server_changes)
			 	$.each(data.server_changes,function(i,d) //эти данные сохранены на сервере, можно отметить lsync = now()
			 	    	{
//			 	    	console.info(d);
			 	    	jsSaveElement(d);
			 	    	jsRefreshRedactor(d);
			 	    	countit=1;
			 	    	my_console("Пришли новые данные с сервера: "+d.id);
			 	    	});

			var myselected = node_to_id( $(".selected").attr('id') ); 
		 	if(data.server_changes_comments)
			 	$.each(data.server_changes_comments,function(i,d) //эти данные сохранены на сервере, можно отметить lsync = now()
			 	    	{
			 	    	console.info(d);
			 	    	jsSaveElementComment(d);
			 	    	if(myselected == d.tree_id)
			 	    		jsRefreshComments(d.tree_id);
			 	    	if( $("#tree_news").is(":visible") ) jsShowNews(0);
			 	    	//обновить панель комментариев
			 	    	my_console("Пришли новые комментарии с сервера: "+d.id);
			 	    	});
			 	
			 //удаление дела
		     if(data.need_del)
		       $.each(data.need_del,function(ii,dd)
		     	{
		     	console.info("need_del",dd);
		     	if(dd.command == 'del') 
		     		{
		     		my_console("По комманде сервера, удаляю №",dd.id);
		     		jsDelId(dd.id);
		     		}
		     	if(dd.command == 'sync_all') 
		     		{ 
		     	  	localStorage.clear();
		     		document.location.href="./index.php";
		     		}
		     	countit=1;
		     	});


		     if(data.need_del_comment)
		       $.each(data.need_del_comment,function(ii,dd)
		     	{
		     	console.info("need_del_comment",dd);
		     	if(dd.command == 'del') 
		     		{
		     		my_console("По комманде сервера, удаляю №",dd.id);
		     		jsDelCom(dd.id);
		     		var myselected = node_to_id( $(".selected").attr('id') ); 
		     		jsShowAllComments(myselected);
		     		}
		     	countit=1;
		     	});

	 	    	if(countit==1) 
	 	    	   {
	     	    	jsRefreshTree();
	 	    	   }
	 	    	if(data.frends)   
	 	    	   {
	 	    	   my_all_share = data.frends.share;
	 	    	   my_all_frends = data.frends.frends;
	 	    	   jsRefreshOneElement(-3);
	 	    	   jsRefreshFrends();
	 	    	   }
			 	    	   
			 	localStorage.setItem("last_sync_time",data.lsync); //сохраняю время успешной синхронизации
			 	localStorage.setItem("time_dif",data.time_dif); //сохраняю время успешной синхронизации

			 	var lasttime = localStorage.getItem("last_compare_md5");
			 	clearTimeout(compare_timer);
				if( ( jsNow() - lasttime) > 6*60*1000 )		 	
				 	{
				 	compare_timer = setTimeout(function(){ tree_db.compare_md5_local_and_server(); },500);
				 	localStorage.setItem("last_compare_md5",jsNow());
				 	}
				 else console.info("Сверка не требуется");
			 }
		my_console("Получен ответ от сервера:",j);
        $(".icon-cd").css("color","#888");
        preloader.trigger('hide');
        sync_now = false;
 	    if(window.after_ajax) window.after_ajax();	  

		}); //end_of_ajax

}

function jsRefreshRedactor(d)
{
	var divider = $(".divider_red[myid='"+d.id+"']");
	
	if(divider.length==0)	//если открыта одна заметка
	    {
	    	var id_node = $('.redactor_editor').attr("myid");
	    	var md5text = $('.redactor_editor').attr("md5");
	    	
	    	if( (id_node==d.id) && ( $.md5(d.text) != md5text )) //если с сервера прислали новый текст, то обновляю редактор. Нужно дописать, если открыто несколько заметок. bug. никогда не запускается.
	    	  {
	    	  var old_scroll = $(".redactor_editor").scrollTop();
	    	  clearTimeout(scrolltimer);
	    	  jsRedactorOpen([d.id],"FROM SYNC EDITOR");		
	    	  $(".redactor_editor").scrollTop(old_scroll);
	    	  }
	    }
	else
	    {				//если открыто несколько заметок
	    	  var old_scroll = $(".redactor_editor").scrollTop();
	    	  clearTimeout(scrolltimer);
	    	  if(myelement) divider.next(".edit_text").html(myelement.text);
	    	  $(".redactor_editor").scrollTop(old_scroll);
	    }
	

}


function jsSaveElement(d)
{
	var need_to_add=false;
	if(!d) return false;
	
	if( (!jsFind(d.id)) && (d.id>0) )  //если такого id нет, то создаю (создан в другом месте)
		{
			var new_line = my_all_data.length;
			my_all_data[new_line]=new Object(); 
			var element = my_all_data[new_line];
			element.date1 = "";
			element.date2 = "";
			element.icon = "";
			element.id = d.id;
			element.img_class = "note-clean";
			element.parent_id = d.parent_id;
			element.position = d.position.toString();
			element.text = "";
			element.did = "";
			element.time = parseInt(d.changetime);
			element.lsync = parseInt(jsNow()); //зачем это? чтобы пересинхронизироваться?
			element.user_id = $.cookie("4tree_user_id"); //уверен? а вдруг это дело добавил другой юзер?
			element.remind = 0;
			element.new = "";
			element.s = 0;
			element.tab = 0;
			element.fav = 1;
			element.title = "Новая заметка (new)";
			jsSaveData(d.id);
			need_to_add = true;
			console.info("new-element",element);
		}
				
	var myelement = jsFind(d.id);
	if(!myelement) return false;
	myelement.title = d.title;
	myelement.parent_id = d.parent_id;
	myelement.did = d.did;
	myelement.fav = d.fav;
	myelement.date1 = d.date1;
	myelement.date2 = d.date2;
	myelement.tab = d.tab;
	myelement.time = parseInt(d.changetime)-1;
	myelement.new = ""; //обнуляю new, чтобы скрыть иконку синхронизации
	myelement.position = d.position.toString();
	myelement.icon = d.node_icon;
	myelement.lsync = parseInt(d.lsync);
	myelement.user_id = d.user_id;
	myelement.remind = d.remind;
	myelement.s = d.s;
	myelement.text = d.text;
	
	if(need_to_add) jsAddToTree(d.id);

	jsSaveData(d.id,d.old_id,"dontsync"); //не надо, так как есть уже в jsFind
	

}

//сохранение комментариев
function jsSaveElementComment(d)
{
	if(!d) return false;
	
	if( (!jsFindComment(d.id)) && (d.id>0) )  //если такого id нет, то создаю (создан в другом месте)
		{
			var new_line = my_all_comments.length;
			my_all_comments[new_line]=new Object(); 
			var element = my_all_comments[new_line];
			element.id = d.id;
			element.parent_id = d.parent_id;
			element.tree_id = d.tree_id;
			element.add_time = d.add_time;
			element.text = "";
			element.time = parseInt(d.changetime);
			element.lsync = parseInt(jsNow()); //зачем это? чтобы пересинхронизироваться?
			element.new = "";
			jsSaveDataComment(d.id);
			console.info("new-element-comment",element);
		}
				
	var myelement = jsFindComment(d.id);
	if(!myelement) return false;
	myelement.parent_id = d.parent_id;
	myelement.new = ""; //обнуляю new, чтобы скрыть иконку синхронизации
	myelement.lsync = parseInt(d.lsync);
	myelement.user_id = d.user_id;
	myelement.add_time = d.add_time;
	myelement.tree_id = d.tree_id;
	myelement.del = d.del;
	myelement.text = d.text;

	jsSaveDataComment(d.id,d.old_id,"dontsync"); //не надо, так как есть уже в jsFind
	

}



function jsChangeNewId(d) //заменяет отрицательный id на положительный
{
    var all_children = jsFindByParent(d.old_id);
    $.each(all_children,function(i,ddd)
     	{ 
     	ddd.parent_id=d.id; 
     	jsSaveData(ddd.id);
     	});		//заменяю всех отрицательных родителей на положительных

     $.each(my_all_comments,function(i,ddd)
     	{ 
     	if(d.old_id==ddd.tree_id) 
     		{
     		ddd.tree_id=d.id; 
     		jsSaveDataComment(ddd.id);
     		}
     	});		//заменяю всех отрицательных родителей на положительных
   

	jsFind(d.old_id).id = d.id;
	jsSaveData(d.id);

	$("#panel_"+d.old_id).attr("id","panel_"+d.id); //заменяю индексы видимых панелей
	$('.redactor_editor[myid='+d.old_id+']').attr("myid", d.id);
    $('.divider_red[myid="'+d.old_id+'"]').attr('myid',d.id);
    $(".makedone[myid="+d.old_id+"]").attr("myid",d.id); //заменяю индексы makedone
    $("#node_"+d.old_id).attr("id","node_"+d.id).find(".tcheckbox").attr("title",d.id);
    
	var id = parseInt(window.location.hash.replace("#",""),36);
	if(id==d.old_id) 
		{
				$(window).unbind('hashchange');
				window.location.hash = d.id.toString(36); 
				$(window).bind('hashchange', jsSethash );
		}

	
	
}

function jsChangeNewIdComments(d) //заменяет отрицательный id на положительный
{
    var all_children = jsFindByParentComments(d.old_id);
    $.each(all_children,function(i,ddd)
     	{ 
     	jsFindComment(ddd.id,{parent_id:d.id});
     	ddd.parent_id=d.id; 
     	jsSaveDataComment(ddd.id);
     	});		//заменяю всех отрицательных родителей на положительных

	$(".comment_box[id=comment_"+d.old_id+"]").each(function()
    	{ 
    	$(this).attr("id","comment_"+d.id); 
    	});

	jsFindComment(d.old_id,{id:d.id});
	jsSaveDataComment(d.id);

	//тут нужно поменять всё визуальное
	
	
}



/*
 *  jsaes version 0.1  -  Copyright 2006 B. Poettering
 *
 *  This program is free software; you can redistribute it and/or
 *  modify it under the terms of the GNU General Public License as
 *  published by the Free Software Foundation; either version 2 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 *  General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program; if not, write to the Free Software
 *  Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA
 *  02111-1307 USA
 */

/*
 * http://point-at-infinity.org/jsaes/
 *
 * This is a javascript implementation of the AES block cipher. Key lengths 
 * of 128, 192 and 256 bits are supported.
 *
 * The well-functioning of the encryption/decryption routines has been 
 * verified for different key lengths with the test vectors given in 
 * FIPS-197, Appendix C.
 *
 * The following code example enciphers the plaintext block '00 11 22 .. EE FF'
 * with the 256 bit key '00 01 02 .. 1E 1F'.
 *
 *    AES_Init();
 *
 *    var block = new Array(16);
 *    for(var i = 0; i < 16; i++)
 *        block[i] = 0x11 * i;
 *
 *    var key = new Array(32);
 *    for(var i = 0; i < 32; i++)
 *        key[i] = i;
 *
 *    AES_ExpandKey(key);
 *    AES_Encrypt(block, key);
 *
 *    AES_Done();
 *
 * Report bugs to: jsaes AT point-at-infinity.org
 *
 */

/******************************************************************************/

/* 
   AES_Init: initialize the tables needed at runtime. Call this function
   before the (first) key expansion.
*/

function AES_Init() {
  AES_Sbox_Inv = new Array(256);
  for(var i = 0; i < 256; i++)
    AES_Sbox_Inv[AES_Sbox[i]] = i;
  
  AES_ShiftRowTab_Inv = new Array(16);
  for(var i = 0; i < 16; i++)
    AES_ShiftRowTab_Inv[AES_ShiftRowTab[i]] = i;

  AES_xtime = new Array(256);
  for(var i = 0; i < 128; i++) {
    AES_xtime[i] = i << 1;
    AES_xtime[128 + i] = (i << 1) ^ 0x1b;
  }
}

/* 
   AES_Done: release memory reserved by AES_Init. Call this function after
   the last encryption/decryption operation.
*/

function AES_Done() {
  delete AES_Sbox_Inv;
  delete AES_ShiftRowTab_Inv;
  delete AES_xtime;
}

/*
   AES_ExpandKey: expand a cipher key. Depending on the desired encryption 
   strength of 128, 192 or 256 bits 'key' has to be a byte array of length 
   16, 24 or 32, respectively. The key expansion is done "in place", meaning 
   that the array 'key' is modified.
*/

function AES_ExpandKey(key) {
  var kl = key.length, ks, Rcon = 1;
  switch (kl) {
    case 16: ks = 16 * (10 + 1); break;
    case 24: ks = 16 * (12 + 1); break;
    case 32: ks = 16 * (14 + 1); break;
    default: 
      alert("AES_ExpandKey: Only key lengths of 16, 24 or 32 bytes allowed!");
  }
  for(var i = kl; i < ks; i += 4) {
    var temp = key.slice(i - 4, i);
    if (i % kl == 0) {
      temp = new Array(AES_Sbox[temp[1]] ^ Rcon, AES_Sbox[temp[2]], 
	AES_Sbox[temp[3]], AES_Sbox[temp[0]]); 
      if ((Rcon <<= 1) >= 256)
	Rcon ^= 0x11b;
    }
    else if ((kl > 24) && (i % kl == 16))
      temp = new Array(AES_Sbox[temp[0]], AES_Sbox[temp[1]], 
	AES_Sbox[temp[2]], AES_Sbox[temp[3]]);       
    for(var j = 0; j < 4; j++)
      key[i + j] = key[i + j - kl] ^ temp[j];
  }
}

/* 
   AES_Encrypt: encrypt the 16 byte array 'block' with the previously 
   expanded key 'key'.
*/

function AES_Encrypt(block, key) {
  var l = key.length;
  AES_AddRoundKey(block, key.slice(0, 16));
  for(var i = 16; i < l - 16; i += 16) {
    AES_SubBytes(block, AES_Sbox);
    AES_ShiftRows(block, AES_ShiftRowTab);
    AES_MixColumns(block);
    AES_AddRoundKey(block, key.slice(i, i + 16));
  }
  AES_SubBytes(block, AES_Sbox);
  AES_ShiftRows(block, AES_ShiftRowTab);
  AES_AddRoundKey(block, key.slice(i, l));
}

/* 
   AES_Decrypt: decrypt the 16 byte array 'block' with the previously 
   expanded key 'key'.
*/

function AES_Decrypt(block, key) {
  var l = key.length;
  AES_AddRoundKey(block, key.slice(l - 16, l));
  AES_ShiftRows(block, AES_ShiftRowTab_Inv);
  AES_SubBytes(block, AES_Sbox_Inv);
  for(var i = l - 32; i >= 16; i -= 16) {
    AES_AddRoundKey(block, key.slice(i, i + 16));
    AES_MixColumns_Inv(block);
    AES_ShiftRows(block, AES_ShiftRowTab_Inv);
    AES_SubBytes(block, AES_Sbox_Inv);
  }
  AES_AddRoundKey(block, key.slice(0, 16));
}

/******************************************************************************/

/* The following lookup tables and functions are for internal use only! */

AES_Sbox = new Array(99,124,119,123,242,107,111,197,48,1,103,43,254,215,171,
  118,202,130,201,125,250,89,71,240,173,212,162,175,156,164,114,192,183,253,
  147,38,54,63,247,204,52,165,229,241,113,216,49,21,4,199,35,195,24,150,5,154,
  7,18,128,226,235,39,178,117,9,131,44,26,27,110,90,160,82,59,214,179,41,227,
  47,132,83,209,0,237,32,252,177,91,106,203,190,57,74,76,88,207,208,239,170,
  251,67,77,51,133,69,249,2,127,80,60,159,168,81,163,64,143,146,157,56,245,
  188,182,218,33,16,255,243,210,205,12,19,236,95,151,68,23,196,167,126,61,
  100,93,25,115,96,129,79,220,34,42,144,136,70,238,184,20,222,94,11,219,224,
  50,58,10,73,6,36,92,194,211,172,98,145,149,228,121,231,200,55,109,141,213,
  78,169,108,86,244,234,101,122,174,8,186,120,37,46,28,166,180,198,232,221,
  116,31,75,189,139,138,112,62,181,102,72,3,246,14,97,53,87,185,134,193,29,
  158,225,248,152,17,105,217,142,148,155,30,135,233,206,85,40,223,140,161,
  137,13,191,230,66,104,65,153,45,15,176,84,187,22);

AES_ShiftRowTab = new Array(0,5,10,15,4,9,14,3,8,13,2,7,12,1,6,11);

function AES_SubBytes(state, sbox) {
  for(var i = 0; i < 16; i++)
    state[i] = sbox[state[i]];  
}

function AES_AddRoundKey(state, rkey) {
  for(var i = 0; i < 16; i++)
    state[i] ^= rkey[i];
}

function AES_ShiftRows(state, shifttab) {
  var h = new Array().concat(state);
  for(var i = 0; i < 16; i++)
    state[i] = h[shifttab[i]];
}

function AES_MixColumns(state) {
  for(var i = 0; i < 16; i += 4) {
    var s0 = state[i + 0], s1 = state[i + 1];
    var s2 = state[i + 2], s3 = state[i + 3];
    var h = s0 ^ s1 ^ s2 ^ s3;
    state[i + 0] ^= h ^ AES_xtime[s0 ^ s1];
    state[i + 1] ^= h ^ AES_xtime[s1 ^ s2];
    state[i + 2] ^= h ^ AES_xtime[s2 ^ s3];
    state[i + 3] ^= h ^ AES_xtime[s3 ^ s0];
  }
}

function AES_MixColumns_Inv(state) {
  for(var i = 0; i < 16; i += 4) {
    var s0 = state[i + 0], s1 = state[i + 1];
    var s2 = state[i + 2], s3 = state[i + 3];
    var h = s0 ^ s1 ^ s2 ^ s3;
    var xh = AES_xtime[h];
    var h1 = AES_xtime[AES_xtime[xh ^ s0 ^ s2]] ^ h;
    var h2 = AES_xtime[AES_xtime[xh ^ s1 ^ s3]] ^ h;
    state[i + 0] ^= h1 ^ AES_xtime[s0 ^ s1];
    state[i + 1] ^= h2 ^ AES_xtime[s1 ^ s2];
    state[i + 2] ^= h1 ^ AES_xtime[s2 ^ s3];
    state[i + 3] ^= h2 ^ AES_xtime[s3 ^ s0];
  }
}