import { Inject, BadRequestException } from '@nestjs/common'
import { Connection } from 'typeorm'
import { Client } from 'ts-nats'
import * as pushid from 'pushid'
import { sign } from 'jsonwebtoken'

import { TYPES } from '../../types'

import { IUserRepository } from './userRepository'
import { IEventRepository } from '../../shared/event/eventRepository'

import { CreateUserCommand } from './userCommands'

import { EventModel } from '../../shared/event/eventModel'
import { UserModel } from './userModel'
// import { EmployeeModel } from '../../employee/models/employeeModel'

import { UserDto } from './userDtos'

export interface IUserService {
  createUser(userDto: CreateUserCommand): Promise<string>
  validateUser(email: string): Promise<string>
}

export class UserService implements IUserService{
  private readonly natsClient: Client
  private readonly asyncDatabaseConnection: Connection
  private readonly eventRepository: IEventRepository
  private readonly userRepository: IUserRepository

  public constructor(
    @Inject(TYPES.NatsConnection) natsClient: Client,
    @Inject(TYPES.AsyncDatabaseConnection) asyncDatabaseConnection: Connection,
    @Inject(TYPES.IEventRepository) eventRepository: IEventRepository,
    @Inject(TYPES.IUserRepository) userRepository: IUserRepository,
  ){
    this.natsClient = natsClient
    this.asyncDatabaseConnection = asyncDatabaseConnection
    this.eventRepository = eventRepository
    this.userRepository = userRepository

    this.registerSubscribers()
  }

  async createUser(createUserCommand: CreateUserCommand): Promise<string> {
    if (!createUserCommand.firstName || createUserCommand.firstName === '' )
      throw new BadRequestException('User firstname is required')
    if (!createUserCommand.lastName || createUserCommand.lastName === '' )
      throw new BadRequestException('User lastname is required')
    if (!createUserCommand.emailAddress || createUserCommand.emailAddress === '' )
      throw new BadRequestException('User email address is required')

    const userExists =
      await this.userRepository.fetchUserByEmail(this.asyncDatabaseConnection.manager, createUserCommand.emailAddress)

    if (userExists){
      throw new BadRequestException(`User already exists - ${createUserCommand.emailAddress}`)
    }

    const user = this.mapCreatedUser(createUserCommand)

    const queryRunner = this.asyncDatabaseConnection.createQueryRunner()

    await queryRunner.startTransaction()

    try {
      const event = new EventModel(TYPES.STREAMS.User, TYPES.EVENTS.UserCreatedEvent, user)

      await this.eventRepository.saveEvent(queryRunner.manager, event)

      user.streamId = event.streamId
      user.version = event.version

      await this.userRepository.saveUser(queryRunner.manager, user)

      await queryRunner.commitTransaction()

      return user.id
    } catch (error) {
      await queryRunner.rollbackTransaction

      console.error(error)

      throw new Error('An error occured, check logs for details')
    } finally{
      await queryRunner.release()
    }
  }

  async validateUser(email: string): Promise<string> {
    const user = await this.userRepository.fetchUserByEmail(this.asyncDatabaseConnection.manager, email)

    const jwt = sign(JSON.parse(JSON.stringify(UserDto.mapModelToDto(user))), process.env.JWT_AUTH_PRIVATE_KEY, { expiresIn: '1d' })

    return jwt
  }

  private mapCreatedUser(userDto: CreateUserCommand): UserModel{
    const user = new UserModel()

    user.id = pushid()
    user.firstName = userDto.firstName
    user.lastName = userDto.lastName
    user.emailAddress = userDto.emailAddress

    return user
  }

  private registerSubscribers() {
    // this.natsClient.subscribe('Employee.EmployeeCreatedEvent', async (error, message) => {
    //   const event = JSON.parse(message.data)
    //   const employee: EmployeeModel = event.data

    //   const user = new CreateUserCommand(employee.firstName, employee.lastName, employee.emailAddress, '')

    //   await this.createUser(user)
    // })
  }
}