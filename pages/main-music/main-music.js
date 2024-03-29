// pages/main-music/main-music.js
import { getMusicBanner, getPlaylistDetail, getSongMenuList } from '../../services/music'
import recommendStore from "../../store/recommendStore"
import rankingStore, { rankingsMap } from "../../store/rankingStore"
import playerStore from "../../store/playerStore"
import { _throttle } from '../../utils/tools'
import querySelect from '../../utils/query-select'
// 节流处理
const querySelectThrottle = _throttle(querySelect, 100)

Page({

  /**
   * 页面的初始数据
   */
  data: {
    banners: [],
    bannerHeight: 130,

    recommendSongs: [],  //推荐歌曲

    // 歌单数据
    hotMenuList: [],
    recMenuList: [],

    // 巅峰榜数据
    isRankingData: false,
    rankingInfos: {},

    // 正在播放的数据
    currentSong: {},
    isPlaying: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.fetchMusicBanner()
    this.fetchSongMenuList()
    // this.fetchRecommendSongs()
    // 发起action
    recommendStore.onState("recommendSongInfo", this.handleRecommendSongs)
    recommendStore.dispatch("fetchRecommendSongsAction")

    for (const key in rankingsMap) {
      rankingStore.onState(key, this.getRankingHanlder(key))
    }
    rankingStore.dispatch("fetchRankingDataAction")

    playerStore.onStates(["currentSong", "isPlaying"], this.handlePlayInfos)
  },

  // 网络请求的方法封装
  async fetchMusicBanner() {
    const res = await getMusicBanner()
    this.setData({ banners: res.banners })
  },
  // 请求歌单数据
  fetchSongMenuList() {
    getSongMenuList().then(res => {
      this.setData({ hotMenuList: res.playlists })
    })
    getSongMenuList("华语").then(res => {
      this.setData({ recMenuList: res.playlists })
    })
  },

  // 动态计算图片高度后设置到swiper上
  onBannerImageLoad(event) {
    querySelectThrottle(".banner-image").then(res => {
      this.setData({ bannerHeight: res[0].height })
    })
  },
  // 点击搜索框
  onSearchClick() {
    wx.navigateTo({
      url: '/pages/detail-search/detail-search',
    })
  },
  // 推荐歌曲点击更多
  onRecommendMoreClick() {
    const id = 3778678
      wx.navigateTo({
        url: `/pages/detail-song/detail-song?type=recommend`,
      })
  },
  onSongItemTap(event) {
    const index = event.currentTarget.dataset.index
    playerStore.setState("playSongList", this.data.recommendSongs)
    playerStore.setState("playSongIndex", index)
  },
  onPlayBarTab() {
    wx.navigateTo({
      url: '/pages/music-player/music-player',
    })
  },
  onPlayBtnTab() {
    playerStore.dispatch('changeMusicStatusAction')
  },
  // ====================== 从Store中获取数据 ======================
  handleRecommendSongs(value) {
    if (!value.tracks) return false
    this.setData({ recommendSongs: value.tracks.slice(0, 6) })
  },
  // handleNewRanking(value) {
  //   // console.log("新歌榜:", value);
  //   if (!value.name) return
  //   this.setData({ isRankingData: true })
  //   const newRankingInfos = { ...this.data.rankingInfos, newRanking: value }
  //   this.setData({ rankingInfos: newRankingInfos })
  // },
  // handleOriginRanking(value) {
  //   // console.log("原创榜:", value);
  //   if (!value.name) return
  //   this.setData({ isRankingData: true })
  //   const newRankingInfos = { ...this.data.rankingInfos, originRanking: value }
  //   this.setData({ rankingInfos: newRankingInfos })
  // },
  // handleUpRanking(value) {
  //   // console.log("飙升榜:", value);
  //   if (!value.name) return
  //   this.setData({ isRankingData: true })
  //   const newRankingInfos = { ...this.data.rankingInfos, upRanking: value }
  //   this.setData({ rankingInfos: newRankingInfos })
  // },
  getRankingHanlder(ranking) {
    return value => {
      if (!value.name) return
      const newRankingInfos = { ...this.data.rankingInfos, [ranking]: value }
      this.setData({ rankingInfos: newRankingInfos })
      this.setData({ isRankingData: true })
        
      // 停止下拉刷新
      wx.stopPullDownRefresh()
    }
  },

  handlePlayInfos({ currentSong, isPlaying }) {
    if (currentSong) {
      this.setData({ currentSong })
    }
    if (isPlaying !== undefined) {
      this.setData({ isPlaying })
    }
  },

  onPullDownRefresh() {
    this.fetchMusicBanner()
    this.fetchSongMenuList()
    recommendStore.dispatch("fetchRecommendSongsAction")
    rankingStore.dispatch("fetchRankingDataAction")
  },

  onUnload() {
    recommendStore.offState("recommendSongs", this.handleRecommendSongs)
    rankingStore.offStates(["newRanking","originRanking","upRanking"], this.getRankingHanlder)
    
    playerStore.offStates(["currentSong", "isPlaying"], this.handlePlayInfos)
  }
})