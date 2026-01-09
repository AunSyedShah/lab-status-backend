// Simple but effective logger utility
const logger = {
  // Colors for console output
  colors: {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
  },

  // Get timestamp
  getTimestamp() {
    return new Date().toISOString();
  },

  // Format log message
  formatMessage(level, message, data = null) {
    const timestamp = this.getTimestamp();
    let output = `[${timestamp}] [${level}] ${message}`;
    if (data) {
      output += ` | ${JSON.stringify(data)}`;
    }
    return output;
  },

  // Info level logs
  info(message, data = null) {
    const output = this.formatMessage('INFO', message, data);
    console.log(`${this.colors.blue}${output}${this.colors.reset}`);
  },

  // Success level logs
  success(message, data = null) {
    const output = this.formatMessage('SUCCESS', message, data);
    console.log(`${this.colors.green}${output}${this.colors.reset}`);
  },

  // Warning level logs
  warn(message, data = null) {
    const output = this.formatMessage('WARN', message, data);
    console.warn(`${this.colors.yellow}${output}${this.colors.reset}`);
  },

  // Error level logs
  error(message, error = null) {
    const output = this.formatMessage('ERROR', message);
    console.error(`${this.colors.red}${output}${this.colors.reset}`);
    if (error) {
      if (error instanceof Error) {
        console.error(`${this.colors.red}Stack: ${error.stack}${this.colors.reset}`);
      } else {
        console.error(`${this.colors.red}Details: ${JSON.stringify(error)}${this.colors.reset}`);
      }
    }
  },

  // Debug level logs
  debug(message, data = null) {
    if (process.env.DEBUG === 'true') {
      const output = this.formatMessage('DEBUG', message, data);
      console.log(`${this.colors.magenta}${output}${this.colors.reset}`);
    }
  },

  // HTTP request logging
  logRequest(method, path, statusCode, duration) {
    const color = statusCode >= 400 ? this.colors.red : this.colors.green;
    const output = `[${new Date().toISOString()}] ${method} ${path} - ${statusCode} (${duration}ms)`;
    console.log(`${color}${output}${this.colors.reset}`);
  },

  // Database operation logging
  logDatabase(operation, collection, duration, success = true) {
    const level = success ? 'DB' : 'DB_ERROR';
    const color = success ? this.colors.cyan : this.colors.red;
    const output = `[${new Date().toISOString()}] [${level}] ${operation} on ${collection} (${duration}ms)`;
    console.log(`${color}${output}${this.colors.reset}`);
  }
};

export default logger;
