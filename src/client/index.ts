import { DataFile } from "../global/dataFile.type";
import cookie from "js-cookie";
import getHash from "../global/getHash";
import { EncFile } from "../global/encFile.type";
import { decryptStringToString } from "ez-encrypt";

const key_cookieName = "aealk_key";

export type AEALK_Opt = {
    //数据根目录。开头带斜杠结尾无斜杠，如果是根目录则用空值
    rootPath: string;
    cookiePath?: string;
};
export default async function AEALK(opt: AEALK_Opt) {
    const cookiePath: string = (opt.cookiePath === undefined) ? '/' : opt.cookiePath;

    let initIsSu: boolean|null=null;
    const dataFile: DataFile|null = await (async () => {
        const res = await fetch(`${opt.rootPath}/data.json`);
        if (res.ok) {
            return JSON.parse(await res.text()) as DataFile;
        } else {
            initIsSu = false;
            return null;
        };
    })();

    /**
     * 获取密钥所属等级
     * @param key 密钥
     * @returns 返回等级值，密钥错误则返回false，其它错误则返回null
     */
    function getKeyLevel(key: string): number|false|null {
        if (dataFile) {
            //console.log(dataFile);
            const kh = getHash(key);
            //console.log(kh);
            for (let i = 0; i < dataFile.levelKeyHash.length; i++) {
                if (dataFile.levelKeyHash[i] === kh) return i;
            }
            return false;
        } else return null;
    }

    /**
     * 验证并导入密钥至cookie
     * @param key 密钥
     * @returns 成功返回true，否则返回false
     */
    function checkAndInputKey(key:string):boolean {
        const kl = getKeyLevel(key);
        //console.log(kl);
        if (kl !== false && kl !== null) {
            cookie.set(key_cookieName, key, {
                secure: true,
                sameSite: "strict",
                path: cookiePath,
                expires: 60,
            });
            return true;
        } else return false;
    }

    function getKeyFromCookie():string|undefined {
        return cookie.get(key_cookieName);
    }

    /**
     * 获取解密后的文件
     * @param path 路径，基于root的路径，开头无需斜杠
     * @param key 密钥，留空则自动读取cookie
     * @returns 成功则返回文件内容；获取文件失败返回1；密钥错误返回2；权限不够返回3
     */
    async function getFile(
        path: string,
        key: string | null = null,
    ): Promise<string | number> {
        if (dataFile) {
            const k = key == null ? getKeyFromCookie() : key;

            if (k) {
                const res = await fetch(`${opt.rootPath}/${path}.enc.json`);
                if (res.ok) {
                    const ef: EncFile = JSON.parse(await res.text()) as EncFile;
                    const kl = getKeyLevel(k);
                    if (kl !== false && kl !== null) {
                        try {
                            if (kl < ef.level) return 3;

                            const otherKey: string[] = [];
                            for (let i = 0; i < kl; i++) {
                                let tmpKey;
                                if (i === 0) tmpKey = k;
                                else tmpKey = otherKey[i - 1];
                                
                                otherKey.push(decryptStringToString(
                                    dataFile.levelKeyEnc[kl - i - 1],
                                    tmpKey
                                ));
                            }

                            let fileKey: string = '';
                            for (let i = 0; i < ef.level; i++){
                                fileKey += otherKey[otherKey.length - 1 - i];
                            }
                            fileKey += k;

                            return decryptStringToString(ef.encContent, fileKey);
                        } catch {
                            return 2;
                        }
                    } else return 2;
                } else return 1;
            } else return 2;
        } else return 1;
    }

    if (initIsSu === null) initIsSu = true;
    return {
        initIsSu,
        getKeyLevel,
        checkAndInputKey,
        getKeyFromCookie,
        getFile,
        //dataFile,
    };
}