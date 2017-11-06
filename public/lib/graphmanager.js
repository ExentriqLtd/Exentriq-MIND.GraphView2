var maxwidth  = Infinity;
var maxheight = Infinity;
var width;
var height;
var basex;
var basey;

var edgeText = null;

var smallfont = 10; //12
var largefont = 14; //14
var xspace = 13000;
var yspace = 800;

var textcolor     = "#5e5e5e";
var edgeOverColor = 0x41c7ac;


var fadeSteps = 15;
var smallEdge = 80;
var bigEdge   = 45;


$(document).ready(function()
	{
	ngraph.updateSize();
	});
$(window).resize(function() 
	{
	ngraph.updateSize();
	});


function treeNodePosition()
	{
	hideTooltip();
	$(".tooltip").remove();
	tooltipnode = {};
	if(currentview == "graph")
		{
		for (var key in treelimitslabel)
			{
			treelimitslabel[key].text.visible = true;
			}
		$("#historyslider").removeClass("open");
		$("#filtercontainer").removeClass("open");
		$("#mainblocks").addClass("fullsize");
		oldstatus =
			{
			posx : ngraph.graphics.position.x,
			posy : ngraph.graphics.position.y,
			scalex : ngraph.graphics.scale.x,
			scaley : ngraph.graphics.scale.y, 
			positions : updateTree()
			}
		var scale = 0.4 * graphsettings.screenFactor * graphsettings.initialScale * window.devicePixelRatio
		ngraph.graphics.position.x = 200;
		ngraph.graphics.position.y = -(globaltreegraphdata.miny - 3000)*scale;
		ngraph.graphics.scale.x = scale;
		ngraph.graphics.scale.y = scale;
		
		currentview = "tree";
		$("#cardcontainer").find(".explore,.remove,.ban").hide()
		$("#switcher").attr("data-original-title","GRAPH VIEW");
		$("#switcher img").attr("src","img/graph-icon.png");
		
		
		}
	else
		{
		for (var key in treelimitslabel)
			{
			treelimitslabel[key].text.visible = false;
			}
		for (var nodeid in supernodeUI)
			{
			var pos = oldstatus.positions[nodeid];
			currentRenderer.layout.setNodePosition(nodeid, pos.x, pos.y);	
			}
		
		ngraph.graphics.position.x = oldstatus.posx;
		ngraph.graphics.position.y = oldstatus.posy;	
		ngraph.graphics.scale.x = oldstatus.scalex;
		ngraph.graphics.scale.y = oldstatus.scaley;
		
		currentview = "graph";	
		$("#cardcontainer").find(".explore,.remove,.ban").show()
		$("#switcher").attr("data-original-title","TREE VIEW");
		$("#switcher img").attr("src","img/tree-icon.png");
		
		}
	}

function updateTree()
	{
	var miny=0;
	var maxy=0;
	var newpos = {};
	var oldpos = {};
	
	
	for (var nodeid in supernodeUI)
		{
		oldpos[nodeid]=
			{
			x:supernodeUI[nodeid].pos.x,
			y:supernodeUI[nodeid].pos.y,
			waspinned : ngraph.layout.isNodePinnedId(nodeid)
			};
		}
	var pivot = 0;
	for(var depth=0;depth<step2id.length;depth++)
		{
		if(step2id[depth])
			{
			var nodesatdepth = step2id[depth].nodelist;
			var deltay = (nodesatdepth.length-1)/2;
			
			for (var y=0;y<nodesatdepth.length;y++)
				{
				var n = nodesatdepth[y];
				if(!newpos[n] || newpos[n].y === 0)
					{
					newpos[n] = 
						{
						y : pivot + (y-deltay)*(depth===0 ? 3000 : 800),
						};
					
					if(newpos[n].y < miny) miny = newpos[n].y;
					if(newpos[n].y > maxy) maxy = newpos[n].y;
					}
				newpos[n].x = depth*xspace
				
				}
			if(step2id[depth].action == "explore")
				{
				pivot = newpos[nodesatdepth[0]].y;
				}
			else
				{
				pivot = 0;
				}
			
			}	
		}
	
	console.log(newpos)
	
	for (var nodeid in supernodeUI)
		{
		var pos = newpos[nodeid];
		if(pos)
			{
			supernodeUI[nodeid].main.data.treehidden = false;
			currentRenderer.layout.setNodePosition(nodeid, pos.x, pos.y);		
			}
		else
			{
			supernodeUI[nodeid].main.data.treehidden = true;
			}
		}
		
		
	globaltreegraphdata =
		{
		miny : miny,
		maxy : maxy
		}
	//ngraph.exportImage();
	return oldpos;
	}

