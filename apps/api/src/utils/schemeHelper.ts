import { integer, text } from "drizzle-orm/sqlite-core";
import { v4 as uuid } from "uuid";

export const ID_FIELD = (fieldName: string) =>
  text(fieldName)
    .primaryKey()
    .$default(() => uuid());

export const TEXT_REQUIERD_FIELD = (fieldName: string, options?: any) => {
  if (options?.enum) {
    return text(fieldName, options).notNull();
  }
  return options?.length
    ? text(fieldName, { length: options.length }).notNull()
    : text(fieldName).notNull();
};
export const TEXT_OPTIONAL_FIELD = (fieldName: string, length?: number) => {
  return length ? text(fieldName, { length }) : text(fieldName);
}

export const INT_REQUIERD_FIELD = (fieldName: string) => {
  return integer(fieldName).notNull();
}


export const INTEGER_OPTIONAL_FIELD = (fieldName: string) => {
  return integer(fieldName);

}

export const INTEGER_TIMESTEMP_OPTIONAL_FIELD = (fieldName: string) => {
  return integer(fieldName, { mode: "timestamp" });
};
