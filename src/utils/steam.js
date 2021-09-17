const SteamCommunity = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager');
const SteamTotp = require('steam-totp');

const util = require('util');
const Promise = require('bluebird');

const {steam} = require('../../config.js');

module.exports = class SteamManager{
    constructor(){
        //steam objects
        this.community = new SteamCommunity();
        this.manager = new TradeOfferManager({
            "domain": "localhost",
            "language": "en",
            "pollInterval": 5000 // We want to poll every 5 seconds since we don't have Steam notifying us of offers
        });
        //promisfyed steam methods (cus its totally tubular)
        this.steamLogin = Promise.promisify(this.community.login, {multiArgs: true});
        this.setCookies = util.promisify(this.manager.setCookies);
        this.acceptTradeConfirmation = util.promisify(this.community.acceptConfirmationForObject);
        this.checkLoggedIn = Promise.promisify(this.community.loggedIn, {multiArgs: true});

        this.community.on('sessionExpired', (err) => {
			console.log('[STEAM] Session Expired');
            this.login();
		});
        
        this.login();
    }
    //login to steam community
    async login(){
        if(!steam.username || steam.username == '' || !steam.password || steam.password == '')
        return {error: true, reason: '[STEAM] You must save a Steam username and password to start the Steam App.'};

        //if shared secret included, generate auth code
        if(steam.shared_secret){
            this.authCode = await SteamTotp.generateAuthCode(steam.shared_secret);
        }
        //login to steam community
        
        try{
            let loginData = await this.steamLogin.call(this.community, {
                accountName: steam.username,
                password: steam.password,
                //authCode: this.authCode,
                twoFactorCode: this.authCode
            })

            this.steamSession = {
                sessionID: loginData[0],
                cookies: loginData[1],
                steamguard: loginData[2],
                oAuthToken: loginData[3]
            }

            if(this.steamSession.cookies){
                //login to steam tradeoffer manager
                await this.setCookies.call(this.manager, this.steamSession.cookies)
                .catch(console.log);

                console.log('[STEAM] Logged into Steam');
            }
        } catch(err){
            console.log(err.message);
            process.exit(22);
        }
    }

    //when we want to send a trade to someone
    async sendTrade(assetid, itemName, expires, tradeUrl){
        //create tradeoffer object
        let offer = this.manager.createOffer(tradeUrl);
        //promisfy sending the trade
        let sendTrade = util.promisify(offer.send);
        //add our item to the tradeoffer
        offer.addMyItem({
            id: assetid,
            assetid: assetid,
            appid: 730,
            contextid: 2,
            amount: 1
        });
        //set message
        offer.setMessage('Hope you enjoy it :)');
        //send the trade
        let data = await sendTrade.call(offer)
        .catch((err) => console.log('err1', err));

        //if we have to confirm the trade via mobile auth
        if(data == 'pending'){
            if(!steam.identity_secret || steam.identity_secret == ''){
                console.log('[STEAM] You must set your Steam identity secret to confirm the trade for '+itemName);
            }
            //confirm the trade via 2fa
            let acceptData = await this.acceptTradeConfirmation.call(this.community, steam.identity_secret, offer.id)
            .catch((err) => console.log('err2', err));

            //cancel the trade after x time if includes (so we dont get scammed)
            if(expires){
                setTimeout(()=>{
                    offer.cancel((err)=>{
                        console.log('err3', err);
                    });
                }, expires - Date.now());
            }
        }
    }
};