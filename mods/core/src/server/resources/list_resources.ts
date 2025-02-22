import routr from '../../common/routr'
import { Kind } from '../../common/resource_encoder'
import { ListAgentsResponse } from '../protos/agents_pb'
import { ListNumbersResponse } from '../protos/numbers_pb'
import { ListProvidersResponse } from '../protos/providers_pb'
import { ListDomainsResponse } from '../protos/domains_pb'

const ResponseObj = (kind: Kind): any => {
  switch (kind) {
    case Kind.AGENT:
      return ListAgentsResponse
    case Kind.DOMAIN:
      return ListDomainsResponse
    case Kind.NUMBER:
      return ListNumbersResponse
    case Kind.GATEWAY:
      return ListProvidersResponse
  }
}

export default async function (
  kind: Kind,
  page: number,
  itemsPerPage: number,
  decoder: Function
) {
  const getSetFunc = (kind: Kind) =>
    kind === Kind.GATEWAY ? `setProvidersList` : `set${kind}sList`

  if (!page) return {}
  await routr.connect()
  const result = await routr
    .resourceType(`${kind.toLowerCase()}s`)
    .list({ page, itemsPerPage })

  const resources = []
  for (const i in result.data) resources.push(decoder(result.data[i]))
  const res = new (ResponseObj(kind))()
  res.setNextPageToken(page + 1)
  res[getSetFunc(kind)](resources)
  return res
}
