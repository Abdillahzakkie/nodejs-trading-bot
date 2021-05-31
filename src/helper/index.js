require('dotenv/config');
const { connectWeb3 } = require('../web3');
const { web3, uniswapV2Factory, uniswapV2Router } = connectWeb3();
const Pair = require('../model/Pair.model.js');
const { abi : uniswapV2PairABI } = require('../web3/abis/uniswapV2Pair.json');



const toWei = _amount => web3.utils.toWei(_amount.toString(), 'ether');
const fromWei = _amount => web3.utils.fromWei(_amount.toString(), 'ether');
const toChecksumAddress = _account => web3.utils.toChecksumAddress(_account);

const getNewPairEvents = async () => {
    try {
        console.log("Fetching Pair Events");
        const _startBlock = await web3.eth.getBlockNumber() - 10_000;
        const _response = await uniswapV2Factory.getPastEvents('PairCreated', { fromBlock: _startBlock, toBlock: "latest" });
        const _result = await filterNewPairEvents(_response);
        // console.log(_result);
        return _result;
    } catch (error) {
        console.log(error);
        return error;
    }
}

const filterNewPairEvents = async _data => {
    try {
        const WETH = await uniswapV2Router.methods.WETH().call();

        const _filteredData = _data.map(item => {
            const { transactionHash, blockNumber, returnValues } = item;
            const { token0, token1, pair } = returnValues;
            if(
                toChecksumAddress(token0) !== toChecksumAddress(WETH) &&
                toChecksumAddress(token1) !== toChecksumAddress(WETH)
            ) return {};

            const _sortedOrder = sortedOrder(token1, WETH);

            return {
                transactionHash,
                blockNumber,
                token0,
                token1,
                pair,
                sortedOrder: _sortedOrder
            }
        })

        await getReserves(pair);
        return _filteredData;
    } catch (error) {
        return error;
    }
}


const sortedOrder = (token1, WETH) => {
    if(toChecksumAddress(token1) === toChecksumAddress(WETH)) return true;
    return false;
}

const getReserves = async _pairAddress => {
    try {
        const _uniswapV2Pair = new web3.eth.Contract(uniswapV2PairABI, _pairAddress);
        console.log(_uniswapV2Pair);
        const _result = await _uniswapV2Pair.methods.getReserves().call();
        console.log(_result);
        return _result;
    } catch (error) {
        return error;
    }
}

const saveNewPair = async() => {
    try {
        // await new Pair.
    } catch (error) {
        
    }
}

module.exports = {
    getNewPairEvents
}