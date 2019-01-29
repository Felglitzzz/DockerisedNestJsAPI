import { Injectable, NestMiddleware, MiddlewareFunction } from '@nestjs/common'

import * as tracer from 'dd-trace'

const ddTracer = tracer.init({
  hostname: process.env.APP_URL,
  port: process.env.APP_PORT,
  env: process.env.NODE_ENV || 'development',
  protocol: 'http',
  flushInterval: 1000,
})

@Injectable()
export class DataDogTracingMiddleware implements NestMiddleware {
  async resolve(serviceName: string): Promise<MiddlewareFunction> {
    return async (request, response, next) => {
      await next()

      const span = ddTracer.startSpan(`${request.method} ${request.url}`)
      span.setTag('service', serviceName)
      span.finish()
    }
  }
}