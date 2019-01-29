import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common'
import { HelmetMiddleware } from '@nest-middlewares/helmet'
import { CorsMiddleware } from '@nest-middlewares/cors'
import { ResponseTimeMiddleware } from '@nest-middlewares/response-time'
import { StatusMonitorModule, StatusMonitorConfiguration } from 'nest-status-monitor'
import * as passport from 'passport'

import * as dotenv from 'dotenv'

dotenv.config()

import { Auth0Strategy } from './utils/auth/auth0Strategy'
import { GoogleStrategy } from './utils/auth/googleStrategy'
import { JwtStrategy } from './utils/auth/jwtStrategy'

import { DataDogTracingMiddleware } from './utils/tracer'

import { DatabaseModule } from './databaseModule'
import { NatsModule } from './natsModule'

import { IdentityModule } from './identity/identityModule'

const port = Number.parseFloat(process.env.APP_PORT)
const url = process.env.APP_URL

const statusMonitorConfig: StatusMonitorConfiguration = {
  pageTitle: 'MyAndela Server Monitoring Page',
  port,
  path: '/status',
  ignoreStartsWith: '/health/alive',
  healthChecks: [
    {
      protocol: 'http',
      host: url,
      path: '/health/alive',
      port,
    },
  ],
  spans: [
    {
      interval: 1, // Every second
      retention: 60, // Keep 60 datapoints in memory
    },
    {
      interval: 5, // Every 5 seconds
      retention: 60,
    },
    {
      interval: 15, // Every 15 seconds
      retention: 60,
    },
    {
      interval: 60, // Every 60 seconds
      retention: 600,
    },
  ],
  chartVisibility: {
    cpu: true,
    mem: true,
    load: true,
    responseTime: true,
    rps: true,
    statusCodes: true,
  },
}

@Module({
  providers: [
    GoogleStrategy, Auth0Strategy, JwtStrategy,
  ],
  imports: [
    StatusMonitorModule.setUp(statusMonitorConfig),
    DatabaseModule, NatsModule,
    IdentityModule,
  ],
})

export class ApplicationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    HelmetMiddleware.configure({
      dnsPrefetchControl: false,
      frameguard: true,
      hidePoweredBy: true,
    })

    consumer
      .apply(HelmetMiddleware)
      .forRoutes(
        { path: '*', method: RequestMethod.ALL },
      )

    CorsMiddleware.configure({
      origin: ['my.andela.com'],
      methods: ['POST, GET, OPTIONS, PUT, DELETE, PATCH'],
      allowedHeaders: ['Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization'],
      exposedHeaders: ['Content-Length'],
      credentials: true,
      maxAge: 86400,
    })

    consumer
      .apply(CorsMiddleware)
      .forRoutes(
        { path: '*', method: RequestMethod.ALL },
      )

    ResponseTimeMiddleware.configure({
      digits: 3,
      header: 'X-Response-Time',
    })

    consumer
      .apply(ResponseTimeMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL})

    // consumer
    //   .apply(DataDogTracingMiddleware)
    //   .with('my_andela_api')
    //   .forRoutes({ path: '*', method: RequestMethod.ALL})

    consumer
      .apply(passport.authenticate('jwt', { session: false }))
      .exclude(
        '/login',
        '/auth/google', '/auth/google/callback',
        '/auth/auth0', '/auth/auth0/callback',
        '/health/alive',
      )
      .forRoutes(
        { path: '/test', method: RequestMethod.GET},
        // { path: '/api/v1/', method: RequestMethod.ALL},
      )
  }
}