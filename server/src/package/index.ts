
import { FileUploadModule, ServiceStaticModule } from "./file"
import { EmailModule } from "./services/email/email.module"

export * from "../infrastructure/database"
export * from "./error"
export * from "../infrastructure/config"
export * from "./auth"
export * from "./api"
export * from "./services"
export * from "./utilities"

export const PackageModule = [
  EmailModule,
  FileUploadModule,
  ServiceStaticModule,
]