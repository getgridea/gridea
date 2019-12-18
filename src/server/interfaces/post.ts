import { ITag } from './tag'

export interface IPost {
  title: string
  fileName: string
  tags: string[]
  date: string
  content: string
  published: boolean
  hideInList: boolean
  isTop: boolean
  featureImage: {
    name?: string,
    path?: string,
    type?: string,
  }
  /** 外链封面图 */
  featureImagePath: string
  deleteFileName?: string
}

export interface IPostData {
  title: string
  date: string
  published: boolean
  hideInList: boolean
  isTop: boolean
  tags?: []
  feature: string
}

export interface IPostDb {
  content: string

  abstract: string,

  data: IPostData

  fileName: string
}

export interface ITagRenderData extends ITag {
  link: string
}

export interface ISiteTagsData extends ITagRenderData {
  count: number
}

export interface IStats {
  text: string
  minutes: number
  time: number
  words: number
}

export interface IPostRenderData {
  content: string
  fileName: string
  abstract: string
  title: string
  tags: ITagRenderData[]
  date: string
  dateFormat: string
  feature: string
  link: string
  hideInList: boolean
  isTop: boolean
  toc?: any
  stats: IStats
  nextPost?: IPostRenderData
  prevPost?: IPostRenderData
  description: string
}
