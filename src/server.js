/* eslint-disable linebreak-style */
/* eslint-disable no-console */
/* eslint-disable linebreak-style */
const Hapi = require('@hapi/hapi');
const songs = require('./api/songs');
const SongsValidator = require('./validator/songs');
const SongsService = require('./services/postgres/SongsService');
const ClientError = require('./exceptions/ClientError');

require('dotenv').config();

const init = async () => {
  const songsService = new SongsService();
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register({
    plugin: songs,
    options: {
      service: songsService,
      validator: SongsValidator,
    },
  });
  server.ext('onPreResponse', (request, h) => {
    // mendapatkan response dari request
    const { response } = request;

    if (response instanceof ClientError) {
      // membuat response baru dari response error handling
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }

    // jika bukan clienterror , lanjutkan dengan response sebelumnya
    return response.continue || response;
  });
  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
