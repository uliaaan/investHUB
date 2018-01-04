const experss = require('express')
const mongoose = require('mongoose')
const router = experss.Router()
const {ensureAuthenticated} = require('../helpers/auth')

//Load Case, Coin Model
require('../models/Case')
const Case = mongoose.model('cases')

require('../models/Coinmarketcup')
const Coin = mongoose.model('coins')

//Case index page
router.get('/', /* ensureAuthenticated  ,*/ (req, res) => {
	Case.find({/* user: req.user.id */ })
		.sort({date:'desc'})
		.then(cases => {

			//MainArr with data currencys
			let dataCurrency = []

			Coin.find(function (err, Coin) {
				if (err) return console.error(err)
					//Loop for search in 2 Obj
					for (let i = 0; i < cases.length; i++) {
						for (let j = 0; j < Coin.length; j++ ) {
							if(cases[i].symbol == Coin[j].symbol) {
								data = {}
								//Profit money
								profitMoney = (Coin[j].price_usd - cases[i].buy_price).toFixed(2)
							
								//Percent profit
								percent = (((Coin[j].price_usd * 100) / cases[i].buy_price) - 100).toFixed(2)
							
								//Add to Obj
								data.id = cases[i]._id
								data.number = i + 1
								data.name = cases[i].symbol
								data.buyPrice = cases[i].buy_price
								data.nowPrice = Coin[j].price_usd
								data.profitMoney = profitMoney
								data.percent = percent

								//Push to MainArr data
								dataCurrency.push(data)
							}
						}
					}
				
				//console.log(dataCurrency)
				res.render('cases/index', {
					dataCurrency: dataCurrency
				}) 
			})
		})
})

//Add case form
router.get('/add', ensureAuthenticated, (req, res) => {
	res.render('cases/add')
})

//Edit case form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
	Case.findOne({
		_id: req.params.id
	})
		.then(cases => {
			if(cases.user != req.user.id){
				req.flash('error_msg', 'Not Authorized')
				res.redirect('/cases')
			} else {
				res.render('cases/edit', {
					case:cases
				})
			}
		})
})

//Process Form
router.post('/', ensureAuthenticated, (req, res) => {
	let errors = [];
	if (!req.body.symbol){
		errors.push({text:'Please add symbol'})
	}	
	if (!req.body.buy_price){
		errors.push({text:'Please add buy price'})
	}
	if (errors.length > 0) {
		res.render('cases/add', {
			errors: errors,
			symbol: req.body.symbol,
			buy_price: req.body.buy_price
		})
	} else {
		const newUser = {
			symbol: req.body.symbol,
			buy_price: req.body.buy_price,
			user: req.user.id
		}
		new Case(newUser)
		.save()
		.then(cases => {
			req.flash('success_msg', 'Coin added')
			res.redirect('/cases')
		})
	}
})

//Edit Form process
router.put('/:id', ensureAuthenticated, (req, res) => {
	Case.findOne({
		_id: req.params.id
	})
	.then(cases => {
		//new valus
		cases.symbol = req.body.symbol
		cases.buy_price = req.body.buy_price
		cases.save()
			.then(cases => {
				req.flash('success_msg', 'Coin updated')
				res.redirect('/cases')
			})
	})
})

//Delete Case
router.delete('/:id', ensureAuthenticated, (req, res) => {
	Case.remove({_id:req.params.id})
		.then(() => {
			req.flash('success_msg', 'Coin removed')
			res.redirect('/cases')
		})
})

module.exports = router