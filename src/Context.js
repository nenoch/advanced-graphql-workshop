import { createContext, useContext } from "react";
import { Client } from "./graphql-client/Client";

export const Context = createContext(
  new Client("https://threed-test-api.herokuapp.com/graphql")
);

export const useClient = () => useContext(Context);
