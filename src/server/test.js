const generateOverride = (path) => {
  const func = require(path)
  return func
}

module.exports = generateOverride
