import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm'
import * as pushid from 'pushid'

import { BaseModel } from '../shared/baseModel'

@Entity({ name: 'resource'})
export class ExampleModel extends BaseModel {
  @PrimaryColumn({ name: 'id'})
  id: string

  @Column({ name: 'name', nullable: false})
  name: string

  @Column({ name: 'base_url', nullable: false})
  baseUrl: string

  public constructor(name: string, baseUrl: string) {
    super()

    this.id = pushid()
    this.name = name
    this.baseUrl = baseUrl
  }
}