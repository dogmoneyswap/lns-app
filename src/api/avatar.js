import { ethers, getNetworkId, getNetworkProviderUrl } from '@bchdomains/ui'

export default function validateTokenURI(value, addr) {
  const details = value.split('/')
  // basic validity checks
  if (value.split('/').length !== 3) return false
  if (details[0]?.indexOf('eip155') !== 0) return false
  if (!parseInt(details[0]?.split(':')[1])) return false
  if (!details[2]) return false

  const [schema, contractAddress] = details[1].split(':')

  // check tokenId is valid
  let tokenId
  try {
    tokenId = ethers.BigNumber.from(details[2])
  } catch {
    return false
  }

  // token/contract checks
  if (schema !== 'erc721' && schema !== 'erc1155') return false

  return new Promise(async resolve => {
    try {
      const networkId = details[0]?.split(':')[1]
      const network = networkId ?? (await getNetworkId())
      const networkProvider = getNetworkProviderUrl(`${network}`)
      const provider = new ethers.providers.JsonRpcProvider(networkProvider)
      // set functions needed to check validity of ownership/NFT compatibility
      const ABI =
        schema === 'erc721'
          ? [
              'function tokenURI(uint256 tokenId) external view returns (string memory)',
              'function ownerOf(uint256 tokenId) public view returns (address)'
            ]
          : [
              'function uri(uint256 _id) public view returns (string memory)',
              'function balanceOf(address account, uint256 id) public view returns (uint256)'
            ]
      const contract = new ethers.Contract(contractAddress, ABI, provider)

      // if there is token metadata, return as valid
      if (schema === 'erc721') {
        const tokenURI = await contract.tokenURI(tokenId)
        if (tokenURI) resolve(true)
      } else {
        const uri = await contract.uri(tokenId)
        if (uri) resolve(true)
      }
      resolve(false)
    } catch (e) {
      console.warn(e)
      resolve(false)
    }
  })
}
