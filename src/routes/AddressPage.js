import React from 'react'
import { useMatomo } from '@datapunt/matomo-tracker-react'
import Address from '../components/Address'

const stripTrailingSlash = str => {
  return str.endsWith('/') ? str.slice(0, -1) : str
}

const AddressContainer = ({ match, location }) => {
  const { trackPageView, trackEvent } = useMatomo()
  React.useEffect(() => {
    trackPageView()
  }, [])

  const address = match.params.address.toLowerCase()
  const domainType = match.params.domainType?.toLowerCase()
  const queryParams = new URLSearchParams(location.search)
  return (
    <Address
      url={stripTrailingSlash(location.pathname)}
      address={address}
      domainType={domainType}
      showOriginBanner={queryParams.get('origin') === 'renew'}
    />
  )
}

export default AddressContainer
