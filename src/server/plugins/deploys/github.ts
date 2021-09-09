import { Octokit } from '@octokit/rest'
import list from 'ls-all'
import fs from 'fs-extra'
import moment from 'moment'
import path from 'path'
import crypto from 'crypto'
import normalizePath from 'normalize-path'
import Model from '../../model'

export default class GitHubDeploy extends Model {
  private octokit: Octokit

  private uploadedBlobs: any

  private filesToUpdate: number

  private filesUpdated: number

  constructor(appInstance: any) {
    super(appInstance)

    this.octokit = new Octokit({
      auth: appInstance.db.setting.token,
    })

    this.uploadedBlobs = {}

    this.filesToUpdate = 0
    this.filesUpdated = 0
  }

  async remoteDetect() {
    const result = {
      success: true,
      message: '',
    }

    try {
      const { setting } = this.db

      const res = await this.octokit.rest.git.getRef({
        owner: setting.username,
        repo: setting.repository,
        ref: `heads/${setting.branch}`,
      })
  
      if (res.status === 200) {
        result.message = '[Server] remote detect success'

        return result
      }

      result.success = false
      result.message = '[Server] remote detect failed'

      return result
    } catch (e) {
      result.success = false
      result.message = `[Server] remote detect failed: ${e.message}`

      return result
    }
  }

  async publish() {
    const result = {
      success: true,
      message: '同步成功',
      data: null,
    }

    try {
      const commitSHA = await this.getLatestSHA()
      const treeSHA = await this.getTreeSHA(commitSHA)
      const remoteTree = await this.getTreeData(treeSHA)
      const trees = await this.listFolderFiles(remoteTree)
      let finalTree = await this.getNewTreeBasedOnDiffs(trees.remoteTree, trees.localTree)
      finalTree = await this.createBlobs(finalTree, false)
      finalTree = await this.updateBlobsList(finalTree)
      let sha = await this.createTree(finalTree)
      sha = await this.createCommit(sha, commitSHA)
      const res = await this.createReference(sha)

      console.log('✅ published!', res)
      return result
    } catch (e) {
      result.success = false
      result.message = `[Server] 同步失败： ${e.message}`

      return result
    }
  }

  async getLatestSHA() {
    const { setting } = this.db

    const res = await this.octokit.rest.git.getRef({
      owner: setting.username,
      repo: setting.repository,
      ref: `heads/${setting.branch}`,
    })

    if (res.data && res.data.object) {
      return res.data.object.sha
    }

    return null
  }

  async getTreeSHA(commitSHA: string | null) {
    if (!commitSHA) return null

    const { setting } = this.db

    const res = await this.octokit.rest.git.getCommit({
      owner: setting.username,
      repo: setting.repository,
      commit_sha: commitSHA,
    })

    if (res.data && res.data.tree) {
      return res.data.tree.sha
    }

    return null
  }

  async getTreeData(treeSHA: string | null) {
    if (!treeSHA) return null

    const { setting } = this.db

    const res = await this.octokit.rest.git.getTree({
      owner: setting.username,
      repo: setting.repository,
      tree_sha: treeSHA,
    })

    if (res.data && res.data.tree) {
      return res.data.tree
    }
    
    return null
  }

  async listFolderFiles(remoteTree: any) {
    const outputDir = `${this.appDir}/output`

    return list([outputDir], {
      recurse: true,
      flatten: true,
    }).then((files: any) => {
      const localTree = files
        .filter((file: any) => !file.mode.dir)
        .filter((file: any) => !file.path.includes('.git'))
        .map((file: any) => {
          let calculatedHash = ''
          let fileSize = fs.statSync(file.path).size

          if (!this.isBinaryFile(file.path)) {
            const fileContent = fs.readFileSync(file.path)
            fileSize = fileContent.length
            calculatedHash = crypto.createHash('sha1')
              .update(`blob ${fileSize}\0${fileContent}`)
              .digest('hex')
          }

          return {
            fullPath: normalizePath(file.path),
            path: normalizePath(path.relative(outputDir, file.path)),
            mode: file.mode.exec ? '100755' : '100644',
            type: 'blob',
            size: fileSize,
            sha: calculatedHash,
            encoding: 'base64',
            getBlob: false,
          }
        })
        .filter((file: any) => this.isNecessaryFile(file.path))
      return {
        localTree: localTree,
        remoteTree: remoteTree,
      }
    })
  }

