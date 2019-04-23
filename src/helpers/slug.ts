/* tslint:disable */
const { transliterate } = require('transliteration')
const slug = require('slug')

/*
 * Custom mode of rfc3986 without unicode symbols
 */
slug.defaults.modes['rfc3986-non-unicode'] = {
  replacement: '-', // replace spaces with replacement
  symbols: false, // replace unicode symbols or not
  remove: /[.]/g, // (optional) regex to remove characters
  lower: true, // result in lower case
  charmap: slug.charmap, // replace special characters
  multicharmap: slug.multicharmap, // replace multi-characters
}

slug.defaults.modes['rfc3986-non-unicode-with-dots'] = {
  replacement: '-', // replace spaces with replacement
  symbols: false, // replace unicode symbols or not
  lower: true, // result in lower case
  charmap: slug.charmap, // replace special characters
  multicharmap: slug.multicharmap, // replace multi-characters
}

slug.defaults.modes['rfc3986-non-unicode-with-dots-no-lower'] = {
  replacement: '-', // replace spaces with replacement
  symbols: false, // replace unicode symbols or not
  lower: false, // result in lower case
  charmap: slug.charmap, // replace special characters
  multicharmap: slug.multicharmap, // replace multi-characters
}

slug.defaults.mode = 'rfc3986-non-unicode'

/**
 * Slugify 文本
 * @param textToSlugify 待 slugify 的文本
 * @param filenameMode
 * @param saveLowerChars
 */
function createSlug(textToSlugify: any, filenameMode = false, saveLowerChars = false) {
  textToSlugify = transliterate(textToSlugify)

  if (!filenameMode) {
    if (saveLowerChars) {
      slug.defaults.mode = 'rfc3986-non-unicode-with-dots-no-lower'
    }

    textToSlugify = slug(textToSlugify)
    slug.defaults.mode = 'rfc3986-non-unicode'
  } else {
    slug.defaults.mode = 'rfc3986-non-unicode-with-dots'
    textToSlugify = slug(textToSlugify)
    slug.defaults.mode = 'rfc3986-non-unicode'
  }

  return textToSlugify
}

export default createSlug
