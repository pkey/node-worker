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

  nodes.forEach(node => {
    request.post(
      `http://${node}`,
      { json: { payload: "some random paylaod" } },
      function(error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log(body);
        } else {
          console.log("Error:", error);
        }
      }
    );
  });
});

router.get("/host", async ctx => {
  ctx.body = os.hostname();
});

router.post("/*", async ctx => {
  ctx.body = {
    receiver: os.hostname(),
    payload: ctx.request.body.payload
  };
});

app.use(koaBody());
app.use(router.routes());

app.listen(port, () => console.log(`App listening on port ${port}!`));
