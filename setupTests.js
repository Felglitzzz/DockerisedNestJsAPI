require("ts-node/register")
require('dotenv').config({ silent: true })

const { Test } = require('@nestjs/testing')
const bodyParser = require('body-parser')

const { ApplicationModule } = require('./src/applicationModule')
const { TYPES } = require('./src/types')
const { ValidationPipe } = require('./src/utils/validatorPipe')
const { ResourceFactory } = require('./src/identity/resource/tests/seedResource')
const { PermissionFactory } = require('./src/identity/permission/tests/seedPermission')


module.exports = async () => {
  const identityModuleFixture = await Test.createTestingModule({
    imports: [ApplicationModule],
  })
  .compile()

  const databaseConnection = identityModuleFixture.get(TYPES.AsyncDatabaseConnection)
  const resourceService = identityModuleFixture.get(TYPES.IResourceService)
  const permissionService = identityModuleFixture.get(TYPES.IPermissionService)
  const roleService = identityModuleFixture.get(TYPES.IRoleService)

  await databaseConnection.synchronize(true)

  const application = identityModuleFixture.createNestApplication()

  application.useGlobalPipes(new ValidationPipe())
  application.use(bodyParser.json())

  await application.init()

  const httpServer = application.getHttpServer()
  
  const resourceFactory = new ResourceFactory(resourceService)
  const resourceIds = await resourceFactory.seedResource()

  const permissionFactory = new PermissionFactory(permissionService, resourceIds)
  const permissionIds = await permissionFactory.seedPermission()

  await application.close()
}