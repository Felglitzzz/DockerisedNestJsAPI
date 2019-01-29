import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import * as request from 'supertest'
import {} from 'ts-jest'
import * as bodyParser from 'body-parser'

import { ValidationPipe } from '../../utils/validatorPipe'

import { ApplicationModule } from '../../applicationModule'

let resources

describe('Identity Module', () => {
  describe('Resource Module', () => {
    let application: INestApplication
    let httpServer
    let url: string

    beforeAll(async () => {
      const applicationModuleFixture = await Test.createTestingModule({
        imports: [ApplicationModule],
      })
      .compile()

      application = applicationModuleFixture.createNestApplication()

      application.useGlobalPipes(new ValidationPipe())
      application.use(bodyParser.json())

      await application.init()

      httpServer = application.getHttpServer()
    })

    it('GET /api/v1/resource, should fetch all resources, with pagination', async () => {
      url = `/api/v1/resource?limit=10&offset=0`

      await request(httpServer)
        .get(url)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(response => {
          expect(response.body.length).toEqual(10)
        })
    })

    it('GET /api/v1/resource, should fetch all resources, with pagination, with name filter', async () => {
      url = `/api/v1/resource?limit=10&offset=0`

      await request(httpServer)
        .get(url)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(response => {
          resources = response.body
        })

      url = `/api/v1/resource?limit=10&offset=0&name=${resources[0].name}`

      await request(httpServer)
        .get(url)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(response => {
          expect(response.body.length).toBeGreaterThan(0)
          expect(response.body[0].name).toEqual(resources[0].name)
          expect(response.body[0].baseUrl).toEqual(resources[0].baseUrl)
        })
    })

    afterAll(async () => {
      await application.close()
    })
  })
})