exports.version = 3.7
exports.description = "Sync folders from remote HFS3 server (multi-target with independent destinations)"
exports.apiRequired = 10
exports.repo = "Hug3O/Filessync-plugin"

exports.config = {
  enableSync: {
    type: 'boolean',
    defaultValue: false,
    label: 'Enable Synchronization',
    helperText: 'Master switch to enable/disable all sync operations'
  },
  syncTargets: {
    type: 'array',
    label: 'Sync Targets',
    helperText: 'Add multiple remote folders to sync',
    default: [],
    fields: {
      name: {
        type: 'string',
        label: 'Target Name',
        helperText: 'A unique name for this sync target',
        required: true
      },
      remoteAddress: {
        type: 'string',
        label: 'Remote URL',
        helperText: 'Full URL of the remote folder, e.g., http://server/hfs3/folder/',
        required: true
      },
      localDestination: {
        type: 'real_path',
        fileMask: '',
        folders: true,
        files: false,
        label: 'Local Destination',
        helperText: 'Local folder to sync to (can be different for each target)',
        defaultValue: '',
        required: true
      },
      priority: {
        type: 'number',
        label: 'Priority',
        defaultValue: 1,
        helperText: 'Lower number = higher priority (0 = highest)',
        min: 0,
        max: 10000
      },
      priorityPatterns: {
        type: 'text',
        label: 'Priority Download Patterns',
        defaultValue: '*.htm,*.html,*.js,*.css,*.ttf,*.woff',
        helperText: 'Comma-separated patterns (supports * wildcard) to download first'
      }
    }
  },
  mirrorMode: {
    type: 'boolean',
    defaultValue: false,
    label: 'Mirror Mode',
    helperText: 'ON: Delete local files not in remote (full mirror). OFF: Only add/update files (one-way backup)'
  },
  syncInterval: {
    type: 'number',
    label: 'Sync Interval (minutes)',
    defaultValue: 60,
    helperText: 'How often to sync (in minutes). 0 = disable automatic sync',
    min: 0,
    max: 43200
  },
  aria2Path: {
    type: 'real_path',
    fileMask: 'aria2c.exe',
    defaultValue: 'aria2c.exe',
    label: 'Aria2c Path',
    helperText: 'Path to aria2c executable.'
  },
  fileThreads: {
    type: 'number',
    label: 'File Threads',
    defaultValue: 3,
    helperText: 'Number of threads per file download (multi-threading for single file)',
    min: 1,
    max: 16
  },
  fileDelay: {
    type: 'number',
    label: 'Delay between files (ms)',
    defaultValue: 100,
    helperText: 'Time to wait between processing each file',
    min: 50,
    max: 10000
  },
  speedLimit: {
    type: 'number',
    label: 'Speed Limit (KB/s)',
    defaultValue: 200,
    helperText: 'Maximum transfer speed (0 = unlimited)',
    min: 0
  },
  maxRetries: {
    type: 'number',
    label: 'Max Retries',
    defaultValue: 3,
    helperText: 'Maximum number of retry attempts on network failure',
    min: 1,
    max: 20
  },
  retryDelay: {
    type: 'number',
    label: 'Retry Delay (seconds)',
    defaultValue: 5,
    helperText: 'Delay between retry attempts',
    min: 1,
    max: 300
  },
  overwrite: {
    type: 'boolean',
    defaultValue: false,
    label: 'Overwrite Files',
    helperText: 'Overwrite existing local files. If disabled, skip files that already exist with same size.'
  },
  excludeFiles: {
    type: 'text',
    label: 'Exclude Extensions',
    defaultValue: 'tmp,log,bak,swp,cache,part',
    helperText: 'Comma-separated blacklist of file extensions to skip.'
  },
  excludeFolders: {
    type: 'text',
    label: 'Exclude Folders',
    defaultValue: 'cache,temp,node_modules,.git,.svn,__pycache__',
    helperText: 'Comma-separated list of folder names to exclude from sync.'
  },
  quickScanThreshold: {
    type: 'number',
    label: 'Quick Scan Threshold (minutes)',
    defaultValue: 5,
    helperText: 'If folder mtime is within this range, perform deep scan. Otherwise quick check.',
    min: 1,
    max: 60
  },
  checkpointInterval: {
    type: 'number',
    label: 'Checkpoint Interval (seconds)',
    defaultValue: 10,
    helperText: 'How often to save sync progress (prevents data loss on restart)',
    min: 5,
    max: 300
  },
  debug: {
    type: 'boolean',
    defaultValue: true,
    label: 'Debug Mode',
    helperText: 'Show sync summary'
  },
  verboseDebug: {
    type: 'boolean',
    defaultValue: false,
    label: 'Verbose Debug',
    helperText: 'Show downloaded files (one line per file)',
    when: config => config.debug === true
  },
  traceDebug: {
    type: 'boolean',
    defaultValue: false,
    label: 'Trace Debug',
    helperText: 'Show API requests and skipped files (very verbose)',
    when: config => config.verboseDebug === true
  }
}

