import GA from 'electron-google-analytics'
import * as pkg from '../../package.json'

const { version } = (pkg as any)
const hostname = 'http://client.gridea.dev'

export class Analytics {
  private readonly ga: any

  private readonly clientId: any

  constructor(clientId: string) {
    this.ga = new GA('UA-113307620-4', { debug: false })
    this.clientId = clientId
  }

  public pageView(url: string, title?: string, clientId?: string) {
    this.ga.pageview(hostname, url, title, undefined, clientId).then((res: any) => {
      console.log(res)
    }).catch((e: any) => {
      console.log(e)
    })
  }
  

  public startup() {
    this.ga.event(`app-${version}`, 'startup', { clientId: this.clientId })
  }
}
