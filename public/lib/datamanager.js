haridata = {};
lookupterms	  = {};

currentSearch="";
currentEdge="";
currentInfo="";
currentInfoID="";
overCard = null;

initialSearch = true;
breadcrumbs = [];
saveStates	= [];

currentStateindex = 0;
nextStateindex = 0;
currentref = 1;

currentsearchdata = null;

attractors = {};

requests = {};

stepindex = 0;
id2step = {};
step2id = [];


addloader = null;
currentview = "graph";

mouseroveredge=false;

function saveState(index)
	{

	var currentState =
		{
		id2step : id2step,
		step2id : step2id,
		stepindex : stepindex,
		oldstatus : oldstatus,
		currentview : currentview,

		renderer : currentRenderer.name,

		breadcrumbs:breadcrumbs,
		colorindex : colorindex,
		idlist:idlist,
		next:next,
		maintopics : maintopics,
		topiclist:topiclist,
		haridata:haridata,
		currentSearch:currentSearch,
		currentEdge:currentEdge,
		currentInfo:currentInfo,
		currentInfoID:currentInfoID,
		currentref : currentref,

		currentsearchdata : currentsearchdata,

		bookmarklist:bookmarklist,
		lookupterms:lookupterms,

		cards : $("#cardcontainer").html(),
		cardsScroll : $('#cardcontainer').scrollTop(),

		positionx :currentRenderer.graphics.position.x,
		positiony :currentRenderer.graphics.position.y,

		scalex : currentRenderer.graphics.scale.x,
		scaley : currentRenderer.graphics.scale.y,

		attractors :attractors,


		}
	currentRenderer.saveGraph(currentState)

	var saveState = jQuery.extend( true, {}, currentState);


	var tojson= JSON.stringify(saveState);
	sessionStorage.setItem("state_"+index, tojson);
	console.log("SAVED STATE" + index,tojson.length/1024);
	ngraph.exportImage();
	}
function loadState(index)
	{
	if(index>=0 && index < nextStateindex)
		{
		currentStateindex = index;
		hariReset();
		var saveState = JSON.parse(sessionStorage.getItem("state_"+index))

		id2step = saveState.id2step;
		step2id = saveState.step2id;
		stepindex = saveState.stepindex;
		oldstatus = saveState.oldstatus;
		currentview = saveState.currentview;


		colorindex	= saveState.colorindex;
		idlist		= saveState.idlist;
		cardlist		= saveState.cardlist;
		next			= saveState.next;
		maintopics	= saveState.maintopics;
		topiclist		= saveState.topiclist;
		haridata		= saveState.haridata;
		currentSearch = saveState.currentSearch;
		currentsearchdata = saveState.currentsearchdata;
		currentEdge	= saveState.currentEdge;
		currentInfo	= saveState.currentInfo;
		currentInfoID = saveState.currentInfoID;
		currentref	= saveState.currentref;
		bookmarklist	= saveState.bookmarklist;

		lookupterms	= saveState.lookupterms;

		attractors	= saveState.attractors;

		$("#cardcontainer").html(saveState.cards);
		$('#cardcontainer')
			.css(
				{
				scrollTop: saveState.cardsScroll
				});

		$("#searchfield").val(currentSearch);

		for(var x=0; x<saveState.breadcrumbs.length; x++)
			{
			addBreadcrumb(saveState.breadcrumbs[x].id,saveState.breadcrumbs[x].label);
			}

		if(currentview == "tree")
			{
			$("#switcher").attr("data-original-title","GRAPH VIEW");
			$("#switcher img").attr("src","img/graph-icon.png");
			}
		else
			{
			$("#switcher").attr("data-original-title","TREE VIEW");
			$("#switcher img").attr("src","img/tree-icon.png");
			}
		/*
		if(saveState.renderer != currentRenderer.name)
			{
			if(currentview == "graph")
				{
				$("#switcher").attr("data-original-title","GRAPH VIEW");
				$("#switcher").html('<img src="img/graph-icon.png"/>');
				}
			else
				{
				$("#switcher").attr("data-original-title","TREE VIEW");
				$("#switcher").html('<img src="img/tree-icon.png"/>');
				}
			treeNodePosition();
			//currentRenderer.toggleRenderer(true);
			}
		*/
		currentRenderer.restoreGraph(saveState);
		}


	}

function addBreadcrumb(id,label)
	{
	hariBreadcrumbs.addItem(label,{id:id});
	breadcrumbs.push(
		{
		id:id,
		label:label,
		});

	var tooltip = "<b>Topics : </b><ul>";

	for (var x = 0; x<breadcrumbs.length;x++)
		{
		tooltip+="<li>"+breadcrumbs[x].label+"</li>";
		}

	tooltip += "</ul>";

	$("#state"+currentStateindex).attr("data-original-title",tooltip)
	}

function hariReset()
	{
	$("#edgeclose").trigger("click");
	$("#infoclose").trigger("click");
	$("#mainmethod").trigger("click");
	hideTooltip();
	$(".tooltip").remove();
	breadcrumbs   = [];
	colorindex	   = 0;
	idlist		   = [];
	cardlist	   = [];
	next		   = 0;
	maintopics	   = {};
	enabledtopics = [];
	topiclist	   = [];
	edgetopiclist = [];
	haridata	   = {};
	currentSearch = "";
	currentEdge   = "";
	currentInfo   = "";
	currentref	   = 1;
	bookmarklist  = {};

	lookupterms   = {};
	requests = {};
	overCard = null;
	selectionMode = false;
	selectedNode=[];

	stepindex = 0;
	id2step = {};
	step2id = [];
	oldstatus = {};


	hariBreadcrumbs.resetAll();
	$("#cardcontainer").html("");

	$("#switcher").attr("data-original-title","TREE VIEW");
	$("#switcher img").attr("src","img/tree-icon.png");
	}


function startSearch(query,terms,sense,dontsave)
	{
	//history.pushState({action:"startSearch",query:query,terms:terms,sense:sense},"HARI");
	$("#exportInference,#help,#logout").fadeIn();
	$("#addnode").show();
	$("#rightbar").show();
	$("#historyslider").show();
	$("#filtercontainer").show();
	$('#searchfield').typeahead("hide");

	if(!initialSearch && !dontsave)
		{
		saveState(currentStateindex);
		}

	initialSearch = false;
	hariReset();
	currentRenderer.doSearch(query,terms,sense);
	}
function manualSearch(search,noHistory)
	{
	if(!$("#mainblocks").hasClass("fullsize"))
		{
		 $("#rightbar .toggle").trigger("click");
		}

	if(autocompleteRequest)
		{
		autocompleteRequest.abort();
		autocompleteRequest = null;
		}
	$('#searchfield').typeahead("hide");
	$("#topbar").removeClass("init");
	$("#pdfviewer").removeClass("open");
	hideTooltip();
	overCard=null;
	prevmouseover=null;
	$(".tooltip").remove()
	//$("#disambiguation").html("");

	disambiguationHari(search,"search",null,noHistory)
	}
