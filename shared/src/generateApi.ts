import {
    lightpage,
    boxroom,
    setting,
    browserAction,
    action,
    localdir,
    fileDB,
    user
} from "./extApi";
import SessionStorageBridge from "./communication/sessionStorageBridge";
import Message2 from "./communication/ExtenstionBridge";


const notSupportYet = function () {
    return Promise.resolve({
        success: false,
        error: 'not allowed',
        data: undefined
    })
}

let bridge:any;
const TIMEOUT = 8000;
export const defaultWrapper = function (method:string,targetId:string,clientId: string='page_api_client') {
    return function (request:any) {
        // bridge 运行时初始化，
        if(!bridge){
            // 优先使用 extension runtime message
            if(chrome && chrome.runtime){
                bridge = new Message2(clientId,{
                    asServer: true,
                    isBackground: false,
                    timeout: TIMEOUT,
                    targetClientId: targetId,
                })
            }else{
                bridge = new SessionStorageBridge(clientId,{
                    asServer: true,
                    listenKey: "pagenote-message",
                    timeout: TIMEOUT,
                    targetClientId: targetId,
                })
            }
        }

        return bridge.requestMessage(method,request)
    }
};

export const generateApi = function (wrapperFun=defaultWrapper) {

    const lightpageApi: lightpage.request = {
        exportPages: wrapperFun('exportPages',lightpage.id),
        importPages: wrapperFun('importPages',lightpage.id),
        removeLightPages: wrapperFun('removeLightPages',lightpage.id),
        getLightPageDetail: wrapperFun('getLightPageDetail',lightpage.id),
        getLightPages: wrapperFun('getLightPages',lightpage.id),
        groupPages: wrapperFun('groupPages',lightpage.id),
        removeLightPage: wrapperFun('removeLightPage',lightpage.id),
        saveLightPage: wrapperFun('saveLightPage',lightpage.id),
    }

    const boxroomApi: boxroom.request = {
        update: wrapperFun('update',setting.id),
        get:wrapperFun('get',setting.id),
        remove:wrapperFun('remove',setting.id),
        save:wrapperFun('save',setting.id),
    }

    const settingApi: setting.request = {
        getSetting: wrapperFun('getSetting',setting.id),
        getUserSetting: wrapperFun('getUserSetting',setting.id),
        resetSetting: wrapperFun('resetSetting',setting.id),
        saveSetting: wrapperFun('saveSetting',setting.id),
        syncSetting: wrapperFun('syncSetting',setting.id),
    }

    const browserActionApi: browserAction.request ={
        setBrowserActionClick: notSupportYet,
        setBrowserActionDisplay: wrapperFun('setBrowserActionDisplay',action.id),
        getBrowserActionInfo: wrapperFun('getBrowserActionInfo',action.id),
    }

    const actionApi: action.request = {
        report: wrapperFun('report',action.id),
        getMemoryRuntime: wrapperFun('getMemoryRuntime',action.id),
        setMemoryRuntime: wrapperFun('setMemoryRuntime',action.id),
        usage: wrapperFun('usage',action.id),
        injectToFrontPage: wrapperFun('injectToFrontPage',action.id),
        copyToClipboard: wrapperFun('copyToClipboard',action.id),
        captureView: wrapperFun('captureView',action.id),
        axios: wrapperFun('axios',action.id),
        injectCodeToPage: wrapperFun('injectCodeToPage',action.id),
        track: wrapperFun('track',action.id)
    }

    const fileSystemApi: localdir.request = {
        readPagesFrontDir: wrapperFun('readPagesFrontDir',localdir.id),
        requestPermission: wrapperFun('requestPermission',localdir.id),
    }

    const fileDBApi: fileDB.request = {
        getFile:  wrapperFun('getFile',fileDB.id),
        removeFiles: wrapperFun('removeFiles',fileDB.id),
        getFiles: wrapperFun('getFiles',fileDB.id),
        saveFile: wrapperFun('saveFile',fileDB.id)
    }

    const userApi: user.request = {
        getUser: wrapperFun('getUser',user.id),
        getUserToken: wrapperFun('getUserToken',user.id),
        getWhoAmI: wrapperFun('getWhoAmI',user.id),
        setUserToken: wrapperFun('setUserToken',user.id),
    }

    return {
        lightpage: lightpageApi,
        boxroom: boxroomApi,
        setting: settingApi,
        browserAction: browserActionApi,
        commonAction: actionApi,
        fileSystem: fileSystemApi,
        fileDB: fileDBApi,
        user: userApi,
    }
};

const api = generateApi();

export default api
