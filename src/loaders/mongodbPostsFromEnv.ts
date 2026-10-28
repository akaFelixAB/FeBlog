import type { Loader } from "astro/loaders";
import { MongoClient } from "mongodb";
import { mongodbPosts } from "./mongodbPosts";

export function mongodbPostsFromEnv(): Loader {
  return {
    name: "mongodb-posts-from-env",

    async load(context) {
      const uri =
        process.env.MONGODB_URI ??
        import.meta.env.MONGODB_URI;

      const dbName =
        process.env.MONGODB_DB ??
        import.meta.env.MONGODB_DB;

      if (!uri || !dbName) {
        throw new Error(
          "Missing MONGODB_URI or MONGODB_DB"
        );
      }

      const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 10_000,
      });

      try {
        await client.connect();

        const loader = mongodbPosts(
          client.db(dbName)
        );

        await loader.load(context);
      } finally {
        await client.close();
      }
    },
  };
}