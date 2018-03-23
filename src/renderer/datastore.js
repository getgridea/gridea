import path from 'path'
import { remote } from 'electron'
import fse from 'fs-extra'
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const blogPath = path.join(remote.app.getPath('documents'), 'hve-blog')

// Check if the hve-blog folder exists, if it does not exist, it is initialized
if (!fse.pathExistsSync(blogPath)) {
  fse.ensureDirSync(blogPath)
  fse.copySync(`${__static}/blog`, blogPath)
}

// db.json
const db = low(new FileSync(path.join(blogPath, 'db/db.json')))
db._.mixin({ desc: array => array.reverse() })
db._.mixin({ removeAll: array => (array = []) })

// site.json
const site = low(new FileSync(path.join(blogPath, 'db/site.json')))

export { db, site }
