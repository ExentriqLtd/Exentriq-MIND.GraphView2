enabledtopics=[];

filters = {}

function startFilters(maintopics,create)
	{
	if(create)
		filters = {}
	for(var key in maintopics)
		{
		var splitted = key.split("/");
		var category = splitted[0].toLowerCase().trim();
		if(!filters[category])
			{
			filters[category] =
				{
				key:category,
				value:maintopics[key],
				enabled : true
				}
			}
		else
			{
			filters[category].value+=maintopics[key];
			}
		}
	var maintopiclist = $.map(filters, function (value, key) { return value; });
	maintopiclist.sort(function(a,b){return b.value - a.value;});

	$("#filterlist").html("");
	//$("#filterlist").html("<button style=\"background-color:#B6212D\" class=\"filter filterall\">NONE</button>");
	for(var x = 0 ;x < maintopiclist.length;x++)
		{
		var key = maintopiclist[x].key;
		
		var classname = filters[key].enabled ? "filter" : "filter disabled"
		
		var filter=$("<button data-filter=\""+key+"\" style=\"background-color:"+colorscale(key)+"\" class=\""+classname+"\">"+key+"</button>")
		filter.data("filter",key);
		$("#filterlist").append(filter);
		
		}
	}

$(document).ready(function()
	{
	filters = {}
	$("#filterlist").off("click");
	$("#filterlist").on("click",".filter",function()
		{
		var filter=$(this).data("filter");
		if(filter)
			{
			filters[filter].enabled = !filters[filter].enabled;
			$(this).toggleClass("disabled",!filters[filter].enabled);
			}
		else
			{
			if(enabledtopics.length===0)
				{
				$(".filterall")
					.css("background-color","#B6212D")
					.text("NONE");
				enabledtopics=[];
				var filterElements=$(".filter[data-filter]");
				filterElements.removeClass("disabled");
				for(var x=0;x<filterElements.length;x++)
					{
					var f=$(filterElements[x]).data("filter");
					if(f)
						{
						enabledtopics.push(f);
						}
					}
				}
			else
				{
				$(".filterall")
					.css("background-color","#097054")
					.text("ALL");
				$(".filter[data-filter]").addClass("disabled");
				enabledtopics=[];
				}
			}
		doFilterAlternate();
		});
	});


function doFilter()
	{
	for(var x=0; x< haridata.nodes.length; x++)
		{
		var node = haridata.nodes[x];
		node.hidden = true;
		for(var key in node.topics)
			{
			if(enabledtopics.indexOf(key)>-1)
				{
				node.hidden = false;
				break;
				}
			}
		}
	filterCard();
	//filterGraph(enabledtopics);

	}


function doFilterAlternate()
	{
	for(var x=0; x< haridata.nodes.length; x++)
		{
		var node = haridata.nodes[x];
		var key = node.sortedTopics[0].key;
		var splitted = key.split("/");
		var category = splitted[0].toLowerCase().trim();
		node.hidden = !filters[category].enabled;
		
		/*
		for(var key in node.topics)
			{
			if(enabledtopics.indexOf(key)>-1)
				{
				node.hidden = false;
				break;
				}
			}
		*/
		}
	filterCard();
	//filterGraph(enabledtopics);

	}