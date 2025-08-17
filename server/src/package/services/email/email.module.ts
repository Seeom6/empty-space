import { Module } from "@nestjs/common";
import { MailWorker, MailService } from "./services";
import { AccountModule } from "@Modules/account/account/account.module";

@Module({ 
    imports: [AccountModule],
    providers: [MailService, MailWorker], 
    exports: [MailService,]
})
export class EmailModule { }