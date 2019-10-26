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

//Perform an action
router.get("/", async ctx => {
  const response: Promise<string[]> = new Promise((resolve, reject) => {
    // request(
    //   `http://13.74.182.44:3000/api/node`,
    //   { json: true },
    //   (error, response, body) => {
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
  console.log(nodes);

  nodes.forEach(node => {
    request(`http://${node}/host`, function(error, response, body) {
      console.log("error:", error); // Print the error if one occurred
      console.log("statusCode:", response && response.statusCode); // Print the response status code if a response was received
      console.log("body:", body); // Print the HTML for the Google homepage.
    });
  });
});

router.get("/host", async ctx => {
  ctx.body = os.hostname();
});

router.post("/*", async ctx => {
  console.log(ctx.request.body);
  ctx.body = ctx.request.body;
});

app.use(koaBody());
app.use(router.routes());

app.listen(port, () => console.log(`App listening on port ${port}!`));
