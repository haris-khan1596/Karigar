const winston = require('winston');
const { format } = winston;
const { combine, timestamp, label, printf } = format;
const logFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = winston.createLogger({
  level: 'info',
  format: combine(
    label({ label: 'Api' }),
    timestamp(),
    logFormat
  ),
  transports: [
    new winston.transports.File({
      filename: 'logs/Api.log',
      maxFiles: 7,
      maxsize: 1000000,
      tailable: true,
      zippedArchive: true,
      options: { flags: 'a' },
      schedule: '0 11 11 * * *'
    }),
    new winston.transports.Console(
        {
            colorize: true,
            prettyPrint: true,
            timestamp: true,
            level: 'info',
        }
    )
  ]
});

function log(level, message) {
  switch (level) {
    case 'info':
      logger.info(message);
      break;
    case 'error':
      logger.error(message);
      break;
    case 'warn':
      logger.warn(message);
      break;
    case 'debug':
      logger.debug(message);
      break;
    case 'verbose':
      logger.verbose(message);
      break;
    case 'silly':
      logger.silly(message);
      break;
    default:
      logger.info(message);
  }
}

module.exports = log;
