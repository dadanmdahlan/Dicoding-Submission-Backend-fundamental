/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addConstraint('playlists', 'fk_playlists.owner_user.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = pgm => {
    pgm.dropConstraint('playlists','fk_playlists.owner_user.id');
};
