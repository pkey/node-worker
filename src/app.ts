import * as dotenv from "dotenv";
import Koa from "koa";
import Router from "koa-router";

dotenv.config();

const app = new Koa();
const router = new Router();

const port = process.env.PORT || 3000;

router.get("/*", async ctx => {
  ctx.body = "Hello World!";
});

app.use(router.routes());

app.listen(port, () => console.log(`App listening on port ${port}!`));
