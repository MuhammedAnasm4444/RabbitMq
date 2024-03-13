const express = require("express");
const amqp = require("amqplib");

const app = express();
const port = 3000;

app.use(express.json());

async function publishToRabbitMQ(message) {
  try {
    // Connect to RabbitMQ server
    const connection = await amqp.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();

    // Declare a queue
    const queueName = "hello";
    const exchange = "topicExchanges";
    // await channel.assertQueue(queueName, { durable: true });

    // Publish the exchange to the queue
    await channel.assertExchange(exchange, "topic", { durable: true });
    // await channel.sendToQueue(queueName, Buffer.from(message), {persistent:true});

    let routingKey = "directExg";
    channel.publish(exchange, routingKey, Buffer.from(message));

    console.log(` [x] Sent '${message}'`);

    // Close the connection
    await channel.close();
    await connection.close();
  } catch (error) {
    console.log(error);
    console.error("Error:", error.message);
  }
}

app.post("/publish", async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  await publishToRabbitMQ(message);
  res.json({ message: "Message published to RabbitMQ" });
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});