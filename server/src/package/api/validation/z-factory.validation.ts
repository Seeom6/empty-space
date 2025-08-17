import { Injectable, PipeTransform, Type } from "@nestjs/common";
import { ZodObject } from "zod";
import { BaseValidationPipe } from "../decorators";


export function zodValidationPipeFactory(schema: ZodObject): Type<PipeTransform>{

    @Injectable()
    class CustomValidationPipe extends BaseValidationPipe {
        constructor() {
            super(schema);
        }
    }
    return CustomValidationPipe;
}