treelimitslabel={}

function renderTreeLimits(ctx)
	{
	if(currentview == "tree")
		{
		ctx.lineStyle(60,0x90bdd0);
		for(var depth=0;depth<step2id.length;depth++)
			{
			if(step2id[depth].action !== "results")
				{
				if(step2id[depth].action !== "discover")
					{
					ctx.moveTo(depth * xspace - 1000, globaltreegraphdata.miny - 2500);
					ctx.lineTo(depth * xspace - 1000, globaltreegraphdata.maxy + 600);	
					}
				
				if(!treelimitslabel[depth])
					{
					var text = new PIXI.Text(step2id[depth].action.toUpperCase(), 
						{
						font: "60px Raleway",
						fill: "#90bdd0",
						align: "center",
						nobackground : true
						});
				
					text.anchor.x = 0.5;
					text.anchor.y = 0.5;
					
					text.position.x = ((depth + (step2id[depth].action == "explore" ? 1 : 0.5) ) * xspace ) - 1000;
					
					treelimitslabel[depth] =
						{
						ctx  : ctx,
						text : text
						}
		
					ctx.addChild(text);
					}
				
				treelimitslabel[depth].text.position.y = globaltreegraphdata.miny - 2000;
				treelimitslabel[depth].text.scale.x = 1 / ngraph.graphics.scale.x;
				treelimitslabel[depth].text.scale.y = 1 / ngraph.graphics.scale.y;
				}
				
			}
		
		}
	}
getGraphCoordinates = (function()
	{
	var ctx =
		{
		global:
			{
			x: 0,
			y: 0
			} // store it inside closure to avoid GC pressure
		};

	return function(x, y)
		{
		ctx.global.x = x;
		ctx.global.y = y;
		return PIXI.InteractionData.prototype.getLocalPosition.call(ctx, ngraph.graphics);
		}
	}());
	
ngraph.updateSize = function(nodeId)
	{
	width  = $("#graph").width();
    height = $("#graph").height();
	basex = Math.round(width * window.devicePixelRatio / 2);
    basey = Math.round(height * window.devicePixelRatio / 2);

	maxwidth =  ($("#graph").width()  - 30) / (0.125 * 2);
	maxheight = ($("#graph").height() - 30) / (0.125 * 2);


	if(ngraph.renderer)
		{
			ngraph.renderer.resize(width * window.devicePixelRatio, height * window.devicePixelRatio);
		ngraph.renderer.view.style.width = width + 'px';
		ngraph.renderer.view.style.height = height + 'px';
		ngraph.renderer.render(ngraph.stage);
		}
	}
ngraph.nodeGlobalPosition = function(nodeId)
	{
	var pos   = ngraph.nodeGraphPosition(nodeId);
	var top  = ( $("#graph").height()/2) + (ngraph.graphics.position.y - pos.y)/window.devicePixelRatio;
    var left = $("#graph").width()/2 + (ngraph.graphics.position.x - pos.x)/window.devicePixelRatio + ($("#mainblocks").hasClass("fullsize") ? 0 : -200);
	return new PIXI.Point(left,top);
	}
ngraph.nodeGraphPosition = function(nodeId)
	{
	var pos = layout.getNodePosition(nodeId);
	return ngraph.fixPosition(pos);
	}
ngraph.fixPosition = function(pos)
	{
	return new PIXI.Point(basex - pos.x*ngraph.graphics.scale.x,basey - pos.y*ngraph.graphics.scale.y);
	}
ngraph.toggleNode = function(nodeId)
	{
	var node = currentRenderer.getNode(nodeId);
	console.log(node);
	if(node.data.expanded)
		{
		node.data.collapsed = !node.data.collapsed;
		console.log("COLLAPSED",node.data.collapsed);
		for (var x=0;x<node.links.length;x++)
			{
			var edge = node.links[x];
			var othernode = edge.toNode;
			if(edge.toId == node.id)
				{
				othernode = edge.fromNode;	
				}
			if(node.data.collapsed && othernode.links.length == 1)
				{
				othernode.data.hidden_collapse = true;
				}
			else
				{
				othernode.data.hidden_collapse = false;
				}
			
			}
		}
	else
		{
		hariExplore(nodeId);
		node.data.collapsed = false;	
		}
		
	updateCard(nodeId);
	updateTooltip(nodeId);
	}
