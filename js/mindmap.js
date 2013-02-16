//var main_node=2;
var mydata,tr,i_am_first=1,trt,loaded_note=0,tktk,iii=1000,drag_now;

function jsGetMap(data,parent_node)
{
	clearTimeout(tr);
	tr = setTimeout( function() 
	   { 
	   $("#mindmap_canvas").fadeIn(500); 
	   ttop = $(".b_center").offset().top;
	   $('#mindmap_output').scrollLeft(2000);
	   $('#mindmap_output').scrollTop(ttop-500);
	   jsMakeDrop();
	   onResizeMindMap(); 
	   }, 300 );
		
	mydata = data;
	$.each(data[parent_node], function(i,data)
		{
	if(parent_node==main_node) 
	  {
	  $('.map_label[i_am='+main_node+']').attr('old_node',(mydata[main_node][data.id].old_parent) );
	  $('.map_label[i_am='+main_node+']').html( (mydata[main_node][data.id].old_title) );
	  }
	  	if(i_am_first==1)
	  	    {
			jsAddNode(data.parent_id,data.id,data.title,'b_node1',data.node_icon,data);
			}
		else
			jsAddNode(data.parent_id,data.id,data.title,'b_node2',data.node_icon,data);
		
		setTimeout(function(){
	  	    i_am_first=0;
			jsGetMap(mydata,data.id);
			});
	    //jsGetMap(mydata,data.id);
        });

}       

jQuery.fn.swapWith = function(to) {
    return this.each(function() {
        var copy_to = $(to).clone(true);
        var copy_from = $(this).clone(true);
        $(to).replaceWith(copy_from);
        $(this).replaceWith(copy_to);
    });
};


function jsMakeDrop()
{
        //делаем все элементы перетаскиваемыми
		$('.b_node2,.b_center,.b_node1').draggable("destroy").draggable({cursorAt:{ top:0,left:0},revert:true, helper: "clone",drag:
		    function(event,ui){
		    //clearTimeout(trt);
		    //trt = setTimeout( function() { onResizeMindMap(); },50);
			},
			stop:
			function(event,ui){
			onResizeMindMap();
			},
			start:
			function(event,ui)
			{
			drag_now = $(this);
			}
			
			});


        //делаем все элементы Droppable
		$('.b_node2,.b_center,.b_node1').droppable("destroy").droppable({
            accept: ".b_node2,.b_node1",
            activeClass: "ui-state-hover",
            hoverClass: "ui-state-active",
            drop: function( event, ui ) {
                drag_element_id = drag_now.attr("i_am");
                drag_to_id = $( this ).attr("i_am");
                jsMoveNode(drag_element_id , drag_to_id);
            }
        });			


}

function jsMoveNode(drag_element_id , drag_to_id)
{
  dataString = "id="+drag_element_id+"&operation=move_node&copy=0&position=0&ref="+drag_to_id;
  $(".ui-draggable-dragging").remove();
  
  var txt = $.ajax({type: "POST",url: "server.php", data: dataString, success: function(t) 
      {
		$(".map_container[i_am=x"+drag_element_id+"]").appendTo(".map_children[i_am="+drag_to_id+"]"); 
		$(".map_label[i_am="+drag_element_id+"]").attr("parent",drag_to_id);

		if ($(".map_label[i_am="+drag_to_id+"]").hasClass("b_center")) 
			$(".map_label[i_am="+drag_element_id+"]").removeClass("b_node2").addClass("b_node1");
		else
			$(".map_label[i_am="+drag_element_id+"]").removeClass("b_node1").addClass("b_node2");
		jsMakeDrop();	
//		onResizeMindMap();
      }});

}


function jsDeleteNode(my_id)
{
  dataString = "id="+my_id+"&operation=remove_node";
  var txt = $.ajax({type: "POST",url: "server.php", data: dataString, success: function(t) 
      {
		$(".map_label[i_am="+my_id+"]").parent(".map_open_container").parent(".map_container").remove();
		onResizeMindMap();
      }});
}

