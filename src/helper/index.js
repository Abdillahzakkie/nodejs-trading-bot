require("dotenv/config");
const axios = require("axios");
const nodemailer = require("nodemailer");
const { connectWeb3 } = require("../web3");
const { web3, uniswapV2Factory, uniswapV2Router } = connectWeb3();
const Pair = require("../model/Pair.model.js");
const { abi: uniswapV2PairABI } = require("../web3/abis/uniswapV2Pair.json");
const { abi: tokenABI } = require("../web3/abis/token.json");

const MINIMUM_LIQUIDITY = parseFloat(process.env.MINIMUM_LIQUIDITY);

const toWei = (_amount) => web3.utils.toWei(_amount.toString(), "ether");
const fromWei = (_amount) => web3.utils.fromWei(_amount.toString(), "ether");
const toChecksumAddress = (_account) => web3.utils.toChecksumAddress(_account);

let WETH;
let EtherPrice = 0;
let transporter;

(async () => {
	transporter = nodemailer.createTransport({
		host: "gmail.com",
		port: 587,
		secure: false, // true for 465, false for other ports
		auth: {
			user: "abdillahzakkie@gmail.com",
			pass: process.env.emailPassword,
		},
	});
})();

const web3Subscribe = async () => {
	try {
		WETH = await uniswapV2Router.methods.WETH().call();
		web3.eth
			.subscribe("newBlockHeaders")
			.on("data", async (block) => {
				console.log(`New block received. Block #${block.number}`);
				EtherPrice = await getCurrentPrice();

				await getNewPairEvents();
			})
			.on("error", console.log);
	} catch (error) {
		return error;
	}
};

const getNewPairEvents = async () => {
	try {
		console.log("Fetching New Pair Events");
		const _startBlock = parseInt(await web3.eth.getBlockNumber()) - 1000;
		const _response = await uniswapV2Factory.getPastEvents("PairCreated", {
			fromBlock: _startBlock,
			toBlock: "latest",
		});
		const _filteredPairEvents = await filterNewPairEvents(_response);
		console.log(_filteredPairEvents);
		for (let i = 0; i < _filteredPairEvents; i++) emailAlert(item);
	} catch (error) {
		console.log(error);
		return error;
	}
};

const filterNewPairEvents = async (_data) => {
	try {
		let _filteredData = [];

		for (let i = 0; i < _data.length; ++i) {
			const { transactionHash, blockNumber, returnValues } = _data[i];
			const { token0, token1, pair } = returnValues;
			const token0_Symbol = await getTokenSymbol(token0);
			const token1_Symbol = await getTokenSymbol(token1);

			const _uniswapV2Pair = new web3.eth.Contract(uniswapV2PairABI, pair);
			const { _reserve0: reserve0, _reserve1: reserve1 } =
				await _uniswapV2Pair.methods.getReserves().call();

			let liquidity = 0;

			token0_Symbol === "WETH"
				? (liquidity = EtherPrice * fromWei(reserve0))
				: (liquidity = EtherPrice * fromWei(reserve1));

			const _result = {
				transactionHash,
				blockNumber,
				token0,
				token0_Symbol,
				reserve0: fromWei(reserve0),
				token1,
				token1_Symbol,
				reserve1: fromWei(reserve1),
				pair,
				liquidity,
			};

			_filteredData = [..._filteredData, _result];
		}
		return _filteredData;
	} catch (error) {
		return error;
	}
};

const getTokenSymbol = async (_tokenAddress) => {
	try {
		const _contract = new web3.eth.Contract(tokenABI, _tokenAddress);
		return await _contract.methods.symbol().call();
	} catch (error) {
		return error;
	}
};

const getCurrentPrice = async () => {
	try {
		const _symbol = await getTokenSymbol(WETH);
		const _tokenName = _symbol === "WETH" ? "ethereum" : "binance coin";
		let result = await axios.get(
			`https://api.coingecko.com/api/v3/simple/price?ids=${_tokenName}&vs_currencies=USD`
		);
		return result.data[_tokenName].usd;
	} catch (error) {
		return error;
	}
};

const emailAlert = (_data) => {
	try {
		const info = transporter.sendMail({
			from: "abdillahzakkie@gmail.com", // sender address
			to: "zakariyyaopeyemi@gmail.com", // list of receivers
			subject: "Uniswap Sniper Bot new pair detected", // Subject line
			// text: "Hello world?", // plain text body
			html: `
				<table>
					<tr>
						<td>Token0 Symbol</td>
						<td>Token0 Address</td>
						<td>Token1 Symbol</td>
						<td>Token1 Address</td>
						<td>Pair Address</td>
						<td>Liquidity</td>
					</tr>
					<tr>
						<td>${_data.token0_Symbol}</td>
						<td>${_data.token0}</td>
						<td>${_data.token1_Symbol}</td>
						<td>${_data.token1}</td>
						<td>${_data.pair}</td>
						<td>${_data.liquidity}</td>
					</tr>
					<tr></tr>

				</table>
			`, // html body
		});
		console.log("Message sent: %s", info.messageId);
		return;
	} catch (error) {
		console.log(error);
		return error;
	}
};

module.exports = {
	web3Subscribe,
	getNewPairEvents,
	getCurrentPrice,
};
