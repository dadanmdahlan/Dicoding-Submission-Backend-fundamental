const autoBind = require('auto-bind');

class ExportsHandler {
  constructor(producerService, playlistsService, exportsValidator) {
    this._producerService = producerService;
    this._playlistsService = playlistsService;
    this._exportsValidator = exportsValidator;

    autoBind(this);
  }

  async postExportPlaylistSongsHandler(request, h) {
    this._exportsValidator.validateExportSongsPayload(request.payload);
    const { id: userId } = request.auth.credentials;
    const { playlistId } = request.params;
    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

    const message = {
      userId,
      playlistId,
      targetEmail: request.payload.targetEmail,
    };
    await this._producerService.sendMessage(process.env.PLAYLIST_CHANNEL_NAME, JSON.stringify(message));
    return h.response({
      status: 'success',
      message: 'Permintaan Anda dalam antrean',
    }).code(201);
  }
}
module.exports = ExportsHandler;