ngraph.goToNode = function(nodeId)
	{
	hideTooltip(nodeId);
	var endPos   = ngraph.nodeGraphPosition(nodeId)
	ngraph.goTo(30,endPos,
		function()
			{
			showTooltip(nodeId);
			}
		);
	}
ngraph.goTo = function(duration,endPos,callback)
	{
	var startPos = ngraph.graphics.position;

	var dx   = (endPos.x - startPos.x) / duration;
	var dy   = (endPos.y - startPos.y) / duration;
	var step = 0;
	var animatetransition=function()
		{
		if(step<duration)
			{
			ngraph.graphics.position.x+=dx;
			ngraph.graphics.position.y+=dy;
			step++;
			requestAnimationFrame(animatetransition);
			}
		else
			{
			if(callback)
				callback();
			}
		};
	requestAnimationFrame(animatetransition);
	}
function nodeColor(node,shade)
	{
	var color = 0x000000;
	try
		{
		color = str2hex(shadeColor(colorscale(node.data.sortedTopics[0].key),shade));
		}
	catch(e)
		{}
	return color;
	}
function nodeRadius(node)
	{
	if (node.data.isCentroid)
		return 350; //225
	if (node.data.isCooc)
		return 200; //100
	else		
		return 50;  //40

	}
function nodeLabel(node,count)
	{
	var label = node.data.label.toUpperCase().replace(/(?:\r\n|\r|\n)/g, '');;//truncateTitle(node.data.label.toUpperCase(),40);
	var words = label.split(" ");
	var lines = [""];
	var id = 0;
	var cline = lines[0];
	for (var x = 0; x < words.length && id<2; x++)
		{
		var word = words[x].trim();
		if (lines[id].length > 15 || (lines[id].length + word.length) > 25)
			{
			lines[id] = lines[id].trim();
			id++;
			if(id<2)
				{
				lines.push("");
				lines[id] += word + " ";
				}
			}
		else
			{
			lines[id] += word + " ";
			}
		}
	if(x<words.length)
		{
		lines[id-1] += "...";
		}
	var finaltext = lines.join("\n");
	if(count)
		return lines.length;
	else
		return finaltext;
	}
function nodeVisibility(node)
	{
	if (node.data.isCentroid || node.starred || currentview=="tree")
        return true;
    else if ((node.data.isCooc || node.data.hasOwnProperty("summary")) && ngraph.graphics.scale.x > (graphsettings.screenFactor * graphsettings.textScale * window.devicePixelRatio))
        return true;
    else if (ngraph.graphics.scale.x >= (2 * graphsettings.screenFactor * graphsettings.initialScale * window.devicePixelRatio))
        return true;
    else
        return false;
	}

function exportNode(node,ctx)
	{
	if(layout.isNodePinned(node.main))
		ctx.lineStyle(20, node.stroke);
	else
		ctx.lineStyle(0);

	ctx.beginFill(node.color);

	var x = node.pos.x;
	var y = node.pos.y;

	var radius = node.width;

	var progress = 1;
	ctx.drawCircle(x, y, radius * progress);
	
	
	var text = null;
	if(node.main.data.isCentroid || node.main.data.isCooc)
		{
		text = new PIXI.Text(node.label, {});

		text.setStyle(
			{
			font: "" + 128 + "px Raleway",
			fill: "#333",
			align: "center"
			})

		text.anchor.x = 0.5;
		text.anchor.y = 0.5;
		text.position.x = x;
		text.position.y = y;

		ctx.addChild(text);

		}
	ctx.endFill();
	
	return text;
	}
function exportLink(link, ctx)
	{
	var strokeWidth =  6;
	ctx.lineStyle(strokeWidth, 0xbbbbbb);
	ctx.moveTo(link.from.x, link.from.y);
	ctx.lineTo(link.to.x, link.to.y);
	}
