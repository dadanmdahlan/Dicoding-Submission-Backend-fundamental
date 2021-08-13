/* eslint-disable  */
const autoBind = require('auto-bind');
const path = require('path');

class UploadHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    autoBind(this);
  }

  async postUploadImageHandler(request, h) {
    const { data } = request.payload;
    this._validator.validateImageHeaders(data.hapi.headers);
    const filename = await this._service.writeFile(data, data.hapi);
    return h.response({
      status: 'success',
      message: 'Gambar berhasil diunggah',
      data: {
        pictureUrl:`http://${process.env.HOST}:${process.env.PORT}/upload/pictures/${filename}`,
      },
    }).code(201);
  }

  async getUploadImageHandler(request, h) {
    const { filename } = request.params;
    const filepath = path.resolve(__dirname, '../../public/uploads/file/pictures', filename);
    return h.file(filepath);
  }
}
module.exports = UploadHandler;
