import { defineStore } from 'pinia'
import type { BaseResp } from '@/api/api'
import { client } from '@/api/api'
import { now } from '@vueuse/core'

interface TagDto {
  id: bigint
  names: string[]
  remark: string
}

interface Option {
  label: string
  value: bigint
}

const tagsKey = 'tags'

export const useTagsStore = defineStore(tagsKey, {
  state: (): {
    tagInfo: {
      tags: TagDto[],
      options: Option[]
      tagsMap: Map<bigint, TagDto>,
      updateInterval: number
      lastUpdated: number
    }
  } => ({
    tagInfo: {
      tags: [],
      options: [],
      tagsMap: new Map<bigint, TagDto>(),
      updateInterval: 0,
      lastUpdated: 0
    }
  }),

  actions: {
    // 获取数据字典
    async fetchDictionary(): Promise<boolean> {
      try {
        const resp = await client.get<BaseResp<TagDto[]>>('/api/tags/all', {
          params: {
            lastUpdated: this.tagInfo.tags.length === 0 ? null : this.tagInfo.lastUpdated,
          }
        })
        if (resp.status === 304) return false
        const tags = new Map<bigint, TagDto>()
        const options: Option[] = []
        this.$patch(({ tagInfo }) => {
          tagInfo.tags = resp.data.data!
          tagInfo.lastUpdated = now()
        })
        this.tagInfo.tags.forEach(tag => {
          tags.set(tag.id, tag)
          tag.names.forEach(e => options.push({ label: e, value: tag.id }))
        })
        this.$patch(({ tagInfo }) => {
          tagInfo.tagsMap = tags
          tagInfo.options = options
        })
        this.saveTag()
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
        const tagInfo = JSON.parse(cachedData)
        tagInfo.tagsMap = new Map<bigint, TagDto>(Object.entries(tagInfo.tagsMap) as any)
        tagInfo.options.forEach((e: any) => e.vk = e.label + e.value)
        state.tagInfo = tagInfo
      })
      await this.fetchDictionary()
    },

    // 定时更新数据字典
    async updateTags() {
      const result = await this.fetchDictionary()
      if (result) this.saveTag()
    },

    saveTag() {
      localStorage.setItem(tagsKey, JSON.stringify(Object.assign({}, this.tagInfo, { tagsMap: Object.fromEntries(this.tagInfo.tagsMap) })))
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
