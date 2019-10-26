import * as dotenv from "dotenv";
import Koa from "koa";
import koaBody from "koa-body";
import Router from "koa-router";
var request = require("request");

var os = require("os");

dotenv.config();

const app = new Koa();
const router = new Router();

const port = process.env.PORT || 3000;

const nodes = [];

//Perform an action
router.get("/", async ctx => {
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
