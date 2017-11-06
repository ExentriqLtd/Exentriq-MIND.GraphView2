var tooltipnode = {};
var tooltipstatus = false;
var dx = 0,
	dy = 0;

function showTooltip(nodeId,position)
	{
	if(!position)
   	 	position = currentRenderer.nodeGlobalPosition(nodeId);
	if (tooltipnode.id != nodeId)
		{
		if(tooltipnode.id)
			{
		 	//tooltipnode.data.hidden_collapse = tooltipnode.data._hidden_collapse;
			//tooltipnode.data.hidden = tooltipnode.data._hidden;	
			}
		
		
		setTooltip(nodeId);
		tooltipnode = currentRenderer.getNode(nodeId);
		
		tooltipnode.data._hidden_collapse = tooltipnode.data.hidden_collapse;
		tooltipnode.data._hidden = tooltipnode.data.hidden;
		tooltipnode.data.hidden = false;
		tooltipnode.data.hidden_collapse = false;
		
		
		}
	
	if(currentRenderer.name == "canvas")
		{
		var node = currentRenderer.getNode(nodeId);
		dy = $("#tooltip").outerHeight()  + ((1+graphsettings.overEnlarge)*node.nodeUI.width*ngraph.graphics.scale.x/window.devicePixelRatio);
		}
	
	/*$("#tooltip")
		.css(
			{
			top: position.y - dy ,
			left: position.x - dx
			})
		.addClass("show");*/
	}

function hideTooltip()
	{
	$("#tooltip").removeClass("show");
	}

function setTooltip(nodeId)
	{
	var node = currentRenderer.getNode(nodeId);
	var data = node.data;
	var tooltip = "<p class=\"node_label\">" + truncateTitle(data.label,80,true) + "</p>";

	$("#tooltip .tipsy-inner").html(tooltip);
	
	$("#tooltip .tipsy-inner").append(topicTooltipMaker( nodeId));
	if(currentview == "graph")
   		$("#tooltip .tipsy-inner").append(actionTooltipMaker(nodeId));
	dx = $("#tooltip").outerWidth() / 2;
	dy = $("#tooltip").outerHeight() + 5;
	if(currentRenderer.name == "canvas")
		{
		dy = $("#tooltip").outerHeight()  + node.nodeUI.width*ngraph.graphics.scale.x/window.devicePixelRatio //* nodeLabel(node,true);
		}
	}

function topicTooltipMaker(nodeId)
	{
	var node = currentRenderer.getNode(nodeId);
	var data = node.data;
	/*
	var topicTooltip = "<ul class=\"node_topics\">"

	for(var x=0;x<data.sortedTopics.length;x++)
		{
		var key = data.sortedTopics[x].key;
		topicTooltip+="<li style=\"background:"+colorscale(key)+";\">"+key.toUpperCase()+"</li>";
		}
	topicTooltip += "</ul>";
	return topicTooltip;
	*/
	var topicblock = $("<div class=\"topicbars\"></div>");
	var maintopics = {};
	for(var x=0; x<data.sortedTopics.length; x++ )
		{
		var maintopic = data.sortedTopics[x].key.toUpperCase().split("/")[0];
		
		maintopics[maintopic] = (maintopics[maintopic] || 0) + data.sortedTopics[x].value;
		}
	var topiclist = $.map(maintopics, function(value, index) {return [{key:index,value:value}];});
	topiclist.sort(function(a,b){return b.value-a.value});
	

	for(var x=0; x<topiclist.length; x++ )
		{
		var topic = topiclist[x];
		var newblock=$("<div></div>");
		newblock.css(
			{
			display:"inline-block",
			height:7,
			width : Math.floor(100*topic.value/data.totalTopics)+"%",
			background: colorscale(topic.key)
			});
		newblock.attr("data-original-title",topic.key);
		topicblock.append(newblock);
		}
	return topicblock;
	}

function actionTooltipMaker(nodeId)
	{
	var node = currentRenderer.getNode(nodeId);
	var data = node.data;
	var actionTooltip = '<div class="tooltipaction" data-nodeid="'+nodeId+'">';
	
	if(!node.data.expanded)
		actionTooltip += '<a class="explore" data-original-title="EXPLORE"><i class="fa fa-sitemap"></i></a>';
	else
		{
		if(node.data.collapsed)
			actionTooltip += '<a class="explore" data-original-title="EXPAND"><i class="fa fa-expand"></i></a>';
		else
			actionTooltip += '<a class="explore" data-original-title="COLLAPSE"><i class="fa fa-compress"></i></a>';
		}
	
		
	actionTooltip += '<a class="remove" data-original-title="HIDE"><i class="fa fa-eye-slash"></i></a>';
	actionTooltip += '<a class="ban" data-original-title="MARK AS IRRELEVANT"><i class="fa fa-ban"></i></a>';
	
	if(selectionMode)
		{
		if(selectedNode.indexOf(nodeId)>-1)
			{
			actionTooltip += '<a class="pathaction removepath" data-original-title="REMOVE FROM PATH"><i class="fa fa-minus-square-o"></i></a>';
			}
		else
			{
			actionTooltip += '<a class="pathaction addpath" data-original-title="ADD HOP"><i class="fa fa-plus-square-o"></i></a>';
			}
		actionTooltip += '<a class="pathaction endpath" data-original-title="END MULTI-HOP CONNECTION"><i class="fa fa-sign-in"></i></a>';	
		}
	else
		{
		actionTooltip += '<a class="pathaction startpath" data-original-title="START MULTI-HOP CONNECTION"><i class="fa fa-sign-out"></i></a>';
		}
		
	actionTooltip += "</div>";
	return actionTooltip;
	}
