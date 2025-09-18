export interface IAppEnv {
  port: number;
  host: string;
  name: string;
  baseUrl: string;
  version: number;
  defaultLanguage: string
  globalPrefix: string;
  appApiKey: string;
  env: string; // NODE_ENV
}