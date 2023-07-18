import {expect} from "chai"
import {config} from "dotenv"
import {CheckersStargateClient} from "../../checkers_stargateclient";
import {CheckersExtension} from "../../modules/queries";

config()

describe("SystemInfo", function () {
    let client: CheckersStargateClient, checkers: CheckersExtension["checkers"]

    before("create client", async function () {
        client = await CheckersStargateClient.connect(process.env.RPC_URL)
        checkers = client.checkersQueryClient!.checkers
    })

    it("can get system info", async function () {
        const systemInfo = await checkers.getSystemInfo()
        expect(systemInfo.nextId.toNumber()).to.be.greaterThanOrEqual(1)
        expect(parseInt(systemInfo.fifoHeadIndex, 10)).to.be.greaterThanOrEqual(-1)
        expect(parseInt(systemInfo.fifoTailIndex, 10)).to.be.greaterThanOrEqual(-1)
    })
})
