<template>
  <v-app>
    <v-toolbar fixed app class="blue-grey darken-1">
      <v-avatar><img src="favicon-256.png" alt=""></v-avatar>
      <v-toolbar-title v-text="title" class="white--text"></v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-title class="white--text">Pairs: {{socketData.length}}</v-toolbar-title>
      <v-toolbar-title class="white--text">Waiting to be sold: {{waitingToSell}}</v-toolbar-title>
    </v-toolbar>
    

    <v-content>
      <v-container fluid>
        <v-card v-for="(item, key) in groupedMarkets" :key="key + 'resultCard'" class="mb-3">
          <v-card-title class="grey lighten-2">
                <b>{{key.toUpperCase()}}</b>                        
          </v-card-title>
          <v-card-text>
            <v-layout justify-center text-xs-center class="blue-grey lighten-4">
              <v-flex class="align-center" v-for="(funds, idx) in getStats(key)" :key="'available'+idx+funds.currency">
                  <b>{{funds.currency}}</b> <small>available:</small><b>{{funds.availableFunds.toFixed(6)}}</b>, <small>locked in trades:</small><b>{{funds.sumBaseValue.toFixed(6)}}</b>, <small>total:</small><b>{{(funds.sumBaseValue + funds.availableFunds).toFixed(6)}}</b>
              </v-flex>     
            </v-layout>
            <v-data-table 
              :key="key + 'resultTable'"
              :items="item"
              item-key="tradePair"
              class="mb-3"
              :headers="tableHeaders"
              :pagination.sync="pagination"
              expand
            >
              <template slot="items" slot-scope="props">
                <tr @click="props.expanded = !props.expanded" :class="{'teal accent-1': props.item.waitFor === 'buy', 'orange lighten-5': props.item.waitFor === 'sell'}">
                  <td><b>{{ props.item.tradePair }}</b></td>
                  <td><b>{{ props.item.waitFor }}</b></td>
                  <td>{{ props.item.strategy}}</td>
                  <td class="text-xs-right"><b>{{ props.item.coins ? parseFloat(props.item.coins).toFixed(6) : 0 }}</b></td>
                  <td class="text-xs-right"><b>{{ props.item.baseValue ? parseFloat(props.item.baseValue).toFixed(6) : 0 }}</b></td>
                  <td class="text-xs-right" :class="props.item.currentProfitWithPercent.color+'--text text-darken-4'">
                    {{props.item.currentProfitWithPercent.profit ? props.item.currentProfitWithPercent.profit.toFixed(6) : ''}}
                  </td>
                  <td class="text-xs-right" :class="props.item.currentProfitWithPercent.color+'--text text-darken-4'">
                    {{props.item.currentProfitWithPercent.percent ? props.item.currentProfitWithPercent.percent + ' %' : ''}}
                  </td>
                  <td class="text-xs-right">{{ props.item.lastPrice ? parseFloat(props.item.lastPrice).toFixed(6) : 0 }}</td>
                  <td class="text-xs-right" :class="props.item.buyBoughtPrice.color+'--text text--darken-4'">{{ props.item.buyBoughtPrice.price }}</td>
                  <td class="text-xs-right">{{ props.item.sellPrice ? parseFloat(props.item.sellPrice).toFixed(6) : 'N/A' }}</td>
                  <td class="text-xs-right" :class="props.item.priceDifference.color+'--text'">{{ props.item.priceDifference ? props.item.priceDifference.difference : 'N/A' }}</td>
                  <td class="text-xs-right" :class="props.item.priceDifference.color+'--text'">{{ props.item.priceDifference && props.item.priceDifference.percent ? props.item.priceDifference.percent + ' %' : ''}}</td>
                  <td class="text-xs-right"><b>{{props.item.buyCounter ? props.item.buyCounter : 0}}</b> <br> {{props.item.lastTimeStampBuy | fromNow}}</td>
                  <td class="text-xs-right"><b>{{props.item.sellCounter ? props.item.sellCounter : 0}}</b><br> {{props.item.lastTimeStampSell | fromNow}}</td>
                </tr>
              </template>
              <template slot="expand" slot-scope="props">
                <v-card flat>
                  <v-card-text>
                    <v-layout row>
                      <v-flex xs12 v-if="props.item.buys">
                        <v-layout row class="grey lighten-3">
                          <v-flex text-xs-left>Time:</v-flex>
                          <v-flex text-xs-center>1h</v-flex>
                          <v-flex text-xs-center>6h</v-flex>
                          <v-flex text-xs-center>12h</v-flex>
                          <v-flex text-xs-center>24h</v-flex>
                          <v-flex text-xs-center>+</v-flex>
                        </v-layout>
                         <v-layout row class="green lighten-3">
                          <v-flex text-xs-left><h4>Buys:</h4></v-flex>
                          <v-flex text-xs-center><b>{{props.item.buys['1hr']}}</b></v-flex>
                          <v-flex text-xs-center><b>{{props.item.buys['6hr']}}</b></v-flex>
                          <v-flex text-xs-center><b>{{props.item.buys['12hr']}}</b></v-flex>
                          <v-flex text-xs-center><b>{{props.item.buys['24hr']}}</b></v-flex>
                          <v-flex text-xs-center><b>{{props.item.buys['older']}}</b></v-flex>
                        </v-layout>
                        <v-layout row class="red lighten-3">
                          <v-flex text-xs-left><h4>Sells:</h4></v-flex>
                          <v-flex text-xs-center><b>{{props.item.sells['1hr']}}</b></v-flex>
                          <v-flex text-xs-center><b>{{props.item.sells['6hr']}}</b></v-flex>
                          <v-flex text-xs-center><b>{{props.item.sells['12hr']}}</b></v-flex>
                          <v-flex text-xs-center><b>{{props.item.sells['24hr']}}</b></v-flex>
                          <v-flex text-xs-center><b>{{props.item.sells['older']}}</b></v-flex>
                        </v-layout>
                        <v-layout row class="teal lighten-4">
                          <v-flex text-xs-left><b>Total:</b></v-flex>
                          <v-flex text-xs-center><b>{{props.item.sells['1hr'] + props.item.buys['1hr']}}</b></v-flex>
                          <v-flex text-xs-center><b>{{props.item.sells['6hr'] + props.item.buys['6hr']}}</b></v-flex>
                          <v-flex text-xs-center><b>{{props.item.sells['12hr'] + props.item.buys['12hr']}}</b></v-flex>
                          <v-flex text-xs-center><b>{{props.item.sells['24hr'] + props.item.buys['24hr']}}</b></v-flex>
                          <v-flex text-xs-center><b>{{props.item.sells['older'] + props.item.buys['older']}}</b></v-flex>
                        </v-layout>
                      </v-flex>
                    </v-layout>
                   
                  </v-card-text>
                </v-card>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-container>
    </v-content>
    <v-footer fixed app class="blue-grey darken-1 white--text">
      <span>Gunbot-Monitor Enhanced</span>
      <v-spacer></v-spacer>
      <span v-if="lastRefresh">
        last Refresh: {{lastRefresh.toString() | formatDate}}
      </span>
    </v-footer>
  </v-app>
