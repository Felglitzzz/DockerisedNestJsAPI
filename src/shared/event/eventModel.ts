import { Entity, Column, PrimaryColumn } from 'typeorm'
import * as pushid from 'pushid'

@Entity({ name: 'event'})
export class EventModel {
  @PrimaryColumn({ name: 'id', unique: true, nullable: false})
  id: string

  @Column({ name: 'stream_id', nullable: false})
  streamId: string

  @Column({ name: 'stream_name', nullable: false})
  streamName: string

  @Column({ name: 'version', nullable: false})
  version: number

  @Column({ name: 'data', type: 'json', nullable: false})
  data: any

  @Column({ name: 'type', nullable: false})
  type: string

  @Column({ name: 'log_date', nullable: false})
  logDate: Date

  public constructor(streamName: string, type: string, data: any, streamId: string = null, latestEventVersion: number = null) {
    this.id = pushid()
    this.streamName = streamName
    this.data = data
    this.type = type
    this.streamId = streamId ? streamId : pushid()
    this.version = latestEventVersion ? (latestEventVersion + 1) : 1
    this.logDate = new Date()
  }
}