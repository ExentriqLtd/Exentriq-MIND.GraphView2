running = false;

clicknode=null;
clicktime=0;

longclick=null;

selectionMode = false;
selectedNode=[];

mouseglobal=null;


tmpstage = null;
suspended=false;

longclickdata = null;

prevmouseover = null;

var graphRenderer = "autoDetectRenderer";

developerMode = false;


staticcount = 0;
//var renderer = "CanvasRenderer";
/*
window.addEventListener('focus', function() 
	{
	document.title = 'HARI';
	suspended=false;
	//renderGraphFrame();
    console.log("RESUMING EXECUTION");
	});

window.addEventListener('blur', function() 
	{
	document.title = 'HARI (suspended)';
    //suspended=true;
    console.log("SUSPENDING EXECUTION");
	});
*/

! function(e) {
	if ("object" == typeof exports) module.exports = e();
	else if ("function" == typeof define && define.amd) define(e);
	else {
		var f;
		"undefined" != typeof window ? f = window : "undefined" != typeof global ? f = global : "undefined" != typeof self && (f = self), f.ngraph = e()
	}
}(function() {
	var define, module, exports;
	return (function e(t, n, r) {
		function s(o, u) {
			if (!n[o]) {
				if (!t[o]) {
					var a = typeof require == "function" && require;
					if (!u && a) return a(o, !0);
					if (i) return i(o, !0);
					throw new Error("Cannot find module '" + o + "'")
				}
				var f = n[o] = {
					exports: {}
				};
				t[o][0].call(f.exports, function(e) {
					var n = t[o][1][e];
					return s(n ? n : e)
				}, f, f.exports, e, t, n, r)
			}
			return n[o].exports
		}
		var i = typeof require == "function" && require;
		for (var o = 0; o < r.length; o++) s(r[o]);
		return s
	})({
		1: [

			function(require, module, exports) {
				module.exports = function(graphics, layout) {
					var addWheelListener = require('./lib/addWheelListener');
					var graphGraphics = graphics.graphGraphics;
					var maxwidth  = ($("#graph").width()  - 30) / (0.125 * 2);
					var maxheight = ($("#graph").height() - 30) / (0.125 * 2);

					addWheelListener(graphics.domContainer, function(e) 
						{
						var x = (e.originalEvent || e).clientX + ($("#mainblocks").hasClass("fullsize") ? 0 : 200);
						var y = (e.originalEvent || e).clientY - 75 ;
						
						if(currentview=="graph")
							zoom( x * window.devicePixelRatio, y * window.devicePixelRatio, e.deltaY < 0);
						return false;
						}, true);

					addDragNDrop();


					function zoom(x, y, isZoomIn)
						{
						direction = isZoomIn ? 1 : -1;
						var factor = (1 + direction * graphsettings.zoomspeed);
						var scale = Math.min(graphsettings.maxScale * graphsettings.screenFactor * window.devicePixelRatio, Math.max(graphsettings.minScale * graphsettings.screenFactor * window.devicePixelRatio, graphGraphics.scale.x * factor))
						graphGraphics.scale.x = scale;
						graphGraphics.scale.y = scale;

						//console.log("CURRENT SCALE : " + graphGraphics.scale.x)
						graph.forEachNode(function(node)
							{
							if(node.nodeUI.textnode)
								{
								node.nodeUI.textnode.visible = nodeVisibility(node)
								node.nodeUI.textnode.scale.x = 1 / graphGraphics.scale.x;
								node.nodeUI.textnode.scale.y = 1 / graphGraphics.scale.y;
								}
							});

						// Technically code below is not required, but helps to zoom on mouse
						// cursor, instead center of graphGraphics coordinates
						var beforeTransform = getGraphCoordinates(x, y);
						graphGraphics.updateTransform();
						var afterTransform = getGraphCoordinates(x, y);

						graphGraphics.position.x = graphGraphics.position.x + (afterTransform.x - beforeTransform.x) * graphGraphics.scale.x;
						graphGraphics.position.y = graphGraphics.position.y + (afterTransform.y - beforeTransform.y) * graphGraphics.scale.y;
						graphGraphics.updateTransform();
						
						var nodeUnderCursor = graphics.getNodeAt(afterTransform.x, afterTransform.y);
						
						if(nodeUnderCursor)
							{
							showTooltip(nodeUnderCursor.id);
							}
						}

					function addDragNDrop()
						{
						var stage = graphics.stage;
						stage.setInteractive(true);

						var isMouseDown = false,
							isDragging  = false,
							nodeUnderCursor,
							startPos,
							ignoreClick = false,
							prevX, prevY;



						stage.mousedown = stage.touchstart = function(moveData)
							{

							var pos = moveData.global;
							var graphPos = getGraphCoordinates(pos.x, pos.y);
							nodeUnderCursor = graphics.getNodeAt(graphPos.x, graphPos.y);

							if (nodeUnderCursor && currentview == "graph")
								{
								longclickdata =
									{
									time : Date.now(),
									nodeid : nodeUnderCursor.id
									}
								longclick = setTimeout(function()
									{
									longclickdata = null;
									console.log("LONGCLICK");
									ignoreClick = true;
									layout.pinNode(nodeUnderCursor, true);
									
									if(selectionMode && selectedNode.length)
										{
										console.log(nodeUnderCursor);
										
										// path complete !
										if(selectedNode.indexOf(nodeUnderCursor.id)==-1)
											selectedNode.push(nodeUnderCursor.id)
										
										addloader = layout.getNodePosition(nodeUnderCursor.id)
										
										if(selectedNode.length > 1)
											{
											var nodes=[];
											for(var x = 0;x<selectedNode.length;x++)
												{
												var node = graph.getNode(selectedNode[x]);	
												nodes.push(node);
												}
											
											startSearch(nodes,"",currentsearchdata.sense);
											}
										
										updateTooltip(nodeUnderCursor.id)
										
										selectedNode = [];
										selectionMode = false;
										}
									else if(selectedNode.indexOf(nodeUnderCursor.id)>-1)
										{
										selectedNode.splice(selectedNode.indexOf(nodeUnderCursor.id),1);
										if(selectedNode.length ===0)
											selectionMode = false;
										updateTooltip(nodeUnderCursor.id)
										}
									else
										{
										selectionMode = true;
										selectedNode = [nodeUnderCursor.id];
										updateTooltip(nodeUnderCursor.id)
										}
									
									},1300);
								}

							prevX = pos.x;
							prevY = pos.y;
							startPos = _.clone(pos);
							
							isMouseDown = true;
							isDragging  = false;
							ignoreClick = false;
								
							};

						stage.mousemove = stage.touchmove = function(moveData)
							{
							var pos = moveData.global;
							var graphPos = getGraphCoordinates(pos.x, pos.y);
							mouseglobal = graphPos;
							if (!isMouseDown)
								{
								nodeUnderCursor = graphics.getNodeAt(graphPos.x, graphPos.y);
								if (nodeUnderCursor && 
									!(nodeUnderCursor.data.hidden || nodeUnderCursor.data.hidden_collapse) && 
									!(currentview=="tree" && nodeUnderCursor.data.treehidden))
									{
									showTooltip(nodeUnderCursor.id);
									if(!prevmouseover || prevmouseover.id != nodeUnderCursor.id)
										{
										if(prevmouseover)
											{
											layout.pinNode(prevmouseover, prevmouseover.waspinned);
											prevmouseover = null;
											}
										prevmouseover = nodeUnderCursor;
										prevmouseover.waspinned = layout.isNodePinnedId(prevmouseover.id);
										layout.pinNode(prevmouseover, true);
										}
									}
								else
									{
									if(prevmouseover)
										{
										layout.pinNode(prevmouseover, prevmouseover.waspinned);
										prevmouseover = null;
										}
									var linkunder = graphics.getLinkAt(graphPos.x, graphPos.y);
									hideTooltip()
									}
								return;
								}
							else 
								{
								hideTooltip();
								prevmouseover = null;
								if (nodeUnderCursor && currentview == "graph")
									{
									ngraph.resumeForce();
									if (!ignoreClick && lineDistance(startPos, pos) > 10)
										{
										ignoreClick = true;
										clearTimeout(longclick);
										layout.pinNode(nodeUnderCursor, true);
										}
									layout.setNodePosition(nodeUnderCursor.id, graphPos.x, graphPos.y);
									}
								else
									{
									var dx = pos.x - prevX;
									var dy = pos.y - prevY;
									prevX = pos.x;
									prevY = pos.y;

									graphGraphics.position.x += dx;
									graphGraphics.position.y += dy;
									
									if(!ignoreClick)
										ignoreClick = lineDistance(startPos, pos) > 10
									}
								}
							};

						stage.mouseup = stage.touchend =  function(moveData)
							{
							longclickdata = null;
							isMouseDown = false;
							clearTimeout(longclick);
							};
						stage.click = stage.tap = function(moveData)
							{
							longclickdata = null;
							if (!ignoreClick )
								{
								var pos = moveData.global;
								var graphPos = getGraphCoordinates(pos.x, pos.y);
								nodeUnderCursor = graphics.getNodeAt(graphPos.x, graphPos.y);
								if(!moveData.originalEvent.which || moveData.originalEvent.which == 1)
									{
									if (nodeUnderCursor)
										{
										if(selectionMode)
											{
											if(selectedNode.indexOf(nodeUnderCursor.id)>-1)
												{
												selectedNode.splice(selectedNode.indexOf(nodeUnderCursor.id),1);
												if(selectedNode.length ===0)
													selectionMode = false;
												}
											else
												{
												selectedNode.push(nodeUnderCursor.id);
												}
											
											updateTooltip(nodeUnderCursor.id);
											}
										else
											{
											if((Date.now() - clicktime)<500 && clicknode == nodeUnderCursor.id && currentview == "graph")
												{
												// double click
												ngraph.resumeForce();
												ngraph.toggleNode(nodeUnderCursor.id)
												clicktime = 0;
												}
											else
												{
												clicknode=nodeUnderCursor.id;
												clicktime=Date.now();
	
												selectCard(nodeUnderCursor.id)
												}
											}

										}
									else
										{
										var linkunder = graphics.getLinkAt(graphPos.x, graphPos.y);
										if(linkunder)
											{
											openEdgeInfo(linkunder);
											}
										}
									}
								else
									{
									$("#addnode").trigger("click");
									/*
									popoverPos =
										{
										x : pos.x / window.devicePixelRatio,
										y : pos.y / window.devicePixelRatio
										};
									hariAddPopover(graphPos,popoverPos);
									moveData.originalEvent.stopPropagation();
									moveData.originalEvent.preventDefault();
									console.log("CONTEXT MENU")
									*/
									}
								}
							else
								{

								}
							};
					}
				}

			}, {
				"./lib/addWheelListener": 3
			}
		],
		2: [

			function(require, module, exports) {
				module.exports.main = function(search) {
					var createPixiGraphics = require('./pixiGraphics');
					var getRandomNiceColor = require('./lib/niceColors');

					var nextNodeTimeout=null;
					var nextStopTimeout=null;
					var stopTimeout=null;
					
					graph = require('ngraph.graph')();
					layout = createLayout(graph);

					//console.log(graph);

					var graphics = createPixiGraphics(graph, layout);

					// First, let's initialize a custom data structure to help us
					// store custom information for rendering (like node color, width, etc.).

					graphics.createNodeUI(function(node) {
						var slices=[];
						var start=0;
						var data = {
							main: node,
							isCentroid: node.data.isCentroid,
							isCooc: node.data.isCooc,
							width: nodeRadius(node), //node.relevance * 20,
							color: nodeColor(node),
							//stroke : nodeColor(node,-20),
							stroke : nodeColor(node,+20),
							label: nodeLabel(node),
							step : 0
						};
						node.nodeUI = data;
						return data;
					}).createLinkUI(function(link) {
						return {
							main: link,
							toNode : link.toNode,
							fromNode : link.fromNode,
							relevance : link.data.relevance
						};
					});

					// Second, let's tell graphics how we actually want to render each node and link:


					graphics
						.renderNode(renderNode)
						.renderLink(renderLink);

					// Listen to mouse events and update graph acoordingly:
					var bindGlobalInput = require('./globalInput');
					bindGlobalInput(graphics, layout);

					// begin graph animation (add/remove nodes):
					//require('./lib/animateGraph').animate(graph);
					
					ngraph.graph = graph;
					ngraph.getNode= function(nodeId)
						{
						return graph.getNode(nodeId);
						}
					ngraph.exportImage = function()
						{
						var bbox = layout.getGraphRect();
						var width = bbox.x2 - bbox.x1;
						var height = bbox.y2 - bbox.y1;

						var midx = (bbox.x2 + bbox.x1)/2;
						var midy = (bbox.y2 + bbox.y1)/2;
						
						
						var scaleFactor = width/screen.width;
						console.log(scaleFactor)
						if(!tmpstage)
							{
							tmpstage    = new PIXI.Stage(0xffffff, true);
							tmprenderer = new PIXI.CanvasRenderer(window.devicePixelRatio * width/scaleFactor,window.devicePixelRatio * height/scaleFactor, null, false, false);
							tmpgraphics = new PIXI.Graphics();
							tmpstage.addChild(tmpgraphics);
							}
						else
							{
							tmpgraphics.clear();
							tmprenderer.resize(window.devicePixelRatio * width/scaleFactor,window.devicePixelRatio * height/scaleFactor);	
							}
						
						tmpgraphics.position.x = window.devicePixelRatio * (width/2 - 0.9*midx)/(scaleFactor);
						tmpgraphics.position.y = window.devicePixelRatio * (height/2- 0.9*midy)/(scaleFactor);
						tmpgraphics.scale.x    = window.devicePixelRatio * (0.9/scaleFactor);
						tmpgraphics.scale.y    = window.devicePixelRatio * (0.9/scaleFactor);

						var cleanupText=[];
						for(var linkId in superlinkUI)
							exportLink(superlinkUI[linkId], tmpgraphics,true);
						for(var nodeId in supernodeUI)
							{
							var nodeText = exportNode(supernodeUI[nodeId], tmpgraphics,true);
							if(nodeText)
								cleanupText.push(nodeText);
							}

						tmprenderer.render(tmpstage);
						var imagedata = tmprenderer.view.toDataURL();
						$('#hdimg' + currentStateindex).attr('src', imagedata);
						$('#ldimg' + currentStateindex).attr('src', imagedata);
						
						for(var x=0;x<cleanupText.length;x++)
							{
							tmpgraphics.removeChild(cleanupText[x]);
							cleanupText[x].destroy(true);
							cleanupText[x]=null;
							}						
						}
						
						
					ngraph.addNewNodes = function(newdata,nodePos)
						{
						var x = 0;
						var centroid = null

						var edges = newdata.edges;
						
						var drawnextnode = function()
							{
							ngraph.resumeForce();
							var node = newdata.nodes[x];
							if(!graph.getNode(node.id))
								{
								node2card(node);
								haridata.nodes.push(node);

								var newnode = graph.addNode(+node.id, node);

								if (x === 0 && node.isExactMatchTitle)
									{
									//layout.pinNode(newnode, true);
									//layout.setNodePosition(newnode.id, 0, 0);
									}
								var angle = Math.random() * 2 *Math.PI;
								var radius = 2000;

								if(centroid)
									{
									
									var cx =centroid.nodeUI.pos.x + radius * Math.cos(angle);
									var cy =centroid.nodeUI.pos.y + radius * Math.sin(angle);
									layout.setNodePosition(newnode.id, cx, cy);
									}
								
								}
							nextedges = [];
							for (var y = 0; y < edges.length; y++)
								{
								var edge = edges[y];
								var startNode = graph.getNode(edge.startNode);
								var endNode   = graph.getNode(edge.endNode)
								if (startNode && endNode)
									{
								
									graph.addLink(edge.startNode, edge.endNode,edge);
									if(startNode.data.collapsed && endNode.links.length==1)
										{
										endNode.data.hidden_collapse = true;
										}
									else if(endNode.data.collapsed && startNode.links.length==1)
										{
										startNode.data.hidden_collapse = true;
										}
									else
										{
										startNode.data.hidden_collapse = false;
										  endNode.data.hidden_collapse = false;
										}
									}
								else
									{
									nextedges.push(edge);
									}

								}
							edges = nextedges;
							if(x===0)
								{
								centroid = graph.getNode(node.id);
								//centroid.data.expanded = false;
								centroid.data.collapsed = false;
								centroid.data.hidden_collapse = false;
								layout.pinNodeId(node.id, true);
								layout.setNodePosition(node.id, nodePos.x, nodePos.y);

								}
							x++;
							if (x < newdata.nodes.length)
								nextNodeTimeout = setTimeout( drawnextnode , 200 );
							else
								{
								nextNodeTimeout = null;
								$("#switcher").removeClass("disabled");
								//ngraph.exportImage();
								}
							}
							
						if(newdata.nodes.length > 0)
							{
							$("#switcher").addClass("disabled");
							drawnextnode();
							}
						}
					ngraph.removeNodes = function(id)
						{
						ngraph.resumeForce();
						var node = graph.getNode(id);
						if(node && node.nodeUI)
							{
							if(node.nodeUI.textnode)
								{
								graphics.graphGraphics.removeChild(node.nodeUI.textnode);
								node.nodeUI.textnode.destroy(true);
								node.nodeUI.textnode=null;	
								}
							if(node.nodeUI.spritenode)
								{
								graphics.graphGraphics.removeChild(node.nodeUI.spritenode);
								try
									{
									node.nodeUI.spritenode.destroy(true);
									node.nodeUI.spritenode=null;
									}
								catch(e){}
									
								}
							}
						graph.removeNode(id);
						}
					ngraph.addNodes = function(mainId,newdata)
						{
						var mainnode = graph.getNode(mainId);
						layout.pinNode(mainnode, true);
						var x = 0;
						var edges = newdata.edges;
						
						
						var drawnextnode = function()
							{
							ngraph.resumeForce();
							var node = newdata.nodes[x];
							if(!graph.getNode(node.id))
								{
								node2card(node);
								haridata.nodes.push(node);

								var newnode = graph.addNode(+node.id, node);

								if (x === 0 && node.isExactMatchTitle)
									{
									//layout.pinNode(newnode, true);
									//layout.setNodePosition(newnode.id, 0, 0);
									}
								var angle = Math.random() * 2 *Math.PI;
								var radius = 2000;
								var cx =mainnode.nodeUI.pos.x + radius * Math.cos(angle);
								var cy =mainnode.nodeUI.pos.y + radius * Math.sin(angle);
								layout.setNodePosition(newnode.id, cx, cy);
								

								}
							var nextedges = [];
							for (var y = 0; y < edges.length; y++)
								{
								var edge = edges[y];
								var startNode = graph.getNode(edge.startNode);
								var endNode   = graph.getNode(edge.endNode)
								if (startNode && endNode)
									{
								
									graph.addLink(edge.startNode, edge.endNode,edge);
									if(startNode.data.collapsed && endNode.links.length==1)
										{
										endNode.data.hidden_collapse = true;
										}
									else if(endNode.data.collapsed && startNode.links.length==1)
										{
										startNode.data.hidden_collapse = true;
										}
									else
										{
										startNode.data.hidden_collapse = false;
										  endNode.data.hidden_collapse = false;
										}
									}
								else
									{
									nextedges.push(edge);
									}

								}
							edges = nextedges;
							x++;
							if (x < newdata.nodes.length)
								nextNodeTimeout = setTimeout( drawnextnode , 200 );
							else
								{
								nextNodeTimeout = null;
								$("#switcher").removeClass("disabled");
								//ngraph.exportImage();
								}
							}
							
						if(newdata.nodes.length > 0)
							{
							$("#switcher").addClass("disabled");
							drawnextnode();
							}
						}
					ngraph.clearGraph = function()
						{
						addloader = null;
						graph.forEachNode(function(node)
							{
							if(node.nodeUI && node.nodeUI.textnode)
								{
								graphics.graphGraphics.removeChild(node.nodeUI.textnode);
								node.nodeUI.textnode.destroy(true);
								node.nodeUI.textnode=null;
								}
							if(node.nodeUI && node.nodeUI.spritenode)
								{
								graphics.graphGraphics.removeChild(node.nodeUI.spritenode);
								try
									{
									node.nodeUI.spritenode.destroy(true);
									node.nodeUI.spritenode=null;
									}
								catch(e){}
								}
							graph.removeNode(node.id);
							});
						for (var key in attractortexts)
							{
							graphics.graphGraphics.removeChild(attractortexts[key]);
							attractortexts[key].destroy(true);
							attractortexts[key]=null;
							}
						for (var key in treelimitslabel)
							{
							graphics.graphGraphics.removeChild(treelimitslabel[key].text);
							treelimitslabel[key].text.destroy(true);
							treelimitslabel[key]=null;
							}
						treelimitslabel={};
						attractortexts={};
						}
					ngraph.saveGraph = function(currentState)
						{
						currentState.nodes = [];
						currentState.nodesUI = [];
						currentState.links = [];
						for(var nodeid in supernodeUI)
							{
							currentState.nodes.push(supernodeUI[nodeid].main.data);
							currentState.nodesUI.push(
								{
								id : +nodeid,
								relevance  : supernodeUI[nodeid].relevance,
											
								x  : supernodeUI[nodeid].pos.x,
								y  : supernodeUI[nodeid].pos.y,
								
								isPinned : layout.isNodePinnedId(nodeid)
								});
							}
						
						for(var linkid in superlinkUI)
							{
							var startid = superlinkUI[linkid].fromNode.id;
							var endid   = superlinkUI[linkid].toNode.id;
							currentState.links.push(
								{
								endNode: endid,
								id: startid + "_" + endid,
								startNode: startid
								})
							
							}
						}
					ngraph.restoreGraph = function(saveData)
						{
						if(stopTimeout)
							clearTimeout(stopTimeout);
						if(nextStopTimeout)
							clearTimeout(nextStopTimeout);
						if(nextNodeTimeout)
							clearTimeout(nextNodeTimeout);

						$("#exportInference").show();
						ngraph.clearGraph();

						ngraph.graphics.position.x = saveData.positionx;
						ngraph.graphics.position.y = saveData.positiony;
						ngraph.graphics.scale.x = saveData.scalex;
						ngraph.graphics.scale.y = saveData.scaley;

						
						for(var x = 0 ; x < saveData.nodes.length; x++)
							{
							var node = saveData.nodes[x];
							var newnode = graph.addNode(+node.id, node);
							
							
							}
						for(var x = 0 ; x < saveData.nodesUI.length; x++)
							{
							var nodeUI = saveData.nodesUI[x];
							layout.setNodePosition(nodeUI.id, nodeUI.x, nodeUI.y);
							if(nodeUI.isPinned)
								{
								layout.pinNodeId(nodeUI.id, true);
								}
							}
						
						for(var x = 0 ; x < saveData.links.length; x++)
							{
							var link = saveData.links[x];
							graph.addLink(link.startNode, link.endNode,link);
							
							}

						
						}
					ngraph.doSearch = function(query,terms,sense) {
						if(stopTimeout)
							clearTimeout(stopTimeout);
						if(nextStopTimeout)
							clearTimeout(nextStopTimeout);
						if(nextNodeTimeout)
							clearTimeout(nextNodeTimeout);

						
						ngraph.clearGraph();
						var width = $("#graph").width();
						var height = $("#graph").height();
						graphsettings.screenFactor = (height/640);
						var scale = graphsettings.screenFactor * graphsettings.initialScale * window.devicePixelRatio
						ngraph.graphics.position.x = Math.round(width * window.devicePixelRatio / 2);
						ngraph.graphics.position.y = Math.round(height * window.devicePixelRatio / 2);
						ngraph.graphics.scale.x = scale;
						ngraph.graphics.scale.y = scale;
						
						
						hariSearch(query,terms,sense, function(haridata) 
							{
							var x = 0;
							var y = 0;
							var edges = haridata.edges;
							

							// begin frame rendering loop:
							if(haridata.centroids.length == 1)
								{
								ngraph.graphics.scale.x = 1.01 * graphsettings.screenFactor * graphsettings.initialScale * window.devicePixelRatio;
								ngraph.graphics.scale.y = 1.01 * graphsettings.screenFactor * graphsettings.initialScale * window.devicePixelRatio;
								}
							else
								{
								ngraph.graphics.scale.x = 0.5 * graphsettings.screenFactor * graphsettings.initialScale * window.devicePixelRatio;
								ngraph.graphics.scale.y = 0.5 * graphsettings.screenFactor * graphsettings.initialScale * window.devicePixelRatio;	
								}
							framecount = 1000;
							if (!running)
								{
								console.log("STARTING DRAW LOOP");
								ngraph.renderGraphFrame();
								}
							running = true;

							var nodeStep = 4000 / haridata.nodes.length;
							
							
							var centroidradius = 6000;
							var baseangle=0;
							if(haridata.centroids.length%2)
								baseangle=Math.PI/2;
							var deltaangle=2*Math.PI/haridata.centroids.length;
							
							var hasMetaArticle = false;
							
							for(var z=0;z<haridata.nodes.length;z++)
								{
								if(haridata.nodes[z].isMetaArticle)
									{
									hasMetaArticle = true;
									if(haridata.centroids.length == 1)
										{
										centroidradius = 4000;
										baseangle  = 0;
										deltaangle = Math.PI;
										}
									break;	
									}
								}
							var drawnextnode = function()
								{
								ngraph.resumeForce();
								var node = haridata.nodes[x];
								node2card(node);
								var newnode = graph.addNode(+node.id, node);

								
								var angle = Math.random() * 2 *Math.PI;
								var radius = 5000;
								var cx = radius * Math.cos(angle);
								var cy = radius * Math.sin(angle);
								layout.setNodePosition(newnode.id, cx, cy);
								if (node.isCentroid)
									{
									if (haridata.centroids.length > 1 || hasMetaArticle)
										{
										var centroidIndex = haridata.centroids.indexOf(""+newnode.id)
										
										if(centroidIndex > -1)
											{
											var nodex = 2.1*centroidradius*Math.cos(baseangle + deltaangle*centroidIndex);
											var nodey = 1.2*centroidradius*Math.sin(baseangle + deltaangle*centroidIndex);
											layout.pinNode(newnode, true);
											layout.setNodePosition(newnode.id, nodex, nodey);
											}
										
										}
									else
										{
										layout.pinNode(newnode, true);
										layout.setNodePosition(newnode.id, 0, 0);	
										}
									}
								if(node.isMetaArticle)
									{
									layout.pinNode(newnode, true);
									if (haridata.centroids.length > 1)
										layout.setNodePosition(newnode.id, 0, 0);
									else
										{
										var nodex = 2.1*centroidradius*Math.cos(baseangle + deltaangle);
										var nodey = 1.2*centroidradius*Math.sin(baseangle + deltaangle);
										layout.setNodePosition(newnode.id, nodex, nodey);	
										}
									}
								nextedges = [];
								for (var y = 0; y < edges.length; y++)
									{
									var edge = edges[y];
									var startNode = graph.getNode(edge.startNode);
									var endNode   = graph.getNode(edge.endNode)
									if (startNode && endNode)
										{
									
										graph.addLink(edge.startNode, edge.endNode,edge);
										if(startNode.data.collapsed && endNode.links.length==1)
											{
											endNode.data.hidden_collapse = true;
											}
										else if(endNode.data.collapsed && startNode.links.length==1)
											{
											startNode.data.hidden_collapse = true;
											}
										else
											{
											startNode.data.hidden_collapse = false;
											  endNode.data.hidden_collapse = false;
											}
										}
									else
										{
										nextedges.push(edge);
										}

									}
								edges = nextedges;
								x++;
								if (x < haridata.nodes.length)
									nextNodeTimeout = setTimeout( drawnextnode , 200 );
								else
									{
									nextNodeTimeout = null;
									$("#switcher").removeClass("disabled");
									//ngraph.exportImage();
									}
								}
								
							if(haridata.nodes.length > 0)
								{
								$("#switcher").addClass("disabled");
								drawnextnode();
								}
							/*
							var stopnextnode = function()
								{
								var topic = haridata.centroids[y];
								var nodeId = +topic;
								layout.pinNode(graph.getNode(nodeId), true);

								y++;
								if (y < haridata.centroids.length)
									nextStopTimeout = setTimeout( stopnextnode , timings.nodeStopStep );
								else
									nextStopTimeout = null;
								}
							stopTimeout = setTimeout(function()
								{
								stopnextnode();
								stopTimeout = null;
								},timings.nodeStopDelay + haridata.centroids.length * 200);
							*/
							})
						}





					ngraph.renderGraphFrame = function()
						{
						//framecount++;
						running = true;
						graphics.renderFrame()//framecount-- > 0);
						//if(framecount-- > 0)
						requestAnimFrame(ngraph.renderGraphFrame)

						
						}
				}
				// LSETTINGS
				function createLayout(graph) {
					var layout = require('ngraph.forcelayout'),
						physics = require('ngraph.physics.simulator');

					return layout(graph, physics(forcesettings));
					return layout(graph, physics({
						springLength: 300,//1200,
						springCoeff: 0.00001,//0.00002,
						dragCoeff: 0.06,
						gravity: -1500,
						//theta: 1
					}));
					// safe setting 1
					return layout(graph, physics({
						springLength: 300,//1200,
						springCoeff: 0.000003,//0.00002,
						dragCoeff: 0.04,
						gravity: -600,
						theta: 1
					}));
				}

			}, {
				"./globalInput": 1,
				"./lib/animateGraph": 4,
				"./lib/niceColors": 5,
				"./pixiGraphics": 23,
				"ngraph.forcelayout": 6,
				"ngraph.graph": 9,
				"ngraph.physics.simulator": 11
			}
		],
		3: [

			function(require, module, exports) {
				/**
				 * This module unifies handling of mouse whee event accross different browsers
				 *
				 * See https://developer.mozilla.org/en-US/docs/Web/Reference/Events/wheel?redirectlocale=en-US&redirectslug=DOM%2FMozilla_event_reference%2Fwheel
				 * for more details
				 */
				module.exports = addWheelListener;

				var prefix = "",
					_addEventListener, onwheel, support;

				// detect event model
				if (window.addEventListener) {
					_addEventListener = "addEventListener";
				} else {
					_addEventListener = "attachEvent";
					prefix = "on";
				}

				// detect available wheel event
				support = "onwheel" in document.createElement("div") ? "wheel" : // Modern browsers support "wheel"
				document.onmousewheel !== undefined ? "mousewheel" : // Webkit and IE support at least "mousewheel"
				"DOMMouseScroll"; // let's assume that remaining browsers are older Firefox

				function addWheelListener(elem, callback, useCapture) {
					_addWheelListener(elem, support, callback, useCapture);

					// handle MozMousePixelScroll in older Firefox
					if (support == "DOMMouseScroll") {
						_addWheelListener(elem, "MozMousePixelScroll", callback, useCapture);
					}
				};

				function _addWheelListener(elem, eventName, callback, useCapture) {
					elem[_addEventListener](prefix + eventName, support == "wheel" ? callback : function(originalEvent) {
						!originalEvent && (originalEvent = window.event);
						originalEvent.preventDefault();
						originalEvent.stopPropagation();
						// create a normalized event object
						var event = {
							// keep a ref to the original event object
							originalEvent: originalEvent,
							target: originalEvent.target || originalEvent.srcElement,
							type: "wheel",
							deltaMode: originalEvent.type == "MozMousePixelScroll" ? 0 : 1,
							deltaX: 0,
							delatZ: 0,
							preventDefault: function() {
								originalEvent.preventDefault ?
									originalEvent.preventDefault() :
									originalEvent.returnValue = false;
							}
						};

						// calculate deltaY (and deltaX) according to the event
						if (support == "mousewheel") {
							event.deltaY = -1 / 200 * originalEvent.wheelDelta;
							// Webkit also support wheelDeltaX
							originalEvent.wheelDeltaX && (event.deltaX = -1 / 200 * originalEvent.wheelDeltaX);
						} else {
							event.deltaY = originalEvent.detail;
						}

						// it's time to fire the callback
						callback(event);
						return false;

					}, useCapture || false);
				}

			}, {}
		],
		4: [

			function(require, module, exports) {
				module.exports.animate = function(graph) {
					beginAddNodesLoop(graph);
				}

				function beginRemoveNodesLoop(graph) {
					var nodesLeft = [];
					graph.forEachNode(function(node) {
						nodesLeft.push(node.id);
					});

					var removeInterval = setInterval(function() {
						var nodesCount = nodesLeft.length;

						if (nodesCount > 0) {
							var nodeToRemove = Math.min((Math.random() * nodesCount) << 0, nodesCount - 1);

							graph.removeNode(nodesLeft[nodeToRemove]);
							nodesLeft.splice(nodeToRemove, 1);
						}

						if (nodesCount === 0) {
							clearInterval(removeInterval);
							setTimeout(function() {
								beginAddNodesLoop(graph);
							}, 100);
						}
					}, 100);
				}

				function beginAddNodesLoop(graph) {
					var i = 0,
						m = 10,
						n = 50;
					var addInterval = setInterval(function() {
						graph.beginUpdate();

						for (var j = 0; j < m; ++j) {
							var node = i + j * n;
							if (i > 0) {
								graph.addLink(node, i - 1 + j * n);
							}
							if (j > 0) {
								graph.addLink(node, i + (j - 1) * n);
							}
						}
						i++;
						graph.endUpdate();

						if (i >= n) {
							clearInterval(addInterval);
							setTimeout(function() {
								beginRemoveNodesLoop(graph);
							}, 10000);
						}
					}, 100);
				}

			}, {}
		],
		5: [

			function(require, module, exports) {
				var niceColors = [
					0x1f77b4, 0xaec7e8,
					0xff7f0e, 0xffbb78,
					0x2ca02c, 0x98df8a,
					0xd62728, 0xff9896,
					0x9467bd, 0xc5b0d5,
					0x8c564b, 0xc49c94,
					0xe377c2, 0xf7b6d2,
					0x7f7f7f, 0xc7c7c7,
					0xbcbd22, 0xdbdb8d,
					0x17becf, 0x9edae5
				];

				module.exports = function() {
					return niceColors[(Math.random() * niceColors.length) << 0];
				};

			}, {}
		],
		6: [

			function(require, module, exports) {
				module.exports = createLayout;


				/**
				 * Creates force based layout for a given graph.
				 * @param {ngraph.graph} graph which needs to be layed out
				 */
				function createLayout(graph, physicsSimulator) {
					if (!graph) {
						throw new Error('Graph structure cannot be undefined');
					}

					var random = require('ngraph.random').random(42),
						simulator = require('ngraph.physics.simulator'),
						physics = require('ngraph.physics.primitives');

					physicsSimulator = physicsSimulator || simulator();

					var nodeBodies = {},
						springs = {},
						graphRect = {
							x1: 0,
							y1: 0,
							x2: 0,
							y2: 0
						};

					// Initialize physical objects according to what we have in the graph:
					initPhysics();
					listenToGraphEvents();

					return {
						/**
						 * Performs one step of iterative layout algorithm
						 */
						step: function() {
							var totalMovement = physicsSimulator.step();
							updateGraphRect();
							
							//console.log(totalMovement);
							return totalMovement;
						},

						/**
						 * For a given `nodeId` returns position
						 */
						getNodePosition: function(nodeId) {
							return getInitializedBody(nodeId).pos;
						},

						/**
						 * Sets position of a node to a given coordinates
						 */
						setNodePosition: function(nodeId, x, y) {
							var body = getInitializedBody(nodeId);
							if (body) {
								body.prevPos.x = body.pos.x = x;
								body.prevPos.y = body.pos.y = y;
							}
						},
						/**
						 * @returns {Object} Link position by link id
						 * @returns {Object.from} {x, y} coordinates of link start
						 * @returns {Object.to} {x, y} coordinates of link end
						 */
						getLinkPosition: function(linkId) {
							var spring = springs[linkId];
							if (spring) {
								return {
									from: spring.from.pos,
									to: spring.to.pos
								};
							}
						},

						/**
						 * @returns {Object} area required to fit in the graph. Object contains
						 * `x1`, `y1` - top left coordinates
						 * `x2`, `y2` - bottom right coordinates
						 */
						getGraphRect: function() {
							return graphRect;
						},

						/*
						 * Requests layout algorithm to pin/unpin node to its current position
						 * Pinned nodes should not be affected by layout algorithm and always
						 * remain at their position
						 */
						pinNodeId: function(nodeid, isPinned) {
							var body = getInitializedBody(nodeid);
							body.isPinned = !! isPinned;
						},
						pinNode: function(node, isPinned) {
							var body = getInitializedBody(node.id);
							body.isPinned = !! isPinned;
						},

						/**
						 * Checks whether given graph's node is currently pinned
						 */
						 isNodePinnedId: function(nodeid) {
							return getInitializedBody(nodeid).isPinned;
						},

						isNodePinned: function(node) {
							return getInitializedBody(node.id).isPinned;
						},

						/**
						 * Request to release all resources
						 */
						dispose: function() {
							graph.off('changed', onGraphChanged);
						}
					};

					function listenToGraphEvents() {
						graph.on('changed', onGraphChanged);
					}

					function onGraphChanged(changes) {
						for (var i = 0; i < changes.length; ++i) {
							var change = changes[i];
							if (change.changeType === 'add') {
								if (change.node) {
									initBody(change.node.id);
								}
								if (change.link) {
									initLink(change.link);
								}
							} else if (change.changeType === 'remove') {
								if (change.node) {
									releaseNode(change.node);
								}
								if (change.link) {
									releaseLink(change.link);
								}
							}
						}
					}

					function initPhysics() {
						graph.forEachNode(function(node) {
							initBody(node.id);
						});
						graph.forEachLink(initLink);
					}

					function initBody(nodeId) {
						var body = nodeBodies[nodeId];
						if (!body) {
							var node = graph.getNode(nodeId);
							if (!node) {
								console.log(nodeId);
								throw new Error('initBody() was called with unknown node id');
							}

							var pos = getBestInitialNodePosition(node);
							body = new physics.Body(pos.x, pos.y);
							// we need to augment body with previous position to let users pin them
							body.prevPos = new physics.Vector2d(pos.x, pos.y);

							nodeBodies[nodeId] = body;
							updateBodyMass(nodeId);

							if (isNodeOriginallyPinned(node)) {
								body.isPinned = true;
							}
							/*
							if(node.data.attractedby)
								{
								body.attractedby = attractors[node.data.attractedby];
								}
							*/					
							physicsSimulator.addBody(body);
						}
					}

					function releaseNode(node) {
						var nodeId = node.id;
						var body = nodeBodies[nodeId];
						if (body) {
							nodeBodies[nodeId] = null;
							delete nodeBodies[nodeId];

							physicsSimulator.removeBody(body);
							if (graph.getNodesCount() === 0) {
								graphRect.x1 = graphRect.y1 = 0;
								graphRect.x2 = graphRect.y2 = 0;
							}
						}
					}

					function initLink(link) {
						updateBodyMass(link.fromId);
						updateBodyMass(link.toId);

						var fromBody = nodeBodies[link.fromId],
							toBody = nodeBodies[link.toId],
							spring = physicsSimulator.addSpring(fromBody, toBody, link.length);

						springs[link.id] = spring;
					}

					function releaseLink(link) {
						var spring = springs[link.id];
						if (spring) {
							var from = graph.getNode(link.fromId),
								to = graph.getNode(link.toId);

							if (from) updateBodyMass(from.id);
							if (to) updateBodyMass(to.id);

							delete springs[link.id];

							physicsSimulator.removeSpring(spring);
						}
					}

					function getBestInitialNodePosition(node) {
						// TODO: Initial position could be picked better, e.g. take into
						// account all neighbouring nodes/links, not only one.
						// How about center of mass?
						if (node.position) {
							return node.position;
						}

						var baseX = (graphRect.x1 + graphRect.x2) / 2,
							baseY = (graphRect.y1 + graphRect.y2) / 2,
							springLength = physicsSimulator.springLength();

						if (node.links && node.links.length > 0) {
							var firstLink = node.links[0],
								otherBody = firstLink.fromId !== node.id ? nodeBodies[firstLink.fromId] : nodeBodies[firstLink.toId];
							if (otherBody && otherBody.pos) {
								baseX = otherBody.pos.x;
								baseY = otherBody.pos.y;
							}
						}

						return {
							x: baseX + random.next(springLength) - springLength / 2,
							y: baseY + random.next(springLength) - springLength / 2
						};
					}

					function updateBodyMass(nodeId) {
						var body = nodeBodies[nodeId];
						body.mass = nodeMass(nodeId);
					}


					function updateGraphRect() {
						if (graph.getNodesCount() === 0) {
							// don't have to wory here.
							return;
						}

						var x1 = Number.MAX_VALUE,
							y1 = Number.MAX_VALUE,
							x2 = Number.MIN_VALUE,
							y2 = Number.MIN_VALUE;

						// this is O(n), could it be done faster with quadtree?
						for (var key in nodeBodies) {
							if (nodeBodies.hasOwnProperty(key)) {
								// how about pinned nodes?
								var body = nodeBodies[key];
								if (isBodyPinned(body)) {
									body.pos.x = body.prevPos.x;
									body.pos.y = body.prevPos.y;
								} else {
									body.prevPos.x = body.pos.x;
									body.prevPos.y = body.pos.y;
								}
								if (body.pos.x < x1) {
									x1 = body.pos.x;
								}
								if (body.pos.x > x2) {
									x2 = body.pos.x;
								}
								if (body.pos.y < y1) {
									y1 = body.pos.y;
								}
								if (body.pos.y > y2) {
									y2 = body.pos.y;
								}
							}
						}

						graphRect.x1 = x1;
						graphRect.x2 = x2;
						graphRect.y1 = y1;
						graphRect.y2 = y2;
					}

					/**
					 * Checks whether graph node has in its settings pinned attribute,
					 * which means layout algorithm cannot move it. Node can be preconfigured
					 * as pinned, if it has "isPinned" attribute, or when node.data has it.
					 *
					 * @param {Object} node a graph node to check
					 * @return {Boolean} true if node should be treated as pinned; false otherwise.
					 */
					function isNodeOriginallyPinned(node) {
						return (node && (node.isPinned || (node.data && node.data.isPinned)));
					}

					/**
					 * Checks whether given physical body should be treated as pinned. Unlinke
					 * `isNodeOriginallyPinned` this operates on body object, which is specific to layout
					 * instance. Thus two layouters can independntly pin bodies, which represent
					 * same node of a source graph.
					 *
					 * @param {ngraph.physics.Body} body - body to check
					 * @return {Boolean} true if body should be treated as pinned; false otherwise.
					 */
					function isBodyPinned(body) {
						return body.isPinned;
					}

					function getInitializedBody(nodeId) {
						var body = nodeBodies[nodeId];
						if (!body) {
							initBody(nodeId);
							body = nodeBodies[nodeId];
						}
						return body;
					}

					/**
					 * Calculates mass of a body, which corresponds to node with given id.
					 *
					 * @param {String|Number} nodeId identifier of a node, for which body mass needs to be calculated
					 * @returns {Number} recommended mass of the body;
					 */
					function nodeMass(nodeId) {
						var node = graph.getNode(nodeId);
						if(node.data)
							{
							var mass=1;

							if(node.data.isCentroid )
								{
								mass = forcesettings.bigmass;
								}
							else if(node.data.isCooc || node.data.hasOwnProperty("summary"))
								{
								mass = forcesettings.midmass;
								}
							else
								{
								mass = forcesettings.smallmass;
								}

							mass *= Math.max(1,(node.links.length)/4);
							return mass;
							}
						//return 1 + graph.getLinks(nodeId).length / 3.0;
					}
				}

			}, {
				"ngraph.physics.primitives": 7,
				"ngraph.physics.simulator": 11,
				"ngraph.random": 8
			}
		],
		7: [

			function(require, module, exports) {
				module.exports = {
					Body: Body,
					Vector2d: Vector2d
					// that's it for now
				};

				function Body(x, y) {
					this.pos = new Vector2d(x, y);
					this.force = new Vector2d();
					this.velocity = new Vector2d();
					this.mass = 1;
				}

				function Vector2d(x, y) {
					this.x = typeof x === 'number' ? x : 0;
					this.y = typeof y === 'number' ? y : 0;
				}

			}, {}
		],
		8: [

			function(require, module, exports) {
				module.exports = {
					random: random,
					randomIterator: randomIterator
				};

				/**
				 * Creates seeded PRNG with two methods:
				 *   next() and nextDouble()
				 */
				function random(inputSeed) {
					var seed = typeof inputSeed === 'number' ? inputSeed : (+new Date());
					var randomFunc = function() {
						// Robert Jenkins' 32 bit integer hash function.
						seed = ((seed + 0x7ed55d16) + (seed << 12)) & 0xffffffff;
						seed = ((seed ^ 0xc761c23c) ^ (seed >>> 19)) & 0xffffffff;
						seed = ((seed + 0x165667b1) + (seed << 5)) & 0xffffffff;
						seed = ((seed + 0xd3a2646c) ^ (seed << 9)) & 0xffffffff;
						seed = ((seed + 0xfd7046c5) + (seed << 3)) & 0xffffffff;
						seed = ((seed ^ 0xb55a4f09) ^ (seed >>> 16)) & 0xffffffff;
						return (seed & 0xfffffff) / 0x10000000;
					};

					return {
						/**
						 * Generates random integer number in the range from 0 (inclusive) to maxValue (exclusive)
						 *
						 * @param maxValue Number REQUIRED. Ommitting this number will result in NaN values from PRNG.
						 */
						next: function(maxValue) {
							return Math.floor(randomFunc() * maxValue);
						},

						/**
						 * Generates random double number in the range from 0 (inclusive) to 1 (exclusive)
						 * This function is the same as Math.random() (except that it could be seeded)
						 */
						nextDouble: function() {
							return randomFunc();
						}
					};
				}

				/*
				 * Creates iterator over array, which returns items of array in random order
				 * Time complexity is guaranteed to be O(n);
				 */
				function randomIterator(array, customRandom) {
					var localRandom = customRandom || random();
					if (typeof localRandom.next !== 'function') {
						throw new Error('customRandom does not match expected API: next() function is missing');
					}

					return {
						forEach: function(callback) {
							var i, j, t;
							for (i = array.length - 1; i > 0; --i) {
								j = localRandom.next(i + 1); // i inclusive
								t = array[j];
								array[j] = array[i];
								array[i] = t;

								callback(t);
							}

							if (array.length) {
								callback(array[0]);
							}
						},

						/**
						 * Shuffles array randomly, in place.
						 */
						shuffle: function() {
							var i, j, t;
							for (i = array.length - 1; i > 0; --i) {
								j = localRandom.next(i + 1); // i inclusive
								t = array[j];
								array[j] = array[i];
								array[i] = t;
							}

							return array;
						}
					};
				}

			}, {}
		],
		9: [

			function(require, module, exports) {
				/**
				 * @fileOverview Contains definition of the core graph object.
				 */


				/**
				 * @example
				 *  var graph = require('ngraph.graph')();
				 *  graph.addNode(1);     // graph has one node.
				 *  graph.addLink(2, 3);  // now graph contains three nodes and one link.
				 *
				 */
				module.exports = function() {
					// Graph structure is maintained as dictionary of nodes
					// and array of links. Each node has 'links' property which
					// hold all links related to that node. And general links
					// array is used to speed up all links enumeration. This is inefficient
					// in terms of memory, but simplifies coding.

					var nodes = {},
						links = [],
						// Hash of multi-edges. Used to track ids of edges between same nodes
						multiEdges = {},
						nodesCount = 0,
						suspendEvents = 0,

						// Accumlates all changes made during graph updates.
						// Each change element contains:
						//  changeType - one of the strings: 'add', 'remove' or 'update';
						//  node - if change is related to node this property is set to changed graph's node;
						//  link - if change is related to link this property is set to changed graph's link;
						changes = [],

						fireGraphChanged = function(graph) {
							graph.fire('changed', changes);
						},

						// Enter, Exit Mofidication allows bulk graph updates without firing events.
						enterModification = function() {
							suspendEvents += 1;
						},

						exitModification = function(graph) {
							suspendEvents -= 1;
							if (suspendEvents === 0 && changes.length > 0) {
								fireGraphChanged(graph);
								changes.length = 0;
							}
						},

						recordNodeChange = function(node, changeType) {
							changes.push({
								node: node,
								changeType: changeType
							});
						},

						recordLinkChange = function(link, changeType) {
							changes.push({
								link: link,
								changeType: changeType
							});
						},
						linkConnectionSymbol = 'ðŸ‘‰ ';

					var graphPart = {

						/**
						 * Adds node to the graph. If node with given id already exists in the graph
						 * its data is extended with whatever comes in 'data' argument.
						 *
						 * @param nodeId the node's identifier. A string or number is preferred.
						 *   note: Node id should not contain 'linkConnectionSymbol'. This will break link identifiers
						 * @param [data] additional data for the node being added. If node already
						 *   exists its data object is augmented with the new one.
						 *
						 * @return {node} The newly added node or node with given id if it already exists.
						 */
						addNode: function(nodeId, data) {
							if (typeof nodeId === 'undefined') {
								throw new Error('Invalid node identifier');
							}

							enterModification();

							var node = this.getNode(nodeId);
							if (!node) {
								// TODO: Should I check for linkConnectionSymbol here?
								node = new Node(nodeId);
								nodesCount++;

								recordNodeChange(node, 'add');
							} else {
								recordNodeChange(node, 'update');
							}

							node.data = data;

							nodes[nodeId] = node;

							exitModification(this);
							return node;
						},

						/**
						 * Adds a link to the graph. The function always create a new
						 * link between two nodes. If one of the nodes does not exists
						 * a new node is created.
						 *
						 * @param fromId link start node id;
						 * @param toId link end node id;
						 * @param [data] additional data to be set on the new link;
						 *
						 * @return {link} The newly created link
						 */
						addLink: function(fromId, toId, data) {
							enterModification();

							var fromNode = this.getNode(fromId) || this.addNode(fromId);
							var toNode = this.getNode(toId) || this.addNode(toId);

							var linkId = fromId.toString() + linkConnectionSymbol + toId.toString();
							var isMultiEdge = multiEdges.hasOwnProperty(linkId);
							if (isMultiEdge || this.hasLink(fromId, toId)) {
								if (!isMultiEdge) {
									multiEdges[linkId] = 0;
								}
								linkId += '@' + (++multiEdges[linkId]);
							}

							var link = new Link(fromId, toId, data, linkId);
							link.fromNode = fromNode;
							link.toNode   = toNode;
							links.push(link);

							// TODO: this is not cool. On large graphs potentially would consume more memory.
							fromNode.links.push(link);
							toNode.links.push(link);

							recordLinkChange(link, 'add');

							exitModification(this);

							return link;
						},

						/**
						 * Removes link from the graph. If link does not exist does nothing.
						 *
						 * @param link - object returned by addLink() or getLinks() methods.
						 *
						 * @returns true if link was removed; false otherwise.
						 */
						removeLink: function(link) {
							if (!link) {
								return false;
							}
							var idx = indexOfElementInArray(link, links);
							if (idx < 0) {
								return false;
							}

							enterModification();

							links.splice(idx, 1);

							var fromNode = this.getNode(link.fromId);
							var toNode = this.getNode(link.toId);

							if (fromNode) {
								idx = indexOfElementInArray(link, fromNode.links);
								if (idx >= 0) {
									fromNode.links.splice(idx, 1);
								}
							}

							if (toNode) {
								idx = indexOfElementInArray(link, toNode.links);
								if (idx >= 0) {
									toNode.links.splice(idx, 1);
								}
							}

							recordLinkChange(link, 'remove');

							exitModification(this);

							return true;
						},

						/**
						 * Removes node with given id from the graph. If node does not exist in the graph
						 * does nothing.
						 *
						 * @param nodeId node's identifier passed to addNode() function.
						 *
						 * @returns true if node was removed; false otherwise.
						 */
						removeNode: function(nodeId) {
							var node = this.getNode(nodeId);
							if (!node) {
								return false;
							}

							enterModification();

							while (node.links.length) {
								var link = node.links[0];
								this.removeLink(link);
							}

							delete nodes[nodeId];
							nodesCount--;

							recordNodeChange(node, 'remove');

							exitModification(this);

							return true;
						},

						/**
						 * Gets node with given identifier. If node does not exist undefined value is returned.
						 *
						 * @param nodeId requested node identifier;
						 *
						 * @return {node} in with requested identifier or undefined if no such node exists.
						 */
						getNode: function(nodeId) {
							return nodes[nodeId];
						},

						/**
						 * Gets number of nodes in this graph.
						 *
						 * @return number of nodes in the graph.
						 */
						getNodesCount: function() {
							return nodesCount;
						},

						/**
						 * Gets total number of links in the graph.
						 */
						getLinksCount: function() {
							return links.length;
						},

						/**
						 * Gets all links (inbound and outbound) from the node with given id.
						 * If node with given id is not found null is returned.
						 *
						 * @param nodeId requested node identifier.
						 *
						 * @return Array of links from and to requested node if such node exists;
						 *   otherwise null is returned.
						 */
						getLinks: function(nodeId) {
							var node = this.getNode(nodeId);
							return node ? node.links : null;
						},

						/**
						 * Invokes callback on each node of the graph.
						 *
						 * @param {Function(node)} callback Function to be invoked. The function
						 *   is passed one argument: visited node.
						 */
						forEachNode: function(callback) {
							if (typeof callback !== 'function') {
								return;
							}
							var node;

							for (node in nodes) {
								if (nodes.hasOwnProperty(node)) {
									if (callback(nodes[node])) {
										return; // client doesn't want to proceed. return.
									}
								}
							}
						},

						/**
						 * Invokes callback on every linked (adjacent) node to the given one.
						 *
						 * @param nodeId Identifier of the requested node.
						 * @param {Function(node, link)} callback Function to be called on all linked nodes.
						 *   The function is passed two parameters: adjacent node and link object itself.
						 * @param oriented if true graph treated as oriented.
						 */
						forEachLinkedNode: function(nodeId, callback, oriented) {
							var node = this.getNode(nodeId),
								i,
								link,
								linkedNodeId;

							if (node && node.links && typeof callback === 'function') {
								// Extraced orientation check out of the loop to increase performance
								if (oriented) {
									for (i = 0; i < node.links.length; ++i) {
										link = node.links[i];
										if (link.fromId === nodeId) {
											callback(nodes[link.toId], link);
										}
									}
								} else {
									for (i = 0; i < node.links.length; ++i) {
										link = node.links[i];
										linkedNodeId = link.fromId === nodeId ? link.toId : link.fromId;

										callback(nodes[linkedNodeId], link);
									}
								}
							}
						},

						/**
						 * Enumerates all links in the graph
						 *
						 * @param {Function(link)} callback Function to be called on all links in the graph.
						 *   The function is passed one parameter: graph's link object.
						 *
						 * Link object contains at least the following fields:
						 *  fromId - node id where link starts;
						 *  toId - node id where link ends,
						 *  data - additional data passed to graph.addLink() method.
						 */
						forEachLink: function(callback) {
							var i, length;
							if (typeof callback === 'function') {
								for (i = 0, length = links.length; i < length; ++i) {
									callback(links[i]);
								}
							}
						},

						/**
						 * Suspend all notifications about graph changes until
						 * endUpdate is called.
						 */
						beginUpdate: function() {
							enterModification();
						},

						/**
						 * Resumes all notifications about graph changes and fires
						 * graph 'changed' event in case there are any pending changes.
						 */
						endUpdate: function() {
							exitModification(this);
						},

						/**
						 * Removes all nodes and links from the graph.
						 */
						clear: function() {
							var that = this;
							that.beginUpdate();
							that.forEachNode(function(node) {
								that.removeNode(node.id);
							});
							that.endUpdate();
						},

						/**
						 * Detects whether there is a link between two nodes.
						 * Operation complexity is O(n) where n - number of links of a node.
						 *
						 * @returns link if there is one. null otherwise.
						 */
						hasLink: function(fromNodeId, toNodeId) {
							// TODO: Use adjacency matrix to speed up this operation.
							var node = this.getNode(fromNodeId),
								i;
							if (!node) {
								return null;
							}

							for (i = 0; i < node.links.length; ++i) {
								var link = node.links[i];
								if (link.fromId === fromNodeId && link.toId === toNodeId) {
									return link;
								}
							}

							return null; // no link.
						}
					};

					// Let graph fire events before we return it to the caller.
					var eventify = require('ngraph.events');
					eventify(graphPart);

					return graphPart;
				};

				// need this for old browsers. Should this be a separate module?
				function indexOfElementInArray(element, array) {
					if (array.indexOf) {
						return array.indexOf(element);
					}

					var len = array.length,
						i;

					for (i = 0; i < len; i += 1) {
						if (array[i] === element) {
							return i;
						}
					}

					return -1;
				}

				/**
				 * Internal structure to represent node;
				 */
				function Node(id) {
					this.id = id;
					this.links = [];
					this.data = null;
				}


				/**
				 * Internal structure to represent links;
				 */
				function Link(fromId, toId, data, id) {
					this.fromId = fromId;
					this.toId = toId;
					this.data = data;
					this.id = id;
				}

			}, {
				"ngraph.events": 10
			}
		],
		10: [

			function(require, module, exports) {
				module.exports = function(subject) {
					validateSubject(subject);

					var eventsStorage = createEventsStorage(subject);
					subject.on = eventsStorage.on;
					subject.off = eventsStorage.off;
					subject.fire = eventsStorage.fire;
					return subject;
				};

				function createEventsStorage(subject) {
					// Store all event listeners to this hash. Key is event name, value is array
					// of callback records.
					//
					// A callback record consists of callback function and its optional context:
					// { 'eventName' => [{callback: function, ctx: object}] }
					var registeredEvents = {};

					return {
						on: function(eventName, callback, ctx) {
							if (typeof callback !== 'function') {
								throw new Error('callback is expected to be a function');
							}
							if (!registeredEvents.hasOwnProperty(eventName)) {
								registeredEvents[eventName] = [];
							}
							registeredEvents[eventName].push({
								callback: callback,
								ctx: ctx
							});

							return subject;
						},

						off: function(eventName, callback) {
							var wantToRemoveAll = (typeof eventName === 'undefined');
							if (wantToRemoveAll) {
								// Killing old events storage should be enough in this case:
								registeredEvents = {};
								return subject;
							}

							if (registeredEvents.hasOwnProperty(eventName)) {
								var deleteAllCallbacksForEvent = (typeof callback !== 'function');
								if (deleteAllCallbacksForEvent) {
									delete registeredEvents[eventName];
								} else {
									var callbacks = registeredEvents[eventName];
									for (var i = 0; i < callbacks.length; ++i) {
										if (callbacks[i].callback === callback) {
											callbacks.splice(i, 1);
										}
									}
								}
							}

							return subject;
						},

						fire: function(eventName) {
							var noEventsToFire = !registeredEvents.hasOwnProperty(eventName);
							if (noEventsToFire) {
								return subject;
							}

							var callbacks = registeredEvents[eventName];
							var fireArguments = Array.prototype.splice.call(arguments, 1);
							for (var i = 0; i < callbacks.length; ++i) {
								var callbackInfo = callbacks[i];
								callbackInfo.callback.apply(callbackInfo.ctx, fireArguments);
							}

							return subject;
						}
					};
				}

				function validateSubject(subject) {
					if (!subject) {
						throw new Error('Eventify cannot use falsy object as events subject');
					}
					var reservedWords = ['on', 'fire', 'off'];
					for (var i = 0; i < reservedWords.length; ++i) {
						if (subject.hasOwnProperty(reservedWords[i])) {
							throw new Error("Subject cannot be eventified, since it already has property '" + reservedWords[i] + "'");
						}
					}
				}

			}, {}
		],
		11: [

			function(require, module, exports) {
				/**
				 * Manages a simulation of physical forces acting on bodies and springs.
				 */
				module.exports = physicsSimulator;

				function physicsSimulator(settings) {
					var Spring = require('./lib/spring');
					var createQuadTree = require('ngraph.quadtreebh');
					var createDragForce = require('./lib/dragForce');
					var createSpringForce = require('./lib/springForce');
					var integrate = require('./lib/eulerIntegrator');
					var expose = require('./lib/exposeProperties');
					var merge = require('ngraph.merge');

					settings = merge(settings, {
						/**
						 * Ideal length for links (springs in physical model).
						 */
						springLength: 80,

						/**
						 * Hook's law coefficient. 1 - solid spring.
						 */
						springCoeff: 0.0002,

						/**
						 * Coulomb's law coefficient. It's used to repel nodes thus should be negative
						 * if you make it positive nodes start attract each other :).
						 */
						gravity: -1.2,

						/**
						 * Theta coeffiecient from Barnes Hut simulation. Ranged between (0, 1).
						 * The closer it's to 1 the more nodes algorithm will have to go through.
						 * Setting it to one makes Barnes Hut simulation no different from
						 * brute-force forces calculation (each node is considered).
						 */
						theta: 0.2,

						/**
						 * Drag force coefficient. Used to slow down system, thus should be less than 1.
						 * The closer it is to 0 the less tight system will be.
						 */
						dragCoeff: 0.02,

						/**
						 * Default time step (dt) for forces integration
						 */
						timeStep: 20
					});

					var bodies = [], // Bodies in this simulation.
						springs = [], // Springs in this simulation.
						quadTree = createQuadTree(settings),
						springForce = createSpringForce(settings),
						dragForce = createDragForce(settings);

					var publicApi = {
						/**
						 * Array of bodies, registered with current simulator
						 *
						 * Note: To add new body, use addBody() method. This property is only
						 * exposed for testing/performance purposes.
						 */
						bodies: bodies,

						/**
						 * Performs one step of force simulation.
						 *
						 * @returns {Number} Total movement of the system. Calculated as:
						 *   (total distance traveled by bodies)^2/(total # of bodies)
						 */
						step: function() {
							// I'm reluctant to check timeStep here, since this method is going to be
							// super hot, I don't want to add more complexity to it
							accumulateForces();
							return integrate(bodies, settings.timeStep);
						},

						/**
						 * Adds body to the system
						 *
						 * @param {ngraph.physics.primitives.Body} body physical body
						 *
						 * @returns {ngraph.physics.primitives.Body} added body
						 */
						addBody: function(body) {
							if (!body) {
								throw new Error('Body is required');
							}
							bodies.push(body);

							return body;
						},

						/**
						 * Removes body from the system
						 *
						 * @param {ngraph.physics.primitives.Body} body to remove
						 *
						 * @returns {Boolean} true if body found and removed. falsy otherwise;
						 */
						removeBody: function(body) {
							if (!body) {
								return;
							}
							var idx = bodies.indexOf(body);
							if (idx > -1) {
								bodies.splice(idx, 1);
								return true;
							}
						},

						/**
						 * Adds a spring to this simulation.
						 *
						 * @returns {Object} - a handle for a spring. If you want to later remove
						 * spring pass it to removeSpring() method.
						 */
						addSpring: function(body1, body2, springLength, springWeight, springCoefficient) {
							if (!body1 || !body2) {
								throw new Error('Cannot add null spring to force simulator');
							}

							if (typeof springLength !== 'number') {
								springLength = -1; // assume global configuration
							}

							var spring = new Spring(body1, body2, springLength, springCoefficient >= 0 ? springCoefficient : -1, springWeight);
							springs.push(spring);

							// TODO: could mark simulator as dirty.
							return spring;
						},

						/**
						 * Removes spring from the system
						 *
						 * @param {Object} spring to remove. Spring is an object returned by addSpring
						 *
						 * @returns {Boolean} true if spring found and removed. falsy otherwise;
						 */
						removeSpring: function(spring) {
							if (!spring) {
								return;
							}
							var idx = springs.indexOf(spring);
							if (idx > -1) {
								springs.splice(idx, 1);
								return true;
							}
						},

						gravity: function(value) {
							if (value !== undefined) {
								settings.gravity = value;
								quadTree.options({
									gravity: value
								});
								return this;
							} else {
								return settings.gravity;
							}
						},

						theta: function(value) {
							if (value !== undefined) {
								settings.theta = value;
								quadTree.options({
									theta: value
								});
								return this;
							} else {
								return settings.theta;
							}
						}
					}

					// allow settings modification via public API:
					expose(settings, publicApi);

					return publicApi;

					function accumulateForces() {
						// Accumulate forces acting on bodies.
						var body,
							i = bodies.length;

						if (i) {
							// only add bodies if there the array is not empty:
							quadTree.insertBodies(bodies); // performance: O(n * log n)
							while (i--) {
								body = bodies[i];
								body.force.x = 0;
								body.force.y = 0;

								quadTree.updateBodyForce(body);
								dragForce.update(body);
							}
						}

						i = springs.length;
						while (i--) {
							springForce.update(springs[i]);
						}
					}
				};

			}, {
				"./lib/dragForce": 12,
				"./lib/eulerIntegrator": 13,
				"./lib/exposeProperties": 14,
				"./lib/spring": 15,
				"./lib/springForce": 16,
				"ngraph.merge": 17,
				"ngraph.quadtreebh": 18
			}
		],
		12: [

			function(require, module, exports) {
				/**
				 * Represents drag force, which reduces force value on each step by given
				 * coefficient.
				 *
				 * @param {Object} options for the drag force
				 * @param {Number=} options.dragCoeff drag force coefficient. 0.1 by default
				 */
				module.exports = function(options) {
					var merge = require('ngraph.merge'),
						expose = require('./exposeProperties');

					options = merge(options, {
						dragCoeff: 0.02
					});

					var api = {
						update: function(body) {
							/*
							if(body.attractedby)
								{
								body.force.x += (body.attractedby.x-body.pos.x)*forcesettings.attractors;
								body.force.y += (body.attractedby.y-body.pos.y)*forcesettings.attractors;
								}
							*/
							body.force.x -= options.dragCoeff * body.velocity.x;
							body.force.y -= options.dragCoeff * body.velocity.y;
							
							
							/*
							if(Math.sqrt(body.force.x*body.force.x + body.force.y*body.force.y) < 0.05)
								{
								body.force.x = 0;
								body.velocity.x = 0;
								body.force.y = 0;
								body.velocity.y=0;
								}
							*/
							
				
						}
					};

					// let easy access to dragCoeff:
					expose(options, api, ['dragCoeff']);

					return api;
				};

			}, {
				"./exposeProperties": 14,
				"ngraph.merge": 17
			}
		],
		13: [

			function(require, module, exports) {
				/**
				 * Performs forces integration, using given timestep. Uses Euler method to solve
				 * differential equation (http://en.wikipedia.org/wiki/Euler_method ).
				 *
				 * @returns {Number} squared distance of total position updates.
				 */

				module.exports = integrate;

				function integrate(bodies, timeStep) {
					var dx = 0,
						tx = 0,
						dy = 0,
						ty = 0,
						i,
						max = bodies.length;

					for (i = 0; i < max; ++i) {
						var body = bodies[i],
							coeff = timeStep / body.mass;

						body.velocity.x += coeff * body.force.x;
						body.velocity.y += coeff * body.force.y;
						var vx = body.velocity.x,
							vy = body.velocity.y,
							v = Math.sqrt(vx * vx + vy * vy);
						
						
						if (v > forcesettings.maxSpeed) {
							body.velocity.x = vx / (v/forcesettings.maxSpeed);
							body.velocity.y = vy / (v/forcesettings.maxSpeed);
						}
						
						body.velocity.x *= (graphsettings.staticCount-staticcount)/graphsettings.staticCount;
						body.velocity.y *= (graphsettings.staticCount-staticcount)/graphsettings.staticCount;
						
						dx = timeStep * body.velocity.x;
						dy = timeStep * body.velocity.y;

						body.pos.x += dx;
						body.pos.y += dy;

						// TODO: this is not accurate. Total value should be absolute
						tx += dx;
						ty += dy;
					}

					return (tx * tx + ty * ty) / bodies.length;
				}

			}, {}
		],
		14: [

			function(require, module, exports) {
				module.exports = exposeProperties;

				/**
				 * Augments `target` object with getter/setter functions, which modify settings
				 *
				 * @example
				 *  var target = {};
				 *  exposeProperties({ age: 42}, target);
				 *  target.age(); // returns 42
				 *  target.age(24); // make age 24;
				 *
				 *  var filteredTarget = {};
				 *  exposeProperties({ age: 42, name: 'John'}, filteredTarget, ['name']);
				 *  filteredTarget.name(); // returns 'John'
				 *  filteredTarget.age === undefined; // true
				 */
				function exposeProperties(settings, target, filter) {
					var needsFilter = Object.prototype.toString.call(filter) === '[object Array]';
					if (needsFilter) {
						for (var i = 0; i < filter.length; ++i) {
							augment(settings, target, filter[i]);
						}
					} else {
						for (var key in settings) {
							augment(settings, target, key);
						}
					}
				}

				function augment(source, target, key) {
					if (source.hasOwnProperty(key)) {
						if (typeof target[key] === 'function') {
							// this accessor is already defined. Ignore it
							return;
						}
						target[key] = function(value) {
							if (value !== undefined) {
								source[key] = value;
								return target;
							}
							return source[key];
						}
					}
				}

			}, {}
		],
		15: [

			function(require, module, exports) {
				module.exports = Spring;

				/**
				 * Represents a physical spring. Spring connects two bodies, has rest length
				 * stiffness coefficient and optional weight
				 */
				function Spring(fromBody, toBody, length, coeff, weight) {
					this.from = fromBody;
					this.to = toBody;
					this.length = length;
					this.coeff = coeff;

					this.weight = typeof weight === 'number' ? weight : 1;
				};

			}, {}
		],
		16: [

			function(require, module, exports) {
				/**
				 * Represents spring force, which updates forces acting on two bodies, conntected
				 * by a spring.
				 *
				 * @param {Object} options for the spring force
				 * @param {Number=} options.springCoeff spring force coefficient.
				 * @param {Number=} options.springLength desired length of a spring at rest.
				 */
				module.exports = function(options) {
					var merge = require('ngraph.merge');
					var random = require('ngraph.random').random(42);
					var expose = require('./exposeProperties');

					options = merge(options, {
						springCoeff: 0.0002,
						springLength: 80
					});

					var api = {
						/**
						 * Upsates forces acting on a spring
						 */
						update: function(spring) {
							var body1 = spring.from,
								body2 = spring.to,
								length = spring.length < 0 ? options.springLength : spring.length,
								dx = body2.pos.x - body1.pos.x,
								dy = body2.pos.y - body1.pos.y,
								r = Math.sqrt(dx * dx + dy * dy);

							if (r === 0) {
								dx = (random.nextDouble() - 0.5) / 50;
								dy = (random.nextDouble() - 0.5) / 50;
								r = Math.sqrt(dx * dx + dy * dy);
							}

							var d = r - length;
							var coeff = ((!spring.coeff || spring.coeff < 0) ? options.springCoeff : spring.coeff) * d / r * spring.weight;

							body1.force.x += coeff * dx;
							body1.force.y += coeff * dy;

							body2.force.x -= coeff * dx;
							body2.force.y -= coeff * dy;
						}
					};

					expose(options, api, ['springCoeff', 'springLength']);
					return api;
				}

			}, {
				"./exposeProperties": 14,
				"ngraph.merge": 17,
				"ngraph.random": 22
			}
		],
		17: [

			function(require, module, exports) {
				module.exports = merge;

				/**
				 * Augments `target` with properties in `options`. Does not override
				 * target's properties if they are defined and matches expected type in
				 * options
				 *
				 * @returns {Object} merged object
				 */
				function merge(target, options) {
					var key;
					if (!target) {
						target = {};
					}
					if (options) {
						for (key in options) {
							if (options.hasOwnProperty(key)) {
								var targetHasIt = target.hasOwnProperty(key),
									optionsValueType = typeof options[key],
									shouldReplace = !targetHasIt || (typeof target[key] !== optionsValueType);

								if (shouldReplace) {
									target[key] = options[key];
								} else if (optionsValueType === 'object') {
									// go deep, don't care about loops here, we are simple API!:
									target[key] = merge(target[key], options[key]);
								}
							}
						}
					}

					return target;
				}

			}, {}
		],
		18: [

			function(require, module, exports) {
				/**
				 * This is Barnes Hut simulation algorithm. Implementation
				 * is adopted to non-recursive solution, since certain browsers
				 * handle recursion extremly bad.
				 *
				 * http://www.cs.princeton.edu/courses/archive/fall03/cs126/assignments/barnes-hut.html
				 */

				module.exports = function(options) {
					options = options || {};
					options.gravity = typeof options.gravity === 'number' ? options.gravity : -1;
					options.theta = typeof options.theta === 'number' ? options.theta : 0.8;

					// we require deterministic randomness here
					var random = require('ngraph.random').random(1984),
						Node = require('./node'),
						InsertStack = require('./insertStack'),
						isSamePosition = require('./isSamePosition');

					var gravity = options.gravity,
						updateQueue = [],
						insertStack = new InsertStack(),
						theta = options.theta,

						nodesCache = [],
						currentInCache = 0,
						newNode = function() {
							// To avoid pressure on GC we reuse nodes.
							var node = nodesCache[currentInCache];
							if (node) {
								node.quads[0] = null;
								node.quads[1] = null;
								node.quads[2] = null;
								node.quads[3] = null;
								node.body = null;
								node.mass = node.massX = node.massY = 0;
								node.left = node.right = node.top = node.bottom = 0;
							} else {
								node = new Node();
								nodesCache[currentInCache] = node;
							}

							++currentInCache;
							return node;
						},

						root = newNode(),

						// Inserts body to the tree
						insert = function(newBody) {
							insertStack.reset();
							insertStack.push(root, newBody);

							while (!insertStack.isEmpty()) {
								var stackItem = insertStack.pop(),
									node = stackItem.node,
									body = stackItem.body;

								if (!node.body) {
									// This is internal node. Update the total mass of the node and center-of-mass.
									var x = body.pos.x;
									var y = body.pos.y;
									node.mass = node.mass + body.mass;
									node.massX = node.massX + body.mass * x;
									node.massY = node.massY + body.mass * y;

									// Recursively insert the body in the appropriate quadrant.
									// But first find the appropriate quadrant.
									var quadIdx = 0, // Assume we are in the 0's quad.
										left = node.left,
										right = (node.right + left) / 2,
										top = node.top,
										bottom = (node.bottom + top) / 2;

									if (x > right) { // somewhere in the eastern part.
										quadIdx = quadIdx + 1;
										var oldLeft = left;
										left = right;
										right = right + (right - oldLeft);
									}
									if (y > bottom) { // and in south.
										quadIdx = quadIdx + 2;
										var oldTop = top;
										top = bottom;
										bottom = bottom + (bottom - oldTop);
									}

									var child = node.quads[quadIdx];
									if (!child) {
										// The node is internal but this quadrant is not taken. Add
										// subnode to it.
										child = newNode();
										child.left = left;
										child.top = top;
										child.right = right;
										child.bottom = bottom;
										child.body = body;

										node.quads[quadIdx] = child;
									} else {
										// continue searching in this quadrant.
										insertStack.push(child, body);
									}
								} else {
									// We are trying to add to the leaf node.
									// We have to convert current leaf into internal node
									// and continue adding two nodes.
									var oldBody = node.body;
									node.body = null; // internal nodes do not cary bodies

									if (isSamePosition(oldBody.pos, body.pos)) {
										// Prevent infinite subdivision by bumping one node
										// anywhere in this quadrant
										if (node.right - node.left < 1e-8) {
											// This is very bad, we ran out of precision.
											// if we do not return from the method we'll get into
											// infinite loop here. So we sacrifice correctness of layout, and keep the app running
											// Next layout iteration should get larger bounding box in the first step and fix this
											return;
										}
										do {
											var offset = random.nextDouble();
											var dx = (node.right - node.left) * offset;
											var dy = (node.bottom - node.top) * offset;

											oldBody.pos.x = node.left + dx;
											oldBody.pos.y = node.top + dy;
											// Make sure we don't bump it out of the box. If we do, next iteration should fix it
										} while (isSamePosition(oldBody.pos, body.pos));

									}
									// Next iteration should subdivide node further.
									insertStack.push(node, oldBody);
									insertStack.push(node, body);
								}
							}
						},

						update = function(sourceBody) {
							var queue = updateQueue,
								v,
								dx,
								dy,
								r,
								queueLength = 1,
								shiftIdx = 0,
								pushIdx = 1;

							queue[0] = root;

							while (queueLength) {
								var node = queue[shiftIdx],
									body = node.body;

								queueLength -= 1;
								shiftIdx += 1;
								// technically there should be external "if (body !== sourceBody) {"
								// but in practice it gives slightghly worse performance, and does not
								// have impact on layout correctness
								if (body && body !== sourceBody) {
									// If the current node is a leaf node (and it is not source body),
									// calculate the force exerted by the current node on body, and add this
									// amount to body's net force.
									dx = body.pos.x - sourceBody.pos.x;
									dy = body.pos.y - sourceBody.pos.y;
									r = Math.sqrt(dx * dx + dy * dy);

									if (r === 0) {
										// Poor man's protection against zero distance.
										dx = (random.nextDouble() - 0.5) / 50;
										dy = (random.nextDouble() - 0.5) / 50;
										r = Math.sqrt(dx * dx + dy * dy);
									}

									// This is standard gravition force calculation but we divide
									// by r^3 to save two operations when normalizing force vector.
									v = gravity * body.mass * sourceBody.mass / (r * r * r);
									sourceBody.force.x += v * dx;
									sourceBody.force.y += v * dy;
								} else {
									// Otherwise, calculate the ratio s / r,  where s is the width of the region
									// represented by the internal node, and r is the distance between the body
									// and the node's center-of-mass
									dx = node.massX / node.mass - sourceBody.pos.x;
									dy = node.massY / node.mass - sourceBody.pos.y;
									r = Math.sqrt(dx * dx + dy * dy);

									if (r === 0) {
										// Sorry about code duplucation. I don't want to create many functions
										// right away. Just want to see performance first.
										dx = (random.nextDouble() - 0.5) / 50;
										dy = (random.nextDouble() - 0.5) / 50;
										r = Math.sqrt(dx * dx + dy * dy);
									}
									// If s / r < Î¸, treat this internal node as a single body, and calculate the
									// force it exerts on body b, and add this amount to b's net force.
									//console.log((node.right - node.left) / r , theta)
									if ((node.right - node.left) / r < theta) {
										// in the if statement above we consider node's width only
										// because the region was squarified during tree creation.
										// Thus there is no difference between using width or height.
										v = gravity * node.mass * sourceBody.mass / (r * r * r);
										sourceBody.force.x += v * dx;
										sourceBody.force.y += v * dy;
									} else {
										// Otherwise, run the procedure recursively on each of the current node's children.

										// I intentionally unfolded this loop, to save several CPU cycles.
										if (node.quads[0]) {
											queue[pushIdx] = node.quads[0];
											queueLength += 1;
											pushIdx += 1;
										}
										if (node.quads[1]) {
											queue[pushIdx] = node.quads[1];
											queueLength += 1;
											pushIdx += 1;
										}
										if (node.quads[2]) {
											queue[pushIdx] = node.quads[2];
											queueLength += 1;
											pushIdx += 1;
										}
										if (node.quads[3]) {
											queue[pushIdx] = node.quads[3];
											queueLength += 1;
											pushIdx += 1;
										}
									}
								}
							}
						},

						insertBodies = function(bodies) {
							var x1 = Number.MAX_VALUE,
								y1 = Number.MAX_VALUE,
								x2 = Number.MIN_VALUE,
								y2 = Number.MIN_VALUE,
								i,
								max = bodies.length;

							// To reduce quad tree depth we are looking for exact bounding box of all particles.
							i = max;
							while (i--) {
								var x = bodies[i].pos.x;
								var y = bodies[i].pos.y;
								if (x < x1) {
									x1 = x;
								}
								if (x > x2) {
									x2 = x;
								}
								if (y < y1) {
									y1 = y;
								}
								if (y > y2) {
									y2 = y;
								}
							}

							// Squarify the bounds.
							var dx = x2 - x1,
								dy = y2 - y1;
							if (dx > dy) {
								y2 = y1 + dx;
							} else {
								x2 = x1 + dy;
							}

							currentInCache = 0;
							root = newNode();
							root.left = x1;
							root.right = x2;
							root.top = y1;
							root.bottom = y2;

							i = max - 1;
							if (i > 0) {
								root.body = bodies[i];
							}
							while (i--) {
								insert(bodies[i], root);
							}
						};

					return {
						insertBodies: insertBodies,
						updateBodyForce: update,
						options: function(newOptions) {
							if (newOptions) {
								if (typeof newOptions.gravity === 'number') {
									gravity = newOptions.gravity;
								}
								if (typeof newOptions.theta === 'number') {
									theta = newOptions.theta;
								}

								return this;
							}

							return {
								gravity: gravity,
								theta: theta
							};
						}
					};
				};


			}, {
				"./insertStack": 19,
				"./isSamePosition": 20,
				"./node": 21,
				"ngraph.random": 22
			}
		],
		19: [

			function(require, module, exports) {
				module.exports = InsertStack;

				/**
				 * Our implmentation of QuadTree is non-recursive (recursion handled not really
				 * well in old browsers). This data structure represent stack of elemnts
				 * which we are trying to insert into quad tree. It also avoids unnecessary
				 * memory pressue when we are adding more elements
				 */
				function InsertStack() {
					this.stack = [];
					this.popIdx = 0;
				}

				InsertStack.prototype = {
					isEmpty: function() {
						return this.popIdx === 0;
					},
					push: function(node, body) {
						var item = this.stack[this.popIdx];
						if (!item) {
							// we are trying to avoid memory pressue: create new element
							// only when absolutely necessary
							this.stack[this.popIdx] = new InsertStackElement(node, body);
						} else {
							item.node = node;
							item.body = body;
						}
						++this.popIdx;
					},
					pop: function() {
						if (this.popIdx > 0) {
							return this.stack[--this.popIdx];
						}
					},
					reset: function() {
						this.popIdx = 0;
					}
				};

				function InsertStackElement(node, body) {
					this.node = node; // QuadTree node
					this.body = body; // physical body which needs to be inserted to node
				}

			}, {}
		],
		20: [

			function(require, module, exports) {
				module.exports = function isSamePosition(point1, point2) {
					var dx = Math.abs(point1.x - point2.x);
					var dy = Math.abs(point1.y - point2.y);

					return (dx < 1e-8 && dy < 1e-8);
				};

			}, {}
		],
		21: [

			function(require, module, exports) {
				/**
				 * Internal data structure to represent 2D QuadTree node
				 */
				module.exports = function Node() {
					// body stored inside this node. In quad tree only leaf nodes (by construction)
					// contain boides:
					this.body = null;

					// Child nodes are stored in quads. Each quad is presented by number:
					// 0 | 1
					// -----
					// 2 | 3
					this.quads = [];

					// Total mass of current node
					this.mass = 0;

					// Center of mass coordinates
					this.massX = 0;
					this.massY = 0;

					// bounding box coordinates
					this.left = 0;
					this.top = 0;
					this.bottom = 0;
					this.right = 0;

					// Node is internal when it is not a leaf
					
					
					this.isInternal = false;
				};

			}, {}
		],
		22: [

			function(require, module, exports) {
				module.exports = require(8)
			}, {}
		],
		23: [

			function(require, module, exports) {
				var NODE_WIDTH = 10;

				module.exports = function(graph, layout) {
				
					ngraph.name="canvas";
				
					var width = $("#graph").width(),
						height = $("#graph").height();

					//var stage = new PIXI.Stage(0xededed, true);
					var stage = new PIXI.Stage(0xffffff, true);
					var renderer = new PIXI.CanvasRenderer(width * window.devicePixelRatio, height * window.devicePixelRatio, null, false, false);
					//var renderer = PIXI.autoDetectRenderer(width * window.devicePixelRatio, height * window.devicePixelRatio, null, true, false);
					console.log(renderer);
					renderer.view.style.display = "none";
					renderer.view.style.width = width + 'px';
					renderer.view.style.height = height + 'px';
					
					
					$("#graph").append(renderer.view);
					
					var ctx=renderer.view.getContext("2d");
					ctx.fillStyle="#FFFFFF";
					ctx.fillRect(0,0,width * window.devicePixelRatio, height * window.devicePixelRatio);
					
					
					ngraph.toggleRenderer = function(active)
						{
						if(active)
							{
							$(renderer.view).show();
							}
						else
							{
							$(renderer.view).hide();
							}
						}
					
					var graphics = new PIXI.Graphics();
					graphics.position.x = Math.round(width * window.devicePixelRatio / 2);
					graphics.position.y = Math.round(height * window.devicePixelRatio / 2);
					graphics.scale.x = 0.1 * window.devicePixelRatio;
					graphics.scale.y = 0.1 * window.devicePixelRatio;
					stage.addChild(graphics);
					
					
					ngraph.renderer = renderer;
					ngraph.stage    = stage;
					ngraph.graphics = graphics;
					ngraph.layout   = layout;
					

					// Default callbacks to build/render nodes
					var nodeUIBuilder = defaultCreateNodeUI,
						nodeRenderer = defaultNodeRenderer,
						linkUIBuilder = defaultCreateLinkUI,
						linkRenderer = defaultLinkRenderer;

					// Storage for UI of nodes/links:
					var nodeUI = {}, linkUI = {};


					graph.forEachNode(initNode);
					graph.forEachLink(initLink);

					listenToGraphEvents();

					//setTimeout(function(){ngraph.renderGraphFrame()}, 10);
					return {
						renderFrame: function(step) 
							{
							if(!suspended && currentview == "graph")
								{
								var totalmovement = layout.step();
								var staticstatus = totalmovement  < graphsettings.staticDelta;
								if(staticstatus)
									{
									staticcount++;
									}
								else
									staticcount = 0;
								
								if(staticcount > graphsettings.staticCount)
									{
									console.log("suspended");
									suspended   = true;
									//renderer.render(stage);
									ngraph.exportImage();
									}
								}
							drawGraph();
							renderer.render(stage);
							},

						createNodeUI: function(createNodeUICallback) {
							nodeUI = {};
							supernodeUI = nodeUI;
							nodeUIBuilder = createNodeUICallback;
							graph.forEachNode(initNode);
							return this;
						},

						renderNode: function(renderNodeCallback) {
							nodeRenderer = renderNodeCallback;
							return this;
						},

						createLinkUI: function(createLinkUICallback) {
							linkUI = {};
							superlinkUI = linkUI;
							linkUIBuilder = createLinkUICallback;
							graph.forEachLink(initLink);
							return this;
						},

						renderLink: function(renderLinkCallback) {
							linkRenderer = renderLinkCallback;
							return this;
						},

						domContainer: renderer.view,
						graphGraphics: graphics,
						stage: stage,
						getNodeAt: getNodeAt,
						getLinkAt: getLinkAt,
						linkUI:linkUI,
						nodeUI:nodeUI,
					};

					function drawGraph() {
						graphics.clear();
						//renderAttractors(graphics);
						renderTreeLimits(graphics);
						
						renderCanvasLoader(graphics);
						
						Object.keys(linkUI).forEach(renderLink);

						
						renderPath(graphics);
						renderPing(graphics);
						
						
						Object.keys(nodeUI).forEach(renderNode);
						
						

					}

					function renderLink(linkId) {
						linkRenderer(linkUI[linkId], graphics);
					}

					function renderNode(nodeId) {
						nodeRenderer(nodeUI[nodeId], graphics);
					}

					function initNode(node) {
						var ui = nodeUIBuilder(node);
						// augment it with position data:
						ui.pos = layout.getNodePosition(node.id);
						// and store for subsequent use:
						nodeUI[node.id] = ui;
					}

					function initLink(link) {
						var ui = linkUIBuilder(link);
						ui.from = layout.getNodePosition(link.fromId);
						ui.to = layout.getNodePosition(link.toId);
						linkUI[link.id] = ui;
					}

					function defaultCreateNodeUI(node) {
						return {};
					}

					function defaultCreateLinkUI(link) {
						return {};
					}

					function defaultNodeRenderer(node) {
						var x = node.pos.x - NODE_WIDTH / 2,
							y = node.pos.y - NODE_WIDTH / 2;

						graphics.beginFill(0xFF3300);

						graphics.drawRect(x, y, NODE_WIDTH, NODE_WIDTH);
					}

					function defaultLinkRenderer(link) {
						graphics.lineStyle(1, 0xcccccc, 1);
						graphics.moveTo(link.from.x, link.from.y);
						graphics.lineTo(link.to.x, link.to.y);
					}

					function getNodeAt(x, y) {
						var half = NODE_WIDTH / 2;
						// currently it's a linear search, but nothing stops us from refactoring
						// this into spatial lookup data structure in future:
						for (var nodeId in nodeUI) {
							if (nodeUI.hasOwnProperty(nodeId)) {
								var node = nodeUI[nodeId];
								var pos = node.pos;
								var width = (node.width * (1+graphsettings.overEnlarge)) || NODE_WIDTH;
								var insideNode = pos.x - width < x && x < pos.x + width &&
									pos.y - width < y && y < pos.y + width;

								if (insideNode) {
									return graph.getNode(nodeId);
								}
							}
						}
					}

					function getLinkAt(x, y) {
					
						var half = NODE_WIDTH / 2;
						var found = null;
						for (var linkID in linkUI)
							{
							var link = linkUI[linkID];
							link.over=false;
							if(!found)
								{
								var distance=distToSegment({x:x,y:y},link.from,link.to) * ngraph.graphics.scale.x;
								if( distance<10*window.devicePixelRatio && 
									!(link.fromNode.data.hidden || link.fromNode.data.hidden_collapse) &&
									!(link.toNode.data.hidden || link.toNode.data.hidden_collapse))
									{
									link.over = true;
									found=link;
									}
								}
							}
						if(!found && edgeText)
							{
							edgeText.ctx.removeChild(edgeText.text);
							edgeText.text.destroy(true);
							edgeText.text = null;
							edgeText = null;
							}
						return found
					}
					function listenToGraphEvents() {
						graph.on('changed', onGraphChanged);
					}

					function onGraphChanged(changes) {
						for (var i = 0; i < changes.length; ++i) {
							var change = changes[i];
							if (change.changeType === 'add') {
								if (change.node) {
									initNode(change.node);
								}
								if (change.link) {
									initLink(change.link);
								}
							} else if (change.changeType === 'remove') {
								if (change.node) {
									delete nodeUI[change.node.id];
								}
								if (change.link) {
									delete linkUI[change.link.id];
								}
							}
						}
					}
				}

			}, {}
		]
	}, {}, [2])
	(2)
});


ngraph.resumeForce = function()
	{
	suspended   = false;
	staticcount = 0;
	}