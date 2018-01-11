const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const {conversion} = require('./helpers/conversion')
const TeaBot = require('teabot')('API', 'investhubbot')
const TableTelegram = require('easy-table')

/*  
    Add command to Tbot
    /info - get coins info
*/

TeaBot.onError(function (e) {
  console.error('Error:', e, e.stack);
})

//Load user Model
require('./models/User')
const User = mongoose.model('users')

require('./models/Case')
const Case = mongoose.model('cases')

require('./models/Coinmarketcup')
const Coin = mongoose.model('coins')

const optionalParams = {
  parse_mode: 'HTML'
}

TeaBot
  .defineCommand('/start', function (dialog) {
    dialog.startAction('setEmail').sendMessage('Enter your Email')
  })
  .defineAction('setEmail', function (dialog, message) {
    const email = message.getArgument()
    if (email.trim() == '') {
      dialog.sendMessage('Email can\'t be empty. Try again');
    } else {
      dialog.setUserData('email', email);
      dialog.endAction().startAction('setPass').sendMessage('Enter your password')
    }
  })
  .defineAction('setPass', function (dialog, message) {
    const pass = message.getArgument()
    const email = (dialog.getUserData('email')).toLowerCase()
    //Search user
    //let coins =  Coin.find(function (err, Coin) {})
    User.findOne({ email: email }, function (err, result) {
      if (err) { console.log(err) }
      //If user not found
      if (!result) {
        dialog.endAction().startAction('setEmail').sendMessage('User not found! Enter your email again')
      }
      //if user enter true email
      if (result) { 
        //Check password
        bcrypt.compare(pass, result.password, function(err, success) {
          if (err) { console.log(err) }
          else if (success) { 
            dialog.setUserData('pass', pass)
            dialog.endAction().sendMessage(`Success. Press /info for more details`)
            //Add user chat_id in mongoose collection User to input telegram (int)
            result.telegram = message.from.id
            result.save()
          } else { 
            dialog.endAction().startAction('setPass').sendMessage(`Wrong password! Enter your password again`)
          }
        })
      }
    })    
  })

TeaBot
  .defineCommand('/info', function (dialog, message) {
    //Search user by chatid
    const chatid = message.from.id

    //Get userid
    User.findOne({ telegram: chatid }, function (err, result) {
      if (err) { console.log(err) }
      if (result) { 
        //Search cases for userid
        Case.find({ user: result._id })
		      .sort({date:'desc'})
		      .then(cases => {
            if (cases.length > 0) {
              //Push cases to helpers/conversion
              (async () => {
                try {
                  //All coins
                  let coins =  await Coin.find(function (err, Coin) {})
                  //Сonversion data
                  let resultData = await conversion(Case, coins, cases)
                  const dataTable = resultData[0].dataArr
                  const dataTotal = resultData[1].dataRes
                    //Create table
                    t = new TableTelegram
                    dataTable.forEach(function(dataTable) {
                      t.cell(`Coin`,    dataTable.name)
                      t.cell(`Profit`,  `${dataTable.profitMoney}$`)
                      t.cell(`Percent`, `${dataTable.percent}%`)
                      t.newRow()
                    })
                    //Send result to user chatid
                    dialog.sendMessage(`<code>${t.toString()}</code>
<b>Input money:</b> ${dataTotal.inputMoneyRes}$
<b>Balance:</b> ${dataTotal.balanceRes}$
<b>Profit money:</b> ${dataTotal.profitMoneyRes}$
<b>Profit percent:</b> ${dataTotal.profitPercentRes}%
`, optionalParams)
                } catch (e) {
                  console.error(e);
                }
              })()
            } else {
              dialog.sendMessage(`You don't have coins. Add coins on site`)
            }
          })
      }

      if (!result) { 
        dialog.startAction('setEmail').sendMessage(`You didn't login! Please, enter your email`)
      }
    })
  })


TeaBot.startPolling();