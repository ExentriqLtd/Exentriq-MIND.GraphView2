currentRenderer=null;

autocompleteRequest = null;


$(document).ready(function()
	{
	clearHistory();
	
	initVideo();
	initMain();
	initActions();
	initLoginBar();
	initSearchBar();
	initBreadcrumbs();
	initModals();
	initTooltips();
	initMore();
	
	
	miscFixes();
	
	
	initAdmin();
	
	
	window.addEventListener('popstate', function(event) 
		{
		console.log('popstate fired!',event);

		var data = event.state;
		if(data)
			{
			switch(data.action)
				{
				case "disambiguation" : 
					manualSearch(data.query,true);
					break;
				case "startSearch" :
					startSearch(data.query,data.terms,data.sense);
					break;
				case "goToHistory" :	
					$("#state"+data.index).trigger("click");
					break;
				}	
			}
		
		});
	});

function initMain()
	{
	ngraph.main();
	//svggraph.main();
	
	currentRenderer = ngraph;
	currentRenderer.toggleRenderer(true);
	}
function initActions()
	{
	var sound = new Audio("sshot.mp3");
	$("#historyslider .camera")
		.on("click",function()
			{
			$("#historyslider").addClass("open");
			var flash=$('<div style="position:absolute;top:0;left:0;z-index: 10000;width:100%;height:100%;background:white;display:block;"></div>')
			$("body").append(flash);
			sound.play();
			flash
				.delay(100)
				.fadeOut(500,function(){flash.remove();});
			currentRenderer.exportImage();
			});
	$("#historyslider .toggle").on("click",function()
		{
		$("#historyslider").toggleClass("open");
		});
	$("#rightbar .toggle").on("click",function()
		{
		$("#mainblocks").toggleClass("fullsize");
		});
	$("#switcher").on("click",function()
		{
		if(!$(this).hasClass("disabled"))
			treeNodePosition();		
		});
	$("#toggleendpoint").on("click",function()
		{
		if($(this).attr("data-endpoint")=="graph")
			{
			$(this).attr("data-endpoint","docs");
			$(this).html('NEW');
			}
		else
			{
			$(this).attr("data-endpoint","graph");
			$(this).html('OLD');
			}
		});
	$("#filtertitle").on("click",function()
		{
		$("#filtercontainer").toggleClass("open");
		});
	}

function initLoginBar()
	{
	$("#login")
		.on("click",function()
			{
			$('#topbar .form-horizontal').removeClass("invalid");
			$.getJSON("/rest/terms/login?username="+$("#username").val()+"&password="+$("#password").val())
				.done(function(user)
					{
					if(user)
						{
						if(user.role == "admin")
							{
							$('#admin').show()
							}
						$('#topbar').removeClass("login");
						setTimeout(function()
							{
							$('#searchfield').focus();
							},1000);
						}
					else
						$('#topbar .form-horizontal').addClass("invalid");
					})
				.fail(function()
					{
					$('#topbar .form-horizontal').addClass("invalid");
					})
			});
	$('#loginbox input')
		.on('keyup',function(e)
			{
			if(e.keyCode == 13)
				{
				$("#login").trigger("click");
				}
			});
	$("#logout")
		.on("click",function()
			{
			$.getJSON("/rest/terms/logout")
				.always(function(data)
					{
					location.href = "/hariterms/";
					});
			});
	}
