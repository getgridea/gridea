export interface ISetting {
  platform: 'github' | 'coding' | 'sftp'
  domain: string
  repository: string
  branch: string
  username: string
  email: string
  tokenUsername: string
  token: string
  cname: string
  port: string
  server: string
  password: string
  privateKey: string
  remotePath: string
  [index: string]: string
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

export interface ICommentSetting {
  commentPlatform: string
  showComment: boolean
  disqusSetting: IDisqusSetting
  gitalkSetting: IGitalkSetting
}
