import type { Component } from 'vue';
import type { CreateEntryOptions, Hook } from './options';
// import type { ServerResponse } from 'node:http';
// import type { IncomingMessage } from 'connect';
import { Renderer } from './renderer';

export interface ClientHandler {
  (App: Component, options: CreateEntryOptions, hook?: Hook): Promise<void>;
}

// export interface SsrHandlerOptions extends CreateEntryOptions {
//   request: IncomingMessage;
//   response: ServerResponse;
// }

export interface SsrHandler {
  (App: Component, options: CreateEntryOptions, hook?: Hook): Renderer;
}

export type AnyHandler = ClientHandler | SsrHandler;

export type AnyHandlerResult = Promise<void> | Renderer;
