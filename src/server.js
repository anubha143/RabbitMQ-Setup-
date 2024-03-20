const amqlib = require("amqplib");
const mongo = require("./dao/mongo");
const { ObjectId } = require("mongodb");

const main = async () => {
  const connection = await amqlib.connect(
    "amqps://ybbpakop:rs0knoxchoJz6XGkqCMumuJpSlb9oBZp@puffin.rmq2.cloudamqp.com/ybbpakop"
  );
  const channel = await connection.createChannel();
  await mongo();
  channel.assertQueue("notification");
  channel.consume(
    "notification",
    async (msg) => {
      console.log(msg.content.toString());
      const parseMsg = JSON.parse(msg.content.toString());
      console.log("parseMsg", parseMsg);
      switch (parseMsg.type) {
        case "order-placed":
          const db = await mongo();
          const collection = db.collection("orders");
          const order = await collection.findOne({
            _id: new ObjectId(parseMsg.data.id),
          });
          const productCollection = db.collection("products");
          const product = await productCollection.findOne({
            _id: new ObjectId(order.productId),
          });
          const smsMsg = `Hi ${order.customer_name}, Order placed for ${product.name} with price Rs. ${order.total_cost}`;
          console.log(smsMsg);
          break;

        case "order-cancelled":
          break;

        case "order-in-transit":
          break;

        case "order-delivered":
          break;

        default:
          break;
      }
    },
    { noAck: true }
  );
};

main().then(console.log).catch(console.error);