function disambiguationHari(search,action,nodePos,noHistory)
	{
	$("#disambiguation").html("");
	var url = endpoints.disambiguation + encodeURIComponent(search);
	showBlockingLoader();
	$.getJSON(url)
		.done(function(data, textStatus, jqXHR)
			{
			if(data.length)
				{
			 	var contents = "";

			 	var categories = {};

			 	for(var x=0;x<data.length;x++)
			 		{
			 		var element = data[x];
			 		var category = element.text;

			 		var sublist=[];
			 		var subelements = ""
			 		for(var y=0;y<element.nodes.length;y++)
			 			{
			 			var nodecat = element.nodes[y].category.split("/")[1];
				  		if(sublist.indexOf(nodecat)==-1)
				  			{
					   		sublist.push(nodecat);
				  			}

					   	subelements += '<a class="disambiguationsubitem"'+
					   		' data-action="'+ action+'"'+
					   		' data-sense="' + nodecat+'"'+
					   		' data-original-title="'+element.nodes[y].label+'"'+
					   		' data-terms="'+element.nodes[y].label+'">'+
					   			element.nodes[y].label+
					   		'</a>'

			 			}
			 		var more = "";
			 		var disambiguationstyle =""
			 		if(element.nodes.length > 3)
			 			{
			 			var startstep = 0;
				  		var maxstep   = Math.ceil((element.nodes.length-3)/7);

				  		if(maxstep > 2)
				  			{
				  			startstep = 1
					  		var height = 122 + 266;
					  		disambiguationstyle = 'style="height:'+height+'px"';
				  			}
				  		more = '<div class="extenddisambiguation" data-step="'+startstep+'" data-maxstep="'+maxstep+'">MORE</div>';
			 			}
			 		var relevance = Math.round(element.score*100);
			 		contents += fasttemplater.compile(
						"disambiguation_item_"+action,
						{
						term   : search,
						label  : category,
						sense  : sublist.join(","),
						subelements : subelements,
						color : colorscale(category),
						sublist : sublist.join(",") || "&nbsp;",
						more : more,
						disambiguationstyle:disambiguationstyle
						});
			 		}

			 	if(data.length == 1)
			 		{
			 		$("#disambiguation").removeClass("open");
			 		if(action == "search")
				  		{
				  		startSearch(search,search,sublist.join(","));
				  		}
				  	if(action == "add")
				  		{
				  		hideBlockingLoader();
				  		hariAdd(search,search,sublist.join(","),nodePos);
				  		}
			 		}
			 	else
			 		{

			 		var chooser = $('<div id="chooser" class="chooser"></div>');
			 		var options = $('<div id="optionlist"></div>')
			 		if(action == "search")
					  	{
					  	console.log("pushing state");
					  	if(!noHistory)
					  		history.pushState({action:"disambiguation",query:search},"HARI")
					  	contents += fasttemplater.compile(
							"disambiguation_all",
							{
							term : search
							});
						}
					if(action == "add")
						{
						chooser.data("nodePos",nodePos);
						}
					options.append(contents);
					chooser.append(options);
				 	$("#disambiguation").append("<h2 class='disambiguationheader'>Choose one of the following categories : </h2>");
				 	$("#disambiguation").append(chooser);
					$("#disambiguation").addClass("open");

					options.masonry(
						{
						itemSelector: '.col-sm-4'
						});
					setTimeout(function()
						{
						hideBlockingLoader();
						},500);

			 		}
				}
			else
				{
				$("#disambiguation").removeClass("open");
				if(action=="search"){
			 		startSearch(search,search,"");
			 	}
			 	if(action=="add"){
			 		hideBlockingLoader();
				  	hariAdd(search,search,"",nodePos);
			 		}
				}
			})
		.always(function()
		 	{
			});
	}
function disambiguationHariOld(search,terms,sense)
	{
	$("#disambiguation").html("");
	var url = ($("#toggleendpoint").attr("data-endpoint") == "graph" ? endpoints.disambiguation : docendpoints.disambiguation) + encodeURIComponent(search);
	showBlockingLoader();
	$.getJSON(url)
		.done(function(data, textStatus, jqXHR)
			{
			data = data.filter(function(d)
				{
				return d.text.toLowerCase()!="blaclisted" && d.text.toLowerCase()!="blacklisted" && d.score > generalsettings.minSubCategoryRelevance;
				});

			if(data.length > 1)
				{
				var chooser = $('<div id="chooser" class="chooser"></div>')

			 	//chooser.html("<h2 class='disambiguationheader'>Choose one of the following categories " associated to the concept <span class='disambiguationheadersearch'>"+search+"</span></h2>");
			 	//chooser.append("<p><a data-terms=\""+search+"\" data-sense=\"\">All Categories</a></p>");

			 	var contents = "";

			 	var categories = {};

			 	for(var x=0;x<data.length;x++)
			 		{
			 		var splitted = data[x].text.split("/");
			 		var category = splitted[0];
			 		if(!categories[category])
			 			categories[category] =
			 				{
			 				text:category,
			 				sublist:[],
			 				score:0
			 				};
			 		categories[category].score += data[x].score;
			 		categories[category].sublist.push(splitted[1]) ;
			 		}
			 	var categorylist = $.map(categories, function(value, index)
			 		{
					return [value];
					});
				categorylist = categorylist.filter(function(d)
					{
					return d.score > generalsettings.minTopCategoryRelevance;
					});
				categorylist.sort(function(a,b){return b.score - a.score;});
			 	for(var x=0;x<categorylist.length;x++)
			 		{
					var relevance = Math.round(categorylist[x].score*100);
					contents += fasttemplater.compile(
						"disambiguation_item",
						{
						term : search,
						label: categorylist[x].text,
						sense: categorylist[x].sublist.join(","),
						relevance : relevance,
						color : colorscale(categorylist[x].text),
						sublist : categorylist[x].sublist.join(",") || "&nbsp;"
						});

			 		}
			 	contents += fasttemplater.compile(
					"disambiguation_all",
					{
					term : search
					});
			 	chooser.append(contents);
			 	$("#disambiguation").append("<h2 class='disambiguationheader'>Choose one of the following categories : </h2>");
			 	$("#disambiguation").append(chooser);
				$("#disambiguation").fadeIn();


				setTimeout(function()
					{
					hideBlockingLoader();
					chooser.masonry(
						{
						itemSelector: '.col-sm-4'
						});
					}, 1000);

				}
			else if(data.length == 1)
				{
				var splitted = data[0].text.split("/");
			 	var category = splitted[1];
			 	startSearch(search,search,category);
				}
			else
				{
			 	startSearch(search,search,"");
				}
			})
		.always(function()
		 	{
			});
	}

function disambiguationWikipedia(search,terms,sense)
	{
	var fixtitle = search.replaceAll(' ', '_') + "_(disambiguation)";
	console.log("MANUAL SEARCH",fixtitle);
	$.ajax({
		url: 'http://en.wikipedia.org/w/api.php',
		data: {
			action: 'parse',
			page: fixtitle,
			format: 'json',
			redirects : true
			},
		dataType: 'jsonp',
		success: function(linkdata)
			{
			if (linkdata &&
				linkdata.parse &&
				linkdata.parse.text &&
				linkdata.parse.text['*'])
				{
				 $("#disambiguation").html(linkdata.parse.text['*']);
				 $("#disambiguation .metadata").remove();
				 $("#disambiguation .mw-editsection").remove();
				 $("#disambiguation > div").remove();
				 $("#disambiguation a").each(function(index,element)
				 	{
					var href = $(element).attr("href");
					if(href.indexOf("Special:Search")>-1)
				 		{
				 		$(element).parents("li").remove();
				 		}
				 	})
				$("#disambiguation").fadeIn();
				}
			else
				{
				 startSearch(search,terms,sense);
				}

			}
		});
	}
function disambiguationWikipediaCrawl(fixtitle,plcontinue)
	{
	$.ajax({
		url: 'http://en.wikipedia.org/w/api.php',
		data:
			{
			action: 'query',
			prop: 'links',
			titles: fixtitle,
			format: 'json',
			plcontinue : plcontinue
			},
		dataType: 'jsonp',
		success: function(linkdata)
			{
			if(	linkdata &&
				linkdata.query &&
				linkdata.query.pages)
				{

			 	for(var pageid in linkdata.query.pages)
			 		{
				  	var links = linkdata.query.pages[pageid].links;
				  	for(var x=0;x<links.length;x++)
				  		{
				  		if(links[x].title.indexOf("Help:") == -1)
					   		$("#disambiguation").append("<p><b>Disambiguation</b> : <a>"+links[x].title+"</a></p>");
				  		}
			 		}

				}
			if(	linkdata &&
				linkdata["query-continue"] &&
				linkdata["query-continue"].links &&
				linkdata["query-continue"].links.plcontinue)
				{
			 	disambiguationWikipediaCrawl(fixtitle,linkdata["query-continue"].links.plcontinue);
				}
			else
				{
			 	$("#disambiguation").fadeIn();
				}
			}
		})
	}


