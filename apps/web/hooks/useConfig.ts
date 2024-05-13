import  {setting} from "@pagenote/shared/lib/extApi";
import extApi from "@pagenote/shared/lib/pagenote-api";
import useSWR from "swr";
import ISearchEngine = setting.ISearchEngine;


type IConfig = {
    searchEngines?: ISearchEngine[]
} | undefined
export default function useConfig(): IConfig{
    const {data} = useSWR<IConfig>('/config',fetchLocalAndServerSetting)

    function fetchLocalAndServerSetting (){
        // @ts-ignore
        return extApi.setting.getSearchEngines().then((result)=>{
            return {
                ...data,
                // @ts-ignore
                searchEngines: result.data
            };
        })
    }

    return data
}
