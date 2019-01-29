import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm'
import * as pushid from 'pushid'

import { BaseModel } from '../../shared/baseModel'
import { PermissionModel } from '../permission/permissionModel'

@Entity({ name: 'resource'})
export class ResourceModel extends BaseModel {
  @PrimaryColumn({ name: 'id'})
  id: string

  @Column({ name: 'name', nullable: false})
  name: string

  @Column({ name: 'base_url', nullable: false})
  baseUrl: string

  @OneToMany(type => PermissionModel, permission => permission.id, { eager: false})
  permissions: PermissionModel[]

  public constructor(name: string, baseUrl: string) {
    super()

    this.id = pushid()
    this.name = name
    this.baseUrl = baseUrl
  }
}