export interface ISetting {
  domain: string
  repository: string
  branch: string
  username: string
  email: string
  token: string
  cname: string
}

export interface IGitalkSetting {
  showComment: boolean
  clientId: string
  clientSecret: string
  repository: string
  owner: string
}
