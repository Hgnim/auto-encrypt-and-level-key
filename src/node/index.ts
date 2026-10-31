import fs from "fs";
import path from "path";
import { encryptStringToString } from "ez-encrypt";
import type { EncFile } from '../global/encFile.type';


export type BEF_Opt = {
    rootDir: string,
    outputDir: string;
    levelKeys: string[];
    doEnc: {
        filePath: string;
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

        const filePath: string = path.join(opt.rootDir, de.filePath);
        const keyLevel: number = (() => {
            if (de.keyLevel < 0) return 0;
            else if (de.keyLevel >= opt.levelKeys.length) return opt.levelKeys.length - 1;
            else return de.keyLevel;
        })();
        const outDir: string =
            output_path !== undefined
                ? path.join(outputDir, output_path)
                : outputDir;
        checkDir(outDir);
        const outPath: string = path.join(
            outDir,
            `${output_name === undefined ? path.basename(filePath) : output_name}.enc.json`,
        );

        const sourceContent:string = fs.readFileSync(filePath, "utf8");
        const key:string = (() => {
            let k: string = '';
            for (let i = 0; i <= keyLevel; i++){
                k += opt.levelKeys[i];
            }
            return k;
        })();
        const encContent = encryptStringToString(sourceContent, key);

        fs.writeFileSync(
            outPath,
            JSON.stringify({
                encContent: encContent,
            } as EncFile),
        );

        if (log) console.log(`执行文件加密：${filePath} ==> ${outPath}`);
    });
}
