import { request } from '@/utils/service'

export default class BasicService {
  private readonly prefix: string

  constructor(prefix: string) {
    this.prefix = prefix
  }

  // Generic HTTP methods
  async get<T>(method: string, params: any = {}) {
    return request<T>({
      url: `${this.prefix}/${method}`,
      method: 'get',
      params
    })
  }

  async post<T>(method: string, data: any) {
    return request<T>({
      url: `${this.prefix}/${method}`,
      method: 'post',
      data
    })
  }

  async put<T>(method: string, data: any) {
    return request<T>({
      url: `${this.prefix}/${method}`,
      method: 'put',
      data
    })
  }

  async patch<T>(method: string, data: any) {
    return request<T>({
      url: `${this.prefix}/${method}`,
      method: 'patch',
      data
    })
  }

  async delete<T>(id: any) {
    return request<T>({
      url: `${this.prefix}/${id}`,
      method: 'delete'
    })
  }

  // CRUD operations
  async getOne<T>(id: any) {
    return request<T>({
      url: `${this.prefix}/${id}`,
      method: 'get'
    })
  }

  async query<T>(params = {}) {
    return request<T>({
      url: this.prefix,
      method: 'get',
      params
    })
  }

  async create<T>(data: any) {
    return request<T>({
      url: this.prefix,
      method: 'post',
      data
    })
  }

  async update(data: any) {
    return request({
      url: `${this.prefix}/${data.id}`,
      method: 'patch',
      data
    })
  }

  async updatePvz(data: any) {
    return request({
      url: `${this.prefix}/${data.id}`,
      method: 'put',
      data
    })
  }

  async save(data: any) {
    if (data.id) {
      return this.update(data)
    } else {
      return this.create(data)
    }
  }
}
