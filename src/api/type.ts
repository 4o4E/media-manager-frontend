export interface User {
  id: bigint
  name: string
  point: bigint
  roles: bigint[]
}

export interface Role {
  id: bigint
  name: string
  remark: string
  perms: string[]
}

export interface Perm {
  perm: string
  desc: string
  default: boolean
}

export interface Login {
  userId: bigint,
  token: string,
  expire: bigint,
  roles: Role[],
  perms: string[]
}

export interface Tag {
  id: bigint
  names: string[]
  remark: string
}

export enum SearchType {
  ANY = 0,
  ALL = 1,
}