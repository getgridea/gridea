export interface ISetting {
  platform?: string,
  domain: string
  repository: string
  branch: string
  username: string
  email: string
  token: string
  cname: string
}

export interface IDisqusSetting {
  api: string
  apikey: string
  shortname: string
}

export interface IGitalkSetting {
  clientId: string
  clientSecret: string
  repository: string
  owner: string
}

export interface IValineSetting {
  appId: string,
  appKey: string
  placeholder: string
  notify: boolean
  verify: boolean
  avatar: '' | 'mp' | 'identicon' | 'monsterid' | 'wavatar' | 'retro' | 'robohash' | 'hide'
  pageSize: number
  visitor: boolean
  highlight: boolean
  recordIP: boolean
}

export interface ICommentSetting {
  commentPlatform: string
  showComment: boolean
  disqusSetting: IDisqusSetting
  gitalkSetting: IGitalkSetting
  valineSetting: IValineSetting
}
