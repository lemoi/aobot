const LOG_LEVEL = {
  VERBOSE: 0,
  INFO: 1,
  WARNING: 2,
  ERROR: 3,
};

const currentDebugLevel = process.env.debug || 3;
const logStream = process.stdout;
const logErrorStream = process.stderr;

module.exports = {
  LOG_LEVEL,
  log(msg) {
    if (currentDebugLevel === LOG_LEVEL.VERBOSE) {
      logStream.write(`${msg}\n`);
    }
  },
  info(msg) {
    if (currentDebugLevel >= LOG_LEVEL.INFO) {
      logStream.write(`${msg}\n`);
    }
  },
  warn(msg) {
    if (currentDebugLevel >= LOG_LEVEL.WARNING) {
      logErrorStream.write(`${msg}\n`);
    }
  },
  error(msg) {
    if (currentDebugLevel >= LOG_LEVEL.ERROR) {
      logErrorStream.write(`${msg}\n`);
    }
  },
};
