/*
 * jQuery scrollsync Plugin
 * version: 1.0 (30 -Jun-2009)
 * Copyright (c) 2009 Miquel Herrera
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 */
;(function($){ // secure $ jQuery alias

/**
 * Synchronizes scroll of one element (first matching targetSelector filter)
 * with all the rest meaning that the rest of elements scroll will follow the 
 * matched one.
 * 
 * options is composed of the following properties:
 *	------------------------------------------------------------------------
 *	targetSelector	| A jQuery selector applied to filter. The first element of
 *					| the resulting set will be the target all the rest scrolls
 *					| will be synchronised against. Defaults to ':first' which 
 *					| selects the first element in the set.
 *	------------------------------------------------------------------------
 *	axis			| sets the scroll axis which will be synchronised, can be
 *					| x, y or xy. Defaults to xy which will synchronise both.
 *	------------------------------------------------------------------------
 */
$.fn.scrollsync = function( options ){
	var settings = $.extend(
			{   
				targetSelector:':first',
				axis: 'xy'
			},options || {});
	
	
	function scrollHandler(event) {
		if (event.data.xaxis){
			event.data.followers.scrollLeft(event.data.target.scrollLeft());
		}
		if (event.data.yaxis){
			event.data.followers.scrollTop(event.data.target.scrollTop());
		}
	}
	
	// Find target to follow and separate from followers
	settings.target = this.filter(settings.targetSelector).filter(':first');
	settings.followers=this.not(settings.target); // the rest of elements

	// Parse axis
	settings.xaxis= (settings.axis=='xy' || settings.axis=='x') ? true : false; 
	settings.yaxis= (settings.axis=='xy' || settings.axis=='y') ? true : false;
	if (!settings.xaxis && !settings.yaxis) return;  // No axis left 
	
	// bind scroll event passing array of followers
	settings.target.bind('scroll', settings, scrollHandler);
	
}; // end plugin scrollsync

})( jQuery ); // confine scope









/*
 * jQuery dragscrollable Plugin
 * version: 1.0 (25-Jun-2009)
 * Copyright (c) 2009 Miquel Herrera
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 */
;(function($){ // secure $ jQuery alias

/**
 * Adds the ability to manage elements scroll by dragging
 * one or more of its descendant elements. Options parameter
 * allow to specifically select which inner elements will
 * respond to the drag events.
 * 
 * options properties:
 * ------------------------------------------------------------------------		
 *  dragSelector         | jquery selector to apply to each wrapped element 
 *                       | to find which will be the dragging elements. 
 *                       | Defaults to '>:first' which is the first child of 
 *                       | scrollable element
 * ------------------------------------------------------------------------		
 *  acceptPropagatedEvent| Will the dragging element accept propagated 
 *	                     | events? default is yes, a propagated mouse event 
 *	                     | on a inner element will be accepted and processed.
 *	                     | If set to false, only events originated on the
 *	                     | draggable elements will be processed.
 * ------------------------------------------------------------------------
 *  preventDefault       | Prevents the event to propagate further effectivey
 *                       | dissabling other default actions. Defaults to true
 * ------------------------------------------------------------------------
 *  
 *  usage examples:
 *
 *  To add the scroll by drag to the element id=viewport when dragging its 
 *  first child accepting any propagated events
 *	$('#viewport').dragscrollable(); 
 *
 *  To add the scroll by drag ability to any element div of class viewport
 *  when dragging its first descendant of class dragMe responding only to
 *  evcents originated on the '.dragMe' elements.
 *	$('div.viewport').dragscrollable({dragSelector:'.dragMe:first',
 *									  acceptPropagatedEvent: false});
 *
 *  Notice that some 'viewports' could be nested within others but events
 *  would not interfere as acceptPropagatedEvent is set to false.
 *		
 */
$.fn.dragscrollable = function( options ){
   
	var settings = $.extend(
		{   
			dragSelector:'>:first',
			acceptPropagatedEvent: true,
            preventDefault: true
		},options || {});
	 
	
	var dragscroll= {
		mouseDownHandler : function(event) {
			// mousedown, left click, check propagation
			if (event.srcElement.clientHeight<4000) return false; //двигаем только большие дивы
			if (event.which!=1 ||
				(!event.data.acceptPropagatedEvent && event.target != this)){ 
				return false; 
			}
			
			// Initial coordinates will be the last when dragging
			event.data.lastCoord = {left: event.clientX, top: event.clientY}; 
		
			$.event.add( document, "mouseup", 
						 dragscroll.mouseUpHandler, event.data );
			$.event.add( document, "mousemove", 
						 dragscroll.mouseMoveHandler, event.data );
			if (event.data.preventDefault) {
                event.preventDefault();
                return false;
            }
		},
		mouseMoveHandler : function(event) { // User is dragging
			// How much did the mouse move?
			var delta = {left: (event.clientX - event.data.lastCoord.left),
						 top: (event.clientY - event.data.lastCoord.top)};
			
			// Set the scroll position relative to what ever the scroll is now
			event.data.scrollable.scrollLeft(
							event.data.scrollable.scrollLeft() - delta.left);
			event.data.scrollable.scrollTop(
							event.data.scrollable.scrollTop() - delta.top);
			
			// Save where the cursor is
			event.data.lastCoord={left: event.clientX, top: event.clientY}
			if (event.data.preventDefault) {
                event.preventDefault();
                return false;
            }

		},
		mouseUpHandler : function(event) { // Stop scrolling
			$.event.remove( document, "mousemove", dragscroll.mouseMoveHandler);
			$.event.remove( document, "mouseup", dragscroll.mouseUpHandler);
			if (event.data.preventDefault) {
                event.preventDefault();
                return false;
            }
		}
	}
	
	// set up the initial events
	this.each(function() {
		// closure object data for each scrollable element
		var data = {scrollable : $(this),
					acceptPropagatedEvent : settings.acceptPropagatedEvent,
                    preventDefault : settings.preventDefault }
		// Set mouse initiating event on the desired descendant
		$(this).find(settings.dragSelector).
						bind('mousedown', data, dragscroll.mouseDownHandler);
	});
}; //end plugin dragscrollable

})( jQuery ); // confine scope