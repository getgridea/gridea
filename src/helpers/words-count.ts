import striptags from 'striptags'

const CN_PATTERN = /[\u4E00-\u9FA5]/g
const EN_PATTERN = /[a-zA-Z0-9_\u0392-\u03c9\u0400-\u04FF]+|[\u4E00-\u9FFF\u3400-\u4dbf\uf900-\ufaff\u3040-\u309f\uac00-\ud7af\u0400-\u04FF]+|[\u00E4\u00C4\u00E5\u00C5\u00F6\u00D6]+|\w+/g

function countContent(content: any): [number, number] {
  if (typeof content !== 'string') {
    throw new Error('[word-counter] content must be string type')
  }
  let cn = 0
  let en = 0
  if (content.length > 0) {
    content = striptags(content)
    cn = (content.match(CN_PATTERN) || []).length
    en = (content.replace(CN_PATTERN, '').match(EN_PATTERN) || []).length
  }
  return [cn, en]
}

export function wordCount(content?: any, transformFn?: (count: number) => any): any {
  const [cn, en] = countContent(content)
  const count = cn + en
  if (typeof transformFn === 'function') {
    return transformFn(count)
  }
  return count
}

interface TimeConfig {
  cn?: number
  en?: number
}

export function timeCalc(content?: any, { cn = 300, en = 160 }: TimeConfig = {}): {
  minius: number,
  second: number,
} {
  const [cnCount, enCount] = countContent(content)
  const minius = cnCount / cn + enCount / en

  return {
    minius: minius === 0 ? 0 : Math.ceil(minius),
    second: Math.floor(minius * 60),
  }
}
