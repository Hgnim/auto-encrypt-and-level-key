import fs from "fs";
import path from "path";
import {
    encryptUint8ArrayToString,
    encryptStringToString,
    convUint8ArrayToString,
} from "ez-encrypt";
import type { EncFile } from '../global/encFile.type';
import type { DataFile } from '../global/dataFile.type';
import getHash from '../global/getHash';

export type BEF_Opt = {
    rootDir: string,
    outputDir: string;
    levelKeys: string[];
    doEnc: {
        path: string;
        pathIsDir?: boolean;
        keyLevel: number;
        output?: {
            path?: string;
            name?: string;
        };
    }[];
    log?:boolean,
};
export default function buildEncFiles(opt: BEF_Opt) {
    const outputDir: string = path.join(opt.rootDir, opt.outputDir);
    const log: boolean = (opt.log === true);

    function checkDir(path: string) {
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true }); //递归创建目标目录
            if (log) console.log(`目录不存在，创建目录：${path}`);
        } else {
            if (log) console.log(`目录存在：${path}`);
        }
    }


    checkDir(outputDir);

    opt.doEnc.forEach(de => {
        const output_path: string | undefined=de.output?.path;
        const output_name: string | undefined=de.output?.name;

        const pathIsDir: boolean = de.pathIsDir === true;
        const tgPath: string = path.join(opt.rootDir, de.path);
        const keyLevel: number = (() => {
            if (de.keyLevel < 0) return 0;
            else if (de.keyLevel >= opt.levelKeys.length) return opt.levelKeys.length - 1;
            else return de.keyLevel;
        })();
        const inputPath: string[] = (() => { 
            if (pathIsDir) {
                const output: string[] = [];
                const rea = fs.readdirSync(tgPath, {
                    recursive: true,
                    withFileTypes: true,
                });
                //console.log(rea)
                rea.forEach((item) => {
                    if (item.isFile()) {
                        output.push(path.join(item.parentPath,item.name));
                    }
                });
                return output;
            } else return [tgPath];
        })();
        
        inputPath.forEach(iptPath => {
            console.log('----------------------------------------');
            console.log(`处理文件：${iptPath}`);
            const outDir: string = (() => {
                if (pathIsDir) {
                    const iptPathParse = path.parse(iptPath);
                    const rel = path.relative(tgPath, iptPathParse.dir);
                    return output_path !== undefined
                        ? path.join(outputDir, output_path, rel)
                        : path.join(outputDir, rel);
                }else return output_path !== undefined
                    ? path.join(outputDir, output_path)
                    : outputDir;
            })  ()              ;
            checkDir(outDir);
            const outPath: string = (() => {
                if (pathIsDir) {
                    const iptPathParse = path.parse(iptPath);
                    return path.join(
                        outDir,
                        `${iptPathParse.base}.enc.json`
                    )
                }else return path.join(
                    outDir,
                    `${output_name === undefined ? path.basename(tgPath) : output_name}.enc.json`,
                );
            })();

            let hash: string | null = (() => {
                if (fs.existsSync(outPath)) {
                    const haveFile = JSON.parse(
                        fs.readFileSync(outPath, "utf8"),
                    ) as EncFile;
                    if (log)
                        console.log(
                            `输出文件已存在：${outPath}；哈希值：${haveFile.hash}`,
                        );
                    return haveFile.hash;
                } else return null;
            })();

            const sourceContent: Uint8Array = fs.readFileSync(iptPath, null);
            const sourceHash: string = getHash(
                convUint8ArrayToString(sourceContent),
            );
            if (hash != sourceHash) {
                hash = sourceHash;

                const key: string = (() => {
                    let k: string = "";
                    for (let i = 0; i <= keyLevel; i++) {
                        k += opt.levelKeys[i];
                    }
                    return k;
                })();
                const encContent = encryptUint8ArrayToString(
                    sourceContent,
                    key,
                );

                fs.writeFileSync(
                    outPath,
                    JSON.stringify({
                        encContent: encContent,
                        hash: hash,
                        level: de.keyLevel,
                    } as EncFile),
                );

                if (log)
                    console.log(
                        `执行文件加密：${iptPath} ==> ${outPath}；哈希值：${hash}`,
                    );
            } else {
                if (log) console.log(`哈希值一致，跳过。哈希值：${hash}`);
            }
        });
    });

    {
        const dataFP: string = path.join(outputDir, 'data.json');
        const lke: string[] = (() => { 
            const ot: string[] = [];
            for (let i = 0; i < opt.levelKeys.length - 1; i++){
                ot.push(encryptStringToString(opt.levelKeys[i], opt.levelKeys[i + 1]));
            }
            return ot;
        })();
        const lkh: string[] = (() => {
            const ot: string[] = [];
            for (let i = 0; i < opt.levelKeys.length; i++){
                ot.push(getHash(opt.levelKeys[i]));
            }
            return ot;
        })();
        fs.writeFileSync(
            dataFP,
            JSON.stringify({
                levelKeyEnc: lke,
                levelKeyHash: lkh,
            } as DataFile),
        );
        if (log) console.log(`数据文件写入：${dataFP}`);
    }
}
