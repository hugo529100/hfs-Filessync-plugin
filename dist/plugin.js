exports.version = 6.5
exports.description = "Sync folders from remote HFS3 servers with dual-list verification, incremental download, and optional slime mold optimization for dynamic scan scheduling. Supports scheduled windows, priority downloads, filters, checkpoint resume, and access-triggered heating."
exports.apiRequired = 10
exports.repo = "Hug3O/Filessync-plugin"

exports.config = {
    aria2Path: {
    type: 'real_path',
    fileMask: 'aria2c.exe',
    defaultValue: 'aria2c.exe',
    label: 'Aria2c Path',
    helperText: 'Path to aria2c executable.'
  },
  enableSync: {
    type: 'boolean',
    defaultValue: false,
    label: 'Enable Synchronization',
    helperText: 'Master switch to enable/disable all sync operations',
    xs: 6
  },
  enableScheduledSync: {
    type: 'boolean',
    defaultValue: false,
    label: 'Enable Scheduled Sync',
    helperText: 'Enable time-based scheduling for sync operations',
    xs: 6
  },
  syncStartTime: {
    type: 'string',
    defaultValue: '00:30',
    label: 'Sync Start Time',
    helperText: 'Start time for sync (HH:MM format, e.g., 00:30 for 12:30 AM)',
    showIf: x => x.enableScheduledSync,
    xs: 6,
    when: config => config.enableScheduledSync === true
  },
  syncEndTime: {
    type: 'string',
    defaultValue: '08:30',
    label: 'Sync End Time',
    helperText: 'End time for sync (HH:MM format, e.g., 08:30 for 8:30 AM)',
    showIf: x => x.enableScheduledSync,
    xs: 6,
    when: config => config.enableScheduledSync === true
  },



  syncTargets: {
    type: 'array',
    label: 'Sync Targets',
    helperText: 'Add multiple remote folders to sync. Each target mirrors remote structure exactly.',
    default: [],
    fields: {
      enabled: {
        type: 'boolean',
        label: 'Enable this target',
        defaultValue: true,
        xs: 12
      },
      name: {
        type: 'string',
        label: 'Target Name',
        helperText: 'A unique name for this sync target',
        required: true,
        xs: 12
      },
      remoteAddress: {
        type: 'string',
        label: 'Remote URL',
        helperText: 'Full URL of the remote folder, e.g., http://192.168.1.224/h/Patch/',
        required: true,
        xs: 12
      },
      username: {
        type: 'string',
        label: 'Username',
        helperText: 'Username for HTTP authentication',
        xs: 6,
        required: false
      },
      password: {
        type: 'password',
        label: 'Password',
        helperText: 'Password for HTTP authentication',
        xs: 6,
        required: false
      },
      localDestination: {
        type: 'real_path',
        fileMask: '',
        folders: true,
        files: false,
        label: 'Local Destination',
        helperText: 'Local folder to sync to (will be mirrored exactly to remote)',
        defaultValue: '',
        required: true,
        xs: 6
      },
      syncInterval: {
        type: 'number',
        label: 'Sync Interval (days)',
        defaultValue: 3,
        helperText: 'Minimum days between sync cycles for this target',
        xs: 6,
        min: 0,
        max: 365
      },
      priorityPatterns: {
        type: 'text',
        label: 'Priority Download Patterns',
        defaultValue: '*.htm,*.html,*.js,*.css,*.ttf,*.woff',
        helperText: 'Comma-separated patterns (supports * wildcard) to download first',
        xs: 6
      },
      allowedExtensions: {
        type: 'text',
        label: 'Allowed Extensions (Whitelist)',
        defaultValue: '',
        helperText: 'Leave empty to download all. Comma-separated extensions to download ONLY (e.g., mp4,jpg,png). Non-matching files will be skipped.',
        xs: 6
      },
      excludeFiles: {
        type: 'text',
        label: 'Exclude Extensions',
        defaultValue: 'tmp,log,bak,swp,cache,part',
        helperText: 'Comma-separated file extensions to skip',
        xs: 6
      },
      excludeFolders: {
        type: 'text',
        label: 'Exclude Folders',
        defaultValue: 'cache,temp,node_modules,.git,.svn,__pycache__',
        helperText: 'Comma-separated folder names to exclude',
        xs: 6
      }

    }
  },


  exploreConcurrency: {
    type: 'number',
    label: 'Explore Concurrency',
    defaultValue: 1,
    helperText: 'Simultaneous directory scans. HDD: 1-2. SSD: 4-8.',
    xs: 6,
    min: 1,
    max: 16
  },
  concurrentDownloads: {
    type: 'number',
    label: 'Concurrent Downloads',
    defaultValue: 1,
    helperText: 'Files downloaded in parallel. HDD: 1. SSD: 2-4.',
    xs: 6,
    min: 1,
    max: 16
  },
  fileDelay: {
    type: 'number',
    label: 'Delay between files (ms)',
    defaultValue: 200,
    helperText: 'Time to wait between processing each file and directory scan.',
    xs: 6,
    min: 50,
    max: 10000
  },
  speedLimit: {
    type: 'number',
    label: 'Speed Limit (KB/s)',
    defaultValue: 0,
    helperText: 'Maximum transfer speed (0 = unlimited)',
    xs: 6,
    min: 0
  },
  maxRetries: {
    type: 'number',
    label: 'Max Retries',
    defaultValue: 3,
    helperText: 'Maximum number of retry attempts on network failure',
    xs: 6,
    min: 1,
    max: 20
  },
  retryDelay: {
    type: 'number',
    label: 'Retry Delay (seconds)',
    defaultValue: 5,
    helperText: 'Delay between retry attempts',
    xs: 6,
    min: 1,
    max: 300
  },
  checkpointInterval: {
    type: 'number',
    label: 'Checkpoint Interval (seconds)',
    defaultValue: 30,
    helperText: 'How often to save sync progress checkpoint. Lower values = better resume capability but more disk writes.',
    min: 20,
    max: 600
  },
    // ========== 全局挂载探测配置 ==========
  mountProbeThreshold: {
    type: 'number',
    defaultValue: 80,
    label: 'Mount Probe Threshold (%)',
    helperText: 'Percentage of empty probe paths required to trigger unmount detection (50-100). Lower = more sensitive.',
    xs: 6,
    min: 50,
    max: 100
  },
  mountProbeMinPaths: {
    type: 'number',
    defaultValue: 3,
    label: 'Min Probe Paths',
    helperText: 'Minimum number of paths to probe before making a decision (2-10).',
    xs: 6,
    min: 2,
    max: 10
  },


  // ========== 全局黏菌配置 ==========
  enableSlimeMold: {
    type: 'boolean',
    defaultValue: false,
    label: 'Enable Slime Mold Optimization',
    helperText: 'Dynamically adjusts scan frequency based on file change patterns. Continuously writes small .slime_mold.json files and performs lightweight remote checks — may slightly increase server load and disk I/O. The scan rhythm is governed by the global "Slime Mold Check Interval" setting.',
  },
  enableSynapse: {
    type: 'boolean',
    defaultValue: true,
    label: 'Enable Slime Synapse',
    helperText: 'Heat slime mold when frontend accesses files in any target.',
    showIf: x => x.enableSlimeMold, 
    when: config => config.enableSlimeMold === true
  },
  synapseCooldown: {
    type: 'number',
    label: 'Synapse Cooldown (minutes)',
    defaultValue: 10,
    helperText: 'Minimum time between synapse-triggered syncs (1-60 minutes)',
    showIf: x => x.enableSlimeMold,
    xs: 6,
    min: 1,
    max: 60,
    when: config => config.enableSlimeMold === true
  },
  slimeMoldCheckInterval: {
    type: 'number',
    label: 'Slime Mold Check Interval (seconds)',
    defaultValue: 300,
    helperText: 'How often the slime mold algorithm checks heat levels and decides on extra scans. Lower values = more responsive but more disk I/O.',
    xs: 6,
    min: 10,
    max: 6000,
    showIf: x => x.enableSlimeMold,
    when: config => config.enableSlimeMold === true
  },
    debug: {
    type: 'boolean',
    defaultValue: false,
    label: 'Debug Mode',
    helperText: 'Show sync summary with detailed logs',
  },
    verboseDebug: {
    type: 'boolean',
    defaultValue: false,
    label: 'Verbose Debug',
    helperText: 'Show per-directory sync status',
    showIf: x => x.debug,
    xs: 6,
    when: config => config.debug === true
  },
},

