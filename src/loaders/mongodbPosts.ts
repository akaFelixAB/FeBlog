import type { Loader } from "astro/loaders";
import type { Db } from "mongodb";

export function mongodbPosts(db: Db): Loader {
  return {
    name: "mongodb-posts",

    async load({ store, parseData, renderMarkdown, logger }) {
      const docs = await db.collection("posts").find({}).toArray();

      const entries = [];
      const ids = new Set<string>();

      for (const doc of docs) {
        if (
          typeof doc.slug !== "string" ||
          doc.slug.trim().length === 0
        ) {
          throw new Error(`Document slug is invalid, _id=${doc._id}`);
        }

        const id = doc.slug;

        if (ids.has(id)) {
          throw new Error(`Document slug ${id} is duplicated`);
        }

        ids.add(id);

        if (typeof doc.bodyMarkdown !== "string") {
          throw new Error(`Document ${id} bodyMarkdown is not a string`);
        }

        const body = doc.bodyMarkdown;

        const data = await parseData({
          id,
          data: {
            title: doc.title,
            description: doc.description,

            pubDatetime:
              typeof doc.pubDatetime === "string"
                ? new Date(doc.pubDatetime)
                : doc.pubDatetime,

            modDatetime:
              typeof doc.modDatetime === "string"
                ? new Date(doc.modDatetime)
                : doc.modDatetime,

            author: doc.author,
            featured: doc.featured,
            draft: doc.draft,
            tags: doc.tags,
            ogImage: doc.ogImage,
            canonicalURL: doc.canonicalURL,
            hideEditPost: doc.hideEditPost,
            timezone: doc.timezone,
          },
        });

        const rendered = await renderMarkdown(body);

        entries.push({
          id,
          data,
          body,
          rendered,
        });
      }

      // Replace the existing entries in the store with the new entries
      store.clear();

      for (const entry of entries) {
        store.set(entry);
      }

      logger.info(`Loaded ${entries.length} MongoDB articles`);
    },
  };
}