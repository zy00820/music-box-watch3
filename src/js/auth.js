/**
 * 离线激活模块
 * 负责激活码校验、状态持久化（BlueOS storage）
 *
 * 激活码规则：
 *   - 正式激活码由开发者发放（支付 3 元后，发送支付凭据到邮箱私信获取）
 *   - 当前内置公开激活码: b33000（测试使用）
 *
 * BlueOS @blueos.storage.storage 提供 KV 持久化
 */

import storage from '@blueos.storage.storage'

// ============ 配置 ============

// 已发放的有效激活码列表（后续可动态扩充）
const VALID_CODES = [
  'b33000',
  // 可继续在此添加更多激活码...
]

// storage 存储 key
const KV_KEY = 'music_box_auth_state'

// ============ 运行时状态 ============

let _activated = false
let _activatedCode = ''
let _initialized = false

// ============ 模块 API ============

/**
 * 初始化：从 storage 读取激活状态（同步读取）
 */
export function initAuth() {
  if (_initialized) return
  try {
    // BlueOS storage 同步读取
    const saved = storage.getSync({ key: KV_KEY })
    if (saved) {
      const data = typeof saved === 'string' ? JSON.parse(saved) : saved
      if (data && data.activated) {
        _activated = true
        _activatedCode = data.code || ''
      }
    }
  } catch (e) {
    // 忽略读取错误，保持未激活状态
  }
  _initialized = true
}

/**
 * 是否已激活
 */
export function isActivated() {
  if (!_initialized) initAuth()
  return _activated
}

/**
 * 获取当前激活使用的激活码
 */
export function getActivatedCode() {
  return _activatedCode
}

/**
 * 验证并激活
 * @param {string} inputCode - 用户输入的激活码
 * @returns {object} { success: boolean, msg: string }
 */
export function activate(inputCode) {
  const code = (inputCode || '').trim().toLowerCase()

  if (!code) {
    return { success: false, msg: '请输入激活码' }
  }

  // 校验激活码
  const isValid = VALID_CODES.some(
    valid => valid.toLowerCase() === code
  )

  if (!isValid) {
    return { success: false, msg: '激活码无效，请确认后重试' }
  }

  // 持久化到内存
  _activated = true
  _activatedCode = code

  // 持久化到 storage（异步，不阻塞）
  try {
    storage.set({
      key: KV_KEY,
      value: JSON.stringify({
        activated: true,
        code: code,
        activatedAt: new Date().toISOString()
      })
    })
  } catch (e) {
    // storage 写入失败不影响内存状态
  }

  return { success: true, msg: '激活成功！' }
}

/**
 * 退出激活（调试用）
 */
export function deactivate() {
  _activated = false
  _activatedCode = ''
  try {
    storage.delete({ key: KV_KEY })
  } catch (e) {}
}

export default {
  initAuth,
  isActivated,
  getActivatedCode,
  activate,
  deactivate
}
