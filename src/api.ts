import * as https from 'https';

const request = async (url:string):Promise<string> =>{
    return new Promise((resolve,reject)=>{
        https.get(url,(res)=>{
            let chunks = '';

            if(!res || res.statusCode !==200){
                return reject(new Error('网络请求错误！'));
            }

            res.on('data',(chunk)=>chunks+=chunk.toString('utf8'))
            res.on('end',()=>resolve(chunks));
        })
    })
}

export interface FundInfo {
    now:string;
    name:string;
    code: string;
    lastClose:string;
    changeRate:string;
    changeAmount:string;
}

export default function fundApi(codes:string[]):Promise<FundInfo[]>{
    const time = Date.now();

    const promises: Promise<string>[] = codes.map((code)=>{
        const url = `https://fundgz.1234567.com.cn/js/${code}.js?rt=${time}`;
        return request(url)
    })

    return Promise.all(promises).then((results)=>{
        const resultArr:FundInfo[] = [];

        results.forEach((rsp:string)=>{
            const match = rsp.match(/jsonpgz\((.+)\)/);

            if(!match || !match[1]){
                return;
            }

            const str = match[1];

            const obj = JSON.parse(str);
            const info:FundInfo = {
                now:obj.gsz,
                name:obj.name,
                code:obj.fundcode,
                lastClose:obj.dwjz,
                changeRate:obj.gszzl,
                changeAmount:(obj.gsz-obj.dwjz).toFixed(4)
            }
            resultArr.push(info);
        });
        return resultArr;
    })
}