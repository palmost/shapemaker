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
    polygon: [number, number][]
}


const mapParams = (smParams: SpacemakerParams) => ({
    "8937f2a7-33ad-4d9d-aa62-2adb10bbfdce": smParams["8937f2a7-33ad-4d9d-aa62-2adb10bbfdce"],
    "de401644-53b9-4414-a042-6463f35892e2": JSON.stringify({points: smParams.polygon.map((point) => [point[0], point[1], 0])})
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
        const ticket = "a9a9308fcd8b68f53b8c16ab3a013e3413212dfd198fe4ddb69b9d7de7e613d42ecce55e37c81e99ad399798de9bd9479e3a1d15212fccaeba592343a85097f4d66dfce4b67fb892dc2b98f5beefa4aa76d60a9c38f9f076febe3649f5ab8b2617b7f941fd4817-416f55bd3b13aaeb157012248f38b574"
        const sdk = create("https://sdr7euc1.eu-central-1.shapediver.com")
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
        const elements = {
            rootElement: "1",
            elements: {
                "1":{
                    id: "1",
                    revision: 1929312,
                    geometry: {
                        color: [255,255,100],
                        //@ts-ignore
                        verts: new Float32Array(obj.verts),
                        //@ts-ignore
                        indices: obj.faces
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

const mapObj = (objBuffer: ArrayBuffer) => {
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
    console.log(models)
    return models[0]
};

//
// const parameters = {"8937f2a7-33ad-4d9d-aa62-2adb10bbfdce": 4}
//
// update(parameters).then(() => {
//     console.log("success!")
// })