import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import helmet from 'helmet';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(helmet());
    await app.init();
  });

  it('/api/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ok');
      });
  });

  it('aplica helmet: no expone cabeceras sensibles (x-powered-by)', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-powered-by']).toBeUndefined();
        expect(res.headers['x-content-type-options']).toBe('nosniff');
      });
  });

  it('aplica rate limiting con ThrottlerGuard (429 tras exceder el limite)', async () => {
    const limit = 100;
    for (let i = 0; i < limit; i += 1) {
      await request(app.getHttpServer()).get('/api/health').expect(200);
    }
    const res = await request(app.getHttpServer()).get('/api/health');
    expect(res.status).toBe(429);
  });
});
