import { NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import * as bodyParser from 'body-parser'

import { ApplicationModule } from './applicationModule'
import { ValidationPipe } from './utils/validatorPipe'

const port = process.env.APP_PORT

async function bootstrap() {
  const application = await NestFactory.create(ApplicationModule)

  application.useGlobalPipes(new ValidationPipe())
  application.use(bodyParser.json())

  const options = new DocumentBuilder()
    .setTitle('MyAndela')
    .setDescription('API for my.andela.com')
    .setVersion('1.0')
    .build()

  const document = SwaggerModule.createDocument(application, options)

  SwaggerModule.setup('docs', application, document)

  await application.listen(port)

  console.info(`Andela API running on ${port}`)
}

bootstrap()