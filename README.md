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

### Method 2 : Manual Setup

Prerequisites : [Node v16](https://nodejs.org/en/blog/release/v16.16.0), [MongoDB](https://www.mongodb.com/try/download/community), [Redis](https://redis.io/download/#redis-downloads), [Python 2.7](https://www.python.org/download/releases/2.7/)

1. **Clone the Repository:**  
    Open your terminal and execute the following commands:  

    ```bash
    git clone https://github.com/tradingbotx/market-making-bot
    cd market-making-bot
    ```

2. **Install Dependencies:**  
    Inside the cloned repository, you'll find both a client and a server folder. Install the required dependencies for both by running the following commands in their respective folders:  

    ```bash
    cd client
    npm install --legacy-peer-deps

    cd ../server
    npm install
    ```

3. **Configure Environment Variables:**  
    Update the `.env` files located in the client and server folders. You can use the provided `.env.example` files as references. Fill in the necessary values for your environment.  

4. **Start the Server:**  
    Launch the server using the following command to start the application with nodemon:  
  
    ```bash
    npm run dev
    ```  
     
    Upon starting the server for the first time, you will encounter an email and password generated for you in the command prompt. It is imperative to securely store this information, as it will be essential for your login via the client interface. Should the need arise to reset the user, simply modify the `RESET_ADMIN` variable within the server's `.env` file.  

5. **Start the Client:**  
    Initiate the client using: 

    ```bash
    npm start
    ``` 

 ### Access the client and server to access the bot:    
    Access the client by navigating to [http://localhost:3000](http://localhost:3000) and the server at [http://localhost:5000](http://localhost:5000).   

1. **Log in to the Client:**  
    Using the credentials displayed during server startup, log in to the client interface.  

2. **Manage API Keys:**  
    Within the client screen, navigate to the `Manage Keys` section. Here, you can add and update the necessary API keys for the exchanges you intend to connect to.  

3. **Add Liquidity:**  
    Proceed to the `Add Liquidity` section. Select the exchange and trading pair you're interested in. Provide the required parameters to add liquidity to the chosen exchange and pair.  

  By meticulously following these steps, you'll have successfully installed dependencies, started the applications, logged in, and added liquidity using the trading bot. If needed, you can refer back to this guide for guidance.  

## Contributing to TradingBotX

Since TradingBotX is an open-source project, we welcome contributions from the developer community to enhance exchange integration support. If you're interested in adding support for a new exchange, here's the process:

## Step : [Coming Soon]

We believe that together, we can expand the capabilities of TradingBotX and create a more comprehensive trading experience for all users.
