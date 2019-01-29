import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import * as request from 'supertest'
import {} from 'ts-jest'
import * as bodyParser from 'body-parser'

import { IdentityModule } from '../../identityModule'

import { DatabaseModule } from '../../../databaseModule'
import { NatsModule } from '../../../natsModule'

describe('Identity Module', () => {
  describe('Resource Module', () => {
    let application: INestApplication
    let httpServer

    beforeAll(async () => {
      const identityModuleFixture = await Test.createTestingModule({
        imports: [DatabaseModule, NatsModule, IdentityModule],
      }).compile()

      application = identityModuleFixture.createNestApplication()
      application.use(bodyParser.json())

      await application.init()

      httpServer = application.getHttpServer()
    })

    it('POST /api/v1/resource, should create an resource', async () => {
      const resource = {
        name: 'user1',
        baseUrl: '/api/v1/user1',
      }

      await request(httpServer)
        .post('/api/v1/resource')
        .set('Accept', 'application/json')
        .send(resource)
        .expect(201)
        .expect('Content-Type', /text\/html/)
        .expect(response => {
          expect(response.text).not.toBeNull()
        })
    })

    it('GET /api/v1/resource/:id, should fetch an existing resource', async () => {
      let resourceId

      const resource = {
        name: 'employee1',
        baseUrl: '/api/v1/employee1',
      }

      await request(httpServer)
        .post('/api/v1/resource')
        .set('Accept', 'application/json')
        .send(resource)
        .expect(201)
        .expect('Content-Type', /text\/html/)
        .expect(response => {
          expect(response.text).not.toBeNull()
          resourceId = response.text
        })

      await request(httpServer)
        .get(`/api/v1/resource/${resourceId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(response => {
          expect(response.body.name).toEqual(resource.name)
          expect(response.body.baseUrl).toEqual(resource.baseUrl)
        })
    })

    afterAll(async () => {
      await application.close()
    })
  })
})
