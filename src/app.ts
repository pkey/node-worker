import * as dotenv from "dotenv";
import Koa from "koa";
import koaBody from "koa-body";
import Router from "koa-router";
import request from "request";

let os = require("os");

dotenv.config();

const app = new Koa();
const router = new Router();

const port = process.env.PORT || 3000;

//User initialises a payload
router.get("/", async ctx => {
  //TODO: Do some calculations
  await new Promise(done => setTimeout(done, 1000));
  console.log("Calculations done.");

  //Notify Controller node
  console.log("Controller node notified");
  //Notify other nodes
  const response = await request(`http://Controlla:3000/api/node`, {
    json: true
  });
  console.info(response)

  const nodes = response.filter(node => node != os.hostname());
  console.log("Nodes to notify", nodes);

  //Notify all nodes with the payload
  nodes.forEach(node => {
    request.post(
      `http://${node}:3000`,
      { json: { notifier: os.hostname(), payload: "some random paylaod" } },
      function(error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log("Node notified: ", body);
        } else {
          console.log("Ooops:", error);
        }
      }
    );
  });
});

router.get("/host", async ctx => {
  ctx.body = os.hostname();
});

router.post("/*", async ctx => {
  console.log("I've been notified by: ", ctx.request.body.notifier);
  console.log("and I've received this data:", ctx.request.body.payload);
  ctx.body = {
    message: "Successfuly notified!",
    receiver: os.hostname(),
    payload: ctx.request.body.payload
  };
});

app.use(koaBody());
app.use(router.routes());

app.listen(port, () => console.log(`App listening on port ${port}!`));