function renderNode(node, ctx)
	{
	if(node.main.data.hidden || node.main.data.hidden_collapse || (currentview == "tree" && node.main.data.treehidden))
		{

		if(node.textnode)
			{
			node.textnode.visible = false;
			}
		if(node.spritenode)
			{
			node.spritenode.visible = false;
			}
		}
	else
		{
		var radius = node.width;
		
		if(selectedNode.indexOf(node.main.id)>-1)
			{
			radius *= 1.3;
			ctx.lineStyle(60, 0x1da397);
			}
			//ctx.lineStyle(30, 0x333333);
		else if(layout.isNodePinned(node.main))
			ctx.lineStyle(20, node.stroke);
		else
			ctx.lineStyle(0);

		ctx.beginFill(node.main.data.collapsed ? 0xffffff : node.color);

		var x = node.pos.x;
		var y = node.pos.y;

		
		var progress = 1;
		var overprogress = 0;
		if(prevmouseover && node.main.id == prevmouseover.id )
			{
			if(node.step < timings.nodePop + timings.nodeEnlarge)
				node.step++;
			progress = 1;
			overprogress = graphsettings.overEnlarge * (node.step - timings.nodePop)/timings.nodeEnlarge;
			}
		else if(node.step < timings.nodePop)
			{
			node.step++;
			progress = node.step/timings.nodePop;
			overprogress = 0;
			}
		else if(node.step > timings.nodePop)
			{
			node.step--;
			progress = 1;
			overprogress = graphsettings.overEnlarge * (node.step - timings.nodePop)/timings.nodeEnlarge;
			}	
			
		
		//if(!node.main.data.isDocument)
		//	
		//else
		//	ctx.drawRect(x-radius * progress, y-radius * progress, 2*radius * progress,2*radius * progress);
		
		if (!node.textnode)
			{
			
			if(node.main.data.articleUri && node.main.data.articleUri.indexOf("hw:")===0)
				{
				var sprite = PIXI.Sprite.fromImage("img/stanford/hari-book-icon-"+node.color.toString(16).replace("#","")+".png");
				
				sprite.anchor.x = 0.5;
				sprite.anchor.y = 0.5;
				
				sprite.scale.x = 1.5*(radius/256);
				sprite.scale.y = 1.5*(radius/256);
				
				
				node.spritenode = sprite;
				ctx.addChildAt(sprite,0);	
				}
			
			
			
			var text = new PIXI.Text(node.label, {});
			
			text.anchor.x = 0.5;
			text.anchor.y = -2.1;
			
			if (node.isExactMatchTitle || node.isLSA || node.isCentroid || node.isMetaArticle)
				{
				fsize = largefont * window.devicePixelRatio; //*ngraph.graphics.scale.x;
				}
			else
				{
				fsize = smallfont * window.devicePixelRatio; //*ngraph.graphics.scale.x;
				}

			text.visible = nodeVisibility(node.main);

			text.setStyle(
				{
				font: "" + fsize + "px Raleway",
				fill: textcolor,
				align: "center",
				nobackground : true
				})
			node.textnode = text;

			ctx.addChild(text);
			
			
			
			}
		if(bookmarklist[node.main.id] && !node.main.starred)
			{
			node.main.starred = true;
			if(node.textnode)
				{
				ctx.removeChild(node.textnode);
				node.textnode.destroy(true);
				node.textnode=null;
				}
				
			var text = new PIXI.Text("★ " + node.label, {});
			text.anchor.x = 0.5;
			text.anchor.y = 0.5;
			if (node.isExactMatchTitle || node.isLSA || node.isCentroid || node.isMetaArticle)
				{
				fsize = largefont * window.devicePixelRatio; //*ngraph.graphics.scale.x;
				}
			else
				{
				fsize = smallfont * window.devicePixelRatio; //*ngraph.graphics.scale.x;
				}

			text.visible = nodeVisibility(node.main)

			text.setStyle(
				{
				font: "" + fsize + "px Raleway",
				fill: textcolor,
				align: "center"
				})
			node.textnode = text;

			ctx.addChild(text);
			}
		//node.circle.visible = true;
		node.textnode.visible = nodeVisibility(node.main);
		
		//node.circle.position.x = x;
		//node.circle.position.y = y;
		
		node.textnode.position.y = y;
		if(currentview == "graph")
			{
			node.textnode.anchor.x = 0.5;
			node.textnode.position.x = x;
			}
		else
			{
			node.textnode.anchor.x = 0;
			node.textnode.position.x = x + 400;	
			}
		
		//console.log(node.textnode);
		node.textnode.scale.x = progress / ngraph.graphics.scale.x;
		node.textnode.scale.y = progress / ngraph.graphics.scale.y;
		
		
		if(node.spritenode)
			{
			node.spritenode.visible = true;
			node.spritenode.position.x = x;
			node.spritenode.position.y = y;
			//console.log(node.textnode);
			}
		else
			{
			ctx.drawCircle(x, y, radius * (progress+overprogress));	
			}
		ctx.endFill();
		}

	}

