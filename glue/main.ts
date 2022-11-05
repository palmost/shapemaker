import {create, ShapeDiverSdkApiResponseType} from "@shapediver/sdk.geometry-api-sdk-v2";

const justGiveMeLinks =(outputs : {[key: string] : any}) => {
    const toDownload :string[] = []
    Object.keys(outputs).forEach(x => {
        toDownload.push(outputs[x].content[0].href)
    })
    return toDownload
}
const main = async () => {

    const sdk = create("https://sdr7euc1.eu-central-1.shapediver.com")
    const res = await sdk.session.init("")
    //@ts-ignore

    //@ts-ignore
    const currentLinks = justGiveMeLinks(res.outputs)

   // const file = sdk.utils.download(toDownload[0], ShapeDiverSdkApiResponseType.DATA)

    const newModel = await sdk.utils.submitAndWaitForCustomization(sdk, res.sessionId!, {"8937f2a7-33ad-4d9d-aa62-2adb10bbfdce": 4}, 30)
    //@ts-ignore
    const newLinks = justGiveMeLinks(newModel.outputs)
    console.log(newLinks)
    //  console.log(res)

}

main().then(res => {

    console.log(res)
})