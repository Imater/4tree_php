var canvas;

function jsFotoDoFirst() {
	$("#foto_toolbar_settings").draggable();
	$("#foto_toolbar").draggable();
	$("#foto_toolbar_actions").draggable();
	
	
	$("#add_picture").on("click",function(){
		jsFotoEditorInit();
	});

	$("#foto_toolbar").on("click","#tool_pencil",function(){
		if(!canvas.isDrawingMode) {
			canvas.isDrawingMode = true;
			canvas.freeDrawingLineWidth = 5;
			$(this).find("i").addClass("active");
		} else {
			canvas.isDrawingMode = false;
			$(this).find("i").removeClass("active");
		}
	});

}

function jsAddColorPalette() {
	var main_colors = ["#000000", "#0000ff", "#996633", "#00ffff", "#00ff00",
					   "#ff7f00", "#7f007f", "#ff0000", "#ffff00",
					   "#ffffff",'url("img/transparent_box.png")'];
	var background_colors = ["#000000", "#0000ff", "#996633", "#00ffff", "#00ff00",
					   "#ff7f00", "#7f007f", "#ff0000", "#ffff00",
					   "#ffffff",'url("img/transparent_box.png")'];
					  
	$("#foto_toolbar").append("<div class='main_colors'></div>"+
							  "<div class='background_colors'></div>");
							  
	var div_colors = "";
	for(var i=0; i<main_colors.length; i++) {
		if(i==2) { 
			var active = "<i class='icon-eyedropper'></i>";
		} else {
			var active = "";
		}
		div_colors += "<div class='color_sample' style='background:"+
							main_colors[i]+"'>"+active+"</div>";
	}
	$(".main_colors").append(div_colors);

	var div_colors	= "";
	for(var i=0; i<background_colors.length; i++) {
		if(i==background_colors.length-1) { 
			var active = "<i class='icon-eyedropper'></i>";
		} else {
			var active = "";
		}
		div_colors += "<div class='color_sample_bg' style='background:"+
							background_colors[i]+"'>"+active+"</div>";
	}
	$(".background_colors").append(div_colors);

	$(".color_sample").on("click",function(){
		$(".color_sample").html("");
		$(this).html("<i class='icon-eyedropper'></i>")
	});

	$(".color_sample_bg").on("click",function(){
		$(".color_sample_bg").html("");
		$(this).html("<i class='icon-eyedropper'></i>")
	});



}


function jsFotoEditorInit() {

	jsAddColorPalette();
	$("#foto_canvas").html('<canvas id="c" width="1024" height="868"></canvas>');
	$("#foto_editor").show();

	canvas = new fabric.Canvas("c");

	fabric.Canvas.prototype.getAbsoluteCoords = function(object) {
	  return {
	    left: object.left + this._offset.left,
	    top: object.top + this._offset.top
	  };
	}
	
	jsFotoLoadFromUrl();
	
// create a rectangle object
var rect = new fabric.Rect({
  left: 10,
  top: 10,
  fill: 'red',
  width: 20,
  height: 20
});

// "add" rectangle onto canvas
canvas.add(rect);	

rect.set('fill', 'red');
rect.set({ strokeWidth: 5, stroke: 'rgba(100,200,200,0.5)' });
rect.set('angle', 15).set('flipY', true);
canvas.renderAll();


}

var myimg;

function jsFotoLoadFromUrl() {
	
	fabric.Image.fromURL("img/02.jpeg", function(img) {
	
    canvas.add(img.set({ left: 250, top: 250, angle: 35 }).scale(0.1));

	img.animate('angle', 0, {
		onChange: canvas.renderAll.bind(canvas),
		duration: 500
	});
	
	var text = new fabric.Text('Валюшка', {
	  fontSize: 30
	});
	
	var circle = new fabric.Circle({
	  radius: 100,
	  fill: '#eef',
	  scaleY: 0.5
	});
	
	var group = new fabric.Group([ text, circle ], {
	  left: 150,
	  top: 100,
	  angle: -10
	});
	
	group.item(0).set({
	  text: 'Запеканка',
	  fill: 'green'
	});
	group.item(1).setFill('yellow');	
	
	canvas.add(group);
	
	});
}