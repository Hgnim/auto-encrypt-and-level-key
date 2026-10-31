import immHash from "imurmurhash";
export default function getHexHash(ipt: string): string {
    return immHash(ipt).result().toString(16).padStart(8, "0");
}
