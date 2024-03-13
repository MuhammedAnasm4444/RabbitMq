const amqp = require('amqplib');

async function consume() {
  try {
    // Connect to RabbitMQ server
    const connection = await amqp.connect('amqp://localhost');
    
    // Create a channel
    const channel = await connection.createChannel();

    // Assert a queue
    const queueName = 'hello';
    await channel.assertQueue(queueName, { durable: true });

    // prefecht method  to limit the acknowledge
    channel.prefetch(1);
    console.log('Waiting for messages...');
    // Consume messages from the queue
    channel.consume(queueName, (msg) => {
      if (msg !== null) {
          const secs = msg.content.toString().split('.').length - 1
        console.log(`Received message: ${msg.content.toString()}`);
        setTimeout(() => { console.log("Completed Function ")}, secs * 1000)

        channel.ack(msg); // Acknowledge the message
      }
    });
  } catch (error) {
    console.error('Error:', error);
  }
}
// Start consuming messages
consume();