function renderLink(link, ctx)
	{
	if	(	
			(currentview == "graph" &&
				link.fromNode.data.hidden || link.toNode.data.hidden || 
				link.fromNode.data.hidden_collapse || link.toNode.data.hidden_collapse
			)
		||
			(currentview == "tree" && 
				(
				link.fromNode.data.treehidden || 
				link.toNode.data.treehidden || 
				id2step[link.fromNode.data.id] == id2step[link.toNode.data.id]
				)
			)
		)
		{

		}
	else
		{
		var strokeWidth =  smallEdge;
		if(!prevmouseover && link.over)
			{
			if(!link.fade)
				link.fade = 1;
			else if(link.fade < fadeSteps)
				link.fade++;
			
			strokeWidth = (link.fade/fadeSteps) * bigEdge;
			
			ctx.lineStyle(strokeWidth, edgeOverColor);
			ctx.moveTo(link.from.x, link.from.y);
			ctx.lineTo(link.to.x, link.to.y);
			
			
			
			var x = (link.from.x + link.to.x)/2;
			var y = (link.from.y + link.to.y)/2;
			
			ctx.beginFill(edgeOverColor);
			ctx.lineStyle(4/ngraph.graphics.scale.x, edgeOverColor);
			var circleradius = 10 * (link.fade/fadeSteps) * window.devicePixelRatio / ngraph.graphics.scale.x
			ctx.drawCircle(x, y, circleradius);
			ctx.endFill();
			
			var fsize = 14 * window.devicePixelRatio ;
			
			var text = null;
			
			if(edgeText)
				{
				edgeText.ctx.removeChild(edgeText.text);
				edgeText.text.destroy(true);
				edgeText.text=null;
				edgeText.ctx=null;
				edgeText = null;
				}
			else
				{
					
					
				}
			var label = Math.round(link.relevance * 100)/100;
			text = new PIXI.Text("i", 
				{
				font: "" + fsize + "px Raleway",
				fill: "#fff",
				align: "center",
				nobackground:true
				});
			text.anchor.x = 0.5;
			text.anchor.y = 0.5;
			text.position.x = x;
			text.position.y = y;
			
			text.scale.x = (link.fade/fadeSteps) / ngraph.graphics.scale.x;
			text.scale.y = (link.fade/fadeSteps) / ngraph.graphics.scale.y;
				
			edgeText = {ctx:ctx,text:text};
			ctx.addChild(text);
			
			
			}
		else if(prevmouseover && (link.fromNode.id == prevmouseover.id ||  link.toNode.id == prevmouseover.id))
			{
			if(!link.fade)
				link.fade =1;
			else if(link.fade < fadeSteps)
				link.fade++;
			
			strokeWidth = (link.fade/fadeSteps)*bigEdge;
			ctx.lineStyle(strokeWidth, edgeOverColor);
			ctx.moveTo(link.from.x, link.from.y);
			ctx.lineTo(link.to.x, link.to.y);
			if(edgeText)
				{
				edgeText.ctx.removeChild(edgeText.text);
				edgeText.text.destroy(true);
				edgeText.text=null;
				edgeText.ctx=null;
				edgeText = null;
				}
			}
		else if(link.main.data.pathedge)
			{
			ctx.lineStyle(bigEdge, 0x90bdd0);
			ctx.moveTo(link.from.x, link.from.y);
			ctx.lineTo(link.to.x, link.to.y);
			}
		else if(currentview == "tree" && 
			(link.fromNode.data.isCentroid || link.fromNode.starred) &&
			(link.toNode.data.isCentroid || link.toNode.starred))
			{
			ctx.lineStyle(bigEdge, edgeOverColor);
			ctx.moveTo(link.from.x, link.from.y);
			ctx.lineTo(link.to.x, link.to.y);
			}
		else if(link.fade)
			{
			strokeWidth = (link.fade/fadeSteps)*bigEdge;
			link.fade--;
			//ctx.lineStyle(strokeWidth, 0xbbbbbb);
			ctx.lineStyle(strokeWidth, edgeOverColor);
			ctx.moveTo(link.from.x, link.from.y);
			ctx.lineTo(link.to.x, link.to.y);
			}
		else
			{
			strokeWidth =  smallEdge;
			ctx.lineStyle(strokeWidth, 0xf7f7f7);
			ctx.moveTo(link.from.x, link.from.y);
			ctx.lineTo(link.to.x, link.to.y);
			}
		
		}

	}
