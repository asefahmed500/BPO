export function serialize<T>(doc: T): T {
  if (doc === null || doc === undefined) return doc;

  return JSON.parse(
    JSON.stringify(doc, (_key, value) => {
      if (value && typeof value === "object" && "_bsontype" in value) {
        return value.toString();
      }
      return value;
    })
  );
}

export function serializeArray<T>(docs: T[]): T[] {
  return docs.map(serialize);
}