function crawl(id, root, child, title, text, node, after)
	{
	var data =
		{
		term		   : node.label,
		sense	   : currentsearchdata.sense
		}

	if(!node.isMetaArticle)
		{
		data.referenceId = node.referenceId,
		data.uri		   = node.articleUri
		}

	data.id = node.id;

	var url = endpoints.getAbstract;
	if(data.id){
		console.log(data);
		url = endpoints.getAbstract + data.id + ".json";
		draw(id, root, child, "", data.term, "", node, after);
		return;
	}

	$.getJSON(url,data)
		.done(function(response)
			{
			var nodetitle = response.title;
			node.title = response.title;
			node.articleUri = response.contentURL;

			var abstract = response.shortAbstract || "";

			if(node.articleUri && node.articleUri.indexOf("wikipedia:") === 0)
				{


				var pageid = node.articleUri.split(":").pop();
				$.ajax({
					   url: 'http://en.wikipedia.org/w/api.php',
					   data: {
						   action	   : 'query',
						   prop		   : "pageimages",
						   pageids	   : pageid,
						   format	   : 'json',
						   pithumbsize : 600,
						   redirects   : true
						},
					dataType: 'jsonp'
					})
					   .done(function(data, textStatus, jqXHR)
					   	{
						   var thumbnail = "";
						   for (var key in data.query.pages)
						   	{
							   var page = data.query.pages[key];
							   if (page.thumbnail)
								   thumbnail = page.thumbnail.source;
							   break;
							}
						draw(id, root, child, thumbnail, nodetitle, abstract, node, after);
						})
					.fail(function()
						{
						draw(id, root, child, "", nodetitle, abstract, node, after);
						})
				}
			else
				{

				draw(id, root, child, "", nodetitle, abstract, node, after);
				}
			});
	}

function abstractWikipedia(id, root, child, thumb, title,wikititle, text, node, after)
	{
	var fixtitle = wikititle.replaceAll(' ', '_');


	$.ajax(
		{
		url: 'http://en.wikipedia.org/w/api.php',
		data:
			{
			action: 'parse',
			prop: 'text',
			page: fixtitle,
			format: 'json',
			redirects : true
			},
		dataType: 'jsonp'
		})
		.done(function(abstractdata)
			{
			var text = "";
			if (abstractdata &&
				abstractdata.parse &&
				abstractdata.parse.text &&
				abstractdata.parse.text['*'])
				{

				var test = $("<div>" + abstractdata.parse.text['*'] + "</div>")
				var wikiparagraphs = test.children('p');

				for(var x = 0; x<wikiparagraphs.length;x++)
					{
					var wikipar = $(wikiparagraphs[x]);
					if (wikipar.find("#coordinates").length)
						{
						continue;
						}
					wikipar.find('sup').remove();
					wikipar.find('a').each(function()
						{

						$(this)
							.attr('href', 'http://en.wikipedia.org' + $(this).attr('href'))
							.attr('target', 'wikipedia');

						 $(this).replaceWith($(this).text());
						});
					text = wikipar.html();
					if(text!=="")
						{
						 break;
						}
					}
				}
			if(text!=="" && ( text.indexOf("may refer to:")==-1 && text.indexOf("can refer to:")==-1))
				{
				draw(id, root, child, thumb, title, text, node, after);
				}
			else
				{
				abstractHari(id, root, child, thumb, title, "", node, after);
				}
			})
		.fail(function()
			{
			abstractHari(id, root, child, thumb, title, text, node, after);
			});

	}
function abstractHari(id, root, child, thumb, title, text, node, after)
	{
	//console.log(id, root, child, thumb, title, text, node, after);
	//var url = "/rest/terms/conceptDescription?sense="+currentsearchdata.sense+"&term="+node.label;
	var url = "/rest/terms/conceptDescriptions"+
		"?topic=" + encodeURIComponent(currentsearchdata.sense)+
		"&term="	+ encodeURIComponent(node.label);
	$.getJSON(url)
		.done(function(response)
			{
			var noinfo = false;

			var text ="";
			var count = 0;
			for(var key in response)
				{
			 	text+="<p>"+key.charAt(0).toUpperCase() + key.slice(1)+"</p>";
			 	count++;
			 	if(count == 3)
			 		break;
				}

			text = text.replace(new RegExp('"' , "gmi"),"");
			text = text.replace(new RegExp('\\n' , "gmi"),"");


			//console.log("HARI ABSTRACT",title,text);

			if(generalsettings.removeEmptyNodes)
				{
				if(text.length >10 || node.isCentroid)
				 	 	{
				 	 	draw(id, root, child, thumb, title, text, node, after,noinfo);
				 	 	}
				 	else
				 		{
				 		draw(id, root, child, thumb, title, text, node, after,noinfo,true);
					  	currentRenderer.removeNodes(id)
				   	}
				}
			else
				{
				draw(id, root, child, thumb, title, text, node, after,noinfo);
				}

			})
		.fail(function()
			{
			draw(id, root, child, thumb, title, "", node, after,true);
			});

	}
function abstractHariOld(id, root, child, thumb, title, text, node, after)
	{
	//console.log(id, root, child, thumb, title, text, node, after);
	var url = "/rest/terms/conceptDescription?sense="+currentsearchdata.sense+"&term="+node.label;
	$.ajax(
		{
		url: url
		})
		.done(function(response)
			{
			var noinfo = !(node.articleUri && node.articleUri.indexOf("hw:")===0);

			response = response.replace(new RegExp('"' , "gmi"),"");
			response = response.replace(new RegExp('\\n' , "gmi"),"");

			if(generalsettings.removeEmptyNodes)
				{
				if(response.length >10 || node.isCentroid)
				 	 	{

				 	 	draw(id, root, child, thumb, title, response, node, after,noinfo);
				 	 	}
				 	else
				 		{
				 		draw(id, root, child, thumb, title, response, node, after,noinfo,true);
					  	currentRenderer.removeNodes(id)
				   	}
				}
			else
				{
				draw(id, root, child, thumb, title, response, node, after,noinfo);
				}

			});

	}
function hariSearch(query,terms,sense, callback)
	{
	currentview = "graph";
	overCard=null;
	prevmouseover=null;
	showBlockingLoader()

	var hariRequest;
	var readableQuery = query;

	if($.isArray(query))
		{
		currentsearchdata=
			{
			query : "",
			terms : "",
			sense : ""
			}
		var labels=[];
		var referenceIds=[];
		var querylist = [];
		for(var x = 0;x<query.length;x++)
			{
			var node = query[x];
			console.log(query);
			labels.push(node.data.label);
			referenceIds.push(node.data.referenceId);
			querylist.push(node.data.label);
			}

		readableQuery=labels.join(",");
		hariRequest = getHari("path",
			{
			terms		: querylist.join(";"),
			referenceIds : referenceIds.join(";"),
			newSearch	: true
			});


		}
	else
		{
		currentsearchdata=
			{
			query:query,
			terms:terms,
			sense:sense
			}


		hariRequest = getHari("search",currentsearchdata);
		}

	currentSearch=readableQuery;
	newGraphTab(readableQuery);
	highlightTopics(readableQuery);

	history.pushState({action:"goToHistory",index:currentStateindex},"HARI");

	hariRequest
		.done(function(data, textStatus, jqXHR)
			{
			console.log("DATA RECEIVED", data);
			if( data &&
				data.centroids &&
				data.nodes	&&
				data.edges)
				{
				currentsearchdata.graphId = data.id;


				fixData(data,callback,$.isArray(query));
				}
			})
		.always(function()
		 	{
		 	addloader = null;
			hideBlockingLoader();
			});
	}

