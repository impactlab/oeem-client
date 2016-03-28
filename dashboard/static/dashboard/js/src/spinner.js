var spinner = {};

spinner.create = function(el, spinner_id) {
	$(el).html("<div class='spinner-box' id='"+spinner_id+"''><i class='spinner fa fa-spinner fa-4x fa-pulse'></i><div>");
}

// TO-DO: make this smarter so that if there are multiple spinners
// on the page, this removes a specific spinner instead of any spinner
spinner.destroy = function(spinner_id){
	$('#'+spinner_id).remove();
}

module.exports = spinner;