import { Entity, Column, PrimaryColumn, ManyToOne } from 'typeorm'

import { BaseModel } from '../../shared/baseModel'
import { RoleModel } from '../role/roleModel'

@Entity({ name: 'user'})
export class UserModel extends BaseModel {
  @PrimaryColumn({ name: 'id'})
  id: string

  @Column({ name: 'first_name', nullable: false})
  firstName: string

  @Column({ name: 'last_name', nullable: false})
  lastName: string

  @Column({ name: 'email_address', nullable: false})
  emailAddress: string

  @Column({ name: 'status', nullable: false, default: true})
  status: boolean

  @ManyToOne(type => RoleModel, role => role.users, { eager: true})
  role: RoleModel
}
