import markdown from '../server/plugins/markdown'

/**
 * Add single-quoted to string type field, in order to be compatible with many special characters
 * eg. true, false, 1, [, ], {, }, ,, #, <, >, @,
 */
export function formatYamlString(string: any) {
  return string.replace(/'/g, '\'\'')
}


export const formatThemeCustomConfigToRender = (config: any, currentThemeConfig: any) => {
  for (const configItem of currentThemeConfig) {
    const configValue = config[configItem.name]
    if (configItem.type === 'markdown') {
      if (!configValue) continue

      config[configItem.name] = markdown.render(configValue)
    } else if (configItem.type === 'array' && configValue) {
      for (let arrItemIndex = 0; arrItemIndex < configValue.length; arrItemIndex += 1) {
        const foundConfigItem = currentThemeConfig.find((i: any) => i.name === configItem.name)
        const arrayItemKeys = Object.keys(configValue[arrItemIndex])

        for (let keyIndex = 0; keyIndex < arrayItemKeys.length; keyIndex += 1) {
          const key = arrayItemKeys[keyIndex]
          const foundMarkdownField = foundConfigItem.arrayItems.find((i: any) => i.name === key && i.type === 'markdown')

          if (foundMarkdownField) {
            const fieldValue = configValue[arrItemIndex][key]
            if (!fieldValue) continue

            configValue[arrItemIndex][key] = markdown.render(fieldValue)
          }
        }
      }
    }
  }

  return config
}
