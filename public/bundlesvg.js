selectedNode = [];

svggraph = new function()
	{
	var me = this;
	
	
	this.name="svg";
	
	this.toggleRenderer = function(active)
		{
		if(active)
			{
			$("#svgcontainer").show();
			$(".summaryzer").show();
			}
		else
			{
			$("#svgcontainer").hide();
			$(".summaryzer").hide();
			}
		}
	
	this.graphics =
		{
		position:{},
		scale:{}
		}
	this.supernodeUI = {};
	this.superlinkUI = {};

	//graph.getNode
	this.getNode = function(nodeId)
		{
		return me.nodemap[nodeId];
		}
	this.nodeGlobalPosition = function(graphid)
		{
		
		}
	this.main = function()
		{
		var summaryzer = $('<div class="summaryzer" data-placement="right" data-original-title="Summary"><i class="fa fa-2x fa-lightbulb-o"></i></div>')

		$("#historyslider").append(summaryzer);
		summaryzer.hide();
		summaryzer.on("click",me.synthesis);
		
		this.m = [20, 120, 80, 30],
	    this.w = $("#graph").width() - this.m[1] - this.m[3],
	    this.h = $("#graph").height() - this.m[0] - this.m[2],
	    this.i = 0,
	    this.root;
		this.nextnodeid=0;
		
		this.summary = false;
		
		this.tree = d3.layout.tree()
			.nodeSize([20,300])
		    //.size([this.h, this.w]);
	
		this.diagonal = d3.svg.diagonal()
		    .projection(function(d) { return [d.y, d.x]; });
	
		this.vis = d3.select("#graph")
			.append("div")
			.attr("id","svgcontainer")
			.attr("class","scrollable")
			.append("svg:svg")
		    .attr("width", this.w + this.m[1] + this.m[3])
		    .attr("height", this.h + this.m[0] + this.m[2])
				.append("svg:g")
				.attr("class","container")
				.attr("transform", "translate(" + this.m[3] + "," + this.m[0] + ")")
			.on("mousemove",function()
				{
				
				});
		$("#svgcontainer").hide();	
		this.mainnode=this.vis.append("svg:circle")
		    .attr("r", 10)
		    .style("stroke", "#999")
		    .style("fill", "#aaa");
		
		
	
		this.selectionline=this.vis.append("path")
				.attr("stroke","black")
				.attr("fill","transparent")
				.attr("stroke-width",2)
				.attr("vector-effect","non-scaling-stroke")
				.attr("pointer-events","none")


		}
	this.lineFunction=function(data)
		{
		var line="";
		
		for(var id=0;id<(data.length-1);id++)
			{
			var p1={y:data[id].x,x:data[id].y,r:data[id].r};
			var p2={y:data[id+1].x,x:data[id+1].y,r:data[id+1].r};
			var dx=p2.x-p1.x;
			var dy=-(p2.y-p1.y);
			var sign=dx>0 ? 1 : -1;
			var angle=Math.atan(dy/dx);

			var x1=p1.x+p1.r*sign*Math.cos(angle);
			var y1=p1.y-p1.r*sign*Math.sin(angle);

			var x2=p2.x-p2.r*sign*Math.cos(angle);
			var y2=p2.y+p2.r*sign*Math.sin(angle);
			line+=" M "+x1+" "+y1+" L "+x2+" "+y2;
			}
console.log(data,line)
		return line;
		};	
	this.synthesis=function()
		{
		console.log("SUMMMARIZING,",me.summary);
		if(me.summary)
			{
			me.update(me.root,me.root)
			}
		else
			{
			var synthesys = $.extend({},me.root);
			synthesys.expanded=true;
			
			
			me.dosynthesys(synthesys);
			
			console.log(synthesys);
			me.update(synthesys,synthesys);
			}
		me.summary = !me.summary;
		}

	this.dosynthesys=function(node)
		{
		node.parent = null;
		if(node.expanded)
			{
			if(node.children)
				{
				var newchildren = [];
				for(var x=0;x<node.children.length;x++)
					{
					var clone = $.extend({},node.children[x]);
					if(me.dosynthesys(clone))
						{
						newchildren.push(clone)
						}
					}
				node.children = newchildren;
				}
			return true;
			}
		else
			{
			return false;
			}
		
		}
	this.update = function(source,data,scroll) 
		{
		var duration = d3.event && d3.event.altKey ? 5000 : 500;

		me.selectionline
			.datum(selectedNode)
			.attr("d",me.lineFunction)
			.style("display",function(){return selectedNode.length>0 ? "block" : "none"});
		
  		
  		//var maxY = Math.max(me.calcMinHeight(),me.h);

		   // .size([maxY, this.w]);
  		// Normalize for fixed-depth.
  		//var maxX = me.w + me.m[1] + me.m[3];
  		
  		
  		// Compute the new tree layout.
  		var nodes = me.tree
  			.nodes(data)
  		me.tree
  			.nodeSize([20,300])//.reverse();
  		supertree= me.tree;
  		superroot= me.root;
  		var minh=0;
  		var maxh=0;
  		
  		var maxX=me.w + this.m[1] + this.m[3];
  		nodes.forEach(function(d) 
  			{
  			//d.y = d.depth * 200; 
  			if((d.x)>maxh) maxh=d.x; 
  			if((d.x)<minh) minh=d.x;
  			if((d.y + 300)>maxX) maxX=d.y+300;
  			});
  		
  		if(scroll)
  			{
	  		var el = $("#svgcontainer");
	      	el.stop();
	      	console.log(el.scrollLeft(),el.scrollTop())
	      	//var left = el.scrollLeft();
	      	//var top = el.scrollTop();
	      	//el.scrollLeft(left + x);
	      	//el.scrollTop(top + y);
	      	el.animate(
            	{
				scrollLeft: source.y - 50,
                scrollTop: (source.x - minh)  - (me.m[0] + me.h/2)
            	}, 300);
	  		
  			}
  			
  			
  		var translateY = this.m[0] + Math.max(this.h/2,-minh) 
  		d3.select("#graph g.container")
  			.transition()
			.attr("transform", "translate(" + (this.m[3]) + "," + translateY + ")");
  		var maxY=Math.max(maxh-minh,me.h)
  		console.log(minh,maxh);
  		
  		d3.select("#graph svg")
  			.attr("width", maxX)
  			.attr("height", maxY + me.m[0] + me.m[2])
  		// Update the nodes…
  		var node = me.vis.selectAll("g.node")
  			.data(nodes, function(d) { return d.graphid });

  		// Enter any new nodes at the parent's previous position.
  		var nodeEnter = node.enter().append("svg:g")
  			.attr("id", function(d){ return "svgnode_"+d.graphid;})
  			.attr("class", "node")
  			.attr("transform", function(d) 
  				{ 
  				return "translate(" + source.y0 + "," + source.x0 + ")"; 
  				})
  			.on("mousedown", function(d) 
  				{
  				ignoreClick = false;
  				if(longclick)
  					{
	  				clearInterval(longclick);
	  				longclick = null;
  					}
  				longclick = setTimeout(function()
					{
					console.log("LONGCLICK");
					ignoreClick = true;
					
					var selectedNodeIdMap = selectedNode.map(function(e) { return e.graphid; });
					
					if(selectionMode && selectedNode.length && selectedNodeIdMap.indexOf(d.graphid)==-1)
						{
						// path complete !
						selectedNode.push(d)
						
						var labels=[];
						for(var x = 0;x<selectedNode.length;x++)
							{
							var node = selectedNode[x];	
							labels.push(node.data.label + "::" +node.data.isDocument);
							}
						
						startSearch(labels.join(";"),"","");
						
						selectedNode = [];
						selectionMode = false;
						}
					else if(selectedNodeIdMap.indexOf(d.graphid)>-1)
						{
						selectedNode.splice(selectedNodeIdMap.indexOf(d.graphid),1);
						if(selectedNode.length ===0)
							selectionMode = false;
						me.update(me.root,me.root);
						}
					else
						{
						selectionMode = true;
						selectedNode = [d];
						me.update(me.root,me.root);
						}
					},2000);
   				})
  			.on("click", function(d) 
  				{
  				if(longclick)
  					{
	  				clearInterval(longclick);
	  				longclick = null;
  					}
	  			if(ignoreClick)
	  				{
		  				
	  				}
	  			else
	  				{
	  				if(d.ismore)
	  					{
		  				me.showmore(d);
	  					}
	  				else
	  					{
	  					selectCard(d.id);
	  					}	
	  				if(selectionMode && !d.ismore)
	  					{
	  					var selectedNodeIdMap = selectedNode.map(function(e) { return e.graphid; });
	  					if(selectedNodeIdMap.indexOf(d.graphid)>-1)
							{
							selectedNode.splice(selectedNodeIdMap.indexOf(d.graphid),1);
							if(selectedNode.length ===0)
								selectionMode = false;
							me.update(me.root,me.root);
							}
						else
							{
							selectedNode.push(d);
							me.update(me.root,me.root);
							}
	  					}

	  				
	  				}
  				ignoreClick = false;
  				})
  			.on("dblclick", function(d) { me.toggle(d);})
  			.on("mouseover",function(d) 
  				{
  				if(!d.ismore) 
  					{
  					var offset = $(this).offset();
  					var position =  {x: offset.left + 4 , y: offset.top + 10};
  					showTooltip(d.id,position);
  					}
  				})
  			.on("mouseout", function(d) { hideTooltip(d.id);});

  		var selectedNodeIdMap = selectedNode.map(function(e) { return e.graphid; });
  		nodeEnter.append("svg:circle")
		    .attr("r", 1e-6)
		    .style("cursor","pointer")
		    .style("stroke-width",1.5)
		    .style("stroke", function(d) 
		    	{
				return d.bordercolor;
		    	})
		    .style("fill", function(d) 
		    	{
		    	return (d.isMore || d._children) ? "#fff" : d.color; });

		nodeEnter.append("svg:text")
			.attr("x",10)// function(d) { return d.children || d._children ? -10 : 10; })
			.attr("dy", ".35em")
			//.attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
			.text(function(d) 
				{
				if(d.label.length<50) 
					return d.label;
				else
					{
					return d.label.substring(0, 47)+"...";
					}
				})
			.style("cursor","pointer")
			.style("font-size",11)
			.style("fill-opacity", 1e-6);

		// Transition nodes to their new position.
		var nodeUpdate = node.transition()
			.duration(duration)
			.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

		nodeUpdate.select("circle")
			.attr("r", function(d) 
				{
				d.r = d.main ? 1e-6 : ( d.fromMore ? 7 : (d.expanded ? 8 : 4.5));
				return d.r;
				})
			.style("fill", function(d) { return d._children ? "#fff" : d.color; })
			.style("stroke", function(d) 
		    	{
				if(selectedNodeIdMap.indexOf(d.graphid)==-1)
					return d.bordercolor;
				else
					return "black";
		    	})


		var nodeUpdateMore = node.filter(function(a){return a.fromMore})
			.transition()
			.delay(duration+5000)
			.select("circle")
			.attr("r", function(d) 
				{
				d.fromMore=false;return d.main ? 1e-6 : (d.expanded ? 8 : 4.5)
				});

		nodeUpdate.select("text")
			.style("fill-opacity", 1);

		// Transition exiting nodes to the parent's new position.
		var nodeExit = node.exit().transition()
			.duration(duration)
			.attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
			.remove();

		nodeExit.select("circle")
			.attr("r", 1e-6);

		nodeExit.select("text")
			.style("fill-opacity", 1e-6);

		// Update the links…
		var link = me.vis.selectAll("path.link")
			.data(me.tree.links(nodes), function(d) { return d.target.graphid; });

		// Enter any new links at the parent's previous position.
		link.enter().insert("svg:path", "g")
			.attr("class", "link")
			.attr("stroke-width",1.5)
			.attr("stroke","#ccc")
			.attr("fill","none")
			.attr("d", function(d) 
				{
				var o = {x: source.x0, y: source.y0};
				return me.diagonal({source: o, target: o});
				})
			.on("click", function(d) 
				{
				var edge = 
					{
					fromNode:d.source,
					toNode:d.target,
					}
				openEdgeInfo(edge);
				})
			.on("mouseover",function(d)
				{
				d3.select(this)
					.attr("stroke-width",3)
				})
			.on("mouseout",function(d)
				{
				d3.select(this)
					.attr("stroke-width",1.5)
				})
			.transition()
				.duration(duration)
				.attr("d", me.diagonal);
		
		link
			.attr("stroke-width",function(d){return d.target.expanded ? 2 : 1.5})
			.attr("stroke",function(d){return d.target.expanded ? "#aaa" : "#ddd"});
			
		// Transition links to their new position.
		link.transition()
		    .duration(duration)
			.attr("d", me.diagonal);

		// Transition exiting nodes to the parent's new position.
		link.exit().transition()
			.duration(duration)
			.attr("d", function(d) 
				{
				var o = {x: source.x, y: source.y};
				return me.diagonal({source: o, target: o});
				})
			.remove();

		// Stash the old positions for transition.
		nodes.forEach(function(d) 
		  	{
		    d.x0 = d.x;
		    d.y0 = d.y;
			});
			
		setTimeout(currentRenderer.exportImage,2000);
		}
	this.showmore = function(d) 
		{
		var parent = d.parent;
		
		var oldmore = parent.children.splice(-1,1);
		
		var newmore=[];
		for(var x = 0;x<parent.more.length;x++)
			{
			var node = parent.more[x];
			if(x<10)
				{
				parent.children.push(node);
				node.fromMore=true;
				}
			else
				{
				newmore.push(node);
				}
			}
		parent.more = newmore;
		parent.children.sort(function(a,b){return a.data.sortedTopics[0].key > b.data.sortedTopics[0].key})
		
		if(parent.more.length)
			{
			parent.children.push(oldmore[0]);	
			me.nextnodeid++;
			}
		
		me.update(parent,me.root);
		}
	this.toggle = function(d) 
		{
		console.log("TOGGLE",d)
		if (d.children) 
			{
			d._children = d.children;
			d.children = null;
			}
		else 
			{
			if(d._children)
				{
				d.children = d._children;
				d._children = null;
				}
			else
				{
				me.expand(d);
				}
			}
		me.summary = false;
		me.update(d,me.root); 
		}
		
	this.doSearch = function(query,terms,sense)
		{
		//clearGraph();
		$("#exportInference").show();
		me.root=
			{
			label:"",
			x0:0,
			y0:0
			};
		me.summary = false;
		me.update(me.root,me.root);
		
		hariSearch(query,terms,sense, function(data)
			{
			centroids = {};
			for(var x=0;x<data.centroids.length;x++)
				{
				centroids[+data.centroids[x]] = x+1;
				}
			me.nodemap = {};
			supernodemap = me.nodemap;
			for(var x = 0; x<data.nodes.length;x++)
				{
				var node = data.nodes[x];
				me.nodemap[""+node.id]=
					{
					id:""+node.id,
					graphid:me.nextnodeid,
					label:node.label,
					color:colorscale(node.sortedTopics[0].key),
					bordercolor:d3.rgb(colorscale(node.sortedTopics[0].key)).darker(1),
					data:node
					};
				me.nextnodeid++;
				node2card(node);
				}
			me.root=
				{
				label : query,
				main : true,
				x0:0,
				y0:0,
				children : [],
				}
			for(var y = 0; y < data.centroids.length; y++)
				{
				var child = $.extend({},me.nodemap[""+data.centroids[y]]);
				me.nestData(child,data);
				//child.parentnode = me.root;
				child.expanded = true;
				me.root.children.push(child);
				}
			console.log(me.root);
			me.update(me.root,me.root);
			});
		}
		
	this.nestData = function(root,data)
		{		
		root.visited  = true;
		root.children = [];
		root.more = [];
		
		var nodecound=0;
		for(var x = 0; x<data.edges.length;x++)
			{
			var edge = data.edges[x];
			if(edge.visited)
				continue;
			var child = null;
			
			if(""+root.id == ""+edge.endNode)
				child = me.nodemap[""+edge.startNode];
			if(""+root.id == ""+edge.startNode)
				child = me.nodemap[""+edge.endNode];
			
			
			
			if(child && !child.data.isCentroid)
				{
				console.log(child.label,child.id,edge.id);
				
				var clone = $.extend({},child)
				clone.graphid=me.nextnodeid;
				me.nextnodeid++;
				
				if(nodecound<10)
					{
					root.children.push(clone);	
					}
				else
					{
					root.more.push(clone);
					}
				//clone.parentnode = root;
				clone.visited = true;
				edge.visited  = true;
				
				nodecound++
				}
			
			}
		root.children.sort(function(a,b){return a.data.sortedTopics[0].key > b.data.sortedTopics[0].key})
		if(root.more.length)
			{
			root.children.push(
				{
				graphid : me.nextnodeid,
				ismore    : true,
				label   : "More..."
				});	
			me.nextnodeid++;
			}
		return root;
		}
	this.expand = function(d)
		{
		if(d.expanded)
			return;
		else
			{
			d.expanded=true;
			hariExplore(d.id,d)
			}
		
		}
	this.addNodes = function(mainId,data,backnode)
		{
		console.log(backnode);
		for(var x = 0; x<data.nodes.length;x++)
			{
			var node = data.nodes[x];
			if(!me.nodemap[""+node.id])
				{
				me.nodemap[""+node.id]=
					{
					id:""+node.id,
					graphid:me.nextnodeid,
					label:node.label,
					color:colorscale(node.sortedTopics[0].key),
					bordercolor:d3.rgb(colorscale(node.sortedTopics[0].key)).darker(1),
					data:node
					};	
				me.nextnodeid++;
				node2card(node);
				}
			}
		me.nestData(backnode,data);
		backnode.expanded=true;
		console.log(backnode);
		me.summary = false;
		me.update(backnode,me.root,true); 
		}
	this.calcMinHeight = function()
		{
		var heights = {};
			
		var recursion = function(node)
			{
			if (heights[node.depth])
				heights[node.depth]++;
			else
				heights[node.depth]=1;

			if(node.children && node.children.length)
				{
				for(var x = 0; x<node.children.length; x++)
					{
					recursion(node.children[x]);
					}
				}
			}
		
		recursion(me.root);
		
		var max = 0;
		for(var key in heights)
			{
			if(heights[key]>max)
				max = heights[key];
			}
		return max*20;
		}

	this.removeNodes = function(id)
		{
		me.recursiveremove(me.root,id)
		me.update(me.root,me.root);
		
		delete me.nodemap[id];
		}
	this.recursiveremove = function(node,id)
		{
		var keys=["children","_children","more"];
		for(var x=0;x<keys.length;x++)
			{
			var key=keys[x];
			if(node[key])
				for(var y=0; y<node[key].length;y++)
					{
					if(node[key][y].id==id)
						{
						node[key].splice(y,1);
						x--;
						}
					else
						{
						me.recursiveremove(node[key][y],id);
						}	
					}
			}
		
		}
		
	this.exportImage = function()
		{
		
		var originalsvg = $("#graph .container");
		var sizing = originalsvg[0].getBBox();
		var w = sizing.width;
		var h = sizing.height;
	
		var svg=originalsvg.clone()[0];
		$(svg).find("*").removeAttr("id")
		$(svg).find("text")
			.attr("font-size",12+"px")
			.attr("filter","");
		
		$(svg).attr("transform","translate("+ (-sizing.x +10)+","+(-sizing.y + 10)+")scale(1)");
	
		// Extract the data as SVG text string
		var svg_xml = (new XMLSerializer()).serializeToString(svg);
		//console.log(svg_xml);
		var canvas = document.getElementById("svg-canvas");
		var context=canvas.getContext("2d");
		context.font = '10pt Arial';
		context.fillStyle = "white";
		context.fillRect(0,0,w+20,h+20);
	
		$("#svg-canvas").attr("width",sizing.width+20);
		$("#svg-canvas").attr("height",sizing.height+20);
	
		canvg(canvas,svg_xml);
	
		var compositeOperation = context.globalCompositeOperation;
		context.globalCompositeOperation = "destination-over";
	
		var HDImage = canvas.toDataURL('image/png');
		var LDImage = canvas.toDataURL('image/png',0.1);
		context.globalCompositeOperation = compositeOperation;
		
		
		$('#hdimg' + currentStateindex).attr('src', HDImage);
		$('#ldimg' + currentStateindex).attr('src', LDImage);
		}
	
	this.saveGraph  = function(currentState)
		{
		if(me.root)
			{
			me.removeBackRef(me.root);
			}
		currentState.nextnodeid = me.nextnodeid;
		currentState.nodemap    = me.nodemap;
		currentState.root       = me.root;
		}
	this.restoreGraph = function(saveData)
		{
		me.nextnodeid = saveData.nextnodeid;
		me.nodemap    = saveData.nodemap;
		me.root       = saveData.root;
		me.update(me.root,me.root,true);
		}
	this.removeBackRef = function(node)
		{
		console.log(node);
		delete node.parent;
		if(node.more)
			for(var x = 0;x<node.more.length;x++)
				{
				var subnode = node.more[x];
				me.removeBackRef(subnode);
				}
		if(node.children)
			for(var x = 0;x<node.children.length;x++)
				{
				var subnode = node.children[x];
				me.removeBackRef(subnode);
				}
		if(node._children)
			for(var x = 0;x<node.more.length;x++)
				{
				var subnode = node._children[x];
				me.removeBackRef(subnode);
				}
		}
	this.addNewNodes = function(newdata,nodePos)
		{
			
		}
		
	
	
	
	this.clearGraph = function()
		{
			
		}
		
	
	this.goToNode   = function(nodeId)
		{
			
		}
		
	}

	

	