function jsCreateNode(my_id)
{
  text = "Новая заметка";
  title = encodeURIComponent(text);		

  dataString = "id="+my_id+"&operation=create_node&position=1&title="+title;
  var txt = $.ajax({type: "POST",url: "server.php", data: dataString, success: function(t) 
      {
      	iii = t.id;
		jsAddNode(my_id,iii,'Новая заметка','b_node2','');
		$(".node_selected").removeClass("node_selected");
		$(".map_label[i_am="+iii+"]").addClass("node_selected").click();
		onResizeMindMap();
		jsMakeDrop();
      }});
  
 
}

function jsSaveInput(my_input)
{
  text = my_input.val();
  div_parent = my_input.parent('.map_title');
  id = my_input.parents('.map_label').attr("i_am");
  my_input.remove();
  div_parent.html(text);
  onResizeMindMap();
  
  title = encodeURIComponent(text);		

  dataString = "id="+id+"&operation=rename_node&title="+title;
  var $txt = $.ajax({type: "POST",url: "server.php", data: dataString, success: function(t) 
      {
      }});
  

return true;
}

function jsEscapeInput(my_input)
{
  id = my_input.parents('.map_label').attr("i_am");
  text = my_input.attr("old_text");
  if(my_input.val()=='Новая заметка') { jsDeleteNode(id); return true; }
  div_parent = my_input.parent('.map_title');
  my_input.remove();
  div_parent.html(text);
  onResizeMindMap();
  
return true;
}


