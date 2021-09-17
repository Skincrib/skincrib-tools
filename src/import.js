const mongoose = require('mongoose');
const JSONStream = require('JSONStream');
const es = require('event-stream');
const request = require('request');

const config = require('../config.js');
const Items = require('./utils/schema.js');

//db connection
mongoose.connect(`mongodb://127.0.0.1:27017/skincrib`, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);

(async ()=>{
    console.log('[!] Fetching prices from pricempire...');
    //fetch new prices from pricempire
    let num = 0;
    request({
        method: 'GET',
        url: `https://api.pricempire.com/v1/getAllItems?token=${config.pricempire_key}`
    })
    .pipe(JSONStream.parse('*.*'))
    .pipe(es.mapSync(async (item)=>{
        if(!item || !item.prices.buff163 || !item.prices.buff163_quick) return;
        num++;
        let price;
        if((item.prices.buff163.price * .88) > item.prices.buff163_quick.price){
            price = item.prices.buff163_quick.price * 0.15;
        } else{
            price = item.prices.buff163.price * 0.15;
        }
        
        await Items.replaceOne({name: item.name}, { name: item.name, price }, { upsert: true });

        console.log(`[${num}] Inserted: ${item.name} ($${(price/100).toFixed(2)})`);
    }));
})();