function initSearchBar()
	{
	var searchfield = $('#searchfield').typeahead(
		{
		appendtoBody : true,
		source:advancedSearchAutocomplete,
		autoSelect:true,
		minLength: 1,
		highlight: true,
		matcher : function ()
			{return true;},
		sorter  : function (items)
			{return items;},
		updater : function (item)
			{
			item = item
				.replace("<b>Did you mean :</b> ", "")
				.replace("<b>DISCOVER :</b> ","");
			manualSearch(item);
			return item;
			}
		});
	$('#searchfield')
		.on('keyup',function(e)
			{
			var query=$("#searchfield").val();
			switch(e.keyCode)
				{
				case 13:
					$('#searchfield').typeahead("hide");
					manualSearch(query);
					break;
				case 40:
				case 38:
					var text = $(".typeahead .active").data('value')
						.replace("<b>Did you mean :</b> ", "")
						.replace("<b>DISCOVER :</b> ","");
					$('#searchfield').val(text)
					$('#searchfield').attr("data-query",text);
					break;
				default:
					$('#searchfield').attr("data-query",query);
				}
			});
	$("#startsearch")
		.on("click",function()
			{
			$('#searchfield').typeahead("hide");
			var query=$("#searchfield").val();
			manualSearch(query);
			});
			
	$("#addnode")
		.on("click",function()
			{
			var right=-Infinity;
			for(var nodeid in supernodeUI)
				{
				var node = supernodeUI[nodeid];
				if(node.pos.x > right)
					right = node.pos.x;
				}
			right += 5000;
			
			var newnodePos = {x:right,y:0};
			var popoverPos = 
				{
				x : ($("#graph").width()/2),
				y: $("#graph").height()/2 
				}
			ngraph.goTo(
				15,
				ngraph.fixPosition(newnodePos),
				function()
					{
					hariAddPopover(newnodePos,popoverPos);	
					});
			});
	$("#disambiguation").on("click",".extenddisambiguation",function(e)
    	{
    	var step = +$(this).attr("data-step");
    	var maxstep = +$(this).attr("data-maxstep");
    	step++;
    	$(this).attr("data-step",step);
    	var innerheight = 122 + 266*step;
    	var outerheight = 266 + 266*step;
    	$(this).parent().children(".disambiguationsubitemcontainer").css("height",innerheight);
    	$(this).parents(".col-sm-4").css("height",outerheight);
    	if(step==maxstep)
    		{
	    	$(this).remove();
    		}
    	$("#optionlist").masonry()
    	setTimeout(function() {},500);
    	e.preventDefault();
    	e.stopPropagation();
    	});

	$("#disambiguation").on("click",".disambiguationsubitem,.allcategories",function(e)
		{
		e.preventDefault();
		e.stopPropagation();
		
		// DISAMBIGUAZIONE HARI
		var terms  = $(this).attr("data-terms");
		var sense  = $(this).attr("data-sense");
		var action = $(this).attr("data-action");
		
		if(action == "search")
			{
			//$("#searchfield").val(terms);
			startSearch(terms,terms,sense);	
			}
		else
			{
			var nodePos = $("#chooser").data("nodePos");
			hariAdd(terms,terms,sense,nodePos);
			}
		
		$("#disambiguation").removeClass("open");
		return false;
		});		
	$("#disambiguation").on("click",".disambiguationcategoryicon,.disambiguationcategoryheader",function(e)
		{
		e.preventDefault();
		e.stopPropagation();
		
		// DISAMBIGUAZIONE HARI
		var terms = $(this).parent().attr("data-terms")
		var sense = $(this).parent().attr("data-sense")
		startSearch(terms,terms,sense);
		
		$("#disambiguation").removeClass("open");
		return false;
		});
	}
function initBreadcrumbs()
	{
	hariBreadcrumbs.init(function(data)
		{
		selectCard(data.id);
		goToNode(data.id)
		});
	hariBreadcrumbs.resetAll();	
	}
function initModals()
	{
	$("#deleteconfirm").on("click",hariRemove);
		
	$('#siteModal').on('hidden.bs.modal', function () 
		{
		$('#siteModal iframe').attr("src","");
		});
	}
function initTooltips()
	{
	if(! /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) 
		{
		$('body').tooltip(
			{
	        html: true,
	        container: 'body',
	        selector: '[data-original-title]'
			});
		$('#infoclose').tooltip({
	        html: true,
	        placement: "left",
	        container: 'body'
	        });
	    $('#infosummary').tooltip({
	        html: true,
	        placement: "left",
	        container: 'body'
	        });
	    $('#edgeclose').tooltip({
	        html: true,
	        placement: "left",
	        container: 'body'
	        });
	    $('#infobookmark').tooltip({
	        html: true,
	        placement: "right",
	        container: 'body'
	        });
	        
	    
		}
	
	}
	
