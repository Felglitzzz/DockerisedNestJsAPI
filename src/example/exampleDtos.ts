import { BaseQueryRequestDto } from '../shared/baseQueryDto'

import { ExampleModel } from './exampleModel'

export class ExampleDto {
  readonly id: string
  readonly name: string
  readonly baseUrl: string

  public constructor(id: string, name: string, baseUrl: string) {
    this.id = id
    this.name = name
    this.baseUrl = baseUrl
  }

  static mapModelToDto(resourceModel: ExampleModel) {
    return new ExampleDto(resourceModel.id, resourceModel.name, resourceModel.baseUrl)
  }
}

export class QueryExampleRequestDto extends BaseQueryRequestDto {
  readonly name: string
  readonly baseUrl: string
}