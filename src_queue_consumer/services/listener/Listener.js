const autoBind = require('auto-bind');

class Listener {
  constructor(playlistService, mailSender) {
    this._playlistService = playlistService;
    this._mailSender = mailSender;
    autoBind(this);
  }

  async listen(message) {
    try {
      const { playlistId, targetEmail, userId } = JSON.parse(message.content.toString());
      const { name: playlistName, fullname: playlistUser } = await this._playlistService.getPlaylist(playlistId, userId);
      const songs = await this._playlistService.getSongsFromPlaylist(playlistId);
      //   console.log(name);
      //   console.log(fullname);
      //   console.log(songs);
      const result = await this._mailSender.sendEmail(
        targetEmail,
        playlistName,
        playlistUser,
        JSON.stringify(songs),
      );
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  }
}
module.exports = Listener;