function jsDoFirstMindMap()
{ 
    $("#mindmap_note").html($("#mindmap_note").attr('default_text'));

	$('#mindmap_note').draggable();
	$("#mindmap_canvas").hide();
	// Set header viewport to follow viewport scroll on x axis
//	$('.canvas, #header_viewport').
//		scrollsync({targetSelector: '#viewport', axis : 'x'});
	
	// Set drag scroll on first descendant of class dragger on both selected elements
	$('#mindmap_output').dragscrollable({dragSelector: '#mindmap_canvas', acceptPropagatedEvent: true, preventDefault: false});


//$('#mindmap_canvas').append('<div id="n0" class="b_center">Карта ума</div>')

	$('*').delegate(".zoom_out,.zoom_in","click", function ()
	   {
		var ctx = document.getElementById('canvas').getContext('2d');
		ctx.clearRect(0,0,5000,5000);

	   fontsize = parseInt( $("#mindmap_canvas").css("font-size") );
	   
	   if($(this).hasClass("zoom_out"))  
	     {
	     fontsize = fontsize-2;
	     }
	   else 
	     {
	     fontsize = fontsize+2;
	     }
	    
	   if(fontsize<5) fontsize=5;
	   if(fontsize>25) fontsize=25;
	    
	   $("#mindmap_canvas").css("font-size",fontsize);  
	   
	   onResizeMindMap(); 
	   
	   return false;
	   });

	$('*').delegate(".expand_all","click", function ()
	   {
	   $(".b_node1").parents(".map_container").children(".map_children:not(:last)").show().prev(".map_open_container").children(".collapse").removeClass("icon-plus-circle").addClass("icon-minus-circle");
	   $('#mindmap_output').scrollLeft(2000);
	   $('#mindmap_output').scrollTop(2000);
	   onResizeMindMap(); 
	   return false;
	   });

	$('*').delegate(".collapse_all","click", function ()
	   {
	   $(".b_node1").parents(".map_container").children(".map_children:not(:last)").hide().prev(".map_open_container").children(".collapse").removeClass("icon-minus-circle").addClass("icon-plus-circle");
	   $('#mindmap_output').scrollLeft(2000);
	   $('#mindmap_output').scrollTop(2000);
	   onResizeMindMap(); 
	   return false;
	   });


	$('*').delegate(".collapse","click", function ()
	   {
	   
		var ctx = document.getElementById('canvas').getContext('2d');
		ctx.clearRect(0,0,5000,5000);
	   
	    if($(this).hasClass("icon-minus-circle")) $(this).removeClass("icon-minus-circle").addClass("icon-plus-circle");
		else $(this).removeClass("icon-plus-circle").addClass("icon-minus-circle");
	    
	    var centerX = findPos($(this)[0]);
	    console.info('center1 = ',centerX.y);

		var mycollapse = $(this);
		var old_y = centerX.y;
	    
	    $(this).parents(".map_container").children(".map_children:first").toggle();
		var centerX = findPos(mycollapse[0]);
		$('#mindmap_output').scrollTop( $('#mindmap_output').scrollTop()+ (centerX.y-old_y) );
	    onResizeMindMap(); 
	    
		return false;
	   });

	var old_x,old_y;
	
	$('*').delegate("#canvas","mousedown", function (ev)
	   {
	   old_x = ev.clientX;
	   old_y = ev.clientY; 
	   });
	
	var click_canvas;

	$('*').delegate("#canvas","mouseup", function (ev)
	   {
	   if(( old_x == ev.clientX ) && (old_y == ev.clientY)) 
	      {
	      clearTimeout(click_canvas);
	      click_canvas = setTimeout(function(){
			    jsEscapeInput($(".edit_node"));
		  		$('.b_node2,.b_node1').removeClass('node_selected');
		  		$("#mindmap_note").html($("#mindmap_note").attr('default_text'));
		  		},50);
		  }
	   });

	$('*').delegate(".b_node2,.b_node1","mouseover", function ()
	   {
		return false;
	   });

var ar=new Array(33,34,35,36,37,38,39,40);

$(document).keydown(function(e) {
     var key = e.which;
      //console.log(key);
      //if(key==35 || key == 36 || key == 37 || key == 39)
      if(($.inArray(key,ar) > -1) && ($(".node_selected").length)){
          e.preventDefault();
          return false;
      }
      return true;
});


	$('*').delegate("body", "keyup", function(event) 
		{
		event.preventDefault();
		
		console.info(event.keyCode,'key',event);

		if( (event.keyCode=='38') && !event.shiftKey ) //стрелка вверх
		   {
		   next_label = $(".node_selected").parents(".map_container:first").prev(".map_container").find(".map_label:first");
		   if(next_label.length) 
		     {
		     $(".node_selected").removeClass("node_selected");
			 next_label.click().addClass("node_selected");		   
			 }
		   else
		     {
			 next_label = $(".node_selected").parents(".map_container:first").parents(".map_container").prev(".map_container").find(".map_container:last").find(".map_label:last").eq(0);
		   if(next_label.length) {
		     	$(".node_selected").removeClass("node_selected");
			 	next_label.click().addClass("node_selected");		   
			 	}
		     }
//		   $(".node_selected").removeClass("node_selected").next(".map_label").addClass("node_selected");
		   return false;
		   }

		if( (event.keyCode=='40') && !event.shiftKey ) //стрелка вниз
		   {
		   next_label = $(".node_selected").parents(".map_container:first").next(".map_container").find(".map_label:first");
		   if(next_label.length) 
		     {
		     $(".node_selected").removeClass("node_selected");
			 next_label.click().addClass("node_selected");		   
			 }
		   else
		     {
			 next_label = $(".node_selected").parents(".map_container:first").parents(".map_container").next(".map_container").find(".map_container:first").find(".map_label:first").eq(0);
		   if(next_label.length) {
				if(!next_label.is(":visible")) $(".node_selected").next(".collapse").click();
		     	$(".node_selected").removeClass("node_selected");
			 	next_label.click().addClass("node_selected");		   
			 	}
		     }
//		   $(".node_selected").removeClass("node_selected").next(".map_label").addClass("node_selected");
		   return false;
		   }

		if( (event.keyCode=='37') && !event.shiftKey ) //стрелка влево
		   {
		   next_label = $(".node_selected").parents(".map_container").eq(1).find(".map_label:first");
		   if(next_label.length) 
		     {
		     $(".node_selected").removeClass("node_selected");
			 next_label.click().addClass("node_selected");		   
			 }
//		   $(".node_selected").removeClass("node_selected").next(".map_label").addClass("node_selected");
		   return false;
		   }

		if( (event.keyCode=='39') && !event.shiftKey ) //стрелка вправо
		   {
		   next_label = $(".node_selected").parents(".map_container").eq(0).find(".map_container:first").find(".map_label:first");
		   
		   
		   if(next_label.length) 
		     {
			 if(!next_label.is(":visible")) $(".node_selected").next(".collapse").click();
		     $(".node_selected").removeClass("node_selected");
			 next_label.click().addClass("node_selected");		   
			 }
//		   $(".node_selected").removeClass("node_selected").next(".map_label").addClass("node_selected");
		   return false;
		   }



		if( (event.keyCode=='13') && event.shiftKey ) //добавляем узел к этому родителю
		   {
		   id = $(".node_selected").attr("i_am");
		   iii = jsCreateNode(id);
		   }

		if( (event.keyCode=='13') && !event.shiftKey ) //добавляем узел вниз
		   {
		   id = $(".node_selected").attr("parent");
		   iii = jsCreateNode(id);
		   }
		   
		if( (event.keyCode=='46') && !event.shiftKey ) //добавляем узел вниз
		   {
		   id = $(".node_selected").attr("i_am");
		   text = $(".map_label[i_am="+id+"]").children(".map_title").html();
		   if (confirm("Вы действительно хотите удалить дело\n\n["+text+"]?")) jsDeleteNode(id);
		   }
		   
		if( (event.keyCode=='114') && event.altKey ) //Alt + F3 - фокусируемся на элементе
		   {
		   id = $(".node_selected").attr("i_am");
		   document.location="mm.php?mindmap="+id;
		   }
		   
		   
		return false;
		});

	   
	$('*').undelegate(".edit_node", "keyup").delegate(".edit_node", "keyup", function(event) 
		{
		if (event.keyCode=='13')
		   {
		   jsSaveInput($(this));
		   }
		if (event.keyCode=='27')
		   {
		   jsEscapeInput($(this));
		   }
		return false;
		});
	   
	
	// при клике в элемент
	$('*').delegate(".b_node2,.b_node1","click", function ()
	   {
	    
	    if($(this).hasClass("node_selected"))  //редактирую узел
	      { 
	      var current_node = $(this);
		  $(".edit_node").each(function()
		    {
		    if($(this)==current_node) return true;
		    
		    $(this).parent('.map_title').html($(this).val());
		    $(this).remove();
		    });

	      text =  $(this).children('.map_title').html();
	      width = $(this).children('.map_title').width();
	      if(width<300) width = 400;
	      		  
	      if( !($(this).find('input').length) )
	          {
		      $(this).children('.map_title').html('').append('<input style="width:'+width+'px" old_text= "'+text+'" class="edit_node" value="'+text+'"></input>');
		      $(this).find('input').focus();
		      }
	      onResizeMindMap();
	      }
	    
	    $('.b_node2,.b_node1').removeClass('node_selected');
	    $(this).addClass('node_selected');


		id = $(this).attr('i_am');
		if(id!=loaded_note)
		  {
		  clearTimeout(tktk);
		  tktk=
		  setTimeout(function(){
			loaded_note = id;
			lnk = "do.php?notes=node_"+id;
			$("#mindmap_note").load(lnk,function(){
			    if($("#mindmap_note").html()=='') $("#mindmap_note").html($("#mindmap_note").attr('default_text'));
			    });
			console.info(id);
			},200);
		  }


		return false;
	   });

	$('*').delegate(".b_center","click", function ()
	   {
		id = $(this).attr('old_node');
	    document.location="mm.php?mindmap="+id;
		return false;
	   });

	jsGo();

}

