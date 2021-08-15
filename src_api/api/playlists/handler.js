const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(playlistsService, validator, songsService, playlistSongsService) {
    this._playlistsService = playlistsService;
    this._validator = validator;
    this._songsService = songsService;
    this._playlistSongsService = playlistSongsService;
    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: userId } = request.auth.credentials;
    const playlistId = await this._playlistsService.addPlaylist({ name, userId });

    return h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    }).code(201);
  }

  async getPlaylistsByUserHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const playlists = await this._playlistsService.getPlaylistsByUser(userId);

    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistsByIdHandler(request, h) {
    const { playlistId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlistId, userId);
    await this._playlistsService.deletePlaylistById(playlistId, userId);

    return {
      status: 'success',
      message: 'Playlists berhasil dihapus',
    };
  }

  async postSongToPlaylistHandler(request, h) {
    this._validator.validateSongToPlaylistPayload(request.payload);

    const { id: userId } = request.auth.credentials;
    const { playlistId } = request.params;
    const { songId } = request.payload;

    await this._songsService.verifySongIsExist(songId);
    await this._playlistsService.verifyPlaylistIsExist(playlistId);
    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);
    await this._playlistSongsService.addSongToPlaylist(playlistId, songId);

    return h.response({
      status: 'success',
      message: ' Lagu berhasil ditambahkan ke playlist',
    }).code(201);
  }

  async getSongsFromPlaylistHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { playlistId } = request.params;

    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

    const songsFromPlaylist = await this._playlistSongsService.getSongsFromPlaylist(playlistId);

    return {
      status: 'success',
      data: {
        songs: songsFromPlaylist,
      },
    };
  }

  async deleteSongFromPlaylistHandler(request, h) {
    this._validator.validateSongToPlaylistPayload(request.payload);

    const { id: userId } = request.auth.credentials;
    const { playlistId } = request.params;
    const { songId } = request.payload;

    await this._playlistsService.verifyPlaylistIsExist(playlistId);
    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);
    await this._playlistSongsService.deleteSongFromPlaylist(playlistId, songId);

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }
}

module.exports = PlaylistsHandler;