function hariExplore(nodeId,backnode)
	{
	$(".tooltip").remove();

	hideTooltip()
	var node = currentRenderer.getNode(nodeId);
	//showBlockingLoader()

	if(!node.data.expanded)
		{
		showInfoLoader("EXPLORING NODE...");
		var addcentroids=[];
		for(var nodeid in supernodeUI)
			{
			var tmpnode = supernodeUI[nodeid];
			if(tmpnode.isCentroid)
				addcentroids.push(tmpnode.main.data.referenceId)
			}
		if(currentRenderer.layout)
			{
			var pos	 = currentRenderer.layout.getNodePosition(nodeId);
			addloader = pos;

			currentRenderer.layout.pinNodeId(nodeId, true);
			node.waspinned = true;
			console.log("expanding",pos);
			var angle = Math.atan(Math.abs(pos.y)/Math.abs(pos.x));

			currentRenderer.layout.setNodePosition(nodeId, pos.x + sign(pos.x)*Math.cos(angle)*4000, pos.y + sign(pos.y)*Math.sin(angle)*4000);
			node.data.isCentroid=true;
			node.nodeUI.isCentroid=true;
			node.nodeUI.width=nodeRadius(node);
			node.nodeUI.textnode.setStyle({
					font: "" + largefont * window.devicePixelRatio + "px Raleway",
					fill: textcolor,
					align: "center",
					nobackground : true
			});
			}

		node.data.expanded = true;
		node.data.collapsed = false;
		node.data.hidden_collapse = false;

		currentRenderer.goToNode(nodeId);
		$("#"+nodeId).find(".card")
			.addClass("root");



		var hariRequest = getHari("explore",
			{
			term	    : node.data.label,
			query	    : node.data.label,
			sense	    : currentsearchdata.sense,
			isDocument  : node.data.isDocument,
			referenceId : node.data.referenceId,
			centroids   : addcentroids.join(";")
			});
		hariRequest
			.done(function(data, textStatus, jqXHR)
				{
				console.log("DATA RECEIVED", data);
				fixExploreData(nodeId,data,backnode);
				})
			.always(function()
			 	{
			 	addloader = null;
			 	hideInfoLoader();
				});
		}
	else
		{

		}
	}



function hariAddPopover(nodePos,popoverPos)
	{
	console.log("HARI ADD",nodePos,popoverPos);

	var body=
		'<form id="addform" class="form-search">'+
				'<input id="addstring" type="text">'+
				//'<button id="addsearch" value="search">DISCOVER</button>'+
		'</form>';

	var pop_left = 	popoverPos.x;
	var pop_top  =	 popoverPos.y + 30;

	var placement = "right";

	if(pop_left > ( $(window).width() - 450))
		{
		placement = "left";
		pop_left -= 382;
		}
	var popover=$('body').popover(
		{
		title:"Add node",
		html:true,
		trigger:"manual",
		content:body,
		container: 'body',
		placement:placement,
		});
	$('body').popover("show");
	$('#addstring').typeahead(
		{
		source	: advancedAddAutocomplete,
		autoSelect:true,
		minLength: 1,
		highlight: true,
		matcher : function ()
			{return true;},
		sorter  : function (items)
			{return items;},
		updater	: function (item)
			{
			item = item
				.replace("<b>Did you mean :</b> ", "")
				.replace("<b>ADD :</b> ","");
			$('body').popover("destroy");
			$("#mask").hide();
			disambiguationHari(item,"add",nodePos);
			return item;
			}
		});
	$('#addstring')
		.on('keyup',function(e)
			{
			var query=$("#addstring").val();
			switch(e.keyCode)
				{
				case 13:
					$('#addstring').typeahead("hide");
					$('body').popover("destroy");
					$("#mask").hide();
					disambiguationHari(query,"add",nodePos);
					break;
				case 40:
				case 38:
					var text = $("#addform .typeahead .active").data('value')
						.replace("<b>Did you mean :</b> ", "")
						.replace("<b>ADD :</b> ","");
					$('#addstring').val(text);
					$('#addstring').attr("data-query",text);
					break;
				default:
					$('#addstring').attr("data-query",query);
				}
			});
	$('.popover')
		.css(
			{
			left : pop_left ,
			top: pop_top,
			"z-index":1000
			});

	$("#mask")
		.show()
		.off()
		.on("click",function()
			{
			$("#mask").fadeOut();
			$('body').popover("destroy");
			})
		.on("contextmenu",function(e)
			{
			$("#mask").fadeOut();
			$('body').popover("destroy");
			e.preventDefault();
			e.stopPropagation();
			});
	$("#addstring").focus();



	};

function hariAdd(query,terms,sense,nodePos,callback)
	{
	addloader = nodePos;
	showInfoLoader("RETRIEVING NEW NODE");
	$(".tooltip").remove();
	hideTooltip();
	//showBlockingLoader()
	var addcentroids  = [];
	var centroids = [];
	for(var nodeid in supernodeUI)
		{
		var node = supernodeUI[nodeid];
		if(node.isCentroid)
			{
			centroids.push(node.main.data);
			addcentroids.push(node.main.data.referenceId);
			}
		}

	var hariRequest = getHari("add",
		{
		query		  : query,
		sense		  : sense,
		centroids	  : addcentroids.join(";")
		});

	hariRequest
		.done(function(data, textStatus, jqXHR)
			{
			console.log("DATA RECEIVED", data);
			var mainnode = fixAddData(data,nodePos);
			addloader = layout.getNodePosition(mainnode.id)
			hariAddRecursive(0,mainnode,centroids,false)
			if(callback)
				callback(mainnode);
			})
		.fail(function()
		 	{
		 	addloader = null;
			hideInfoLoader();
			});
	}
function hariAddRecursive(index,mainnode,centroids,success)
	{
	showInfoLoader("CALCULATING SHORTEST PATH ( "+(index+1)+"/"+centroids.length+" )");

	var query = mainnode.label+ ";" + centroids[index].label;

	var hariRequest = getHari("path",
		{
		terms		   : query,
		sense		   : currentsearchdata.sense,
		referenceIds : mainnode.referenceId + ";" + centroids[index].referenceId
		});


	hariRequest
		.done(function(data, textStatus, jqXHR)
			{
			fixExploreData(mainnode.id,data,null);
			if(data && data.nodes && data.nodes.length)
				{
				success =  true;
				}
			})
		.always(function()
		 	{
		 	index++;
		 	if(index < centroids.length)
		 		{
			 	hariAddRecursive(index,mainnode,centroids,success)
		 		}
		 	else
		 		{
			 	addloader = null;
			 	if(success === false)
			 		{
				 	showInfoLoader("<span style='color:red;'>NO PATH FOUND</span>");
				 	setTimeout(function()
				 		{
				 		hideInfoLoader();
				 		},5000)
			 		}
			 	else
			 		{
				 	hideInfoLoader()
			 		}


		 		}
			});
	}
function hariRemoveModal(nodeId)
	{
	$("#deleteconfirm").attr("data-nodeid",nodeId);
	$("#deletenote").val("");
	$("#deleteModal").modal("show");
	}

function hariRemove()
	{
	var nodeId = $("#deleteconfirm").attr("data-nodeid");
	var note = $("#deletenote").val();
	var node = currentRenderer.getNode(nodeId);

	var addcentroids=[];
	for(var x in supernodeUI)
		{
		var tmpnode = supernodeUI[x];
		if(tmpnode.isCentroid)
			addcentroids.push(tmpnode.main.data.referenceId)
		}

	var hariRequest = getHari("remove",
		{
		query		  : currentsearchdata.query,
		term		  : node.data.label,
		sense		  : currentsearchdata.sense,
		centroids	  : addcentroids.join(";"),
		referenceId : node.data.referenceId,
		note		  : note
		});

	$("#"+nodeId).remove();

	overCard = null;
	currentRenderer.removeNodes(nodeId);
	}

