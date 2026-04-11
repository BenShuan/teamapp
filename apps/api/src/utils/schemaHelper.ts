import { integer, text } from "drizzle-orm/sqlite-core";
import { v4 as uuid } from "uuid";

export const ID_FIELD = (fieldName: string) =>
  text(fieldName)
    .primaryKey()
    .$default(() => uuid());

export const TEXT_REQUIRED_FIELD = (fieldName: string) =>
  text(fieldName).notNull();

export const TEXT_REQUIRED_ENUM_FIELD = <
  U extends string,
  T extends readonly [U, ...U[]],
>(fieldName: string, enumValues: T) =>
  text(fieldName, { enum: enumValues }).notNull();

export const TEXT_OPTIONAL_FIELD = (fieldName: string) =>
  text(fieldName);

export const INT_REQUIRED_FIELD = (fieldName: string) => {
  return integer(fieldName).notNull();
}


export const INTEGER_OPTIONAL_FIELD = (fieldName: string) => {
  return integer(fieldName);

}

export const INTEGER_TIMESTAMP_OPTIONAL_FIELD = (fieldName: string) => {
  return integer(fieldName, { mode: "timestamp" });
};
