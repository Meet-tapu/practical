export const config: any = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'root',
  synchronize: true,
  database: 'practical',
  entities: ['dist/**/*.entity.js'],
  driver: require('mysql2'),
};
