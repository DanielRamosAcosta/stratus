import { Database } from "arangojs";

export const db = new Database({
  url: "http://localhost:8529",
  databaseName: "stratus",
  auth: {
    username: "stratus",
    password: "b3ceebdf-2c32-45f9-bb10-1bd4a6b9d959",
  },
});
