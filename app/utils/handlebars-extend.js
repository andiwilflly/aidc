/**
 * Block helpers make it possible to define custom iterators and
 * other functionality that can invoke the passed block with a new context.
 * http://handlebarsjs.com/block_helpers.html
 */


Handlebars.registerHelper('url', function(url, options) {
	return new Handlebars.SafeString(
		'<a class="simple-link" href=' + url + '>' + options.fn(this) + '</a>'
	);
});


// {{#each data}}  {{firstName}} {{lastName}} {{/each}}
Handlebars.registerHelper('each', function(context, index, options) {
	var res = "";

	if(!options) {
		options = index;
		for (var i = 0; i < context.length; i++) {
			res = res + options.fn(context[i]);
		}
	} else {
		res = res + options.fn(context[index]);
	}

	return res;
});


// {{#list people}}  {{firstName}} {{lastName}} {{/list}}
Handlebars.registerHelper('list', function(items, options) {
	var out = "";
	for (var i = 0, l = items.length; i < l; i++) {
		out = out + options.fn(items[i]);
	}
	return out + "";
});


// {{#equal status "new" }} then {{/equal}}
/*{{#equal training_started 0.01 }}
0
{{else}}
{{ training_started }}
{{/equal}}*/
Handlebars.registerHelper("equal", function(lvalue, rvalue, options) {
	if (arguments.length < 3) {
		throw new Error("Handlebars Helper equal needs 2 parameters");
	}
	if (lvalue === '' || typeof lvalue == 'undefined') {
		lvalue = 0;
	}

	if (lvalue !== rvalue) {
		return options.inverse(this);
	} else {
		return options.fn(this);
	}
});


/*
{{#if isActive}}
	<img src="star.gif" alt="Active">
 {{else}}
	<img src="cry.gif" alt="Inactive">
{{/if}}
*/
Handlebars.registerHelper('if', function(conditional, options) {
	if(conditional) {
		return options.fn(this);
	} else {
		return options.inverse(this);
	}
});

Handlebars.registerHelper('dateReplaceDotOnSlash', function(date) {
	date = Handlebars.escapeExpression(date);
	date = date.replace(/\./g, "/");
	return new Handlebars.SafeString(date);
});

Handlebars.registerHelper('unless', function(conditional, options) {
	if(conditional) {
		return options.inverse(this);
	} else {
		return options.fn(this);
	}
});

/**
 * Block helpers convert empty string in non-breaking space.
 * Need to fix bug in firefox for table-cell height.
 */
Handlebars.registerHelper('emptyStrInNbsp', function(str) {
	str = Handlebars.escapeExpression(str);
	if( str == ""){
		str = '&nbsp;n/a';
	}
	return new Handlebars.SafeString(
		str
	);
});

Handlebars.registerHelper('dateEmptyStrInNbsp', function(str) {
	str = Handlebars.escapeExpression(str);
	if( str == "") {
		str = '&nbsp;n/a';
	} else {
		str = parseInt(str) * 1000;

		var _day = ((new Date(str).getDate()).toString().length == 2) ? new Date(str).getDate() : '0' + new Date(str).getDate();
		var _month = ((new Date(str).getMonth() + 1).toString().length == 2) ? new Date(str).getMonth() + 1 : '0' + (new Date(str).getMonth() + 1);
		var _year = '20' + (new Date(str).getYear() + '').slice(1);

		str = _day + '-' + _month + '-' + _year;
	}

	return new Handlebars.SafeString(
		str
	);
});

Handlebars.registerHelper('getWeek', function(date) {
	date = Handlebars.escapeExpression(date).split('.');
	date = new Date(date[2], date[1] - 1, date[0] - 1).getWeek();

	return new Handlebars.SafeString(
		date
	);
});


