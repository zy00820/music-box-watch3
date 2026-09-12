/**
 * 全局音乐播放器管理器
 * 单例模式，管理音频播放实例、播放队列、当前播放状态
 */
import media from '@blueos.media.audio.mediaManager'
import { getSongUrl, getLyric, parseLrc } from './musicApi.js'

class MusicPlayer {
  constructor() {
    this.audioPlayer = null
    this.playlist = []        // 播放队列
    this.currentIndex = -1    // 当前播放索引
    this.isPlaying = false
    this.currentSong = null
    this.currentLyric = []
    this.playMode = 'list'    // list: 列表循环, single: 单曲循环, random: 随机
    this.listeners = {}       // 事件监听器
    this.progressTimer = null
  }

  /**
   * 初始化音频播放器
   */
  init() {
    if (this.audioPlayer) return
    this.audioPlayer = media.createAudioPlayer({
      streamType: 'music',
      contentType: 'music',
      streamUsage: 'music'
    })

    // 播放完成回调
    this.audioPlayer.onFinish = () => {
      this.emit('finish')
      this.handleAutoNext()
    }

    // 播放开始回调
    this.audioPlayer.onPlay = () => {
      this.isPlaying = true
      this.startProgressTimer()
      this.emit('play')
    }

    // 暂停回调
    this.audioPlayer.onPause = () => {
      this.isPlaying = false
      this.stopProgressTimer()
      this.emit('pause')
    }

    // 停止回调
    this.audioPlayer.onStop = () => {
      this.isPlaying = false
      this.stopProgressTimer()
      this.emit('stop')
    }

    // 错误回调
    this.audioPlayer.onError = (err) => {
      this.isPlaying = false
      this.stopProgressTimer()
      this.emit('error', err)
      console.error('音频播放错误', err)
    }
  }

  /**
   * 启动进度更新定时器
   */
  startProgressTimer() {
    this.stopProgressTimer()
    this.progressTimer = setInterval(() => {
      if (this.audioPlayer) {
        const currentTime = this.audioPlayer.currentTime || 0
        const duration = this.audioPlayer.duration || 0
        this.emit('progress', { currentTime, duration })
      }
    }, 500)
  }

  stopProgressTimer() {
    if (this.progressTimer) {
      clearInterval(this.progressTimer)
      this.progressTimer = null
    }
  }

  /**
   * 设置播放列表
   */
  setPlaylist(list, index = 0) {
    this.playlist = list || []
    if (this.playlist.length > 0) {
      this.currentIndex = Math.min(index, this.playlist.length - 1)
    } else {
      this.currentIndex = -1
    }
    this.emit('playlistChange')
  }

  /**
   * 添加歌曲到播放列表
   */
  addToPlaylist(song) {
    if (!song) return
    // 避免重复添加
    const exists = this.playlist.find(s => s.id === song.id)
    if (exists) return
    this.playlist.push(song)
    this.emit('playlistChange')
  }

  /**
   * 从播放列表移除歌曲
   */
  removeFromPlaylist(index) {
    if (index < 0 || index >= this.playlist.length) return
    this.playlist.splice(index, 1)
    if (index < this.currentIndex) {
      this.currentIndex--
    } else if (index === this.currentIndex) {
      this.stop()
      if (this.playlist.length > 0) {
        this.currentIndex = Math.min(this.currentIndex, this.playlist.length - 1)
      } else {
        this.currentIndex = -1
        this.currentSong = null
      }
    }
    this.emit('playlistChange')
  }

