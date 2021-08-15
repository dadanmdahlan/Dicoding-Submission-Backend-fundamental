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
      const songs = await this._playlistService.getSongsFromPlaylist(playlistId, userId);
      const result = await this._mailSender.sendEmail(
        targetEmail,
        playlistName,
        playlistUser,
        JSON.stringify(songs),
      );
      console.log(`Email Sent to ${result.envelope.to} ${result.response}`);
    } catch (error) {
      console.error(error);
    }
  }
}
module.exports = Listener;
