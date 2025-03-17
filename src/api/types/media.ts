export enum MediaType {
  AUDIO = 'audio',
  IMAGE = 'image',
  VIDEO = 'video',
  TEXT = 'text'
}

export const MediaTypes = {
  'image': { label: '图片', enum: MediaType.IMAGE },
  'video': { label: '视频', enum: MediaType.VIDEO },
  'audio': { label: '音频', enum: MediaType.AUDIO },
  'text': { label: '文本', enum: MediaType.TEXT },
}

export type MediaMediaType = MediaType.AUDIO | MediaType.VIDEO | MediaType.IMAGE

export interface MediaElement {
  type: MediaType
}

/**
 * 已上传的
 */
export interface Uploaded {
  id: string
}

/**
 * 未上传的
 */
export interface Local {
  /**
   * 唯一序号
   */
  index?: number
  /**
   * 本地文件
   */
  blob?: Blob
  /**
   * object url
   */
  url?: string
}

export type LocalElement = MediaElement & Local | LocalTextElement
export type UploadedElement = MediaElement & Uploaded | TextElement

/**
 * 有尺寸的媒体元素
 */
export interface HasSize {
  width: number
  height: number
}

/**
 * 有长度的媒体元素
 */
export interface HasLength {
  length: number
}

export interface HasFile {
  format: string
  file: boolean
}

/**
 * 二进制文件
 */
export interface BinaryElement extends MediaElement, HasFile {}

/**
 * 未上传的二进制文件
 */
export interface LocalBinaryElement extends BinaryElement, Local {}

/**
 * 已上传的二进制文件
 */
export interface UploadedBinaryElement extends BinaryElement, Uploaded {}

/**
 * 音频元素
 */
export interface AudioElement extends MediaElement, HasLength, HasFile {}

/**
 * 未上传的音频元素
 */
export interface LocalAudioElement extends AudioElement, Local {}

/**
 * 已上传的音频元素
 */
export interface UploadedAudioElement extends AudioElement, Uploaded {}

/**
 * 图片元素
 */
export interface ImageElement extends MediaElement, HasSize, HasFile {}

/**
 * 未上传的图片元素
 */
export interface LocalImageElement extends ImageElement, Local {}

/**
 * 已上传的图片元素
 */
export interface UploadedImageElement extends ImageElement, Uploaded {}

/**
 * 视频元素
 */
export interface VideoElement extends MediaElement, HasSize, HasLength, HasFile {}

/**
 * 未上传的视频元素
 */
export interface LocalVideoElement extends MediaElement, HasSize, HasLength, HasFile, Local {}

/**
 * 已上传的视频元素
 */
export interface UploadedVideoElement extends MediaElement, HasSize, HasLength, HasFile, Uploaded {}

/**
 * 文本元素
 */
export interface TextElement extends MediaElement {
  content: string
}

/**
 * 未上传的文本元素
 */
export interface LocalTextElement extends TextElement, Local {}

export interface MessageComment {
  index: number
  sender: number
  type: 'Markdown' | 'HTML',
  content: string,
  time: bigint,
}

export interface MediaContentDto {
  id?: bigint
  tags: bigint[]
  messages: MediaElement[]
}

export interface MessageData {
  id: bigint
  upload: bigint
  time: bigint
  type: MediaType
  approved: number
  tags: bigint[]
  content: MediaElement[]
  liked: boolean
}

export interface MessageViewData {
  message: MessageData
  index: number
  element?: HTMLElement
  displayWidth: number
  displayHeight: number
  cardHeight: number
}