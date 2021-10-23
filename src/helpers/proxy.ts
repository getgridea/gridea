import { remote } from 'electron'

export const getCurrentProxy = async (platform: string) => {
  const { session } = remote.getCurrentWindow().webContents
  const url = ({
    github: 'https://api.github.com',
    netlify: 'https://api.netlify.com',
  } as any)[platform] || ''

  if (!url) {
    return null
  }

  const proxyInfo = await session.resolveProxy(url)

  if (proxyInfo !== 'DIRECT') {
    const proxyurlComponents = proxyInfo.split(':')
    const proxyHost = proxyurlComponents[0].split(' ')[1]
    const proxyPort = parseInt(proxyurlComponents[1], 10)
    console.log('use proxy', proxyHost, proxyPort)
    
    return { host: proxyHost, port: proxyPort }
  }

  return null
}
