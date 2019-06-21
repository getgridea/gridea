import qiniu, { form_up as formUp } from 'qiniu'
import * as glob from 'glob'
import * as mime from 'mime'
import * as path from 'path'

import { ICdnSetting } from '../interfaces/setting'

const upload = async (config: ICdnSetting, localPath: string) => {
  interface IQiniuUploadConfig {
    uploadToken: string
    formUploader: formUp.FormUploader
  }

  const getQiniuUploadConfig: () => IQiniuUploadConfig = () => {
    const mac = new qiniu.auth.digest.Mac(config.accessKey, config.secretKey)
    const cf = new qiniu.conf.Config()

    return {
      uploadToken: new qiniu.rs.PutPolicy({ scope: config.bucket }).uploadToken(mac),
      formUploader: new qiniu.form_up.FormUploader(cf),
    }
  }


  const getFileName = (basePath: string, filePath: string) => {
    if (filePath.indexOf(basePath) > -1) {
      const key = filePath.split(basePath)[1]
      return key.startsWith('/') ? key.substring(1) : key
    }
    return filePath
  }

  const uploadFile = async (localFile: string, qiniuUploadConfig: IQiniuUploadConfig) => {
    const fileName = getFileName(localPath, localFile)
    const extname = path.extname(localFile)
    const mimeName = mime.getType(extname) || undefined
    const putExtra = new qiniu.form_up.PutExtra(fileName, null, mimeName)
    const { formUploader, uploadToken } = qiniuUploadConfig
    return new Promise((resolve, reject) => {
      formUploader.putFile(uploadToken, fileName, localFile, putExtra, (
        respErr,
        respBody,
        respInfo,
      ) => {
        if (respErr) {
          reject(respErr)
        }
        resolve({ respBody, respInfo })
      })
    })
  }

  const files = glob.sync(`${path.join(localPath, '/*/*.?(js|css|map|png|jpg|svg|woff|woff2|ttf|eot)')}`)
  const qiniuUploadConfig: IQiniuUploadConfig = getQiniuUploadConfig()
  return Promise.all(files.map((file: string) => {
    return uploadFile(file, qiniuUploadConfig)
  }))
}


export default upload
