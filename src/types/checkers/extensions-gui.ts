import {IGameInfo} from "../../sharedTypes";
import {storedToGameInfo} from "./board";
import Long from "long";
import {CheckersStargateClient} from "../../checkers_stargateclient";
import {StoredGame} from "../generated/checkers/stored_game";
import {CheckersSigningStargateClient} from "../../checkers_signingstargateclient";
import {DeliverTxResponse} from "@cosmjs/stargate";
import {Log} from "@cosmjs/stargate/build/logs";
import {getCreatedGameId, getCreateGameEvent} from "./events";

declare module "../../checkers_stargateclient" {
    interface CheckersStargateClient {
        getGuiGames(): Promise<IGameInfo[]>

        getGuiGame(index: string): Promise<IGameInfo | undefined>
    }
}

CheckersStargateClient.prototype.getGuiGames = async function (): Promise<IGameInfo[]> {
    return (
        await this.checkersQueryClient!.checkers.getAllStoredGames(
            Uint8Array.from([]),
            Long.ZERO,
            Long.fromNumber(20),
            true,
        )
    ).storedGames.map(storedToGameInfo)
}

CheckersStargateClient.prototype.getGuiGame = async function (index: string): Promise<IGameInfo | undefined> {
    const storedGame: StoredGame | undefined = await this.checkersQueryClient!.checkers.getStoredGame(index)
    if (!storedGame) return undefined
    return storedToGameInfo(storedGame)
}

declare module "../../checkers_signingstargateclient" {
    interface CheckersSigningStargateClient {
        createGuiGame(creator: string, black: string, red: string): Promise<string>
    }
}

CheckersSigningStargateClient.prototype.createGuiGame = async function (
    creator: string,
    black: string,
    red: string,
): Promise<string> {
    console.log("createGuiGame: ", creator, black, red);
    let result: DeliverTxResponse;
    try {
        console.log("chainid: ", await this.getChainId())
        result = await this.createGame(creator, black, red, "stake", Long.ZERO, "auto")
    } catch (e) {
        console.log("createGuiGame error: ", e);
        throw e;
    }
    console.log("createGuiGame result: ", result);
    const logs: Log[] = JSON.parse(result.rawLog!)
    return getCreatedGameId(getCreateGameEvent(logs[0])!)
}