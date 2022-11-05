import {create, ShapeDiverRequestExport, ShapeDiverSdkApiResponseType} from "@shapediver/sdk.geometry-api-sdk-v2";

const justGiveMeLinks = (outputs: { [key: string]: any }) => {
    const toDownload: string[] = []
    Object.keys(outputs).forEach(x => {
        toDownload.push(outputs[x].content[0].href)
    })
    return toDownload
}
export const init = async () => {

}
export const update = async (parameters: { [key: string]: any }) => {
    const backendTicket = "876e64316f8860442aefbefa06ec65dafa2e740e96acc263756bf0ebdb0e9af8f3cb60766f61c2670956c178fa546fcc7d2c9eeeec8fe3ad2f5c4398eb068c89477cfeda7f7f3e41dd869963418b878d037e1d27809d712ac06edb0329be54792de10929de9a292cb0f16abd46d8f4396f577e798c61f541-d138b0173447e2134e2535695d47f6f6"
    //const ticket = "a9a9308fcd8b68f53b8c16ab3a013e3413212dfd198fe4ddb69b9d7de7e613d42ecce55e37c81e99ad399798de9bd9479e3a1d15212fccaeba592343a85097f4d66dfce4b67fb892dc2b98f5beefa4aa76d60a9c38f9f076febe3649f5ab8b2617b7f941fd4817-416f55bd3b13aaeb157012248f38b574"
    const sdk = create("https://sdr7euc1.eu-central-1.shapediver.com")
    const res = await sdk.session.init(backendTicket)
    //@ts-ignore
    const newModel = await sdk.utils.submitAndWaitForCustomization(sdk, res.sessionId!, parameters, 30)
    //@ts-ignore
    console.log(newModel)
    const newLinks = justGiveMeLinks(newModel.outputs!)
    const data = await sdk.utils.download(newLinks[0], ShapeDiverSdkApiResponseType.DATA)
    return data
};
export const commit = async () => {

};

//
// const parameters = {"8937f2a7-33ad-4d9d-aa62-2adb10bbfdce": 4}
//
// update(parameters).then(() => {
//     console.log("success!")
// })