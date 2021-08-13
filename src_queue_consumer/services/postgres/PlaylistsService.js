const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async getPlaylist(playlistId, userId) {
    const query = {
      text: 'SELECT playlists.name, users.fullname from playlists INNER JOIN users ON playlists.owner = users.id LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id WHERE playlists.id = $1 AND (playlists.owner = $2 OR collaborations.user_id = $2)',
      values: [playlistId, userId],
    };
    const result = await this._pool.query(query);
    if (!result.rows) {
      throw new InvariantError('Gagal mengambil nama playlist dan nama owner');
    }
    return result.rows[0];
  }

  async getSongsFromPlaylist(playlistId) {
    const query = {
      text: 'SELECT songs.title, songs.year, songs.performer,songs.genre,songs.duration FROM playlists INNER JOIN playlistsongs ON playlistsongs.playlist_id = playlists.id INNER JOIN songs ON songs.id = playlistsongs.song_id WHERE playlists.id = $1',
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    if (!result.rows) {
      throw new InvariantError('Gagal Memuat lagu dari playlist');
    }
    return result.rows;
  }
}
module.exports = PlaylistsService;
