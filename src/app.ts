import * as dotenv from "dotenv";
import Koa from "koa";
import koaBody from "koa-body";
import Router from "koa-router";
import request from "request";
import axios from "axios";
import logger from "./client/logger";
let os = require("os");

dotenv.config();

const app = new Koa();
const router = new Router();

const port = process.env.PORT || 3000;

//User initialises a payload
router.get("/", async ctx => {
  logger.info("Request received! Starting calculations..");

  // TODO: change to virtual VM sets
  await new Promise(done => setTimeout(done, 1000));

  logger.info("Calculations finished..");
  logger.info("Contacting main node-controller..");

  const controllerResponse = await axios.get(
    "http://94.245.107.144:3000/api/node"
  );
  const nodes = controllerResponse.data.filter(node => node != os.hostname());

  logger.info(`Contacting nodes: ${nodes}`);
  const _ = await Promise.all(
    nodes.map(node => {
      axios.post(`http://${node}:3000`, {
        notifier: os.hostname(),
        payload: Math.random() * 1000
      });
    })
  );

  ctx.body = {};
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

app
  .use(koaBody())
  .use(router.routes())

  .listen(port, () => console.log(`App listening on port ${port}!`));
