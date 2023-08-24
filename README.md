# Market-Making-Bot

<p align="center">
  <img src="https://avatars.githubusercontent.com/u/141486012?s=200&v=4" alt="TradingBotX Logo">
</p>

## Updated Exchange Support and Important Notice

We are excited to announce that TradingBotX now supports the following exchanges:

- <img src="https://raw.githubusercontent.com/TradingBotX/market-making-bot/main/logos/bitrue.png" width="15" height="15" alt="Bitrue"> Bitrue
- <img src="https://raw.githubusercontent.com/TradingBotX/market-making-bot/main/logos/kucoin.png" width="15" height="15" alt="Kucoin"> KuCoin
- <img src="https://raw.githubusercontent.com/TradingBotX/market-making-bot/main/logos/bitfinex.png" width="15" height="15" alt="Bitfinex"> Bitfinex
- <img src="https://raw.githubusercontent.com/TradingBotX/market-making-bot/main/logos/bittrex.png" width="15" height="15" alt="Bittrex"> Bittrex
- <img src="https://raw.githubusercontent.com/TradingBotX/market-making-bot/main/logos/gateio.png" width="15" height="15" alt="Gateio"> Gate.io
- <img src="https://raw.githubusercontent.com/TradingBotX/market-making-bot/main/logos/huobi.png" width="15" height="15" alt="Huobi"> Huobi

We apologize for any inconvenience caused by our earlier decision to temporarily exclude Binance and Coinbase exchanges from our platform. We deeply appreciate your patience and understanding during this period.

## Reasons for Temporary Exclusion

The temporary exclusion of Binance and Coinbase exchanges from our supported list is due to several factors, with one of the main considerations being the increased regulatory scrutiny both exchanges have faced in recent months. This regulatory environment has posed challenges in effectively integrating with these platforms.

## Our Forward Outlook

We want to assure our users that we remain committed to providing a seamless trading experience. While we are actively working to restore support for Binance and Coinbase exchanges, we are unable to provide a specific timeline for the reintegration of these platforms.

## Your Ongoing Support

Your understanding and support have been invaluable to us as we navigate through this period of adjustment. We are dedicated to exploring all possibilities to enhance our services and reintroduce complete access to all exchanges. Timely updates will be shared as we make progress in this endeavor.

Thank you for being part of the TradingBotX community.

Best regards,  
Team TradingBotX

---

## Disclaimer

This Automatic Trading Bot employs multiple logics and calculations for performance enhancement. Users lacking proper technical skills or a solid understanding of Crypto Market performance should avoid using this bot. There are chances that the trading logic can fail or operate incorrectly due to various reasons. Users are advised to exercise caution and supervise the bot's functioning and crypto balances regularly.

When engaging in cryptocurrency trading, you are entering dynamic markets where financial losses can occur. This bot is experimental software and receives regular updates. While efforts have been made to rectify any issues, some errors may still be present. Your decision to use this bot is entirely at your own risk. We cannot guarantee specific performance outcomes or profits through our bots or strategies. Please be aware that incorrect parameter settings or sudden shifts in market conditions might lead to losses while using this bot. It is advisable to make thoughtful choices and exercise caution. We are not liable for any incurred losses.

## Strategies implemented

1. Adding Liquidity
  Set the parameters  
    - Buy Order Amount (Each Order) - Amount in USDT for each buy order.  
    - Sell Order Amount (Each Order) - Amount in USDT for each sell order.  
    - Percent Gap (Between Each Order) - The percentage of gap to be maintained between each order to be placed. 
       
  When starting the bot will consider the current price of the base currency in USDT and then place 10 orders on each side by maintaining the percent of gap set between each order starting from the current price. The amount will be calculated based on the USDT amount mentioned for the orders. If an order is completed on either side on any of the exchange, the bot will generate new orders and update the orders on all the exchanges, by placing and canceling required orders, where the bot is active for that given base currency.

## Steps to Start the Bot

1. Clone the repo and install the application using either of the 2 methods

### Method 1 : Docker Setup

Follow these steps to get the project up and running:

1. Clone this repository:

    ```bash
    git clone https://github.com/tradingbotx/market-making-bot
    cd market-making-bot
    ```

2. Navigate to the directory containing the `docker-compose.yml` file.

3. Start the services:

    ```bash
    docker-compose build
    docker-compose up
    ```

4. Access the React app at [http://localhost:3000](http://localhost:3000) and the Node.js app at [http://localhost:5000](http://localhost:5000).

5. To stop the services, press `Ctrl + C` in the terminal where you started the services, and then remove the containers:

    ```bash
    docker-compose down
    ```

### Method 2 : 

Requirements : [https://nodejs.org/en/blog/release/v16.16.0](node v16), [https://www.mongodb.com/try/download/community](mongodb), [https://redis.io/download/#redis-downloads](redis)

2. Install the dependencies

3. After installing the dependencies, update the `.env` files in client and server folder, for reference use the `.env.example` files.

4. Start the server using `npm run dev` to start the the application using `nodemon`.

5. Start the client using `npm start`.

After successfully installing the dependencies and starting the applications, follow the below steps to start the bot and add liquidity. Once the server starts an email and password created for you will be displayed in the command prompt, save this for logging in via the client. To reset the user, update the RESET_ADMIN variable in the .env of the server to create a new user for you.

1. Login to the client.

2. Navigate to `Manage Keys` section and add api keys for the exchanges that you want to connect.

3. Navigate to `Add Liquidity` section and from the options select exchange, pair and fill out the required parameters to add liquidity to your desired exchange and pair.

## Contributing to TradingBotX

Since TradingBotX is an open-source project, we welcome contributions from the developer community to enhance exchange integration support. If you're interested in adding support for a new exchange, here's the process:

## Step : [Coming Soon]

We believe that together, we can expand the capabilities of TradingBotX and create a more comprehensive trading experience for all users.
