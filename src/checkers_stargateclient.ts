import {defaultRegistryTypes, QueryClient, StargateClient, StargateClientOptions} from "@cosmjs/stargate";
import {BroadcastTxSyncResponse, Tendermint34Client} from "@cosmjs/tendermint-rpc";
import {CheckersExtension, setupCheckersExtension} from "./modules/queries";
import {checkersTypes} from "./types/checkers/messages";
import {GeneratedType} from "@cosmjs/proto-signing";

export const checkersDefaultRegistryTypes: ReadonlyArray<[string, GeneratedType]> = [
    ...defaultRegistryTypes,
    ...checkersTypes,
]


export class CheckersStargateClient extends StargateClient {
    public readonly checkersQueryClient: CheckersExtension | undefined

    public static async connect(
        endpoint: string,
        options?: StargateClientOptions,
    ): Promise<CheckersStargateClient> {
        const tmClient = await Tendermint34Client.connect(endpoint)
        return new CheckersStargateClient(tmClient, options)
    }

    protected constructor(tmClient: Tendermint34Client | undefined, options: StargateClientOptions = {}) {
        super(tmClient, options)
        if (tmClient) {
            this.checkersQueryClient = QueryClient.withExtensions(tmClient, setupCheckersExtension)
        }
    }

    public async tmBroadcastTxSync(tx: Uint8Array): Promise<BroadcastTxSyncResponse> {
        return this.forceGetTmClient().broadcastTxSync({tx})
    }
}
