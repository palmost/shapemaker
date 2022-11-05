import {create, ShapeDiverSdkApiResponseType} from "@shapediver/sdk.geometry-api-sdk-v2";

const main = async () => {

    const sdk = create("https://sdr7euc1.eu-central-1.shapediver.com")
    const res = await sdk.session.init()
    //@ts-ignore

    const toDownload = []
    //@ts-ignore
    Object.keys(res.outputs).forEach(x => {
        //@ts-ignore
        toDownload.push(res.outputs[x].content[0].href)
    })
    //@ts-ignore
    console.log(toDownload)
    //@ts-ignore
    const file = awsdk.utils.download(toDownload[0], ShapeDiverSdkApiResponseType.DATA)
    console.log(file)
}

main().then(res => {

    console.log(res)
})