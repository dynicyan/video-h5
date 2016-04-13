$(document).ready(function(){
	//INITIALIZE
	var video = $('#myVideo');
	
	//remove default control when JS loaded
	video[0].removeAttribute("controls");
	$('.control').show()//.css({'bottom':-45});
	$('.loading').fadeIn(500);
	$('.caption').fadeIn(500);
 
	//before everything get started
	video.on('loadedmetadata', function() {
		$('.caption').animate({'top':-45},300);
			
		//set video properties
		$('.current').text(timeFormat(0));
		$('.duration').text(timeFormat(video[0].duration));
		updateVolume(0, 0.7);
			
		//start to get video buffering data 
		setTimeout(startBuffer, 150);
			
		//bind video events
		$('.videoContainer')
		.append('<div id="init"></div>')
		.hover(function() {
			$('.control').stop().animate({'bottom':0}, 500);
			$('.caption').stop().animate({'top':0}, 500);
		}, function() {
			if(!volumeDrag && !timeDrag){
				$('.control').stop()//.animate({'bottom':-45}, 500);
				$('.caption').stop().animate({'top':-45}, 500);
			}
		})
		.on('click', function() {
			$('#init').remove();
			$('.btnPlay').addClass('paused');
			$(this).unbind('click');
			video[0].play();
		});
		$('#init').fadeIn(200);
	});
	
	//display video buffering bar
	var startBuffer = function() {
		var currentBuffer = video[0].buffered.end(0);
		var maxduration = video[0].duration;
		var perc = 100 * currentBuffer / maxduration;
		$('.bufferBar').css('width',perc+'%');
			
		if(currentBuffer < maxduration) {
			setTimeout(startBuffer, 500);
		}
	};	
	
	//display current video play time
	video.on('timeupdate', function() {
		var currentPos = video[0].currentTime;
		var maxduration = video[0].duration;
		var perc = 100 * currentPos / maxduration;
		$('.timeBar').css('width',perc+'%');	
		$('.current').text(timeFormat(currentPos));	
	});
	
	//CONTROLS EVENTS
	//video screen and play button clicked
	video.on('click', function() { playpause(); } );
	$('.btnPlay').on('click', function() { playpause(); } );
	var playpause = function() {
		if(video[0].paused || video[0].ended) {
			$('.btnPlay').addClass('paused');
			video[0].play();
		}
		else {
			$('.btnPlay').removeClass('paused');
			video[0].pause();
		}
	};
	
	//speed text clicked
	$('.btnx1').on('click', function() { fastfowrd(this, 1); });
	$('.btnx3').on('click', function() { fastfowrd(this, 3); });
	var fastfowrd = function(obj, spd) {
		$('.text').removeClass('selected');
		$(obj).addClass('selected');
		video[0].playbackRate = spd;
		video[0].play();
	};
	
	//stop button clicked
	$('.btnStop').on('click', function() {
		$('.btnPlay').removeClass('paused');
		updatebar($('.progress').offset().left);
		video[0].pause();
	});
	
	//fullscreen button clicked
	$('.btnFS').on('click', function() {
		// if($(this).hasClass("btnFSW")){
		// 	$(this).removeClass("btnFSW");
		// 	if($.isFunction(document.webkitCancelFullScreen)) {
		// 		document.webkitCancelFullScreen();
		// 	}	
		// 	else if ($.isFunction(document.mozCancelFullScreen)) {
		// 		document.mozCancelFullScreen();
		// 	}
		// 	else {
		// 		alert('Your browsers doesn\'t support fullscreen');
		// 	}
		// }else{
		// 	$(this).addClass("btnFSW");
		// 	if($.isFunction(video[0].webkitRequestFullScreen)) {
		// 		video[0].webkitRequestFullScreen();
		// 	}	
		// 	else if ($.isFunction(video[0].mozRequestFullScreen)) {
		// 		video[0].mozRequestFullScreen();
		// 	}
		// 	else {
		// 		alert('Your browsers doesn\'t support fullscreen');
		// 	}
		// }
		
		if(document.webkitIsFullScreen){
			document.webkitCancelFullScreen();
		}else{
			video[0].webkitRequestFullScreen();
		}
		/*else if ($.isFunction(video[0].mozRequestFullScreen)) {
			video[0].mozRequestFullScreen();
		}
		else {
			alert('Your browsers doesn\'t support fullscreen');
		}*/
		
	});
	
	//light bulb button clicked
	$('.btnLight').click(function() {
		$(this).toggleClass('lighton');
		
		//if lightoff, create an overlay
		if(!$(this).hasClass('lighton')) {
			$('body').append('<div class="overlay"></div>');
			$('.overlay').css({
				'position':'absolute',
				'width':100+'%',
				'height':$(document).height(),
				'background':'#000',
				'opacity':0.9,
				'top':0,
				'left':0,
				'z-index':999
			});
			$('.videoContainer').css({
				'z-index':1000
			});
		}
		//if lighton, remove overlay
		else {
			$('.overlay').remove();
		}
	});
	
	//sound button clicked
	$('.sound').click(function() {
		if($('.volume_none').css('display')=="none"){
			$('.volume_none').show();
			return false;
		}
		video[0].muted = !video[0].muted;
		$(this).toggleClass('muted');
		if(video[0].muted) {
			$('.volumeBar').css('height',0);
			$('.volumeT').text(0);
		}
		else{
			$('.volumeBar').css('height', video[0].volume*100+'%');
			$('.volumeT').text(Math.floor(video[0].volume*100));
		}
	});

	$("body").not($(".sound")).click(function(){
		$('.volume_none').hide();
	})
	
	//VIDEO EVENTS
	//video canplay event
	video.on('canplay', function() {
		$('.loading').fadeOut(100);
	});
	
	//video canplaythrough event
	//solve Chrome cache issue
	var completeloaded = false;
	video.on('canplaythrough', function() {
		completeloaded = true;
	});
	
	//video ended event
	video.on('ended', function() {
		$('.btnPlay').removeClass('paused');
		video[0].pause();
	});

	//video seeking event
	video.on('seeking', function() {
		//if video fully loaded, ignore loading screen
		if(!completeloaded) { 
			$('.loading').fadeIn(200);
		}	
	});
	

	
	//video waiting for more data event
	video.on('waiting', function() {
		$('.loading').fadeIn(200);
	});
	
	//VIDEO PROGRESS BAR
	//when video timebar clicked
	var timeDrag = false;	/* check for drag event */
	$('.progress').on('mousedown', function(e) {
		timeDrag = true;
		updatebar(e.pageX);
	});
	$(document).on('mouseup', function(e) {
		if(timeDrag) {
			timeDrag = false;
			updatebar(e.pageX);
		}
	});
	$(document).on('mousemove', function(e) {
		if(timeDrag) {
			updatebar(e.pageX);
		}
	});
	$('.progress').on('touchstart', function(e) {
		timeDrag = true;
		var XX = event.targetTouches[0].pageX;
		updatebar(XX);
		$(document).on('touchend', function(e) {
			if(timeDrag) {
				timeDrag = false;
				updatebar(XX);
			}
		});
		$(document).on('touchmove', function(e) {
			if(timeDrag) {
				XX = event.targetTouches[0].pageX;
				updatebar(XX);
			}
		});
	});
	

	var updatebar = function(x) {
		var progress = $('.progress');
		
		//calculate drag position
		//and update video currenttime
		//as well as progress bar
		var maxduration = video[0].duration;
		var position = x - progress.offset().left;
		var percentage = 100 * position / progress.width();
		if(percentage > 100) {
			percentage = 100;
		}
		if(percentage < 0) {
			percentage = 0;
		}
		$('.timeBar').css('width',percentage+'%');	
		video[0].currentTime = maxduration * percentage / 100;
	};

	//VOLUME BAR
	//volume bar event
	var volumeDrag = false;
	$('.volume').on('mousedown', function(e) {
		e.stopPropagation();
		volumeDrag = true;
		video[0].muted = false;
		$('.sound').removeClass('muted');
		updateVolume(e.pageY);
	});
	$(document).on('mouseup', function(e) {
		if(volumeDrag) {
			volumeDrag = false;
			updateVolume(e.pageY);
		}
	});
	$(document).on('mousemove', function(e) {
		if(volumeDrag) {
			updateVolume(e.pageY);
		}
	});

	$('.volume').on('touchstart', function(e) {
		e.stopPropagation();
		volumeDrag = true;
		video[0].muted = false;
		$('.sound').removeClass('muted');
		var XX = event.targetTouches[0].pageY;
		updateVolume(XX);
			$(document).on('touchend', function(e) {
			if(volumeDrag) {
				volumeDrag = false;
				updateVolume(XX);
			}
		});
		$(document).on('touchmove', function(e) {
			if(volumeDrag) {
				XX = event.targetTouches[0].pageY;
				updateVolume(XX);
			}
		});
	});
	

	var updateVolume = function(x, vol) {
		var volume = $('.volume');
		var percentage;
		//if only volume have specificed
		//then direct update volume
		if(vol) {
			percentage = vol * 100;
		}
		else {
			var position = volume.height() + volume.offset().top - x;
			percentage = 100 * position / volume.height();
		}
		
		if(percentage > 100) {
			percentage = 100;
		}
		if(percentage < 0) {
			percentage = 0;
		}
		
		//update volume bar and video volume
		$('.volumeBar').css('height',percentage+'%');	
		video[0].volume = percentage / 100;
		$('.volumeT').text(Math.floor(video[0].volume*100));
		//change sound icon based on volume
		if(video[0].volume == 0){
			$('.sound').removeClass('sound2').addClass('muted');
		}
		else if(video[0].volume > 0.5){
			$('.sound').removeClass('muted').addClass('sound2');
		}
		else{
			$('.sound').removeClass('muted').removeClass('sound2');
		}
	};

	//Time format converter - 00:00
	var timeFormat = function(seconds){
		var m = Math.floor(seconds/60)<10 ? "0"+Math.floor(seconds/60) : Math.floor(seconds/60);
		var s = Math.floor(seconds-(m*60))<10 ? "0"+Math.floor(seconds-(m*60)) : Math.floor(seconds-(m*60));
		return m+":"+s;
	};
});