import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import * as request from 'supertest'
import {} from 'ts-jest'
import * as bodyParser from 'body-parser'

import { IdentityModule } from '../../identityModule'

import { DatabaseModule } from '../../../databaseModule'
import { NatsModule } from '../../../natsModule'

let resourceId
let resource
let permissionTypes
let permissions: Array<string>

describe('Identity Module', () => {
  describe('Permission Module', () => {
    let application: INestApplication
    let httpServer

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
        name: 'user3',
        baseUrl: '/api/v1/user3',
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

      await request(httpServer)
        .get('/api/v1/permission/types')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(response => {
          permissionTypes = response.body.map(permissionType => permissionType)
        })

      const promises = permissionTypes.map(permissionType =>
        request(httpServer)
          .post('/api/v1/permission')
          .set('Accept', 'application/json')
          .send(
            {
              resource: resourceId,
              permissionType: permissionType.id,
              isCustom: false,
            },
          ),
      )

      // tslint:disable-next-line:no-string-literal
      permissions = (await Promise.all(promises)).map(result => result['text'])
    })

    it('POST /api/v1/role, should create a role', async () => {
      const role = {
        name: 'TechnicalSuccessManager',
        permissions,
      }

      await request(httpServer)
        .post('/api/v1/role')
        .set('Accept', 'application/json')
        .send(role)
        .expect(201)
        .expect('Content-Type', /text\/html/)
        .expect(response => {
          expect(response.text).not.toBeNull()
        })
    })

    it('POST /api/v1/role, given invalid permission, should throw an error', async () => {
      const invalidPermission = '123456789'
      const invalidPermissions = [...permissions, invalidPermission]
      const role = {
        name: 'SeniorSuccessManager',
        permissions: invalidPermissions,
      }

      await request(httpServer)
        .post('/api/v1/role')
        .set('Accept', 'application/json')
        .send(role)
        .expect(404)
        .expect('Content-Type', /json/)
        .expect(response => {
          expect(response.body.message).toEqual(`Permission(s) not found - ${invalidPermission}`)
        })
    })

    it('POST /api/v1/role, role exists, should throw an error', async () => {
      const role = {
        name: 'DOS',
      }

      await request(httpServer)
        .post('/api/v1/role')
        .set('Accept', 'application/json')
        .send(role)

      await request(httpServer)
        .post('/api/v1/role')
        .set('Accept', 'application/json')
        .send(role)
        .expect(400)
        .expect('Content-Type', /json/)
        .expect(response => {
          expect(response.body.message).toEqual(`Role already exists - ${role.name}`)
        })
    })

    it('GET /api/v1/role/:id, should fetch a role, with permissions', async () => {
      let roleId

      const role = {
        name: 'SeniorEngineer',
        permissions,
      }

      await request(httpServer)
        .post('/api/v1/role')
        .set('Accept', 'application/json')
        .send(role)
        .expect(response => {
          roleId = response.text
        })

      await request(httpServer)
        .get(`/api/v1/role/${roleId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(response => {
          expect(response.body.name).toEqual(role.name)
          expect(response.body.permissions[0].permissionType).toEqual(permissionTypes[0].id)
          expect(response.body.permissions[0].permissionName).toEqual(permissionTypes[0].name)
          expect(response.body.permissions[0].resourceBaseUrl).toEqual(resource.baseUrl)
          expect(response.body.permissions[0].resourceBaseUrl).toEqual(resource.baseUrl)
        })

    })

    afterAll(async () => {
      await application.close()
    })
  })
})