  async getNewTreeBasedOnDiffs(remoteTree: any, localTree: any) {
    this.filesToUpdate = 0
    this.filesUpdated = 0

    for (const localFile of localTree) {
      const remoteFile = this.findRemoteFile(localFile.path, remoteTree)

      if (remoteFile === false) {
        localFile.getBlob = true
        this.filesToUpdate += 1
        continue
      }

      if (localFile.sha === false) {
        if (remoteFile.size !== localFile.size) {
          localFile.getBlob = true
          this.filesToUpdate += 1
          continue
        }

        localFile.sha = remoteFile.sha
        continue
      }

      if (localFile.sha !== remoteFile.sha) {
        localFile.getBlob = true
        this.filesToUpdate += 1
        continue
      }
    }

    return localTree
  }

  async createBlobs(files: any, reuploadSession = false) {
    const result = await this.getAPIRateLimit()
  
    if (result.remaining < this.filesToUpdate + 10) {
      throw Error(`Your GitHub API request limit were exceed (${parseInt(`${result.remaining}`, 10)} requests left). Please wait till (${moment(parseInt(`${result.reset * 1000}`, 10)).format('MMMM Do YYYY, h:mm:ss a')} UTC) and then try again.`)
    }

    const filesToUpdate = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      if (file.getBlob) {
        filesToUpdate.push(i)
      }
    }

    const parallelOperations = 20

    for (let i = 0; i < filesToUpdate.length; i += parallelOperations) {
      const requests = []

      for (let j = 0; j < parallelOperations; j++) {
        const index = filesToUpdate[i + j]

        if (typeof index === 'number') {
          let file = files[index]
          requests.push(this.createBlob(file.fullPath).then((sha: any) => {
            file = Object.assign({}, file, {
              sha: sha,
              getBlob: false,
            })
          }))
        }
      }

      // eslint-disable-next-line no-await-in-loop
      await Promise.all(requests)
    }

    return files
  }

  async createBlob(filePath: string) {
    const fileContent = fs.readFileSync(filePath, { encoding: 'base64' })
    console.log(`[${new Date().toUTCString()}] CREATE BLOB: ${filePath}`)

    const { setting } = this.db

    const res = await this.octokit.git.createBlob({
      owner: setting.username,
      repo: setting.repository,
      encoding: 'base64',
      content: fileContent,
    })

    if (res.data) {
      this.uploadedBlobs[filePath] = res.data.sha
      console.log(`[${new Date().toUTCString()}] CREATED BLOB: ${filePath} - ${res.data.sha}`)

      this.filesUpdated += 1

      return res.data.sha
    }
  }

  updateBlobsList(files: any) {
    let counterOfFilesToUpload = 0
    const output = files.map((file: any) => {
      if (this.uploadedBlobs[file.fullPath]) {
        file.sha = this.uploadedBlobs[file.fullPath]
        file.getBlob = false
      }

      if (file.getBlob) {
        counterOfFilesToUpload++
      }

      return file
    })

    return output
  }

  async createTree(tree: any) {
    if (!tree || !tree.length) {
      return []
    }

    const { setting } = this.db

    const res = await this.octokit.git.createTree({
      owner: setting.username,
      repo: setting.repository,
      tree,
    })

    return res.data.sha
  }

  async createCommit(tree: any, parentSHA: any) {
    if (!tree.length) {
      return ''
    }

    const { setting } = this.db

    const res = await this.octokit.git.createCommit({
      owner: setting.username,
      repo: setting.repository,
      message: `update from gridea: ${moment().format('YYYY-MM-DD HH:mm:ss')}`,
      tree,
      parents: [parentSHA],
    })

    return res.data.sha
  }

  async createReference(sha: string) {
    if (sha === '') {
      return false
    }

    const { setting } = this.db

    const res = await this.octokit.git.updateRef({
      owner: setting.username,
      repo: setting.repository,
      sha,
      ref: `heads/${setting.branch}`,
    })

    return res
  }

  async getAPIRateLimit() {
    const res = await this.octokit.rest.rateLimit.get()
    return res.data.resources.core
  }

  isBinaryFile(fullPath: string) {
    const extension = path.parse(fullPath).ext
    const nonBinaryExtensions = [
      '.html',
      '.htm',
      '.xml',
      '.json',
      '.css',
      '.js',
      '.map',
      '.svg',
    ]

    if (nonBinaryExtensions.indexOf(extension) > -1) {
      return false
    }

    return true
  }

  isNecessaryFile(filePath: string) {
    const filename = path.parse(filePath).base
    const unnecessaryFiles = [
      '.DS_Store',
      'thumbs.db',
      '.git',
    ]

    if (unnecessaryFiles.indexOf(filename) > -1) {
      return false
    }

    return true
  }

  findRemoteFile(filePath: string, remoteTree: any) {
    for (const remoteFile of remoteTree) {
      if (remoteFile.path === filePath) {
        return remoteFile
      }
    }

    return false
  }
}
