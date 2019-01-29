import { Module, Global } from '@nestjs/common'
import { FactoryProvider } from '@nestjs/common/interfaces'
import { connect, Client } from 'ts-nats'

import { TYPES } from './types'

const natsProvider: FactoryProvider = {
  provide: TYPES.NatsConnection,
  useFactory: async (): Promise<Client>  => await connect(`${process.env.NATS_URL}`),
}

@Global()
@Module({
  providers: [natsProvider],
  exports: [natsProvider],
})

export class NatsModule {}