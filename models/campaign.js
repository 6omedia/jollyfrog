var mongoose = require('mongoose');

let CampaignSchema = new mongoose.Schema({
    name: String,
    outcomes: [{
        awareness: Array,
        research: Array,
        comparison: Array,
        purchase: Array
    }]
});

var Campaign = mongoose.model('Campaign', CampaignSchema);
module.exports = Campaign;