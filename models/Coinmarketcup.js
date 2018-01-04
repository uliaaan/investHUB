const mongoose = require('mongoose')
const Schema = mongoose.Schema

//Create Schema
const CoinSchema = new Schema({
	id: {
		type: String,
		required: true
	},
	name: {
		type: String,
		required: true
	},
	symbol: {
		type: String,
		required: true
	},
	rank: {
		type: String,
		required: true
	},
	price_usd: {
		type: String,
		required: true
	}
})

mongoose.model('coins', CoinSchema)