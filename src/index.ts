import './helpers/init-env.helper';
import './db';

import express from 'express';

import { authRouter } from './routers';
import { Logger } from './helpers/logger.helper';
import passport from 'passport';
import { secureRouter } from './routers/secure.router';

const logger = new Logger('Main');

const app = express();

app.use(express.json());

app.use('/', authRouter);
app.use('/', passport.authenticate('jwt', { session: false }), secureRouter);

app.listen(3000, () => {
  logger.log('Server started');
});
