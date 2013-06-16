/*********************
//* jQuery Multi Level CSS Menu #2- By Dynamic Drive: http://www.dynamicdrive.com/
//* Created: Nov 2nd, 08'
//* Menu avaiable at DD CSS Library: http://www.dynamicdrive.com/style/
*********************/

//Specify full URL to down and right arrow images (23 is padding-right to add to top level LIs with drop downs):
var arrowimages={down:['downarrowclass', './css/down.gif', 22], right:['rightarrowclass', './css/right.gif']}

var jqueryslidemenu={

animateduration: {over: 60, out: 50}, //duration of slide in/ out animation, in milliseconds

buildmenu:function(menuid, arrowsvar){
	jQuery(document).ready(function($){
		var may_hover = false;
		var $mainmenu=$("#"+menuid+">ul");
		
		$("#"+menuid).on("all_screen_click", function(){
	    		may_hover = false;	    		
	    		$mainmenu.find("ul").hide();
	    		$mainmenu.find(".active").removeClass("active");
		});		
		
		$mainmenu.on("click",".top_level > a",function(e){
    		e.stopPropagation();					
    		if(may_hover) {
	    		may_hover = false;	    		
	    		$mainmenu.find("ul").hide();
	    		$mainmenu.find(".active").removeClass("active");
		        $(".all_screen_click").remove();	    		
    		} else {
	    		may_hover = true;
	    		$(this).parent("li").mouseenter();
		        $("#wrap").append("<div class='all_screen_click'></div>");	    		
    		}
    		
    		console.info("may",may_hover);
    		return false;
    	});
		
		
		var $headers=$mainmenu.find("ul").parent();
		
		$mainmenu.find("li").not($headers).each(function(i){
			$(this).mouseenter( function(e){

				$mainmenu.find("ul").not($(this).parents("ul")).hide().
						  parent("li").removeClass("active");				

			})
		});
		
		$headers.each(function(i){
			
			var $curobj=$(this);
			var $subul=$(this).find('ul:eq(0)');
			
			this._dimensions={w:this.offsetWidth, h:this.offsetHeight, 
							subulw:$subul.outerWidth(), subulh:$subul.outerHeight()};
			
			this.istopheader=$curobj.parents("ul").length==1? true : false;
			
			$subul.css({top:this.istopheader? this._dimensions.h+"px" : 0});
			
			if(!this.istopheader) {

			$curobj.children("a:eq(0)").prepend(
				'<span class="rightarrowclass"><i class="icon-right-open"></i></span>'
			);
			}
					
			$curobj.mouseenter( function(e){
				if(may_hover==false) return true;
				var $targetul=$(this).children("ul:eq(0)");
				this._offsets={left:$(this).offset().left, top:$(this).offset().top};
				var menuleft=this.istopheader? 0 : this._dimensions.w;
				
				menuleft=(this._offsets.left+menuleft+this._dimensions.subulw>$(window).width())? (this.istopheader? -this._dimensions.subulw+this._dimensions.w : -this._dimensions.w) : menuleft;								
				$mainmenu.find("ul").not($targetul.parents("ul")).
						  not($targetul.find("ul")).hide().
						  parent("li").removeClass("active");
				$targetul.css({left:menuleft+"px"}).show().parent("li").addClass("active");
				//width:this._dimensions.subulw+'px'
			});
			
//				function(e){
//					var $targetul=$(this).children("ul:eq(0)")
//					$targetul.hide()
//				}

			
		}) //end $headers.each()
		$mainmenu.find("ul").css({display:'none', visibility:'visible'})
	}) //end document.ready
}
}

//build menu with ID="myslidemenu" on page:
jqueryslidemenu.buildmenu("myslidemenu", arrowimages)