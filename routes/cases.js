const experss = require('express')
const mongoose = require('mongoose')
const router = experss.Router()
const {ensureAuthenticated} = require('../helpers/auth')
const {conversion} = require('../helpers/conversion')

//Load Case, Coin Model
require('../models/Case')
const Case = mongoose.model('cases')

require('../models/Coinmarketcup')
const Coin = mongoose.model('coins')

//Case index page
router.get('/', ensureAuthenticated, (req, res) => {
	Case.find({ user: req.user.id })
		.sort({date:'desc'})
		.then(cases => {

			//Query to main data
			(async () => {
				try {
					//All coins
					let coins =  await Coin.find(function (err, Coin) {})
					//Сonversion data
					let resultData = await conversion(Case, coins, cases, req)
					res.render('cases/index', {
						tableData: resultData[0].dataArr,
						generalData: resultData[1].dataRes
					}) 
				}  catch (e) {
					console.error(e);
				}
			})()
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
	if (!req.body.coins_count){
		errors.push({text:'Please add coin count'})
	}
	if (errors.length > 0) {
		res.render('cases/add', {
			errors: errors,
			symbol: req.body.symbol,
			date_buy: req.body.date_buy,
			buy_price: req.body.buy_price,
			coins_count: req.body.coins_count,
			exchange: req.body.exchange
		})
	} else {
		const newUser = {
			symbol: req.body.symbol,
			date_buy: req.body.date_buy,
			buy_price: req.body.buy_price,
			coins_count: req.body.coins_count,
			exchange: req.body.exchange,
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
		cases.date_buy = req.body.date_buy
		cases.buy_price = req.body.buy_price
		cases.coins_count = req.body.coins_count
		cases.exchange = req.body.exchange
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