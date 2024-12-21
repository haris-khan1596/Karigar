const winston = require('winston');
require('dotenv').config();
const { format } = winston;
const { combine, timestamp, label, printf } = format;
const logFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});
const { Logtail } = require("@logtail/node");
const { LogtailTransport } = require("@logtail/winston");


const logtail = new Logtail(process.env.LOGTAIL_TOKEN);

const logtailTransport = new LogtailTransport(logtail, {
  level: "info",
  format: winston.format.json(),
});
const consoleTransport = new winston.transports.Console(
  {
      colorize: true,
      prettyPrint: true,
      timestamp: true,
      level: 'info',
  }
);

const logger = winston.createLogger({
  level: 'info',
  format: combine(
    label({ label: 'Api' }),
    timestamp({ format: 'YYYY-MM-DD hh:mm:ss.SSS A' }),
    logFormat
  ),
  defaultMeta: { environment: process.env.ENVIRONMENT },
  transports: [
    consoleTransport
    ,
    logtailTransport,
  ],
  exceptionHandlers: [logtailTransport, consoleTransport],
  rejectionHandlers: [logtailTransport  , consoleTransport],
});

function log(level, message, tags = {}) {
  switch (level) {
    case 'info':
      logger.child(tags).info(message);
      break;
    case 'error':
      logger.child(tags).error(message);
      break;
    case 'warn':
      logger.child(tags).warn(message);
      break;
    case 'debug':
      logger.child(tags).debug(message);
      break;
    case 'verbose':
      logger.child(tags).verbose(message);
      break;
    case 'silly':
      logger.child(tags).silly(message);
      break;
    default:
      logger.child(tags).info(message);
  }
  logtail.flush()
}


module.exports = log;
