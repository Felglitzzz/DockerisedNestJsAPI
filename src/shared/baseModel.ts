import { Column } from 'typeorm'

export class BaseModel {
  @Column({ name: 'stream_id', nullable: false})
  streamId: string

  @Column({ name: 'version', nullable: false})
  version: number
}