function renderPath(ctx)
	{
	if(selectionMode)
		{
		//ctx.lineStyle(20, 0x333333);
		ctx.lineStyle(60, 0x1da397);
		
		var start   = layout.getNodePosition(selectedNode[0]);
		ctx.moveTo(start.x, start.y);
			
		for(var x = 1;x<selectedNode.length;x++)
			{
			var pos   = layout.getNodePosition(selectedNode[x]);
			ctx.lineTo(pos.x, pos.y);
			
			}
		ctx.lineTo(mouseglobal.x, mouseglobal.y);
		}
	}
	
var pingstep = 0;
function renderPing(ctx)
	{
	var node = null;
	
	if(overCard && supernodeUI[overCard])
		{
		node = supernodeUI[overCard];
		}
	else if(prevmouseover)
		{
		node = prevmouseover.nodeUI;		
		}
		
	if(node)
		{
		var deltascale = Math.min(1,ngraph.graphics.scale.x / (window.devicePixelRatio * graphsettings.initialScale));
		var pos = node.pos;
		var noderadius = node.width;//0x0099ff
		var color = node.color;//0x0099ff
		ctx.lineStyle((15 + 0.125 * pingstep)/ deltascale, color, 1-0.0125*pingstep);
		ctx.drawCircle(pos.x, pos.y, noderadius+5*pingstep/deltascale);
		pingstep++;
		if(pingstep>80)
			{
			pingstep = 0;
			}
		}
	else
		{
		pingstep = 0;
		}
	}

var circleradius = 1500;


attractortexts={};
function renderAttractors(ctx)
	{
	ctx.lineStyle(20, 0xdddddd);
	
	for(var key in attractors)
		{
		var attractor = attractors[key];
		ctx.drawCircle(attractor.circlex, attractor.circley, circleradius);
		
		/*
		if(false && !attractortexts[key])
			{
			var fsize = 20 * window.devicePixelRatio;// / ngraph.graphics.scale.x;
			var text = new PIXI.Text(attractor.label, 
				{
				font: "" + fsize + "px Raleway",
				fill: "#999999",
				align: "center",
				nobackground : true
				});
			text.anchor.x = 0.5;
			text.anchor.y = 0.5;
			text.position.x = attractor.circlex;
			text.position.y = attractor.circley-circleradius-fsize;
			text.scale.x = 1 / ngraph.graphics.scale.x;
			text.scale.y = 1 / ngraph.graphics.scale.y;
			ctx.addChild(text);
			
			attractortexts[key] = text;
			}
		
		attractortexts[key].scale.x = 1 / ngraph.graphics.scale.x;
		attractortexts[key].scale.y = 1 / ngraph.graphics.scale.y;
		*/
		}
	}

