import { Inject } from '@nestjs/common'
import { Client } from 'ts-nats'
import { EntityManager } from 'typeorm'

import { TYPES } from '../../types'

import { EventModel } from './eventModel'

export interface IEventRepository{
  saveEvent(entityManager: EntityManager, event: EventModel): Promise<string>
  fetchLatestEventByStreamId(entityManager: EntityManager, streamId: string): Promise<EventModel>
}

export class EventRepository implements IEventRepository{
  private readonly natsClient: Client

  public constructor(
    @Inject(TYPES.NatsConnection) natsClient: Client,
  ) {
    this.natsClient = natsClient
  }

  async saveEvent(entityManager: EntityManager, event: EventModel): Promise<string> {
    await entityManager.save(event)

    this.natsClient.publish(`${event.streamName}.${event.type}`, JSON.stringify(event))

    return event.streamId
  }

  async fetchLatestEventByStreamId(entityManager: EntityManager, streamId: string): Promise<EventModel> {
    const eventsForStream = await entityManager
      .find(EventModel, { where: { streamId }, order: { version: 'DESC'} })

    return eventsForStream[0]
  }
}