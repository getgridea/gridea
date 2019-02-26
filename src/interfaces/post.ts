export interface IPostData {
  title: string
  date: string
  published: boolean
  hideInList: boolean
  tags?: [],
  feature: string,
}

export interface IPost {
  content: string

  data: IPostData

  fileName: string
}
