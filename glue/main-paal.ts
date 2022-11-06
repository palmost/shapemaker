import {
    create,
    ShapeDiverResponseDto,
    ShapeDiverResponseOutput,
    ShapeDiverSdkApiResponseType
} from "@shapediver/sdk.geometry-api-sdk-v2";
import {BaseElement, ElementResponse, Transform, Urn} from "./types";

const MAGIC_URN = 'ada0cfd4-fd26-4faf-91cb-3e4c391a794d'

type SpacemakerParams = {
    "a6f89594-6a2c-4fcb-abd8-774db952d7e": number,
    "dfdd143c-0541-4612-b479-0f1244a88411": number,
    "6a9aafe3-1220-45b1-8450-e5607786e902": number,
    "de9292be-a879-4ffa-9365-eabd22c73a51": number,
    "a349dcf8-3977-4feb-b2b1-f7ab8f388e2": number,
    "5ccc5e0e-d02a-4ca6-bee1-2834b64df82a": number,
    "1b6f17d6-2574-4841-9fbb-933be457c20b": number,
    "de401644-53b9-4414-a042-6463f35892e2": [number, number][]
}


const mapParams = (smParams: SpacemakerParams) => ({
    "a6f89594-6a2c-4fcb-abd8-774db952d7ec": smParams["a6f89594-6a2c-4fcb-abd8-774db952d7e"],
    "dfdd143c-0541-4612-b479-0f1244a88411": smParams["dfdd143c-0541-4612-b479-0f1244a88411"],
    "6a9aafe3-1220-45b1-8450-e5607786e902": smParams["6a9aafe3-1220-45b1-8450-e5607786e902"],
    "de9292be-a879-4ffa-9365-eabd22c73a51": smParams["de9292be-a879-4ffa-9365-eabd22c73a51"],
    "a349dcf8-3977-4feb-b2b1-f7ab8f388e20": smParams["a349dcf8-3977-4feb-b2b1-f7ab8f388e2"],
    "5ccc5e0e-d02a-4ca6-bee1-2834b64df82a": smParams["5ccc5e0e-d02a-4ca6-bee1-2834b64df82a"],
    "1b6f17d6-2574-4841-9fbb-933be457c20b": smParams["1b6f17d6-2574-4841-9fbb-933be457c20b"],
    "de401644-53b9-4414-a042-6463f35892e2": JSON.stringify({points: smParams["de401644-53b9-4414-a042-6463f35892e2"].map((point) => [point[0], point[1], 0])})

})
const getGltfUrl = (res: ShapeDiverResponseDto) => {
    const outputIds = Object.keys(res.outputs!)
    const gltfOutputId = outputIds.find((i) => res.outputs![i].name === "glTFDisplay")
    return (res.outputs![gltfOutputId!] as ShapeDiverResponseOutput).content![0].href
}

const getMetrics = (res: ShapeDiverResponseDto) => {
    const outputIds = Object.keys(res.outputs!)
    const gltfOutputId = outputIds.find((i) => res.outputs![i].name === "metrics")
    return res.outputs![gltfOutputId!] ? JSON.parse((res.outputs![gltfOutputId!] as ShapeDiverResponseOutput).content![0].data as string) : {}
}

export const init = async () => {

}
export const update = async (params: SpacemakerParams) => {

};
export const commit = async (params: SpacemakerParams, callback: any, transform: Transform) => {
    const parameters = mapParams(params)
    const ticket =
        "63fb831dd398fd01d569d49bb4f163cf2f42e41750807d9d056b248c5ffe5ec907934f47a866be24978c71bc4731ce8fa014def5268ae29a2a4670a731bd880ef3528a76d8522cab92fd6423be5ffa4c56afcf9fb38facea6186a87d8ab3212b1c38d5a707841f-34e6e0f972a7abb53a1b6d4a86ee6b72"
    const sdk = create("https://sddev2.eu-central-1.shapediver.com")
    const res = await sdk.session.init(ticket)
    //@ts-ignore
    const newModel = await sdk.utils.submitAndWaitForCustomization(sdk, res.sessionId!, parameters, 30)
    const gltfUrl = getGltfUrl(newModel)!
    const [_, data] = await sdk.utils.download(gltfUrl, ShapeDiverSdkApiResponseType.DATA)
    console.log(data)
    const revision = Date.now()
    return await uploadElement(data, revision, transform, getMetrics(newModel))
};



const uploadElement = async (data: ArrayBuffer, revision: number, transform: Transform, metrics: { [key: string]: any }): Promise<string> => {
    await uploadGlb(data, revision)
    console.log(metrics)
    const urnOfElement = `urn:adsk-forma-elements:integrate:pro_tfrapb8v4l:ada0cfd4-fd26-4faf-91cb-3e4c391a794h:${revision}`
    const urnOfPointer = `urn:adsk-forma-elements:integrate:pro_tfrapb8v4l:ada0cfd4-fd26-4faf-91cb-3e4c391a794d:${revision}`

    const elementResponse: ElementResponse = {
        [urnOfPointer]:{
            urn: urnOfPointer,
            transform: transform,
            children:[urnOfElement]
        },
        [urnOfElement]:{
            urn: urnOfElement,
            properties:{
                category: "building",
                geometry:{
                    volumeMesh: {
                        url: `/api/integrate/generator_bundle/shapemakerstoringfilesinweirdplaces/${revision}revisions.glb`,
                        format: "glb"
                    }
                },
                userDefinedMetrics: metrics
            }
        }
    }

    const requestOptions = {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(elementResponse)
    };
    await fetch(`/api/integrate/generator_bundle/shapemakerstoringfilesinweirdplaces/element_${revision}.json`, requestOptions)

    return urnOfPointer
}


const uploadGlb = async (data: ArrayBuffer, revision: number): Promise<void> => {
    const requestOptions = {
        method: 'PUT',
        headers: {'Content-Type': 'model/gltf-binary'},
        body: new Blob([data])
    };
    await fetch(`/api/integrate/generator_bundle/shapemakerstoringfilesinweirdplaces/${revision}revisions.glb`, requestOptions)
}