</template>

<script>
import _ from "lodash";
import moment from "moment";
export default {
  data() {
    return {
      socketData: [],
      pagination: {
        rowsPerPage: '25'
      },
      lastRefresh: null,
      title: "Gunbot-Monitor",
      tableHeaders: [
        { text: "Pair", sortable: true, value: "tradePair" },
        { text: "Wait to", sortable: true, value: "waitFor" },
        { text: "Strategy", sortable: true, value: "strategy" },
        { text: "Coins", sortable: true, value: "coins", align: "right" },
        { text: "in Base", sortable: true, value: "baseValue", align: "right" },
        { text: "Diff since buy", sortable: true, value: "currentProfitWithPercent.profit", align: "right" },
        { text: "buy %", sortable: true, value: "currentProfitWithPercent.percent", align: "right" },
        {
          text: "Last Price",
          sortable: true,
          value: "lastPrice",
          align: "right"
        },
        {
          text: "Buy/Bought",
          sortable: true,
          value: "buyboughtPrice.price",
          align: "right"
        },
        {
          text: "Sell Price",
          sortable: true,
          value: "sellPrice",
          align: "right"
        },
        {
          text: "Price diff.",
          sortable: true,
          value: "priceDifference.difference",
          align: "right"
        },
        {
          text: "price %",
          sortable: true,
          value: "priceDifference.percent",
          align: "right"
        },
        {
          text: "# Buys",
          sortable: true,
          value: "buyCounter",
          align: "right"
        },{
          text: "# Sells",
          sortable: true,
          value: "sellCounter",
          align: "right"
        }        
      ]
    };
  },
  filters: {
    fromNow(date) {
      if (!date) return;
      
      return moment(date).fromNow(true);
    },
    formatDate(date){
      if(!date || date === '') return;

      return moment(new Date(date)).format("llll")
    }
  },
  computed: {
    sellStats(){
      return this.sumWaitingForSell()
    },
    groupedMarkets() {
      return _.groupBy(this.socketData, "market");
    },
    waitingToSell() {
      return _.sum(
        _.map(this.socketData, function(o) {
          if (o.waitFor === "sell") {
            return 1;
          }
          return 0;
        })
      );
    },
  },
  created() {
    let self = this;
    this.$options.sockets.onmessage = message => {
      let data = JSON.parse(message.data);
      if (data.emitValues && data.emitValues.length > 0) {
        self.lastRefresh = new Date();
        data.emitValues.forEach(function(item) {
          let idx = _.findIndex(self.socketData, {
            market: item.market,
            tradePair: item.tradePair
          });
          item["currency"] = item.tradePair.split("-")[0];
          item["asset"] = item.tradePair.split("-")[1];
          item["priceDifference"] = self.priceDiff(
            item.buyPrice,
            item.sellPrice,
            item.lastPrice,
            item.coins
          );
          item["buyBoughtPrice"] = self.buyPrice(
            item.coins,
            item.boughtPrice,
            item.buyPrice
          );
          item["waitFor"] = self.getMode(item);
          item["baseValue"] =
              item.waitFor === 'sell' && item.coins && item.lastPrice
              ? parseFloat(item.coins) * parseFloat(item.lastPrice)
              : 0;

          item["isLockedForTrade"] = item.waitFor === 'sell' 
          item['currentProfitWithPercent'] = self.currentProfitWithPercent(item.coins, item.boughtPrice, item.lastPrice)

          if (idx !== -1) {
            ///console.log("replace", item.market, item.tradePair)
            self.socketData.splice(idx, 1, item);
          } else {
            //console.log("new", item.market, item.tradePair)
            self.socketData.push(item);
          }
        });
      }
    };
  },
  methods: {
    getStats(market, currency){
      return _.filter(this.sellStats, function(o){
        if(currency) return o.market.toLowerCase() === market.toLowerCase() && o.currency.toLowerCase() === currency.toLowerCase()
        else return o.market.toLowerCase() === market.toLowerCase()        
      })
    },
    sumWaitingForSell(){
      let retArr = [];
      let self = this;
      let cnt = 0;
      Object.keys(this.groupedMarkets).forEach(function(market){
        let tmpObj = {};
        let t = self.groupedMarkets[market];
        let currencies = _.groupBy(t, 'currency');
        Object.keys(currencies).forEach(function(currency){
          _.set(tmpObj, 'market', market);
          _.set(tmpObj, 'currency', currency);
         
          let arr = currencies[currency];
          _.set(tmpObj, 'sumBaseValue', 0)
          _.each(arr, function(item){
            let bVal = _.get(tmpObj, 'sumBaseValue');
            _.set(tmpObj, 'sumBaseValue', (bVal + item['baseValue']));
            // set available funds only once!
            if(!_.has(tmpObj, 'availableFunds'))
              _.set(tmpObj, 'availableFunds', item['availableBitCoins']);
            
            cnt ++;
          })
          _.set(tmpObj, 'count', cnt);
          cnt = 0;
          retArr.push(tmpObj)
          tmpObj = {}
        });
      });
      return retArr;
    },
    getMode(item) {
      return !item.boughtPrice || item.boughtPrice === 0 ? "buy" : "sell";
    },
    priceDiff(buyPrice, sellPrice, lastPrice, coins) {
      const bp = parseFloat(buyPrice) || 0;
      const sp = parseFloat(sellPrice) || 0;
      const lp = parseFloat(lastPrice) || 0;
      const c = parseFloat(coins) || 0;

      if (lp === 0) {
        return {
          difference: "No last price found",
          color: "red",
          percent: null
        };
      }

      if (c > 0 && sp === 0) {
        return {
          difference: "No sell price found",
          color: "red",
          percent: null
        };
      }

      if (c === 0 && bp === 0) {
        return {
          difference: "No buy price found",
          color: "red",
          percent: null
        };
      }

      return this.calculatePriceDiff(c, sp, bp, lp);
    },
    calculatePriceDiff(c, sp, bp, lp) {
      if (c > 0 && sp > lp) {
        let diff = sp - lp;
        let percent = (diff / sp * 100).toFixed(2);
        let percentPadding = percent >= 10 || percent <= -10 ? "" : " ";

        return { difference: diff.toFixed(6), percent: percent, color: "pink" };
      }

      if (c === 0 && lp > bp) {
        let diff = lp - bp;
        let percent = (diff / lp * 100).toFixed(2);
        let percentPadding = percent >= 10 || percent <= -10 ? "" : " ";

        return { difference: diff.toFixed(6), percent: percent, color: "blue" };
      }

      // Sweet to sell
      if (c > 0 && lp > sp) {
        let diff = lp - sp;
        let percent = (diff / lp * 100).toFixed(2);
        let percentPadding = percent >= 10 || percent <= -10 ? "" : " ";

        return {
          difference: diff.toFixed(6),
          percent: percent,
          color: "green"
        };
      }

      // Sweet to buy
      if (c === 0 && bp > lp) {
        let diff = bp - lp;
        let percent = (diff / bp * 100).toFixed(2);

        return {
          difference: diff.toFixed(6),
          percent: isFinite(percent) ? percent : null,
          color: "green"
        };
      }

      return { difference: "-", percent: null, color: "grey" };
    },
    buyPrice(numberOfCoins, boughtPrice, buyPrice) {
      if (
        numberOfCoins === undefined ||
        boughtPrice === undefined ||
        parseFloat(boughtPrice) === 0 ||
        isNaN(parseFloat(boughtPrice)) ||
        parseFloat(numberOfCoins) === 0
      ) {
        return { price: parseFloat(buyPrice).toFixed(6), color: "black" };
      }
      return { price: parseFloat(boughtPrice).toFixed(6), color: "amber" };
    },
    currentProfit(numberOfCoins, boughtPrice, lastPrice) {
      if (
        numberOfCoins === undefined ||
        boughtPrice === undefined ||
        lastPrice === undefined
      ) {
        return {profit: null, color: 'grey', percent: null};
      }

      if (parseFloat(lastPrice) === 0 || parseFloat(boughtPrice) === 0) {
        return {profit: null, color: 'grey', percent: null};
      }

      if (isNaN(parseFloat(lastPrice)) || isNaN(parseFloat(boughtPrice))) {
        return {profit: null, color: 'grey', percent: null};
      }

      if (parseFloat(numberOfCoins) === 0) {
        return {profit: null, color: 'grey', percent: null};
      }

      let diff = parseFloat(lastPrice) - parseFloat(boughtPrice);
      let profit = parseFloat(numberOfCoins) * diff;

      return {profit: profit, color: 'green', percent: null};;
    },
    currentProfitWithPercent(numberOfCoins, boughtPrice, lastPrice) {
      let currentProfit = this.currentProfit(
        numberOfCoins,
        boughtPrice,
        lastPrice
      );

      if (
        currentProfit === undefined ||
        currentProfit === {profit: null, color: 'grey', percent: null}
      ) {
        return {profit: null, color: 'grey', percent: null};
      }

      let diff = parseFloat(lastPrice) - parseFloat(boughtPrice);
      let profitPercent = diff * 100 / parseFloat(boughtPrice);
      let negativePadding = profitPercent < 0 ? "" : " ";
      let percentPadding =
        profitPercent >= 10 || profitPercent <= -10 ? "" : " ";

      return {
        profit: currentProfit.profit, 
        color: diff < 0 ? 'red' : 'green', 
        percent: isFinite(profitPercent) ? profitPercent.toFixed(2) : null
      };
    }
  }
};
</script>
