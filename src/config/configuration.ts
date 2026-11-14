export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  dataDriver: process.env.DATA_DRIVER || 'memory',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  rethinkdb: {
    host: process.env.RETHINKDB_HOST || 'localhost',
    port: parseInt(process.env.RETHINKDB_PORT || '28015', 10),
    db: process.env.RETHINKDB_DB || 'spaceapps',
  },
});