function hariEdgeInfo(edge)
	{

	drawsentence("Annual report 1819_Cocoanect_GHA_COCOA MERCHANTS", ["<table class=\"info-detail\">" +
	"<tr><td class=\"title-sect primary-color\">Data:</td><td>10/21/2018</td></tr>" +
	"<tr><td class=\"title-sect primary-color\">SOCIETY:</td><td>Saabo</td></tr>" +
	"<tr><td class=\"title-sect primary-color\">FARMER CODE:</td><td>ML/AS6/15/17/F01</td></tr>" +
	"<tr><td class=\"title-sect primary-color\">FARMER'S NAMES:</td><td> MAKANJUOLA EMILIA ABOSEDE</td></tr>" +
	"<tr><td class=\"title-sect primary-color\">#BAGS:</td><td>0,6</td></tr>" +
	"<tr><td class=\"title-sect primary-color\">WEIGHT ACCEPTED:</td><td>40</td></tr></table>"],"uri","sponsoredArticle");
	$("#edgedata .piece").show();

	$("#smallloadercontainer").show();
	openNav();
	var edgelabel = edge.fromNode.data.label +" "+edge.toNode.data.label;
	currentEdge = edgelabel;

	var hariRequestData =
		{
		from		    : edge.fromNode.data.label,
		fromReferenceId	: edge.fromNode.data.referenceId,
		to		        : edge.toNode.data.label,
		toReferenceId	: edge.toNode.data.referenceId,
		sense		    : currentsearchdata.sense
		};

	//requests.hariedgeinfo = hariRequest;
	var coocSentences      = $.extend({coocSentences:true},hariRequestData);
	var coocOnDoc          = $.extend({coocOnDoc:true},hariRequestData);
	var occOnDescr         = $.extend({occOnDescr:true},hariRequestData);
	var sentenceOnArticle  = $.extend({sentenceOnArticle:true},hariRequestData);
	var commonConcept      = $.extend({commonConcept:true},hariRequestData);

	var highlightedgeurl = endpoints.highlights+
			encodeURIComponent(edge.fromNode.data.label) +";"+
			encodeURIComponent(edge.toNode.data.label)+
			"&isEdge=true";

	var allSentences = $.extend(
		{
		coocSentences:true,
		coocOnDoc:true,
		occOnDescr:true,
		sentenceOnArticle:true,
		commonConcept:true,
		},hariRequestData);
	$.when(
		//getHari("edgeinfo",coocSentences),
		//getHari("edgeinfo",coocOnDoc),
		//getHari("edgeinfo",occOnDescr),
		//getHari("edgeinfo",sentenceOnArticle),
		//getHari("edgeinfo",commonConcept),
		getHari("edgeinfo",allSentences),
		$.getJSON(highlightedgeurl)
		)

		.then(function(allData,highlightData)
		//.then(function(coocSentencesData,coocOnDocData,occOnDescrData,sentenceOnArticleData,commonConceptData,highlightData)
			{

			commonConceptData = allData;
			var list = [];
			if(allData[1]=="success")
				{
				list = allData[0];
				}
			/*
			if(coocSentencesData[1]=="success")
				{
				list = list.concat(coocSentencesData[0])
				}
			if(coocOnDocData[1]=="success")
				{
				list = list.concat(coocOnDocData[0])
				}
			if(occOnDescrData[1]=="success")
				{
				list = list.concat(occOnDescrData[0])
				}
			if(sentenceOnArticleData[1]=="success")
				{
				list = list.concat(sentenceOnArticleData[0])
				}
			*/
			var commonConcepts = [];
			var commonWords    = [];

			var commonMerged   = [];
			if(commonConceptData[1]=="success" && commonConceptData[0][0] && commonConceptData[0][0].commonConcepts)
				{
				var fromLower = hariRequestData.from.toLowerCase();
				var toLower = hariRequestData.to.toLowerCase();
				commonConcepts = commonConceptData[0][0].commonConcepts.filter(
					function(a)
						{
						var alower = a.toLowerCase();
						var status = alower != fromLower  && alower != toLower;
						return status
						});
				commonWords    = commonConceptData[0][0].commonWords.filter(
					function(a)
						{
						var alower = a.toLowerCase();
						var status = alower != fromLower  && alower != toLower;
						return status
						});
				commonMerged = commonConcepts.concat(commonWords);
				}
			commondataCloud(commonConcepts,commonWords);
			fixEdgeData(list,commonMerged.length > 0 );
			if(highlightData[1]=="success")
				{
				highlightEdgeTopics(hariRequestData.from , hariRequestData.to , highlightData[0] , commonMerged);
				}



			$("#smallloadercontainer").hide();
			requests.hariedgeinfo = null;
  			})
  		.always(function(a,b,c,d)
			{
			$("#smallloadercontainer").hide();
			});
	/*
	hariRequest
		.done(function(data)
			{
			var commonConcepts = [];
			if(data && data[0] && data[0].commonConcepts)
				{
				commonConcepts = data[0].commonConcepts;
				commondataCloud(commonConcepts);
				}
			fixEdgeData(data);
			highlightEdgeTopics(edge.fromNode.data , edge.toNode.data, commonConcepts);
			requests.hariedgeinfo = null;
			})
		.fail(function()
		 	{
			$("#smallloadercontainer").hide();
			requests.hariedgeinfo = null;
			});
	*/
	}

function hariCarrot(search,method)
	{
	$("#smallloadercontainer").show();
	console.log("Call carrotClustering ",method, search);
	var url = "";
	if(method != "videos" && method != "documents" && method != "stanford" && method != "marc")
		{
		url = "http://beta.hariscience.com:8080/carrot2-dcs/dcs/rest?"+
			"dcs.source=" + encodeURIComponent(method)+
			"&query="	 + encodeURIComponent(search)+
			"&results=100&dcs.algorithm=lingo&dcs.output.format=JSON&dcs.json.callback=";
		$.getJSON(url)
			.done(function(data)
				{
				$("#smallloadercontainer").hide();
				var fixeddata=[];

				for(var x=0; x <data.clusters.length; x++)
					{
					var cluster=data.clusters[x];
					var newitem=
						{
						label:cluster.phrases[0],
						sentences:[]
						};
					for(var y=0; y < cluster.documents.length; y++)
						{
						var docID=cluster.documents[y];
						var doc=data.documents[docID];
						//console.log(method,doc);
						if(method=="images")
							{
							newitem.sentences.push(
								{
								id:docID,
								index:docID,
								type:"image",
								contentId : doc.title,
								contentSource : doc.snippet || "",
								contentURL : doc.url,
								label : "<img src='"+doc.fields["thumbnail-url"]+"'/>",
								});
							}
						else
							{
							newitem.sentences.push(
								{
								id:docID,
								index:docID,
								type:"text",
								contentId : doc.title,
								contentSource : doc.snippet || "",
								contentURL : doc.url,
								label : doc.snippet,
								});
							}
						}
					fixeddata.push(newitem);
					}
				fixCarrotData(fixeddata);
				})
			.always(function()
			 	{
				$("#smallloadercontainer").hide();
				});

		}
	else
		{
		if(method == "videos")
			{
			url = "/videos.jsp?query=";
			}
		if(method == "documents")
			{
			url = "/documents.jsp?query="
			}
		jQuery.get(url + search,null,
			function(data,a,b)
				{
				$("#smallloadercontainer").hide();
				console.log(data,a,b);
				if(b.responseText.indexOf("<document>")==-1)
					{
					fixCarrotData([]);
					}
				else
					{
					var requestData=
						{
						"dcs.c2stream":b.responseText,
						"dcs.algorithm":"lingo",
						"dcs.output.format":"JSON"
						};
					$.post("http://beta.hariscience.com:8080/carrot2-dcs/dcs/rest",
						requestData,
						function(data)
							{
							hideBlockingLoader();
							var fixeddata=[];
							for(var x=0; x <data.clusters.length; x++)
								{
								var cluster=data.clusters[x];
								var newitem=
									{
									label:cluster.phrases[0],
									sentences:[]
									};
								for(var y=0; y < cluster.documents.length; y++)
									{
									var docID=cluster.documents[y];
									var doc=data.documents[docID];
									if(method=="videos")
										{
										var splitted = doc.url.split("/");
										var videoid = splitted.pop();
										newitem.sentences.push(
											{
											id:docID,
											type:"video",
											index:doc.id,
											contentId : doc.title,
											contentSource : doc.snippet || "",
											contentURL : doc.url,
											label : "<img class='videothumb' src='http://i.ytimg.com/vi/"+videoid+"/hqdefault.jpg'/>",
											});
										}
									else
										{
										newitem.sentences.push(
											{
											id:docID,
											index:doc.id,
											type:"text",
											contentId : doc.title,
											contentSource : doc.snippet || "",
											contentURL : doc.url || "",
											label : doc.snippet || "",
											});
										}
									}
								fixeddata.push(newitem);
								}
							fixCarrotData(fixeddata);
							},
						"json"
						);
					}
				});
		}

	};

