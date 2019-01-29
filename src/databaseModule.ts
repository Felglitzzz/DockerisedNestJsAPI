import { Module, Global } from '@nestjs/common'
import { FactoryProvider } from '@nestjs/common/interfaces'
import { createConnection } from 'typeorm'

import { TYPES } from './types'

import { PermissionModel } from './identity/permission/permissionModel'
import { ResourceModel } from './identity/resource/resourceModel'
import { RoleModel } from './identity/role/roleModel'
import { UserModel } from './identity/user/userModel'

import { EventModel } from './shared/event/eventModel'

const databaseProvider: FactoryProvider = {
  provide: TYPES.AsyncDatabaseConnection,
  useFactory: async () => await createConnection({
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: Number.parseInt(process.env.POSTGRES_PORT, 2),
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    entities: [
      PermissionModel, ResourceModel, RoleModel, UserModel, EventModel,
    ],
    synchronize: true,
    logging: process.env.DATABASE_LOGGING === 'true',
  }),
}

@Global()
@Module({
  providers: [databaseProvider],
  exports: [databaseProvider],
})

export class DatabaseModule {}