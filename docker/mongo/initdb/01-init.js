const dbName = process.env.MONGO_INITDB_DATABASE;
const username = process.env.MONGO_APP_USERNAME;
const password = process.env.MONGO_APP_PASSWORD;

if (!dbName || !username || !password) {
  throw new Error("Missing MongoDB initialization variables");
}

const blogDb = db.getSiblingDB(dbName);

blogDb.posts.createIndex(
  { slug: 1 },
  { unique: true, name: "unique_post_slug" }
);

blogDb.createUser({
  user: username,
  pwd: password,
  roles: [
    {
      role: "read",
      db: dbName,
    },
  ],
});

print(`Initialized database ${dbName} and reader ${username}`);