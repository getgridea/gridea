const fse = require('fs-extra')

class PostImages {
  async getImages(imagesPath) {
    const images = await fse.readdir(imagesPath)
    console.log(images)
    return images
  }
}

export default PostImages
