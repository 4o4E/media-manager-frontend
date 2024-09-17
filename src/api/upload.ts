import type { HasLength, HasSize } from '@/api/type'
import type { UploadFile } from 'element-plus'

export interface UnUploadMessage {
  type: 'TEXT' | 'AUDIO' | 'IMAGE' | 'VIDEO'
}

export interface UnUploadMediaMessage extends UnUploadMessage {
  type: 'AUDIO' | 'IMAGE' | 'VIDEO'
  file?: UploadFile
  format?: string
  width?: number
  height?: number
  length?: number
  url?: string
}

export interface UnUploadAudioMessage extends UnUploadMediaMessage, HasLength {
  type: 'AUDIO'
  length: number
}

// export interface UnUploadBinaryMessage {
//   id: string
//   format: string
//   file: boolean
// }

export interface UnUploadImageMessage extends UnUploadMediaMessage, HasSize {
  type: 'IMAGE'
  width: number
  height: number
}

export interface UnUploadVideoMessage extends UnUploadMediaMessage, HasLength, HasSize {
  type: 'VIDEO'
  width: number
  height: number
  length: number
}

export interface UnUploadTextMessage extends UnUploadMessage {
  type: 'TEXT'
  content: string
}