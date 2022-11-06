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

type SpacemakerParams = {
    "8937f2a7-33ad-4d9d-aa62-2adb10bbfdce": number
    "de401644-53b9-4414-a042-6463f35892e2": [number, number][]
}


const mapParams = (smParams: SpacemakerParams) => ({
    "8937f2a7-33ad-4d9d-aa62-2adb10bbfdce": smParams["8937f2a7-33ad-4d9d-aa62-2adb10bbfdce"],
    "de401644-53b9-4414-a042-6463f35892e2": JSON.stringify({points: smParams["de401644-53b9-4414-a042-6463f35892e2"].map((point) => [point[0], point[1], 0])})
})
let semaphore = false
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const update = async (parameters: SpacemakerParams): Promise<GeneratorResponse|undefined> => {
    while (semaphore) {
        await sleep(1000)
        console.log("waiting for update semaphore")
    }
    semaphore = true
    try {
        const shapeDiverParams = mapParams(parameters)
        const ticket = "2972bb403a6ed50c1307ffa54a2a3ffa30c41b8db8165f7780a33f015d7ccda424609d59f794a0ec104ae0daa18273f838b46a18a595887ca69e8c254250b01a89fbf602e333b65d61f970239499e3bd58ff0a590e033700b131b0a30930ed1c906bfb5fa00f17-87fe015fba6bd982eeb2a4592b84d12d"
        const sdk = create("https://sddev2.eu-central-1.shapediver.com")
        const res = await sdk.session.init(ticket)
        //@ts-ignore
        const exportId = Object.keys(res.exports)[0]
        console.log(shapeDiverParams)
        const newModel = await sdk.utils.submitAndWaitForExport(sdk, res.sessionId!, {
            exports: {id: exportId},
            parameters: shapeDiverParams
        }, 30)
        const newLinks = justGiveMeLinks(newModel.exports!)
        const [_, objBuffer] = await sdk.utils.download(newLinks[0], ShapeDiverSdkApiResponseType.DATA) as [any, ArrayBuffer]
        console.log(objBuffer)
        const obj = mapObj(objBuffer)
        console.log(obj)
        debugger
        const elements = {
            rootElement: "1",
            elements: {
                "1":{
                    id: "1",
                    revision: 1929312,
                    geometry: {
                        color: [255,255,100],
                        //@ts-ignore
                        verts: new Float32Array(obj[0].verts),
                        //@ts-ignore
                        indices: obj[0].faces
                    },
                    properties:{}
                }
            }
        }
        return elements
    } catch (error){
        console.log(error)
    } finally {
        semaphore = false
    }
};
export const commit = async () => {

};

import * as THREE from "three";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader.js";
import {Object3D} from "three/src/core/Object3D";

export declare type Transform = [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number
];

export type GeneratorElement = {
    id: string
    revision: number
    geometry?: {
        verts: Float32Array
        indices: number[]
        color: number[]
    }
    properties: {
        geometry?: {
            verts: Float32Array
            indices: number[]
            color: number[]
        }
    }
    transform?: Transform
    children?: string[]
}

export type GeneratorElements = { [keyof: string]: GeneratorElement }
export type GeneratorResponse = { rootElement: string; elements: GeneratorElements }

type ParsedObj = {
    verts: number[]
    faces: number[]
}


const mapSpecificObj = (objBuffer: ArrayBuffer): ParsedObj[] => {
    const decoder = new TextDecoder("utf-8")
    const obj = decoder.decode(objBuffer)
    const lines = obj.split('\n')
    const parsedObjs = [] as ParsedObj[]

    let currentObj: ParsedObj = {
        verts: [],
        faces: []
    }
    const resetCurrent = () => {
        currentObj = {
            verts: [],
            faces: []
        }
    }
    let previousLineType = ''
    resetCurrent()
    let vStart = 0
    lines.forEach((line, index) => {
        if (line.startsWith('#')){
            return
        }
        const [currentLineType, x,y,z] = line.split(' ')
        if (currentLineType == 'v'  && previousLineType == 'f'){
            parsedObjs.push(currentObj)
            resetCurrent()
        }
        previousLineType = currentLineType
        if (currentLineType == 'v' && previousLineType !== 'v'){
            vStart = index + 1
        }
        if (currentLineType == 'v'){
            currentObj.verts.push(...[x,y,z].map(Number))
        } else if (currentLineType == 'f'){
            currentObj.faces.push(...[x,y,z].map(Number).map(f => f - vStart))
        }
    })
    parsedObjs.push(currentObj)
    return parsedObjs

}

const mapObj = (objBuffer: ArrayBuffer): ParsedObj[] => {
    const decoder = new TextDecoder("utf-8")
    const obj = decoder.decode(objBuffer)
    const loader = new OBJLoader();
    const object = loader.parse(obj) as Object3D;
    const recursiveFindGeometryNode = (object: Object3D):THREE.Mesh[] => {
        let meshes: THREE.Mesh[] = [];
        for (let child of object.children) {
            const meshesOfChildren = recursiveFindGeometryNode(child);
            if (meshesOfChildren) {
                meshes = meshes.concat(meshesOfChildren);
            }
        }
        if (
            object instanceof THREE.Mesh &&
            object.geometry instanceof THREE.BufferGeometry
        ) {
            meshes.push(object);
        }
        return meshes;
    };
    const meshes = recursiveFindGeometryNode(object) as THREE.Mesh[];
    const models = meshes.map((mesh) => {
        const obj = {};
        //@ts-ignore
        obj["verts"] = Object.values(
            mesh.geometry.getAttribute("position").array
        ) as number[];
        if (mesh.geometry.index) {
        //@ts-ignore
            obj["faces"] = mesh.geometry.index;
        } else {
            //@ts-ignore
            obj["faces"] = obj["verts"].map((_, i) => i)
        }
        return obj;
    });
    debugger
    console.log(models)
    //@ts-ignore
    return models
};

//
// const parameters = {"8937f2a7-33ad-4d9d-aa62-2adb10bbfdce": 4}
//
// update(parameters).then(() => {
//     console.log("success!")
// })