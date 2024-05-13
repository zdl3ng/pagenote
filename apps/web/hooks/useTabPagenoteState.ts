import useSWR from 'swr'
import extApi from '@pagenote/shared/lib/pagenote-api'
import { useEffect } from 'react'

function fetchStatus(tabId?: number) {
  // 当标签页无法访问时，如 chrome://newtab，会导致错误日志
  return extApi.developer
    .requestFront({
      type: 'fetchStatus',
      params: undefined,
      header: {
        targetTabId: tabId,
      },
    })
    .then(function (res) {
      // @ts-ignore
      return res.data as TabState
    })
}

type TabState = {
  connected: false
  active: false
  enabledCopy: false
  keywords?: string[]
  description?: string
  pageUrl?: string
  pageKey?: string
}
export default function useTabPagenoteState(
  tabId?: number
): [TabState | undefined, () => void, boolean] {
  const { data, mutate, isLoading } = useSWR<TabState>(
    `/tab/state/${tabId}`,
    function () {
      return fetchStatus(tabId)
    }
  )

  useEffect(() => {
    if (!data) {
      setTimeout(() => {
        mutate()
      }, 3000)
    }
  }, [data])

  return [data, mutate, isLoading]
}
