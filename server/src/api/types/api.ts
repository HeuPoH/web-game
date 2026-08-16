/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request, Response } from 'express';

export type APIRequest<Body = any, Params = any> = Request<
  Params,
  undefined,
  Body
>;
export type APIResponse<T = any> = Response<T | { error: string }>;
