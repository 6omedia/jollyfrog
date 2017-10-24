var async = require('async');
function insertDocs(Model, docs, done){

	async.each(docs, function(doc, callback){

		Model.create(doc, function(err, doc){
			callback();
		});

	});

	done();

}

module.exports = insertDocs;