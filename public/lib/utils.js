
String.prototype.replaceAll = function(str1, str2, ignore)
	{
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), (ignore ? "gi" : "g")), (typeof(str2) == "string") ? str2.replace(/\$/g, "$$$$") : str2);
	};
String.prototype.highlightAll = function(topic,additionaltype)
	{
    topic = topic.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&").trim();
    var start = /^/;
    var p = /([\"\'\,\.\s])/;
    var single = new RegExp("("+topic + ")" , "gmi");
    var plural = new RegExp("("+topic + "s)", "gmi");
    var tmp = this.replace(new RegExp(
        start.source +
        single.source +
        p.source, "gmi"), "<b class=\"ui highlight"+additionaltype+" \">$1</b>" + "$2");
    tmp = tmp.replace(new RegExp(
        start.source +
        plural.source +
        p.source, "gmi"), "<b class=\"ui highlight"+additionaltype+"\">$1</b>" + "$2");
    tmp = tmp.replace(new RegExp(
        p.source +
        single.source +
        p.source, "gmi"), "$1" + "<b class=\"ui highlight"+additionaltype+"\">$2</b>" + "$3");
    tmp = tmp.replace(new RegExp(
        p.source +
        plural.source +
        p.source, "gmi"), "$1" + "<b class=\"ui highlight"+additionaltype+"\">$2</b>" + "$3");
    return tmp;
    //return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
	};


function formObject(formid)
	{
	var object   = {};
	console.log($("#"+formid+" :input"));
	$("#"+formid+" :input").each(function(i, el) 
		{
		var $el = $(el);
		console.log($el,$el.attr("name"));
		if($el.attr("name"))
			{
			object[$el.attr("name")] = $el.val();
			}
		});
	return object;
	}

function shuffle(array) 
	{
	var currentIndex = array.length , temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  	while (0 !== currentIndex) 
  		{

	    // Pick a remaining element...
	    randomIndex = Math.floor(Math.random() * currentIndex);
	    currentIndex -= 1;
	
	    // And swap it with the current element.
	    temporaryValue = array[currentIndex];
	    array[currentIndex] = array[randomIndex];
	    array[randomIndex] = temporaryValue;
		}

	return array;
	}
function sign(x)
	{
    return typeof x === 'number' ? x ? x < 0 ? -1 : 1 : x === x ? 0 : NaN : NaN;
	}
function shuffle(o)
	{
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
	};
function lineDistance( point1, point2 )
	{
	var xs = 0;
	var ys = 0;

	xs     = point2.x - point1.x;
	xs     = xs * xs;

	ys     = point2.y - point1.y;
	ys     = ys * ys;

  	return Math.sqrt( xs + ys );
	}

function shadeColor(color, percent)
	{
	percent = percent || 0;
    var num = parseInt(color.slice(1),16), amt = Math.round(2.55 * percent), R = (num >> 16) + amt, G = (num >> 8 & 0x00FF) + amt, B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
	}
function str2hex(string)
	{
	return parseInt(string.slice(1),16);
	}

function sqr(x) { return x * x }
function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y) }
function distToSegmentSquared(p, v, w)
	{
  	var l2 = dist2(v, w);
  	if (l2 == 0) return dist2(p, v);
  	var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  	if (t < 0) return dist2(p, v);
  	if (t > 1) return dist2(p, w);
  	return dist2(p, { x: v.x + t * (w.x - v.x),
                    y: v.y + t * (w.y - v.y) });
	}
function distToSegment(p, v, w) { return Math.sqrt(distToSegmentSquared(p, v, w))}


