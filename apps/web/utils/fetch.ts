import extApi from '@pagenote/shared/lib/pagenote-api'
import { network } from '@pagenote/shared/lib/extApi'
import FetchRequest = network.FetchRequest
import {
  BaseMessageHeader,
  RESPONSE_STATUS_CODE,
} from '@pagenote/bridge'

let byExtFlag: boolean | null = null

async function checkExtAlive() {
  // @ts-ignore
  const result = await extApi.user.getWhoAmI()
  // @ts-ignore
  byExtFlag = !!result?.data?.version
}

export async function unionFetch<T>(
  request: FetchRequest,
  header?: Partial<BaseMessageHeader>,
  retry?: boolean
): Promise<{
  success?: boolean
  data?: T
  status?: number
  errors?: { message: string }[]
  error?: string
}> {
  if (byExtFlag === null) {
    await checkExtAlive()
  }
  if (byExtFlag) {
    return extApi.network.pagenote(request, header).then(function (res) {
      // 代理超时，重新请求
      // @ts-ignore
      if (res?.status === RESPONSE_STATUS_CODE.TIMEOUT) {
        checkExtAlive()
        if (!retry && request.method !== 'POST') {
          console.log('timeout retry')
          return unionFetch(request, header, true)
        }
      }
      // @ts-ignore
      return res?.data?.json
    })
  } else {
    request.url = /^http/.test(request.url)
      ? request.url
      : process.env.API_HOST + request.url
    if (request.method === 'POST') {
      request.body = JSON.stringify(request.data)
    } else {
      const search = new URLSearchParams(request.data)
      request.url += '?' + search.toString()
    }

    return fetch(request.url, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...request,
    }).then(async function (res) {
      checkExtAlive()
      return await res.json()
    })
  }
}
