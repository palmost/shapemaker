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
    const ticket = "a9a9308fcd8b68f53b8c16ab3a013e3413212dfd198fe4ddb69b9d7de7e613d42ecce55e37c81e99ad399798de9bd9479e3a1d15212fccaeba592343a85097f4d66dfce4b67fb892dc2b98f5beefa4aa76d60a9c38f9f076febe3649f5ab8b2617b7f941fd4817-416f55bd3b13aaeb157012248f38b574"
    const sdk = create("https://sdr7euc1.eu-central-1.shapediver.com")
    const res = await sdk.session.init(ticket)
    //@ts-ignore
     const exportId = Object.keys(res.exports)[0]
    const newModel = await sdk.utils.submitAndWaitForExport(sdk,res.sessionId!, { exports:{id: exportId}, parameters},30)
    const newLinks = justGiveMeLinks(newModel.exports!)
    const objBuffer = await sdk.utils.download(newLinks[0], ShapeDiverSdkApiResponseType.DATA)
};
export const commit = async () => {

};

//
// const parameters = {"8937f2a7-33ad-4d9d-aa62-2adb10bbfdce": 4}
//
// update(parameters).then(() => {
//     console.log("success!")
// })