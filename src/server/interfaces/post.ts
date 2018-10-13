export interface IPost {
  title: string
  fileName: string
  tags: string[]
  date: string
  content: string
  published: boolean
}

export interface IPostData {
  title: string
  date: string
  published: boolean
  tags: string
  feature: string
}

export interface IPostDb {
  content: string

  abstract: string,

  data: IPostData

  fileName: string
}
