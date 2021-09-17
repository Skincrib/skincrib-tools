module.exports = {
    key: '', //skincrib api key
    pricempire_key: '', //pricempire api key

    webhook_url: '', //discord webhook url

    excluded_items: [], //array of strings to exclude from checking (put anything that might be a skin name)
    price_checking: true, //set to false to disable price checking (uses % checking instead)

    mininum_price: 0.01, //minimum price to be considered to snipe
    maximum_price: 100, //maximum price to be considered to snipe

    expected_ROI: 1.08, //expected ROI for a skin, used to calculate the expected profit (1.08 = 8% profit) (not used if price checking is disabled)
    maximum_percentage: 5, //maximum percentIncrease on a skin to be considered to snipe (not used if price checking is enabled)

    auto_trade: true, //use steam settings and auto send trade

    steam: { //steam settings
        username: '',
        password: '',
        shared_secret: '',
        identity_secret: '',
        tradeUrl: ''
    },

    sale_limit: 1000, //amount in USD to sell max

    percent_increase: 15, //list skins at this percentage increase
}; 