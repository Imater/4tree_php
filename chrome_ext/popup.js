// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
var tt;

function jsRefresh()
{
var req = new XMLHttpRequest();
req.open('GET',"http://4tree.ru/do.php?ext=11",false);
req.send(null);
$('#output').html(req.responseText);
$(".r").each(function(){
	$(this).html( jsMakeDate($(this).html(),'0000-00-00 00:00:00'));
    });
}


$(document).ready(function () {


jsRefresh();

$('*').delegate(".add_do", "keyup", function(event) 
			{
			if (event.keyCode=='13') 
			 	{
				console.log();
				lnk = "http://4tree.ru/do.php?createdo="+$(".add_do").val()+"&start="+$('#add_do_parse').html();
				var req = new XMLHttpRequest();
				req.open('GET',lnk,false);
				req.send(null);
				$('#add_do_parse').html('');
				$('#add_do_parse2').html('Дело добавленно в ваше дерево.');
				setTimeout(function(){ jsRefresh(); },1000);
				}
				
			clearTimeout(tt);
			tt = setTimeout(function(){
				var req = new XMLHttpRequest();
				val = "через 1 день";
				if ($(".add_do").val()) val = $(".add_do").val();
				req.open('GET',"http://4tree.ru/do.php?parse="+val,false);
				req.send(null);
				$('#add_do_parse').html(req.responseText);
				
				if(req.responseText!='') $('#add_do_parse2').html(jsMakeDate(req.responseText,'0000-00-00 00:00:00'));
				else $('#add_do_parse2').html('');
				
				},600);


				return false;
			});

});



function jsMakeDate(mydate,remind)
{
  	var mylong="";
	var myclass = "shortdate";
	var mylong="",ddd;

	today = new Date;
	dd = Math.round((Date.createFromMysql(mydate).getTime()-today.getTime())/60/60/1000*10)/10;
	
	if (mydate=="0000-00-00 00:00:00") return '';

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

	if (mydate.search("00:00:00")!=-1) 
	   { 
	   if (mydate.search(today.yyyymmdd())!=-1) { mydays="сегодня";
	   myclass="shortdatepast"; mylong=""; }
	   }

  if (false) { $class='shortdatedid'; $long=''; }

	if ((remind=='0000-00-00 00:00:00') || !remind)
		{
		bell_class="bell-no";
		title = "Нажмите, чтобы включить SMS уведомление за 1 минуту";
		}
	else
		{
		bell_class="bell";
		title = "Вы получите SMS уведомление за 1 минуту";
		}
	

return "<span class='"+bell_class+"' title='"+title+"'></span><span class='r "+myclass+mylong+"' title='"+mydate+"'>"+mydays+"</span>";
}


Date.createFromMysql = function(mysql_string)
{ 
   if(typeof mysql_string === 'string')
   {
      var t = mysql_string.split(/[- :]/);

      //when t[3], t[4] and t[5] are missing they defaults to zero
      return new Date(t[0], t[1] - 1, t[2], t[3] || 0, t[4] || 0, t[5] || 0);          
   }

   return null;   
}


Date.prototype.yyyymmdd = function() {
   var yyyy = this.getFullYear().toString();
   var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
   var dd  = this.getDate().toString();
   return yyyy +'-'+ (mm[1]?mm:"0"+mm[0]) +'-'+ (dd[1]?dd:"0"+dd[0]); // padding
  };
