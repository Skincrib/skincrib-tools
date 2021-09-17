## Skincrib Tools
Skincrib Tools is a bunch of tools to automate the trader experience on Skincrib!

### We are open to pull requests!
See something that could be managed better? Want to add another tool to the repository? Create a request and we will review it!

## Installation
 You must have:
  - Node.js (v14+)
  - MongoDB

 Install Skincrib Tools:
  - `git clone https://github.com/Skincrib/skincrib-tools`
  - `cd skincrib-tools`
  - `npm install`

## Included Tools
 ### Load Item Prices
  A tool to load item prices into a MongoDB database for future use.
  - Use `npm run import`

 ### Sell Inventory
  A tool to automate the listing and automatic sending of skins on Skincrib. Also includes support for Discord webhook notifications.
  - Use `npm run deposit`

 ### Snipe Skins
  A tool to automate the withdrawing of skins on Skincrib.
  - Use `npm run sniper`