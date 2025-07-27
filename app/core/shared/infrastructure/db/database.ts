import { Database } from './types' // this is the Database interface we defined earlier
import { Pool } from 'pg'
import { Kysely, PostgresDialect } from 'kysely'
import { config } from '../config'

const dialect = new PostgresDialect({
  pool: new Pool({
    database: config.DB_DATABASE_NAME,
    host: config.DB_HOSTNAME,
    user: config.DB_USERNAME,
    password: config.DB_PASSWORD,
    port: config.DB_PORT,
    max: 10,
  })
})

// Database interface is passed to Kysely's constructor, and from now on, Kysely 
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how 
// to communicate with your database.
export const db = new Kysely<Database>({
  dialect,
})