function renderCanvasLoader(ctx)
	{
	if(!ngraph.canvasLoader)
		{
		var radius = 1500;
		var loaderradius = 1400;
		var basecanvas = document.createElement('canvas');
		var rotatecanvas = document.createElement('canvas');
		
		var basecontext = basecanvas.getContext('2d');
		var rotatecontext = rotatecanvas.getContext('2d');
		//we are now in a 2D context
		var r = 10; //radius
		basecanvas.width = radius * 2;
		basecanvas.height = radius * 2;
		rotatecanvas.width = radius * 2;
		rotatecanvas.height = radius * 2;
		
		basecontext.lineWidth = 150;
		basecontext.strokeStyle = "#8ddecd";
		basecontext.fillStyle = "#ffffff"
		basecontext.moveTo(radius,radius);
		basecontext.beginPath();
	    basecontext.arc(radius, radius, loaderradius, 0,2*Math.PI );
	    basecontext.closePath();
	    basecontext.fill();
		basecontext.stroke();
		
		
		basecontext.fillStyle = "#ffffff"
		basecontext.moveTo(radius,radius);
		basecontext.beginPath();
	    basecontext.arc(radius, radius, loaderradius/2, 0,2*Math.PI );
	    basecontext.closePath();
	    //basecontext.fill();
	    basecontext.stroke();
	    
	    basecontext.beginPath();
	    basecontext.arc(radius, radius, loaderradius/2 - basecontext.lineWidth/2 , 0,2*Math.PI );
	    basecontext.closePath();
	    //basecontext.fill();
	    basecontext.clip();
		basecontext.clearRect(0,0,radius*2,radius*2)

	    
		var basesprite = new PIXI.Sprite(PIXI.Texture.fromCanvas(basecanvas));
		
		var angle = 2*Math.PI*1/4;
		rotatecontext.fillStyle = "#8ddecd";
		rotatecontext.strokeStyle = "#8ddecd";
		
	    rotatecontext.beginPath();
	    rotatecontext.moveTo(radius,radius);
	    rotatecontext.arc(radius, radius, loaderradius, 0,angle );
	    rotatecontext.lineTo(radius,radius);
	    rotatecontext.fill();
	
		rotatecontext.beginPath();
	    rotatecontext.arc(radius, radius, loaderradius/2, 0,2*Math.PI );
	    rotatecontext.closePath();
	    //basecontext.fill();
	    rotatecontext.clip();
		rotatecontext.clearRect(0,0,radius*2,radius*2)
		
		
		var rotatesprite = new PIXI.Sprite(PIXI.Texture.fromCanvas(rotatecanvas));
		
		basesprite.visible = false
		
		basesprite.scale.x = 0.5;
		basesprite.scale.y = 0.5;
		basesprite.anchor.x = 0.5;
		basesprite.anchor.y = 0.5;
		basesprite.position.x = 0;
		basesprite.position.y = 0;
		//basesprite.blendMode =2;
		
		rotatesprite.visible = false
		
		rotatesprite.scale.x = 0.5;
		rotatesprite.scale.y = 0.5;
		rotatesprite.anchor.x = 0.5;
		rotatesprite.anchor.y = 0.5;
		rotatesprite.position.x = 0;
		rotatesprite.position.y = 0;
		//rotatesprite.blendMode =2;
		
		ngraph.canvasLoader = {base : basesprite, rotate : rotatesprite};

		
		ctx.addChild(basesprite);
		ctx.addChild(rotatesprite);
		}
	else
		{
		if(addloader)
			{
			ngraph.canvasLoader.base.position = addloader;
			ngraph.canvasLoader.rotate.position = addloader;
			ngraph.canvasLoader.base.visible = true;
			ngraph.canvasLoader.rotate.visible = true;
			ngraph.canvasLoader.rotate.rotation = 2 * Math.PI * (Date.now() % 720)/720;
			}
		else
			{
			ngraph.canvasLoader.base.visible = false;
			ngraph.canvasLoader.rotate.visible = false;
			}
		//
		}
	}

/*

RENDER PIE GRAPH
var radius = node.width*2;
var canvas = document.createElement('canvas');
var context = canvas.getContext('2d');
//we are now in a 2D context
var r = 10; //radius
canvas.width = radius * 2;   //you need to specify your canvas width and height otherwise it'll have a size of 0x0 and you'll get an empty sprite
canvas.height = radius * 2;

var latestangle=0;
for(var x=0;x<node.main.data.sortedTopics.length;x++)
	{
	var topic = node.main.data.sortedTopics[x].key;
	var angle = 2*Math.PI*1/3;
	context.fillStyle = colorscale(topic);
    context.beginPath();
    context.moveTo(radius,radius);
    context.arc(radius, radius, radius, latestangle,latestangle+angle );
    context.lineTo(radius,radius);
    context.fill();
    latestangle += angle;
	}

var sprite = new PIXI.Sprite(PIXI.Texture.fromCanvas(canvas));

sprite.scale.x = 0.5;
sprite.scale.y = 0.5;
sprite.anchor.x = 0.5;
sprite.anchor.y = 0.5;
sprite.position.x = x;
sprite.position.y = y;

ctx.addChild(sprite);


*/