exports.init = api => {
  const { exec } = require('child_process')
  const path = require('path')
  const fs = require('fs')
  const { promisify } = require('util')
  const execAsync = promisify(exec)

  let syncTimer = null
  let isSyncing = false
  let syncStartTime = 0
  let scheduledSyncTimer = null
  let windowCheckTimer = null
  let isInScheduledWindow = false
  let lastWindowLogTime = 0
  const WINDOW_LOG_INTERVAL = 60 * 60 * 1000
  let shouldStopSync = false
  let checkpointTimer = null
  let slimeMoldCheckTimer = null

  const targetLastScanTime = {}
  const synapseCooldowns = {}
  const pendingSynapseTriggers = {}

  const MANIFEST_VERSION = '5.11'
  const MANIFEST_SIGNATURE = 'dual_list_v1'
  const NODE_FILE = '.sync_node.json'
  const FAILED_FILE_PREFIX = '.sync_failed_'
  const GLOBAL_STATE_FILE = '.sync_global_state.json'
  const SLIME_MOLD_FILE = '.slime_mold.json'
  const SLIME_NETWORK_FILE = '.slime_network.json'

  const SYNAPSE_MERGE_WINDOW_MS = 5000
  const DEFAULT_TIMESTAMP_TOLERANCE = 2
  const MAX_EXTRA_SCANS_PER_CYCLE = 5
  const MAX_HEAT_HISTORY = 20
  const MIN_HEAT_FOR_ACTION = 15
  const DECAY_MINIMUM = 0.1

  // ========== 全局配置读取函数 ==========

  const getEnableSlimeMold = () => api.getConfig('enableSlimeMold') || false
  const getEnableSynapse = () => api.getConfig('enableSynapse') !== false
  const getSynapseCooldown = () => {
    const val = api.getConfig('synapseCooldown')
    return (val && val >= 1 && val <= 60) ? val : 10
  }
  const getMountProbeThreshold = () => {
    const val = api.getConfig('mountProbeThreshold')
    return (val && val >= 50 && val <= 100) ? val / 100 : 0.8
  }
  const getMountProbeMinPaths = () => {
    const val = api.getConfig('mountProbeMinPaths')
    return (val && val >= 2 && val <= 10) ? val : 3
  }

  const getSlimeMoldCheckIntervalMs = () => {
    const sec = api.getConfig('slimeMoldCheckInterval')
    return (sec && sec >= 10 && sec <= 600) ? sec * 1000 : 60 * 1000
  }

  const getCheckpointIntervalMs = () => {
    const sec = api.getConfig('checkpointInterval')
    return (sec && sec >= 30 && sec <= 600) ? sec * 1000 : 120 * 1000
  }

  const SIZE_ONLY_EXTENSIONS = new Set([
    'mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v', 'mpg', 'mpeg', '3gp', '3g2', 'ogv', 'ts', 'vob', 'rm', 'rmvb',
    'mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'opus', 'ape', 'alac', 'aiff', 'mid', 'midi',
    'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico', 'tiff', 'tif', 'raw', 'psd', 'ai', 'eps', 'heic', 'heif',
    'zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'iso', 'cab', 'arj', 'lzh',
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp',
    'db', 'sqlite', 'sqlite3', 'mdb', 'accdb',
    'ttf', 'otf', 'woff', 'woff2', 'eot',
    'bin', 'dat', 'pak', 'wad', 'bsp', 'unity3d', 'asset', 'assets'
  ])

  const DUAL_VERIFY_EXTENSIONS = new Set([
    'js', 'ts', 'jsx', 'tsx', 'py', 'rb', 'php', 'pl', 'sh', 'bash', 'ps1', 'bat', 'cmd', 'vbs',
    'html', 'htm', 'xhtml', 'shtml', 'asp', 'aspx', 'jsp', 'php', 'css', 'scss', 'sass', 'less',
    'exe', 'dll', 'so', 'dylib', 'sys', 'drv', 'ocx',
    'xml', 'json', 'yaml', 'yml', 'ini', 'cfg', 'conf', 'config', 'toml',
    'c', 'cpp', 'h', 'hpp', 'cs', 'java', 'go', 'rs', 'swift', 'kt', 'lua', 'r', 'm', 'mm',
    'pem', 'crt', 'key', 'cer', 'der', 'p12', 'pfx',
    'patch', 'diff'
  ])

  const ILLEGAL_FILENAME_CHARS = /[<>:"/\\|?*]/g

  const encodeURIComponentSafe = (str) => {
    return encodeURIComponent(str)
      .replace(/!/g, '%21')
      .replace(/'/g, '%27')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
      .replace(/\*/g, '%2A')
      .replace(/~/g, '%7E')
  }

  const getNodeFilePath = (dirPath) => path.join(dirPath, NODE_FILE)
  const getFailedQueuePath = (targetRoot, targetName) => {
    const safeName = (targetName || 'unknown').replace(/[<>:"/\\|?*]/g, '_')
    return path.join(targetRoot, `${FAILED_FILE_PREFIX}${safeName}.json`)
  }
  const getIndexFilePath = (targetRoot, targetName) => {
    const safeName = (targetName || 'unknown').replace(/[<>:"/\\|?*]/g, '_')
    return path.join(targetRoot, `.sync_${safeName}_index.json`)
  }
  const getGlobalStatePath = (targetRoot) => path.join(targetRoot, GLOBAL_STATE_FILE)
  const getSlimeMoldPath = (dirPath) => path.join(dirPath, SLIME_MOLD_FILE)
  const getSlimeNetworkPath = (targetRoot) => path.join(targetRoot, SLIME_NETWORK_FILE)

  const isSyncMetaFile = (filename) => {
    return filename === NODE_FILE || filename.startsWith(FAILED_FILE_PREFIX) ||
           filename.startsWith('.sync_') || filename === GLOBAL_STATE_FILE ||
           filename === SLIME_MOLD_FILE || filename === SLIME_NETWORK_FILE
  }

  const logDebug = (msg) => { if (api.getConfig('debug')) api.log(msg) }
  const logVerbose = (msg) => { if (api.getConfig('verboseDebug')) api.log(msg) }
  const logError = (msg) => { if (api.getConfig('debug')) api.log(`[error] ${msg}`) }

  // ========== 远程挂载探测（基于大规模消失模式） ==========

  // 从本地获取已知子目录
  const getKnownSubDirsFromLocal = (targetRoot) => {
    const subDirs = []
    try {
      const rootNode = loadNodeFile(targetRoot)
      if (rootNode?.childrenNames && rootNode.childrenNames.length > 0) {
        return rootNode.childrenNames.slice(0, 10)
      }
      if (fs.existsSync(targetRoot)) {
        const entries = fs.readdirSync(targetRoot, { withFileTypes: true })
        for (const entry of entries) {
          if (entry.isDirectory() && !isSyncMetaFile(entry.name) && !entry.name.startsWith('.')) {
            subDirs.push(entry.name)
          }
        }
      }
    } catch (e) {}
    return subDirs.slice(0, 10)
  }

  // 获取历史文件数量记录
  const getHistoricalFileCounts = (targetRoot) => {
    const counts = {}
    try {
      const globalState = loadGlobalSyncState(targetRoot)
      if (globalState?.historicalCounts) {
        return globalState.historicalCounts
      }
    } catch (e) {}
    return counts
  }

  // 更新历史文件数量记录
  const updateHistoricalCounts = (targetRoot, remoteList) => {
    try {
      const globalState = loadGlobalSyncState(targetRoot)
      if (!globalState) return
      if (!globalState.historicalCounts) globalState.historicalCounts = {}

      const files = remoteList?.files || {}
      const totalFiles = Object.keys(files).length
      if (totalFiles > 0 || globalState.historicalCounts['/']) {
        globalState.historicalCounts['/'] = totalFiles
      }

      const subDirs = remoteList?.subDirs || {}
      for (const [dirName] of Object.entries(subDirs)) {
        if (!globalState.historicalCounts[dirName]) {
          globalState.historicalCounts[dirName] = 0
        }
      }

      saveGlobalSyncState(targetRoot, globalState)
    } catch (e) {}
  }

  const updateSubDirHistoricalCount = (targetRoot, subDirPath, fileCount) => {
    try {
      const globalState = loadGlobalSyncState(targetRoot)
      if (!globalState) return
      if (!globalState.historicalCounts) globalState.historicalCounts = {}
      const key = subDirPath.replace(/^\//, '') || '/'
      globalState.historicalCounts[key] = fileCount
      saveGlobalSyncState(targetRoot, globalState)
    } catch (e) {}
  }

  // 基于大规模消失模式的挂载探测
  const probeRemoteMountByPattern = async (target, targetRoot) => {
    const targetName = target.name
    const username = target.username
    const password = target.password
    const apiUrl = new URL(target.remoteAddress)
    const baseUrl = `${apiUrl.protocol}//${apiUrl.host}`
    const remoteRootPath = apiUrl.pathname

    const probeThreshold = getMountProbeThreshold()
    const minPaths = getMountProbeMinPaths()

    const pathsToProbe = []

    // 1. 目标目录本身
    pathsToProbe.push({ path: '', label: 'target' })

    // 2. 从本地获取已知子目录
    const knownSubDirs = getKnownSubDirsFromLocal(targetRoot)
    for (const subDir of knownSubDirs.slice(0, 5)) {
      pathsToProbe.push({ path: subDir, label: 'subdir' })
    }

    // 3. 尝试探测一些常见的同级目录
    const pathSegments = remoteRootPath.replace(/\/+$/, '').split('/').filter(p => p)
    if (pathSegments.length > 0) {
      const currentDir = pathSegments[pathSegments.length - 1]
      const siblingCandidates = [
        currentDir + '_bak',
        currentDir + '_backup',
        currentDir + '_old',
        'backup_' + currentDir,
        'archive_' + currentDir
      ]
      for (const candidate of siblingCandidates.slice(0, 3)) {
        pathsToProbe.push({ path: candidate, label: 'sibling' })
      }
    }

    // 去重
    const uniquePaths = []
    const seen = new Set()
    for (const item of pathsToProbe) {
      const key = item.path
      if (!seen.has(key)) {
        seen.add(key)
        uniquePaths.push(item)
      }
    }

    logDebug(`[${targetName}] Mount probe: checking ${uniquePaths.length} paths`)

    const probeResults = []
    for (const item of uniquePaths) {
      try {
        const exploreUrl = buildExploreUrl(baseUrl, remoteRootPath, item.path)
        const fileList = await getRemoteFileList(exploreUrl, targetName, username, password)
        const files = fileList.filter(f => !f.n?.endsWith('/'))
        const dirs = fileList.filter(f => f.n?.endsWith('/'))
        const totalCount = files.length + dirs.length
        probeResults.push({
          path: item.path,
          label: item.label,
          fileCount: files.length,
          dirCount: dirs.length,
          totalCount: totalCount,
          success: true,
          hasContent: totalCount > 0
        })
        logVerbose(`[verbose] [${targetName}] Probe ${item.path || '/'}: ${totalCount} items`)
      } catch (error) {
        probeResults.push({
          path: item.path,
          label: item.label,
          success: false,
          error: error.message,
          totalCount: 0,
          hasContent: false
        })
      }
    }

    return analyzeProbeResults(probeResults, targetRoot, target, probeThreshold, minPaths)
  }

  const analyzeProbeResults = (probeResults, targetRoot, target, probeThreshold, minPaths) => {
    const targetName = target.name
    const successfulProbes = probeResults.filter(r => r.success)

    if (successfulProbes.length === 0) {
      return {
        mounted: null,
        reason: 'No probe paths accessible',
        details: { probeResults }
      }
    }

    const emptyOrNearEmpty = successfulProbes.filter(r => r.totalCount === 0 || r.totalCount <= 2)
    const emptyRatio = emptyOrNearEmpty.length / successfulProbes.length
    const nonEmptyProbes = successfulProbes.filter(r => r.totalCount > 2)

    logDebug(`[${targetName}] Probe analysis: ${emptyOrNearEmpty.length}/${successfulProbes.length} empty (${(emptyRatio * 100).toFixed(1)}%), threshold ${(probeThreshold * 100).toFixed(0)}%, min paths ${minPaths}`)

    // 情况1：超过阈值比例的路径为空
    if (emptyRatio >= probeThreshold && successfulProbes.length >= minPaths) {
      const historicalCounts = getHistoricalFileCounts(targetRoot)
      let hasHistoricalData = false
      let historicalFileCount = 0
      let currentFileCount = 0
      let pathsWithHistoricalData = 0

      for (const result of successfulProbes) {
        const key = result.path || '/'
        if (historicalCounts[key] !== undefined && historicalCounts[key] > 0) {
          hasHistoricalData = true
          historicalFileCount += historicalCounts[key]
          currentFileCount += result.totalCount
          pathsWithHistoricalData++
        }
      }

      if (hasHistoricalData && pathsWithHistoricalData >= Math.min(2, successfulProbes.length)) {
        const disappearanceRate = historicalFileCount > 0 ? 1 - (currentFileCount / historicalFileCount) : 1
        logDebug(`[${targetName}] Historical: ${historicalFileCount} -> ${currentFileCount}, disappearance: ${(disappearanceRate * 100).toFixed(1)}%`)

        if (disappearanceRate >= 0.9) {
          return {
            mounted: false,
            reason: `Massive file disappearance: ${(disappearanceRate * 100).toFixed(1)}% of files gone across ${pathsWithHistoricalData} paths`,
            details: { emptyRatio, historicalFileCount, currentFileCount, disappearanceRate, pathsWithHistoricalData, probeResults }
          }
        }

        if (emptyRatio === 1.0 && disappearanceRate >= 0.7) {
          return {
            mounted: false,
            reason: `All ${successfulProbes.length} probe paths empty with ${(disappearanceRate * 100).toFixed(1)}% historical file loss`,
            details: { emptyRatio, historicalFileCount, currentFileCount, disappearanceRate, probeResults }
          }
        }
      }

      if (emptyRatio === 1.0 && successfulProbes.length >= 5) {
        return {
          mounted: false,
          reason: `All ${successfulProbes.length} probe paths are empty - likely unmounted`,
          details: { emptyRatio, probeResults }
        }
      }

      if (emptyRatio >= 0.9 && nonEmptyProbes.length <= 1) {
        return {
          mounted: null,
          reason: `${emptyOrNearEmpty.length} paths empty, only ${nonEmptyProbes.length} path has content - suspicious`,
          details: { emptyRatio, probeResults }
        }
      }
    }

    // 情况2：有足够多的非空路径
    if (nonEmptyProbes.length >= 2 && emptyRatio < probeThreshold) {
      return {
        mounted: true,
        reason: `${nonEmptyProbes.length} paths have content, ${emptyOrNearEmpty.length} paths are empty (normal)`,
        details: { emptyRatio, probeResults }
      }
    }

    // 情况3：部分路径有内容，但空比例也高
    if (nonEmptyProbes.length > 0 && emptyRatio >= 0.5 && emptyRatio < probeThreshold) {
      return {
        mounted: null,
        reason: `Mixed results: ${nonEmptyProbes.length} paths have content, ${emptyOrNearEmpty.length} empty - uncertain`,
        details: { emptyRatio, probeResults }
      }
    }

    return {
      mounted: null,
      reason: 'Cannot determine mount status from probe results',
      details: { emptyRatio, probeResults }
    }
  }

  // ========== 黏菌算法相关函数 ==========

  const createSlimeNetwork = (targetName, targetRoot, syncIntervalDays) => {
    return {
      signature: MANIFEST_SIGNATURE,
      version: MANIFEST_VERSION,
      targetName,
      targetRoot,
      syncIntervalDays,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      totalSyncs: 0,
      extraScansThisCycle: 0,
      lastCycleReset: new Date().toISOString(),
      branches: {},
      hotPaths: []
    }
  }

  const createSlimeNode = (dirPath, relativePath, syncIntervalDays) => {
    return {
      signature: MANIFEST_SIGNATURE,
      version: MANIFEST_VERSION,
      path: relativePath,
      syncIntervalDays,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      heat: 0,
      maxHeatEver: 0,
      heatHistory: [],
      changeStats: {
        totalFiles: 0,
        changedFiles: 0,
        newFiles: 0,
        deletedFiles: 0,
        timestampFixed: 0,
        lastChange: null,
        changeRate: 0
      },
      scanCount: 0,
      extraScansTriggered: 0,
      lastScanTime: null,
      parentHeat: 0,
      childrenHeat: {}
    }
  }

  const calculateDecayRate = (syncIntervalDays, checkIntervalMs) => {
    const effectiveDays = Math.max(0.5, syncIntervalDays || 3)
    const totalChecks = Math.floor((effectiveDays * 24 * 60 * 60 * 1000) / checkIntervalMs)
    const targetResidual = 0.3
    const initialHeat = 100
    return Math.pow(targetResidual / initialHeat, 1 / Math.max(1, totalChecks))
  }

  const loadSlimeNetwork = (targetRoot) => {
    try {
      const networkPath = getSlimeNetworkPath(targetRoot)
      if (fs.existsSync(networkPath)) {
        const data = JSON.parse(fs.readFileSync(networkPath, 'utf8'))
        if (data.signature === MANIFEST_SIGNATURE && data.version === MANIFEST_VERSION) return data
      }
    } catch (e) {}
    return null
  }

  const saveSlimeNetwork = (targetRoot, network) => {
    try {
      network.signature = MANIFEST_SIGNATURE
      network.version = MANIFEST_VERSION
      network.lastUpdated = new Date().toISOString()
      fs.writeFileSync(getSlimeNetworkPath(targetRoot), JSON.stringify(network, null, 2))
    } catch (error) {
      logError(`Failed to save slime network: ${error.message}`)
    }
  }

  const loadSlimeNode = (dirPath) => {
    try {
      const nodePath = getSlimeMoldPath(dirPath)
      if (fs.existsSync(nodePath)) {
        const data = JSON.parse(fs.readFileSync(nodePath, 'utf8'))
        if (data.signature === MANIFEST_SIGNATURE && data.version === MANIFEST_VERSION) return data
      }
    } catch (e) {}
    return null
  }

  const saveSlimeNode = (dirPath, nodeData) => {
    try {
      nodeData.signature = MANIFEST_SIGNATURE
      nodeData.version = MANIFEST_VERSION
      nodeData.lastUpdated = new Date().toISOString()
      if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true })
      fs.writeFileSync(getSlimeMoldPath(dirPath), JSON.stringify(nodeData, null, 2))
    } catch (error) {
      logError(`Failed to save slime node: ${error.message}`)
    }
  }

  const decayHeatByTime = (nodeData, network, now) => {
    now = now || Date.now()
    if (!nodeData.lastUpdated) return nodeData.heat
    const syncIntervalDays = nodeData.syncIntervalDays || (network ? network.syncIntervalDays : 3)
    const decayRate = calculateDecayRate(syncIntervalDays, getSlimeMoldCheckIntervalMs())
    const lastUpdated = new Date(nodeData.lastUpdated).getTime()
    const elapsedChecks = Math.floor((now - lastUpdated) / getSlimeMoldCheckIntervalMs())
    if (elapsedChecks <= 0) return nodeData.heat
    const decayedHeat = nodeData.heat * Math.pow(decayRate, elapsedChecks)
    return Math.max(DECAY_MINIMUM, parseFloat(decayedHeat.toFixed(4)))
  }

  const updateSlimeHeat = (nodeData, changeCount, network) => {
    const now = new Date()
    const syncIntervalDays = nodeData.syncIntervalDays || (network ? network.syncIntervalDays : 3)
    const currentHeat = decayHeatByTime(nodeData, network || { syncIntervalDays }, now.getTime())
    let changeRate = 0
    const totalFiles = Math.max(1, nodeData.changeStats.totalFiles || 1)
    changeRate = changeCount / totalFiles
    let heatGain = 0
    if (changeCount > 0) {
      heatGain = Math.min(85, 15 + changeCount * 12)
      if (changeRate > 0.1) heatGain += 10
      if (changeRate > 0.3) heatGain += 15
      if (changeRate > 0.5) heatGain += 20
      if (nodeData.heatHistory && nodeData.heatHistory.length > 0) {
        const lastEntry = nodeData.heatHistory[nodeData.heatHistory.length - 1]
        if (lastEntry.changeCount > 0) heatGain += 15
      }
    } else {
      heatGain = 2
      if (currentHeat > 30) heatGain += 3
    }
    const newHeat = Math.min(100, currentHeat + heatGain)
    nodeData.changeStats.changeRate = parseFloat(changeRate.toFixed(4))
    nodeData.changeStats.lastChange = changeCount > 0 ? now.toISOString() : nodeData.changeStats.lastChange
    nodeData.changeStats.changedFiles = changeCount
    if (!nodeData.heatHistory) nodeData.heatHistory = []
    nodeData.heatHistory.push({
      time: now.toISOString(),
      heat: parseFloat(newHeat.toFixed(2)),
      changeCount,
      changeRate: parseFloat(changeRate.toFixed(4))
    })
    if (nodeData.heatHistory.length > MAX_HEAT_HISTORY) {
      nodeData.heatHistory = nodeData.heatHistory.slice(-MAX_HEAT_HISTORY)
    }
    nodeData.heat = parseFloat(newHeat.toFixed(2))
    if (newHeat > (nodeData.maxHeatEver || 0)) nodeData.maxHeatEver = parseFloat(newHeat.toFixed(2))
    nodeData.scanCount = (nodeData.scanCount || 0) + 1
    nodeData.lastScanTime = now.toISOString()
    nodeData.lastUpdated = now.toISOString()
    nodeData.syncIntervalDays = syncIntervalDays
    return nodeData
  }

  const getExtraScanTimes = (network) => {
    const syncIntervalDays = network.syncIntervalDays || 3
    const totalMs = syncIntervalDays * 24 * 60 * 60 * 1000
    const cycleStartTime = new Date(network.lastCycleReset).getTime()
    return Array.from({ length: MAX_EXTRA_SCANS_PER_CYCLE }, (_, i) => {
      const position = (i + 1) / (MAX_EXTRA_SCANS_PER_CYCLE + 1)
      const msFromStart = position * totalMs
      return {
        index: i,
        msFromStart: parseFloat(msFromStart.toFixed(0)),
        timestamp: cycleStartTime + msFromStart,
        heatThreshold: parseFloat((20 * Math.pow(0.8, i)).toFixed(1))
      }
    })
  }

  const shouldTriggerExtraScan = (network, relativePath, nodeData, baseIntervalDays) => {
    if (!network || !nodeData) return false
    if (network.extraScansThisCycle >= MAX_EXTRA_SCANS_PER_CYCLE) return false
    const currentHeat = decayHeatByTime(nodeData, network, Date.now())
    if (currentHeat < MIN_HEAT_FOR_ACTION) return false
    const extraScanTimes = getExtraScanTimes(network)
    const now = Date.now()
    for (const scanPoint of extraScanTimes) {
      if (now >= scanPoint.timestamp && currentHeat >= scanPoint.heatThreshold) {
        const branchData = network.branches[relativePath]
        if (branchData && branchData.lastExtraScanIndex >= scanPoint.index) continue
        const lastScanTime = nodeData.lastScanTime ? new Date(nodeData.lastScanTime).getTime() : 0
        const timeSinceLastScan = (now - lastScanTime) / (1000 * 60 * 60)
        const minInterval = Math.max(0.5, baseIntervalDays * 24 / (MAX_EXTRA_SCANS_PER_CYCLE + 2))
        if (timeSinceLastScan >= minInterval) return true
      }
    }
    return false
  }

  const resetSlimeCycle = (network) => {
    network.extraScansThisCycle = 0
    network.lastCycleReset = new Date().toISOString()
    for (const branchPath in network.branches) {
      network.branches[branchPath].lastExtraScanIndex = -1
    }
    for (const hotPath of network.hotPaths) {
      const node = loadSlimeNode(path.join(network.targetRoot, hotPath))
      if (node) {
        node.extraScansTriggered = 0
        node.lastUpdated = new Date().toISOString()
        saveSlimeNode(path.join(network.targetRoot, hotPath), node)
      }
    }
    logDebug(`[slime] [${network.targetName}] Cycle reset`)
    return network
  }

  const updateSlimeNetwork = (network, relativePath, changeCount, totalFiles) => {
    if (!network) return network
    if (!network.syncIntervalDays) network.syncIntervalDays = 3
    if (!network.branches[relativePath]) {
      network.branches[relativePath] = {
        path: relativePath,
        heat: 0,
        changeCount: 0,
        totalFiles: 0,
        lastChange: null,
        lastExtraScanIndex: -1
      }
    }
    const branch = network.branches[relativePath]
    const changeRate = totalFiles > 0 ? changeCount / totalFiles : 0
    const nodePath = relativePath ? path.join(network.targetRoot, relativePath) : network.targetRoot
    const slimeNode = loadSlimeNode(nodePath)
    branch.heat = slimeNode ? slimeNode.heat : parseFloat(Math.min(100, changeRate * 80 + 5).toFixed(2))
    branch.changeCount = changeCount
    branch.totalFiles = totalFiles
    if (changeCount > 0) branch.lastChange = new Date().toISOString()
    network.hotPaths = Object.entries(network.branches)
      .filter(([, b]) => b.heat > 10)
      .sort(([, a], [, b]) => b.heat - a.heat)
      .map(([p]) => p)
      .slice(0, 15)
    network.totalSyncs = (network.totalSyncs || 0) + 1
    return network
  }

  const checkSlimeMoldScans = async (target, targetRoot) => {
    if (!getEnableSlimeMold()) return
    const targetName = target.name
    const baseIntervalDays = target.syncInterval !== undefined ? target.syncInterval : 3
    let network = loadSlimeNetwork(targetRoot)
    if (!network) {
      network = createSlimeNetwork(targetName, targetRoot, baseIntervalDays)
      saveSlimeNetwork(targetRoot, network)
      logDebug(`[slime] [${targetName}] Created new network`)
      return
    }
    if (network.syncIntervalDays !== baseIntervalDays) network.syncIntervalDays = baseIntervalDays
    const cycleStartTime = new Date(network.lastCycleReset).getTime()
    const cycleDuration = baseIntervalDays * 24 * 60 * 60 * 1000
    if (Date.now() - cycleStartTime >= cycleDuration) network = resetSlimeCycle(network)
    let triggeredPaths = []
    for (const hotPath of network.hotPaths) {
      if (network.extraScansThisCycle >= MAX_EXTRA_SCANS_PER_CYCLE) break
      const nodePath = path.join(targetRoot, hotPath)
      let nodeData = loadSlimeNode(nodePath) || createSlimeNode(nodePath, hotPath, baseIntervalDays)
      if (shouldTriggerExtraScan(network, hotPath, nodeData, baseIntervalDays)) {
        triggeredPaths.push({ path: hotPath, node: nodeData })
        network.extraScansThisCycle++
        if (network.branches[hotPath]) {
          const extraScanTimes = getExtraScanTimes(network)
          for (let i = extraScanTimes.length - 1; i >= 0; i--) {
            if (Date.now() >= extraScanTimes[i].timestamp) {
              network.branches[hotPath].lastExtraScanIndex = extraScanTimes[i].index
              break
            }
          }
        }
      }
    }
    if (triggeredPaths.length === 0 && network.extraScansThisCycle < MAX_EXTRA_SCANS_PER_CYCLE) {
      const rootNode = loadSlimeNode(targetRoot) || createSlimeNode(targetRoot, '/', baseIntervalDays)
      if (shouldTriggerExtraScan(network, '/', rootNode, baseIntervalDays)) {
        triggeredPaths.push({ path: '/', node: rootNode })
        network.extraScansThisCycle++
      }
    }
    if (triggeredPaths.length > 0) {
      logDebug(`[slime] [${targetName}] Extra scans: ${triggeredPaths.map(p => p.path).join(', ')}`)
      for (const { path: scanPath } of triggeredPaths) {
        await slimeMoldLocalScan(target, targetRoot, scanPath, network)
      }
    }
    saveSlimeNetwork(targetRoot, network)
  }

  const slimeMoldLocalScan = async (target, targetRoot, relativePath, network) => {
    const targetName = target.name
    const baseIntervalDays = target.syncInterval !== undefined ? target.syncInterval : 3
    try {
      const localPath = relativePath === '/' ? targetRoot : path.join(targetRoot, relativePath)
      let nodeData = loadSlimeNode(localPath) || createSlimeNode(localPath, relativePath, baseIntervalDays)
      const apiUrl = new URL(target.remoteAddress)
      const exploreUrl = buildExploreUrl(`${apiUrl.protocol}//${apiUrl.host}`, apiUrl.pathname, relativePath)

      let fileList
      let remoteHealthy = true
      try {
        fileList = await getRemoteFileList(exploreUrl, targetName, target.username, target.password)

        if (fileList.length === 0) {
          const mountStatus = await probeRemoteMountByPattern(target, targetRoot)
          if (mountStatus.mounted === false) {
            logError(`[${targetName}] Slime scan: remote unmounted detected - ${mountStatus.reason}`)
            return
          }
          if (mountStatus.mounted === null) {
            logDebug(`[${targetName}] Slime scan: mount status uncertain, skipping deletion`)
            remoteHealthy = false
          }
        }

        if (fileList.length > 0 && fileList.length < 5) {
          const historical = getHistoricalFileCounts(targetRoot)
          const historicalCount = historical['/'] || 0
          if (historicalCount > 50 && fileList.length < historicalCount * 0.1) {
            const mountStatus = await probeRemoteMountByPattern(target, targetRoot)
            if (mountStatus.mounted === false) {
              logError(`[${targetName}] Slime scan: remote unmounted detected - ${mountStatus.reason}`)
              return
            }
          }
        }
      } catch (error) {
        logError(`[${targetName}] Slime scan failed to get remote list: ${error.message}`)
        return
      }

      const remoteFiles = {}
      const excludeSettings = getExcludeSettings(target)
      const allowedExtensions = getAllowedExtensions(target)
      for (const item of fileList) {
        if (!item?.n) continue
        const isDir = item.n.endsWith('/')
        const name = isDir ? item.n.slice(0, -1) : item.n
        if (!isDir && !shouldExcludeFile(name, excludeSettings.excludeFiles, allowedExtensions)) {
          remoteFiles[name] = { size: item.s || 0, mtime: item.m || null, ctime: item.c || null }
        }
      }
      const localScan = scanLocalDirectory(localPath, excludeSettings.excludeFiles, excludeSettings.excludeFolders, allowedExtensions)
      let changeCount = 0
      for (const [fileName, remoteInfo] of Object.entries(remoteFiles)) {
        const localInfo = localScan.files[fileName]
        if (!localInfo || localInfo.size !== remoteInfo.size) changeCount++
      }
      for (const fileName of Object.keys(localScan.files)) {
        if (!remoteFiles[fileName]) changeCount++
      }
      nodeData.changeStats.totalFiles = Object.keys(remoteFiles).length
      nodeData.changeStats.changedFiles = changeCount
      updateSlimeHeat(nodeData, changeCount, network)
      nodeData.extraScansTriggered = (nodeData.extraScansTriggered || 0) + 1
      saveSlimeNode(localPath, nodeData)
      logDebug(`[slime] [${targetName}] Scan '${relativePath || '/'}': ${changeCount} changes, heat:${nodeData.heat}, files:${Object.keys(remoteFiles).length}`)

      if (changeCount > 0 && remoteHealthy) {
        const comparison = compareListsForSlime(remoteFiles, localScan.files)
        for (const file of comparison.filesToDownload) {
          try {
            const fileRemotePath = relativePath === '/' ? file.name : `${relativePath}/${file.name}`
            await downloadWithAria2(buildDownloadUrl(target.remoteAddress, fileRemotePath), path.join(localPath, file.name), targetName, target.username, target.password, file.mtime, file.ctime)
            logDebug(`[slime] [${targetName}] Downloaded: ${file.name}`)
          } catch (error) { logDebug(`[slime] [${targetName}] Failed: ${file.name}`) }
        }
        for (const file of comparison.filesToDelete) {
          try {
            const filePath = path.join(localPath, file.name)
            if (fs.existsSync(filePath)) { fs.unlinkSync(filePath); logDebug(`[slime] [${targetName}] Deleted: ${file.name}`) }
          } catch (e) {}
        }
      }
    } catch (error) {
      logError(`[${targetName}] Slime scan failed '${relativePath}': ${error.message}`)
    }
  }

  const compareListsForSlime = (remoteFiles, localFiles) => {
    const filesToDownload = []
    const filesToDelete = []
    for (const [fileName, remoteInfo] of Object.entries(remoteFiles)) {
      const localInfo = localFiles[fileName]
      if (!localInfo || localInfo.size !== remoteInfo.size) {
        filesToDownload.push({ name: fileName, size: remoteInfo.size, mtime: remoteInfo.mtime, ctime: remoteInfo.ctime })
      }
    }
    for (const fileName of Object.keys(localFiles)) {
      if (!remoteFiles[fileName]) filesToDelete.push({ name: fileName })
    }
    return { filesToDownload, filesToDelete }
  }

  const updateSlimeAfterSync = (target, targetRoot, relativePath, comparison, nodeData) => {
    if (!getEnableSlimeMold()) return
    try {
      const localPath = relativePath ? path.join(targetRoot, relativePath) : targetRoot
      const baseIntervalDays = target.syncInterval !== undefined ? target.syncInterval : 3
      let slimeNode = loadSlimeNode(localPath) || createSlimeNode(localPath, relativePath || '/', baseIntervalDays)
      const changeCount = comparison.summary.filesToAdd + comparison.summary.filesToUpdate +
                          comparison.summary.filesToRemove + (comparison.summary.filesToFixTimestamp || 0)
      const totalFiles = Object.keys(nodeData?.remoteList?.files || comparison?.remoteList?.files || {}).length
      slimeNode.changeStats.totalFiles = totalFiles
      slimeNode.changeStats.changedFiles = changeCount
      let network = loadSlimeNetwork(targetRoot) || createSlimeNetwork(target.name, targetRoot, baseIntervalDays)
      updateSlimeHeat(slimeNode, changeCount, network)
      saveSlimeNode(localPath, slimeNode)
      updateSlimeNetwork(network, relativePath || '/', changeCount, totalFiles)
      saveSlimeNetwork(targetRoot, network)
    } catch (error) {
      logError(`[${target.name}] Slime update failed: ${error.message}`)
    }
  }

  // ========== 核心同步功能 ==========

  const needsDualVerification = (filename) => {
    const ext = path.extname(filename).toLowerCase().substring(1)
    if (DUAL_VERIFY_EXTENSIONS.has(ext)) return true
    if (SIZE_ONLY_EXTENSIONS.has(ext)) return false
    return true
  }

  const parseTimeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    return hours * 60 + minutes
  }

  const isWithinScheduledWindow = () => {
    const enableScheduledSync = api.getConfig('enableScheduledSync')
    if (!enableScheduledSync) return true
    const startTimeStr = api.getConfig('syncStartTime') || '00:30'
    const endTimeStr = api.getConfig('syncEndTime') || '08:30'
    const currentMinutes = new Date().getHours() * 60 + new Date().getMinutes()
    const startMinutes = parseTimeToMinutes(startTimeStr)
    const endMinutes = parseTimeToMinutes(endTimeStr)
    if (endMinutes <= startMinutes) return currentMinutes >= startMinutes || currentMinutes < endMinutes
    return currentMinutes >= startMinutes && currentMinutes < endMinutes
  }

  const createGlobalSyncState = (targetName, targetRoot) => ({
    signature: MANIFEST_SIGNATURE,
    version: MANIFEST_VERSION,
    targetName,
    targetRoot,
    state: 'idle',
    syncStartTime: null,
    syncEndTime: null,
    lastCheckpointTime: null,
    totalDirs: 0,
    processedDirs: 0,
    totalFiles: 0,
    downloadedFiles: 0,
    failedFiles: 0,
    timestampFixedFiles: 0,
    currentProcessingPath: null,
    completedDirs: [],
    errors: [],
    historicalCounts: {}
  })

  const loadGlobalSyncState = (targetRoot) => {
    try {
      const statePath = getGlobalStatePath(targetRoot)
      if (fs.existsSync(statePath)) {
        const data = JSON.parse(fs.readFileSync(statePath, 'utf8'))
        if (data.signature === MANIFEST_SIGNATURE && data.version === MANIFEST_VERSION) return data
      }
    } catch (e) {}
    return null
  }

  const saveGlobalSyncState = (targetRoot, state) => {
    try {
      state.signature = MANIFEST_SIGNATURE
      state.version = MANIFEST_VERSION
      state.lastCheckpointTime = new Date().toISOString()
      fs.writeFileSync(getGlobalStatePath(targetRoot), JSON.stringify(state, null, 2))
    } catch (error) {
      logError(`Failed to save global state: ${error.message}`)
    }
  }

  const shouldScanTarget = (target) => {
    const lastScan = targetLastScanTime[target.name]
    if (!lastScan) return true
    const syncIntervalDays = target.syncInterval !== undefined ? target.syncInterval : 3
    if (syncIntervalDays === 0) return true
    if (target.localDestination) {
      const globalState = loadGlobalSyncState(target.localDestination)
      if (globalState && (globalState.state === 'syncing' || globalState.state === 'paused')) return true
    }
    return Date.now() - lastScan >= syncIntervalDays * 24 * 60 * 60 * 1000
  }

  const getTargetLastSyncTime = (targetRoot) => {
    try {
      const globalState = loadGlobalSyncState(targetRoot)
      if (globalState?.syncEndTime) return new Date(globalState.syncEndTime).getTime()
      const rootNode = loadNodeFile(targetRoot)
      if (rootNode?.syncStatus?.lastSync) return new Date(rootNode.syncStatus.lastSync).getTime()
    } catch (e) {}
    return 0
  }

  const initTargetScanTimes = () => {
    const syncTargets = api.getConfig('syncTargets') || []
    for (const target of syncTargets) {
      if (target.enabled !== false && target.localDestination) {
        try {
          const lastSyncTime = getTargetLastSyncTime(target.localDestination)
          if (lastSyncTime > 0) {
            targetLastScanTime[target.name] = lastSyncTime
            const globalState = loadGlobalSyncState(target.localDestination)
            if (globalState && ['syncing', 'scanning', 'comparing', 'downloading', 'paused'].includes(globalState.state)) {
              globalState.state = 'paused'
              saveGlobalSyncState(target.localDestination, globalState)
            }
          }
        } catch (e) {}
      }
    }
  }

  const createNodeData = (name, remotePath, localPath) => ({
    signature: MANIFEST_SIGNATURE,
    version: MANIFEST_VERSION,
    name,
    remotePath,
    localPath,
    remoteList: null,
    localList: null,
    syncStatus: {
      phase: 'idle',
      syncStartTime: null,
      syncEndTime: null,
      filesTotal: 0,
      filesSynced: 0,
      filesFailed: 0,
      timestampFixed: 0,
      lastSync: null,
      lastVerify: null,
      fileDownloadStatus: {}
    },
    comparisonResult: null,
    childrenNames: [],
    childrenStatus: {}
  })

  const loadNodeFile = (dirPath) => {
    try {
      const nodePath = getNodeFilePath(dirPath)
      if (fs.existsSync(nodePath)) {
        const data = JSON.parse(fs.readFileSync(nodePath, 'utf8'))
        if (data.signature === MANIFEST_SIGNATURE) {
          if (data.version !== MANIFEST_VERSION) return null
          data.childrenNames = data.childrenNames || []
          data.syncStatus = data.syncStatus || { phase: 'idle', filesTotal: 0, filesSynced: 0, filesFailed: 0, timestampFixed: 0, lastSync: null, lastVerify: null }
          data.syncStatus.fileDownloadStatus = data.syncStatus.fileDownloadStatus || {}
          data.childrenStatus = data.childrenStatus || {}
          data.comparisonResult = data.comparisonResult || null
          return data
        }
      }
    } catch (e) {}
    return null
  }

  const saveNodeFile = (dirPath, nodeData) => {
    try {
      nodeData.signature = MANIFEST_SIGNATURE
      nodeData.version = MANIFEST_VERSION
      if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true })
      fs.writeFileSync(getNodeFilePath(dirPath), JSON.stringify(nodeData, null, 2))
    } catch (error) {
      logError(`Failed to save node file: ${error.message}`)
    }
  }

  const loadFailedQueue = (targetRoot, targetName) => {
    try {
      const queuePath = getFailedQueuePath(targetRoot, targetName)
      if (fs.existsSync(queuePath)) {
        const queue = JSON.parse(fs.readFileSync(queuePath, 'utf8'))
        queue.files = queue.files || []
        return queue
      }
    } catch (error) {
      try { fs.unlinkSync(getFailedQueuePath(targetRoot, targetName)) } catch (e) {}
    }
    return { files: [] }
  }

  const saveFailedQueue = (targetRoot, targetName, queue) => {
    try {
      queue.lastUpdated = new Date().toISOString()
      fs.writeFileSync(getFailedQueuePath(targetRoot, targetName), JSON.stringify(queue, null, 2))
    } catch (error) {
      logError(`Failed to save failed queue: ${error.message}`)
    }
  }

  const addToFailedQueue = (targetRoot, targetName, fileInfo, error) => {
    try {
      const queue = loadFailedQueue(targetRoot, targetName)
      const failedFile = {
        remotePath: fileInfo.remotePath,
        localPath: fileInfo.localPath,
        size: fileInfo.size,
        mtime: fileInfo.mtime || null,
        ctime: fileInfo.ctime || null,
        error: error.message?.substring(0, 200) || 'Unknown error',
        timestamp: new Date().toISOString(),
        attempts: (fileInfo.attempts || 0) + 1
      }
      const existingIndex = queue.files.findIndex(f => f.remotePath === fileInfo.remotePath)
      if (existingIndex >= 0) queue.files[existingIndex] = failedFile
      else queue.files.push(failedFile)
      if (queue.files.length > 1000) queue.files = queue.files.slice(-500)
      saveFailedQueue(targetRoot, targetName, queue)
    } catch (e) {
      logError(`Failed to add to failed queue: ${e.message}`)
    }
  }

  const removeFromFailedQueue = (targetRoot, targetName, remotePath) => {
    try {
      const queue = loadFailedQueue(targetRoot, targetName)
      queue.files = queue.files.filter(f => f.remotePath !== remotePath)
      saveFailedQueue(targetRoot, targetName, queue)
    } catch (e) {
      logError(`Failed to remove from failed queue: ${e.message}`)
    }
  }

  const getExcludeSettings = (target) => ({
    excludeFiles: (target.excludeFiles || '').split(',').map(e => e.trim().toLowerCase()).filter(e => e),
    excludeFolders: (target.excludeFolders || '').split(',').map(f => f.trim()).filter(f => f)
  })

  const getAllowedExtensions = (target) => {
    const allowedExt = (target.allowedExtensions || '').split(',').map(e => e.trim().toLowerCase()).filter(e => e)
    return allowedExt.length > 0 ? allowedExt : null
  }

  const checkServerAvailable = async (apiUrl, username, password) => {
    try {
      let curlCmd = `curl -s -I --connect-timeout 5`
      if (username && password) curlCmd += ` -u "${username}:${password}"`
      curlCmd += ` "${apiUrl.origin}"`
      await execAsync(curlCmd)
      return true
    } catch { return false }
  }

  const requestWithRetry = async (command, maxRetries, retryDelay) => {
    let lastError
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const { stdout } = await execAsync(command, { maxBuffer: 10 * 1024 * 1024, windowsHide: true, timeout: 60000 })
        return stdout
      } catch (error) {
        lastError = error
        if (attempt < maxRetries) await new Promise(resolve => setTimeout(resolve, retryDelay * 1000))
      }
    }
    throw lastError
  }

  const shouldExcludeFolder = (folderPath, excludeFolders) => {
    if (!excludeFolders?.length) return false
    const folders = folderPath.split(/[\\/]/).filter(f => f)
    return folders.some(f => excludeFolders.some(e => f.toLowerCase() === e.toLowerCase()))
  }

  const shouldExcludeFile = (filename, excludeExtensions, allowedExtensions) => {
    const ext = path.extname(filename).toLowerCase().substring(1)
    if (allowedExtensions?.length) {
      if (!allowedExtensions.includes(ext)) return true
      return excludeExtensions?.includes(ext) || false
    }
    return excludeExtensions?.includes(ext) || false
  }

  const matchesPriorityPattern = (filename, patterns) => {
    if (!patterns?.length) return false
    const filenameLower = filename.toLowerCase()
    return patterns.some(pattern => {
      if (pattern.includes('*')) {
        return new RegExp(`^${pattern.toLowerCase().replace(/\./g, '\\.').replace(/\*/g, '.*')}$`).test(filenameLower)
      }
      return filenameLower === pattern.toLowerCase() || filenameLower.endsWith('.' + pattern.toLowerCase())
    })
  }

  const buildExploreUrl = (baseUrl, remoteRootPath, remotePath) => {
    let fullPath = remoteRootPath.endsWith('/') ? remoteRootPath : remoteRootPath + '/'
    if (remotePath && remotePath !== '/') fullPath += remotePath.replace(/^\//, '')
    if (!fullPath.startsWith('/')) fullPath = '/' + fullPath
    const encodedPath = encodeURIComponentSafe(fullPath)
    return `${baseUrl}/~/api/get_file_list?uri=${encodedPath}`
  }

  const buildDownloadUrl = (remoteAddress, remotePath) => {
    let baseUrl = remoteAddress.endsWith('/') ? remoteAddress : remoteAddress + '/'
    if (!remotePath || remotePath === '/') return baseUrl
    const segments = remotePath.replace(/^\//, '').split('/')
    const encodedSegments = segments.map(seg => encodeURIComponentSafe(seg))
    return baseUrl + encodedSegments.join('/')
  }

  const getRemoteFileList = async (exploreUrl, targetName, username, password) => {
    const maxRetries = api.getConfig('maxRetries')
    const retryDelay = api.getConfig('retryDelay')
    try {
      let command = `curl -s --connect-timeout 30`
      if (username && password) command += ` -u "${username}:${password}"`
      command += ` "${exploreUrl}"`
      const stdout = await requestWithRetry(command, maxRetries, retryDelay)
      if (!stdout?.trim()) throw new Error('Empty response')
      let jsonStr = stdout.trim()
      const firstBrace = jsonStr.indexOf('{')
      const lastBrace = jsonStr.lastIndexOf('}')
      if (firstBrace === -1 || lastBrace === -1) throw new Error('No JSON found')
      jsonStr = jsonStr.substring(firstBrace, lastBrace + 1)
      return (JSON.parse(jsonStr).list || []).map(item => ({
        n: item.n,
        s: item.s || 0,
        m: item.m || null,
        c: item.c || null
      }))
    } catch (error) {
      logError(`[${targetName}] Failed to get remote file list: ${error.message}`)
      throw error
    }
  }

  const scanLocalDirectory = (dirPath, excludeFiles, excludeFolders, allowedExtensions) => {
    const files = {}
    const subDirs = {}
    try {
      if (!fs.existsSync(dirPath)) return { files, subDirs, scannedAt: new Date().toISOString(), error: 'Directory not found' }
      const entries = fs.readdirSync(dirPath, { withFileTypes: true })
      for (const entry of entries) {
        if (isSyncMetaFile(entry.name)) continue
        if (entry.isFile()) {
          if (!shouldExcludeFile(entry.name, excludeFiles, allowedExtensions)) {
            try {
              const stat = fs.statSync(path.join(dirPath, entry.name))
              files[entry.name] = { size: stat.size, mtime: stat.mtime.toISOString(), ctime: (stat.birthtime || stat.ctime).toISOString() }
            } catch (e) {
              files[entry.name] = { size: 0, mtime: new Date().toISOString(), ctime: new Date().toISOString() }
            }
          }
        } else if (entry.isDirectory() && !shouldExcludeFolder(entry.name, excludeFolders)) {
          try {
            subDirs[entry.name] = { mtime: fs.statSync(path.join(dirPath, entry.name)).mtime.toISOString() }
          } catch (e) {
            subDirs[entry.name] = { mtime: new Date().toISOString() }
          }
        }
      }
    } catch (e) {}
    return { files, subDirs, scannedAt: new Date().toISOString() }
  }

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i]
  }

  const isTimestampMatch = (remoteTime, localTime, toleranceSeconds = DEFAULT_TIMESTAMP_TOLERANCE) => {
    if (!remoteTime || !localTime) return false
    try { return Math.abs(new Date(remoteTime) - new Date(localTime)) / 1000 <= toleranceSeconds } catch (e) { return false }
  }

  const setFileTimestamps = async (filePath, mtime, ctime) => {
    try {
      if (!mtime && !ctime) return
      const mtimeDate = mtime ? new Date(mtime) : null
      const ctimeDate = ctime ? new Date(ctime) : null
      if (mtimeDate && !isNaN(mtimeDate)) fs.utimesSync(filePath, ctimeDate && !isNaN(ctimeDate) ? ctimeDate : mtimeDate, mtimeDate)
      if (ctimeDate && !isNaN(ctimeDate) && process.platform === 'win32') {
        try { await execAsync(`powershell -Command "(Get-Item '${filePath}').CreationTime = [DateTime]::Parse('${ctimeDate.toISOString()}')"`, { windowsHide: true }) } catch (e) {}
      }
    } catch (e) {}
  }

  const checkFileExistsOnDisk = (localPath, expectedSize, expectedMtime) => {
    try {
      if (fs.existsSync(localPath)) {
        const localStat = fs.statSync(localPath)
        return {
          exists: true,
          sizeMatch: localStat.size === expectedSize,
          timeMatch: expectedMtime ? isTimestampMatch(expectedMtime, localStat.mtime.toISOString()) : false,
          localSize: localStat.size,
          localMtime: localStat.mtime.toISOString(),
          localCtime: (localStat.birthtime || localStat.ctime).toISOString()
        }
      }
    } catch (e) {}
    return { exists: false, sizeMatch: false, timeMatch: false, localSize: 0, localMtime: null, localCtime: null }
  }

  const downloadWithAria2 = async (remoteUrl, localPath, targetName, username, password, expectedMtime, expectedCtime) => {
    const aria2cPath = api.getConfig('aria2Path') || 'aria2c.exe'
    const speedLimit = api.getConfig('speedLimit') || 0
    const maxRetries = api.getConfig('maxRetries') || 3
    const retryDelay = api.getConfig('retryDelay') || 5
    let aria2Executable = aria2cPath
    if (!fs.existsSync(aria2Executable)) {
      try {
        const { stdout } = await execAsync(`where aria2c`, { windowsHide: true })
        if (stdout?.trim()) aria2Executable = stdout.trim().split('\n')[0]
        else throw new Error('aria2c not found')
      } catch (e) { throw new Error(`aria2c not found. Please install aria2 or configure correct path.`) }
    }
    const dir = path.dirname(localPath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    const fileName = path.basename(localPath)
    const safeFileName = fileName.replace(ILLEGAL_FILENAME_CHARS, '_')
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        let args = [
          `"${aria2Executable}"`, `--dir="${dir}"`, `--out="${safeFileName}"`,
          '--allow-overwrite=true', '--auto-file-renaming=false', '--continue=true',
          `--max-tries=1`, `--retry-wait=${retryDelay}`, '--max-concurrent-downloads=1', '--split=1',
          '--timeout=60', '--connect-timeout=30', '--max-connection-per-server=1', '--disable-ipv6=true',
          '--quiet=true', '--summary-interval=0', '--console-log-level=error'
        ]
        if (username && password) { args.push(`--http-user="${username}"`); args.push(`--http-passwd="${password}"`) }
        if (speedLimit > 0) { args.push(`--max-overall-download-limit=${speedLimit}K`); args.push(`--max-download-limit=${speedLimit}K`) }
        args.push(`"${remoteUrl}"`)
        await execAsync(args.join(' '), { maxBuffer: 10 * 1024 * 1024, windowsHide: true, timeout: 300000 })
        if (fileName !== safeFileName && fs.existsSync(path.join(dir, safeFileName))) {
          try { if (fs.existsSync(path.join(dir, fileName))) fs.unlinkSync(path.join(dir, fileName)); fs.renameSync(path.join(dir, safeFileName), path.join(dir, fileName)) } catch (e) {}
        }
        if (fs.existsSync(localPath) && fs.statSync(localPath).size > 0) {
          if (expectedMtime || expectedCtime) await setFileTimestamps(localPath, expectedMtime, expectedCtime)
          return { success: true, size: fs.statSync(localPath).size }
        }
        throw new Error('Download verification failed')
      } catch (error) {
        if (attempt < maxRetries) {
          logDebug(`[sync] [${targetName}] Retrying download (${attempt}/${maxRetries})`)
          await new Promise(resolve => setTimeout(resolve, retryDelay * 1000))
        } else throw error
      }
    }
  }

  const compareDualLists = (remoteList, localList, options = {}) => {
    const { remoteHealthy = true, allowDeletion = true } = options

    const result = {
      hasChanges: false,
      filesToDownload: [],
      filesToFixTimestamp: [],
      filesToDelete: [],
      dirsToDelete: [],
      newRemoteDirs: [],
      remoteList,
      localList,
      summary: {
        filesToAdd: 0,
        filesToUpdate: 0,
        filesToFixTimestamp: 0,
        filesToRemove: 0,
        dirsToAdd: 0,
        dirsToRemove: 0,
        totalBytesToDownload: 0,
        sizeOnlyFiles: 0,
        dualVerifyFiles: 0,
        deletionSkipped: false,
        deletionSkipReason: null
      }
    }

    const safeToDelete = remoteHealthy === true && allowDeletion === true

    const remoteFiles = remoteList?.files || {}
    const remoteDirs = remoteList?.subDirs || {}
    const localFiles = localList?.files || {}
    const localDirs = localList?.subDirs || {}

    // 处理新增和更新
    for (const [fileName, remoteInfo] of Object.entries(remoteFiles)) {
      const localInfo = localFiles[fileName]
      const useDualVerification = needsDualVerification(fileName)
      if (!localInfo) {
        result.filesToDownload.push({ name: fileName, size: remoteInfo.size, mtime: remoteInfo.mtime, ctime: remoteInfo.ctime, reason: 'missing', isPriority: remoteInfo.isPriority || false, useDualVerification })
        result.summary.filesToAdd++
        result.summary.totalBytesToDownload += remoteInfo.size
        result.hasChanges = true
      } else if (localInfo.size !== remoteInfo.size) {
        result.filesToDownload.push({ name: fileName, size: remoteInfo.size, mtime: remoteInfo.mtime, ctime: remoteInfo.ctime, reason: 'size_changed', isPriority: remoteInfo.isPriority || false, useDualVerification })
        result.summary.filesToUpdate++
        result.summary.totalBytesToDownload += remoteInfo.size
        result.hasChanges = true
      } else if (remoteInfo.mtime && !isTimestampMatch(remoteInfo.mtime, localInfo.mtime)) {
        if (useDualVerification) {
          result.filesToDownload.push({ name: fileName, size: remoteInfo.size, mtime: remoteInfo.mtime, ctime: remoteInfo.ctime, reason: 'timestamp_mismatch', isPriority: remoteInfo.isPriority || false, useDualVerification: true })
          result.summary.filesToUpdate++
          result.summary.totalBytesToDownload += remoteInfo.size
          result.summary.dualVerifyFiles++
          result.hasChanges = true
        } else {
          result.filesToFixTimestamp.push({ name: fileName, mtime: remoteInfo.mtime, ctime: remoteInfo.ctime })
          result.summary.filesToFixTimestamp++
          result.summary.sizeOnlyFiles++
          result.hasChanges = true
        }
      }
    }

    for (const dirName of Object.keys(remoteDirs)) {
      if (!localDirs[dirName]) {
        result.newRemoteDirs.push({ name: dirName })
        result.summary.dirsToAdd++
        result.hasChanges = true
      }
    }

    // 只有在安全时才进行删除
    if (safeToDelete) {
      for (const [fileName] of Object.entries(localFiles)) {
        if (!remoteFiles[fileName]) {
          result.filesToDelete.push({ name: fileName, size: localFiles[fileName].size })
          result.summary.filesToRemove++
          result.hasChanges = true
        }
      }
      for (const dirName of Object.keys(localDirs)) {
        if (!remoteDirs[dirName]) {
          result.dirsToDelete.push({ name: dirName })
          result.summary.dirsToRemove++
          result.hasChanges = true
        }
      }
    } else {
      result.summary.deletionSkipped = true
      result.summary.deletionSkipReason = remoteHealthy === null ? 'Mount status unknown (probe uncertain)' :
                                           !remoteHealthy ? 'Remote unhealthy (probe failed)' : 'Deletion disabled'
    }

    return result
  }

  const processTarget = async (target, targetRoot, shouldStopFn) => {
    const targetName = target.name
    const fileDelay = api.getConfig('fileDelay')
    const downloadConcurrency = api.getConfig('concurrentDownloads') || 1

    if (target.enabled === false) {
      logDebug(`[sync] [${targetName}] Disabled, skipping`)
      return
    }
    if (!shouldScanTarget(target)) {
      logDebug(`[sync] [${targetName}] Not due for sync`)
      return
    }

    logDebug(`[sync] [${targetName}] Starting sync -> ${targetRoot}`)
    if (!fs.existsSync(targetRoot)) fs.mkdirSync(targetRoot, { recursive: true })

    let globalState = loadGlobalSyncState(targetRoot)
    const isResuming = globalState?.state === 'paused'
    if (!globalState || globalState.version !== MANIFEST_VERSION) {
      globalState = createGlobalSyncState(targetName, targetRoot)
    }
    if (!isResuming) {
      globalState.totalDirs = globalState.processedDirs = globalState.totalFiles = globalState.downloadedFiles = globalState.failedFiles = globalState.timestampFixedFiles = 0
      globalState.completedDirs = globalState.errors = []
    }
    globalState.state = 'syncing'
    globalState.syncStartTime = globalState.syncStartTime || new Date().toISOString()
    saveGlobalSyncState(targetRoot, globalState)

    if (getEnableSlimeMold()) {
      let slimeNetwork = loadSlimeNetwork(targetRoot)
      if (!slimeNetwork) {
        slimeNetwork = createSlimeNetwork(targetName, targetRoot, target.syncInterval || 3)
        saveSlimeNetwork(targetRoot, slimeNetwork)
      }
    }

    await retryFailedFiles(targetRoot, target)

    const apiUrl = new URL(target.remoteAddress)
    const baseUrl = `${apiUrl.protocol}//${apiUrl.host}`
    const remoteRootPath = apiUrl.pathname

    const syncDirectory = async (remotePath, localPath) => {
      if (shouldStopFn?.()) {
        globalState.state = 'paused'
        saveGlobalSyncState(targetRoot, globalState)
        return { pendingCount: 0, failedFiles: [], interrupted: true }
      }

      if (fileDelay > 0) await new Promise(resolve => setTimeout(resolve, fileDelay))

      try {
        globalState.currentProcessingPath = localPath
        globalState.state = 'scanning'
        saveGlobalSyncState(targetRoot, globalState)

        let nodeData = loadNodeFile(localPath) || createNodeData(path.basename(localPath) || '/', remotePath, localPath)

        const exploreUrl = buildExploreUrl(baseUrl, remoteRootPath, remotePath)
        logVerbose(`[verbose] [${targetName}] Exploring: ${exploreUrl}`)

        let fileList
        let remoteHealthy = true
        let healthCheckFailed = false
        let healthError = null

        try {
          fileList = await getRemoteFileList(exploreUrl, targetName, target.username, target.password)

          if (fileList.length === 0) {
            const mountStatus = await probeRemoteMountByPattern(target, targetRoot)
            if (mountStatus.mounted === false) {
              remoteHealthy = false
              healthCheckFailed = true
              healthError = `Remote unmounted: ${mountStatus.reason}`
              logError(`[${targetName}] ${healthError}`)
              return {
                pendingCount: 0,
                failedFiles: [],
                interrupted: false,
                healthCheckFailed: true,
                error: healthError,
                details: mountStatus.details
              }
            }
            if (mountStatus.mounted === null) {
              remoteHealthy = false
              logDebug(`[${targetName}] Mount status uncertain for ${remotePath || '/'}, skipping deletion`)
            }
          }

          if (fileList.length > 0 && fileList.length < 5 && remotePath === '') {
            const historical = getHistoricalFileCounts(targetRoot)
            const historicalCount = historical['/'] || 0
            if (historicalCount > 50 && fileList.length < historicalCount * 0.1) {
              const mountStatus = await probeRemoteMountByPattern(target, targetRoot)
              if (mountStatus.mounted === false) {
                remoteHealthy = false
                healthCheckFailed = true
                healthError = `Remote unmounted: ${mountStatus.reason}`
                logError(`[${targetName}] ${healthError}`)
                return {
                  pendingCount: 0,
                  failedFiles: [],
                  interrupted: false,
                  healthCheckFailed: true,
                  error: healthError,
                  details: mountStatus.details
                }
              }
            }
          }

        } catch (error) {
          remoteHealthy = false
          healthCheckFailed = true
          healthError = error.message
          logError(`[${targetName}] Failed to get remote file list: ${error.message}`)
          return {
            pendingCount: 0,
            failedFiles: [],
            interrupted: false,
            healthCheckFailed: true,
            error: healthError
          }
        }

        const remoteFiles = {}
        const remoteSubDirs = {}
        const excludeSettings = getExcludeSettings(target)
        const allowedExtensions = getAllowedExtensions(target)

        for (const item of fileList) {
          if (!item?.n) continue
          const isDir = item.n.endsWith('/')
          const name = isDir ? item.n.slice(0, -1) : item.n
          if (isDir) {
            if (!shouldExcludeFolder(name, excludeSettings.excludeFolders)) {
              remoteSubDirs[name] = { mtime: item.m || item.c || new Date().toISOString() }
            }
          } else if (!shouldExcludeFile(name, excludeSettings.excludeFiles, allowedExtensions)) {
            remoteFiles[name] = {
              size: item.s || 0,
              mtime: item.m || null,
              ctime: item.c || null,
              isPriority: matchesPriorityPattern(name, (target.priorityPatterns || '').split(',').map(p => p.trim()).filter(p => p)),
              useDualVerification: needsDualVerification(name)
            }
          }
        }

        const newRemoteList = { files: remoteFiles, subDirs: remoteSubDirs, scannedAt: new Date().toISOString() }
        const newLocalList = scanLocalDirectory(localPath, excludeSettings.excludeFiles, excludeSettings.excludeFolders, allowedExtensions)

        nodeData.syncStatus.phase = 'comparing'
        saveNodeFile(localPath, nodeData)

        const comparison = compareDualLists(newRemoteList, newLocalList, {
          remoteHealthy: remoteHealthy,
          allowDeletion: true
        })

        if (comparison.summary.deletionSkipped) {
          logDebug(`[sync] [${targetName}] Deletion skipped for ${remotePath || '/'}: ${comparison.summary.deletionSkipReason}`)
        }

        if (remotePath === '') {
          updateHistoricalCounts(targetRoot, newRemoteList)
        } else {
          updateSubDirHistoricalCount(targetRoot, remotePath, Object.keys(remoteFiles).length)
        }

        Object.assign(nodeData, {
          remoteList: newRemoteList,
          localList: newLocalList,
          comparisonResult: comparison,
          childrenNames: Object.keys(remoteSubDirs)
        })
        nodeData.syncStatus.lastVerify = new Date().toISOString()
        globalState.totalFiles += Object.keys(remoteFiles).length
        globalState.totalDirs += Object.keys(remoteSubDirs).length + 1
        saveGlobalSyncState(targetRoot, globalState)

        updateSlimeAfterSync(target, targetRoot, remotePath, comparison, nodeData)

        for (const fileToFix of comparison.filesToFixTimestamp) {
          const localFilePath = path.join(localPath, fileToFix.name)
          if (fs.existsSync(localFilePath)) {
            await setFileTimestamps(localFilePath, fileToFix.mtime, fileToFix.ctime)
            nodeData.syncStatus.timestampFixed++
          }
        }
        globalState.timestampFixedFiles = (globalState.timestampFixedFiles || 0) + nodeData.syncStatus.timestampFixed

        if (remoteHealthy) {
          for (const fileToDelete of comparison.filesToDelete) {
            try {
              const filePath = path.join(localPath, fileToDelete.name)
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath)
                logVerbose(`[verbose] [${targetName}] Deleted: ${fileToDelete.name}`)
              }
            } catch (e) {
              logError(`[${targetName}] Failed to delete ${fileToDelete.name}: ${e.message}`)
            }
          }
        }

        for (const fileToDownload of comparison.filesToDownload) {
          if (fileToDownload.reason !== 'missing') {
            try {
              const filePath = path.join(localPath, fileToDownload.name)
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath)
              }
            } catch (e) {}
          }
        }

        if (remoteHealthy) {
          for (const dirToDelete of comparison.dirsToDelete) {
            const dirPath = path.join(localPath, dirToDelete.name)
            try {
              if (fs.existsSync(dirPath)) {
                [getNodeFilePath(dirPath), getSlimeMoldPath(dirPath)].forEach(p => {
                  if (fs.existsSync(p)) fs.unlinkSync(p)
                })
                fs.rmSync(dirPath, { recursive: true, force: true })
                logVerbose(`[verbose] [${targetName}] Deleted directory: ${dirToDelete.name}`)
              }
            } catch (e) {
              logError(`[${targetName}] Failed to delete directory ${dirToDelete.name}: ${e.message}`)
            }
          }
        }

        for (const newDir of comparison.newRemoteDirs) {
          const dirPath = path.join(localPath, newDir.name)
          if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true })
          }
        }

        nodeData.syncStatus.phase = 'downloading'
        const filesToDownload = comparison.filesToDownload || []
        const failedFiles = []
        let downloadedCount = 0

        if (filesToDownload.length > 0 && !shouldStopFn?.()) {
          const downloadQueue = [...filesToDownload].sort((a, b) => (b.isPriority ? 1 : 0) - (a.isPriority ? 1 : 0))
          const activeDownloads = new Set()

          await new Promise((resolve) => {
            const processNext = async () => {
              if (shouldStopFn?.() || (downloadQueue.length === 0 && activeDownloads.size === 0)) {
                if (activeDownloads.size === 0) resolve()
                return
              }

              while (activeDownloads.size < downloadConcurrency && downloadQueue.length > 0) {
                const file = downloadQueue.shift()
                const fileRemotePath = (!remotePath || remotePath === '/' ? '' : remotePath + '/') + file.name
                const remoteFileUrl = buildDownloadUrl(target.remoteAddress, fileRemotePath)
                const localFilePath = path.join(localPath, file.name)

                activeDownloads.add(file.name)
                if (fileDelay > 0 && downloadedCount > 0) {
                  await new Promise(r => setTimeout(r, fileDelay))
                }

                downloadWithAria2(remoteFileUrl, localFilePath, targetName, target.username, target.password, file.mtime, file.ctime)
                  .then(() => {
                    downloadedCount++
                    removeFromFailedQueue(targetRoot, targetName, fileRemotePath)
                    globalState.downloadedFiles++
                    saveGlobalSyncState(targetRoot, globalState)
                    logDebug(`[sync] [${targetName}] Downloaded: ${file.name} (${formatBytes(file.size)})`)
                  })
                  .catch((error) => {
                    failedFiles.push(file)
                    addToFailedQueue(targetRoot, targetName, {
                      remotePath: fileRemotePath,
                      localPath: localFilePath,
                      size: file.size,
                      mtime: file.mtime,
                      ctime: file.ctime
                    }, error)
                    globalState.failedFiles++
                    saveGlobalSyncState(targetRoot, globalState)
                    logError(`[${targetName}] Failed: ${file.name}`)
                  })
                  .finally(() => {
                    activeDownloads.delete(file.name)
                    processNext()
                  })
              }
            }
            processNext()
          })
        }

        nodeData.syncStatus.phase = failedFiles.length > 0 ? 'partial' : 'synced'
        Object.assign(nodeData.syncStatus, {
          filesTotal: Object.keys(remoteFiles).length,
          filesSynced: downloadedCount,
          filesFailed: failedFiles.length,
          lastSync: new Date().toISOString(),
          syncEndTime: new Date().toISOString()
        })
        nodeData.comparisonResult.filesToDownload = failedFiles
        saveNodeFile(localPath, nodeData)

        globalState.processedDirs++
        globalState.completedDirs = globalState.completedDirs || []
        globalState.completedDirs.push(localPath)
        saveGlobalSyncState(targetRoot, globalState)

        let totalPending = failedFiles.length
        for (const childName of nodeData.childrenNames) {
          if (shouldStopFn?.()) {
            globalState.state = 'paused'
            saveGlobalSyncState(targetRoot, globalState)
            return { pendingCount: totalPending, failedFiles: [...failedFiles], interrupted: true }
          }
          const childResult = await syncDirectory(
            (!remotePath || remotePath === '/' ? '' : remotePath + '/') + childName,
            path.join(localPath, childName)
          )
          totalPending += childResult.pendingCount
          if (childResult.interrupted) {
            return { pendingCount: totalPending, failedFiles: [...failedFiles], interrupted: true }
          }
        }

        return { pendingCount: totalPending, failedFiles: [...failedFiles], interrupted: false }

      } catch (error) {
        logError(`[${targetName}] Sync failed for ${remotePath || '/'}: ${error.message}`)
        globalState.errors = globalState.errors || []
        globalState.errors.push({
          path: localPath,
          error: error.message,
          timestamp: new Date().toISOString()
        })
        saveGlobalSyncState(targetRoot, globalState)
        return { pendingCount: 0, failedFiles: [], interrupted: false }
      }
    }

    const result = await syncDirectory('', targetRoot)

    if (result.interrupted) {
      globalState.state = 'paused'
    } else {
      globalState.state = 'completed'
      globalState.syncEndTime = new Date().toISOString()
      targetLastScanTime[targetName] = Date.now()
      if (getEnableSlimeMold()) {
        let network = loadSlimeNetwork(targetRoot)
        if (network) saveSlimeNetwork(targetRoot, resetSlimeCycle(network))
      }
    }

    saveGlobalSyncState(targetRoot, globalState)
    logDebug(`[sync] [${targetName}] ${globalState.state} (${globalState.downloadedFiles}/${globalState.totalFiles} files)`)
    return result
  }

  const retryFailedFiles = async (targetRoot, target) => {
    const targetName = target.name
    if (!fs.existsSync(targetRoot)) return
    const failedQueue = loadFailedQueue(targetRoot, targetName)
    if (!failedQueue.files.length) return

    const remainingFiles = []
    const maxAttempts = api.getConfig('maxRetries') * 2

    for (const failedFile of failedQueue.files) {
      if (failedFile.attempts >= maxAttempts) {
        remainingFiles.push(failedFile)
        continue
      }

      const diskCheck = checkFileExistsOnDisk(failedFile.localPath, failedFile.size, failedFile.mtime)
      if (diskCheck.exists && diskCheck.sizeMatch && diskCheck.timeMatch) continue
      if (diskCheck.exists) try { fs.unlinkSync(failedFile.localPath) } catch (e) {}

      try {
        const apiUrl = new URL(target.remoteAddress)
        if (!await checkServerAvailable(apiUrl, target.username, target.password)) {
          remainingFiles.push(failedFile)
          continue
        }
        await downloadWithAria2(
          buildDownloadUrl(target.remoteAddress, failedFile.remotePath),
          failedFile.localPath,
          targetName,
          target.username,
          target.password,
          failedFile.mtime,
          failedFile.ctime
        )
      } catch (error) {
        failedFile.attempts++
        failedFile.error = error.message?.substring(0, 100) || 'Unknown'
        failedFile.timestamp = new Date().toISOString()
        remainingFiles.push(failedFile)
      }
    }

    failedQueue.files = remainingFiles
    saveFailedQueue(targetRoot, targetName, failedQueue)
  }

  const checkScheduledWindow = () => {
    if (!api.getConfig('enableScheduledSync')) {
      isInScheduledWindow = false
      return
    }
    const nowInWindow = isWithinScheduledWindow()
    const now = Date.now()
    if (nowInWindow !== isInScheduledWindow) {
      isInScheduledWindow = nowInWindow
      lastWindowLogTime = now
    } else if (!nowInWindow && (now - lastWindowLogTime) >= WINDOW_LOG_INTERVAL) {
      lastWindowLogTime = now
    }
  }

  const saveCheckpoint = () => {
    if (!isSyncing) return
    const syncTargets = api.getConfig('syncTargets') || []
    for (const target of syncTargets) {
      if (target.enabled !== false && target.localDestination) {
        const globalState = loadGlobalSyncState(target.localDestination)
        if (globalState?.state === 'syncing') saveGlobalSyncState(target.localDestination, globalState)
      }
    }
  }

  const runSlimeMoldChecks = async () => {
    if (!api.getConfig('enableSync') || isSyncing) return
    if (!getEnableSlimeMold()) return
    const syncTargets = api.getConfig('syncTargets') || []
    for (const target of syncTargets) {
      if (target.enabled === false || !target.localDestination) continue
      try {
        await checkSlimeMoldScans(target, target.localDestination)
      } catch (e) {}
    }
  }

  const runSync = async () => {
    if (!api.getConfig('enableSync')) {
      logDebug('[sync] Sync is disabled')
      return
    }
    if (api.getConfig('enableScheduledSync') && !isWithinScheduledWindow()) {
      logDebug('[sync] Outside scheduled window')
      return
    }
    if (isSyncing) {
      logDebug('[sync] Already syncing')
      return
    }

    shouldStopSync = false
    isSyncing = true
    syncStartTime = Date.now()

    try {
      const syncTargets = api.getConfig('syncTargets') || []
      const enabledTargets = syncTargets.filter(t => t.enabled !== false && t.localDestination && t.remoteAddress)

      if (enabledTargets.length === 0) {
        logDebug('[sync] No enabled targets with valid configuration')
        return
      }

      logDebug(`[sync] Cycle start - ${enabledTargets.length} targets`)

      for (const target of enabledTargets) {
        if (shouldStopSync || (api.getConfig('enableScheduledSync') && !isWithinScheduledWindow())) break

        const targetRoot = target.localDestination
        const globalState = loadGlobalSyncState(targetRoot)
        const hasIncompleteSync = globalState?.state === 'paused'

        if (!hasIncompleteSync && !shouldScanTarget(target)) continue
        if (!fs.existsSync(targetRoot)) fs.mkdirSync(targetRoot, { recursive: true })

        const apiUrl = new URL(target.remoteAddress)
        if (!await checkServerAvailable(apiUrl, target.username, target.password)) {
          logDebug(`[sync] [${target.name}] Server unavailable`)
          continue
        }

        await processTarget(target, targetRoot, () => shouldStopSync || (api.getConfig('enableScheduledSync') && !isWithinScheduledWindow()))
      }

      logDebug(`[sync] Cycle completed in ${((Date.now() - syncStartTime) / 1000).toFixed(1)}s`)
    } catch (err) {
      logError(`Sync failed: ${err.message}`)
    } finally {
      isSyncing = false
      shouldStopSync = false
      if (global.gc) global.gc()
    }
  }

  // ========== 黏菌突觸 ==========

  const triggerSynapse = (target, targetRoot) => {
    if (!getEnableSlimeMold()) return

    const targetName = target.name
    const baseIntervalDays = target.syncInterval !== undefined ? target.syncInterval : 3

    let network = loadSlimeNetwork(targetRoot)
    if (!network) {
      network = createSlimeNetwork(targetName, targetRoot, baseIntervalDays)
    }

    let rootNode = loadSlimeNode(targetRoot) || createSlimeNode(targetRoot, '/', baseIntervalDays)
    rootNode.changeStats.totalFiles = Math.max(rootNode.changeStats.totalFiles || 1, 10)
    updateSlimeHeat(rootNode, 25, network)
    saveSlimeNode(targetRoot, rootNode)
    updateSlimeNetwork(network, '/', 25, rootNode.changeStats.totalFiles)
    saveSlimeNetwork(targetRoot, network)

    logDebug(`[synapse] [${targetName}] Heated slime mold (heat: ${rootNode.heat})`)
  }

  const canTriggerSynapse = (target) => {
    if (!getEnableSynapse()) return false
    const now = Date.now()
    const cooldownMs = getSynapseCooldown() * 60 * 1000
    if (!synapseCooldowns[target.name]) synapseCooldowns[target.name] = 0
    return (now - synapseCooldowns[target.name]) >= cooldownMs
  }

  const checkSync = async () => {
    if (!api.getConfig('enableSync')) return
    checkScheduledWindow()
    if (api.getConfig('enableScheduledSync')) {
      if (isWithinScheduledWindow()) await runSync()
      else if (isSyncing) shouldStopSync = true
    } else {
      await runSync()
    }
  }

  initTargetScanTimes()

  syncTimer = api.setInterval(() => checkSync().catch(() => {}), 5 * 60 * 1000)
  scheduledSyncTimer = api.setInterval(() => {
    if (api.getConfig('enableScheduledSync')) checkScheduledWindow()
  }, 60 * 1000)
  windowCheckTimer = api.setInterval(() => {
    if (api.getConfig('enableScheduledSync') && isSyncing && !isWithinScheduledWindow()) {
      shouldStopSync = true
    }
  }, 30 * 1000)

  const hasAnySlimeMoldTarget = getEnableSlimeMold() && (api.getConfig('syncTargets') || []).some(
    t => t.enabled !== false
  )

  if (hasAnySlimeMoldTarget) {
    slimeMoldCheckTimer = api.setInterval(
      () => runSlimeMoldChecks().catch(() => {}),
      getSlimeMoldCheckIntervalMs()
    )
    checkpointTimer = api.setInterval(saveCheckpoint, getCheckpointIntervalMs())
  }

  if (api.getConfig('enableSync')) setTimeout(() => runSync().catch(() => {}), 3000)

  return {
    unload() {
      saveCheckpoint()
      for (const key in pendingSynapseTriggers) {
        if (pendingSynapseTriggers[key]?.timer) {
          clearTimeout(pendingSynapseTriggers[key].timer)
          delete pendingSynapseTriggers[key]
        }
      }
      if (syncTimer) { clearInterval(syncTimer); syncTimer = null }
      if (scheduledSyncTimer) { clearInterval(scheduledSyncTimer); scheduledSyncTimer = null }
      if (windowCheckTimer) { clearInterval(windowCheckTimer); windowCheckTimer = null }
      if (checkpointTimer) { clearInterval(checkpointTimer); checkpointTimer = null }
      if (slimeMoldCheckTimer) { clearInterval(slimeMoldCheckTimer); slimeMoldCheckTimer = null }
    },

    middleware: (ctx) => {
      return () => {
        if (!api.getConfig('enableSync')) return
        if (!getEnableSynapse()) return
        const syncTargets = api.getConfig('syncTargets') || []
        if (syncTargets.length === 0) return

        let realPath = ''
        if (ctx.vfsNode && ctx.vfsNode.source) realPath = ctx.vfsNode.source
        if (!realPath) {
          const file = ctx.state?.fileSource || ctx.fileSource
          if (file) {
            if (typeof file === 'string') realPath = file
            else if (file.path) realPath = file.path
            else if (file.source) realPath = file.source
          }
        }
        if (!realPath) return

        const normalizedPath = path.normalize(realPath).replace(/\\/g, '/')

        for (const target of syncTargets) {
          if (target.enabled === false) continue
          if (!target.localDestination) continue

          const targetRoot = path.normalize(target.localDestination).replace(/\\/g, '/')
          if (!normalizedPath.startsWith(targetRoot)) continue

          const targetName = target.name
          if (!pendingSynapseTriggers[targetName]) {
            pendingSynapseTriggers[targetName] = { timer: null }
          }
          const pending = pendingSynapseTriggers[targetName]

          if (pending.timer) break
          if (!canTriggerSynapse(target)) break

          pending.timer = setTimeout(() => {
            pending.timer = null
            synapseCooldowns[targetName] = Date.now()
            delete pendingSynapseTriggers[targetName]
            triggerSynapse(target, targetRoot)
          }, SYNAPSE_MERGE_WINDOW_MS)
          break
        }
      }
    },

    customRest: {
      async manualSync() {
        if (!api.getConfig('enableSync')) return { error: 'Sync is disabled' }
        await runSync()
        return { message: 'Manual sync triggered' }
      },

      async getSyncStatus() {
        const syncTargets = api.getConfig('syncTargets') || []
        return {
          version: MANIFEST_VERSION,
          enableSync: api.getConfig('enableSync'),
          enableScheduledSync: api.getConfig('enableScheduledSync'),
          enableSlimeMold: getEnableSlimeMold(),
          enableSynapse: getEnableSynapse(),
          synapseCooldown: getSynapseCooldown(),
          mountProbeThreshold: getMountProbeThreshold() * 100,
          mountProbeMinPaths: getMountProbeMinPaths(),
          isInScheduledWindow,
          isSyncing,
          targets: syncTargets.map(target => {
            const globalState = target.localDestination ? loadGlobalSyncState(target.localDestination) : null
            const lastScan = targetLastScanTime[target.name] || 0
            const intervalDays = target.syncInterval !== undefined ? target.syncInterval : 3
            const now = Date.now()
            const cooldownMs = getSynapseCooldown() * 60 * 1000
            const lastSynapse = synapseCooldowns[target.name] || 0
            return {
              name: target.name,
              enabled: target.enabled !== false,
              destination: target.localDestination,
              syncIntervalDays: intervalDays,
              lastScan: lastScan > 0 ? new Date(lastScan).toISOString() : 'Never',
              state: globalState?.state || 'idle',
              synapseReady: (now - lastSynapse) >= cooldownMs,
              progress: globalState ? {
                processedDirs: globalState.processedDirs,
                totalDirs: globalState.totalDirs,
                downloadedFiles: globalState.downloadedFiles,
                totalFiles: globalState.totalFiles
              } : null
            }
          })
        }
      },

      async getFailedFiles({ targetName }) {
        const target = (api.getConfig('syncTargets') || []).find(t => t.name === targetName)
        if (!target?.localDestination || !fs.existsSync(target.localDestination)) {
          return { error: 'Target not found' }
        }
        return { target: targetName, ...loadFailedQueue(target.localDestination, targetName) }
      },

      async getSlimeMoldData({ targetName }) {
        const target = (api.getConfig('syncTargets') || []).find(t => t.name === targetName)
        if (!target?.localDestination) return { error: 'Target not found' }
        const network = loadSlimeNetwork(target.localDestination)
        const now = Date.now()
        const cooldownMs = getSynapseCooldown() * 60 * 1000
        const lastSynapse = synapseCooldowns[targetName] || 0

        if (!network) {
          return {
            target: targetName,
            slimeMoldEnabled: false,
            synapseEnabled: getEnableSynapse(),
            synapseCooldownMinutes: getSynapseCooldown(),
            synapseReady: (now - lastSynapse) >= cooldownMs
          }
        }

        const decayRate = calculateDecayRate(network.syncIntervalDays || 3, getSlimeMoldCheckIntervalMs())
        return {
          target: targetName,
          slimeMoldEnabled: true,
          synapseEnabled: getEnableSynapse(),
          synapseCooldownMinutes: getSynapseCooldown(),
          synapseReady: (now - lastSynapse) >= cooldownMs,
          syncIntervalDays: network.syncIntervalDays || 3,
          decayRate: parseFloat(decayRate.toFixed(6)),
          extraScansThisCycle: network.extraScansThisCycle,
          maxExtraScansPerCycle: MAX_EXTRA_SCANS_PER_CYCLE,
          hotPaths: network.hotPaths.slice(0, 10).map(hotPath => {
            const node = loadSlimeNode(path.join(target.localDestination, hotPath))
            return {
              path: hotPath,
              heat: parseFloat((node ? decayHeatByTime(node, network, now) : 0).toFixed(2)),
              changeRate: node?.changeStats?.changeRate || 0,
              lastChange: node?.changeStats?.lastChange || null
            }
          })
        }
      },

      async resetTarget({ targetName }) {
        const target = (api.getConfig('syncTargets') || []).find(t => t.name === targetName)
        if (!target?.localDestination) return { error: 'Target not found' }

        const targetRoot = target.localDestination
        targetLastScanTime[targetName] = 0
        synapseCooldowns[targetName] = 0

        if (pendingSynapseTriggers[targetName]) {
          if (pendingSynapseTriggers[targetName].timer) {
            clearTimeout(pendingSynapseTriggers[targetName].timer)
          }
          delete pendingSynapseTriggers[targetName]
        }

        ;[
          getNodeFilePath(targetRoot),
          getGlobalStatePath(targetRoot),
          getIndexFilePath(targetRoot, targetName),
          getFailedQueuePath(targetRoot, targetName),
          getSlimeNetworkPath(targetRoot)
        ].forEach(p => {
          if (fs.existsSync(p)) fs.unlinkSync(p)
        })

        return { message: `Reset completed for ${targetName}` }
      },

      async testTarget({ targetName }) {
        const target = (api.getConfig('syncTargets') || []).find(t => t.name === targetName)
        if (!target) return { error: 'Target not found' }

        try {
          const apiUrl = new URL(target.remoteAddress)
          const baseUrl = `${apiUrl.protocol}//${apiUrl.host}`
          const exploreUrl = `${baseUrl}/~/api/get_file_list?uri=${encodeURIComponent(apiUrl.pathname)}`

          if (!await checkServerAvailable(apiUrl, target.username, target.password)) {
            return { success: false, target: targetName, error: 'Server unavailable' }
          }

          const fileList = await getRemoteFileList(exploreUrl, target.name, target.username, target.password)

          let mountStatus = null
          if (fileList.length === 0) {
            mountStatus = await probeRemoteMountByPattern(target, target.localDestination)
          }

          return {
            success: true,
            target: targetName,
            files: fileList.filter(i => !i.n?.endsWith('/')).length,
            dirs: fileList.filter(i => i.n?.endsWith('/')).length,
            isEmpty: fileList.length === 0,
            mountStatus: mountStatus || { mounted: true, reason: 'Normal' }
          }
        } catch (error) {
          return { success: false, target: targetName, error: error.message }
        }
      },

      async probeMount({ targetName }) {
        const target = (api.getConfig('syncTargets') || []).find(t => t.name === targetName)
        if (!target) return { error: 'Target not found' }
        if (!target.localDestination) return { error: 'No local destination' }

        const result = await probeRemoteMountByPattern(target, target.localDestination)
        return {
          target: targetName,
          mounted: result.mounted,
          reason: result.reason,
          details: result.details
        }
      }
    }
  }
}