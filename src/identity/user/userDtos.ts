import { UserModel } from './userModel'
import { RoleModel } from '../role/roleModel'

import { RoleDto } from '../role/roleDtos'

export class UserDto {
  readonly firstName: string
  readonly lastName: string
  readonly name: string
  readonly email: string
  readonly phoneNumber: string
  readonly role: RoleDto

  public constructor(firstName: string, lastName: string, email: string, phoneNumber: string, role: RoleModel) {
    this.firstName = firstName
    this.lastName = lastName
    this.email = email
    this.phoneNumber = phoneNumber
    this.name = `${firstName} ${lastName}`

    if (role)
      this.role = RoleDto.mapModelToDto(role)
  }

  static mapModelToDto(user: UserModel) {
    return new UserDto(user.firstName, user.lastName, user.emailAddress, null, user.role)
  }
}