import { config } from 'dotenv';

const NODE_ENV = process.env.NODE_ENV ? `.${process.env.NODE_ENV}.env` : '.env';

config({ path: NODE_ENV });
