// components/menu-item-v2/menu-item-v2.js
import { menuCollection } from "../../database/index"
import menuStore from "../../store/menuStore"

Component({
  properties: {
    itemData: {
      type: Object,
      value: {}
    }
  },

  methods: {
    async onDeleteTap() {
      // 1.获取点击歌单的_id
      const _id = this.properties.itemData._id

      // 2.删除数据
      const res = await menuCollection.remove(_id)

      if (res) {
        wx.showToast({ title: "删除歌单成功~" })
        menuStore.dispatch("fetchMenuListAction")
      }
    },

    onMenuTap() {
      const item = this.properties.itemData
      wx.navigateTo({
        url: `/pages/detail-song/detail-song?type=mineMenu&id=${item._id}&title=${item.name}`,
      })
    }
  }
})