  /**
   * 播放指定索引的歌曲
   */
  async playByIndex(index) {
    if (index < 0 || index >= this.playlist.length) return
    this.init()
    this.currentIndex = index
    const song = this.playlist[index]
    this.currentSong = song
    this.emit('songChange', song)

    try {
      // 获取播放地址
      const res = await getSongUrl(song.id)
      if (res && res.data && res.data[0] && res.data[0].url) {
        const url = res.data[0].url
        this.audioPlayer.src = url
        this.audioPlayer.play()
        this.audioPlayer.playcount = this.playMode === 'single' ? -1 : 1
      } else {
        this.emit('error', { msg: '无法获取播放地址，可能为付费歌曲' })
      }
    } catch (e) {
      this.emit('error', e)
    }

    // 加载歌词
    this.loadLyric(song.id)
  }

  /**
   * 加载歌词
   */
  async loadLyric(id) {
    try {
      const res = await getLyric(id)
      if (res && res.lrc && res.lrc.lyric) {
        this.currentLyric = parseLrc(res.lrc.lyric)
        this.emit('lyricChange', this.currentLyric)
      } else {
        this.currentLyric = []
        this.emit('lyricChange', [])
      }
    } catch (e) {
      this.currentLyric = []
      this.emit('lyricChange', [])
    }
  }

  /**
   * 播放/暂停
   */
  togglePlay() {
    if (!this.audioPlayer) {
      if (this.playlist.length > 0) {
        this.playByIndex(this.currentIndex >= 0 ? this.currentIndex : 0)
      }
      return
    }
    if (this.isPlaying) {
      this.audioPlayer.pause()
    } else {
      this.audioPlayer.play()
    }
  }

  /**
   * 播放
   */
  play() {
    if (this.audioPlayer && !this.isPlaying) {
      this.audioPlayer.play()
    } else if (!this.audioPlayer && this.playlist.length > 0) {
      this.playByIndex(0)
    }
  }

  /**
   * 暂停
   */
  pause() {
    if (this.audioPlayer && this.isPlaying) {
      this.audioPlayer.pause()
    }
  }

  /**
   * 停止
   */
  stop() {
    if (this.audioPlayer) {
      this.audioPlayer.stop()
    }
  }

  /**
   * 下一首
   */
  next() {
    if (this.playlist.length === 0) return
    let nextIndex
    if (this.playMode === 'random') {
      nextIndex = Math.floor(Math.random() * this.playlist.length)
    } else {
      nextIndex = (this.currentIndex + 1) % this.playlist.length
    }
    this.playByIndex(nextIndex)
  }

  /**
   * 上一首
   */
  prev() {
    if (this.playlist.length === 0) return
    let prevIndex
    if (this.playMode === 'random') {
      prevIndex = Math.floor(Math.random() * this.playlist.length)
    } else {
      prevIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length
    }
    this.playByIndex(prevIndex)
  }

  /**
   * 自动播放下一首（播放完成时触发）
   */
  handleAutoNext() {
    if (this.playMode === 'single') {
      // 单曲循环由 playcount 控制
      return
    }
    this.next()
  }

  /**
   * 切换播放模式
   */
  togglePlayMode() {
    const modes = ['list', 'single', 'random']
    const idx = modes.indexOf(this.playMode)
    this.playMode = modes[(idx + 1) % modes.length]
    this.emit('modeChange', this.playMode)
    return this.playMode
  }

  /**
   * 跳转播放进度
   */
  seek(time) {
    if (this.audioPlayer) {
      this.audioPlayer.currentTime = time
    }
  }

  /**
   * 释放资源
   */
  release() {
    this.stopProgressTimer()
    if (this.audioPlayer) {
      this.audioPlayer.release()
      this.audioPlayer = null
    }
    this.isPlaying = false
  }

  /**
   * 事件监听
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  /**
   * 取消监听
   */
  off(event, callback) {
    if (!this.listeners[event]) return
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback)
  }

  /**
   * 触发事件
   */
  emit(event, data) {
    if (!this.listeners[event]) return
    this.listeners[event].forEach(cb => {
      try {
        cb(data)
      } catch (e) {
        console.error('监听器执行错误', e)
      }
    })
  }
}

// 导出单例
const player = new MusicPlayer()
export default player
