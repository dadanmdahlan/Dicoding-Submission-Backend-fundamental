require('dotenv').config();
const amqp = require('amqplib');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const MailSender = require('./services/mailSender/MailSender');
const Listener = require('./services/listener/Listener');

const init = async () => {
  const playlistService = new PlaylistsService();
  const mailSender = new MailSender();
  const listener = new Listener(playlistService, mailSender);

  const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
  const channel = await connection.createChannel();
  await channel.assertQueue(process.env.PLAYLIST_CHANNEL_NAME, {
    durable: true,
  });
  channel.consume(process.env.PLAYLIST_CHANNEL_NAME, listener.listen, { noAck: true });
};
init();
