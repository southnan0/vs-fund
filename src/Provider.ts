import { TreeDataProvider, TreeItem, workspace } from "vscode";
import fundApi, { FundInfo } from "./api";
import FundItem from "./FundItem";

export default class DataProvider implements TreeDataProvider<FundInfo>{
    refresh(){

    }

    getTreeItem(info:FundInfo):TreeItem{
        return new FundItem(info);
    }

    getChildren():Promise<FundInfo[]>{
        const {order} = this;

        const favorites:string[] = workspace
        .getConfiguration()
        .get('fund.favorites',[]);

        return fundApi([...favorites]).then((results:FundInfo[])=>{
            return results.sort((prev,next)=>{
                return (prev.changeRate >= next.changeRate ? 1:-1)*order
            })
        })
    }
}