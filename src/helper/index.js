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
        const _startBlock = await web3.eth.getBlockNumber() - 100;
        const _response = await uniswapV2Factory.getPastEvents('PairCreated', { fromBlock: _startBlock, toBlock: "latest" });
        const _filteredPairEvents = await filterNewPairEvents(_response);
        const _pairReserves = await getPairReserves(_filteredPairEvents);
        // save data to DB
        await savePairToDB(_pairReserves);
        // return _pairReserves;
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
                sortedOrder: _sortedOrder,
            }
        })
        return _filteredData;
    } catch (error) {
        return error;
    }
}


const sortedOrder = (token1, WETH) => {
    if(toChecksumAddress(token1) === toChecksumAddress(WETH)) return true;
    return false;
}

const getPairReserves = async _data => {
    try {
        let _result = [];

        for(let i = 0; i < _data.length; ++i) {
            if(!_data[i].pair) return;
            const _uniswapV2Pair = new web3.eth.Contract(uniswapV2PairABI, _data[i].pair);
            const { _reserve0: reserve0, _reserve1: reserve1 } = await _uniswapV2Pair.methods.getReserves().call();
            _result = [
                ..._result, 
                { 
                    ..._data[i], 
                    reserve0: parseFloat(fromWei(reserve0)).toFixed(4), 
                    reserve1: parseFloat(fromWei(reserve1)).toFixed(4)
                }
            ];
        }
        return _result;
    } catch (error) {
        console.log(error);
        return error;
    }
}

const savePairToDB = async _data => {
    try {
        _data.map(async item => {
            const _newData = new Pair({ ...item });
            console.log(_newData);
            await _newData.save();
        })
        console.log(`Data saved successfully`);
        // return _result;
    } catch (error) {
        console.log(error);
        return error;
    }
}

module.exports = {
    getNewPairEvents
}