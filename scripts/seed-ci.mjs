import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri || dbName !== "feblog_ci") {
  throw new Error("CI seed requires the feblog_ci database");
}

const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 10_000,
});

try {
  await client.connect();

  const db = client.db(dbName);
  await db.command({ ping: 1 });

  const posts = db.collection("posts");

  await posts.createIndex(
    { slug: 1 },
    { unique: true, name: "unique_post_slug" }
  );

  await posts.updateOne(
    { slug: "ci-test-post" },
    {
      $set: {
        title: "CI test post",
        description: "Test content for the CI build.",
        pubDatetime: new Date("2020-01-01T00:00:00.000Z"),
        author: "CI",
        draft: false,
        featured: false,
        tags: ["ci"],
        bodyMarkdown:
          "# CI test post\n\nThis article verifies the MongoDB build pipeline.\n",
      },
    },
    { upsert: true }
  );

  process.stdout.write("CI database is ready.\n");
} finally {
  await client.close();
}