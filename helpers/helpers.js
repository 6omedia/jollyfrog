var helpers = {};

function getTrackingCode(domain, apikey){

	var code = '(function(d,j,ak,c){';
    code += 'd.addEventListener("DOMContentLoaded", function(){';
    code += 'j.doIt(ak,c);});';
    code += '}(document, new JFrog("http://' + domain + '"),"' + apikey + '", new ClientJS()));';

	return code;

}

helpers.getTrackingCode = getTrackingCode;

module.exports = helpers;