exports.init = api => {
  const { exec } = require('child_process')
  const path = require('path')
  const fs = require('fs')
  const { promisify } = require('util')
  const execAsync = promisify(exec)

  // 同步狀態存儲
  let lastSyncTime = 0
  let syncTimer = null
  let isSyncing = false
  let syncStartTime = 0
  let currentInterval = api.getConfig('syncInterval')

  // 文件名定義
  const getManifestFileName = (targetName) => `sync.${targetName}.manifest.json`
  const getFailedQueueFileName = (targetName) => `sync.${targetName}.failed.json`
  const getSyncStateFileName = (targetName) => `sync.${targetName}.state.json`
  const getGlobalStateFileName = () => `sync.global.state.json`

  // ==================== 全局狀態管理 ====================

  const getGlobalStatePath = (targetRoot) => {
    return path.join(targetRoot, getGlobalStateFileName())
  }

  const loadGlobalState = (targetRoot) => {
    try {
      const statePath = getGlobalStatePath(targetRoot)
      if (fs.existsSync(statePath)) {
        return JSON.parse(fs.readFileSync(statePath, 'utf8'))
      }
    } catch (error) {
      // ignore
    }
    return {
      lastScanTime: {},
      completedTargets: {},
      targetProgress: {},
      version: '3.7'
    }
  }

  const saveGlobalState = (targetRoot, state) => {
    try {
      const statePath = getGlobalStatePath(targetRoot)
      state.lastUpdated = new Date().toISOString()
      state.version = '3.7'
      fs.writeFileSync(statePath, JSON.stringify(state, null, 2))
    } catch (error) {
      api.log(`[error] Failed to save global state: ${error.message}`)
    }
  }

  // ==================== Manifest 管理 ====================

  const getManifestPath = (dirPath, targetName) => {
    return path.join(dirPath, getManifestFileName(targetName))
  }

  const initDirectoryManifest = (dirPath, targetName, remotePath) => {
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true })
      }
      
      const manifestPath = getManifestPath(dirPath, targetName)
      
      const manifest = {
        version: '3.7',
        targetName: targetName,
        remotePath: remotePath,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        lastScanType: 'full',
        lastSyncAttempt: null,
        lastSuccessfulSync: null,
        folderMtime: null,
        folderSize: null,
        subDirs: [],
        files: [],
        stats: {
          totalFiles: 0,
          totalSize: 0,
          syncedFiles: 0,
          syncedSize: 0,
          skippedFiles: 0
        },
        scanComplete: false,
        scanProgress: {
          scannedFiles: 0,
          totalFiles: 0,
          pendingFiles: []
        }
      }
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
      return manifest
    } catch (error) {
      api.log(`[error] Failed to init manifest for ${dirPath} (${targetName}): ${error.message}`)
      return null
    }
  }

  const loadDirectoryManifest = (dirPath, targetName) => {
    try {
      const manifestPath = getManifestPath(dirPath, targetName)
      if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
        if (!manifest.subDirs) manifest.subDirs = []
        if (!manifest.files) manifest.files = []
        if (!manifest.stats) {
          manifest.stats = {
            totalFiles: 0,
            totalSize: 0,
            syncedFiles: 0,
            syncedSize: 0,
            skippedFiles: 0
          }
        }
        if (manifest.stats.skippedFiles === undefined) manifest.stats.skippedFiles = 0
        if (manifest.scanComplete === undefined) manifest.scanComplete = false
        if (!manifest.scanProgress) {
          manifest.scanProgress = {
            scannedFiles: 0,
            totalFiles: 0,
            pendingFiles: []
          }
        }
        return manifest
      }
    } catch (error) {
      // ignore
    }
    return null
  }

  const saveDirectoryManifest = (dirPath, targetName, manifest) => {
    try {
      const manifestPath = getManifestPath(dirPath, targetName)
      manifest.lastUpdated = new Date().toISOString()
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
    } catch (error) {
      api.log(`[error] Failed to save manifest for ${dirPath} (${targetName}): ${error.message}`)
    }
  }

  const getOrCreateDirectoryManifest = (dirPath, targetName, remotePath) => {
    let manifest = loadDirectoryManifest(dirPath, targetName)
    if (!manifest) {
      manifest = initDirectoryManifest(dirPath, targetName, remotePath)
    }
    return manifest
  }

  // ==================== 同步狀態管理 ====================

  const getSyncStatePath = (targetRoot, targetName) => {
    return path.join(targetRoot, getSyncStateFileName(targetName))
  }

  const loadSyncState = (targetRoot, targetName) => {
    try {
      const statePath = getSyncStatePath(targetRoot, targetName)
      if (fs.existsSync(statePath)) {
        const state = JSON.parse(fs.readFileSync(statePath, 'utf8'))
        if (!state.currentQueue) state.currentQueue = []
        if (!state.processedDirs) state.processedDirs = []
        if (!state.inProgressDirs) state.inProgressDirs = []
        if (!state.pendingDirs) state.pendingDirs = []
        if (!state.completedDirs) state.completedDirs = []
        return state
      }
    } catch (error) {
      // ignore
    }
    return {
      currentQueue: [],
      processedDirs: [],
      inProgressDirs: [],
      pendingDirs: [],
      completedDirs: [],
      lastCheckpoint: null,
      totalDirs: 0,
      completedCount: 0,
      version: '3.7'
    }
  }

  const saveSyncState = (targetRoot, targetName, state) => {
    try {
      const statePath = getSyncStatePath(targetRoot, targetName)
      state.lastCheckpoint = new Date().toISOString()
      state.version = '3.7'
      fs.writeFileSync(statePath, JSON.stringify(state, null, 2))
      
      const globalState = loadGlobalState(targetRoot)
      if (!globalState.targetProgress[targetName]) {
        globalState.targetProgress[targetName] = {}
      }
      globalState.targetProgress[targetName] = {
        completedDirs: state.completedDirs?.length || 0,
        totalDirs: state.totalDirs || 0,
        pendingDirs: state.pendingDirs?.length || 0,
        lastUpdate: new Date().toISOString()
      }
      saveGlobalState(targetRoot, globalState)
      
    } catch (error) {
      api.log(`[error] Failed to save sync state for ${targetName}: ${error.message}`)
    }
  }

  const clearSyncState = (targetRoot, targetName) => {
    try {
      const statePath = getSyncStatePath(targetRoot, targetName)
      if (fs.existsSync(statePath)) {
        fs.unlinkSync(statePath)
      }
      
      const globalState = loadGlobalState(targetRoot)
      if (globalState.targetProgress) {
        delete globalState.targetProgress[targetName]
      }
      saveGlobalState(targetRoot, globalState)
      
    } catch (error) {
      api.log(`[error] Failed to clear sync state for ${targetName}: ${error.message}`)
    }
  }

  // ==================== 失敗隊列管理 ====================

  const getFailedQueuePath = (targetRoot, targetName) => {
    return path.join(targetRoot, getFailedQueueFileName(targetName))
  }

  const loadFailedQueue = (targetRoot, targetName) => {
    try {
      const queuePath = getFailedQueuePath(targetRoot, targetName)
      if (fs.existsSync(queuePath)) {
        return JSON.parse(fs.readFileSync(queuePath, 'utf8'))
      }
    } catch (error) {
      // ignore
    }
    return { files: [] }
  }

  const saveFailedQueue = (targetRoot, targetName, queue) => {
    try {
      const queuePath = getFailedQueuePath(targetRoot, targetName)
      queue.lastUpdated = new Date().toISOString()
      fs.writeFileSync(queuePath, JSON.stringify(queue, null, 2))
    } catch (error) {
      api.log(`[error] Failed to save failed queue for ${targetName}: ${error.message}`)
    }
  }

  const addToFailedQueue = (targetRoot, targetName, fileInfo, error) => {
    try {
      const queue = loadFailedQueue(targetRoot, targetName)
      
      const failedFile = {
        ...fileInfo,
        error: error.message,
        timestamp: new Date().toISOString(),
        attempts: (fileInfo.attempts || 0) + 1
      }

      const existingIndex = queue.files.findIndex(f => 
        f.targetName === targetName && f.remotePath === fileInfo.remotePath
      )

      if (existingIndex >= 0) {
        queue.files[existingIndex] = failedFile
      } else {
        queue.files.push(failedFile)
      }

      saveFailedQueue(targetRoot, targetName, queue)

      if (api.getConfig('verboseDebug')) {
        api.log(`[verbose] [${targetName}] Failed: ${fileInfo.remotePath}`)
      }
    } catch (error) {
      api.log(`[error] Failed to add to failed queue for ${targetName}: ${error.message}`)
    }
  }

  const removeFromFailedQueue = (targetRoot, targetName, remotePath) => {
    try {
      const queue = loadFailedQueue(targetRoot, targetName)
      queue.files = queue.files.filter(f => 
        !(f.targetName === targetName && f.remotePath === remotePath)
      )
      saveFailedQueue(targetRoot, targetName, queue)
    } catch (error) {
      api.log(`[error] Failed to remove from failed queue for ${targetName}: ${error.message}`)
    }
  }

  // ==================== 快速比對功能 ====================

  const getFolderStats = (dirPath, targetName) => {
    try {
      if (!fs.existsSync(dirPath)) {
        return { mtime: null, totalSize: 0 }
      }

      const stats = fs.statSync(dirPath)
      let totalSize = 0
      
      const items = fs.readdirSync(dirPath)
      for (const item of items) {
        if (item === getManifestFileName(targetName)) continue
        
        const itemPath = path.join(dirPath, item)
        try {
          const itemStat = fs.statSync(itemPath)
          if (itemStat.isFile()) {
            totalSize += itemStat.size
          }
        } catch (e) {
          // ignore
        }
      }

      return {
        mtime: stats.mtimeMs,
        totalSize: totalSize
      }
    } catch (error) {
      return { mtime: null, totalSize: 0 }
    }
  }

  const checkFolderNeedDeepScan = (dirPath, targetName, manifest, quickScanThreshold) => {
    if (!manifest || !manifest.folderMtime) {
      return 'deep'
    }

    const currentStats = getFolderStats(dirPath, targetName)
    
    if (!currentStats.mtime) {
      return 'deep'
    }

    const mtimeDiff = Math.abs(currentStats.mtime - manifest.folderMtime) / (1000 * 60)
    
    if (mtimeDiff < quickScanThreshold && currentStats.totalSize === manifest.folderSize) {
      return 'quick'
    }

    return 'deep'
  }

  const quickScanDirectory = (dirPath, targetName, manifest) => {
    if (!manifest || !fs.existsSync(dirPath)) {
      return { missingFiles: [], extraFiles: [] }
    }

    const missingFiles = []
    const extraFiles = []

    for (const file of manifest.files) {
      const filePath = path.join(dirPath, file.name)
      if (!fs.existsSync(filePath)) {
        missingFiles.push(file)
        file.status = 'pending'
      }
    }

    const existingFiles = new Set(fs.readdirSync(dirPath))
    for (const file of manifest.files) {
      existingFiles.delete(file.name)
    }
    existingFiles.delete(getManifestFileName(targetName))

    for (const extraFile of existingFiles) {
      const filePath = path.join(dirPath, extraFile)
      try {
        const stat = fs.statSync(filePath)
        if (stat.isFile()) {
          extraFiles.push({
            name: extraFile,
            size: stat.size
          })
        }
      } catch (e) {
        // ignore
      }
    }

    return { missingFiles, extraFiles }
  }

  // ==================== 輔助功能 ====================

  const checkServerAvailable = async (apiUrl) => {
    try {
      await execAsync(`curl -s -I --connect-timeout 5 "${apiUrl.origin}"`)
      return true
    } catch {
      return false
    }
  }

  const requestWithRetry = async (command, maxRetries, retryDelay, verbose, trace) => {
    let lastError
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 1 && verbose) {
          api.log(`[verbose] Retry attempt ${attempt}/${maxRetries}`)
        }
        
        const { stdout, stderr } = await execAsync(command, { 
          maxBuffer: 10 * 1024 * 1024,
          windowsHide: true,
          encoding: 'utf8'
        })
        
        if (stderr && verbose) {
          api.log(`[verbose] Command stderr: ${stderr}`)
        }
        
        return stdout
      } catch (error) {
        lastError = error
        
        if (verbose) {
          api.log(`[verbose] Command failed (attempt ${attempt}): ${error.message}`)
        }
        
        if (attempt < maxRetries) {
          if (verbose) {
            api.log(`[verbose] Waiting ${retryDelay}s before retry...`)
          }
          await new Promise(resolve => setTimeout(resolve, retryDelay * 1000))
        }
      }
    }
    
    throw lastError
  }

  // 修復：改進排除文件夾功能
  const shouldExcludeFolder = (folderPath, excludeFolders) => {
    // 如果排除列表為空，不過濾
    if (!excludeFolders || excludeFolders.length === 0) return false
    
    // 將路徑分割成部分
    const folders = folderPath.split(/[\\/]/).filter(f => f.length > 0)
    
    // 檢查路徑中的每個文件夾名稱是否在排除列表中
    for (const folder of folders) {
      const folderLower = folder.toLowerCase()
      for (const excluded of excludeFolders) {
        // 完全匹配
        if (folderLower === excluded.toLowerCase()) {
          return true
        }
        // 也支持通配符匹配，例如 "temp*" 匹配 "temp1", "temp2" 等
        if (excluded.includes('*')) {
          const pattern = excluded.toLowerCase().replace(/\*/g, '.*')
          const regex = new RegExp(`^${pattern}$`)
          if (regex.test(folderLower)) {
            return true
          }
        }
      }
    }
    return false
  }

  const shouldExcludeFile = (filename, excludeExtensions) => {
    const ext = path.extname(filename).toLowerCase().substring(1)
    return excludeExtensions.includes(ext)
  }

  // 新增：檢查文件是否匹配優先下載模式
  const matchesPriorityPattern = (filename, patterns) => {
    if (!patterns || patterns.length === 0) return false
    
    const filenameLower = filename.toLowerCase()
    
    for (const pattern of patterns) {
      // 處理通配符模式
      if (pattern.includes('*')) {
        const regexPattern = pattern.toLowerCase()
          .replace(/\./g, '\\.')
          .replace(/\*/g, '.*')
        const regex = new RegExp(`^${regexPattern}$`)
        if (regex.test(filenameLower)) {
          return true
        }
      } 
      // 直接匹配擴展名或完整文件名
      else if (filenameLower === pattern.toLowerCase() || 
               filenameLower.endsWith('.' + pattern.toLowerCase())) {
        return true
      }
    }
    
    return false
  }

  const getRemoteFileList = async (remoteAddress, targetName, api) => {
    const verbose = api.getConfig('verboseDebug')
    const trace = api.getConfig('traceDebug')
    const maxRetries = api.getConfig('maxRetries')
    const retryDelay = api.getConfig('retryDelay')

    try {
      let apiUrl
      try {
        apiUrl = new URL(remoteAddress)
      } catch (urlError) {
        throw new Error(`Invalid URL: ${remoteAddress}`)
      }
      
      const baseUrl = `${apiUrl.protocol}//${apiUrl.host}`
      const remotePath = apiUrl.pathname
      
      const apiEndpoint = `${baseUrl}/~/api/get_file_list?uri=${encodeURIComponent(remotePath)}`

      if (trace) {
        api.log(`[trace] [${targetName}] Fetching: ${apiEndpoint}`)
      }

      const command = `curl -s --connect-timeout 30 "${apiEndpoint}"`
      
      const stdout = await requestWithRetry(command, maxRetries, retryDelay, verbose, trace)

      if (!stdout || stdout.trim() === '') {
        throw new Error('Empty response from server')
      }

      let jsonStr = stdout.trim()
      
      const firstBrace = jsonStr.indexOf('{')
      const lastBrace = jsonStr.lastIndexOf('}')
      
      if (firstBrace === -1 || lastBrace === -1) {
        api.log(`[error] [${targetName}] No JSON object found in response`)
        throw new Error('No JSON object found in response')
      }
      
      jsonStr = jsonStr.substring(firstBrace, lastBrace + 1)

      if (trace) {
        api.log(`[trace] [${targetName}] JSON response: ${jsonStr.substring(0, 500)}${jsonStr.length > 500 ? '...' : ''}`)
      }

      let response
      try {
        response = JSON.parse(jsonStr)
      } catch (parseError) {
        api.log(`[error] [${targetName}] Invalid JSON response`)
        throw new Error(`Invalid JSON response: ${parseError.message}`)
      }

      return response.list || []
    } catch (error) {
      api.log(`[error] [${targetName}] Failed to get remote file list: ${error.message}`)
      throw error
    }
  }

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  }

  const shouldDownloadFile = (localPath, remoteSize, overwrite) => {
    if (!fs.existsSync(localPath)) {
      return true
    }
    
    try {
      const stat = fs.statSync(localPath)
      if (stat.isDirectory()) {
        return false
      }
      
      if (overwrite) {
        return true
      }
      
      return stat.size !== remoteSize
      
    } catch (error) {
      return true
    }
  }

  // 簡化的下載函數
  const downloadWithAria2 = async (remoteUrl, localPath, targetName, api) => {
    const aria2cPath = api.getConfig('aria2Path')
    const speedLimit = api.getConfig('speedLimit')
    const overwrite = api.getConfig('overwrite')
    const verbose = api.getConfig('verboseDebug')
    const trace = api.getConfig('traceDebug')
    const maxRetries = api.getConfig('maxRetries')
    const retryDelay = api.getConfig('retryDelay')
    const fileThreads = api.getConfig('fileThreads')

    const dir = path.dirname(localPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    const fileName = path.basename(localPath)
    const safeFileName = fileName.replace(/[<>:"/\\|?*%]/g, '_')
    
    if (fileName !== safeFileName && trace) {
      api.log(`[trace] [${targetName}] Renamed: ${fileName} -> ${safeFileName}`)
    }

    const encodedRemoteUrl = remoteUrl.replace(/ /g, '%20')

    let args = [
      `"${aria2cPath}"`,
      `--dir="${dir}"`,
      `--out="${safeFileName}"`,
      overwrite ? '--allow-overwrite=true' : '--allow-overwrite=false',
      '--auto-file-renaming=false',
      '--continue=true',
      `--max-tries=${maxRetries}`,
      `--retry-wait=${retryDelay}`,
      '--max-concurrent-downloads=1',
      `--split=${fileThreads}`,
      `--min-split-size=1M`,
      '--timeout=60',
      '--connect-timeout=30',
      `--max-connection-per-server=${fileThreads}`,
      '--disable-ipv6=true',
      '--human-readable=true',
      '--file-allocation=none'
    ]

    if (speedLimit > 0) {
      args.push(`--max-overall-download-limit=${speedLimit}K`)
      args.push(`--max-download-limit=${speedLimit}K`)
    }

    args.push('--console-log-level=warn')
    args.push(`"${encodedRemoteUrl}"`)

    const command = args.join(' ')

    try {
      const { stdout, stderr } = await execAsync(command, {
        maxBuffer: 10 * 1024 * 1024,
        windowsHide: true,
        encoding: 'utf8'
      })
      
      if (stderr && (stderr.includes('404') || stderr.includes('Not Found'))) {
        const error = new Error(`File not found (404): ${remoteUrl}`)
        error.code = 404
        throw error
      }
      
      if (stderr && stderr.includes('error') && !stderr.includes('Download complete') && !stderr.includes('STATS')) {
        throw new Error(stderr)
      }
      
      if (fileName !== safeFileName && fs.existsSync(path.join(dir, safeFileName))) {
        try {
          fs.renameSync(path.join(dir, safeFileName), path.join(dir, fileName))
        } catch (renameError) {
          if (trace) {
            api.log(`[trace] [${targetName}] Rename failed: ${renameError.message}`)
          }
        }
      }
      
      if (verbose) {
        const fileSize = fs.statSync(path.join(dir, safeFileName || fileName)).size
        api.log(`[verbose] [${targetName}] Downloaded: ${localPath} (${formatBytes(fileSize)})`)
      }
      
      return true
    } catch (error) {
      if (error.code === 404) {
        throw new Error(`File not found (404)`)
      }
      if (trace) {
        throw new Error(`Download failed: ${error.message}\nstderr: ${error.stderr}`)
      } else {
        throw new Error(`Download failed`)
      }
    }
  }

  // ==================== 重試失敗的文件 ====================

  const retryFailedFiles = async (targetRoot, target) => {
    const debug = api.getConfig('debug')
    const maxRetries = api.getConfig('maxRetries')
    const fileDelay = api.getConfig('fileDelay')
    const targetName = target.name
    
    if (!fs.existsSync(targetRoot)) return

    const failedQueue = loadFailedQueue(targetRoot, targetName)
    
    if (failedQueue.files.length === 0) {
      return
    }

    if (debug) {
      api.log(`[sync] [${targetName}] Retrying ${failedQueue.files.length} failed files...`)
    }

    // 路徑清理函數
    const cleanRemotePath = (remotePath) => {
      let cleanPath = remotePath.replace(/^[\\/]+/, '')
      cleanPath = cleanPath.replace(/\\/g, '/')
      return cleanPath
    }

    const stats = { succeeded: 0, failed: 0, skipped: 0 }
    const remainingFiles = []

    for (const failedFile of failedQueue.files) {
      // 清理路徑
      const originalPath = failedFile.remotePath
      const cleanPath = cleanRemotePath(originalPath)
      
      if (originalPath !== cleanPath && debug) {
        api.log(`[sync] [${targetName}] Cleaned path: ${originalPath} -> ${cleanPath}`)
        failedFile.remotePath = cleanPath
      }

      try {
        // 檢查服務器是否可用
        const apiUrl = new URL(target.remoteAddress)
        const serverAvailable = await checkServerAvailable(apiUrl)
        
        if (!serverAvailable) {
          if (debug) {
            api.log(`[sync] [${targetName}] Server unavailable, will retry later: ${failedFile.remotePath}`)
          }
          remainingFiles.push(failedFile)
          continue
        }

        // 構建遠程 URL
        const baseUrl = target.remoteAddress.endsWith('/') ? target.remoteAddress : target.remoteAddress + '/'
        const remoteFileUrl = baseUrl + failedFile.remotePath

        // 確保本地目錄存在
        const localDir = path.dirname(failedFile.localPath)
        if (!fs.existsSync(localDir)) {
          fs.mkdirSync(localDir, { recursive: true })
        }

        if (debug) {
          api.log(`[sync] [${targetName}] Retrying file: ${failedFile.remotePath} (attempt ${failedFile.attempts + 1})`)
        }

        // 嘗試下載
        await downloadWithAria2(remoteFileUrl, failedFile.localPath, targetName, api)

        // 下載成功
        stats.succeeded++
        
        if (debug) {
          api.log(`[sync] [${targetName}] Successfully retried: ${failedFile.remotePath}`)
        }

        // 更新 manifest
        const dirManifest = loadDirectoryManifest(localDir, targetName)
        if (dirManifest) {
          const fileName = path.basename(failedFile.localPath)
          const fileEntry = dirManifest.files.find(f => f.name === fileName)
          if (fileEntry) {
            fileEntry.status = 'completed'
            fileEntry.attempts = 0
            dirManifest.stats.syncedFiles++
            dirManifest.stats.syncedSize += failedFile.size
            saveDirectoryManifest(localDir, targetName, dirManifest)
          }
        }

      } catch (error) {
        // 下載失敗
        failedFile.attempts++
        failedFile.error = error.message
        failedFile.timestamp = new Date().toISOString()
        remainingFiles.push(failedFile)
        stats.failed++
        
        if (debug) {
          api.log(`[sync] [${targetName}] Retry failed: ${failedFile.remotePath} (${error.message})`)
        }
      }

      // 文件間延遲
      if (fileDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, fileDelay))
      }
    }

    // 更新失敗隊列
    failedQueue.files = remainingFiles
    saveFailedQueue(targetRoot, targetName, failedQueue)

    // 顯示統計信息
    if (debug && (stats.succeeded > 0 || stats.failed > 0)) {
      api.log(`[sync] [${targetName}] Retry summary: ${stats.succeeded} succeeded, ${stats.failed} failed`)
    }
  }

  // ==================== 簡化版完整性檢查（基於 manifest） ====================
  const performQuickIntegrityCheck = async (target, targetRoot) => {
    const debug = api.getConfig('debug')
    const verbose = api.getConfig('verboseDebug')
    const targetName = target.name
    
    if (debug) {
      api.log(`[sync] [${targetName}] Performing quick integrity check...`)
    }

    // 檢查目標目錄是否存在
    if (!fs.existsSync(targetRoot)) {
      if (debug) {
        api.log(`[sync] [${targetName}] Target directory does not exist! Resetting completion status...`)
      }
      
      // 目錄不存在，重置完成狀態
      const globalState = loadGlobalState(targetRoot)
      if (globalState.completedTargets) {
        delete globalState.completedTargets[targetName]
      }
      saveGlobalState(targetRoot, globalState)
      
      // 創建目錄
      fs.mkdirSync(targetRoot, { recursive: true })
      
      // 啟動完整同步
      if (debug) {
        api.log(`[sync] [${targetName}] Starting full sync due to missing directory...`)
      }
      return true // 需要同步
    }

    // 加載根目錄的 manifest
    const rootManifest = loadDirectoryManifest(targetRoot, targetName)
    if (!rootManifest) {
      if (debug) {
        api.log(`[sync] [${targetName}] No manifest found - will perform full sync`)
      }
      return true // 需要同步
    }

    // 遞迴檢查所有目錄的完整性
    const checkDirectoryIntegrity = (dirPath, manifestPath) => {
      if (!fs.existsSync(dirPath)) {
        return false
      }

      const manifest = loadDirectoryManifest(dirPath, targetName)
      if (!manifest) {
        return false
      }

      // 計算當前目錄的實際大小
      let actualSize = 0
      let actualFiles = 0
      
      try {
        const items = fs.readdirSync(dirPath)
        for (const item of items) {
          if (item === getManifestFileName(targetName)) continue
          
          const itemPath = path.join(dirPath, item)
          try {
            const stat = fs.statSync(itemPath)
            if (stat.isFile()) {
              actualSize += stat.size
              actualFiles++
            }
          } catch (e) {
            // ignore
          }
        }
      } catch (e) {
        return false
      }

      // 比對 manifest 中的統計數據
      const expectedSize = manifest.stats?.syncedSize || 0
      const expectedFiles = manifest.stats?.syncedFiles || 0

      // 如果大小或文件數量不匹配，說明有問題
      if (actualSize !== expectedSize || actualFiles !== expectedFiles) {
        if (verbose) {
          api.log(`[verbose] [${targetName}] Directory mismatch: ${path.relative(targetRoot, dirPath)}`)
          api.log(`[verbose]   Expected: ${expectedFiles} files, ${formatBytes(expectedSize)}`)
          api.log(`[verbose]   Actual: ${actualFiles} files, ${formatBytes(actualSize)}`)
        }
        return false
      }

      // 遞迴檢查子目錄
      for (const subDir of manifest.subDirs || []) {
        const subDirPath = path.join(dirPath, subDir.name)
        if (!checkDirectoryIntegrity(subDirPath, subDir.name)) {
          return false
        }
      }

      return true
    }

    // 執行完整性檢查
    const isIntegrity = checkDirectoryIntegrity(targetRoot, '/')

    if (!isIntegrity) {
      if (debug) {
        api.log(`[sync] [${targetName}] Integrity check failed - resetting completion status`)
      }
      
      // 重置完成狀態
      const globalState = loadGlobalState(targetRoot)
      if (globalState.completedTargets) {
        delete globalState.completedTargets[targetName]
      }
      saveGlobalState(targetRoot, globalState)
      
      return true // 需要同步
    }

    if (debug) {
      api.log(`[sync] [${targetName}] Integrity check passed`)
    }
    
    return false // 不需要同步
  }

  // ==================== 核心功能：處理目錄 ====================

  const processDirectory = async (target, dirPath, remotePath, stats, syncState, scanType = 'deep') => {
    const debug = api.getConfig('debug')
    const verbose = api.getConfig('verboseDebug')
    const trace = api.getConfig('traceDebug')
    const excludeFolders = api.getConfig('excludeFolders').split(',').map(folder => folder.trim())
    const excludeExts = api.getConfig('excludeFiles').split(',').map(ext => ext.trim().toLowerCase())
    const mirrorMode = api.getConfig('mirrorMode')
    const fileDelay = api.getConfig('fileDelay')
    const overwrite = api.getConfig('overwrite')
    const targetRoot = target.localDestination
    const targetName = target.name
    
    // 解析優先模式
    const priorityPatterns = (target.priorityPatterns || '*.mp4,*.mkv,*.avi,*.jpg,*.png,*.pdf')
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0)

    let manifest = getOrCreateDirectoryManifest(dirPath, targetName, remotePath)
    if (!manifest) {
      return { subDirs: [], shouldContinue: true }
    }

    manifest.lastSyncAttempt = new Date().toISOString()
    manifest.lastScanType = scanType

    try {
      if (scanType === 'quick') {
        const { missingFiles, extraFiles } = quickScanDirectory(dirPath, targetName, manifest)
        
        if (missingFiles.length > 0 && debug) {
          api.log(`[sync] [${targetName}] Quick scan found ${missingFiles.length} missing files in ${remotePath}`)
        }

        for (const file of missingFiles) {
          file.status = 'pending'
        }

        if (mirrorMode && extraFiles.length > 0) {
          for (const extraFile of extraFiles) {
            const filePath = path.join(dirPath, extraFile.name)
            try {
              fs.unlinkSync(filePath)
              stats.deleted.push(`[${targetName}] ${extraFile.name}`)
              if (trace) {
                api.log(`[trace] [${targetName}] Deleted extra file: ${extraFile.name}`)
              }
            } catch (e) {
              // ignore
            }
          }
        }

        const folderStats = getFolderStats(dirPath, targetName)
        manifest.folderMtime = folderStats.mtime
        manifest.folderSize = folderStats.totalSize
        manifest.scanComplete = true
        saveDirectoryManifest(dirPath, targetName, manifest)

        return { subDirs: manifest.subDirs.map(d => ({
          name: d.name,
          remotePath: path.join(remotePath, d.name).replace(/\\/g, '/'),
          localPath: path.join(dirPath, d.name)
        })), shouldContinue: true }
      }

      let fullRemoteUrl
      if (remotePath === '/') {
        fullRemoteUrl = target.remoteAddress
      } else {
        const baseUrl = target.remoteAddress.endsWith('/') ? target.remoteAddress : target.remoteAddress + '/'
        const cleanPath = remotePath.startsWith('/') ? remotePath.substring(1) : remotePath
        fullRemoteUrl = baseUrl + cleanPath + '/'
      }

      const fileList = await getRemoteFileList(fullRemoteUrl, targetName, api)

      const remoteDirs = []
      const remoteFiles = []

      for (const item of fileList) {
        if (!item || !item.n) continue

        const isDir = item.n.endsWith('/')
        const name = isDir ? item.n.slice(0, -1) : item.n
        const fullRemotePath = remotePath === '/' ? name : path.join(remotePath, name).replace(/\\/g, '/')

        if (isDir) {
          // 修復：使用改進的排除文件夾檢查
          if (!shouldExcludeFolder(fullRemotePath, excludeFolders)) {
            remoteDirs.push({
              name: name,
              remotePath: fullRemotePath,
              localPath: path.join(dirPath, name)
            })
          } else if (trace) {
            api.log(`[trace] [${targetName}] Excluded folder: ${fullRemotePath}`)
          }
        } else {
          if (!shouldExcludeFile(name, excludeExts)) {
            const modTime = item.m || item.c || new Date().toISOString()
            remoteFiles.push({
              name: name,
              remotePath: fullRemotePath,
              localPath: path.join(dirPath, name),
              size: item.s || 0,
              modTime: modTime
            })
          } else if (trace) {
            api.log(`[trace] [${targetName}] Excluded file by extension: ${name}`)
          }
        }
      }

      const newSubDirs = []
      for (const remoteDir of remoteDirs) {
        const existingDir = manifest.subDirs.find(d => d && d.name === remoteDir.name)
        if (!existingDir) {
          manifest.subDirs.push({
            name: remoteDir.name,
            status: 'pending',
            lastSync: null
          })
          newSubDirs.push(remoteDir)
        }
      }

      const oldFiles = new Map(manifest.files.map(f => [f.name, f]))
      
      for (const remoteFile of remoteFiles) {
        const oldFile = oldFiles.get(remoteFile.name)
        if (!oldFile) {
          manifest.files.push({
            name: remoteFile.name,
            size: remoteFile.size,
            modTime: remoteFile.modTime,
            status: 'pending',
            attempts: 0,
            isPriority: matchesPriorityPattern(remoteFile.name, priorityPatterns) // 標記優先級
          })
        } else if (oldFile.size !== remoteFile.size || oldFile.modTime !== remoteFile.modTime) {
          oldFile.size = remoteFile.size
          oldFile.modTime = remoteFile.modTime
          oldFile.status = 'pending'
          oldFile.attempts = 0
          oldFile.isPriority = matchesPriorityPattern(remoteFile.name, priorityPatterns) // 更新優先級標記
        }
      }

      manifest.stats.totalFiles = remoteFiles.length
      manifest.stats.totalSize = remoteFiles.reduce((sum, f) => sum + f.size, 0)

      if (mirrorMode) {
        const removedDirs = manifest.subDirs.filter(subDir => 
          !remoteDirs.some(d => d.name === subDir.name)
        )
        
        manifest.subDirs = manifest.subDirs.filter(subDir => 
          remoteDirs.some(d => d.name === subDir.name)
        )

        const removedFiles = manifest.files.filter(file => 
          !remoteFiles.some(f => f.name === file.name)
        )
        
        manifest.files = manifest.files.filter(file => 
          remoteFiles.some(f => f.name === file.name)
        )

        const localItems = fs.readdirSync(dirPath)
        for (const localItem of localItems) {
          if (localItem === getManifestFileName(targetName)) continue
          
          const itemPath = path.join(dirPath, localItem)
          const stat = fs.statSync(itemPath)

          const foundInRemote = remoteFiles.some(f => f.name === localItem) || 
                               remoteDirs.some(d => d.name === localItem)

          if (!foundInRemote) {
            if (stat.isDirectory()) {
              try {
                const subItems = fs.readdirSync(itemPath)
                if (subItems.length === 0 || (subItems.length === 1 && subItems[0] === getManifestFileName(targetName))) {
                  const deleteSubManifests = (subDir) => {
                    const subManifestPath = getManifestPath(subDir, targetName)
                    if (fs.existsSync(subManifestPath)) {
                      fs.unlinkSync(subManifestPath)
                    }
                    try {
                      const subItems = fs.readdirSync(subDir)
                      for (const subItem of subItems) {
                        const subItemPath = path.join(subDir, subItem)
                        const subStat = fs.statSync(subItemPath)
                        if (subStat.isDirectory()) {
                          deleteSubManifests(subItemPath)
                        }
                      }
                    } catch (e) {
                      // ignore
                    }
                  }
                  deleteSubManifests(itemPath)
                  fs.rmdirSync(itemPath, { recursive: true })
                  stats.deleted.push(`[${targetName}] ${localItem}/`)
                }
              } catch (e) {
                // ignore
              }
            } else {
              fs.unlinkSync(itemPath)
              stats.deleted.push(`[${targetName}] ${localItem}`)
              stats.totalBytes += stat.size
            }
          }
        }

        for (const removedDir of removedDirs) {
          stats.deleted.push(`[${targetName}] ${removedDir.name}/ (removed from manifest)`)
        }
        for (const removedFile of removedFiles) {
          stats.deleted.push(`[${targetName}] ${removedFile.name} (removed from manifest)`)
        }
      }

      const pendingFiles = []
      const skippedFiles = []
      
      for (const file of manifest.files) {
        if (file.status === 'completed' && file.attempts < api.getConfig('maxRetries')) {
          const localFilePath = path.join(dirPath, file.name)
          if (!fs.existsSync(localFilePath)) {
            file.status = 'pending'
            pendingFiles.push(file)
          }
          continue
        }
        
        if (file.status === 'completed' || file.attempts >= api.getConfig('maxRetries')) {
          continue
        }
        
        const localFilePath = path.join(dirPath, file.name)
        if (shouldDownloadFile(localFilePath, file.size, overwrite)) {
          pendingFiles.push(file)
        } else {
          file.status = 'completed'
          file.attempts = 0
          manifest.stats.syncedFiles++
          manifest.stats.syncedSize += file.size
          manifest.stats.skippedFiles++
          skippedFiles.push(file.name)
        }
      }

      if (skippedFiles.length > 0 && trace) {
        api.log(`[trace] [${targetName}] Skipped ${skippedFiles.length} existing files in ${remotePath}`)
      }

      if (pendingFiles.length > 0) {
        if (debug) {
          const folderName = remotePath === '/' ? 'root' : path.basename(remotePath)
          
          // 統計優先級文件
          const priorityCount = pendingFiles.filter(f => f.isPriority).length
          if (priorityCount > 0) {
            api.log(`[sync] [${targetName}] ${folderName}: ${pendingFiles.length} files to download (${priorityCount} priority)`)
          } else {
            api.log(`[sync] [${targetName}] ${folderName}: ${pendingFiles.length} files to download`)
          }
        }

        // 按優先級排序：優先文件先下載
        pendingFiles.sort((a, b) => {
          if (a.isPriority && !b.isPriority) return -1
          if (!a.isPriority && b.isPriority) return 1
          return 0
        })

        for (const file of pendingFiles) {
          if (syncState && syncState.shouldStop) {
            if (debug) api.log(`[sync] [${targetName}] Sync interrupted, saving checkpoint...`)
            return { subDirs: newSubDirs, shouldContinue: false }
          }

          try {
            file.status = 'downloading'
            saveDirectoryManifest(dirPath, targetName, manifest)

            const baseUrl = target.remoteAddress.endsWith('/') ? target.remoteAddress : target.remoteAddress + '/'
            const remoteFileUrl = baseUrl + path.join(remotePath, file.name).replace(/\\/g, '/')

            await downloadWithAria2(remoteFileUrl, path.join(dirPath, file.name), targetName, api)

            file.status = 'completed'
            manifest.stats.syncedFiles++
            manifest.stats.syncedSize += file.size
            
            stats.downloaded.push(`[${targetName}] ${path.join(remotePath, file.name)}`)
            stats.totalBytes += file.size

            removeFromFailedQueue(targetRoot, targetName, path.join(remotePath, file.name))

          } catch (error) {
            file.attempts++
            
            if (error.message.includes('404')) {
              file.status = 'completed'
              file.attempts = 0
              api.log(`[warn] [${targetName}] File not found (404), skipping: ${file.name}`)
            } else {
              file.status = 'failed'
              api.log(`[error] [${targetName}] Failed to download ${file.name}: ${error.message}`)
              addToFailedQueue(targetRoot, targetName, {
                targetName: targetName,
                remotePath: path.join(remotePath, file.name),
                localPath: path.join(dirPath, file.name),
                size: file.size,
                attempts: file.attempts,
                isPriority: file.isPriority
              }, error)
              stats.errors.push({ target: targetName, file: path.join(remotePath, file.name), error: error.message })
            }
          } finally {
            saveDirectoryManifest(dirPath, targetName, manifest)
            
            if (fileDelay > 0) {
              await new Promise(resolve => setTimeout(resolve, fileDelay))
            }
          }
        }
      }

      const folderStats = getFolderStats(dirPath, targetName)
      manifest.folderMtime = folderStats.mtime
      manifest.folderSize = folderStats.totalSize
      manifest.lastSuccessfulSync = new Date().toISOString()
      manifest.scanComplete = true
      saveDirectoryManifest(dirPath, targetName, manifest)

      if (debug && manifest.stats.totalFiles > 0) {
        const downloadedCount = manifest.stats.syncedFiles - (manifest.stats.skippedFiles || 0)
        api.log(`[sync] [${targetName}] ${remotePath === '/' ? 'root' : path.basename(remotePath)}: ${manifest.stats.syncedFiles}/${manifest.stats.totalFiles} files (${formatBytes(manifest.stats.syncedSize)})`)
      }

      return { subDirs: newSubDirs, shouldContinue: true }

    } catch (error) {
      api.log(`[error] [${targetName}] Failed to process directory ${remotePath}: ${error.message}`)
      return { subDirs: [], shouldContinue: true, error: error.message }
    }
  }

  // ==================== 處理目標 ====================

  const processTarget = async (target, targetRoot) => {
    const debug = api.getConfig('debug')
    const checkpointInterval = api.getConfig('checkpointInterval') * 1000
    const quickScanThreshold = api.getConfig('quickScanThreshold')
    const targetName = target.name
    
    if (debug) {
      api.log(`[sync] Starting processing for target: ${targetName}`)
    }

    if (!fs.existsSync(targetRoot)) {
      fs.mkdirSync(targetRoot, { recursive: true })
    }

    getOrCreateDirectoryManifest(targetRoot, targetName, '/')

    let syncState = loadSyncState(targetRoot, targetName)
    let processQueue = []
    let processedDirs = new Set(syncState.processedDirs || [])
    let inProgressDirs = new Set(syncState.inProgressDirs || [])
    let pendingDirs = new Set(syncState.pendingDirs || [])
    let completedDirs = new Set(syncState.completedDirs || [])

    if (syncState.currentQueue && syncState.currentQueue.length > 0) {
      processQueue = syncState.currentQueue.map(dirPath => {
        const fullPath = path.join(targetRoot, dirPath)
        return {
          localPath: fullPath,
          remotePath: '/' + dirPath.replace(/\\/g, '/'),
          name: path.basename(dirPath),
          retryCount: 0
        }
      })
      if (debug) {
        api.log(`[sync] [${targetName}] Resuming from checkpoint: ${processQueue.length} directories remaining`)
        api.log(`[sync] [${targetName}] Progress: ${completedDirs.size} directories completed, ${processQueue.length} remaining`)
      }
    } else {
      const rootManifest = loadDirectoryManifest(targetRoot, targetName)
      const scanType = checkFolderNeedDeepScan(targetRoot, targetName, rootManifest, quickScanThreshold)
      
      if (debug && scanType === 'quick') {
        api.log(`[sync] [${targetName}] Quick scan for root directory`)
      }

      const rootResult = await processDirectory(
        target, 
        targetRoot, 
        '/', 
        { downloaded: [], deleted: [], errors: [], totalBytes: 0 },
        null,
        scanType
      )

      processQueue = rootResult.subDirs.map(dir => ({
        localPath: dir.localPath,
        remotePath: dir.remotePath,
        name: dir.name,
        retryCount: 0
      }))

      syncState.totalDirs = rootResult.subDirs.length
      syncState.pendingDirs = rootResult.subDirs.map(d => path.relative(targetRoot, d.localPath).replace(/\\/g, '/'))
    }

    const stats = {
      downloaded: [],
      deleted: [],
      errors: [],
      totalBytes: 0
    }

    let lastCheckpoint = Date.now()
    let shouldContinue = true
    let consecutiveErrors = 0
    const maxConsecutiveErrors = 5
    let hasError = false

    while (processQueue.length > 0 && shouldContinue) {
      // 按目錄深度排序，先處理較淺的目錄
      processQueue.sort((a, b) => {
        const depthA = a.remotePath.split('/').length
        const depthB = b.remotePath.split('/').length
        return depthA - depthB
      })

      const dir = processQueue.shift()
      const dirRelPath = path.relative(targetRoot, dir.localPath).replace(/\\/g, '/')

      if (processedDirs.has(dirRelPath) || inProgressDirs.has(dirRelPath) || completedDirs.has(dirRelPath)) {
        continue
      }

      inProgressDirs.add(dirRelPath)
      pendingDirs.delete(dirRelPath)

      if (debug) {
        api.log(`[sync] [${targetName}] Processing: ${dirRelPath} (${processQueue.length} remaining)`)
      }

      const dirManifest = loadDirectoryManifest(dir.localPath, targetName)
      const scanType = checkFolderNeedDeepScan(dir.localPath, targetName, dirManifest, quickScanThreshold)

      const result = await processDirectory(
        target,
        dir.localPath,
        dir.remotePath,
        stats,
        { shouldStop: false },
        scanType
      )

      if (result.error) {
        hasError = true
        consecutiveErrors++
        if (consecutiveErrors >= maxConsecutiveErrors) {
          if (debug) {
            api.log(`[sync] [${targetName}] Too many consecutive errors, pausing sync`)
          }
          shouldContinue = false
          processQueue.unshift(dir)
          break
        }
      } else {
        consecutiveErrors = 0
      }

      if (!result.shouldContinue) {
        shouldContinue = false
        processQueue.unshift(dir)
        break
      }

      for (const subDir of result.subDirs) {
        const subDirRelPath = path.relative(targetRoot, subDir.localPath).replace(/\\/g, '/')
        if (!processedDirs.has(subDirRelPath) && !inProgressDirs.has(subDirRelPath) && !completedDirs.has(subDirRelPath)) {
          processQueue.push({
            localPath: subDir.localPath,
            remotePath: subDir.remotePath,
            name: subDir.name,
            retryCount: 0
          })
          pendingDirs.add(subDirRelPath)
        }
      }

      inProgressDirs.delete(dirRelPath)
      processedDirs.add(dirRelPath)
      
      if (dirManifest && dirManifest.stats.syncedFiles === dirManifest.stats.totalFiles) {
        completedDirs.add(dirRelPath)
      }

      const now = Date.now()
      if (now - lastCheckpoint >= checkpointInterval) {
        syncState = {
          currentQueue: processQueue.map(d => path.relative(targetRoot, d.localPath).replace(/\\/g, '/')),
          processedDirs: Array.from(processedDirs),
          inProgressDirs: Array.from(inProgressDirs),
          pendingDirs: Array.from(pendingDirs),
          completedDirs: Array.from(completedDirs),
          totalDirs: syncState.totalDirs,
          completedCount: completedDirs.size,
          lastCheckpoint: new Date().toISOString()
        }
        saveSyncState(targetRoot, targetName, syncState)
        lastCheckpoint = now
        
        if (debug) {
          api.log(`[sync] [${targetName}] Checkpoint: ${completedDirs.size} dirs completed, ${processQueue.length} remaining`)
        }
      }
    }

    const rootManifest = loadDirectoryManifest(targetRoot, targetName)
    if (rootManifest) {
      rootManifest.stats = {
        totalDirs: completedDirs.size,
        totalFiles: stats.downloaded.length + stats.errors.length,
        totalSize: stats.totalBytes,
        syncedDirs: completedDirs.size,
        syncedFiles: stats.downloaded.length,
        syncedSize: stats.totalBytes,
        skippedFiles: rootManifest.stats.skippedFiles || 0
      }
      rootManifest.lastSuccessfulSync = new Date().toISOString()
      saveDirectoryManifest(targetRoot, targetName, rootManifest)
    }

    const allCompleted = processQueue.length === 0 && shouldContinue && !hasError &&
                        (syncState.totalDirs === 0 || completedDirs.size === syncState.totalDirs)

    if (allCompleted) {
      clearSyncState(targetRoot, targetName)
      
      const globalState = loadGlobalState(targetRoot)
      if (!globalState.completedTargets) globalState.completedTargets = {}
      globalState.completedTargets[targetName] = new Date().toISOString()
      saveGlobalState(targetRoot, globalState)
      
      if (debug) {
        api.log(`[sync] [${targetName}] Target completed`)
      }
    } else {
      syncState = {
        currentQueue: processQueue.map(d => path.relative(targetRoot, d.localPath).replace(/\\/g, '/')),
        processedDirs: Array.from(processedDirs),
        inProgressDirs: Array.from(inProgressDirs),
        pendingDirs: Array.from(pendingDirs),
        completedDirs: Array.from(completedDirs),
        totalDirs: syncState.totalDirs,
        completedCount: completedDirs.size,
        lastCheckpoint: new Date().toISOString()
      }
      saveSyncState(targetRoot, targetName, syncState)
      
      if (debug) {
        api.log(`[sync] [${targetName}] Paused with ${processQueue.length} directories remaining (${completedDirs.size} completed)`)
      }
    }

    if (debug && (stats.downloaded.length > 0 || stats.deleted.length > 0 || stats.errors.length > 0)) {
      api.log(`[sync] [${targetName}] Summary:`)
      if (stats.downloaded.length > 0) api.log(`[sync]   Downloaded: ${stats.downloaded.length} files (${formatBytes(stats.totalBytes)})`)
      if (stats.deleted.length > 0) api.log(`[sync]   Deleted: ${stats.deleted.length} items`)
      if (stats.errors.length > 0) api.log(`[sync]   Errors: ${stats.errors.length}`)
    }

    return stats
  }

  // ==================== 主同步循環 ====================

  const runSync = async () => {
    if (!api.getConfig('enableSync')) {
      return
    }

    if (isSyncing) {
      return
    }
    
    isSyncing = true
    syncStartTime = Date.now()
    
    try {
      const debug = api.getConfig('debug')
      const syncTargets = api.getConfig('syncTargets') || []

      if (!syncTargets.length) {
        if (debug) api.log('[sync] No sync targets configured')
        return
      }

      const sortedTargets = [...syncTargets].sort((a, b) => {
        const priorityA = a.priority !== undefined ? a.priority : 1
        const priorityB = b.priority !== undefined ? b.priority : 1
        return priorityA - priorityB
      })

      if (debug) {
        api.log(`[sync] Starting sync with ${sortedTargets.length} targets (priority order)`)
      }

      for (const target of sortedTargets) {
        try {
          if (!target.localDestination) {
            api.log(`[sync] Target "${target.name}" has no local destination, skipping`)
            continue
          }

          const targetRoot = target.localDestination
          
          // 檢查完成狀態
          const globalState = loadGlobalState(targetRoot)
          const isCompleted = globalState.completedTargets && globalState.completedTargets[target.name]
          
          if (isCompleted) {
            if (debug) {
              api.log(`[sync] Target "${target.name}" was completed at ${globalState.completedTargets[target.name]}, performing quick integrity check`)
            }
            
            // 執行快速完整性檢查
            const needsSync = await performQuickIntegrityCheck(target, targetRoot)
            
            if (!needsSync) {
              if (debug) {
                api.log(`[sync] Target "${target.name}" integrity check passed, skipping full sync`)
              }
              continue
            }
            
            if (debug) {
              api.log(`[sync] Target "${target.name}" needs re-sync due to integrity check failure`)
            }
          }

          // 確保目錄存在
          if (!fs.existsSync(targetRoot)) {
            fs.mkdirSync(targetRoot, { recursive: true })
          }

          const apiUrl = new URL(target.remoteAddress)
          const serverAvailable = await checkServerAvailable(apiUrl)
          
          if (!serverAvailable) {
            api.log(`[sync] Server unavailable for target "${target.name}" - will retry later`)
            continue
          }

          await retryFailedFiles(targetRoot, target)

          if (debug) {
            const syncState = loadSyncState(targetRoot, target.name)
            if (syncState.completedCount > 0) {
              api.log(`[sync] Processing target: ${target.name} -> ${targetRoot} (${syncState.completedCount} dirs completed)`)
            } else {
              api.log(`[sync] Processing target: ${target.name} -> ${targetRoot}`)
            }
          }

          await processTarget(target, targetRoot)

        } catch (error) {
          api.log(`[error] Failed to process target "${target.name}": ${error.message}`)
        }
      }

      const elapsedTime = (Date.now() - syncStartTime) / 1000

      if (debug) {
        api.log(`[sync] All targets sync completed in ${elapsedTime.toFixed(2)} seconds`)
      }

      lastSyncTime = Date.now()

    } catch (err) {
      api.log(`[error] Sync failed: ${err.message}`)
    } finally {
      isSyncing = false
    }
  }

  const checkSync = async () => {
    if (!api.getConfig('enableSync')) {
      return
    }

    const interval = api.getConfig('syncInterval')
    
    if (interval !== currentInterval) {
      currentInterval = interval
    }
    
    if (currentInterval <= 0) return

    const now = Date.now()
    const intervalMs = currentInterval * 60 * 1000
    
    if (lastSyncTime === 0 || (now - lastSyncTime) >= intervalMs) {
      await runSync()
    }
  }

  const checkIncompleteSyncs = async () => {
    const debug = api.getConfig('debug')
    const syncTargets = api.getConfig('syncTargets') || []

    for (const target of syncTargets) {
      if (!target.localDestination) continue

      const targetRoot = target.localDestination
      const syncState = loadSyncState(targetRoot, target.name)
      
      if (syncState.currentQueue && syncState.currentQueue.length > 0) {
        api.log(`[sync] Found incomplete sync for "${target.name}": ${syncState.completedCount}/${syncState.totalDirs} dirs completed`)
      }
    }
  }

  syncTimer = api.setInterval(() => {
    checkSync().catch(err => {
      api.log(`[error] Sync check failed: ${err.message}`)
    })
  }, 60 * 1000)

  if (api.getConfig('enableSync')) {
    checkIncompleteSyncs().catch(err => {
      api.log(`[error] Failed to check incomplete syncs: ${err.message}`)
    })
    
    setTimeout(() => {
      runSync().catch(err => {
        api.log(`[error] Initial sync failed: ${err.message}`)
      })
    }, 3000)
  }

  return {
    unload() {
      if (syncTimer) {
        clearInterval(syncTimer)
        syncTimer = null
      }
    },
    
    customRest: {
      async manualSync() {
        if (!api.getConfig('enableSync')) {
          return { error: 'Sync is disabled. Please enable it in settings first.' }
        }
        await runSync()
        return { message: 'Manual sync triggered' }
      },

      async getSyncStatus() {
        const syncTargets = api.getConfig('syncTargets') || []
        const interval = api.getConfig('syncInterval')
        const mirrorMode = api.getConfig('mirrorMode')
        const enableSync = api.getConfig('enableSync')
        
        const nextSync = lastSyncTime > 0 && interval > 0 && enableSync
          ? new Date(lastSyncTime + interval * 60 * 1000).toISOString()
          : 'Not scheduled'

        const targetsStatus = []
        for (const target of syncTargets) {
          if (!target.localDestination) continue
          
          const rootManifest = loadDirectoryManifest(target.localDestination, target.name)
          const syncState = loadSyncState(target.localDestination, target.name)
          const globalState = loadGlobalState(target.localDestination)
          
          const isCompleted = globalState.completedTargets && globalState.completedTargets[target.name]
          
          if (rootManifest) {
            targetsStatus.push({
              name: target.name,
              destination: target.localDestination,
              priority: target.priority !== undefined ? target.priority : 1,
              priorityPatterns: target.priorityPatterns || '*.mp4,*.mkv,*.avi,*.jpg,*.png,*.pdf',
              totalDirs: syncState.totalDirs || rootManifest.stats.totalDirs || 0,
              totalFiles: rootManifest.stats.totalFiles || 0,
              totalSize: rootManifest.stats.totalSize || 0,
              syncedDirs: syncState.completedCount || rootManifest.stats.syncedDirs || 0,
              syncedFiles: rootManifest.stats.syncedFiles || 0,
              syncedSize: rootManifest.stats.syncedSize || 0,
              skippedFiles: rootManifest.stats.skippedFiles || 0,
              lastSync: rootManifest.lastSuccessfulSync,
              pendingDirs: syncState.currentQueue ? syncState.currentQueue.length : 0,
              hasPendingWork: syncState.currentQueue && syncState.currentQueue.length > 0,
              isCompleted: !!isCompleted
            })
          } else {
            targetsStatus.push({
              name: target.name,
              destination: target.localDestination,
              priority: target.priority !== undefined ? target.priority : 1,
              priorityPatterns: target.priorityPatterns || '*.mp4,*.mkv,*.avi,*.jpg,*.png,*.pdf',
              status: 'not_scanned'
            })
          }
        }
        
        return {
          enableSync: enableSync,
          lastSyncTime: lastSyncTime > 0 ? new Date(lastSyncTime).toISOString() : 'Never',
          nextSyncTime: nextSync,
          interval: interval,
          enabled: interval > 0 && enableSync,
          mirrorMode: mirrorMode,
          targets: targetsStatus,
          isSyncing: isSyncing,
          syncDuration: isSyncing ? ((Date.now() - syncStartTime) / 1000).toFixed(1) + 's' : null
        }
      },

      async getFailedFiles({ targetName }) {
        const syncTargets = api.getConfig('syncTargets') || []
        const target = syncTargets.find(t => t.name === targetName)
        
        if (!target) {
          return { error: 'Target not found' }
        }
        
        if (!target.localDestination || !fs.existsSync(target.localDestination)) {
          return { error: 'Target destination not found' }
        }
        
        const failedQueue = loadFailedQueue(target.localDestination, targetName)
        return {
          target: targetName,
          files: failedQueue.files,
          total: failedQueue.files.length
        }
      },

      async getSyncState({ targetName }) {
        const syncTargets = api.getConfig('syncTargets') || []
        const target = syncTargets.find(t => t.name === targetName)
        
        if (!target) {
          return { error: 'Target not found' }
        }
        
        if (!target.localDestination || !fs.existsSync(target.localDestination)) {
          return { error: 'Target destination not found' }
        }
        
        const syncState = loadSyncState(target.localDestination, targetName)
        const globalState = loadGlobalState(target.localDestination)
        
        return {
          target: targetName,
          state: syncState,
          completed: globalState.completedTargets && globalState.completedTargets[targetName]
        }
      },

      async clearSyncState({ targetName }) {
        const syncTargets = api.getConfig('syncTargets') || []
        const target = syncTargets.find(t => t.name === targetName)
        
        if (!target) {
          return { error: 'Target not found' }
        }
        
        if (!target.localDestination) {
          return { error: 'Target destination not found' }
        }
        
        clearSyncState(target.localDestination, targetName)
        
        const globalState = loadGlobalState(target.localDestination)
        if (globalState.completedTargets) {
          delete globalState.completedTargets[targetName]
        }
        saveGlobalState(target.localDestination, globalState)
        
        return { message: `Sync state cleared for ${targetName}` }
      },

      async resetTargetCompletion({ targetName }) {
        const syncTargets = api.getConfig('syncTargets') || []
        const target = syncTargets.find(t => t.name === targetName)
        
        if (!target) {
          return { error: 'Target not found' }
        }
        
        if (!target.localDestination) {
          return { error: 'Target destination not found' }
        }
        
        const globalState = loadGlobalState(target.localDestination)
        if (globalState.completedTargets) {
          delete globalState.completedTargets[targetName]
        }
        saveGlobalState(target.localDestination, globalState)
        
        return { message: `Target completion status reset for ${targetName}` }
      },

      async getDirectoryManifest({ targetName, dirPath = '' }) {
        const syncTargets = api.getConfig('syncTargets') || []
        const target = syncTargets.find(t => t.name === targetName)
        
        if (!target) {
          return { error: 'Target not found' }
        }
        
        if (!target.localDestination || !fs.existsSync(target.localDestination)) {
          return { error: 'Target destination not found' }
        }

        const fullPath = path.join(target.localDestination, dirPath)
        const manifest = loadDirectoryManifest(fullPath, targetName)
        
        if (!manifest) {
          return { error: 'Manifest not found for this directory' }
        }
        
        return {
          path: dirPath || '/',
          ...manifest
        }
      },

      async quickScan({ targetName, dirPath = '' }) {
        const syncTargets = api.getConfig('syncTargets') || []
        const target = syncTargets.find(t => t.name === targetName)
        
        if (!target) {
          return { error: 'Target not found' }
        }
        
        if (!target.localDestination || !fs.existsSync(target.localDestination)) {
          return { error: 'Target destination not found' }
        }

        const fullPath = path.join(target.localDestination, dirPath)
        const manifest = loadDirectoryManifest(fullPath, targetName)
        
        if (!manifest) {
          return { error: 'Manifest not found for this directory' }
        }

        const result = quickScanDirectory(fullPath, targetName, manifest)
        
        return {
          target: targetName,
          path: dirPath || '/',
          missingFiles: result.missingFiles.length,
          extraFiles: result.extraFiles.length,
          details: result
        }
      },

      async resetSync({ targetName }) {
        const syncTargets = api.getConfig('syncTargets') || []
        const target = syncTargets.find(t => t.name === targetName)
        
        if (!target) {
          return { error: 'Target not found' }
        }
        
        if (!target.localDestination || !fs.existsSync(target.localDestination)) {
          return { error: 'Target destination not found' }
        }
        
        const removeAllManifests = (dir) => {
          if (!fs.existsSync(dir)) return
          
          const files = fs.readdirSync(dir)
          for (const file of files) {
            const filePath = path.join(dir, file)
            const stat = fs.statSync(filePath)
            
            if (file.startsWith('sync.') && file.endsWith('.json')) {
              fs.unlinkSync(filePath)
            } else if (stat.isDirectory()) {
              removeAllManifests(filePath)
            }
          }
        }
        
        removeAllManifests(target.localDestination)
        
        return { message: `Sync reset completed for ${targetName}` }
      },

      async testTarget({ targetName }) {
        const syncTargets = api.getConfig('syncTargets') || []
        const target = syncTargets.find(t => t.name === targetName)
        
        if (!target) {
          return { error: 'Target not found' }
        }
        
        try {
          const apiUrl = new URL(target.remoteAddress)
          const serverAvailable = await checkServerAvailable(apiUrl)
          
          if (!serverAvailable) {
            return { error: 'Server unavailable' }
          }
          
          const fileList = await getRemoteFileList(target.remoteAddress, target.name, api)
          
          const dirs = fileList.filter(item => item.n.endsWith('/')).length
          const files = fileList.length - dirs
          
          return {
            success: true,
            target: targetName,
            destination: target.localDestination,
            dirs: dirs,
            files: files,
            total: fileList.length
          }
        } catch (error) {
          return { error: error.message }
        }
      },

      async setTraceMode({ enabled }) {
        const config = api.getConfig()
        config.traceDebug = enabled
        api.log(`[sync] Trace mode ${enabled ? 'enabled' : 'disabled'}`)
        return { message: `Trace mode ${enabled ? 'enabled' : 'disabled'}` }
      },

      // 新增：獲取優先文件統計
      async getPriorityStats({ targetName }) {
        const syncTargets = api.getConfig('syncTargets') || []
        const target = syncTargets.find(t => t.name === targetName)
        
        if (!target) {
          return { error: 'Target not found' }
        }
        
        if (!target.localDestination || !fs.existsSync(target.localDestination)) {
          return { error: 'Target destination not found' }
        }

        const priorityPatterns = (target.priorityPatterns || '*.mp4,*.mkv,*.avi,*.jpg,*.png,*.pdf')
          .split(',')
          .map(p => p.trim())
          .filter(p => p.length > 0)

        // 掃描所有 manifest 收集優先文件統計
        const collectPriorityStats = (dir) => {
          if (!fs.existsSync(dir)) return { total: 0, pending: 0, completed: 0 }
          
          let stats = { total: 0, pending: 0, completed: 0 }
          const manifest = loadDirectoryManifest(dir, targetName)
          
          if (manifest && manifest.files) {
            for (const file of manifest.files) {
              if (file.isPriority || matchesPriorityPattern(file.name, priorityPatterns)) {
                stats.total++
                if (file.status === 'completed') {
                  stats.completed++
                } else if (file.status === 'pending' || file.status === 'downloading') {
                  stats.pending++
                }
              }
            }
          }
          
          // 遞迴子目錄
          if (manifest && manifest.subDirs) {
            for (const subDir of manifest.subDirs) {
              const subStats = collectPriorityStats(path.join(dir, subDir.name))
              stats.total += subStats.total
              stats.pending += subStats.pending
              stats.completed += subStats.completed
            }
          }
          
          return stats
        }

        const priorityStats = collectPriorityStats(target.localDestination)
        
        return {
          target: targetName,
          patterns: priorityPatterns,
          stats: priorityStats,
          completion: priorityStats.total > 0 
            ? Math.round((priorityStats.completed / priorityStats.total) * 100) 
            : 0
        }
      }
    }
  }
}