const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const ClientError = require('./exceptions/ClientError');

require('dotenv').config();

// songs
const songs = require('./api/songs');
const SongsValidator = require('./validator/songs');
const SongsService = require('./services/postgres/SongsService');

// users
const users = require('./api/users');
const UsersValidator = require('./validator/users');
const UsersService = require('./services/postgres/UsersService');

// authentications

const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

//playlists

const playlists = require('./api/playlists');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlaylistSongsService = require('./services/postgres/PlaylistSongsService');
const PlaylistsValidator = require('./validator/playlists');


// collaboration

const collaboration = require('./api/collaborations');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const CollaborationsValidator = require('./validator/collaborations');
const collaborations = require('./api/collaborations');

const init = async () => {
  const collaborationsService = new CollaborationsService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const playlistsService = new PlaylistsService();
  const playlistSongsService = new PlaylistSongsService();
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // registrasi plugin eksternal

  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  // mendefiniskan strategy autentikasi JWT

  server.auth.strategy('openmusic_jwt','jwt',{
      keys: process.env.ACCESS_TOKEN_KEY,
      verify: {
          aud: false,
          iss: false,
          sub: false,
          maxAgeSec: process.env.ACCESS_TOKEN_AGE,
      },
      validate: (artifacts) => ({
        isValid: true,
        credentials: {
          id: artifacts.decoded.payload.id,
        },
      }),
  });

  await server.register([
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
          authenticationsService,
          usersService,
          tokenManager: TokenManager,
          validator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
          playlistsService,
          songsService,
          playlistSongsService,
          validator: PlaylistsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        validator: CollaborationsValidator,
      },
    },
  ]);
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
    if (response instanceof Error) {
      const { statusCode, payload } = response.output;
      switch (statusCode) {
        case 500:
          payload.message = 'Maaf terjadi kesalahan pada server kami';
          console.log(response);
          const newResponse = h.response({
            status: 'error',
            message: payload.message,
          }).code(500);
          return newResponse;
        default:
          return h.response(payload).code(statusCode);
      }
    }
    // jika bukan clienterror dan server error , lanjutkan dengan response sebelumnya
    return response.continue || response;
  });
  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
