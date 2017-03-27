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
      secret:
      "OwnLick" +
      "|----------------------------|" +
      "|----------------------------|" +
      "|----------------------------|" +
      "|----------------------------|" +
      "|-----2--4--0--5--4----------|" +
      "|--5M----------------5--7----|" ,
    }
  },
  auth: {
    secret:
    "Blackened!!!" +
    "|----------------------------------------------|" +
    "|----------------------------------------------|" +
    "|----------------------------------------------|" +
    "|--------------------------------------8-------|" +
    "|-----7-----7-----7--8--7-----7-----7-----7----|" +
    "|--0M----0M----0M----------0M----0M------------|" ,
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