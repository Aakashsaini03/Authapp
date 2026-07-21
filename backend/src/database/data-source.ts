import { DataSource } from "typeorm";
import { User } from "../users/user.entity";
import { AddRoleToUsers1784121990161 } from "./migrations/1784121990161-AddRoleToUsers";

const Appdatasource = new DataSource({
    type: 'mssql',
    host: 'localhost',
    port: 1433,
    username: 'sa',
    password: 'Aaka@123',
    database: 'typeorm_db',
    synchronize: false,
    logging: true,
    entities: [User],
    migrations: ['src/database/migrations/*.ts',],
    migrationsRun: true,
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
});

export default Appdatasource;