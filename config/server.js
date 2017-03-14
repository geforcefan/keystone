"use strict";

const config = {
  http: {
    port: 4000
  },
  db: {
    uri: "mongodb://localhost/keystone"
  },
  auth: {
    secret: "MySecretPlace",
    session: {
      session: false
    }
  }
};

export default config;