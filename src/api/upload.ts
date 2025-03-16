import { type HasLength, type HasSize, type MediaMediaType, MediaType } from '@/api/types/media'

export interface UnUploadElement {
  type: MediaType
  index: number
}

export interface UnUploadMediaElement extends UnUploadElement {
  id?: string
  type: MediaMediaType
  blob?: Blob
  format?: string
  width?: bigint
  height?: bigint
  length?: bigint
  url?: string
}

export interface UnUploadAudioMessage extends UnUploadMediaElement, HasLength {
  type: MediaType.AUDIO
  length: bigint
}

// export interface UnUploadBinaryMessage {
//   id: string
//   format: string
//   file: boolean
// }

export interface UnUploadImageMessage extends UnUploadMediaElement, HasSize {
  type: MediaType.IMAGE
  width: bigint
  height: bigint
}

export interface UnUploadVideoMessage extends UnUploadMediaElement, HasLength, HasSize {
  type: MediaType.VIDEO
  width: bigint
  height: bigint
  length: bigint
}

export interface UnUploadTextMessage extends UnUploadElement {
  type: MediaType.TEXT
  content: string
}