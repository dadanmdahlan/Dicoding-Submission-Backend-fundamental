const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class PlaylistsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async getPlaylist(playlistId, userId) {
    try {
      const resultCache = await this._cacheService.get(`playlistUser-${userId}-${playlistId}`);
      return JSON.parse(resultCache);
    } catch (error) {
      const query = {
        text: 'SELECT playlists.name, users.fullname from playlists INNER JOIN users ON playlists.owner = users.id LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id WHERE playlists.id = $1 AND (playlists.owner = $2 OR collaborations.user_id = $2)',
        values: [playlistId, userId],
      };
      const result = await this._pool.query(query);
      if (!result.rows) {
        throw new InvariantError('Gagal mengambil nama playlist dan nama owner');
      }
      await this._cacheService.set(`playlistUser-${userId}-${playlistId}`, JSON.stringify(result.rows));
      return result.rows[0];
    }
  }

  async getSongsFromPlaylist(playlistId, userId) {
    try {
      const resultCache = await this._cacheService.get(`playlistSongs-${userId}-${playlistId}`);
      return JSON.parse(resultCache);
    } catch (error) {
      const query = {
        text: 'SELECT songs.title, songs.year, songs.performer,songs.genre,songs.duration FROM songs LEFT JOIN playlistsongs ON playlistsongs.song_id = songs.id WHERE playlistsongs.playlist_id = $1',
        values: [playlistId],
      };
      const result = await this._pool.query(query);
      if (!result.rows) {
        throw new InvariantError('Gagal Memuat lagu dari playlist');
      }
      await this._cacheService.set(`playlistSongs-${userId}-${playlistId}`, JSON.stringify(result.rows));
      return result.rows;
    }
  }
}
module.exports = PlaylistsService;