// Scales
colorindex=0;
colormap=
	{
	"architecture and design" : "#c37b88",
	"arts" : "#dd8b8b",
	"banking and finance" : "#94c37b",
	"business" : "#95BADD",
	"computers and internet" : "#C47272",
	"education" : "#ddc78b",
	"engineering" : "#6287AA",
	"food and drinks" : "#d5dd8b",
	"geography" : "#7BAA62",
	"government and politics" : "#b7dd8b",
	"health and wellness" : "#F6BBAE",
	"history" : "#99dd8b",
	"humanities" : "#7bc37c",
	"math and physics" : "#8bdd9b",
	"music" : "#7bc397",
	"nature" : "#8bddb9",
	"recreation" : "#7bc3b1",
	"religion" : "#8bddd7",
	"science" : "#7bbbc3",
	"social science" : "#8bc4dd",
	"society and culture" : "#7ba0c3",
	"sport" : "#8ba6dd",
	"telecommunications" : "#C8EDFF",
	"transportation" : "#AA626F",
	};
colormap_backup=
	{
	"architecture and design" : "#c37b88",
	"arts" : "#dd8b8b",
	"banking and finance" : "#c3887b",
	"business" : "#dda98b",
	"computers and internet" : "#c3a37b",
	"education" : "#ddc78b",
	"engineering" : "#c3bd7b",
	"food and drinks" : "#d5dd8b",
	"geography" : "#afc37b",
	"government and politics" : "#b7dd8b",
	"health and wellness" : "#94c37b",
	"history" : "#99dd8b",
	"humanities" : "#7bc37c",
	"math and physics" : "#8bdd9b",
	"music" : "#7bc397",
	"nature" : "#8bddb9",
	"recreation" : "#7bc3b1",
	"religion" : "#8bddd7",
	"science" : "#7bbbc3",
	"social science" : "#8bc4dd",
	"society and culture" : "#7ba0c3",
	"sport" : "#8ba6dd",
	"telecommunications" : "#7b86c3",
	"transportation" : "#8e8bdd",
	};

basecolors = 
	[
	"#c37b88",
	"#dd8b8b",
	"#c3887b",
	"#dda98b",
	"#c3a37b",
	"#ddc78b",
	"#c3bd7b",
	"#d5dd8b",
	"#afc37b",
	"#b7dd8b",
	"#94c37b",
	"#99dd8b",
	"#7bc37c",
	"#8bdd9b",
	"#7bc397",
	"#8bddb9",
	"#7bc3b1",
	"#8bddd7",
	"#7bbbc3",
	"#8bc4dd",
	"#7ba0c3",
	"#8ba6dd",
	"#7b86c3",
	"#8e8bdd",
	]








colors = shuffle(basecolors);

function colorscale(fullcategory)
	{
	var splitted = fullcategory.split("/");
	var category = splitted[0].toLowerCase().trim();
	
	if(!colormap[category])
		{
		colormap[category]=colors[colorindex];
		colorindex++;
		if(colorindex>=colors.length)
			colorindex=0;
		}
	return colormap[category];
	}
	
function colorGenerator(saturation)
	{
	var colorlist = [];
	for(var x=0;x<24;x++)
		{
		var rgb = HSV2RGB(
			{
			hue:-11+x*11,
			saturation:saturation || 30.8,
			value:81.6  + (x%2 ? 5 : -5)
			});
		colorlist.push("#"+rgb.r.toString(16)+rgb.g.toString(16)+rgb.b.toString(16));
		}
	return colorlist;
	}
function RGB2HSV(rgb) {
    hsv = new Object();
    max=max3(rgb.r,rgb.g,rgb.b);
    dif=max-min3(rgb.r,rgb.g,rgb.b);
    hsv.saturation=(max==0.0)?0:(100*dif/max);
    if (hsv.saturation==0) hsv.hue=0;
    else if (rgb.r==max) hsv.hue=60.0*(rgb.g-rgb.b)/dif;
    else if (rgb.g==max) hsv.hue=120.0+60.0*(rgb.b-rgb.r)/dif;
    else if (rgb.b==max) hsv.hue=240.0+60.0*(rgb.r-rgb.g)/dif;
    if (hsv.hue<0.0) hsv.hue+=360.0;
    hsv.value=Math.round(max*100/255);
    hsv.hue=Math.round(hsv.hue);
    hsv.saturation=Math.round(hsv.saturation);
    return hsv;
}

