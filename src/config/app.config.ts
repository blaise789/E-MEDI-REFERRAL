export const appConfig = () => ({
  port: parseInt(process.env.PORT || '5000', 10),
  jwt: {
    secret: process.env.JWT_SECRET_KEY || 'secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  client: {
    url: process.env.CLIENT_URL || 'http://localhost:3000',
  },
  files: {
    filesPath: process.env.FILES_PATH || './uploads',
    uploadLimit: process.env.FILE_MAX_SIZE || '10485760',
  },
});

export default appConfig;
