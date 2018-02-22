const express = require('express')
const path = require('path')
const exphbs  = require('express-handlebars')
const methodOverride = require('method-override')
const flash = require('connect-flash')
const session = require('express-session')
const bodyParser = require('body-parser')
const passport = require('passport')
const mongoose = require('mongoose')
const request = require('request')
const telegram = require('./telegram')

const app = express()

//Load routes
const cases = require('./routes/cases')
const users = require('./routes/users')

//Pasport config
require('./config/passport')(passport)

//DB config
const db = require('./config/database')

//Connect to mongoose
mongoose.connect(db.mongoURI, {
	useMongoClient: true
})
	.then(() => console.log('MongoDB connected...'))
	.catch(err => console.log(err))


//Handlebars Middleware
app.engine('handlebars', exphbs({
	defaultLayout: 'main'
}))
app.set('view engine', 'handlebars')

//Body parser middleware
app.use(bodyParser.urlencoded({ extended:false }))
app.use(bodyParser.json())

//Static folder
app.use(express.static(path.join(__dirname, 'public')))

//Method override middleware
app.use(methodOverride('_method'))

//Express session midleware
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}))

//passort middleware
app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

//Global variables
app.use(function(req, res, next) {
	res.locals.success_msg = req.flash('success_msg')
	res.locals.error_msg = req.flash('error_msg')
	res.locals.error = req.flash('error')
	res.locals.user = req.user || null
	next()
})

//Route
app.get('', (req, res) => {
	const title = 'INVESTHUB'
	res.render('index', {
		title: title
	})
})

//About Route
app.get('/about', (req, res) => {
	res.render('about')
})

//Use routes
app.use('/cases', cases)
app.use('/users', users)

//Load coins Model
require('./models/Coinmarketcup')
const Coin = mongoose.model('coins')

const url = 'https://api.coinmarketcap.com/v1/ticker/?limit=1000'


//Get data from coinmarketcup to monog
setInterval(function() {
	request({
		url: url,
		json: true
	}, function (error, response, body) {
			//Drop coins data
			Coin.collection.drop()
	
			//Add coins data
			Coin.create(body)
	})
	//console.log('Update base')
}, 60000)

const port = process.env.PORT || 5000

app.listen(port, () => {
	console.log(`Server investHUB start port ${port}`)
})