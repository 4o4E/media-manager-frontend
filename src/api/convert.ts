import type {
  HasFile, LocalAudioElement, LocalElement, LocalImageElement, LocalTextElement, LocalVideoElement,
  MediaElement,
  MessageData,
  TextElement,
  Uploaded, UploadedAudioElement, UploadedElement,
  UploadedImageElement, UploadedVideoElement
} from '@/api/types/media'
import { client } from '@/api/api'
import { now } from '@vueuse/core'
import { MediaType } from '@/api/types/media'

export async function toUnUpload(data: MessageData): Promise<LocalElement[]> {
  return await Promise.all(data.content.map(async (e: MediaElement): Promise<LocalElement> => {
    const index = now()
    if (e.type === MediaType.TEXT) {
      const text = e as TextElement
      return {
        index,
        type: e.type,
        content: text.content,
        origin: text
      } as LocalTextElement
    }
    const hasFile = e as MediaElement & Uploaded & HasFile
    const blob = await toBlob(`/api/file/${hasFile.id}.${hasFile.format}`)
    const url = URL.createObjectURL(blob)
    switch (e.type) {
      case MediaType.AUDIO:
        const audio = e as UploadedAudioElement
        return {
          index,
          type: audio.type,
          file: false,
          format: audio.format,
          length: audio.length,
          blob,
          url,
          origin: audio
        } as LocalAudioElement
      case MediaType.IMAGE:
        const image = e as UploadedImageElement
        return {
          index,
          type: image.type,
          file: false,
          format: image.format,
          width: image.width,
          height: image.height,
          blob,
          url,
          origin: image
        } as LocalImageElement
      case MediaType.VIDEO:
        const video = e as UploadedVideoElement
        return {
          index,
          type: video.type,
          file: false,
          format: hasFile.format,
          width: video.width,
          height: video.height,
          length: video.length,
          blob,
          url,
          origin: video
        } as LocalVideoElement
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