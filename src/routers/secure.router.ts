import express, { Router } from 'express';

export const secureRouter = Router();
secureRouter.use(express.json());

secureRouter.get('/', (request, response) => {
  response.json(request.user);
});
