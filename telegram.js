const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const TeaBot = require('teabot')('api', 'botname')

TeaBot.onError(function (e) {
  console.error('Error:', e, e.stack);
})

//Load user Model
require('./models/User')
const User = mongoose.model('users')

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
    const email = dialog.getUserData('email')
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
            dialog.endAction().sendMessage('Success. Press /case for more details')
            //Add user chat_id in mongoose collection User to input telegram (int)
            result.telegram = message.from.id
            result.save()
          } else { 
            dialog.endAction().startAction('setPass').sendMessage('Wrong password! Enter your password again')
          }
        })
      }
    })    
  })


TeaBot.startPolling();