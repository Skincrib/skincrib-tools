const Skincrib = require('@skincrib/skincrib-client');
const { Webhook } = require('discord-webhook-node');
const SteamManager = require('../utils/steam');
const {
    key,
    webhook_url,
    percent_increase,
    auto_trade,
    steam,
    sale_limit
} = require('../config');

const Hook = new Webhook(webhook_url);

var sales = 0;

const market = new Skincrib({
    key: key,
    reconnect: true
});

var Steam;
if(auto_trade){
    Steam = new SteamManager();
}

market.on('authenticated', (message) => {
    console.log(message);

    market.loadInventory()
    .then((inventory) => {
        //only list items that are able to be listed.
        const items = inventory.filter(item => {
            return item.accepted && item.tradable;
        });

        //add a key to each item that defines the percent increase.
        items.forEach(item => {
            item.percentIncrease = percent_increase;
        });

        //list the items.
        market.createListings(items)
        .then((listings) => {
            //show the listings.
            listings.forEach(listing => {
                console.log(`Listed ${listing.listing.item.name} for $${listing.listing.price / l100}`);
            });
        }, (err) => {
            console.error(err);
        });
    }, (err) => {
        console.error(err);
    });
});

market.on('listing.status', async ({type, state, status, id, assetid, listing, expires, partner}) => {
    if(type !== 'deposit') return;

    if(state === 'completed'){
        return console.log(`Item sold: ${listing.item.name} for ${listing.price / 100}`);
    }
    //listing has been purchased and needs to be confirmed.
    if(status === 'sell_confirmation'){
        try{
            if(listing.price/100 + sales > sale_limit){
                console.log("Trade ping, but not confirming since we are at the sale limit.");
            }else{
                sales += listing.price/100;
                await market.confirmListing(id);
            }
        } catch(err){
            console.log(`Error confirming ${listing.item.name}: ${err}`);
        }

        return;
    }

    if(status === 'send_item'){
        //dont send item if less than 30 seconds left.
        if(expires - Date.now() < (1000 * 30)){
            console.log(`Not sending trade for ${listing.item.name} because there is only 30 seconds left.`);
        };
        console.log(`Send trade for ${listing.item.name}. Trade expires at ${new Date(expires).toLocaleString()}`);

        if(auto_trade){
            await Steam.sendTrade(assetid, listing.item.name, expires, partner.tradeUrl);
        } else {
            Hook.setUsername('Skincrib');
            Hook.send(`Sold item and awaiting trade: ${listing.item.name} | $${listing.price} | ${partner.tradeUrl}`);
        }
    }
});

market.authenticate()
.then((data)=>{
    console.log(`Successfully authenticated to account ${data.user.profile.name} (SteamID64: ${data.user.id})`);
    console.log(`You currently have $${data.user.balance/100} and ${data.listings.length} listings.`)
});