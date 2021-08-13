const PlaylistsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'Playlists',
  version: '1.0.0',
  register: async (server, {
    playlistsService, validator, songsService, playlistSongsService,
  }) => {
    const playlistsHandler = new PlaylistsHandler(playlistsService, validator, songsService, playlistSongsService);
    server.route(routes(playlistsHandler));
  },
};
