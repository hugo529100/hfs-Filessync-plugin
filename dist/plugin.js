exports.version = 6.1
exports.description = "Sync folders from remote HFS3 server (Dual-list verification sync with distributed manifests and slime mold optimization)"
exports.apiRequired = 10
exports.repo = "Hug3O/Filessync-plugin"

exports.config = {
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
    xs: 6,
    when: config => config.enableScheduledSync === true
  },
  syncEndTime: {
    type: 'string',
    defaultValue: '08:30',
    label: 'Sync End Time',
    helperText: 'End time for sync (HH:MM format, e.g., 08:30 for 8:30 AM)',
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
        helperText: 'Full URL of the remote folder, e.g., http://192.168.1.224/Patch/',
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
      },
      enableSlimeMold: {
        type: 'boolean',
        defaultValue: false,
        label: 'Enable Slime Mold Optimization',
        helperText: 'Use slime mold algorithm to dynamically adjust scan frequency based on file change patterns.',
        xs: 6
      },
      enableSynapse: {
        type: 'boolean',
        defaultValue: true,
        label: 'Enable Slime Synapse',
        helperText: 'Trigger scan when frontend accesses files in this target. Works independently of Slime Mold.',
        xs: 6
      },
      synapseCooldown: {
        type: 'number',
        label: 'Synapse Cooldown (minutes)',
        defaultValue: 10,
        helperText: 'Minimum time between scans triggered by slime synapse (1-60 minutes)',
        xs: 6,
        min: 1,
        max:1440
      }
    }
  },
  synapseCompensationInterval: {
    type: 'number',
    label: 'Synapse Compensation Interval (seconds)',
    defaultValue: 60,
    helperText: 'How often to check for missed synapse-triggered scans (30-600 seconds)',
    xs: 6,
    min: 30,
    max: 600
  },
  synapseMergeWindow: {
    type: 'number',
    label: 'Synapse Merge Window (seconds)',
    defaultValue: 2,
    helperText: 'Merge multiple access requests within this window into a single scan (1-10 seconds)',
    xs: 6,
    min: 1,
    max: 10
  },
  aria2Path: {
    type: 'real_path',
    fileMask: 'aria2c.exe',
    defaultValue: 'aria2c.exe',
    label: 'Aria2c Path',
    helperText: 'Path to aria2c executable.'
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
  debug: {
    type: 'boolean',
    defaultValue: false,
    label: 'Debug Mode',
    helperText: 'Show sync summary with detailed logs',
    xs: 6
  },
  verboseDebug: {
    type: 'boolean',
    defaultValue: false,
    label: 'Verbose Debug',
    helperText: 'Show per-directory sync status',
    xs: 6,
    when: config => config.debug === true
  }
}

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
  let synapseCompensationTimer = null

  const targetLastScanTime = {}

  // 黏菌突觸冷卻時間記錄
  const synapseCooldowns = {}

  // 補償掃描追蹤
  const pendingSynapsePaths = {}

  // 請求合併追蹤
  const pendingSynapseTriggers = {}

  const MANIFEST_VERSION = '5.9'
  const MANIFEST_SIGNATURE = 'dual_list_v1'
  const NODE_FILE = '.sync_node.json'
  const FAILED_FILE_PREFIX = '.sync_failed_'
  const GLOBAL_STATE_FILE = '.sync_global_state.json'
  const SLIME_MOLD_FILE = '.slime_mold.json'
  const SLIME_NETWORK_FILE = '.slime_network.json'

  const DEFAULT_CHECKPOINT_INTERVAL = 30
  const DEFAULT_TIMESTAMP_TOLERANCE = 2
  const SLIME_MOLD_CHECK_INTERVAL = 10 * 1000
  const MAX_EXTRA_SCANS_PER_CYCLE = 5
  const MAX_HEAT_HISTORY = 20
  const MIN_HEAT_FOR_ACTION = 15
  const DECAY_MINIMUM = 0.1

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

  // ========== URL編碼輔助函數 ==========

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

  // ========== 黏菌演算法相關函數 ==========

  const createSlimeNetwork = (targetName, targetRoot, syncIntervalDays) => ({
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
  })

  const createSlimeNode = (dirPath, relativePath, syncIntervalDays) => ({
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
  })

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
    const decayRate = calculateDecayRate(syncIntervalDays, SLIME_MOLD_CHECK_INTERVAL)
    const lastUpdated = new Date(nodeData.lastUpdated).getTime()
    const elapsedChecks = Math.floor((now - lastUpdated) / SLIME_MOLD_CHECK_INTERVAL)
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
    if (slimeNode) {
      branch.heat = slimeNode.heat
    } else {
      branch.heat = parseFloat(Math.min(100, changeRate * 80 + 5).toFixed(2))
    }
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
    if (!target.enableSlimeMold) return
    const targetName = target.name
    const baseIntervalDays = target.syncInterval !== undefined ? target.syncInterval : 3
    let network = loadSlimeNetwork(targetRoot)
    if (!network) {
      network = createSlimeNetwork(targetName, targetRoot, baseIntervalDays)
      saveSlimeNetwork(targetRoot, network)
      logDebug(`[slime] [${targetName}] Created new network`)
      return
    }
    if (network.syncIntervalDays !== baseIntervalDays) {
      network.syncIntervalDays = baseIntervalDays
    }
    const cycleStartTime = new Date(network.lastCycleReset).getTime()
    const cycleDuration = baseIntervalDays * 24 * 60 * 60 * 1000
    if (Date.now() - cycleStartTime >= cycleDuration) {
      network = resetSlimeCycle(network)
    }
    let triggeredPaths = []
    for (const hotPath of network.hotPaths) {
      if (network.extraScansThisCycle >= MAX_EXTRA_SCANS_PER_CYCLE) break
      const nodePath = path.join(targetRoot, hotPath)
      let nodeData = loadSlimeNode(nodePath)
      if (!nodeData) nodeData = createSlimeNode(nodePath, hotPath, baseIntervalDays)
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
        await localScanAndSync(target, targetRoot, scanPath, network, true)
      }
    }
    saveSlimeNetwork(targetRoot, network)
  }

  const localScanAndSync = async (target, targetRoot, relativePath, network, useHeatTracking = false) => {
    const targetName = target.name
    const baseIntervalDays = target.syncInterval !== undefined ? target.syncInterval : 3
    try {
      const localPath = relativePath === '/' ? targetRoot : path.join(targetRoot, relativePath)
      const apiUrl = new URL(target.remoteAddress)
      const exploreUrl = buildExploreUrl(`${apiUrl.protocol}//${apiUrl.host}`, apiUrl.pathname, relativePath)
      const fileList = await getRemoteFileList(exploreUrl, targetName, target.username, target.password)
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
      if (useHeatTracking && target.enableSlimeMold && network) {
        let nodeData = loadSlimeNode(localPath) || createSlimeNode(localPath, relativePath, baseIntervalDays)
        nodeData.changeStats.totalFiles = Object.keys(remoteFiles).length
        nodeData.changeStats.changedFiles = changeCount
        updateSlimeHeat(nodeData, changeCount, network)
        nodeData.extraScansTriggered = (nodeData.extraScansTriggered || 0) + 1
        saveSlimeNode(localPath, nodeData)
      }
      logDebug(`[synapse] [${targetName}] Scan '${relativePath || '/'}': ${changeCount} changes, files:${Object.keys(remoteFiles).length}`)
      if (changeCount > 0) {
        const comparison = compareListsForScan(remoteFiles, localScan.files)
        for (const file of comparison.filesToDownload) {
          try {
            const fileRemotePath = relativePath === '/' ? file.name : `${relativePath}/${file.name}`
            await downloadWithAria2(
              buildDownloadUrl(target.remoteAddress, fileRemotePath),
              path.join(localPath, file.name),
              targetName, target.username, target.password,
              file.mtime, file.ctime
            )
            logDebug(`[synapse] [${targetName}] Downloaded: ${file.name}`)
          } catch (error) {
            logDebug(`[synapse] [${targetName}] Failed: ${file.name}`)
          }
        }
        for (const file of comparison.filesToDelete) {
          try {
            const filePath = path.join(localPath, file.name)
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath)
              logDebug(`[synapse] [${targetName}] Deleted: ${file.name}`)
            }
          } catch (e) {}
        }
      }
    } catch (error) {
      logError(`[${targetName}] Synapse scan failed '${relativePath}': ${error.message}`)
    }
  }

  const compareListsForScan = (remoteFiles, localFiles) => {
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
    if (!target.enableSlimeMold) return
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

  // ========== 黏菌突觸功能 ==========

  const canTriggerSynapse = (target) => {
    if (target.enableSynapse === false) return { allowed: false, remainingMs: Infinity }
    const targetKey = target.name
    const now = Date.now()
    const cooldownMs = (target.synapseCooldown || 5) * 60 * 1000
    if (!synapseCooldowns[targetKey]) synapseCooldowns[targetKey] = 0
    const timeSinceLastTrigger = now - synapseCooldowns[targetKey]
    const remainingMs = cooldownMs - timeSinceLastTrigger
    return {
      allowed: timeSinceLastTrigger >= cooldownMs,
      remainingMs: Math.max(0, remainingMs)
    }
  }

  const updateSynapseCooldown = (targetName) => {
    synapseCooldowns[targetName] = Date.now()
  }

  const addPendingSynapsePath = (targetKey, relativePath) => {
    if (!pendingSynapsePaths[targetKey]) pendingSynapsePaths[targetKey] = new Map()
    pendingSynapsePaths[targetKey].set(relativePath, Date.now())
  }

  const flushPendingSynapsePaths = (targetKey) => {
    const paths = pendingSynapsePaths[targetKey]
    if (!paths || paths.size === 0) return []
    const result = Array.from(paths.entries()).map(([p, t]) => ({ path: p, timestamp: t }))
    delete pendingSynapsePaths[targetKey]
    return result
  }

  const triggerSynapseScan = async (target, targetRoot, realPath) => {
    const targetName = target.name

    // 解析到目錄層級
    let relativePath = '/'
    const targetRootNorm = path.normalize(targetRoot).replace(/\\/g, '/')
    const realPathNorm = path.normalize(realPath).replace(/\\/g, '/')

    if (realPathNorm.startsWith(targetRootNorm)) {
      let rel = realPathNorm.substring(targetRootNorm.length)
      if (rel.startsWith('/')) rel = rel.substring(1)
      if (rel) {
        const lastSlash = rel.lastIndexOf('/')
        relativePath = lastSlash >= 0 ? rel.substring(0, lastSlash) : '/'
      }
    }

    // 請求合併：mergeWindow 秒內的請求合併為一次觸發
    const mergeWindowMs = (api.getConfig('synapseMergeWindow') || 2) * 1000

    if (!pendingSynapseTriggers[targetName]) {
      pendingSynapseTriggers[targetName] = { timer: null, paths: new Set() }
    }

    const pending = pendingSynapseTriggers[targetName]
    pending.paths.add(relativePath)

    if (pending.timer) return // 已有待處理，只更新路徑集合

    pending.timer = setTimeout(async () => {
      pending.timer = null
      const paths = Array.from(pending.paths)
      pending.paths.clear()

      const cooldownCheck = canTriggerSynapse(target)
      if (!cooldownCheck.allowed) {
        addPendingSynapsePath(targetName, '/')
        logDebug(`[synapse] [${targetName}] Merged ${paths.length} requests, queued (cooldown: ${Math.ceil(cooldownCheck.remainingMs / 1000)}s)`)
        delete pendingSynapseTriggers[targetName]
        return
      }

      logDebug(`[synapse] [${targetName}] Merged ${paths.length} requests, scanning /`)
      updateSynapseCooldown(targetName)

      let network = null
      if (target.enableSlimeMold) {
        network = loadSlimeNetwork(targetRoot)
      }

      if (!isSyncing) {
        await localScanAndSync(target, targetRoot, '/', network, target.enableSlimeMold)
      }

      delete pendingSynapseTriggers[targetName]
    }, mergeWindowMs)
  }

  const runSynapseCompensation = async () => {
    if (!api.getConfig('enableSync') || isSyncing) return
    const syncTargets = api.getConfig('syncTargets') || []
    for (const target of syncTargets) {
      if (target.enabled === false || target.enableSynapse === false) continue
      if (!target.localDestination) continue
      const targetKey = target.name
      const targetRoot = target.localDestination
      const cooldownCheck = canTriggerSynapse(target)
      if (!cooldownCheck.allowed) continue
      const pendingPaths = flushPendingSynapsePaths(targetKey)
      if (pendingPaths.length === 0) continue
      const uniquePaths = new Set()
      for (const { path: p } of pendingPaths) {
        let dirPath = p
        if (dirPath !== '/' && dirPath.includes('/')) {
          dirPath = dirPath.substring(0, dirPath.lastIndexOf('/'))
          if (!dirPath) dirPath = '/'
        } else if (dirPath !== '/' && !dirPath.includes('/')) {
          dirPath = '/'
        }
        uniquePaths.add(dirPath)
      }
      logDebug(`[synapse] [${targetKey}] Compensation scan: ${uniquePaths.size} directories from ${pendingPaths.length} queued requests`)
      updateSynapseCooldown(targetKey)
      let network = null
      if (target.enableSlimeMold) network = loadSlimeNetwork(targetRoot)
      for (const scanPath of uniquePaths) {
        if (isSyncing) break
        await localScanAndSync(target, targetRoot, scanPath, network, target.enableSlimeMold)
      }
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
    errors: []
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

  // ========== URL構建函數 ==========

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
    try {
      return Math.abs(new Date(remoteTime) - new Date(localTime)) / 1000 <= toleranceSeconds
    } catch (e) { return false }
  }

  const setFileTimestamps = async (filePath, mtime, ctime) => {
    try {
      if (!mtime && !ctime) return
      const mtimeDate = mtime ? new Date(mtime) : null
      const ctimeDate = ctime ? new Date(ctime) : null
      if (mtimeDate && !isNaN(mtimeDate)) {
        fs.utimesSync(filePath, ctimeDate && !isNaN(ctimeDate) ? ctimeDate : mtimeDate, mtimeDate)
      }
      if (ctimeDate && !isNaN(ctimeDate) && process.platform === 'win32') {
        try {
          await execAsync(`powershell -Command "(Get-Item '${filePath}').CreationTime = [DateTime]::Parse('${ctimeDate.toISOString()}')"`, { windowsHide: true })
        } catch (e) {}
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
      } catch (e) {
        throw new Error(`aria2c not found. Please install aria2 or configure correct path.`)
      }
    }
    const dir = path.dirname(localPath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    const fileName = path.basename(localPath)
    const safeFileName = fileName.replace(ILLEGAL_FILENAME_CHARS, '_')
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        let args = [
          `"${aria2Executable}"`,
          `--dir="${dir}"`,
          `--out="${safeFileName}"`,
          '--allow-overwrite=true',
          '--auto-file-renaming=false',
          '--continue=true',
          `--max-tries=1`,
          `--retry-wait=${retryDelay}`,
          '--max-concurrent-downloads=1',
          '--split=1',
          '--timeout=60',
          '--connect-timeout=30',
          '--max-connection-per-server=1',
          '--disable-ipv6=true',
          '--quiet=true',
          '--summary-interval=0',
          '--console-log-level=error'
        ]
        if (username && password) {
          args.push(`--http-user="${username}"`)
          args.push(`--http-passwd="${password}"`)
        }
        if (speedLimit > 0) {
          args.push(`--max-overall-download-limit=${speedLimit}K`)
          args.push(`--max-download-limit=${speedLimit}K`)
        }
        args.push(`"${remoteUrl}"`)
        await execAsync(args.join(' '), { maxBuffer: 10 * 1024 * 1024, windowsHide: true, timeout: 300000 })
        if (fileName !== safeFileName && fs.existsSync(path.join(dir, safeFileName))) {
          try {
            if (fs.existsSync(path.join(dir, fileName))) fs.unlinkSync(path.join(dir, fileName))
            fs.renameSync(path.join(dir, safeFileName), path.join(dir, fileName))
          } catch (e) {}
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

  const compareDualLists = (remoteList, localList) => {
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
        dualVerifyFiles: 0
      }
    }
    const remoteFiles = remoteList?.files || {}
    const remoteDirs = remoteList?.subDirs || {}
    const localFiles = localList?.files || {}
    const localDirs = localList?.subDirs || {}
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
        } else {
          result.filesToFixTimestamp.push({ name: fileName, mtime: remoteInfo.mtime, ctime: remoteInfo.ctime })
          result.summary.filesToFixTimestamp++
          result.summary.sizeOnlyFiles++
        }
        result.hasChanges = true
      }
    }
    for (const [fileName, localInfo] of Object.entries(localFiles)) {
      if (!remoteFiles[fileName]) {
        result.filesToDelete.push({ name: fileName, size: localInfo.size })
        result.summary.filesToRemove++
        result.hasChanges = true
      }
    }
    for (const dirName of Object.keys(remoteDirs)) {
      if (!localDirs[dirName]) {
        result.newRemoteDirs.push({ name: dirName })
        result.summary.dirsToAdd++
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
    if (target.enableSlimeMold) {
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
        const fileList = await getRemoteFileList(exploreUrl, targetName, target.username, target.password)
        const remoteFiles = {}
        const remoteSubDirs = {}
        const excludeSettings = getExcludeSettings(target)
        const allowedExtensions = getAllowedExtensions(target)
        for (const item of fileList) {
          if (!item?.n) continue
          const isDir = item.n.endsWith('/')
          const name = isDir ? item.n.slice(0, -1) : item.n
          if (isDir) {
            if (!shouldExcludeFolder(name, excludeSettings.excludeFolders)) remoteSubDirs[name] = { mtime: item.m || item.c || new Date().toISOString() }
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
        const comparison = compareDualLists(newRemoteList, newLocalList)
        Object.assign(nodeData, { remoteList: newRemoteList, localList: newLocalList, comparisonResult: comparison, childrenNames: Object.keys(remoteSubDirs) })
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
        for (const fileToDelete of comparison.filesToDelete) {
          try { if (fs.existsSync(path.join(localPath, fileToDelete.name))) fs.unlinkSync(path.join(localPath, fileToDelete.name)) } catch (e) {}
        }
        for (const fileToDownload of comparison.filesToDownload) {
          if (fileToDownload.reason !== 'missing') {
            try { if (fs.existsSync(path.join(localPath, fileToDownload.name))) fs.unlinkSync(path.join(localPath, fileToDownload.name)) } catch (e) {}
          }
        }
        for (const dirToDelete of comparison.dirsToDelete) {
          const dirPath = path.join(localPath, dirToDelete.name)
          try {
            if (fs.existsSync(dirPath)) {
              [getNodeFilePath(dirPath), getSlimeMoldPath(dirPath)].forEach(p => { if (fs.existsSync(p)) fs.unlinkSync(p) })
              fs.rmSync(dirPath, { recursive: true, force: true })
            }
          } catch (e) {}
        }
        for (const newDir of comparison.newRemoteDirs) {
          const dirPath = path.join(localPath, newDir.name)
          if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true })
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
                if (fileDelay > 0 && downloadedCount > 0) await new Promise(r => setTimeout(r, fileDelay))
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
                    addToFailedQueue(targetRoot, targetName, { remotePath: fileRemotePath, localPath: localFilePath, size: file.size, mtime: file.mtime, ctime: file.ctime }, error)
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
          if (childResult.interrupted) return { pendingCount: totalPending, failedFiles: [...failedFiles], interrupted: true }
        }
        return { pendingCount: totalPending, failedFiles: [...failedFiles], interrupted: false }
      } catch (error) {
        logError(`[${targetName}] Sync failed: ${error.message}`)
        globalState.errors = globalState.errors || []
        globalState.errors.push({ path: localPath, error: error.message, timestamp: new Date().toISOString() })
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
      if (target.enableSlimeMold) {
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
      if (failedFile.attempts >= maxAttempts) { remainingFiles.push(failedFile); continue }
      const diskCheck = checkFileExistsOnDisk(failedFile.localPath, failedFile.size, failedFile.mtime)
      if (diskCheck.exists && diskCheck.sizeMatch && diskCheck.timeMatch) continue
      if (diskCheck.exists) try { fs.unlinkSync(failedFile.localPath) } catch (e) {}
      try {
        const apiUrl = new URL(target.remoteAddress)
        if (!await checkServerAvailable(apiUrl, target.username, target.password)) {
          remainingFiles.push(failedFile)
          continue
        }
        await downloadWithAria2(buildDownloadUrl(target.remoteAddress, failedFile.remotePath), failedFile.localPath, targetName, target.username, target.password, failedFile.mtime, failedFile.ctime)
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
    if (!api.getConfig('enableScheduledSync')) { isInScheduledWindow = false; return }
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
    const syncTargets = api.getConfig('syncTargets') || []
    for (const target of syncTargets) {
      if (target.enabled === false || !target.enableSlimeMold || !target.localDestination) continue
      try { await checkSlimeMoldScans(target, target.localDestination) } catch (e) {}
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
  scheduledSyncTimer = api.setInterval(() => { if (api.getConfig('enableScheduledSync')) checkScheduledWindow() }, 60 * 1000)
  windowCheckTimer = api.setInterval(() => {
    if (api.getConfig('enableScheduledSync') && isSyncing && !isWithinScheduledWindow()) shouldStopSync = true
  }, 30 * 1000)
  checkpointTimer = api.setInterval(saveCheckpoint, DEFAULT_CHECKPOINT_INTERVAL * 1000)
  slimeMoldCheckTimer = api.setInterval(() => runSlimeMoldChecks().catch(() => {}), SLIME_MOLD_CHECK_INTERVAL)
  const compensationInterval = (api.getConfig('synapseCompensationInterval') || 60) * 1000
  synapseCompensationTimer = api.setInterval(() => runSynapseCompensation().catch(() => {}), compensationInterval)

  if (api.getConfig('enableSync')) {
    setTimeout(() => runSync().catch(() => {}), 3000)
  }

  return {
    unload() {
      saveCheckpoint()
      // 清理所有待處理的突觸觸發
      for (const key in pendingSynapseTriggers) {
        if (pendingSynapseTriggers[key]?.timer) clearTimeout(pendingSynapseTriggers[key].timer)
        delete pendingSynapseTriggers[key]
      }
      if (syncTimer) { clearInterval(syncTimer); syncTimer = null }
      if (scheduledSyncTimer) { clearInterval(scheduledSyncTimer); scheduledSyncTimer = null }
      if (windowCheckTimer) { clearInterval(windowCheckTimer); windowCheckTimer = null }
      if (checkpointTimer) { clearInterval(checkpointTimer); checkpointTimer = null }
      if (slimeMoldCheckTimer) { clearInterval(slimeMoldCheckTimer); slimeMoldCheckTimer = null }
      if (synapseCompensationTimer) { clearInterval(synapseCompensationTimer); synapseCompensationTimer = null }
    },

    // ========== 黏菌突觸中間件 ==========
    middleware: (ctx) => {
      return () => {
        if (!api.getConfig('enableSync')) return

        const syncTargets = api.getConfig('syncTargets') || []
        if (syncTargets.length === 0) return

        let realPath = ''
        if (ctx.vfsNode && ctx.vfsNode.source) {
          realPath = ctx.vfsNode.source
        }
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
          if (target.enabled === false || target.enableSynapse === false) continue
          if (!target.localDestination) continue

          const targetRoot = path.normalize(target.localDestination).replace(/\\/g, '/')

          if (normalizedPath.startsWith(targetRoot)) {
            triggerSynapseScan(target, target.localDestination, normalizedPath).catch(() => {})
            break
          }
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
          isInScheduledWindow,
          isSyncing,
          synapseMergeWindow: api.getConfig('synapseMergeWindow') || 2,
          synapseCompensationInterval: api.getConfig('synapseCompensationInterval') || 60,
          targets: syncTargets.map(target => {
            const globalState = target.localDestination ? loadGlobalSyncState(target.localDestination) : null
            const lastScan = targetLastScanTime[target.name] || 0
            const intervalDays = target.syncInterval !== undefined ? target.syncInterval : 3
            const synapseCheck = canTriggerSynapse(target)
            return {
              name: target.name,
              enabled: target.enabled !== false,
              destination: target.localDestination,
              syncIntervalDays: intervalDays,
              lastScan: lastScan > 0 ? new Date(lastScan).toISOString() : 'Never',
              state: globalState?.state || 'idle',
              slimeMoldEnabled: target.enableSlimeMold || false,
              synapse: {
                enabled: target.enableSynapse !== false,
                cooldownMinutes: target.synapseCooldown || 5,
                canTrigger: synapseCheck.allowed,
                cooldownRemainingSeconds: Math.ceil(synapseCheck.remainingMs / 1000),
                lastTriggered: synapseCooldowns[target.name]
                  ? new Date(synapseCooldowns[target.name]).toISOString()
                  : 'Never',
                pendingCompensations: (pendingSynapsePaths[target.name]?.size || 0),
                pendingMerged: pendingSynapseTriggers[target.name] ? pendingSynapseTriggers[target.name].paths.size : 0
              },
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
        if (!target?.localDestination || !fs.existsSync(target.localDestination)) return { error: 'Target not found' }
        return { target: targetName, ...loadFailedQueue(target.localDestination, targetName) }
      },

      async getSlimeMoldData({ targetName }) {
        const target = (api.getConfig('syncTargets') || []).find(t => t.name === targetName)
        if (!target?.localDestination) return { error: 'Target not found' }
        const network = loadSlimeNetwork(target.localDestination)
        const synapseCheck = canTriggerSynapse(target)
        const baseResult = {
          target: targetName,
          slimeMoldEnabled: false,
          synapse: {
            enabled: target.enableSynapse !== false,
            cooldownMinutes: target.synapseCooldown || 5,
            canTrigger: synapseCheck.allowed,
            cooldownRemainingSeconds: Math.ceil(synapseCheck.remainingMs / 1000),
            lastTriggered: synapseCooldowns[targetName]
              ? new Date(synapseCooldowns[targetName]).toISOString()
              : 'Never',
            pendingCompensations: (pendingSynapsePaths[targetName]?.size || 0)
          }
        }
        if (!network) return baseResult
        const decayRate = calculateDecayRate(network.syncIntervalDays || 3, SLIME_MOLD_CHECK_INTERVAL)
        const now = Date.now()
        return {
          ...baseResult,
          slimeMoldEnabled: true,
          syncIntervalDays: network.syncIntervalDays || 3,
          decayRate: parseFloat(decayRate.toFixed(6)),
          extraScansThisCycle: network.extraScansThisCycle,
          maxExtraScansPerCycle: MAX_EXTRA_SCANS_PER_CYCLE,
          hotPaths: network.hotPaths.slice(0, 10).map(hotPath => {
            const node = loadSlimeNode(path.join(target.localDestination, hotPath))
            const currentHeat = node ? decayHeatByTime(node, network, now) : 0
            return {
              path: hotPath,
              heat: parseFloat(currentHeat.toFixed(2)),
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
        if (pendingSynapsePaths[targetName]) delete pendingSynapsePaths[targetName]
        if (pendingSynapseTriggers[targetName]) {
          if (pendingSynapseTriggers[targetName].timer) clearTimeout(pendingSynapseTriggers[targetName].timer)
          delete pendingSynapseTriggers[targetName]
        }
        ;[getNodeFilePath(targetRoot), getGlobalStatePath(targetRoot),
          getFailedQueuePath(targetRoot, targetName), getSlimeNetworkPath(targetRoot)].forEach(p => { if (fs.existsSync(p)) fs.unlinkSync(p) })
        return { message: `Reset completed for ${targetName}` }
      },

      async testTarget({ targetName }) {
        const target = (api.getConfig('syncTargets') || []).find(t => t.name === targetName)
        if (!target) return { error: 'Target not found' }
        try {
          const apiUrl = new URL(target.remoteAddress)
          if (!await checkServerAvailable(apiUrl, target.username, target.password)) return { error: 'Server unavailable' }
          const fileList = await getRemoteFileList(`${apiUrl.protocol}//${apiUrl.host}/~/api/get_file_list?uri=${encodeURIComponent(apiUrl.pathname)}`, target.name, target.username, target.password)
          return { success: true, target: targetName, files: fileList.filter(i => !i.n?.endsWith('/')).length, dirs: fileList.filter(i => i.n?.endsWith('/')).length }
        } catch (error) {
          return { error: error.message }
        }
      }
    }
  }
}