function highwireInfo(title,uri)
	{
	hideTooltip();
	$.getJSON("/rest/terms/extendedInfo",
		{
		term : title,
		uri   : uri
		});
	//var reader = "http://docs.google.com/viewer?embedded=true&url=";
	//var reader =	 "/hariterms/Viewer.js/#../article.jsp?uri=";

	var ispdfurl = endpoints.ispdf+uri;
	$.getJSON(ispdfurl)
		.done(function(ispdf)
			{
			console.log("ISPDF ?",ispdf);
			if(ispdf=="true")
				{
				var url = endpoints.documentreader + encodeURIComponent(endpoints.documentextractor + uri);
				$("#pdfviewer").html('<iframe allowfullscreen=true src="'+url+'"></iframe>');
				$("#pdfviewer").addClass("open");
				$("#smallloadercontainer").show();
				}
			else
				{
				showBlockingLoader();
				$.ajax({
					   url: endpoints.documentextractor + uri,
					   dataType: 'text',
					})
					.done(function(response)
						{
						$("#pdfviewer").html("<div class='xmlcontent'>"+response+"</div>");
						$("#pdfviewer").addClass("open");
						})
					.always(function()
						{
						hideBlockingLoader();
						})

				}
			});




	var metadataurl = endpoints.metadata+uri;
	$.getJSON(metadataurl)
		.done(function(metadata)
			{
			console.log("METADATA",metadata);

			if(metadata.published)
				{
				var d = new Date(metadata.published);
				var day = d.getDate();
				if(day < 10)
					day = "0"+day;
				var month = d.getMonth() + 1; //Months are zero based
				if(month < 10)
					month = "0"+month;
				var year = d.getFullYear();
				metadata.published = day + "/" + month + "/" + year;
				}
			var contents = fasttemplater.compile(
				"info_metadata",
				metadata
				);

			$("#infoframe").html(contents);

			})
		.always(function()
			{
			$("#smallloadercontainer").hide();
			});
		}
function wikipediaInfo(title,uri,referenceId)
	{
	$("#smallloadercontainer").show();
	$.getJSON("/rest/terms/extendedInfo",
		{
		term : title,
		uri   : uri
		});
	var wikititle = title.replace(/ /,"_");
	$.ajax({
		url: 'http://en.wikipedia.org/w/api.php',
		data: {
			action: 'parse',
			page: wikititle,
			format: 'json',
			redirects : true
			},
		dataType: 'jsonp'
		})
		.done(function(pagedata)
			{
			if (pagedata &&
				pagedata.parse &&
				pagedata.parse.text &&
				pagedata.parse.text['*'])
				{
				$("#infoframe").hide();
				 $("#infoframe").html('<div class="contents">'+pagedata.parse.text['*']+'</div>');
				 $("#infoframe").removeClass("summarized");

				 $("#infoframe .metadata,#infoframe .magnify").remove();
				 $("#infoframe .mw-editsection").remove();
				 $("#infoframe .navbox").remove();
				 $("#infoframe #toc").remove();
				 $("#infoframe .reference, #infoframe .reflist").remove();
				 $("#infoframe .vertical-navbox").remove();
				 $("#infoframe .haudio").remove();
				 $("#infoframe a").each(function()
					{
					$(this).replaceWith($(this).html());
					});
				 $("#infosummary i").show();
				 highlightNodeTopics(title,true);
				}
			else
				{
				 hariInfo(title,uri);
				}
			})
		.always(function()
			{
			$("#smallloadercontainer").hide();
			});

	}
function hariInfo(title,uri)
	{
	var harinfourl = "/rest/terms/conceptDescriptions"+
		"?topic=" + encodeURIComponent(currentsearchdata.sense)+
		"&term="	+ encodeURIComponent(title)
	$.getJSON(harinfourl)
		.done(function(response)
			{
			var text ="";
			for(var key in response)
				{
			 	text+="<p>"+key.charAt(0).toUpperCase() + key.slice(1)+"</p>";
				}
			$("#infoframe").hide();
			$("#infoframe").html('<div class="contents">'+text+'</div>');
			$("#infoframe").removeClass("summarized");

			$("#infosummary i").hide();
			highlightNodeTopics(title,false);
			})
		.always(function()
			{
			$("#smallloadercontainer").hide();
			});
	}

function fixData(data,callback,path)
	{
	var edges = data.edges;
	var nodes = data.nodes;

	data.topics = null;


	var centroids={};
	var topics = {};


	attractors= {};
	if(data.topics && data.topics.length > 1)
		{
		var startangle = 0;

		var attnumber = Math.min(8,data.topics.length)

		var angle = 2*Math.PI/attnumber;
		var range = 4000 + 1000*data.centroids.length;
		var circlerange = range*0.85;
		for(var x=0;x<attnumber;x++)
			{
			var topic = data.topics[x].text;
			attractors[topic]=
				{
				x	  :	 Math.cos( startangle + angle * x ) * range,
				y	  : -Math.sin( startangle + angle * x ) * range,

				circlex		:  Math.cos( startangle + angle * x ) * circlerange,
				circley		: -Math.sin( startangle + angle * x ) * circlerange,

				label : topic
				};
			}

		var totalradius = circlerange+circleradius;
		var scale = Math.min($("#graph").width()/(2*totalradius) ,$("#graph").height()/(2*totalradius));

		currentRenderer.graphics.scale.x = scale*window.devicePixelRatio;
		currentRenderer.graphics.scale.y = scale*window.devicePixelRatio;

		console.log(scale);
		//   window.devicePixelRatio;
		}

	for(var x=0;x<data.centroids.length;x++)
		{
		centroids[+data.centroids[x]] = x+1;
		}
	for(var x=0;x<nodes.length;x++)
		{
		var node = nodes[x];
		node.centroid	 = centroids[+node.id] || 1000000;

		if(x%2==0){
			node.sponsoredNode = ["eisai","jandj"];
			console.log(x,node);
		}

		if(centroids[+node.id])
			{
			addBreadcrumb(node.id,node.label);
			if(data.centroids.length == 1)
				node.expanded = true;

			setNodeStep(+node.id,stepindex,"discover");
			}
		else
			{
			//setNodeStep(+node.id,stepindex+1,"results");
			}

		node.nodeindex = x;
		var nodetopics=node.topics;
		if(nodetopics)
			{
			var sorted=[];
			var total = 0;
			for(var key in nodetopics)
				{
				sorted.push(
					{
					key:key,
					value:nodetopics[key]
					});
				total += nodetopics[key];
				/*
				if(maintopics[key])
					maintopics[key]+=nodetopics[key];
				else
					maintopics[key]=nodetopics[key];
				*/
				}
			sorted.sort(function(a,b){return b.value-a.value;});

			if(data.topics)
				{
				for(var y = 0;y<sorted.length;y++)
					{
					if(attractors[sorted[y].key])
						{
						node.attractedby = sorted[y].key;
						break;
						}
					}
				//node.attractedby = data.topics[Math.floor(Math.random()*data.topics.length)]
				}
			node.sortedTopics = sorted;
			node.totalTopics = total;

			var bestTopic = sorted[0];
			if(maintopics[bestTopic.key])
				maintopics[bestTopic.key]+=1;
			else
				maintopics[bestTopic.key]=1;
			}
		else
			{
			node.sortedTopics = [];
			node.totalTopics = 0;

			}
		}
	if(false) //path)
		{
		for(var x=0;x<edges.length;x++)
			{
			var edge = edges[x];
			if(centroids[edge.endNode] && centroids[edge.startNode])
				{
				edge.pathedge = true;
				}
			}
		}
	nodes.sort(function(a,b)
		{
		return a.centroid - b.centroid;
		});

	haridata = data;
	startFilters(maintopics,true);
	callback(data);
	stepindex += 1;
	}

