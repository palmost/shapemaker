import {
    create,
    ShapeDiverResponseDto,
    ShapeDiverResponseOutput,
    ShapeDiverSdkApiResponseType
} from "@shapediver/sdk.geometry-api-sdk-v2";
import {ElementResponse, Transform} from "./types";

const MAGIC_URN = 'ada0cfd4-fd26-4faf-91cb-3e4c391a794d'

type SpacemakerParams = {
    "a6f89594-6a2c-4fcb-abd8-774db952d7e": number,
    "dfdd143c-0541-4612-b479-0f1244a88411": number,
    "de401644-53b9-4414-a042-6463f35892e2": [number, number][]
}


const mapParams = (smParams: SpacemakerParams) => ({
    "a6f89594-6a2c-4fcb-abd8-774db952d7ec": smParams["a6f89594-6a2c-4fcb-abd8-774db952d7e"],
    "dfdd143c-0541-4612-b479-0f1244a88411": smParams["dfdd143c-0541-4612-b479-0f1244a88411"],
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
        "9d00e057cdf3dcf2479074be41379d8eb268648ffd728775ddf6910e656cbe420da8856528bdafd6dbe7fcb47328fae3dc1d4b71b95677574afdc3022015220e841bd407ee312ee512c83e3cf5f524ee3b6d1ff8e3468f1eead7bca5392b2e57d0da4978d4035d-20679ec4a73c41f6ac97ba1ecb312dc1"
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
