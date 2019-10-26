import * as dotenv from "dotenv";
dotenv.config()

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
const VM_SET_NAME = "Computation";

router.get("/", async ctx => {
  logger.info("Request received! Starting calculations..");

  const processing = async () => {
    try {
      const azureClient = await azure.azureClient();

      logger.info("Creating VM Set..");
      await azureClient.computeClient.virtualMachineScaleSets.beginCreateOrUpdate(
        RESOURCE_NAME,
        VM_SET_NAME,
        {
          location: "northeurope"
        }
      );
      logger.info("Spinning up new VM Machines..");
      await azureClient.computeClient.virtualMachineScaleSets.beginStart(
        RESOURCE_NAME,
        VM_SET_NAME
      );

      logger.info("Calculations completed, killing..");
      await azureClient.computeClient.virtualMachineScaleSets.deleteMethod(
        RESOURCE_NAME,
        VM_SET_NAME
      );
    } catch (err) {
      logger.error(err);
    }
  };

  await processing()

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
