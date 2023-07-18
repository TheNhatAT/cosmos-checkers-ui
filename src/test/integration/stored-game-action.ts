import {OfflineDirectSigner} from "@cosmjs/proto-signing";
import {getSignerFromMnemonic} from "../../util/signer";
import {expect} from "chai";
import {CheckersSigningStargateClient, CheckersStargateClient} from "../../checkers_stargateclient";
import {CheckersExtension} from "../../modules/queries";
import {Account, DeliverTxResponse, GasPrice} from "@cosmjs/stargate";
import {askFaucet} from "../../util/faucet";
// @ts-ignore
import Long from "long";
import {Log} from "@cosmjs/stargate/build/logs";
import {getCapturedPos, getCreatedGameId, getCreateGameEvent, getMovePlayedEvent} from "../../types/checkers/events";
import {StoredGame} from "../../types/generated/checkers/stored_game";
import {completeGame, GameMove, Player} from "../../types/checkers/player";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx"
import {typeUrlMsgPlayMove} from "../../types/checkers/messages";
import {BroadcastTxSyncResponse} from "@cosmjs/tendermint-rpc";
import { toHex } from "@cosmjs/encoding"
import {config} from "dotenv";

config()

describe("StoredGame Action", function () {
    const {RPC_URL, ADDRESS_TEST_ALICE: alice, ADDRESS_TEST_BOB: bob} = process.env
    let aliceSigner: OfflineDirectSigner, bobSigner: OfflineDirectSigner

    const aliceCredit = {
            stake: 100,
            token: 1,
        },
        bobCredit = {
            stake: 100,
            token: 1,
        }

    let aliceClient: CheckersSigningStargateClient,
        bobClient: CheckersSigningStargateClient,
        checkers: CheckersExtension["checkers"]


    before("create signers", async function () {
        aliceSigner = await getSignerFromMnemonic(process.env.MNEMONIC_TEST_ALICE)
        bobSigner = await getSignerFromMnemonic(process.env.MNEMONIC_TEST_BOB)
        expect((await aliceSigner.getAccounts())[0].address).to.equal(alice)
        expect((await bobSigner.getAccounts())[0].address).to.equal(bob)
    })

    before("create signing clients", async function () {
        aliceClient = await CheckersSigningStargateClient.connectWithSigner(RPC_URL, aliceSigner, {
            gasPrice: GasPrice.fromString("0stake"),
        })
        bobClient = await CheckersSigningStargateClient.connectWithSigner(RPC_URL, bobSigner, {
            gasPrice: GasPrice.fromString("0stake"),
        })
        checkers = aliceClient.checkersQueryClient!.checkers
    })

    before("credit test accounts", async function () {
        this.timeout(40_000)
        if (
            parseInt((await aliceClient.getBalance(alice, "stake")).amount, 10) < aliceCredit.stake ||
            parseInt((await aliceClient.getBalance(alice, "token")).amount, 10) < aliceCredit.token
        )
            await askFaucet(alice, aliceCredit)
        expect(parseInt((await aliceClient.getBalance(alice, "stake")).amount, 10)).to.be.greaterThanOrEqual(
            aliceCredit.stake,
        )
        expect(parseInt((await aliceClient.getBalance(alice, "token")).amount, 10)).to.be.greaterThanOrEqual(
            aliceCredit.token,
        )
        if (
            parseInt((await bobClient.getBalance(bob, "stake")).amount, 10) < bobCredit.stake ||
            parseInt((await bobClient.getBalance(bob, "token")).amount, 10) < bobCredit.token
        )
            await askFaucet(bob, bobCredit)
        expect(parseInt((await bobClient.getBalance(bob, "stake")).amount, 10)).to.be.greaterThanOrEqual(
            bobCredit.stake,
        )
        expect(parseInt((await bobClient.getBalance(bob, "token")).amount, 10)).to.be.greaterThanOrEqual(
            bobCredit.token,
        )
    })

// test cases
    let gameId: string

    it("can create game with wager", async function () {
        this.timeout(10_000)
        const response: DeliverTxResponse = await aliceClient.createGame(
            alice,
            alice,
            bob,
            "token",
            Long.fromNumber(1),
            "auto",
        )
        const logs: Log[] = JSON.parse(response.rawLog!)
        expect(logs).to.be.length(1)
        gameId = getCreatedGameId(getCreateGameEvent(logs[0])!)
        const game: StoredGame = (await checkers.getStoredGame(gameId))!
        expect(game).to.include({
            index: gameId,
            black: alice,
            red: bob,
            denom: "token",
        })
        expect(game.wager.toNumber()).to.equal(1)
    })

    it("can play first moves and pay wager", async function () {
        this.timeout(20_000)
        const aliceBalBefore = parseInt((await aliceClient.getBalance(alice, "token")).amount, 10)
        await aliceClient.playMove(alice, gameId, {x: 1, y: 2}, {x: 2, y: 3}, "auto")
        expect(parseInt((await aliceClient.getBalance(alice, "token")).amount, 10)).to.be.equal(
            aliceBalBefore - 1,
        )
        const bobBalBefore = parseInt((await aliceClient.getBalance(bob, "token")).amount, 10)
        await bobClient.playMove(bob, gameId, {x: 0, y: 5}, {x: 1, y: 4}, "auto")
        expect(parseInt((await aliceClient.getBalance(bob, "token")).amount, 10)).to.be.equal(
            bobBalBefore - 1,
        )
    })

    it("can play first moves and pay wager", async function () {
        this.timeout(20_000)
        const aliceBalBefore = parseInt((await aliceClient.getBalance(alice, "token")).amount, 10)
        await aliceClient.playMove(alice, gameId, {x: 1, y: 2}, {x: 2, y: 3}, "auto")
        expect(parseInt((await aliceClient.getBalance(alice, "token")).amount, 10)).to.be.equal(
            aliceBalBefore - 1,
        )
        const bobBalBefore = parseInt((await aliceClient.getBalance(bob, "token")).amount, 10)
        await bobClient.playMove(bob, gameId, {x: 0, y: 5}, {x: 1, y: 4}, "auto")
        expect(parseInt((await aliceClient.getBalance(bob, "token")).amount, 10)).to.be.equal(
            bobBalBefore - 1,
        )
    })


    interface ShortAccountInfo {
        accountNumber: number
        sequence: number
    }

    const getShortAccountInfo = async (who: string): Promise<ShortAccountInfo> => {
        const accountInfo: Account = (await aliceClient.getAccount(who))!
        return {
            accountNumber: accountInfo.accountNumber,
            sequence: accountInfo.sequence,
        }
    }

    const whoseClient = (who: Player) => (who == "b" ? aliceClient : bobClient)
    const whoseAddress = (who: Player) => (who == "b" ? alice : bob)

    it("can continue the game up to before the double capture", async function () {
        this.timeout(20_000)
        const client: CheckersStargateClient = await CheckersStargateClient.connect(RPC_URL)
        const chainId: string = await client.getChainId()
        const accountInfo = {
            b: await getShortAccountInfo(alice),
            r: await getShortAccountInfo(bob),
        }

        //get all 22 signed transactions, from index 2 to index 23
        const txList: TxRaw[] = []
        let txIndex: number = 2
        while (txIndex < 24) {
            const gameMove: GameMove = completeGame[txIndex]
            txList.push(
                await whoseClient(gameMove.player).sign(
                    whoseAddress(gameMove.player),
                    [
                        {
                            typeUrl: typeUrlMsgPlayMove,
                            value: {
                                creator: whoseAddress(gameMove.player),
                                gameIndex: gameId,
                                fromX: gameMove.from.x,
                                fromY: gameMove.from.y,
                                toX: gameMove.to.x,
                                toY: gameMove.to.y,
                            },
                        },
                    ],
                    {
                        amount: [{denom: "stake", amount: "0"}],
                        gas: "500000",
                    },
                    `playing move ${txIndex}`,
                    {
                        accountNumber: accountInfo[gameMove.player].accountNumber,
                        sequence: accountInfo[gameMove.player].sequence++,
                        chainId: chainId,
                    },
                ),
            )
            txIndex++
        }

        //fire broadcast the first 21 of them
        const hashes: BroadcastTxSyncResponse[] = []
        txIndex = 0
        while (txIndex < txList.length - 1) {
            const txRaw: TxRaw = txList[txIndex]
            hashes.push(await client.tmBroadcastTxSync(TxRaw.encode(txRaw).finish()))
            txIndex++
        }

        //normally broadcast the last one
        const lastDelivery: DeliverTxResponse = await client.broadcastTx(
            TxRaw.encode(txList[txList.length - 1]).finish(),
        )

        console.log(
            txList.length,
            "transactions included in blocks from",
            (await client.getTx(toHex(hashes[0].hash)))!.height,
            "to",
            lastDelivery.height,
        )

        const game: StoredGame = (await checkers.getStoredGame(gameId))!
        expect(game.board).to.equal("*b*b***b|**b*b***|***b***r|********|***r****|********|***r****|r*B*r*r*")
    })

    it("can send a double capture move", async function () {
        this.timeout(10_000)
        const firstCaptureMove: GameMove = completeGame[24]
        const secondCaptureMove: GameMove = completeGame[25]

        const response: DeliverTxResponse = await aliceClient.signAndBroadcast(
            alice,
            [
                {
                    typeUrl: typeUrlMsgPlayMove,
                    value: {
                        creator: alice,
                        gameIndex: gameId,
                        fromX: firstCaptureMove.from.x,
                        fromY: firstCaptureMove.from.y,
                        toX: firstCaptureMove.to.x,
                        toY: firstCaptureMove.to.y,
                    },
                },
                {
                    typeUrl: typeUrlMsgPlayMove,
                    value: {
                        creator: alice,
                        gameIndex: gameId,
                        fromX: secondCaptureMove.from.x,
                        fromY: secondCaptureMove.from.y,
                        toX: secondCaptureMove.to.x,
                        toY: secondCaptureMove.to.y,
                    },
                },
            ],
            "auto",
        )

        const logs: Log[] = JSON.parse(response.rawLog!)
        expect(logs).to.be.length(2)
        expect(getCapturedPos(getMovePlayedEvent(logs[0])!)).to.deep.equal({
            x: 3,
            y: 6,
        })
        expect(getCapturedPos(getMovePlayedEvent(logs[1])!)).to.deep.equal({
            x: 3,
            y: 4,
        })

    })
})
