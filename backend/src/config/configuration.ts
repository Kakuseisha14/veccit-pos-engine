export interface AppConfig {
  port: number;
  uploadsDir: string;
  corsOrigin: string;
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  superAdmin: {
    email: string;
    password: string;
  };
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  uploadsDir: process.env.UPLOADS_DIR ?? 'uploads',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    name: process.env.DB_DATABASE ?? 'veccit_pos',
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev-secret-do-not-use',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
  superAdmin: {
    email: process.env.SUPER_ADMIN_EMAIL ?? '',
    password: process.env.SUPER_ADMIN_PASSWORD ?? '',
  },
});
