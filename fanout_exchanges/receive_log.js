const express = require('express');
const amqp = require('amqplib');

const app = express();

app.get('/', (req, res) => {
  res.send('Server is running');
});

async function consume() {
  try {
    // Connect to RabbitMQ server
    const connection = await amqp.connect('amqp://localhost');
    // Create a channel
    const channel = await connection.createChannel();
    // Assert a queue
    const exchangeName = 'exg';
    await channel.assertExchange(exchangeName, 'fanout', { durable: true });
    const q = await channel.assertQueue('', { exclusive:true })
    console.log(`Waiting for messages in queue: ${q.queue}`)
   // await channel.assertQues
   

   // (queue, source, routing key)
   channel.bindQueue(q.queue, exchangeName, "");
    // prefecht method  to limit the acknowledgement;
    channel.prefetch(1);
    console.log('Waiting for messages...');

    // Consume messages from the queue
    channel.consume(q.queue, (msg) => {
      if (msg !== null) {
        console.log(`Received message: ${msg.content.toString()}`);
        channel.ack(msg); // Acknowledge the message
      }
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

// Start consuming messages
consume();

// const PORT = process.env.PORT || 3001;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
