
import { WinstonModule } from 'nest-winston';
import { transports } from 'winston';
import { format } from 'winston';

export const WinstonLogger = WinstonModule.forRoot({
  level: 'error',
  format: format.combine(
    format.json(),
    format.timestamp(),
    format.prettyPrint(),
  ),

  transports: [
    new transports.Console(),
    new transports.File({
      filename: './logs/errors.log',
      level: 'error',
      format: format.json(),
    }),
  ],
});