/**
 * jquery.presentor.js
 * @author Zenobius Jiricek
 * @version 1.0
 * 
 * slideshow presentation of html elements with incremental slide objects.
 * 
 * 	Requires :
 * 		jquery.mousewheel
 *
 */

(function($) {
	//
	// private function for debugging
	//
	pluginName = "jquery.presentor"
	function debug(msg) {
		if (window.console && window.console.log)
		window.console.log("[" + pluginName + "] : " + msg);
	};
	
	$.fn.cleanWhiteSpace = function(){
		var	obj = $(this);
		return obj.html( obj.html().replace(/[\r+\n+\t+]\s\s+/g, "") );
	}
	
  $.fn.presentor = function(settings) {
		var config = $.extend({}, $.fn.presentor.defaults, settings);
		var window_height = $(window).height();
		var window_width = $("body").width();
		debug("Starting presentor")
		debug($("body").outerWidth())
		var frame = $(this)
		var frame_id = frame.attr("rel")
		var tray = $('.'+config.trayName+"[rel="+frame_id+"]")
		var slides = frame.find('.'+config.slideName)
		var incrementals = frame.find('.'+config.incrementalName)
		var progress_bar = $("." + config.incrementalProgressBarName)
		var slideProgressBarText = $("." + config.slideProgressBarTextName)
		var navigationBar = $("." + config.navigationBarName)
		
		var canvas = $("." + config.canvasName)
		slides.css("opacity",0)
		
		create_incrementals_progressbar = function() {
			if(progress_bar.size() > 0){
				progress_bar.css({
					"display" 		: "inline",
					"float"				: "left",
					"background" 	: "#666",
					"width"				: navigationBar.width() * (navigationBar.height()/navigationBar.width()),
					"overflow"		: "hidden"
				})
				var indicator = progress_bar.find(".indicator")
						indicator.css({
							"display" 		: "inline",
							"float"				:	"left",
							"width"				: "0",
							"height"			:	"1em",
							"background"	: "#ccc",
							"margin"			: "0em",
							"padding"			: "0em"
						})
			}
		}

		update_incrementals_progressbar = function(slide_number){
			if(progress_bar.size() > 0) {
				var indicator = progress_bar.find(".indicator")
				var current_slide_incrementals = frame.find("."+ config.slideName + "[alt="+slide_number+"] ."+config.incrementalName)
				var current_slide_incrementals_hidden = current_slide_incrementals.filter(":hidden")
				
				var steps = progress_bar.width() / current_slide_incrementals.size()
				var position = steps * (current_slide_incrementals.size() - current_slide_incrementals_hidden.size())

						debug("progressbar : stepSize[" + steps + "] position[" + position + "] ")
						indicator.animate({
							"width"	: position
						},50)
						indicator.html()
			}
		}

		hide_slide_incrementals = function(slide_number){
			var current_slide_incrementals = frame.find("."+ config.slideName + "[alt="+slide_number+"] ."+config.incrementalName)
					current_slide_incrementals.hide()
		}


		resize_frames = function(){
			margin = $(window).width() - canvas.innerWidth()

			
			canvas.css({
				"height" : $(window).height() - margin,
				"width"	: $(window).width() - margin
				})
			tray.css({
				"display" 	: "inline",
				"float"			:	"left",
				"width"  		: canvas.width() * slides.size(),
				"height" 		: canvas.height(),
				'overflow'	: 'hidden'
			})
			slides.css({
				"display" 	: "inline",
				"float"			:	"left",
				"width"			:	get_slide_width(),
				"height" 		: tray.height(),
				'overflow'	: 'hidden'
			})

		}
		get_tray_width = function(){
			return  get_slide_width() * slides.size()
		}
		get_slide_width = function(){
			return  canvas.width() 
		}
		
		increment = function(){
			var current_slide = frame.find("."+config.slideName+"[alt="+frame.data("current_slide")+"]")
			var slide_incrementals = current_slide.find("."+config.incrementalName + ":hidden")
			
			debug("incrementals [" + slide_incrementals.size() + "]")
			if (slide_incrementals.size() == 0){
				transition("next")
			}else{
				slide_incrementals.filter(":first").show()
				update_incrementals_progressbar(current_slide.attr("alt"))
			}
		}

		move = function(newMargin){
			frame.data("is_moving",1)
			tray.animate({
				"opacity" : 0
				},200);
			progress_bar.animate({
				"opacity" : 0
				},200);
				
			
			tray.animate({
				"marginLeft" : "-" + newMargin,
			},function(){
				var next_slide_number = frame.data("next_slide")
				frame.data("current_slide", next_slide_number )
				frame.data("is_moving",0)
				resize_frames()
				hide_slide_incrementals(next_slide_number)

				update_incrementals_progressbar( next_slide_number )
				tray.animate({
					"opacity" : 1
					},200);
				progress_bar.animate({
					"opacity" : 1
					},200);
				if(slideProgressBarText.size() > 0){
						slideProgressBarText.text(next_slide_number)
					}
			});
			
		}
		
		transition = function(action){
			var tray = $('.'+config.trayName+"[rel="+frame_id+"]")
			if(tray.is(":animated")) {
				debug("can't move, tray is animating")
				return false;
			}
			var current_slide_number =  frame.data("current_slide")
			var current_slide = frame.find("."+config.slideName+"[alt="+current_slide_number+"]")
			
			var next_slide_number = 0

			if(action == "next"){
				next_slide_number = current_slide_number + 1
				if(next_slide_number > slides.size()){ next_slide_number = 1 }
				debug("++")
			}
			
			if(action == "previous"){
				next_slide_number = current_slide_number - 1
				if(next_slide_number <= 0){ next_slide_number = slides.size() }
				debug("---")
			}

			next_slide = frame.find('.'+config.slideName+'[alt='+next_slide_number+']')
			newMargin = get_slide_width() * (next_slide_number-1)

			if(next_slide_number == 1){
					newMargin = 0
			}

			debug("C : " + current_slide_number + " N : "+next_slide_number + " Sc : "+slides.size())
			debug("tW : " + tray.outerWidth() + " nM : " + newMargin + " cM : " + tray.css("marginLeft"))
			frame.data("next_slide",next_slide_number)
			move(newMargin)
		}

		frame.data("is_moving",0)
		frame.data("slide_count", slides.size())
		frame.data("current_slide",1)


		$('body').css('overflow', 'hidden');
		frame.css('overflow', 'hidden');

		debug("Frame has tray "+config.trayName+ " wide : "+tray.innerWidth()+" high :"+tray.innerHeight())
		
		debug("Frame has "+slides.size()+" slides. wide : "+get_slide_width()+" high :"+window_height)
		debug("Frame has "+incrementals.size()+" incrementals.")

		incrementals.hide()
		
		resize_frames()
		
		//Window Resize Event
		$(window).resize( function(){
			resize_frames()
			tray.animate({
					"marginLeft" : "-" + get_slide_width() * (frame.data("current_slide")-1)
				},50)
		})
			 
		// mousewheel events for the frame
		$(window).mousewheel(function(event, delta){
			event.preventDefault()
			debug("mousewheel " + event +" : " + delta)
			if(delta < 0){
				transition('next' );
			}else{
				transition('previous' );
			}
		})
	
		// attaching keyboard events
		$(window).keydown(function(event,delta){
			if(event.keyCode == config.keyIncrement ){
				event.preventDefault()
				increment()
			}else if(event.keyCode== config.keyNextSlide ){
				event.preventDefault()
				transition('next' );
			}else if(event.keyCode== config.keyPreviousSlide ){
				event.preventDefault()
				transition('previous' );
			}else{
				debug("Keypressed : " + event.keyCode)
			}
		});
		
		// attaching left button event
		$(".left-button[rel="+frame_id+"]")
			.click(function(event){
				event.preventDefault()
				transition('previous' )
			})

		// attaching right button event
		$(".right-button[rel="+frame_id+"]")
			.click(function(event){
				event.preventDefault()
				transition('next' )
			})
			
		// attach events to jump-links
		$(".jump-to")
			.click(function(event){
				event.preventDefault()
				transition('jump', $(this).attr("alt") );
			});

		create_incrementals_progressbar()
		update_incrementals_progressbar(1)
		
		slides.animate({
			'opacity': '1'
		}, 300, "swing");
		
	};

	//
	// plugin defaults
	//
	$.fn.presentor.defaults = {
		"trayName"										:	"presentation-tray",
		"slideName" 									: "slide",
		"slideInnerName"							:	"slide-inner",
		"slideProgressBarName"				: "slide-progress",
		"slideProgressBarTextName"		: "slide-progress-text",
		"incrementalName" 						: "incremental",
		"incrementalProgressBarName"	: "incremental-progress",
		"navigationBarName"						: "slideshow-navigation-bar",
		"canvasName"										: "canvas",
		"fullscreen" 									: true,
		"keyNextSlide" 								: 39,
		"keyPreviousSlide" 						: 37,
		"keyIncrement" 								: 32,
		"transitionSpeed" 						: 500
	};

	//
	// end of closure
	//
})(jQuery);
