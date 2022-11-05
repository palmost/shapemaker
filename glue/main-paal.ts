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
    const ticket = "3860eacde20a0972603dc72dca62729a50a6360ebea0286d4a1ee4a4882448f1362231516f79bf164b17a70dd1396de328228e4d729155ba5f13dc21c85173f7ea0b4e3496f8c08c48f03f11205f25459e77472069fb511868e469b876d7eccbbcb5b31385672e43a634b40cb3a911f406aa08b602d6eba8-a2cd2ca549c9a417fc148c087e3b24c7"
    const sdk = create("https://sdr7euc1.eu-central-1.shapediver.com")
    const res = await sdk.session.init(ticket)
    //@ts-ignore
     const exportId = Object.keys(res.exports)[0]
    //const newModel = await sdk.utils.submitAndWaitForCustomization(sdk, res.sessionId!, parameters, 30)
    //@ts-ignore
    console.log(res.parameters)
    // const test : ShapeDiverRequestExport ={
    //
    // }
    //@ts-ignore
    const newModel = await sdk.utils.submitAndWaitForExport(sdk,res.sessionId!, { exports:{id: exportId}, parameters},30)
    const newLinks = justGiveMeLinks(newModel.exports!)
    const data = await sdk.utils.download(newLinks[0], ShapeDiverSdkApiResponseType.DATA)

  //  console.log(data)
   // return newLinks
};
export const commit = async () => {

};


const parameters = {"8937f2a7-33ad-4d9d-aa62-2adb10bbfdce": 4}

update(parameters).then(() => {
    console.log("success!")
})