function jsGo()
{
   //Главное дерево
   jsAddNode(main_node,main_node,'Карта ума','b_center','');
  
   $.ajaxSetup({cache:false});
   	
   $.getJSON( "do.php?mindmap="+main_node ,function(data)
	{
	var i=1;
	jsGetMap(data,main_node);
        
    });
}

function onResizeMindMap()
{
			var ctx = document.getElementById('canvas').getContext('2d');
			ctx.clearRect(0,0,5000,5000);
//			return true;
		    $('.map_label').each(function(){
		        first = $(".map_label[i_am="+$(this).attr("parent")+"]");
		        if(first.length)
					jsLineBetween(first,$(this));
		        });

//$(".b_center").css({"left":"2400px", "top":"2400px"});

}

var old_y=0;

function jsAddNode(parent,id,text,my_class,node_icon,data)
{
if(id==main_node) { myparent = $('#mindmap_canvas'); addstyle = "margin-left: 2000px; margin-top: 2000px;" }
else { myparent = $('.map_children[i_am='+parent+']'); addstyle = ""; } 

if(data != undefined) 
  {
  have_many_child = data.have_child;
  }
else have_many_child = 0;

if(have_many_child!=0) collapse_button = "<i class='collapse icon-minus-circle' title='"+have_many_child+"'></i>";
else collapse_button = "<i class='collapse icon-minus-circle' style='opacity:0'></i>";

mydiv = "<div class='map_container' i_am='x"+id+"' style='"+addstyle+"'> "+
	"<div class='map_open_container'>"+
		"<div i_am="+id+" parent="+parent+" class='map_label "+my_class+"'>"+
			"<div class='map_title'>"+text+"</div>"+
			"<img class='mind_icon' src='"+node_icon+"'>"+
		"</div>"+
		collapse_button+
	"</div>"+
	"<div class='map_children' i_am='"+id+"' style=''>"+
	"</div>"+
"</div>";

//back = first+'<div parent="n'+parent+'" id="n'+id+'" class="'+my_class+'">'+text+'</div>'+end;

myparent.append(mydiv);

var offset_x = 0;
if($("#n"+parent).hasClass("b_center")) 
  {
  offset_x = 250;
  }
if($("#n"+parent).hasClass("b_node")) 
  { 
  offset_x = 180;
  }
my_left  = $('#mindmap_output').scrollLeft() + myparent.offset().left+offset_x;


my_top =  old_y + $('#mindmap_output').scrollTop();
old_y = old_y + $("#n"+id).height() + 30; 


if(false)
if(id==main_node) myparent.css({"left": "2400px", "top": "2400px"});
else
	$("#n"+id).parent("div").css({"left": my_left+"px", "top": my_top+"px"});

return true;
}

