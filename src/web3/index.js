require('dotenv/config');
const Web3 = require('web3');
const { abi : uniswapV2FactoryABI } = require('./abis/uniswapV2Factory.json');
const { abi : uniswapV2RouterABI } = require('./abis/uniswapV2Router.json');


const connectWeb3 = () => {
    try {
        // const web3 = new Web3(`https://eth-mainnet.alchemyapi.io/v2/${process.env.alchemyApiKey}`);
        const web3 = new Web3(
            new Web3.providers.WebsocketProvider(`wss://eth-mainnet.ws.alchemyapi.io/v2/${process.env.alchemyApiKey}`)
        );
        const uniswapV2Factory = new web3.eth.Contract(uniswapV2FactoryABI, process.env.uniswapV2Factory);
        const uniswapV2Router = new web3.eth.Contract(uniswapV2RouterABI, process.env.uniswapV2Router);

        return { 
            web3,
            uniswapV2Factory,
            uniswapV2Router,
        };
    } catch (error) { return error; }
}

module.exports = { connectWeb3 };