import { Test, TestingModule } from '@nestjs/testing';
import { HomeController } from './home.controller';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('Home Controller', () => {
  let homeController: HomeController;
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomeController],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  })

  it(`should return a welcome message`, () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect({
        message: "Hi there, welcome to  the partner portal API"
      })
  });
});
