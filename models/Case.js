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