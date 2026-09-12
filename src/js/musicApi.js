/**
 * 音乐 API 封装
 * 基于 NeteaseCloudMusicApi (网易云音乐开源API)
 * 可自行部署: https://github.com/Binaryify/NeteaseCloudMusicApi
 */

// ===== 可配置的 API 地址 =====
// 默认使用公共部署实例，建议自行部署以保证稳定性
// 自行部署后修改此处即可
const API_BASE = 'https://api.injahow.cn'

// 备用API地址列表（可自行替换）
const API_BACKUP_LIST = [
  'https://api.injahow.cn',
  'https://netease-cloud-music-api-five-roan.vercel.app'
]

import fetch from '@blueos.network.fetch'

/**
 * 发起网络请求（Promise 封装）
 */
function request(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    fetch.fetch({
      url: url,
      method: method,
      responseType: 'json',
      success: function (response) {
        if (response.code >= 200 && response.code < 300) {
          resolve(response.data)
        } else {
          reject({ code: response.code, msg: 'HTTP错误' })
        }
      },
      fail: function (data, code) {
        reject({ code: code, msg: data })
      }
    })
  })
}

/**
 * 搜索歌曲
 * @param {string} keywords - 关键词
 * @param {number} limit - 返回数量
 * @param {number} offset - 偏移量
 */
export function searchSongs(keywords, limit = 30, offset = 0) {
  const url = `${API_BASE}/search?keywords=${encodeURIComponent(keywords)}&limit=${limit}&offset=${offset}`
  return request(url)
}

/**
 * 获取歌曲播放地址
 * @param {number|string} id - 歌曲ID
 * @param {number} br - 码率 320000 / 192000 / 128000
 */
export function getSongUrl(id, br = 128000) {
  const url = `${API_BASE}/song/url?id=${id}&br=${br}`
  return request(url)
}

/**
 * 获取歌曲详情
 * @param {string} ids - 歌曲ID，多个用逗号分隔
 */
export function getSongDetail(ids) {
  const url = `${API_BASE}/song/detail?ids=${ids}`
  return request(url)
}

/**
 * 获取歌词
 * @param {number|string} id - 歌曲ID
 */
export function getLyric(id) {
  const url = `${API_BASE}/lyric?id=${id}`
  return request(url)
}

/**
 * 获取歌单详情
 * @param {number|string} id - 歌单ID
 */
export function getPlaylistDetail(id) {
  const url = `${API_BASE}/playlist/detail?id=${id}`
  return request(url)
}

/**
 * 获取歌单所有歌曲
 * @param {number|string} id - 歌单ID
 * @param {number} limit - 数量
 * @param {number} offset - 偏移
 */
export function getPlaylistTracks(id, limit = 50, offset = 0) {
  const url = `${API_BASE}/playlist/track/all?id=${id}&limit=${limit}&offset=${offset}`
  return request(url)
}

/**
 * 热门歌单分类
 */
export function getHotPlaylist() {
  const url = `${API_BASE}/playlist/hot`
  return request(url)
}

/**
 * 推荐歌单
 * @param {number} limit - 数量
 */
export function getRecommendPlaylist(limit = 10) {
  const url = `${API_BASE}/personalized?limit=${limit}`
  return request(url)
}

/**
 * 新歌速递
 * @param {number} type - 地区: 0全部 7华语 96欧美 8日本 16韩国
 */
export function getNewSongs(type = 0) {
  const url = `${API_BASE}/top/song?type=${type}`
  return request(url)
}

/**
 * 获取排行榜
 */
export function getTopList() {
  const url = `${API_BASE}/toplist`
  return request(url)
}

/**
 * 相似歌曲推荐
 * @param {number|string} id - 歌曲ID
 */
export function getSimiSongs(id) {
  const url = `${API_BASE}/simi/song?id=${id}`
  return request(url)
}

/**
 * 搜索建议
 * @param {string} keywords - 关键词
 */
export function getSearchSuggest(keywords) {
  const url = `${API_BASE}/search/suggest?keywords=${encodeURIComponent(keywords)}`
  return request(url)
}

/**
 * 解析LRC歌词文本为数组
 * @param {string} lrc - LRC格式歌词
 */
export function parseLrc(lrc) {
  if (!lrc) return []
  const lines = lrc.split('\n')
  const result = []
  const timeReg = /\[(\d{1,2}):(\d{1,2})(?:\.(\d{1,3}))?\]/g

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    let match
    const times = []
    let text = line

    // 提取所有时间戳
    while ((match = timeReg.exec(line)) !== null) {
      const min = parseInt(match[1])
      const sec = parseInt(match[2])
      const ms = match[3] ? parseInt(match[3].padEnd(3, '0')) : 0
      times.push(min * 60 + sec + ms / 1000)
    }

    // 去除时间戳，得到歌词文本
    text = line.replace(timeReg, '').trim()

    if (text && times.length > 0) {
      for (let j = 0; j < times.length; j++) {
        result.push({
          time: times[j],
          text: text
        })
      }
    }
  }

  // 按时间排序
  result.sort((a, b) => a.time - b.time)
  return result
}

/**
 * 格式化时间（秒 -> mm:ss）
 */
export function formatTime(seconds) {
  if (!seconds || isNaN(seconds) || seconds < 0) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s
}

export default {
  API_BASE,
  searchSongs,
  getSongUrl,
  getSongDetail,
  getLyric,
  getPlaylistDetail,
  getPlaylistTracks,
  getHotPlaylist,
  getRecommendPlaylist,
  getNewSongs,
  getTopList,
  getSimiSongs,
  getSearchSuggest,
  parseLrc,
  formatTime
}