function updateTooltip(nodeId)
	{
	$(".tooltip").remove();
	
	console.log(nodeId);

	var node = nodeId ? currentRenderer.getNode(nodeId) : tooltipnode;
	if(!node || !node.id)
		return;
	var exploreAction = ""
	if(!node.data.expanded)
		exploreAction = '<a class="explore" data-original-title="EXPLORE"><i class="fa fa-sitemap"></i></a>';
	else
		{
		if(node.data.collapsed)
			exploreAction = '<a class="explore" data-original-title="EXPAND"><i class="fa fa-expand"></i></a>';
		else
			exploreAction = '<a class="explore" data-original-title="COLLAPSE"><i class="fa fa-compress"></i></a>';
		}
	$("#tooltip .explore").replaceWith(exploreAction);
	
	
	var pathaction = "";
	$("#tooltip .pathaction").remove()
	if(selectionMode)
		{
		if(selectedNode.indexOf(nodeId)>-1)
			{
			pathaction = '<a class="pathaction removepath" data-original-title="REMOVE FROM PATH"><i class="fa fa-minus-square-o"></i></a>';
			}
		else
			{
			pathaction = '<a class="pathaction addpath" data-original-title="ADD HOP"><i class="fa fa-plus-square-o"></i></a>';
			}
		pathaction += '<a class="pathaction endpath" data-original-title="END MULTI-HOP CONNECTION"><i class="fa fa-sign-in"></i></a>';	
		}
	else
		{
		pathaction = '<a class="pathaction startpath" data-original-title="START MULTI-HOP CONNECTION"><i class="fa fa-sign-out"></i></a>';
		}
	$("#tooltip .tooltipaction").append(pathaction);
	}
$(document).ready(function()
	{
	$("body").on("click", ".tooltipaction .explore", function()
		{
		$(".tooltip").remove();
		hideTooltip();
		var nodeId = +$(this).parents(".tooltipaction").attr("data-nodeid");
		tooltipnode = {};
		currentRenderer.toggleNode(nodeId);
		});
	$("body").on("click", ".tooltipaction .remove", function()
		{
		$(".tooltip").remove();
		hideTooltip();
		var nodeId = +$(this).parents(".tooltipaction").attr("data-nodeid");
		currentRenderer.removeNodes(nodeId);
		$("#"+nodeId).remove();
		overCard = null;
		});
	$("body").on("click", ".tooltipaction .ban", function()
		{
		$(".tooltip").remove();
		hideTooltip();
		var nodeId = +$(this).parents(".tooltipaction").attr("data-nodeid");
		hariRemoveModal(nodeId);
		});
	 $("body").on("click", ".tooltipaction .startpath", function()
		{
		$(".tooltip").remove();
		//hideTooltip();
		
		var nodeId = +$(this).parents(".tooltipaction").attr("data-nodeid");
		
		selectionMode = true;
		selectedNode = [nodeId];
		
		updateTooltip(nodeId);
		});
	$("body").on("click", ".tooltipaction .addpath", function()
		{
		$(".tooltip").remove();
		var nodeId = +$(this).parents(".tooltipaction").attr("data-nodeid");
		
		if(selectedNode.indexOf(nodeId) == -1)
			{
			selectedNode.push(nodeId);
			}
			
		updateTooltip(nodeId);
		});
	$("body").on("click", ".tooltipaction .removepath", function()
		{
		$(".tooltip").remove();
		var nodeId = +$(this).parents(".tooltipaction").attr("data-nodeid");
		
		if(selectedNode.indexOf(nodeId) > -1)
			{
			selectedNode.splice(selectedNode.indexOf(nodeId),1);
			if(selectedNode.length ===0)
				selectionMode = false;
			}
			
		updateTooltip(nodeId);
		});
	$("body").on("click", ".tooltipaction .endpath", function()
		{
		$(".tooltip").remove();
		hideTooltip();
		var nodeId = +$(this).parents(".tooltipaction").attr("data-nodeid");

		if(selectedNode.indexOf(nodeId) == -1)
			{
			selectedNode.push(nodeId);
			}
		
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
		
		
		selectedNode = [];
		selectionMode = false;
		});
	});


