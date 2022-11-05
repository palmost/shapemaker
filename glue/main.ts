import {create, ShapeDiverSdkApiResponseType} from "@shapediver/sdk.geometry-api-sdk-v2";

const justGiveMeLinks = (outputs: { [key: string]: any }) => {
    const toDownload: string[] = []
    Object.keys(outputs).forEach(x => {
        toDownload.push(outputs[x].content[0].href)
    })
    return toDownload
}
export const init = async () => {
    console.log("Hello from init");
    const sdk = create("https://sdr7euc1.eu-central-1.shapediver.com")
};


export const update = async (parameters: { [key: string]: any }) => {
    const sdk = create("https://sdr7euc1.eu-central-1.shapediver.com")
    const res = await sdk.session.init("")
    const newModel = await sdk.utils.submitAndWaitForCustomization(sdk, res.sessionId!, parameters, 30)
    //@ts-ignore
    const newLinks = justGiveMeLinks(newModel.outputs)
    const data = sdk.utils.download(newLinks[0], ShapeDiverSdkApiResponseType.DATA)
    return newLinks
};
export const commit = async () => {

};



//const parameters = {"8937f2a7-33ad-4d9d-aa62-2adb10bbfdce": 4}
//
// update(parameters).then(() => {
//     console.log("success!")
// })