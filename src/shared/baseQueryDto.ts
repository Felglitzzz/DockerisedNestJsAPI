import { IsString } from 'class-validator'

export class BaseQueryRequestDto {
  @IsString()
  public readonly limit: string

  @IsString()
  public readonly offset: string

  public constructor(limit: string, offset: string) {
    this.limit = limit
    this.offset = offset
  }
}