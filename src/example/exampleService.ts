import { BadRequestException, Inject } from '@nestjs/common'
import { Connection } from 'typeorm'

import { TYPES } from '../types'

import { IEventRepository } from '../shared/event/eventRepository'
import { IExampleRepository } from './exampleRepository'

import { CreateExampleCommand } from './exampleCommands'

import { QueryExampleRequestDto, ExampleDto } from './exampleDtos'

import { EventModel } from '../shared/event/eventModel'
import { ExampleModel } from './exampleModel'

export interface IExampleService {
  createExample(createExampleCommand: CreateExampleCommand): Promise<string>
  fetchExampleById(id: string): Promise<ExampleDto>
  fetchAllExamples(queryExampleRequestDto: QueryExampleRequestDto): Promise<Array<ExampleDto>>
}

export class ExampleService implements IExampleService {
  private readonly asyncDatabaseConnection: Connection
  private readonly eventRepository: IEventRepository
  private readonly exampleRepository: IExampleRepository

  public constructor(
    @Inject(TYPES.AsyncDatabaseConnection) asyncDatabaseConnection: Connection,
    @Inject(TYPES.IEventRepository) eventRepository: IEventRepository,
    @Inject(TYPES.IExampleRepository) exampleRepository: IExampleRepository,
  ) {
    this.asyncDatabaseConnection = asyncDatabaseConnection
    this.eventRepository = eventRepository
    this.exampleRepository = exampleRepository
  }

  async createExample(createExampleCommand: CreateExampleCommand): Promise<string> {
    if (!createExampleCommand.name || createExampleCommand.name.length === 0)
      throw new BadRequestException('Example name is required')
    if (!createExampleCommand.baseUrl || createExampleCommand.baseUrl.length === 0)
      throw new BadRequestException('Example base url is required')

    const exampleExists = await this.exampleRepository.fetchExampleByName(this.asyncDatabaseConnection.manager, createExampleCommand.name)

    if (exampleExists)
      throw new BadRequestException(`Example already exists - ${createExampleCommand.name}`)

    const example = this.mapCommandToModel(createExampleCommand)

    const queryRunner = this.asyncDatabaseConnection.createQueryRunner()

    await queryRunner.startTransaction()

    try {
      const event = new EventModel(TYPES.STREAMS.Example, TYPES.EVENTS.ExampleCreatedEvent, example)

      await this.eventRepository.saveEvent(queryRunner.manager, event)

      example.streamId = event.streamId
      example.version = event.version

      await this.exampleRepository.createOrUpdateExample(queryRunner.manager, example)

      await queryRunner.commitTransaction()

      return example.id
    } catch (error) {
      await queryRunner.rollbackTransaction

      console.error(error)

      throw new Error('An error occured, check logs for details')
    } finally{
      await queryRunner.release()
    }
  }

  async fetchExampleById(id: string): Promise<ExampleDto> {
    const exampleModel = await this.exampleRepository.fetchExampleById(this.asyncDatabaseConnection.manager, id)

    return ExampleDto.mapModelToDto(exampleModel)
  }

  async fetchAllExamples(queryExampleRequestDto: QueryExampleRequestDto): Promise<Array<ExampleDto>> {
    const skipTake = { skip: parseInt(queryExampleRequestDto.offset, 0), take: parseInt(queryExampleRequestDto.limit, 0)}
    const where: {[k: string]: any} = {}

    if (queryExampleRequestDto.name && queryExampleRequestDto.name.length > 0) {
      where.name = queryExampleRequestDto.name
    }

    if (queryExampleRequestDto.baseUrl && queryExampleRequestDto.baseUrl.length > 0) {
      where.baseUrl = queryExampleRequestDto.baseUrl
    }

    const exampleModelList = await this.exampleRepository.fetchAllExamples(this.asyncDatabaseConnection.manager, skipTake, where)

    const examples = exampleModelList.map(k => ExampleDto.mapModelToDto(k))

    return examples
  }

  private mapCommandToModel(createExampleCommand: CreateExampleCommand): ExampleModel {
    return new ExampleModel(createExampleCommand.name, createExampleCommand.baseUrl)
  }
}
