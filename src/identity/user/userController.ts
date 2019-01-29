import { Controller, Inject, Post, Body, UseGuards} from '@nestjs/common'
import { ApiUseTags } from '@nestjs/swagger'

import { TYPES } from '../../types'

import { IUserService } from './userService'

import { CreateUserCommand } from './userCommands'

@Controller('api/v1/user')
@ApiUseTags('User')
export class UserController {
  private readonly userService: IUserService

  public constructor(
    @Inject(TYPES.IUserService) userService: IUserService,
  ){
    this.userService = userService
  }

  @Post()
  async create(@Body() createUserDto: CreateUserCommand): Promise<string> {
    return await this.userService.createUser(createUserDto)
  }
}