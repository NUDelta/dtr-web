module.exports = {
  servers: {
    one: {
      host: '192.241.188.11',
      username: 'root',
      pem: '~/.ssh/id_rsa'
    }
  },

  app: {
    name: 'dtr',
    path: '../',
    docker: {
      image: 'kadirahq/meteord',
    },

    servers: {
      one: {},
    },

    env: {
      ROOT_URL: 'http://dtr.northwestern.edu',
      PORT: 80,
      MONGO_URL: 'mongodb://delta:delta1@ds227243.mlab.com:27243/dtr-web'
    },

    enableUploadProgressBar: true
  }
};