function initMore()
	{
	$("body").on("click",".extendtitle",function(e)
    	{
    	$(".tooltip").remove();
	    var title = $(this).attr("data-extendedtitle");
	    $(this).parent().text(title);
    	});
    
	}

function miscFixes()
	{	
	$.ajaxSetup(
		{
		timeout:30000
		});
	
		
	$("#graph").on("contextmenu",function(e)
		{
		e.preventDefault();
		});

	var mousedown = null;
	$("body").on("mousedown", ".card .bookmark, .bookmarkclass, #infobookmark", function()
        {
        $(this).addClass("bookmarkanimation enlarge");
        mousedown = $(this);
        console.log("MOUSEDOWN",$(this));
        });
    $("body").on("mouseup", function()
        {
        if(mousedown)
        	{
	        var md = $(mousedown);
	        setTimeout(function(){md.removeClass("enlarge");},500);
	        mousedown = null;	
        	}
        });
    if(! /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) 
		{
		$(window).mousewheel(function (e, d, x, y)
			{
			if (($(e.target).attr("id")=="rightbar"        || $(e.target).parents("#rightbar").length) ||
				($(e.target).attr("id")=="disambiguation"  || $(e.target).parents("#disambiguation").length) ||
				($(e.target).attr("id")=="pdfviewer"       || $(e.target).parents("#pdfviewer").length) ||
				($(e.target).attr("id")=="filtercontainer" || $(e.target).parents("#filtercontainer").length))
		      	{
		        //e.preventDefault();
		      	}
			else
			  	{
				e.preventDefault();
		      	if ($(e.target).hasClass("scrollable"))
			      	{
			      	//console.log("MAIN SCROLLABLE");
			      	var el = $(e.target);
			      	el.stop();
			      	
			      	var left = el.scrollLeft();
			      	var top = el.scrollTop();
			      	
			      	
			      	//el.scrollLeft(left + x);
			      	//el.scrollTop(top + y);
				  	el.animate(
		            	{
						scrollLeft:left + x,
		                scrollTop: top - y
		            	}, 1000/60);
			      	}
			    else if ($(e.target).parents(".scrollable").length > 0)
		      		{
		      		
			      	var el = $(e.target).parents(".scrollable");
			      	el.stop();
			      	
			      	var left = el.scrollLeft();
			      	var top = el.scrollTop();
			      	el.animate(
		            	{
						scrollLeft:left + x,
		                scrollTop: top - y
		            	}, 1000/60);
		      		}  	  	
			  	}
	    	});
	    }
	}
function advancedSearchAutocomplete(search,process)
	{
	autocomplete(search,function(results)
		{
		var searchitem = "<b>DISCOVER :</b> " + $('#searchfield').attr("data-query");
		results.unshift(searchitem);
		process(results);
		})
	}
function advancedAddAutocomplete(search,process)
	{
	autocomplete(search,function(results)
		{
		var searchitem = "<b>ADD :</b> " + $('#addstring').attr("data-query");
		results.unshift(searchitem);
		process(results);
		})
	}
function autocomplete(search,process)
	{
	var results = [];
	lookupterms   = {};
	if(autocompleteRequest)
		{
		autocompleteRequest.abort();
		autocompleteRequest = null;
		}
	autocompleteRequest = $.getJSON(endpoints.suggestion+search)
		.done(function(data, textStatus, jqXHR)
			{
			if(data.length > 0)
				{
				for(var id=0;id<data.length;id++)
					{
						//remove sense
					var item = data[id].label; //+ (data[id].sense != "" ? " ( "+data[id].sense+" )" : "");
					lookupterms[item]=data[id];
					results.push(item);
					}
				process(results);
				}
			else
				{
				autocompleteRequest = $.getJSON(endpoints.didyoumean+search)
					.done(function(data, textStatus, jqXHR)	
						{
						autocompleteRequest = null;
						for(var id=0;id<data.length;id++)
							{
							var item = data[id].label + (data[id].sense != "" ? " ( "+data[id].sense+" )" : "");
							lookupterms[item]=data[id];
							results.push("<b>Did you mean :</b> " + item);
							}
						process(results);
						})
					.fail(function(data, textStatus, jqXHR)
						{
						autocompleteRequest = null;
						console.log("Suggestion failed");
						});
				}
			})
		.fail(function(data, textStatus, jqXHR)
			{
			autocompleteRequest = null;
			console.log("Suggestion failed");
			});
	}
