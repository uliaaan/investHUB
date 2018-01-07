const mongoose = require('mongoose')
const Schema = mongoose.Schema

//Create Schema
const UserSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	date: {
		type: Date,
		default: Date.now
	},
	telegram: {
		type: Number,
		default: null
	}
})

mongoose.model('users', UserSchema)