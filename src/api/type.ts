export interface User {
  id: number
  name: string
  point: number
}

export interface Role {
  id: number
  name: string
  description: string
}

export interface Login {
  userId: number,
  token: string,
  expire: number,
  roles: Role[],
  perms: string[]
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

export interface HasSize {
  width: number
  height: number
}

export interface HasLength {
  length: number
}

export interface ImageMessage extends HasSize {
  id: string
  format: string
  file: boolean
  width: number
  height: number
}

export interface VideoMessage extends HasSize {
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

export type Message = {
  type: 'audio' | 'binary' | 'image' | 'video' | 'text'
} & (AudioMessage | BinaryMessage | ImageMessage | VideoMessage | TextMessage)

export interface MessageComment {
  index: number
  sender: number
  type: 'Markdown' | 'HTML',
  content: string,
  time: number,
}

export interface MessageData {
  id: string
  upload: number
  time: number
  type: string
  approved: number
  tags: number[]
  content: Message[]
}

export interface MessageViewData {
  message: MessageData
  index: number
  element?: HTMLElement
  displayWidth?: number
  displayHeight?: number
  cardHeight?: number
}