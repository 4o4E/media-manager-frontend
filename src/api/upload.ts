import type { HasLength, HasSize } from '@/api/type'
import type { UploadRawFile } from 'element-plus'

export interface UnUploadMessage {
  type: 'TEXT' | 'AUDIO' | 'IMAGE' | 'VIDEO'
}

export interface UnUploadMediaMessage extends UnUploadMessage {
  type: 'AUDIO' | 'IMAGE' | 'VIDEO'
  file?: UploadRawFile
  format?: string
}

export interface UnUploadAudioMessage extends UnUploadMediaMessage, HasLength {
  type: 'AUDIO'
}

// export interface UnUploadBinaryMessage {
//   id: string
//   format: string
//   file: boolean
// }

export interface UnUploadImageMessage extends UnUploadMediaMessage, HasSize {
  type: 'IMAGE'
}

export interface UnUploadVideoMessage extends UnUploadMediaMessage, HasLength, HasSize {
  type: 'VIDEO'
}

export interface UnUploadTextMessage extends UnUploadMessage {
  type: 'TEXT'
  content: string
}