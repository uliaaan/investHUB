const experss = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const passport = require('passport')
const router = experss.Router()
const {ensureAuthenticated} = require('../helpers/auth')

//Load user Model
require('../models/User')
const User = mongoose.model('users')

//User login route
router.get('/login', (req, res) => {
	const title = 'Login - INVESTHUB'
	res.render('users/login', {
		title: title
	})
})

//User register route
router.get('/register', (req, res) => {
	const title = 'Register - INVESTHUB'
	res.render('users/register', {
		title: title
	})
})

// Users Index Page
router.get('/', ensureAuthenticated, (req, res) => {
	const title = 'Profile - INVESTHUB'
  User.find()
    .then(users => {
      res.render('users/index', {
				users:users,
				title: title
      })
    })
})


//Edit user form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
	const title = 'Edit profile - INVESTHUB'
	User.findOne({
		_id: req.params.id
	})
		.then(user => {
			if(user._id != req.user.id){
				req.flash('error_msg', 'Not Authorized')
				res.redirect('/users')
			} else {
				res.render('users/edit', {
					user:user,
					title: title
				})
			}
		})
})

//Login Form POST
router.post('/login', (req, res, next) => {
	passport.authenticate('local', {
		successRedirect: '/cases',
		failureRedirect: '/users/login',
		failureFlash: true
	})(req, res, next)
})

//Registr form POST
router.post('/register', (req, res) => {
	let errors = []
	if (req.body.password != req.body.password2) {
		errors.push({ text: 'Passwords do not match' })
	}
	if (req.body.password.length < 4) {
		errors.push({ text: 'Passwords must be at least 4 characters' })
	}
	if (errors.length > 0) {
		res.render('users/register', {
			errors: errors,
			name: req.body.name,
			email: req.body.email,
			password: req.body.password,
			password2: req.body.password2
		})
	} else {
		User.findOne({ email: req.body.email })
			.then(user => {
				if (user) {
					req.flash('error_msg', 'Email already registered')
					res.redirect('/users/register')
				} else {
					const newUser = new User({
						name: req.body.name,
						email: req.body.email,
						password: req.body.password
					})
					bcrypt.genSalt(10, (err, salt) => {
						bcrypt.hash(newUser.password, salt, (err, hash) => {
							if (err) throw err
							newUser.password = hash
							newUser.save()
								.then(user => {
									req.flash('success_msg', 'You are now registered')
									res.redirect('/users/login')
								})
								.catch(err => {
									console.log(err)
									return
								})
						})
					})
				}
			})
	}
})

//Logout user
router.get('/logout', (req, res) => {
	req.logout()
	req.flash('success_msg', 'You are logged out')
	res.redirect('/users/login')
})

module.exports = router