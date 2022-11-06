import {
    create,
    ShapeDiverResponseDto,
    ShapeDiverResponseOutput,
    ShapeDiverSdkApiResponseType
} from "@shapediver/sdk.geometry-api-sdk-v2";


type SpacemakerParams = {

}


const mapParams = (smParams: SpacemakerParams) => ({

})
const getGltfUrl = (res: ShapeDiverResponseDto) => {
    const outputIds = Object.keys(res.outputs!)
    const gltfOutputId = outputIds.find((i) => res.outputs![i].name === "glTFDisplay")
    return (res.outputs![gltfOutputId!] as ShapeDiverResponseOutput).content![0].href
}

export const init = async () => {

}
export const update = async (params: SpacemakerParams) => {
    const parameters = mapParams(params)
    const ticket =
        "a793b4adbfa7574d515167662de0194e296cf549f42a3797416fb6d14ade87e0c15e9bc4218add2c0d03eea785723c010b9b3143f25b00d129781bd1a530c38d3355210530ad30c1d6cebd1f932d019d7a37d72c38723abd77b448835c63c6a5cdb9954e5739de-fe19d8f6e4a94e5fecaed6abec458eba"
    const sdk = create("https://sdr7euc1.eu-central-1.shapediver.com")
    const res = await sdk.session.init(ticket)
    //@ts-ignore
    const newModel = await sdk.utils.submitAndWaitForCustomization(sdk, res.sessionId!, parameters, 30)
    const gltfUrl = getGltfUrl(newModel)!
    const data = await sdk.utils.download(gltfUrl, ShapeDiverSdkApiResponseType.DATA)
    return data
};
export const commit = async (params: SpacemakerParams) => {
    const parameters = mapParams(params)
    const ticket =
        "a793b4adbfa7574d515167662de0194e296cf549f42a3797416fb6d14ade87e0c15e9bc4218add2c0d03eea785723c010b9b3143f25b00d129781bd1a530c38d3355210530ad30c1d6cebd1f932d019d7a37d72c38723abd77b448835c63c6a5cdb9954e5739de-fe19d8f6e4a94e5fecaed6abec458eba"
    const sdk = create("https://sdr7euc1.eu-central-1.shapediver.com")
    const res = await sdk.session.init(ticket)
    //@ts-ignore
    const newModel = await sdk.utils.submitAndWaitForCustomization(sdk, res.sessionId!, parameters, 30)
    const gltfUrl = getGltfUrl(newModel)!
    const data = await sdk.utils.download(gltfUrl, ShapeDiverSdkApiResponseType.DATA)

};

