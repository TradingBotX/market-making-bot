# Market-Making-Bot

<p align="center">
  <img src="https://avatars.githubusercontent.com/u/141486012?s=200&v=4" alt="TradingBotX Logo">
</p>  

### Harness the Potential of Open-Source Trading with TradingBotX: 

Your Ultimate Platform for Crafting, Deploying, and Managing Automated Trading Strategies. Seamlessly supporting leading crypto exchanges such as Bitfinex, Bittrex, Bitrue, Gate.io, and KuCoin, TradingBotX stands on par with popular software like Hummingbot, Coinrule, Mudrex, and NOBI. Dive into our GitHub repository for advanced crypto trading automation and strategy optimization.  

Discover the capabilities of our versatile market-making bot, specially designed for crypto enthusiasts and traders seeking precision. TradingBotX, your dedicated crypto exchange bot, empowers you to execute strategies with finesse and achieve trading excellence.  

## Updated Exchange Support and Important Notice

We are excited to announce that TradingBotX now supports the following exchanges:

- <img src="https://raw.githubusercontent.com/TradingBotX/market-making-bot/main/logos/bitrue.png" width="15" height="15" alt="Bitrue"> [Bitrue](https://www.bitrue.com/)  
- <img src="https://raw.githubusercontent.com/TradingBotX/market-making-bot/main/logos/kucoin.png" width="15" height="15" alt="Kucoin"> [KuCoin](https://www.kucoin.com/)  
- <img src="https://raw.githubusercontent.com/TradingBotX/market-making-bot/main/logos/bitfinex.png" width="15" height="15" alt="Bitfinex"> [Bitfinex](https://www.bitfinex.com/)  
- <img src="https://raw.githubusercontent.com/TradingBotX/market-making-bot/main/logos/bittrex.png" width="15" height="15" alt="Bittrex"> [Bittrex](https://global.bittrex.com/)  
- <img src="https://raw.githubusercontent.com/TradingBotX/market-making-bot/main/logos/gateio.png" width="15" height="15" alt="Gateio"> [Gate.io](https://www.gate.io/)  
- <img src="https://raw.githubusercontent.com/TradingBotX/market-making-bot/main/logos/huobi.png" width="15" height="15" alt="Huobi"> [Huobi](https://www.huobi.com/)  

We extend our sincere apologies for any inconvenience caused by our previous decision to temporarily suspend Binance and Coinbase exchanges from our platform. Your patience and understanding during this period are highly valued, and we deeply appreciate your ongoing support.

## Reasons for Temporary Exclusion

The temporary removal of Binance and Coinbase exchanges from our list of supported platforms is a result of various factors. One of the primary considerations is the heightened regulatory scrutiny that both exchanges have encountered in recent months. This regulatory landscape has presented complexities in establishing effective integration with these platforms. Rest assured, we are actively working to address these challenges and seek ways to restore support for these exchanges as soon as possible. Your patience and understanding during this process are greatly valued.

## Our Forward Outlook

We want to assure our users of our unwavering commitment to delivering a smooth and uninterrupted trading experience. As we diligently work on reinstating support for Binance and Coinbase exchanges, we regret that we are unable to provide a precise timeline for the reintegration of these platforms. Your understanding and patience are greatly appreciated as we strive to ensure the best possible trading environment for our valued users.

## Your Ongoing Support

Your comprehension and support have been immeasurably valuable to us as we navigate through this period of adaptation. We are committed to exploring every avenue to elevate our services and restore full access to all exchanges. We will keep you informed with timely updates as we continue to make strides in this pursuit. Your ongoing partnership is greatly appreciated.

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
    - Spread Percent (Percentage of spread from the median price on both sides, between which the orders will be placed) - The spread percent between which the orders are to be distributed on both the sides from the median price. 
       
  When starting the bot will consider the current price of the base currency in USDT and then place 10 orders on each side by maintaining the percent of gap set between each order starting from the current price. The amount will be calculated based on the USDT amount mentioned for the orders. If an order is completed on either side on any of the exchange, the bot will generate new orders and update the orders on all the exchanges, by placing and canceling required orders, where the bot is active for that given base currency.

## Steps to Start the Bot

To restrict site access to only the local environment, utilize `localhost:port` in the `.env` files for both the client and server components, where `port` refers to the specific port numbers you're using. If your intention is to access the site remotely, replace `localhost:port` with `your_ip:port` in both `.env` files, again using the appropriate IP address and port number. Once you've configured these settings, proceed to initiate the applications. This will guarantee smooth operation, whether you're accessing the applications locally or remotely.

### Method 1 : Docker Setup

Follow these steps to get the project up and running:

1. **Clone this repository**:

    ```bash
    git clone https://github.com/tradingbotx/market-making-bot
    cd market-making-bot
    ```

2. **Configure Environment Variables:**  
    Please ensure to update the `.env` files situated in both the client and server directories. To assist you in this process, you can refer to the provided `.env.example` files. Insert the required values that are pertinent to your environment. Please be aware that we have also made modifications to the server `.env.example` file to meet the requisites for Docker images.

3. Navigate to the directory containing the `docker-compose.yml` file.

4. **Start the services**:

    ```bash
    docker-compose build
    docker-compose up
    ```

5. For local access, reach the React app through [http://localhost:3000](http://localhost:3000) and the Node.js app via [http://localhost:5000](http://localhost:5000). To access them over the web, access the React app at http://yourip:3000 and the Node.js app at http://yourip:5000, replacing "yourip" with the appropriate IP address.

6. To stop the services, press `Ctrl + C` in the terminal where you started the services, and then remove the containers:

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
    Ensure that you update the `.env` files located within both the client and server directories. For your convenience, you can consult the supplied `.env.example` files as points of reference. Proceed to complete the essential values specific to your environment.

    Kindly note that the current `.env.example` file for the server aligns with Docker configurations. In light of this, kindly substitute the `MONGO_URL` with your individual connection string. Furthermore, within the `REDIS_HOST`, use the remote IP address for remote Redis, or if utilizing a locally installed Redis, input `localhost`. This ensures proper configuration for your Redis instance.

4. **Start the Server:**  
    Launch the server using the following command to start the application with nodemon:  
  
    ```bash
    npm start
    ```  

5. **Start the Client:**  
    Initiate the client using: 

    ```bash
    npm start
    ``` 

### Access the client and server to access the bot:  

  Upon initializing the server for the first time, an email and password will be generated for you. This information will be displayed in the command prompt and saved in the `/server/helpers/creds.json` file. We strongly advise you to empty the file after copying the credentials to ensure security. Safely storing this information is of utmost importance, as it will be essential for your future login via the client interface. If the need arises to reset the user, you can achieve this by modifying the `RESET_ADMIN` variable in the server's `.env` file to true. Once the necessary changes are made, remember to set the variable back to false.  

  For local access, reach the React app through [http://localhost:3000](http://localhost:3000) and the Node.js app via [http://localhost:5000](http://localhost:5000). To access them over the web, access the React app at http://yourip:3000 and the Node.js app at http://yourip:5000, replacing "yourip" with the appropriate IP address. 

1. **Log in to the Client:**  
    Using the credentials displayed during server startup, log in to the client interface.  

2. **Manage API Keys:**  
    Within the client screen, navigate to the `Manage Keys` section. Here, you can add and update the necessary API keys for the exchanges you intend to connect to.  

3. **Add Liquidity:**  
    Proceed to the `Add Liquidity` section. Select the exchange and trading pair you're interested in. Provide the required parameters to add liquidity to the chosen exchange and pair.  

  By meticulously following these steps, you'll have successfully installed dependencies, started the applications, logged in, and added liquidity using the trading bot. If needed, you can refer back to this guide for guidance.  

## Contributing to TradingBotX

We firmly believe that collaboration can empower TradingBotX to enhance its capabilities and provide a more comprehensive trading experience for all users. With this in mind, we kindly ask you to adhere to the established standards consistently applied to other exchanges. By examining the files and functions that detail the integration of existing exchanges within the bot, you can become acquainted with these standards. This approach ensures a unified and seamless integration process throughout the platform. Your dedication to these guidelines will significantly contribute to a cohesive trading environment that benefits our entire user community.

Given that TradingBotX operates as an open-source project, we enthusiastically welcome contributions from the developer community to augment exchange integration support. If you're enthusiastic about introducing support for a new exchange, here's the process:

### Steps :  

1. **Create Exchange Helper File:**    
    Inside the `/server/helpers/exchangeHelpers` folder, generate a new file named after the exchange (e.g., `NewExchange.js`). In this file, add the required functions like `orderBook`, `placeOrder`, `orderStatus`, `cancelOrder`, `walletBalance`, and `ticker24Hr`.   

2. **Implement Exchange Functions in orderPlacement.js:**  
    Inside the `/server/helpers/orderPlacement.js` file, add the required functions with switch cases for the new exchange. Ensure that the functions adhere to the required formats and standards for interacting with the exchange.  

3. **Enhance redis.js for Order Book Parsing:**  
    Within the `/server/services/redis.js` file, navigate to the `parseOrderBook` and `parseCompleteOrderBook` functions. Integrate switch cases for the new exchange to ensure proper parsing of order book data with the required formats.  

4. **Update constant.js for Exchange Information:**  
    In the `/server/helpers/constant.js` file, under the exchanges array, add the name of the new exchange. Additionally, in the `ExchangePairInfo` and `ExchangeCurrencyInfo` variables, include the default trading pairs and currencies you wish to incorporate for the new exchange. If needed, you can also make similar changes for existing exchanges to update their default pairs and currencies.  

5. **Testing and Pull Request:**  
    Once you have made all the required changes, thoroughly test the integration to ensure its functionality and compatibility. After successful testing, create a pull request (PR) with your changes. The team will carefully review the modifications, and upon approval, your changes will be merged into the codebase.

    By following these steps, you will effectively integrate support for the new exchange within the TradingBotX ecosystem, while maintaining consistency and adhering to the existing standards of the project.

