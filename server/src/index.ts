import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import express from "express";
import { __prod__ } from "./constants";
// import { Post } from "./entities/Post";
import MikroConfig from "./mikro-orm.config";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";

const main = async () => {
  // create DB connection
  const orm = await MikroORM.init(MikroConfig);
  // perform DB migration
  await orm.getMigrator().up();

  // create express app and configure apollo server
  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver],
      validate: false,
    }),
    context: () => ({
      em: orm.em,
    }),
  });

  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log("server started on localhost:4000");
  });
};

main().catch((err) => console.error(err));
