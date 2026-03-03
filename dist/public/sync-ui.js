HFS.onPage('list', () => {
  const bar = document.querySelector('.breadcrumb')
  if (!bar) return

  const btn = document.createElement('button')
  btn.textContent = '🔄 同步'
  btn.style.marginLeft = '1em'

  let notifyId = Math.random().toString(36).slice(2)

  btn.onclick = async () => {
    btn.disabled = true
    btn.textContent = '同步中...'

    await HFS.customRestCall('manualSync', { notifyId })

    // 前端會等 notify 來更新畫面
  }

  HFS.onServerNotification('syncResult', ({ added, deleted, skipped }) => {
    let msg = `✅ 同步完成\n\n新增: ${added.length}\n刪除: ${deleted.length}\n跳過: ${skipped.length}`
    alert(msg)
    btn.textContent = '🔄 同步'
    btn.disabled = false
  }, notifyId)

  bar.appendChild(btn)
})
