const Skincrib = require('@skincrib/skincrib-client');
const mongoose = require('mongoose');
const Items = require('./utils/schema.js');

const {
    key,
    excluded_items,
    price_checking,
    mininum_price,
    maximum_price,
    expected_ROI,
    maximum_percentage
} = require('../config');

if(price_checking){
    //db connection
    mongoose.connect(`mongodb://127.0.0.1:27017/skincrib`, { useNewUrlParser: true, useUnifiedTopology: true });
    mongoose.set('useFindAndModify', false);
}

const MAX = maximum_price * 100;
const MIN = mininum_price * 100;

const market = new Skincrib({
    key: key,
    reconnect: true
});

market.on('authenticated', console.log);

market.on('listing.added', async (listing) => {
    if(listing.price > MAX || listing.price < MIN) return;
    if(excluded_items.some(x => listing.name.toLowerCase().includes(x))) return;

    if(price_checking){
        let dbPrice = await Items.findOne({ name: listing.item.name });
        console.log(`Price Checking: ${listing.item.name} | Skincrib: $${listing.price / 100} | Database: $${dbPrice.price / 100}`);
        if((dbPrice.price / listing.price) < expected_ROI) return;
    } else {
        console.log(`Price Checking: ${listing.item.name} | Skincrib: $${listing.price / 100} | Percent: ${listing.percentIncrease}%`);
        if(listing.percentIncrease > maximum_percentage) return;
    }

    market.purchaseListing(listing.id)
    .then((data) => {
        console.log(`Sent Purchase request for ${listing.item.name}`);
    }, (err)=>{
        console.log(`Error purchasing ${listing.item.name}: ${err}`);
    });
});

market.on('listing.status', (listing) => {
    if(listing.type !== 'withdraw') return;

    if(listing.state === 'completed'){
        return console.log(`Purchased ${listing.item.name} for ${listing.price / 100}`);
    }
});

market.authenticate()
.then((data)=>{
    console.log(`Successfully authenticated to account ${data.user.profile.name} (SteamID64: ${data.user.id})`);
    console.log(`You currently have $${data.user.balance/100} and ${data.listings.length} listings.`)
});