//рисуем линию между DIV
function jsLineBetween(start,finish)
{
if(!start.hasClass("b_center")) start = start.next(".collapse");
point_x = 0; point_y = 0; bezier_x2 = 0; bezier_x1 = 0;
multiply = 1;

if(start.is(":visible")&&finish.is(":visible")!=true) return true;

if(start.hasClass("b_center")) 
  {
	  point_x = start.width()+22;
	  point_y = start.height()/2+8;
	  bezier_x2 = -50;
	  bezier_x1 = 50;    
	  line_width = 1;
  }
  
if(start.prev(".map_label").hasClass("b_node2")) 
  { 
  point_x = start.width()/2+3;
  point_y = start.height()/2+2;
  bezier_x2 = -30;
  bezier_x1 = 20;
  line_width = 1;
  }

if(start.prev(".map_label").hasClass("b_node1")) 
  { 
  point_x = start.width()/2+4;
  point_y = start.height()/2-1;
  bezier_x2 = -30;
  bezier_x1 = 20;
  line_width = 1;
  }
  
//  line_width = 2;

  how_long = finish.offset().left - start.offset().left;

  if( how_long>0 )
    {
    //если узел оказался справа
      multiply = 1;
      multiply_z = 0;
	}
  else
    {
    //если узел оказался слева
      multiply = -1;
      multiply_z = 1;
      point_x = 0;
      bezier_x2 = -bezier_x2;
    }


  w = start.width();
  //если узел посередине
  if( (how_long<(w/2)) && (-how_long<(w/2)) )
    {
      multiply = parseFloat(1/2);
      multiply_z = parseFloat(1/2);
      bezier_x2 = 0;
      bezier_x1 = 0;
//      console.info(how_long,w,multiply);  
    }



var centerX = findPos(start[0]);
centerX.x += parseInt(point_x*multiply);
centerX.y += point_y;
var centerZ = findPos(finish[0]);
centerZ.x += parseInt( finish.width()*multiply_z );

centerZ.y += finish.height()*0+finish.height()/2+3;
//Now you've got both centers in reference to the page
var canvasPos = findPos($('#canvas')[0]);
centerX.x -= canvasPos.x;
centerX.y -= canvasPos.y;
centerZ.x -= canvasPos.x;
centerZ.y -= canvasPos.y;
//Now both points are in reference to the canvas
var ctx = document.getElementById('canvas').getContext('2d');

ctx.lineWidth = 1.2;
ctx.globalAlpha = 1;
ctx.strokeStyle = "#9b9b9b";

ctx.beginPath();
ctx.moveTo(centerX.x, centerX.y-line_width);
//ctx.lineTo(centerZ.x, centerZ.y);
ctx.bezierCurveTo(centerX.x+bezier_x1,centerX.y-line_width,centerZ.x+bezier_x2,centerZ.y,centerZ.x, centerZ.y);
ctx.stroke();
//ctx.beginPath();
//ctx.moveTo(centerX.x, centerX.y+2);
//ctx.bezierCurveTo(centerZ.x+bezier_x2 , centerZ.y+line_width , centerX.x+bezier_x1 , centerX.y , centerX.x , centerX.y+line_width);
//ctx.stroke();
//ctx.closePath();
//ctx.fillStyle = '#9b9b9b';
//ctx.fill();

//Now you should have a line between both divs. You should call this code each time the position changes
return true;
}

