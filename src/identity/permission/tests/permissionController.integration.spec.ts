import { INestApplication, HttpServer } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import * as request from 'supertest'
import {} from 'ts-jest'
import * as bodyParser from 'body-parser'

import { IdentityModule } from '../../identityModule'

import { DatabaseModule } from '../../../databaseModule'
import { NatsModule } from '../../../natsModule'

let resourceId
let resource

describe('Identity Module', () => {
  describe('Permission Module', () => {
    let application: INestApplication
    let httpServer: HttpServer

    beforeAll(async () => {
      const identityModuleFixture = await Test.createTestingModule({
        imports: [DatabaseModule, NatsModule, IdentityModule],
      })
      .compile()

      application = identityModuleFixture.createNestApplication()

      application.use(bodyParser.json())

      await application.init()

      httpServer = application.getHttpServer()

      resource = {
        name: 'user2',
        baseUrl: '/api/v1/user2',
      }

      await request(httpServer)
        .post('/api/v1/resource')
        .set('Accept', 'application/json')
        .send(resource)
        .expect(201)
        .expect('Content-Type', /text\/html/)
        .expect(response => {
          resourceId = response.text
        })
    })

    it('GET /api/v1/permission/types, should fetch permission types', async () => {
      await request(httpServer)
        .get('/api/v1/permission/types')
        .expect(200)
        .expect(response => {
          const permissionTypes = response.body
          expect(permissionTypes[0].id).toEqual(1)
          expect(permissionTypes[0].name).toEqual('CAN_CREATE')
          expect(permissionTypes[1].id).toEqual(2)
          expect(permissionTypes[1].name).toEqual('CAN_READ')
          expect(permissionTypes[2].id).toEqual(3)
          expect(permissionTypes[2].name).toEqual('CAN_UPDATE')
          expect(permissionTypes[3].id).toEqual(4)
          expect(permissionTypes[3].name).toEqual('CAN_DELETE')
        })
    })

    it('POST /api/v1/permission, should create a permission for a resource', async () => {
      let permissionType

      await request(httpServer)
        .get('/api/v1/permission/types')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(response => {
          permissionType = response.body[0].id
        })

      const permission = {
        resource: resourceId,
        permissionType,
        isCustom: false,
      }

      await request(httpServer)
        .post('/api/v1/permission')
        .set('Accept', 'application/json')
        .send(permission)
        .expect(201)
        .expect('Content-Type', /text\/html/)
        .expect(response => {
          expect(response.text).not.toBeNull()
        })
    })

    it('POST /api/v1/permission, should create a custom permission for a resource', async () => {
      const permission = {
        resource: resourceId,
        permissionType: 0,
        isCustom: true,
        customName: `CAN_VIEW_${resource.name}_DETAILS`.toUpperCase(),
      }

      await request(httpServer)
        .post('/api/v1/permission')
        .set('Accept', 'application/json')
        .send(permission)
        .expect(201)
        .expect('Content-Type', /text\/html/)
        .expect(response => {
          expect(response.text).not.toBeNull()
        })
    })

    it('POST /api/v1/permission, similar permission, should throw an error', async () => {
      let permissionType

      await request(httpServer)
        .get('/api/v1/permission/types')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(response => {
          permissionType = response.body[0].id
        })

      const permission = {
        resource: resourceId,
        permissionType,
        isCustom: false,
      }

      await request(httpServer)
        .post('/api/v1/permission')
        .set('Accept', 'application/json')
        .send(permission)
        .expect(400)
        .expect('Content-Type', /json/)
        .expect(response => {
          expect(response.body.message).toEqual(`Permission already exists - ${permissionType}`)
        })
    })

    it('GET /api/v1/permission/:id, should fetch a permission', async () => {
      let permissionType

      await request(httpServer)
        .get('/api/v1/permission/types')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(response => {
          permissionType = response.body[1].id
        })

      const permission = {
        resource: resourceId,
        permissionType,
        isCustom: false,
      }

      let permissionId

      await request(httpServer)
        .post('/api/v1/permission')
        .set('Accept', 'application/json')
        .send(permission)
        .expect(201)
        .expect('Content-Type', /text\/html/)
        .expect(response => {
          permissionId = response.text
        })

      await request(httpServer)
        .get(`/api/v1/permission/${permissionId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(response => {
          expect(response.body.permissionType).toEqual(permissionType)
          expect(response.body.resourceName).toEqual(resource.name)
          expect(response.body.resourceBaseUrl).toEqual(resource.baseUrl)
        })

    })

    it('POST /api/v1/permission, with no resource id, should throw an error', async () => {
      const permission = {
        permissionType: 1,
        isCustom: false,
      }

      await request(httpServer)
        .post('/api/v1/permission')
        .set('Accept', 'application/json')
        .send(permission)
        .expect(400)
        .expect('Content-Type', /json/)
        .expect(response => {
          expect(response.body.message).toEqual('Resource is required')
        })
    })

    it('POST /api/v1/permission, with invalid resource id, should throw an error', async () => {
      const permission = {
        resource: '12345678',
        permissionType: 1,
        isCustom: false,
      }

      await request(httpServer)
        .post('/api/v1/permission')
        .set('Accept', 'application/json')
        .send(permission)
        .expect(404)
        .expect('Content-Type', /json/)
        .expect(response => {
          expect(response.body.message).toEqual(`Resource does not exist - ${permission.resource}`)
        })
    })

    it('POST /api/v1/permission, with invalid permission id, should throw an error', async () => {
      const permission = {
        resource: resourceId,
        permissionType: 10,
        isCustom: false,
      }

      await request(httpServer)
        .post('/api/v1/permission')
        .set('Accept', 'application/json')
        .send(permission)
        .expect(400)
        .expect('Content-Type', /json/)
        .expect(response => {
          expect(response.body.message).toEqual('Invalid permission')
        })
    })

    it('POST /api/v1/permission, with invalid permission, should throw an error', async () => {
      const permission = {
        resource: resourceId,
        permissionType: 1,
        isCustom: true,
      }

      await request(httpServer)
        .post('/api/v1/permission')
        .set('Accept', 'application/json')
        .send(permission)
        .expect(400)
        .expect('Content-Type', /json/)
        .expect(response => {
          expect(response.body.message).toEqual('Invalid permission')
        })
    })

    afterAll(async () => {
      await application.close()
    })
  })
})