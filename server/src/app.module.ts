import { Module } from '@nestjs/common';
import { Modules } from './modules';
import { PackageModule } from './package';
import { InfrastructureModule } from './infrastructure';
@Module({
  imports: [
    ...PackageModule,
    ...InfrastructureModule,
    ...Modules,
  ],
})
export class AppModule {
}
