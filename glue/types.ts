type Namespace = "adsk-forma-elements";
type System = string;
type Id = string;
type Revision = string;
type AuthContext = string;
export type Urn = string;

type ISO8601DateTime = string;
type TrackingID = string;
type Metadata = {
    /** Pointer to the previous version of this element */
    predecessor?: Urn;
    createdAt?: ISO8601DateTime;
    createdBy?: TrackingID;
}

export type Link = {
    /** Relative path to file. Assume same domain, follow redirects */
    url: string;
    /** Optional id, if present consumers should extract specific node from file */
    id?: string;
    /** Data format of file. */
    format?: "glb" | "geojson" | string
    /** Additional metadata about the file */
    properties?: { [key: string]: any }
};
type Category = "building" | "vegetation" | string;
export type BaseProperties = {
    category?: Category;
    geometry?: {
        volumeMesh?: Link
        footprint?: Link
        [key: string]: Link | undefined;
    }
    [key: string]: any
}

/** Column-major 4x4 matrix. Translation values use metres as unit. */
export type Transform = [
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
    number, number, number, number
];

export type BaseElement = {
    urn: Urn;
    metadata?: Metadata;
    properties?: BaseProperties;
    transform?: Transform;
    children?: Urn[];
}

/** Response format for GET /api/<system>/elements/<id>/revisions/<rev> */
export type ElementResponse = { [key: Urn]: BaseElement }