const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const NotFoundError = require('../../exceptions/NotFoundError');
const InvariantError = require('../../exceptions/InvariantError');
const { mapDBToModel } = require('../../utils');

class SongsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addSong({
    title, year, performer, genre, duration,
  }) {
    const id = `song-${nanoid(16)}`;
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;
    const query = {
      text: 'INSERT INTO songs VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id',
      values: [id, title, year, performer, genre, duration, insertedAt, updatedAt],
    };
    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }
    await this._cacheService.delete('songs:allsongs');
    return result.rows[0].id;
  }

  async getSongs() {
    try {
      const resultCache = await this._cacheService.get('songs:allsongs');
      return JSON.parse(resultCache);
    } catch (error) {
      const result = await this._pool.query('SELECT id,title,performer FROM songs');
      await this._cacheService.set('songs:allsongs', JSON.stringify(result.rows));
      return result.rows;
    }
  }

  async getSongById(songId) {
    try {
      const resultCache = await this._cacheService.get(`songs:${songId}`);
      return JSON.parse(resultCache);
    } catch (error) {
      const query = {
        text: 'SELECT * FROM songs WHERE id = $1',
        values: [songId],
      };

      const result = await this._pool.query(query);

      if (!result.rowCount) {
        throw new NotFoundError('Lagu tidak ditemukan');
      }
      const mappedResult = result.rows.map(mapDBToModel)[0];
      await this._cacheService.set(`songs:${songId}`, JSON.stringify(mappedResult));
      return mappedResult;
    }
  }

  async editSongById(songId, {
    title, year, performer, genre, duration,
  }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE songs SET title = $1 , year= $2,performer= $3 , genre= $4 , duration=$5 ,updated_at= $6 WHERE id=$7 RETURNING id',
      values: [title, year, performer, genre, duration, updatedAt, songId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui lagu, Id tidak ditemukan');
    }
    await this._cacheService.delete('songs:allsongs');
    await this._cacheService.delete(`songs:${songId}`);
  }

  async deleteSongById(songId) {
    const query = {
      text: 'DELETE FROM songs WHERE id=$1 RETURNING id',
      values: [songId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Lagu gagal dihapus, Id tidak ditemukan');
    }
    await this._cacheService.delete('songs:allsongs');
    await this._cacheService.delete(`songs:${songId}`);
  }

  async verifySongIsExist(songId) {
    const query = {
      text: 'SELECT COUNT(1) FROM songs WHERE id = $1',
      values: [songId],
    };
    const result = await this._pool.query(query);
    if (!result) {
      throw new NotFoundError('Lagu yang dicari tidak ditemukan');
    }
  }
}
module.exports = SongsService;