// RGB2HSV and HSV2RGB are based on Color Match Remix [http://color.twysted.net/]
// which is based on or copied from ColorMatch 5K [http://colormatch.dk/]
function HSV2RGB(hsv) {
    var rgb=new Object();
    if (hsv.saturation==0) {
        rgb.r=rgb.g=rgb.b=Math.round(hsv.value*2.55);
    } else {
        hsv.hue/=60;
        hsv.saturation/=100;
        hsv.value/=100;
        i=Math.floor(hsv.hue);
        f=hsv.hue-i;
        p=hsv.value*(1-hsv.saturation);
        q=hsv.value*(1-hsv.saturation*f);
        t=hsv.value*(1-hsv.saturation*(1-f));
        switch(i) {
        case 0: rgb.r=hsv.value; rgb.g=t; rgb.b=p; break;
        case 1: rgb.r=q; rgb.g=hsv.value; rgb.b=p; break;
        case 2: rgb.r=p; rgb.g=hsv.value; rgb.b=t; break;
        case 3: rgb.r=p; rgb.g=q; rgb.b=hsv.value; break;
        case 4: rgb.r=t; rgb.g=p; rgb.b=hsv.value; break;
        default: rgb.r=hsv.value; rgb.g=p; rgb.b=q;
        }
        rgb.r=Math.round(rgb.r*255);
        rgb.g=Math.round(rgb.g*255);
        rgb.b=Math.round(rgb.b*255);
    }
    return rgb;
}

//Adding HueShift via Jacob (see comments)
function HueShift(h,s) { 
    h+=s; while (h>=360.0) h-=360.0; while (h<0.0) h+=360.0; return h; 
}

//min max via Hairgami_Master (see comments)
function min3(a,b,c) { 
    return (a<b)?((a<c)?a:c):((b<c)?b:c); 
} 
function max3(a,b,c) { 
    return (a>b)?((a>c)?a:c):((b>c)?b:c); 
}


function mmDistance(main,piece,depth)
	{
	var distance = 0;
	if(main.indexOf(piece) == -1)
		{
		distance = 0.1;
		depth ++;
		if(depth < 5)
			{
			var splitted = splitString(piece);
			if(splitted)
				{
				//console.log(splitted);
				distance += 0.5 * mmDistance(main,splitted[0],depth);
				distance += 0.5 * mmDistance(main,splitted[1],depth);
				}
			else
				{
				distance = 1;
				}
			}
		else
			{
			distance = 1;
			}
		}
	return distance;
	}
	
function splitString(str) 
	{
	str = str.trim();
	var index = Math.ceil(str.length/2);
	var delim = /\s|[,\.]/; 
	var ch;
	var i;

	for(var x = 0; x < index;x++)
		{
		if(index+x < str.length && delim.test(str.charAt(index+x)))
			{
			i = index+x;
			break;
			}
		if(index-x > 0 && delim.test(str.charAt(index-x)))
			{
			i = index-x;
			break;
			}
		}

	if (i) 
		{
		return [str.substring(0,i).trim(),str.substring(i+1).trim()];
		}
	}

function splitStringRight(str,pos) 
	{
	str = str.trim();
	var index = pos;
	var delim = /\s|[,\.]/; 
	var ch;
	var i;

	for(var x = 0; x < str.length - pos;x++)
		{
		if(index+x < str.length && delim.test(str.charAt(index+x)))
			{
			i = index+x;
			break;
			}
		}

	if (i) 
		{
		return [str.substring(0,i).trim(),str.substring(i+1).trim()];
		}
	}
	
function truncateTitle(title,len,extended)
	{
	if(title.length > len)
		{
		newtitle = title.substring(0,len-3);
		if(extended)
			{
			newtitle += " <span class='extendtitle' data-original-title='MORE' data-extendedtitle='"+title.replace(/'/ig,"&#180;")+"'>...<span>";
			}
		else
			newtitle += "...";
		return newtitle;
		}
	else
		return title;
	}