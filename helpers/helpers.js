var helpers = {};

function getTrackingCode(domain, apikey){

	var code = '(function(d,j,ak){';
    code += 'd.addEventListener("DOMContentLoaded", function(){';
    code += 'var c = new ClientJS();';
    code += 'j.doIt(ak,c);});';
    code += '}(document, new JFrog("http://' + domain + '"),"' + apikey + '"));';

	return code;

}

helpers.getTrackingCode = getTrackingCode;

module.exports = helpers;