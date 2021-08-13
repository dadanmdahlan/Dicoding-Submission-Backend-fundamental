const UploadHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'upload pictures',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const uploadHandler = new UploadHandler(service, validator);
    server.route(routes(uploadHandler));
  },
};
