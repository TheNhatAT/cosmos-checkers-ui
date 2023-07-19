import {ChainInfo} from "@keplr-wallet/types"
// @ts-ignore
import _ from "../../../environment"

export const checkersChainId = "checkers"

export const getCheckersChainInfo = (): ChainInfo => ({
    chainId: checkersChainId,
    chainName: "checkers",
    rpc: process.env.RPC_URL!,
    rest: process.env.REST_URL!,
    bip44: {
        coinType: 118,
    },
    bech32Config: {
        bech32PrefixAccAddr: "cosmos",
        bech32PrefixAccPub: "cosmos" + "pub",
        bech32PrefixValAddr: "cosmos" + "valoper",
        bech32PrefixValPub: "cosmos" + "valoperpub",
        bech32PrefixConsAddr: "cosmos" + "valcons",
        bech32PrefixConsPub: "cosmos" + "valconspub",
    },
    currencies: [
        {
            coinDenom: "STAKE",
            coinMinimalDenom: "stake",
            coinDecimals: 0,
            coinGeckoId: "stake",
        },
        {
            coinDenom: "TOKEN",
            coinMinimalDenom: "token",
            coinDecimals: 0,
        },
    ],
    feeCurrencies: [
        {
            coinDenom: "STAKE",
            coinMinimalDenom: "stake",
            coinDecimals: 0,
            coinGeckoId: "stake",
        },
    ],
    stakeCurrency: {
        coinDenom: "STAKE",
        coinMinimalDenom: "stake",
        coinDecimals: 0,
        coinGeckoId: "stake",
    },
    features: ["stargate", "no-legacy-stdTx", "ibc-transfer"],
    beta: true,
})
