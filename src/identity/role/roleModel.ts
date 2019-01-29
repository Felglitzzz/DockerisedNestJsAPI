import { Entity, Column, PrimaryColumn, OneToOne, OneToMany, ManyToMany, JoinTable } from 'typeorm'
import * as pushid from 'pushid'

import { BaseModel } from '../../shared/baseModel'
import { UserModel } from '../user/userModel'
import { PermissionModel } from '../permission/permissionModel'

@Entity({ name: 'role'})
export class RoleModel extends BaseModel {
  @PrimaryColumn({ name: 'id', unique: true, nullable: false})
  id: string

  @Column({ name: 'name', nullable: false})
  name: string

  @OneToOne(type => RoleModel, roleModel => roleModel.parentRoleId)
  @Column({ name: 'parent_role_id', nullable: true})
  parentRoleId: string

  @ManyToMany(type => PermissionModel, permission => permission.id, { eager: true, cascade: false})
  @JoinTable({ name: 'role_permission'})
  permissions: PermissionModel[]

  @OneToMany(type => UserModel, user => user.role, { eager: false, cascade: false})
  users: UserModel[]

  public constructor(name: string, parentRoleId: string, permissions: Array<PermissionModel>) {
    super()
    this.id = pushid()
    this.name = name
    this.parentRoleId = parentRoleId
    this.permissions = permissions
  }
}