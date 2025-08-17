import mongoose from 'mongoose';
import z from 'zod';
import { zodValidationPipeFactory } from "@Package/api";

const schema  = z.object({
    isConfirmed: z.boolean(),
})

export type UpdateAccountRequestDto = z.infer<typeof schema>;

export const UpdateAccountRequestValidation = zodValidationPipeFactory(schema);




export class UpdateAccount {
    phoneNumber: string;
}
const schema2 = z.object({
    phoneNumber: z.string(),
})
export type UpdateAccountDto = z.infer<typeof schema2>;
export const UpdateAccountValidation = zodValidationPipeFactory(schema2);


const schema3 = z.object({
    image: z.string(),
    fullName: z.string(),
    phoneNumber: z.string(),
    birthDate: z.date(),
    gender: z.string(),
    specialty: z.array(z.string()),
    clinicDetails: z.object({
        phoneNumber: z.string(),
        mobileNumber: z.string(),
        city: z.string(),
        district: z.string(),
        locationDetails: z.string(),
    }),
})
export type UpdateMeRequestDto = z.infer<typeof schema3>;
export const UpdateMeRequestValidation = zodValidationPipeFactory(schema3);

