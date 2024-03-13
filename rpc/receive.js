const amqp = require('amqplib');

async function consume() {
  try {
    // Connect to RabbitMQ server
    const connection = await amqp.connect('amqp://localhost');
    
    // Create a channel
    const channel = await connection.createChannel();

    // Assert a queue
    const queueName = 'rpc';
    await channel.assertQueue(queueName, { durable: false });
    channel.prefetch(1);
    console.log('Waiting for messages...');

    // Consume messages from the queue
    channel.consume(queueName, (msg) => {
      if (msg !== null) {
        console.log(`Received message: ${msg.content.toString()}`);

        channel.sendToQueue(msg.properties.replyTo, Buffer.from('Rpc Response'), {
            correlationId:msg.properties.correlationId
        })
        channel.ack(msg); // Acknowledge the message
      }
    });
  } catch (error) {
    console.error('Error:', error);
  }
}
consume();