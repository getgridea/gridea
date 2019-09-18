import GA from 'electron-google-analytics'
import macaddress from 'macaddress'
import * as pkg from '../../package.json'

interface EvOptions {
  evLabel?: any
  evValue?: any
}

const hostname = 'http://client.gridea.dev'

class Analytics {
  private readonly ga: any

  private clientId: any

  constructor() {
    this.ga = new GA('UA-113307620-4', { debug: false })
    macaddress.one((err: any, mac: string) => {
      this.clientId = mac
    })
    this.ga.set('version', (pkg as any).version)
  }

  public async pageView(url: string, title?: string) {
    try {
      const res = await this.ga.pageview(hostname, url, title, undefined, this.clientId)
      console.log(res)
    } catch (e) {
      console.error(e)
    }
  }

  public async event(evCategory: string, evAction: string, options: EvOptions) {
    try {
      const res = await this.ga.event(evCategory, evAction, {
        ...options,
        clientID: this.clientId,
      })
      console.log(res)
    } catch (e) {
      console.error(e)
    }
  }

  public async exception(exDesc: string, exFatal: any) {
    try {
      const res = await this.ga.exception(exDesc, exFatal)
      console.log(res)
    } catch (e) {
      console.error(e)
    }
  }
}

export default new Analytics()
