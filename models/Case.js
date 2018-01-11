const mongoose = require('mongoose')
const Schema = mongoose.Schema

//Create Schema
const CaseSchema = new Schema({
	symbol: {
		type: String,
		required: true
	},
	buy_price: {
		type: String,
		required: true
	},
	coins_count: {
		type: String,
		required: true
	},
	date_buy: {
		type: String,
		default: Date.now
	},
	exchange: {
		type: String,
		default: null
	},
	user: {
		type: String,
		required: true
	},
	date: {
		type: Date,
		default: Date.now
	}
})

mongoose.model('cases', CaseSchema)