function showModal(title,url)
	{
	$("#siteModal iframe").attr('src',"");
	$("#siteModal iframe").attr('src',url);
	$("#siteModalTitle").html(title);
	$('#siteModal').modal('show');
	}
	
function initVideo()
	{
	var $player = $('#introvideo');
	
	if($player.length)
		{
		var player  = $player.get(0);
		var $parent = $player.parent();
		var $win = $(window);
		var resizeTimeout = null;
		var videoRatio = 16 / 9;
	
		//player.volume = 0; // mute
	
		var resize = function() 
			{
			var height = $parent.height();
			var width  = $parent.width();
			var viewportRatio = width / height;
			var scale = 1;
	
			if (videoRatio < viewportRatio) 
				{
				// viewport more widescreen than video aspect ratio
				scale = viewportRatio / videoRatio;
				}
			else if (viewportRatio < videoRatio) 
				{
				// viewport more square than video aspect ratio
				scale = videoRatio / viewportRatio;
				}
			var offset = positionVideo(scale, width, height);
			setVideoTransform(scale, offset);
			};
	
		var setVideoTransform = function(scale, offset) 
			{
			offset = $.extend({ x: 0, y: 0 }, offset);
			var transform = 'translate(' + Math.round(offset.x) + 'px,' + Math.round(offset.y) + 'px) scale(' + scale  + ')';
			$player.css(
				{
				'-webkit-transform': transform,
				'transform': transform
				});
			};
	
		// accounts for transform origins on scaled video
		var positionVideo = function(scale, width, height) 
			{
			var x = 50;
			var y = 50;
			
			setVideoOrigin(x, y);
	
			var viewportRatio = width / height;
			var scaledHeight = scale * height;
			var scaledWidth = scale * width;
			var percentFromX = (x - 50) / 100;
			var percentFromY = (y - 50) / 100;
			var offset = {};
	
			if (videoRatio < viewportRatio) 
				{
				offset.x = (scaledWidth - width) * percentFromX;
				}
			else if (viewportRatio < videoRatio) 
				{
				offset.y = (scaledHeight - height) * percentFromY;
				}
	
			return offset;
			};
	
		var setVideoOrigin = function(x, y) 
			{
			var origin = x + '% ' + y + '%';
			$player.css(
				{
				'-webkit-transform-origin': origin,
				'transform-origin': origin
				});
			};
		
		resize();
	
		var videohiding = false;
		
		player.addEventListener("timeupdate", function () 
			{
			var vTime = player.currentTime;
			if(vTime > 3 && !videohiding)
				{
				videohiding = true;
				$("#introcontainer").fadeOut(1000);
				$("#topbar")
					.removeClass("out") 
				
				}
		  	}, false);
		var loaderTimeout = null;
		$player.on('loadstart',function(e)
			{
			loaderTimeout = setTimeout(function()
				{
				$("#introcontainer .spinner").fadeIn(100);
				},100)
			//console.log("VIDEO LOAD START",e);
			})
		$player.on('loadeddata',function(e)
			{
			clearTimeout(loaderTimeout);
			$("#introcontainer .spinner").fadeOut(100);
			//console.log("VIDEO LOAD END",e);
			})
		$win.on('resize', function() 
			{
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(resize, 100);
			});
	
					
			
		}
	
	
	}