// const amqlib = require("amqplib");

// const main = async () => {
//   const connection = await amqlib.connect(
//     "amqps://ybbpakop:rs0knoxchoJz6XGkqCMumuJpSlb9oBZp@puffin.rmq2.cloudamqp.com/ybbpakop"
//   );
//   const channel = await connection.createChannel();
//   channel.assertQueue("hello");
//   channel.sendToQueue("hello", Buffer.from("Bangalore is in water crisis"));
// };

// main().then(console.log).catch(console.error);

const amqlib = require("amqplib");

let connection = null;
let channel = null;

const publishEvent = async (event) => {
  connection =
    connection ??
    (await amqlib.connect(
      "amqps://ybbpakop:rs0knoxchoJz6XGkqCMumuJpSlb9oBZp@puffin.rmq2.cloudamqp.com/ybbpakop"
    ));
  channel = channel ?? (await connection.createChannel());
  channel.assertQueue("notification");
  channel.sendToQueue("notification", Buffer.from(JSON.stringify(event)));
  console.log("[x] Sent %s", event);
};

publishEvent({
  type: "order_cancelled",
  data: {
    id: "12345",
    status: "Canceled",
  },
});
