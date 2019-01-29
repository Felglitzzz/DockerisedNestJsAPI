import { BaseQueryRequestDto } from '../../shared/baseQueryDto'

import { ResourceModel } from './resourceModel'

export class ResourceDto {
  readonly id: string
  readonly name: string
  readonly baseUrl: string

  public constructor(id: string, name: string, baseUrl: string) {
    this.id = id
    this.name = name
    this.baseUrl = baseUrl
  }

  static mapModelToDto(resourceModel: ResourceModel) {
    return new ResourceDto(resourceModel.id, resourceModel.name, resourceModel.baseUrl)
  }
}

export class QueryResourceRequestDto extends BaseQueryRequestDto {
  readonly name: string
  readonly baseUrl: string

  public constructor(limit: string, offset: string, name?: string, baseUrl?: string) {
    super(limit, offset)
    this.name = name
    this.baseUrl = baseUrl
  }
}