import path from 'path'

const config = {
  fs: {
    rootDirectory: path.join(__dirname, "..")
  },
  http: {
    port: 4000
  },
  db: {
    uri: "mongodb://localhost/keystone"
  },
  user: {
    activation: {
      expireTime: 24 * (60 * 60),
      secret: "0-0-1-0-3-0-0-0-2-0-3-ThisIsAGoodRiff"
    }
  },
  auth: {
    secret: "MySecretPlace",
    session: {
      session: false
    }
  },
  email: {
    server: {
      user:    "username",
      password:"password",
      host:    "smtp.your-email.com",
      ssl:     true
    }
  }
};

export default config;