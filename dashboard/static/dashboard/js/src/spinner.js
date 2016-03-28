var spinner = {};

spinner.create = function(el) {
	$(el).html("<div class='spinner-box'><i class='spinner fa fa-spinner fa-4x fa-pulse'></i><div>");
}

// TO-DO: make this smarter so that if there are multiple spinners
// on the page, this removes a specific spinner instead of any spinner
spinner.destroy = function(){
	$('.spinner-box').remove();
}

module.exports = spinner;