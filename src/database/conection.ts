import * as SQLite from "expo-sqlite";

export const db = async () => {
  await SQLite.openDatabaseAsync("databaseName");
};
