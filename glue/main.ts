import {create, ShapeDiverSdkApiResponseType} from "@shapediver/sdk.geometry-api-sdk-v2";

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
    const ticket = "0675204a3092e3e5c47aac9e8fe516de4abd22f22df710f6ad9ecfb3117f9f351af9c295c6efcf02db08fe6c76413ab70f0260e14610fe01b23761115abbe48966fd11fa6ebaa18bcf6a903b32c48224c3d7d2e963607aae2b3c444e6d65d8800717683f4a524d-a52b0bd56254ee507df83fd758043fcb"
    const sdk = create("https://sdr7euc1.eu-central-1.shapediver.com")
    const res = await sdk.session.init(ticket)
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