function fixExploreData(mainId,data,backnode)
	{
	data.nodes		= data.nodes || [];
	data.edges		= data.edges || [];
	data.centroids = data.centroids || [];


	var centroids = {}
	for(var x=0;x<data.centroids.length;x++)
		{
		centroids[+data.centroids[x]]	  = true;
		}

	for(var x=0;x<data.nodes.length;x++)
		{
		var node = data.nodes[x];

		if(centroids[+node.id])
			{
			addBreadcrumb(node.id,node.label);
			setNodeStep(+node.id,stepindex,"explore")
			}
		else
			{
			setNodeStep(+node.id,stepindex+1,"results")
			}
		//node.fromExpansion = true;
		var nodetopics=node.topics;

		if(x%2==0){
			node.sponsoredNode = ["eisai","jandj"];
		}


		if(nodetopics)
			{
			var sorted = [];
			var total  =	 0;
			for(var key in nodetopics)
				{
				sorted.push(
					{
					key:key,
					value:nodetopics[key]
					});
				total += nodetopics[key];
				/*
				if(maintopics[key])
					maintopics[key]+=nodetopics[key];
				else
					maintopics[key]=nodetopics[key];
				*/
				}
			sorted.sort(function(a,b){return b.value-a.value;});
			node.sortedTopics = sorted;
			node.totalTopics = total;

			var bestTopic = sorted[0];
			if(maintopics[bestTopic.key])
				maintopics[bestTopic.key]+=1;
			else
				maintopics[bestTopic.key]=1;
			}
		else
			{
			node.sortedTopics = [];
			node.totalTopics = 0;
			}
		}
	startFilters(maintopics,false);
	currentRenderer.addNodes(mainId,data,backnode);
	stepindex+=2;
	}
function fixAddData(data,nodePos)
	{
	console.log("FIX ADD DATA",data,nodePos);

	var mainnode = null;

	var nodes = data.nodes;

	var centroids = {};
	for(var x=0;x<data.centroids.length;x++)
		{
		centroids[+data.centroids[x]]	  = true;
		}

	for(var x=0;x<nodes.length;x++)
		{
		var node = nodes[x];
		if(centroids[+node.id])
			{
			addBreadcrumb(node.id,node.label);
			node.expanded = true;
			mainnode = node;
			}
		//node.fromExpansion = true;
		var nodetopics=node.topics;

		if(x%2==0){
			node.sponsoredNode = ["eisai","jandj"];
		}

		if(nodetopics)
			{
			var sorted = [];
			var total  =	 0;
			for(var key in nodetopics)
				{
				sorted.push(
					{
					key:key,
					value:nodetopics[key]
					});
				total += nodetopics[key];
				}
			sorted.sort(function(a,b){return b.value-a.value;});
			node.sortedTopics = sorted;
			node.totalTopics = total;

			var bestTopic = sorted[0];
			if(maintopics[bestTopic.key])
				maintopics[bestTopic.key]+=1;
			else
				maintopics[bestTopic.key]=1;
			}
		else
			{
			node.sortedTopics = [];
			node.totalTopics = 0;
			}
		}
	startFilters(maintopics,false);
	currentRenderer.addNewNodes(data,nodePos,mainnode);

	return mainnode;
	}


function fixEdgeData(data,hasCommonWords)
	{
	var elements = {};
	var elementList = [];


	for(var x=0;x<data.length;x++)
		{
		var sentences = data[x].sentences;
		for(var y = 0; y<sentences.length;y++)
			{
			var cID  = sentences[y].contentURL;
			var text = sentences[y].contentSource.charAt(0).toUpperCase() + sentences[y].contentSource.slice(1)

			var sponsoredArticle = null;

			if(elementList.length%2==0){
				sponsoredArticle = ["eisai","jandj"];
			}

			elementList.push(
				{
				id      : sentences[y].id,
				uri     : sentences[y].contentURL,
				title   : sentences[y].contentId,
				sentence: [text],
				sponsoredArticle: sponsoredArticle
				});
			}
		}
	renderEdgeInfo(elementList,hasCommonWords);
	}
function fixCarrotData(data)
	{
	var nodes = data.nodes;

	var elements = [];

	for(var x=0;x<data.length;x++)
		{
		var sentences = data[x].sentences;
		for(var y = 0; y<sentences.length;y++)
			{
			elements.push(
				{
				type:sentences[y].type,
				title:sentences[y].contentId,
				url:sentences[y].contentURL,
				sentence:sentences[y].label
				});
			}
		}

	renderCarrot(elements);
	}

function highlightTopics(search)
	{
	topiclist = [];
	var url = endpoints.highlights+
		encodeURIComponent(search)+
		"&isEdge=false";
	try
		{
		$.getJSON(url)
			.done(function(topicsdata, textStatus, jqXHR)
				{
				var searchtext=search;

				var cards=$(".card .links")
				topicsdata.sort(function(a,b){return b.length - a.length});
				for(var x=0;x<topicsdata.length;x++)
					{
					var topic=topicsdata[x];
					topiclist.push(topic);
					searchtext=searchtext.replaceAll(topic,"<b>"+topic+"</b>",true);
					for(var y=0;y<cards.length;y++)
						{
						var text="";
						if($("#edgecontainer").hasClass("open"))
							text = $(cards[y]).html();
						else
							text = $(cards[y]).html();
						text=text.highlightAll(topic,"");
						$(cards[y]).html(text);
						}
					}

				$("#overinput").html(searchtext);
				});
		}
	catch(e)
		{
		console.warn("DBPEDIA Service Unavailable");
		}
	}
