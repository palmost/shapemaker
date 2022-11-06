import {
    create,
    ShapeDiverResponseDto,
    ShapeDiverResponseOutput,
    ShapeDiverSdkApiResponseType
} from "@shapediver/sdk.geometry-api-sdk-v2";
import {ElementResponse, Transform} from "./types";

const MAGIC_URN = 'ada0cfd4-fd26-4faf-91cb-3e4c391a794d'

type SpacemakerParams = {
    "a6f89594-6a2c-4fcb-abd8-774db952d7e": number
    "de401644-53b9-4414-a042-6463f35892e2": [number, number][]
}


const mapParams = (smParams: SpacemakerParams) => ({
    "a6f89594-6a2c-4fcb-abd8-774db952d7ec": smParams["a6f89594-6a2c-4fcb-abd8-774db952d7e"],
    "de401644-53b9-4414-a042-6463f35892e2": JSON.stringify({points: smParams["de401644-53b9-4414-a042-6463f35892e2"].map((point) => [point[0], point[1], 0])})

})
const getGltfUrl = (res: ShapeDiverResponseDto) => {
    const outputIds = Object.keys(res.outputs!)
    const gltfOutputId = outputIds.find((i) => res.outputs![i].name === "glTFDisplay")
    return (res.outputs![gltfOutputId!] as ShapeDiverResponseOutput).content![0].href
}

export const init = async () => {

}
export const update = async (params: SpacemakerParams) => {

};
export const commit = async (params: SpacemakerParams, callback: any, transform: Transform) => {
    const parameters = mapParams(params)
    const ticket =
        "2a3f8d64e0b74fb5479980f1396614b812f009893f4451b24ec709ee87a53f216a8ea375635402439e4158bc4ce368cfd4efed77b848a6fc494e53b203f60c603b99b0dcc16c179c5bb9d3627146c350d9102b3e7c6a1cc5c79a137c24b99ce45e993da6001aab-d34ad34c35da284cb7f333895961e14c"
    const sdk = create("https://sddev2.eu-central-1.shapediver.com")
    const res = await sdk.session.init(ticket)
    //@ts-ignore
    const newModel = await sdk.utils.submitAndWaitForCustomization(sdk, res.sessionId!, parameters, 30)
    const gltfUrl = getGltfUrl(newModel)!
    const [_, data] = await sdk.utils.download(gltfUrl, ShapeDiverSdkApiResponseType.DATA)
    const revision = Date.now()
    return await uploadElement(data, revision, transform)
};



const uploadElement = async (data: ArrayBuffer, revision: number, transform: Transform): Promise<string> => {
    await uploadGlb(data, revision)
    const urnOfElement = `urn:adsk-forma-elements:integrate:pro_qtqpsxku4u:ada0cfd4-fd26-4faf-91cb-3e4c391a794h:${revision}`
    const urnOfPointer = `urn:adsk-forma-elements:integrate:pro_qtqpsxku4u:ada0cfd4-fd26-4faf-91cb-3e4c391a794d:${revision}`

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
                }
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
