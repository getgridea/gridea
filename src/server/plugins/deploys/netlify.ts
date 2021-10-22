import fs from 'fs'
import path from 'path'
import axios, { AxiosRequestConfig } from 'axios'
import normalizePath from 'normalize-path'
import crypto from 'crypto'
import util from 'util'
import tunnel from 'tunnel'
import Model from '../../model'

const asyncReadFile = util.promisify(fs.readFile)

export default class NetlifyApi extends Model {
  private apiUrl: string

  private accessToken: string

  private siteId: string

  private inputDir: string

  constructor(appInstance: any) {
    super(appInstance)
    this.apiUrl = 'https://api.netlify.com/api/v1/'
    this.accessToken = appInstance.db.setting.netlifyAccessToken
    this.siteId = appInstance.db.setting.netlifySiteId
    this.inputDir = path.join(appInstance.appDir, 'output')
  }

  async request(proxy: { host: string; port: number} | null, method: 'GET' | 'PUT' | 'POST', endpoint: string, data?: any) {
    const endpointUrl = this.apiUrl + endpoint.replace(':site_id', this.siteId)

    const options: AxiosRequestConfig = {
      method,
      headers: {
        'User-Agent': 'Gridea',
        'Authorization': `Bearer ${this.accessToken}`,
      },
      data,
    }

    if (proxy) {
      const agent = tunnel.httpOverHttp({
        proxy: {
          host: proxy.host,
          port: proxy.port,
        },
      })

      options.httpsAgent = agent
    }
    
    return axios(
      endpointUrl,
      options,
    )
  }

  async remoteDetect(proxy: any) {
    try {
      const res = await this.request(proxy, 'GET', 'sites/:site_id/')
      if (res.status === 200) {
        return {
          success: true,
          message: res.data,
        }
      }

      return {
        success: false,
        message: res.data,
      }
    } catch (e) {
      return {
        success: false,
        message: e,
      }
    }
  }

  async publish(proxy: any) {
    const result = {
      success: true,
      message: '同步成功',
      data: null,
    }

    try {
      const localFilesList = await this.prepareLocalFilesList()
      const deployData = await this.request(proxy, 'POST', 'sites/:site_id/deploys', localFilesList)
      const deployId = deployData.data.id
      const hashOfFilesToUpload = deployData.data.required
      const filesToUpload = this.getFilesToUpload(localFilesList, hashOfFilesToUpload)
  
      for (let i = 0; i < filesToUpload.length; i += 1) {
        const filePath = filesToUpload[i]
  
        try {
          // eslint-disable-next-line no-await-in-loop
          const res = await this.uploadFile(filePath, deployId)
          
          if (res.status === 422) {
            return Promise.reject(res)
          }
        } catch (e) {
          try {
            // eslint-disable-next-line no-await-in-loop
            const res = await this.uploadFile(filePath, deployId)
  
            if (res.status === 422) {
              return Promise.reject(res)
            }
          } catch (error) {
            return Promise.reject(error)
          }
        }
      }
  
      return result
    } catch (e) {
      result.success = false
      result.message = `[Server] 同步失败： ${e.message}`
    }
  }

  async prepareLocalFilesList() {
    const tempFileList: any = this.readDirRecursiveSync(this.inputDir)
    const fileList: any = {}

    for (const filePath of tempFileList) {
      if (fs.lstatSync(path.join(this.inputDir, filePath)).isDirectory()) {
        continue
      }

      // eslint-disable-next-line no-await-in-loop
      const fileHash = await this.getFileHash(path.join(this.inputDir, filePath))
      const fileKey = `/${filePath}`.replace(/\/\//gmi, '/')
      fileList[fileKey] = fileHash
    }

    return Promise.resolve({ files: fileList })
  }

  readDirRecursiveSync(dir: string, fileList?: any) {
    const files = fs.readdirSync(dir)
    fileList = fileList || []

    files.forEach((file) => {
      if (this.fileIsDirectory(dir, file)) {
        fileList = this.readDirRecursiveSync(path.join(dir, file), fileList)
        return
      }

      if (this.fileIsNotExcluded(file)) {
        fileList.push(this.getFilePath(dir, file))
      }
    })

    return fileList
  }

  fileIsDirectory(dir: string, file: string) {
    return fs.statSync(path.join(dir, file)).isDirectory()
  }

  fileIsNotExcluded(file: string) {
    return file.indexOf('.') !== 0 || file === '.htaccess' || file === '_redirects'
  }

  getFilePath(dir: string, file: string, includeInputDir = false) {
    if (!includeInputDir) {
      dir = dir.replace(this.inputDir, '')
    }

    return normalizePath(path.join(dir, file))
  }

  getFileHash(fileName: string) {
    return new Promise((resolve, reject) => {
      const shaSumCalculator = crypto.createHash('sha1')

      try {
        const fileStream = fs.createReadStream(fileName)
        fileStream.on('data', fileContentChunk => shaSumCalculator.update(fileContentChunk))
        fileStream.on('end', () => resolve(shaSumCalculator.digest('hex')))
      } catch (e) {
        return reject(e)
      }
    })
  }

  getFilesToUpload(filesList: any, hashesToUpload: any) {
    const filePaths = Object.keys(filesList.files)
    const filesToUpload = []
    const foundedHashes = []

    for (let i = 0; i < filePaths.length; i++) {
      const filePath = filePaths[i]
        
      if (hashesToUpload.indexOf(filesList.files[filePath]) > -1) {
        filesToUpload.push(filePath.replace(/\/\//gmi, '/'))
        foundedHashes.push(filesList.files[filePath])
      }
    }

    return filesToUpload
  }

  async uploadFile(filePath: any, deployID: any) {
    const endpointUrl = `${this.apiUrl}deploys/${deployID}/files${filePath}`
    const fullFilePath = this.getFilePath(this.inputDir, filePath, true)
    const fileContent = await asyncReadFile(fullFilePath)

    return axios(endpointUrl, {
      method: 'PUT',
      headers: {
        'User-Agent': 'Gridea',
        'Content-Type': 'application/octet-stream',
        'Authorization': `Bearer ${this.accessToken}`,
      },
      data: fileContent,
    })
  }
}
