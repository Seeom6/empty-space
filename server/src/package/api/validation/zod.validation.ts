
import { getEnvService } from "@Infrastructure/config/environments/env.config.module";
import { z } from "zod";

const isMongoId = z.string().regex(/^[a-f\d]{24}$/i, {
  message: "Invalid MongoDB ObjectId",
});

const isEmail = z.email({
  message: "Invalid email address",
});

const isPhoneNumber = z.string().regex(/^[0-9]{10}$/, {
  message: "Invalid phone number",
});

const isPassword = z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
  message: "Invalid password",
});

const pagination = () => {
    return {
      needPagination: z.boolean(),
      page: z.number().min(0),
      limit: z.number().min(1),
      total: z.number().min(1),
    };
};

const localizableString = () => {
    const languageKey = {
        en: z.string().nullable(),
        ar: z.string().nullable(),
    };
    // const env = getEnvService();
    // if (env.get("app.defaultLanguage"))
    //   languageKey[`${env.get("app.defaultLanguage")}`] = z.string();
    return z.object(languageKey);
}



export const ZodValidation = {
  isMongoId,
  isEmail,
  isPhoneNumber,
  isPassword, 
  localizableString,
  pagination,
};
