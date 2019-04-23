/**
 * Add single-quoted to string type field, in order to be compatible with many special characters
 * eg. true, false, 1, [, ], {, }, ,, #, <, >, @,
 */
export function formatYamlString(string: any) {
  return string.replace(/'/g, '\'\'')
}
