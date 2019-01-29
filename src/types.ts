const sharedTypes = {
  AsyncDatabaseConnection: Symbol('AsyncDatabaseConnection'),
  NatsConnection: Symbol('NatsConnection'),
  NatsStreamingConnection: Symbol('NatsStreamingConnection'),
}

const serviceTypes = {
  ExampleService: Symbol('ExampleService'),
  IExampleService: Symbol('IExampleService'),

  ResourceService: Symbol('ResourceService'),
  IResourceService: Symbol('IResourceService'),

  PermissionService: Symbol('PermissionService'),
  IPermissionService: Symbol('IPermissionService'),

  RoleService: Symbol('RoleService'),
  IRoleService: Symbol('IRoleService'),

  UserService: Symbol('UserService'),
  IUserService: Symbol('IUserService'),

  EmployeeService: Symbol('EmployeeService'),
  IEmployeeService: Symbol('IEmployeeService'),
}

const repositoryTypes = {
  ExampleRepository: Symbol('ExampleRepository'),
  IExampleRepository: Symbol('IExampleRepository'),

  ResourceRepository: Symbol('ResourceRepository'),
  IResourceRepository: Symbol('IResourceRepository'),

  PermissionRepository: Symbol('PermissionRepository'),
  IPermissionRepository: Symbol('IPermissionRepository'),

  RoleRepository: Symbol('RoleRepository'),
  IRoleRepository: Symbol('IRoleRepository'),

  UserRepository: Symbol('UserRepository'),
  IUserRepository: Symbol('IUserRepository'),

  EmployeeRepository: Symbol('EmployeeRepository'),
  IEmployeeRepository: Symbol('IEmployeeRepository'),

  IEventRepository: Symbol('IEventRepository'),
}

const EVENTS = {
  ExampleCreatedEvent: 'ExampleCreatedEvent',
  UserCreatedEvent: 'UserCreatedEvent',
  RoleCreatedEvent: 'RoleCreatedEvent',
  ResourceCreatedEvent: 'ResourceCreatedEvent',
  PermissionCreatedEvent: 'PermissionCreatedEvent',
}

const STREAMS = {
  Example: 'Example',
  User: 'User',
  Role: 'Role',
  Permission: 'Permission',
  Resource: 'Resource',
}

const TYPES = { ...serviceTypes, ...repositoryTypes, ...sharedTypes, EVENTS, STREAMS }
export { TYPES }
