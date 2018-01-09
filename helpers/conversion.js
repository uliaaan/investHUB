module.exports = {
  conversion: function (Case, coins, cases, req) {
      //coins.find(function (err, coins) {
      //})
      //if (err) return console.error(err)
      let dataRes = {}
      let dataCurrency = []
      let dataArr = []
      
      let profitMoneyRes = 0
      let profitPercentRes = 0
      let inputMoneyRes = 0
      let balanceRes = 0
      let countcoinss = 0
      //Loop for search in 2 Obj
      for (let i = 0; i < cases.length; i++) {
        for (let j = 0; j < coins.length; j++) {
          if (cases[i].symbol == coins[j].symbol) {
            data = {}
            //Price now
            nowPrice = cases[i].coins_count * coins[j].price_usd

            //Price buy
            buyPrice = cases[i].coins_count * cases[i].buy_price
            inputMoneyRes += Number(buyPrice)
            //Balance now
            balanceRes += Number(nowPrice)
            //Profit money
            profitMoney = (nowPrice - buyPrice).toFixed(2)
            profitMoneyRes += Number(profitMoney)
            //Percent profit
            percent = (((coins[j].price_usd * 100) / cases[i].buy_price) - 100).toFixed(2)
            //Count coins
            countcoinss++
            //Add to Obj
            data.id = cases[i]._id
            data.number = i + 1
            data.name = cases[i].symbol
            data.buyPrice = cases[i].buy_price
            data.nowPrice = coins[j].price_usd
            data.coinCount = cases[i].coins_count
            data.profitMoney = profitMoney
            data.percent = percent
            data.dateBuy = (cases[i].date_buy).toLocaleDateString().replace(/\-/g,'.')
            data.exchange = cases[i].exchange

            //Push to MainArr data
            dataArr.push(data)
          }
        }
      }
      table = {dataArr}
      dataCurrency.push(table)

      profitPercentRes = (profitMoneyRes * 100) / inputMoneyRes
      dataRes.profitMoneyRes = profitMoneyRes.toFixed(2)
      dataRes.profitPercentRes = profitPercentRes.toFixed(2)
      dataRes.inputMoneyRes = inputMoneyRes.toFixed(2)
      dataRes.balanceRes = balanceRes.toFixed(2)

      resIndo = {dataRes}
      dataCurrency.push(resIndo)

      //console.log(dataCurrency[0].dataArr[0])
      return dataCurrency 
  }
}