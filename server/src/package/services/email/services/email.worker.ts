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
        console.log("[EMAIL_WORKER] Processing email job:", {
            email: job.data.email,
            otp: job.data.otp,
            type: job.data.type,
            firstName: job.data.firstName,
            lastName: job.data.lastName
        });

        try {
            console.log("[EMAIL_WORKER] About to call sendSingInOTP with:", {
                email: job.data.email,
                otp: job.data.otp
            });

            const result = await this.mailService.sendSingInOTP(job.data.email, job.data.otp);

            console.log("[EMAIL_WORKER] Email sent successfully, result:", result);
            return result;
        } catch (error) {
            console.error("[EMAIL_WORKER] Failed to send email:", error);
            console.error("[EMAIL_WORKER] Error stack:", error.stack);
            throw error;
        }
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
            // const user = await this.accountService.findByEmail(job.data.email)
            // console.log(user)
        }
    }

    @OnWorkerEvent("completed")
    onWorkerCompleted(job: Job) {
        console.log("job completed => id :", job.id)
    }
}