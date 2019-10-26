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

  setTimeout(() => console.log("Calculations finished"), 1000);
  //Notify Controller node
  console.log("Controller node notified");
  //Notify other nodes
  const response: Promise<string[]> = new Promise((resolve, reject) => {
    request(
      `http://NodeControlla:3000/api/node`,
      { json: true },
      (error, response, body) => {
        if (!error && response.statusCode == 200) {
          resolve(body);
        } else {
          reject(error);
        }
      }
    );
  });

  let nodes = await response;
  nodes = nodes.filter(node => node.split(":")[0] != os.hostname());
  console.log("Nodes to notify", nodes);

  //Notify all nodes with the payload
  nodes.forEach(node => {
    request.post(
      `http://${node}`,
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
  console.log("and I've received this data:", ctx.request.body.notifier);
  ctx.body = {
    message: "Successfuly notified!",
    receiver: os.hostname(),
    payload: ctx.request.body.payload
  };
});

app.use(koaBody());
app.use(router.routes());

app.listen(port, () => console.log(`App listening on port ${port}!`));
