const config = {
  mongoURI: process.env.MONGO_URI,
  TELEGRAM: {
      'apikey': process.env.TELEGRAM_API_KEY,
      'botname': process.env.TELEGRAM_BOT_NAME,
      'adminId': process.env.TELEGRAM_ADMIN_ID
  }
}

module.exports = config