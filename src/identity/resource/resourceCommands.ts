import { IsString } from 'class-validator'
import { ApiModelProperty } from '@nestjs/swagger'

export class CreateResourceCommand {
  @IsString()
  @ApiModelProperty()
  readonly name: string

  @IsString()
  @ApiModelProperty()
  readonly baseUrl: string

  public constructor(name: string, baseUrl: string) {
    this.name = name
    this.baseUrl = baseUrl
  }
}