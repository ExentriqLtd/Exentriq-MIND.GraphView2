fasttemplater =new function()
	{
	var getTemplate = function(templateId) 
		{
        var el = document.getElementById(templateId);
        return el.innerHTML;
		}
	
	this.compile = function(templateId,data)
		{
		var template = getTemplate(templateId);
	    var regexp;
	 
	    for (placeholder in data) 
	    	{
	        regexp = new RegExp('{{' + placeholder + '}}', 'g');
	        template = template.replace(regexp, data[placeholder]);
			}
		
		regexp = new RegExp('scr ipt', 'g');
	    template = template.replace(regexp, "script");

		
	    return template;
		}
	}