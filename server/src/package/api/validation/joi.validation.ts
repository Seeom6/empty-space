import Joi from "joi";

const isMongoId = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

const isEmail = Joi.string().email();

const isPhoneNumber = Joi.string().regex(/^[0-9]{10}$/);

const isPassword = Joi.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/);

const location = {
        latitude: Joi.number().min(-90).max(90).required(),
        longitude: Joi.number().min(-180).max(180).required(),
};

export const joiPagination = (
    needPaginationValidValues: [boolean, ...boolean[]],
  ) => {
    return {
      total: Joi.boolean().default(true),
      needPagination: Joi
        .boolean()
        .required()
        .valid(...needPaginationValidValues),
      page: Joi.number().min(0).default(0),
      limit: Joi
        .number()
        .min(0)
        .max(3)
        .default(3),
    };
  };
  


export const JoiValidation = {
    isMongoId,
    isEmail,
    isPhoneNumber,
    isPassword,
    location,
    joiPagination,
};
