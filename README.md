# 🎵 全能音乐盒 (Music Box)

> 适配 **iQOO Watch GT 2** | 基于 **BlueOS 3.0** (蓝河操作系统)

一个为智能手表打造的在线音乐播放器，支持搜索、播放、歌词、播放列表管理等完整音乐体验。

## 📱 设备适配

| 项目 | 规格 |
|------|------|
| 目标设备 | iQOO Watch GT 2 |
| 操作系统 | 蓝河操作系统 3.0 (BlueOS 3) |
| 屏幕尺寸 | 2.07 英寸 AMOLED |
| 分辨率 | 432 × 514 |
| 表盘形状 | 方形 (watch-square) |
| 扬声器 | ✅ 支持独立播放 |

## ✨ 功能特性

### 🎧 核心功能
- **在线搜索**：关键词搜索歌曲、歌手
- **音乐播放**：播放 / 暂停 / 上一首 / 下一首
- **进度控制**：可拖动进度条，实时显示播放进度
- **播放模式**：列表循环 / 单曲循环 / 随机播放
- **播放列表**：管理播放队列，添加 / 删除 / 清空
- **歌词显示**：LRC 歌词自动滚动，高亮当前行
- **热门推荐**：一键加载网易云新歌速递

### 🎨 界面设计
- 深色主题，护眼且省电
- 专辑封面旋转动画
- 响应式布局，完美适配 432×514 屏幕
- 流畅的转场动画

## 📂 项目结构

```
music-box/
├── package.json              # 项目配置
├── jsconfig.json             # JS 语法校验配置
└── src/
    ├── manifest.json         # 蓝河应用配置（包名、路由、权限等）
    ├── app.ux                # 应用入口（全局生命周期）
    ├── assets/
    │   ├── images/
    │   │   └── icon.jpg      # 应用图标
    │   └── styles/
    │       └── common.css    # 全局公共样式
    ├── js/
    │   ├── musicApi.js       # 音乐 API 封装（搜索、播放地址、歌词等）
    │   └── player.js         # 全局播放器单例（播放队列、状态管理）
    └── pages/
        ├── Index/            # 播放器主页
        │   └── index.ux
        ├── Search/           # 搜索页
        │   └── index.ux
        ├── Playlist/         # 播放列表页
        │   └── index.ux
        └── Lyric/            # 歌词页
            └── index.ux
```

## 🔧 快速开始

### 1. 环境准备

- 下载安装 [BlueOS Studio](https://studio.blueos.com.cn/install)（基于 VS Code 的官方 IDE）
- 安装 [BlueOS SDK](https://blueos.vivo.com/develop)

### 2. 打开项目

1. 启动 BlueOS Studio
2. 选择「打开项目」→ 选择 `music-box` 目录
3. 等待依赖安装完成

### 3. 配置音乐 API（重要）

项目默认使用公共部署的网易云音乐 API：

```js
// src/js/musicApi.js 第 6 行
const API_BASE = 'https://api.injahow.cn'
```

⚠️ **强烈建议自行部署 API**，公共实例不稳定且有访问频率限制。

**自行部署方法（Vercel 一键部署）：**

1. Fork 项目：https://github.com/Binaryify/NeteaseCloudMusicApi
2. 在 Vercel 导入仓库，一键部署
3. 将部署得到的域名填入 `API_BASE`

**本地启动：**
```bash
git clone https://github.com/Binaryify/NeteaseCloudMusicApi.git
cd NeteaseCloudMusicApi
npm install
node app.js
# 服务运行在 http://localhost:3000
```

### 4. 运行调试

1. 在 BlueOS Studio 中点击「运行」
2. 选择模拟器（Watch Square）或连接真机 iQOO Watch GT 2
3. 应用自动安装并启动

### 5. 打包发布

1. 点击「构建」→ 生成 `.rpk` 安装包
2. 上传至 vivo 开发者平台审核

## 📡 已封装的 API 接口

| 方法 | 功能 | 说明 |
|------|------|------|
| `searchSongs(keywords)` | 搜索歌曲 | 返回歌曲列表 |
| `getSongUrl(id)` | 获取播放地址 | 返回音频直链 |
| `getSongDetail(ids)` | 获取歌曲详情 | 含专辑封面等 |
| `getLyric(id)` | 获取歌词 | LRC 格式 |
| `getPlaylistDetail(id)` | 获取歌单详情 | |
| `getPlaylistTracks(id)` | 获取歌单歌曲 | |
| `getRecommendPlaylist()` | 推荐歌单 | |
| `getNewSongs(type)` | 新歌速递 | 0全部 7华语 96欧美 |
| `getTopList()` | 排行榜 | |
| `getSimiSongs(id)` | 相似歌曲 | |
| `parseLrc(lrc)` | 解析歌词 | LRC → 数组 |
| `formatTime(s)` | 时间格式化 | 秒 → mm:ss |

## 🎮 使用指南

### 主页面 (Index)
- **专辑封面**：播放时旋转，暂停时停止
- **歌曲信息**：显示歌曲名和歌手
- **进度条**：点击任意位置跳转播放进度
- **播放控制**：上一首 / 播放暂停 / 下一首
- **底部导航**：搜索 / 列表 / 歌词 / 热门

### 搜索页 (Search)
- 输入关键词搜索
- 点击歌曲直接播放
- 点击「+」添加到播放列表
- 点击「播放全部」播放搜索结果
- 提供热门搜索标签快速搜索

### 播放列表页 (Playlist)
- 查看当前播放队列
- 点击歌曲切换播放
- 点击「✕」移除歌曲
- 支持「播放全部」和「清空」

### 歌词页 (Lyric)
- 自动滚动歌词，高亮当前行
- 底部迷你播放控制
- 无歌词时显示空状态

## ⚠️ 注意事项

1. **版权声明**：本项目仅供学习交流使用，音乐版权归各平台所有，请勿用于商业用途
2. **API 稳定性**：第三方音乐 API 可能随时失效，建议自行部署
3. **付费歌曲**：部分歌曲可能无法获取播放地址（付费/VIP 歌曲）
4. **网络权限**：需要手表连接网络（蓝牙共享手机网络或 eSIM）
5. **续航**：在线播放会显著增加功耗，建议在充电时或短时间使用

## 🔧 常见问题

**Q: 搜索无结果？**
A: 检查 API 地址是否可用，或更换 `API_BASE` 为自行部署的地址。

**Q: 歌曲无法播放？**
A: 可能是付费歌曲无播放地址，或音频格式不支持。尝试搜索其他歌曲。

**Q: 歌词不显示？**
A: 部分歌曲无歌词数据，属于正常现象。

**Q: 如何更换主题色？**
A: 修改各 `.ux` 文件中 `#ff4d6f` 为你喜欢的颜色。

## 📝 开发说明

- 开发范式：类 Web（template + style + script）
- 音频播放：`@blueos.media.audio.mediaManager`
- 网络请求：`@blueos.network.fetch`
- 页面路由：`@blueos.app.appmanager.router`
- 设计基准宽度：432px（匹配设备分辨率）

## 📄 License

MIT License - 仅供学习交流
