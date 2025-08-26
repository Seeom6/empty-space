import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { QueuesNames } from "@Infrastructure/queue";
import { MailService } from "./email.service";
import { AccountService } from "@Modules/account/account/services";

@Processor({ name: QueuesNames.MAIL })
export class MailWorker extends WorkerHost {
    constructor(
        private readonly mailService: MailService,
        private readonly accountService: AccountService
    ) {
        super()
    }
    async process(job: Job): Promise<any> {
        console.log("worker email starter", job.data)
        await this.mailService.sendSingInOTP(job.data.email, job.data.otp)

    }

    @OnWorkerEvent("active")
    onWorkerActive(job: Job) {
        console.log("job active now :", job.id)
    }

    @OnWorkerEvent("failed")
    async onWorkerFailed(job: Job) {
        if (job.attemptsMade < 3) {
            console.log(`Retrying job ${job.id}...`);
        } else {
            console.log(`Job ${job.id} failed after 3 attempts.`);
            const user = await this.accountService.findByEmail(job.data.email)
            console.log(user)
        }
    }

    @OnWorkerEvent("completed")
    onWorkerCompleted(job: Job) {
        console.log("job completed => id :", job.id)
    }
}