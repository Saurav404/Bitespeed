import { Sequelize } from 'sequelize';
import { dbConfig } from '../config/config';

let sequelizeConnection: Sequelize;

if (dbConfig.environment === 'production') {
  sequelizeConnection = new Sequelize(dbConfig.url, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else {
  sequelizeConnection = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
  });
}

const dbSync = async () => {
  try {
    await sequelizeConnection.authenticate();
    await sequelizeConnection.sync({ alter: true }); // Be careful with alter in production
    return { success: true };
  } catch (error) {
    throw error;
  }
};

dbSync()
  .then(res => {
    console.log('DB synced successfully!!!');
  })
  .catch(err => {
    console.log('Failed to sync DB', err);
  });

export { dbSync };

export default sequelizeConnection;