function highlightNodeTopics(search,wikipedia)
	{
	var searchtext=search;
	var paragraphs = $("#infoframe .contents > p");
	var url = endpoints.highlights+
		encodeURIComponent(search)+
		"&isEdge=false";
	$.getJSON(url)
		.done(function(topicsdata, textStatus, jqXHR)
			{
			topicsdata.sort(function(a,b){return b.length - a.length});

			if(currentEdgeElement)
				{

				var edgeurl = endpoints.highlights+
					encodeURIComponent(currentEdgeElement.fromNode.data.label) +";"+
					encodeURIComponent(currentEdgeElement.toNode.data.label)+
					"&isEdge=true"

				$.getJSON(edgeurl)
					.done(function(edgetopicsdata, textStatus, jqXHR)
						{
						edgetopicsdata.sort(function(a,b){return b.length - a.length});

						var mindistance = {el : null, dist : 0.5};


						   $("#infoframe").show();
						if(wikipedia && gotosentence)
							{
							paragraphs.each(function(i,p)
								{
								var text = $(p).text().toLowerCase();
								var distance = mmDistance(text,gotosentence,0);
								 if(distance < mindistance.dist)
								 	{
									  mindistance.dist = distance;
									  mindistance.el   = $(p);
								 	}
								 //$(p).append("<b> DISTANCE : "+distance+"</b>")
								});
							if(mindistance.el)
								{
								 var scrollto = $('#infoframe').scrollTop() - (201) + mindistance.el.offset().top - 15;
								var mindistancehtml = mindistance.el.text();

								var regex = new RegExp("(" + gotosentence + ")" , "gmi");
								mindistancehtml = mindistancehtml.replace(regex, "<b class=\"exactsentence\">$1</b>");

								mindistance.el.html(mindistancehtml);
								mindistance.el.addClass("selected");
								console.log(scrollto);
								setTimeout(function()
									{
									$('#infoframe .contents')
										   .stop()
										   .animate(
										   	{
											   scrollTop: scrollto
										   	}, 1000);
									}, 100);

								  setTimeout(function()
								  	{
								  	mindistance.el.removeClass("selected");
								  	}, 5000);
								}

							}

						var allhighlights = topiclist.concat(topicsdata,edgetopicsdata);
						allhighlights.sort(function(a,b){return b.length - a.length});
						console.log(allhighlights);
						paragraphs.each(function(i,p)
						   	{
						   	var html = $(p).html();
							for (var x = 0; x < allhighlights.length; x++)
								 {
								 var topic = allhighlights[x];
								 html = html.highlightAll(topic,"");
								 };
							$(p).html(html);
							});
						})
					.fail(function()
						{
						$("#infoframe").show();
						});
				}
			else
				{
				var allhighlights = topiclist.concat(topicsdata);
				allhighlights.sort(function(a,b){return b.length - a.length});
				console.log(allhighlights);
				paragraphs.each(function(i,p)
				 	{
					  var text = $(p).html();
					  for (var x = 0; x < allhighlights.length; x++)
						   {
						   var topic = allhighlights[x];
						   text = text.highlightAll(topic,"");
						   };
					  $(p).html(text);
				 	});
				 $("#infoframe").show();
				}
			})
		.fail(function()
			{
			//$("#infosummary").trigger("click");
			$("#infoframe").show();
			});

	}

function commondataCloud(commonconcepts,commonwords)
	{

	var clouddata = [];
	for (var x = 0; x < commonconcepts.length && x < 50; x++)
		{
		var common = commonconcepts[x];


		var weight = 18;

		var found=false;

		for(var nodeid in supernodeUI)
			{
			var tmpnode = supernodeUI[nodeid].main.data;

			if(tmpnode.label.toLowerCase().trim() == common.toLowerCase().trim())
				{
				found = nodeid;
				break;
				}
			}
		if(found)
			clouddata.push('<span class="commonconcept existingnode" data-nodeid="'+found+'" data-weight="'+weight+'" style="font-size:'+weight/1.5+'px;">'+common+'</span>');
		else
	   	 	clouddata.push('<span class="commonconcept" data-term="'+common+'" data-weight="'+weight+'" style="font-size:'+weight/1.5+'px;"><i data-original-title="ADD NODE" class="addcommonnode fa fa-lg fa-plus-circle" ></i> '+common+'</span>');

	   };
	for (var x = 0; x < commonwords.length && x < 50; x++)
		{
		var common = commonwords[x];

		var weight = 18;

		var found=false;

		for(var nodeid in supernodeUI)
			{
			var tmpnode = supernodeUI[nodeid].main.data;
			if(tmpnode.label.toLowerCase().trim() == common.toLowerCase().trim())
				{
				found = nodeid;
				break;
				}
			}
		if(found)
			clouddata.push('<span class="commonword existingnode" data-nodeid="'+found+'" data-weight="'+weight+'" style="font-size:'+weight/1.5+'px;">'+common+'</span>');
		else
	   	 	clouddata.push('<span class="commonword" data-term="'+common+'" data-weight="'+weight+'" style="font-size:'+weight/1.5+'px;">'+common+'</span>');

	   	 };
	//console.log(clouddata);
	if(clouddata.length)
		{
		var tagCloudContainer = $('<div class="tagcloudcontainer"></div>');
		var tagCloud = $("<div></div>")
		tagCloud.css(
			{
			width: "100%",
			//height: 400
			});
		clouddata = shuffle(clouddata);
		tagCloud.append(clouddata.join(""));
		$("#edgedata").append('<h4 class="tagcloudtitle">are correlated through the following concepts</h4>');
		tagCloudContainer.append(tagCloud);
		$("#edgedata").append(tagCloudContainer);
		}






	/*
	var settings = {
			 "size" : {
				 "grid" : 16
			 },
			 "options" : {
				 "color" : "random-dark",
				 "printMultiplier" : 3
			 },
			 "font" : "Futura, Helvetica, sans-serif",
			 "shape" : "square"
		 }
	tagCloud.awesomeCloud( settings );
	*/
	}

function highlightEdgeTopics(from,to,topicsdata,commondata)
	{
	var cards=$("#edgedata .card .links");

	topicsdata.sort(function(a,b){return b.length - a.length});

	edgetopiclist = topicsdata;



	var allhighlights = topiclist.concat(topicsdata,commondata);
	allhighlights.sort(function(a,b){return b.length - a.length});

	cards.each(function(i,currentcard)
	 	{
		var text = $(currentcard).html();

		for (var x = 0; x < allhighlights.length; x++)
			{
			var topic = allhighlights[x];
			text = text.highlightAll(topic,"");
			};

		$(currentcard).html(text);
			$(currentcard).parents(".piece").show();

		/*if($(currentcard).find(".highlight,.highlightsentence").length === 0)
			{
			$(currentcard).parents(".piece").remove();
			$.getJSON("/rest/terms/invalidSentence",
				{
				from      : from,
				to        : to,
				sense     : currentsearchdata.sense,
				sentence  : text
				});
			}
		else
			{
			$(currentcard).parents(".piece").show();
			}*/

		});
	if($("#edgedata .piece").length === 0)
		{
		$("#edgedata .sentencetitle").remove();
		}
	}

function setNodeStep(nodeid,step,action)
	{
	if(isNaN(id2step[nodeid]))
		{
		id2step[nodeid] = step;
		if(step2id[step])
			{
			step2id[step].nodelist.push(nodeid);
			}
		else
			{
			step2id[step]=
				{
				action:action,
				nodelist:[nodeid]
				};
			}
		}
	else if(action != "results")
		{
		id2step[nodeid] = step;
		step2id[step]=
			{
			action:action,
			nodelist:[nodeid]
			};

		}
	}

function clearHistory()
	{
	//$.get(endpoints.clearhistory);
	}
function getHari(endpoint,data,callback)
	{
	var url = endpoints[endpoint];
	if($("#toggleendpoint").attr("data-endpoint") != "graph" && docendpoints[endpoint])
		url = docendpoints[endpoint];

	if(endpoint != "search")
		{
		data.graphId = currentsearchdata.graphId
		}
	var requestdata = $.extend({},endpointsdefaults,data);
	if(data.referenceId){
		url = docendpoints[endpoint] + data.referenceId + ".json";
	}
	console.log(url);
	return $.getJSON(url,data,callback);
}


function showBlockingLoader()
	{
	$("#loader").fadeIn();
	$("#graph").addClass("blur");
	}
function hideBlockingLoader()
	{
	$("#loader").fadeOut();
	$("#graph").removeClass("blur");
	}
function showInfoLoader(message)
	{
	$("#infoloader").show();
	if(!message)
		message = "LOADING...";
	//$("#infoloader").html(message);
	//$("#infoloader").addClass("show");

	}
function hideInfoLoader()
	{
		$("#infoloader").hide();
	//$("#infoloader").removeClass("show");
	}
