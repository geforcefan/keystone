const config = {
  http: {
    port: 4000
  },
  db: {
    uri: "mongodb://localhost/keystone"
  },
  user: {
    activation: {
      expireTime: 24 * (60 * 60), // 24 hours
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
    from: "Project Keystone <info@project-keystone.de>",
    retryInterval: 5 * 60, // 5 minutes,
    maxRetries: 10,
    server: {
      user: "info@project-keystone.de",
      password: "rstMJlfhok",
      host: "smtp.project-keystone.de",
      ssl: false
    }
  }
};

export default config;