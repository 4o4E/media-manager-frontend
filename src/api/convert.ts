import type { MessageData, TextElement } from '@/api/types/media'
import type { UnUploadMediaElement } from '@/api/upload'
import { client } from '@/api/api'
import { now } from '@vueuse/core'
import { MediaType } from '@/api/types/media'

export async function toUnUpload(data: MessageData) {
  return await Promise.all(data.content.map(async e => {
    const index = now()
    if (e.type === MediaType.TEXT) {
      return {
        index,
        type: e.type,
        content: (e as TextElement).content,
      }
    }
    const media = e as UnUploadMediaElement
    const blob = await toBlob(`/api/file/${media.id}.${media.format}`)
    const url = URL.createObjectURL(blob)
    switch (e.type) {
      case MediaType.AUDIO:
        return {
          index,
          type: e.type,
          file: false,
          format: media.format,
          length: media.length,
          blob,
          url,
        }
      case MediaType.IMAGE:
        return {
          index,
          type: e.type,
          file: false,
          format: media.format,
          width: media.width,
          height: media.height,
          blob,
          url,
        }
      case MediaType.VIDEO:
        return {
          index,
          type: e.type,
          file: false,
          format: media.format,
          width: media.width,
          height: media.height,
          length: media.length,
          blob,
          url,
        }
      default:
        throw new Error(`Unknown message type: ${e.type}`)
    }
  }))
}

async function toBlob(url: string): Promise<Blob> {
  return await client.get<Blob>(url, {
    responseType: 'blob',
  }).then(res => res.data)
}