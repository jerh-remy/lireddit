import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
// import { Post } from "./entities/Post";
import MikroConfig from "./mikro-orm.config";

const main = async () => {
  const orm = await MikroORM.init(MikroConfig);
  await orm.getMigrator().up();

  //   const post = orm.em.create(Post, { title: "My first post hahaha!" });
  //   await orm.em.persistAndFlush(post);

  //   const posts = await orm.em.find(Post, {});
  //   posts.forEach((p) => console.log(p));
};

main().catch((err) => console.error(err));
