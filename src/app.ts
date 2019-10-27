import * as dotenv from "dotenv";
dotenv.config();

import Koa from "koa";
import koaBody from "koa-body";
import Router from "koa-router";
import axios from "axios";
import logger from "./client/logger";
import azure from "./client/azure";

const os = require("os");

const app = new Koa();
const router = new Router();

const port = process.env.PORT || 3000;

const RESOURCE_NAME = "GenXChallenge";
const VM_SET_NAME = "Compute";

interface Route {
  name: string;
  ipAddress: string;
}

const getNodes = async () => {
  try {
    const controllerResponse = await axios.get(
      "http://40.127.197.101:3000/api/node"
    );
    const nodes: Route[] = controllerResponse.data.filter(
      node => node.name != os.hostname()
    );
    return nodes;
  } catch (err) {
    logger.error(err);
  }
};

router.get("/", async ctx => {
  logger.info("Request received! Starting calculations..");

  const processing = async () => {
    try {
      const azureClient = await azure.azureClient();
      logger.info("Starting processing..");

      await new Promise(resolve => setTimeout(resolve, 2000));
      logger.info("Processing finished, killing..");
    } catch (err) {
      console.log(err);
      logger.error(err);
    }
  };

  await processing();

  logger.info("Calculations finished..");
  logger.info("Contacting main node-controller..");
  const nodes = await getNodes();

  logger.info(`Contacting nodes`);
  console.table(nodes)
  const _ = await Promise.all(
    nodes.map(node => {
      axios.post(`http://${node.ipAddress}:3000/hit`, {
        notifier: os.hostname(),
        payload: Math.random() * 5
      });
    })
  );

  ctx.body = {
    msg: "Finished load distribution.."
  };
});

router.get("/host", async ctx => {
  ctx.body = os.hostname();
});

router.post("/hit", async ctx => {
  logger.info(`${os.hostname()} notified by ${ctx.request.body.notifier} `);
  logger.info(`${os.hostname()} received payload ${ctx.request.body.payload} `);

  ctx.body = {
    message: "Successfuly notified!",
    receiver: os.hostname(),
    notifier: ctx.request.body.notifier,
    payload: ctx.request.body.payload
  };
});

app
  .use(koaBody())
  .use(router.routes())
  .listen(port, () => console.log(`App listening on port ${port}!`));
