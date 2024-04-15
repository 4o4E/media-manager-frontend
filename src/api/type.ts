export type User = {
  id: number,
  name: string
}

export interface Login {
  userId: number,
  token: string,
  expire: number,
  perms: Set<string>
}

export interface MessageInfo {
  id: string
  upload: number
  time: number
  type: string
  approved: number
  tags: string[]
}

export interface AudioMessage {
  id: string
  format: string
  file: boolean
  length: number
}

export interface BinaryMessage {
  id: string
  format: string
  file: boolean
}

export interface ImageMessage {
  id: string
  format: string
  file: boolean
  width: number
  height: number
}

export class ImageMessageImpl {
  id: string
  format: string
  file: boolean
  width: number
  height: number

  constructor(id: string, format: string, file: boolean, width: number, height: number) {
    this.id = id
    this.format = format
    this.file = file
    this.width = width
    this.height = height
  }
}

export interface VideoMessage {
  id: string
  format: string
  file: boolean
  width: number
  height: number
  length: number
}

export interface TextMessage {
  content: string
}

export type Message = AudioMessage | BinaryMessage | ImageMessage | VideoMessage | TextMessage

export interface MessageComment {
  index: number
  sender: number
  type: 'Markdown' | 'HTML',
  content: String,
  time: number,
}

export interface MessageCommentList {
  list: MessageComment[]
  current: number
}

export interface MessageData {
  info: MessageInfo
  data: Message[]
  comment: MessageCommentList
}