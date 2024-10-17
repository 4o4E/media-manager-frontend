import type { MessageData } from '@/api/type'
import type { UnUploadMediaMessage } from '@/api/upload'
import { client } from '@/api/api'
import { now } from '@vueuse/core'

export async function toUnUpload(data: MessageData) {
  return await Promise.all(data.content.map(async e => {
    const index = now()
    if (e.type === 'text') {
      return {
        index,
        type: 'TEXT',
        content: e.content,
      }
    }
    const media = e as UnUploadMediaMessage
    const blob = await toBlob(`/api/file/${media.id}.${media.format}`)
    const url = URL.createObjectURL(blob)
    switch (e.type) {
      case 'audio':
        return {
          index,
          type: 'AUDIO',
          file: false,
          format: media.format,
          length: media.length,
          blob,
          url,
        }
      case 'image':
        return {
          index,
          type: 'IMAGE',
          file: false,
          format: media.format,
          width: media.width,
          height: media.height,
          blob,
          url,
        }
      case 'video':
        return {
          index,
          type: 'VIDEO',
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

async function toBlob(url: string): Blob {
  return await client.get<Blob>(url, {
    responseType: 'blob',
  }).then(res => res.data)
}