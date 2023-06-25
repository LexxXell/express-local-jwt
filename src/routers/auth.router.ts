import express, { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import jwt from 'jsonwebtoken';

import { IUser, UserModel } from '../models/user.model';
import { JWT_RT_SECRET, JWT_AT_SECRET, JWT_RT_EXP_IN, JWT_AT_EXP_IN } from '../helpers/constants';

export const authRouter = express.Router();

authRouter.use(express.json());

passport.use(
  'local-signup',
  new LocalStrategy(async (username, password, callback) => {
    try {
      const refresh_token = jwt.sign({ username }, JWT_RT_SECRET, { expiresIn: JWT_RT_EXP_IN });
      const user = await UserModel.create({
        username,
        password,
        refresh_token,
      });
      return callback(null, user, { message: refresh_token });
    } catch (e) {
      return callback(e, false, { message: 'Error creating user' });
    }
  }),
);

passport.use(
  'local-login',
  new LocalStrategy(async (username, password, callback) => {
    try {
      const user = await UserModel.findOne({ username });
      if (!user || !(await user.isValidPassword(password))) {
        return callback(null, false, { message: 'Invalid username or password' });
      }
      const refresh_token = jwt.sign({ username }, JWT_RT_SECRET, { expiresIn: JWT_RT_EXP_IN });
      user.refresh_token = refresh_token;
      await user.save();
      return callback(null, user, { message: refresh_token });
    } catch (e) {
      return callback(e, false, { message: 'Error login user' });
    }
  }),
);

passport.use(
  'jwt-refresh',
  new JWTStrategy(
    {
      secretOrKey: JWT_RT_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    },
    async (token, done) => {
      try {
        return done(null, token.username);
      } catch (e) {
        done(e);
      }
    },
  ),
);

passport.use(
  'jwt',
  new JWTStrategy(
    {
      secretOrKey: JWT_AT_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    },
    async (token, done) => {
      try {
        return done(null, token.username);
      } catch (e) {
        done(e);
      }
    },
  ),
);

authRouter.post('/signup', async (request: Request, response: Response, next: NextFunction) => {
  passport.authenticate('local-signup', (err: Error, user: IUser, info: any) => {
    try {
      if (err) {
        if (/duplicate key/.test(err.message)) {
          return response.status(409).json({ error: 'User already exist' });
        } else return next(err.message);
      }
      if (!user) {
        return response.status(409).json({ error: info.message || 'Error creating user' });
      }
      const access_token = jwt.sign({ username: user.username }, JWT_AT_SECRET, {});
      return response.json({ access_token, refresh_token: info.message });
    } catch (e) {
      return next(e);
    }
  })(request, response, next);
});

authRouter.post('/login', async (request: Request, response: Response, next: NextFunction) => {
  passport.authenticate('local-login', (err: Error, user: IUser, info: any) => {
    try {
      if (err) {
        return response.status(409).json({ error: err.message });
      }
      if (!user) {
        return response.status(401).json({ error: info.message || 'Invalid credentials' });
      }
      const access_token = jwt.sign({ username: user.username }, JWT_AT_SECRET, { expiresIn: JWT_AT_EXP_IN });
      return response.json({ access_token, refresh_token: info.message });
    } catch (e) {
      return next(e);
    }
  })(request, response, next);
});

authRouter.post('/refresh', async (request: Request, response: Response, next: NextFunction) => {
  passport.authenticate('jwt-refresh', async (err: Error, username: string, info: any) => {
    try {
      const user = await UserModel.findOne({ username });
      const token = request.headers.authorization?.split('Bearer ')[1];
      if (!user || !(await user.isValidRefreshToken(token))) {
        return response.status(401).json({ error: 'Unauthorized' });
      }
      const refresh_token = jwt.sign({ username }, JWT_RT_SECRET, { expiresIn: JWT_RT_EXP_IN });
      const access_token = jwt.sign({ username: user.username }, JWT_AT_SECRET, { expiresIn: JWT_AT_EXP_IN });
      user.refresh_token = refresh_token;
      await user.save();
      return response.json({ access_token, refresh_token });
    } catch (e) {
      next(e);
    }
  })(request, response, next);
});
