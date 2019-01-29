import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm'
import * as pushid from 'pushid'

import { BaseModel } from '../../shared/baseModel'
import { ResourceModel } from '../resource/resourceModel'

@Entity({ name: 'permission'})
export class PermissionModel extends BaseModel {
  @PrimaryColumn({ name: 'id', unique: true, nullable: false})
  id: string

  @Column({ name: 'permission_type', nullable: false})
  permissionType: number

  @ManyToOne(type => ResourceModel, resource => resource.id, { eager: true})
  @JoinColumn({ name: 'resource_id'})
  resource: ResourceModel

  @Column({ name: 'is_custom', nullable: false, default: false})
  isCustom: boolean

  @Column({ name: 'custom_name', nullable: true})
  customName: string

  public constructor(resource: ResourceModel, permissionType: number, isCustom: boolean, customName: string) {
    super()

    this.id = pushid()
    this.resource = resource
    this.permissionType = permissionType
    this.isCustom = isCustom
    this.customName = customName
  }
}