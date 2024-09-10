import { defineStore } from 'pinia'
import type { BaseResp, PageResp } from '@/api/api'
import { client } from '@/api/api'
import type { Tags } from '@/api/tag'

type TagDto = {
  id: number
  name: string
  description: string
  alias: string[]
}

export const updateTags = async () => {
  const tagDtoList = await client.get<BaseResp<PageResp<TagDto>>>('/api/tags', {
    params: { size: 1000 }
  }).then(e => e.data)
  tags.value = tagDtoList.reduce((acc, tag) => {
    acc[tag.id] = tag
    return acc
  })
}

const tagsKey = 'tags'

export const useTagsStore = defineStore(tagsKey, {
  state: () => ({
    tags: [], // 数据字典
    updateInterval: null // 定时器
  }),

  actions: {
    // 获取数据字典
    async fetchDictionary() {
      try {
        const tagDtoList = await client.get<BaseResp<Tags>>('/api/tags', {
          params: { size: 1000 }
        }).then(e => e.data)
        const tags = {}
        tagDtoList.data.forEach(tag => tags[tag.id] = tag)
        this.tags = tags
      } catch (error) {
        console.error('更新tags时出现异常:', error)
        return null
      }
    },

    // 加载并缓存数据字典
    async loadTags() {
      const cachedData = localStorage.getItem(tagsKey)
      if (cachedData) {
        this.tags = JSON.parse(cachedData)
      } else {
        const data = await this.fetchDictionary()
        if (data) {
          this.tags = data
          localStorage.setItem(tagsKey, JSON.stringify(data))
        }
      }
    },

    // 定时更新数据字典
    async updateTags() {
      const data = await this.fetchDictionary()
      if (data) {
        this.tags = data
        localStorage.setItem(tagsKey, JSON.stringify(data))
      }
    },

    // 开始定时更新
    startAutoUpdate(interval = 60000) {
      this.updateInterval = setInterval(this.updateTags, interval)
    },

    // 停止定时更新
    stopAutoUpdate() {
      if (this.updateInterval) {
        clearInterval(this.updateInterval)
        this.updateInterval = null
      }
    }
  }
})