//Get the absolute position of a DOM object on a page
function findPos(obj) {
    var curLeft = curTop = 0;
    if (obj.offsetParent) {
        do {
                curLeft += obj.offsetLeft;
                curTop += obj.offsetTop;
        } while (obj = obj.offsetParent);
    }
    return {x:curLeft, y:curTop};
}





//рисуем линию между DIV
function jsLineBetween1(start,finish)
{
point_x = 0; point_y = 0; bezier_x2 = 0; bezier_x1 = 0;
multiply = 1;

if(start.hasClass("b_center")) 
  {
	  point_x = start.width()+30;
	  point_y = start.height()/2+start.height();
	  bezier_x2 = -60;
	  bezier_x1 = 0;    
  }
  
if(start.hasClass("b_node")) 
  { 
  point_x = start.width()+30;
  point_y = start.height()/2+finish.height()/2;
  bezier_x2 = -30;
  bezier_x1 = 50;
  }

  how_long = finish.offset().left - start.offset().left;

  if( how_long>0 )
    {
    //если узел оказался справа
      multiply = 1;
      multiply_z = 0;
	}
  else
    {
    //если узел оказался слева
      multiply = -1;
      multiply_z = 1;
      point_x = 0;
      bezier_x2 = -bezier_x2;
    }


  w = start.width();
  //если узел посередине
  if( (how_long<(w/2)) && (-how_long<(w/2)) )
    {
      multiply = parseFloat(1/2);
      multiply_z = parseFloat(1/2);
      bezier_x2 = 0;
      bezier_x1 = 0;
//      console.info(how_long,w,multiply);  
    }



var centerX = findPos1(start[0]);
centerX.x += parseInt(point_x*multiply);
centerX.y += point_y;

var centerZ = findPos1(finish[0]);
var mydiv = findPos1(finish.parent('div')[0]);

centerZ.x += parseInt( finish.width()*multiply_z );

centerZ.y += finish.height()*0+finish.height()/2+3;
//Now you've got both centers in reference to the page
var canvasPos = findPos1($('#canvas')[0]);
centerX.x -= canvasPos.x;
centerX.y -= canvasPos.y;
centerZ.x -= canvasPos.x;
centerZ.y -= canvasPos.y;
//Now both points are in reference to the canvas
var ctx = document.getElementById('canvas').getContext('2d');

ctx.lineWidth = 3;
ctx.strokeStyle = "#888";

ctx.beginPath();
ctx.moveTo(centerX.x, centerX.y);
//ctx.lineTo(centerZ.x, centerZ.y);
ctx.bezierCurveTo(centerX.x+bezier_x1,centerX.y,centerZ.x+bezier_x2,centerZ.y,centerZ.x, centerZ.y);
ctx.stroke();
//Now you should have a line between both divs. You should call this code each time the position changes
return true;
}

//Get the absolute position of a DOM object on a page
function findPos1(obj) {
    var curLeft = curTop = 0;
    if (obj.offsetParent) {
        do {
                curLeft += obj.offsetLeft;
                curTop += obj.offsetTop;
        } while (obj = obj.offsetParent);
    }
    return {x:curLeft, y:curTop};
}
