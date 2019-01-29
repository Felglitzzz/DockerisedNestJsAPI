import { Factory } from 'rosie'
import { Chance } from 'chance'

import { IResourceService } from '../resourceService'
import { CreateResourceCommand } from '../resourceCommands'
import { QueryResourceRequestDto } from '../resourceDtos'

const chance = new Chance()

export class ResourceFactory {
  private resourceService: IResourceService
  private createResourceCommands: CreateResourceCommand[]

  private resourceNames: string[]

  constructor(resourceService: IResourceService, noOfResources = 10 ) {
    this.resourceService = resourceService

    this.createResourceCommands = new Array<CreateResourceCommand>()

    this.resourceNames = [
      'user', 'employee', 'partner', 'level',
      'cohort', 'location', 'resource', 'permission',
      'role', 'slack', 'email', 'engagement', 'checkin',
    ]

    Factory
      .define('resources')
      .option('noOfResources', 2)
      .attr('resources', ['noOfResources'], (_noOfResources) => {
        for (let i = 1; i <= _noOfResources; i++) {
          const type = chance.pickone(this.resourceNames)

          this.createResourceCommands.push(new CreateResourceCommand(type, `/api/v1/${type}`))
        }
      })

    Factory.build('resources', {}, { noOfResources })
  }

  public async seedResource() {
    const createResourcePromises = this.createResourceCommands.map(createResourceCommand =>
      this.resourceService.createResource(createResourceCommand),
    )

    await Promise.all(createResourcePromises)

    const createdResources = await this.resourceService.fetchAllResource(new QueryResourceRequestDto('10', '0'))

    return createdResources.map(createdResource => createdResource.id)
  }
}