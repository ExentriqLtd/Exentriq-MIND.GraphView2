

$(document).ready(function()
	{
	$("#exportInference").on("click",exportInference);
	
	$("#history").on("click",".state",function(e)
		{
		$("#disambiguation").removeClass("open");
		saveState(currentStateindex);
		$(".state.selected").removeClass("selected");
		$(this).addClass("selected");
		var stateid=+$(this).data("stateid");
		if(currentStateindex != stateid)
			{
			loadState(stateid);	
			}
		
		});

	$("#history").on("click",".state .remove",function(e)
		{
		e.preventDefault();
		e.stopPropagation();
		$(this).parent();
		var state= $(this).parent();
		var stateid = +state.data("stateid");
		state.remove();
		saveStates[stateid]={};
		
		$("#inference_"+stateid).remove();
		
		$(".tooltip").remove();
		});
	});

function exportInference()
	{
	$("#loader").show();
	currentRenderer.exportImage();
	
	var pathsplitted=location.href.split("/");
	pathsplitted.pop()
	var basepath = pathsplitted.join("/");
	var contents = fasttemplater.compile(
		"bookmarks_main",
		{
		origin   : location.origin,
		basepath : basepath,
		body     : window.document.getElementById('inferencepanel').innerHTML,
		random   : Math.floor(Math.random()*1000000),
		});
	$("#loader").hide();
	
	
	var exportwindow = window.open();
	exportwindow.document.write(contents);
	
	}
bookmarklist={};
function addRef(url)
	{
	$("#referencecontainer_" + currentStateindex).show();
	var reflink = $("#references_"+currentStateindex+" a[href='"+url+"']");
	if(reflink.length >0)
		{
		return +reflink.attr("data-refid");	
		}
	else
		{
		var refid = currentref;
		currentref++;
		
		var contents = fasttemplater.compile(
			"bookmarks_ref",
			{
			refid : refid,
			url: url
			});
		$("#references_" + currentStateindex).append(contents);
		return refid;
		}
	}
function addNodeBookmark(nodeId,title,url,text,thumbnail)
	{
	$("#bookmarkscontainer_" + currentStateindex).show();
	if(nodeId && !bookmarklist[nodeId])
		{
		bookmarklist[nodeId] = currentref;
		var stepid = id2step[+nodeId];
		console.log(stepid,step2id[stepid])
		if(!stepid || step2id[stepid].action == "results")
			{
			setNodeStep(+nodeId,stepindex,"bookmark");
			stepindex++;
			}
		}
	
	var refid = addRef(url);
	
	var topic = currentsearchdata.sense !== "" ? "contextualized in the domain "+currentsearchdata.sense : ""
	var contents = fasttemplater.compile(
		"bookmarks_node",
		{
		title : title,
		url: url,
		text:text,
		refid:refid,
		topic:topic,
		thumbnail : thumbnail,
		class : thumbnail ? "node-full" : "node-text"
		});
	console.log(contents);
	$("#bookmarks_" + currentStateindex).append(contents);
	
	if(currentview == "tree")
		{
		updateTree()
		}
	}

function addNodeMediaBookmark(nodeId,title,url,text,thumbnail)
	{
	$("#bookmarkscontainer_" + currentStateindex).show();
	var container = $("#"+currentStateindex+"_node_"+nodeId);
	if(container.length ==0)
		{
		$("#"+nodeId).find(".bookmark").trigger("click");
		container = $("#"+currentStateindex+"_node_"+nodeId);
		}
	var refid = addRef(url);
	var contents = fasttemplater.compile(
		"bookmarks_edge_sentence",
		{
		title : title,
		url: url,
		text:text,
		refid:refid
		});	
	container.find(".external_list").append(contents);
	container.find(".external_list").show();
	container.find(".external_title").show();
	}
function addEdgeBookmark(edge,title,url,text)
	{
	$("#bookmarkscontainer_" + currentStateindex).show();
	var fromurl="http://en.m.wikipedia.org/wiki/" + edge.fromNode.data.label.replace(/ /,"_");
	var fromuri=edge.fromNode.data.articleUri;
	if(fromuri && fromuri.indexOf("hw:")===0)
		fromurl = location.origin +  endpoints.documentreader + encodeURIComponent(endpoints.documentextractor + fromuri);
	var fromref=addRef(fromurl);
	var fromthumb = $("#"+edge.fromNode.data.id+" .thumb").attr("data-thumb");
	
	var tourl="http://en.m.wikipedia.org/wiki/" + edge.toNode.data.label.replace(/ /,"_");
	var touri=edge.toNode.data.articleUri;
	if(touri && touri.indexOf("hw:")===0)
		tourl = location.origin + endpoints.documentreader + encodeURIComponent(endpoints.documentextractor + touri);
	var toref=addRef(tourl);
	var tothumb = $("#"+edge.toNode.data.id+" .thumb").attr("data-thumb");
	
	
	var edgeid = currentStateindex + "__" + edge.fromNode.data.id + "__" + edge.toNode.data.id;
	var container = $("#"+edgeid);

	if(container.length === 0)
		{
		var newblock = fasttemplater.compile(
			"bookmarks_edge_block",
			{
			edgeid : edgeid,
			fromlabel:edge.fromNode.data.label,
			fromurl:fromurl,
			fromref:fromref,
			fromthumb:fromthumb,
			fromclass: fromthumb ? "node-left" : "",
			
			tolabel:edge.toNode.data.label,
			tourl:tourl,
			toref:toref,
			tothumb:tothumb,
			toclass: tothumb ? "node-right" : "",
			});	
		$("#bookmarks_" + currentStateindex)
			.append(newblock);
		container = $("#"+edgeid);
		}
	
	var refid = addRef(url);
	var contents = fasttemplater.compile(
		"bookmarks_edge_sentence",
		{
		title : title,
		url: url,
		text:text,
		refid:refid
		});	
	container.find(".sentence_list").append(contents);


	$("#bookmarks_edges_" + currentStateindex).show();

	return;
	
	}

function newGraphTab(title)
	{
	currentStateindex = nextStateindex;
	nextStateindex++;
	if(currentStateindex>0)
		{
		currentRenderer.exportImage();
		}
		
	var bookmarksBlock=fasttemplater.compile(
		"bookmarks_block",
		{
		title    : title,
		graphTab : currentStateindex		
		});
		
	var historystate = '<div id="state{{graphTab}}" data-stateid="{{graphTab}}" data-placement="left" class="state selected"><img id="ldimg{{graphTab}}"></img><i data-original-title="Remove State" class="fa fa-times remove"></i></div>'


	$(".state.selected").removeClass("selected");
	$("#inferencepanel").append(bookmarksBlock);
	$("#history").append(historystate.replace(/\{\{graphTab\}\}/g,currentStateindex));

	/*
	$("#remove-" + nextTab).click(me.removeTab);
	$("#svg-img" + nextTab).click(me.switchHandler);
	$("#histotab_" + nextTab).draggable(
		{
		axis:"y",
		opacity: 0.7,
		helper: "clone"
		});
	$("#histotab_" + nextTab).droppable(
		{
		hoverClass: "dropping",
		drop: function( event, ui )
			{
			var from=+$( this ).attr("itemId");
			var to=+ ui.draggable.attr("itemId");
			console.log(from,to)
			me.mergedata(from,to);
			}
		});

	*/
	};