import { Sequelize } from "sequelize";
import { dbConfig } from "../config/config";

const sequelizeConnection = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
  }
);

const dbSync = async () => {
  try {
    await sequelizeConnection.sync({ alter: true });
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
    console.log("Failed to sync DB", err);
  });

export { dbSync };
 
export default sequelizeConnection;
