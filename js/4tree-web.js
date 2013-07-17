function open_in_new_tab(url )
{
  window.open(url, '_blank');
  window.focus();
}		


function jsDoFirst()
{
	$.ajaxSetup({cache:false});


	  myr = $('#redactor_content').redactor({ imageUpload: './redactor/demo/scripts/image_upload.php', lang:'ru', focus:false, 		fileUpload: './redactor/demo/scripts/file_upload.php', autoresize:false, 
  			buttonsAdd: ['|', 'button1'], 
            buttonsCustom: {
                button1: {
                    title: 'Спойлер (скрытый текст)', 
                    callback: function(obj, event, key) 
                      { 
                      console.info(obj,event,key);
					  myr.execCommand('insertHtml',"<p><div class='spoiler_header'><b>&nbsp;Скрытый текст&nbsp;<br></b></div><div class='spoiler' style='display: block; '><div>Скрытый<br>текст</div></div></p>&nbsp;");
                      }  
                }
            }
     });

if(true)
	  myr2 = $('#redactor_comment').redactor({ imageUpload: './redactor/demo/scripts/image_upload.php', lang:'ru', focus:false, 		fileUpload: './redactor/demo/scripts/file_upload.php', autoresize:false, 
  			buttonsAdd: ['|', 'button1'], 
            buttonsCustom: {
                button1: {
                    title: 'Спойлер (скрытый текст)', 
                    callback: function(obj, event, key) 
                      { 
                      console.info(obj,event,key);
					  myr2.execCommand('insertHtml',"<p><div class='spoiler_header'><b>&nbsp;Скрытый текст&nbsp;<br></b></div><div class='spoiler' style='display: block; '><div>Скрытый<br>текст</div></div></p>&nbsp;");
                      }  
                }
            }
     });
     
     
	$(".redactor_box").delegate("a","click",function()
		{ 
		href = ( $(this).attr("href") );
		if(href.indexOf("javascript:")!=-1) return true;
		console.info("href=",href);
		if(href.indexOf("4tree.ru/#")!=-1) 
			{
			a = href.substr(href.indexOf("#")+1,100);
			window.location.hash = a;
			}
		else
			open_in_new_tab(href);
		return false;
		});		
     
     
     if(note_history)
     	{
   	jsGetToken().done(function(token){ 
   		var lnk = "do.php?history="+note_history.substr(10,500)+"&access_token="+token;
     	$.getJSON(lnk,function(d,dd)
     		{ 
     		$(".webheader").html("Резервные копии заметки сохраняются при синхронизации");
     		myr.redactor("set",d.text);
     		document.title = d.title+" — История изменений";
     	    });
     
	 	onResize();
	 	});
	 }
}

function onResize()
{
//	height = $("body").height()-90;
//	$(".redactor_editor").height(height);
//	console.info(height);
}