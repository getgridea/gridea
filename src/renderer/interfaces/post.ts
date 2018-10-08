export interface IPostData {
  title: string
  date: string
  published: boolean
  tags: string,
}

export interface IPost {
  content: string

  data: IPostData

  fileName: string
}
