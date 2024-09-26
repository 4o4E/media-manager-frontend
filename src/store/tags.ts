import { defineStore } from 'pinia'
import type { BaseResp } from '@/api/api'
import { client } from '@/api/api'
import { now } from '@vueuse/core'

interface TagDto {
  id: number
  name: string
  description: string
  alias: string[]
}

interface Option {
  label: string
  value: number
}

const tagsKey = 'tags'

export const useTagsStore = defineStore(tagsKey, {
  state: (): {
    tagInfo: {
      tags: TagDto[],
      options: Option[]
      tagsMap: { [key: number]: TagDto, length?: number },
      updateInterval: number
      lastUpdated: number
    }
  } => ({
    tagInfo: {
      tags: [],
      options: [],
      tagsMap: {},
      updateInterval: 0,
      lastUpdated: 0
    }
  }),

  actions: {
    // 获取数据字典
    async fetchDictionary(): Promise<boolean> {
      try {
        const resp = await client.get<BaseResp<TagDto[]>>('/api/tags', {
          params: {
            size: 1000,
            lastUpdated: this.tagInfo.tags.length === 0 ? null : this.tagInfo.lastUpdated
          }
        })
        if (resp.status === 304) return false
        const tags: { [key: number]: TagDto, length: number } = { length: 0 }
        const options: Option[] = []
        this.$patch(({ tagInfo }) => {
          tagInfo.tags = resp.data.data!
          tagInfo.lastUpdated = now()
        })
        this.tagInfo.tags.forEach(tag => {
          tags[tag.id] = tag
          tags.length += 1
          tag.alias.forEach(e => options.push({ label: e, value: tag.id }))
        })
        this.$patch(({ tagInfo }) => {
          tagInfo.tagsMap = tags
          tagInfo.options = options
        })
        return true
      } catch (error) {
        console.error('更新tags时出现异常:', error)
        return false
      }
    },

    // 加载并缓存数据字典
    async loadTags() {
      const cachedData = localStorage.getItem(tagsKey)
      if (cachedData) this.$patch(state => {
        state.tagInfo = JSON.parse(cachedData)
      })
      await this.fetchDictionary()
    },

    // 定时更新数据字典
    async updateTags() {
      const data = await this.fetchDictionary()
      if (data) {
        localStorage.setItem(tagsKey, JSON.stringify(this.tagInfo))
      }
    },

    // 开始定时更新
    startAutoUpdate(interval = 60000) {
      this.$patch(state => {
        state.tagInfo.updateInterval = setInterval(this.updateTags, interval)
      })
    },

    // 停止定时更新
    stopAutoUpdate() {
      if (this.tagInfo.updateInterval) {
        clearInterval(this.tagInfo.updateInterval)
      }
    }
  }
})
