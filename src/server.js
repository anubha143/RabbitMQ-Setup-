const amqlib = require("amqplib");
const mongo = require("./dao/mongo");
const { ObjectId } = require("mongodb");

const RABBITMQ_CONNECTION_URL = process.env.RABBITMQ_CONNECTION_URL;

const main = async () => {
  const connection = await amqlib.connect(RABBITMQ_CONNECTION_URL);
  const channel = await connection.createChannel();
  const db = await mongo();

  channel.assertQueue("notification");
  channel.consume(
    "notification",
    async (msg) => {
      console.log(msg.content.toString());
      const parseMsg = JSON.parse(msg.content.toString());

      const collection = db.collection("orders");
      const productCollection = db.collection("products");

      const order = await collection.findOne({
        _id: new ObjectId(parseMsg.data.id),
      });
      const product = await productCollection.findOne({
        _id: new ObjectId(order.productId),
      });

      let smsMsg;

      console.log("parseMsg", parseMsg);
      switch (parseMsg.type) {
        case "order-placed":
          smsMsg = `Hi ${order.customer_name}, Order placed for ${product.name} with price Rs.${order.total_cost}`;
          console.log(smsMsg);
          break;

        case "order-cancelled":
          smsMsg = `Hi ${order.customer_name}, Order placed for ${product.name} with price Rs.${order.total_cost} has been cancelled`;
          console.log(smsMsg);
          break;

        case "order-in-transit":
          smsMsg = `Hi ${order.customer_name}, Order placed for ${product.name} with price Rs.${order.total_cost} has been shipped`;
          console.log(smsMsg);
          break;

        case "order-delivered":
          smsMsg = `Hi ${order.customer_name}, Order placed for ${product.name} with price Rs.${order.total_cost} has been delivered`;
          console.log(smsMsg);
          break;

        default:
          break;
      }
    },
    { noAck: true }
  );
};

main().then(console.log).catch(console.error);
