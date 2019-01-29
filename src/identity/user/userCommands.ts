import { IsString } from 'class-validator'
import { ApiModelProperty } from '@nestjs/swagger'

export class CreateUserCommand {
  @IsString()
  @ApiModelProperty()
  readonly firstName: string

  @IsString()
  @ApiModelProperty()
  readonly lastName: string

  @IsString()
  @ApiModelProperty()
  readonly emailAddress: string

  @ApiModelProperty()
  readonly picture: string

  public constructor(firstName: string, lastName: string, emailAddress: string, picture: string) {
    this.firstName = firstName
    this.lastName = lastName
    this.emailAddress = emailAddress
    this.picture = picture
  }
}