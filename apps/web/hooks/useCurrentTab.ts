import extApi from "@pagenote/shared/lib/pagenote-api";
import useSWR from "swr";
import Tab = chrome.tabs.Tab;

type TabGroups = Tab[];
type WindowMap = Map<number, TabGroups>
let lastTab: undefined | Tab = undefined
export default function useCurrentTab():{tab: Tab | undefined, windows: TabGroups[] | undefined} {
  const { data: tab } = useSWR<Tab | undefined>(
    `/tab/currentTab/`,
    getTabInfo
  )
  const { data: windowTabs } = useSWR<TabGroups[]>(
    `/tab/windows/`,
    getAllWindows,
    {
      fallbackData: [],
    }
  )

  async function getTabInfo() {
    let currentTabId: number|undefined;
    if(!currentTabId){
      // @ts-ignore
        const result = await extApi.user.getWhoAmI();
      // @ts-ignore;
      const tab = result.data?.sender?.tab as Tab;
      currentTabId = tab?.id;
    }

    if(!currentTabId){
      const res = await extApi.developer
          .chrome({
            type: 'query',
            namespace: 'tabs',
            args: [{ active: true, lastFocusedWindow: true }],
          });
        // @ts-ignore
      lastTab = (res.data || [])[0] || lastTab
      currentTabId = lastTab?.id;
    }

    return extApi.developer
        .chrome({
          type: 'get',
          namespace: 'tabs',
          args: [currentTabId],
        })
        .then(function (res) {
            // @ts-ignore
          return res.data as Tab
        })
  }

  function getAllWindows() {
    return extApi.commonAction.queryTabs({}).then(function (res) {
      const windowMap: WindowMap = new Map<number, TabGroups>();
        // @ts-ignore
      (res.data || []).forEach(function (item: Tab) {
        const newTabs = (windowMap.get(item.windowId) || []).concat(item)
        windowMap.set(item.windowId, newTabs)
      })
      return Array.from(windowMap.values())
    })
  }

  return {
    tab: tab,
    windows: windowTabs,
  }
}
