const experss = require('express')
const mongoose = require('mongoose')
const router = experss.Router()
const {ensureAuthenticated} = require('../helpers/auth')

//Load Idea, Coin Model
require('../models/idea')
const Idea = mongoose.model('ideas')

require('../models/Coinmarketcup')
const Coin = mongoose.model('coins')

//Idea index page
router.get('/', /* ensureAuthenticated  ,*/ (req, res) => {
	Idea.find({/* user: req.user.id */ })
		.sort({date:'desc'})
		.then(ideas => {

			//MainArr with data currencys
			let dataCurrency = []

			Coin.find(function (err, Coin) {
				if (err) return console.error(err)
					
					//Loop for search in 2 Obj
					for (let i = 0; i < ideas.length; i++) {
						for (let j = 0; j < Coin.length; j++ ) {
							if(ideas[i].title === Coin[j].symbol) {
								data = {}
								//Profit money
								profitMoney = (Coin[j].price_usd - ideas[i].details).toFixed(2)
								
								//Percent profit
								percent = (((Coin[j].price_usd * 100) / ideas[i].details) - 100).toFixed(2)
							
								//Add to Obj
								data.id = ideas[i]._id
								data.name = ideas[i].title
								data.profitMoney = profitMoney
								data.percent = percent

								//Push to MainArr data
								dataCurrency.push(data)
							}
						}
					}
				
				console.log(dataCurrency)
				res.render('ideas/index', {
					dataCurrency: dataCurrency
				}) 
			})
		})
})

//Add idea form
router.get('/add', ensureAuthenticated, (req, res) => {
	res.render('ideas/add')
})

//Edit idea form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
	Idea.findOne({
		_id: req.params.id
	})
		.then(idea => {
			if(idea.user != req.user.id){
				req.flash('error_msg', 'Not Authorized')
				res.redirect('/ideas')
			} else {
				res.render('ideas/edit', {
					idea:idea
				})
			}
		})
})

//Process Form
router.post('/', ensureAuthenticated, (req, res) => {
	let errors = [];
	if (!req.body.title){
		errors.push({text:'Please add a title'})
	}	
	if (!req.body.details){
		errors.push({text:'Please add some details'})
	}
	if (errors.length > 0) {
		res.render('ideas/add', {
			errors: errors,
			title: req.body.title,
			details: req.body.details
		})
	} else {
		const newUser = {
			title: req.body.title,
			details: req.body.details,
			user: req.user.id
		}
		new Idea(newUser)
		.save()
		.then(idea => {
			req.flash('success_msg', 'Video idea added')
			res.redirect('/ideas')
		})
	}
})

//Edit Form process
router.put('/:id', ensureAuthenticated, (req, res) => {
	Idea.findOne({
		_id: req.params.id
	})
	.then(idea => {
		//new valus
		idea.title = req.body.title
		idea.details = req.body.details
		idea.save()
			.then(idea => {
				req.flash('success_msg', 'Video idea updated')
				res.redirect('/ideas')
			})
	})
})

//Delete Idea
router.delete('/:id', ensureAuthenticated, (req, res) => {
	Idea.remove({_id:req.params.id})
		.then(() => {
			req.flash('success_msg', 'Video idea removed')
			res.redirect('/ideas')
		})
})

module.exports = router