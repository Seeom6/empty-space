import { BaseValidationPipe } from "@Package/api";
import { z } from "zod";

const schema = z.object({
    key: z.string().min(1),
})
export class CreateFileValidation extends BaseValidationPipe {
    constructor() {
        super(schema);
    }
}