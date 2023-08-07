import { createStore, combineReducers, applyMiddleware } from "redux";
import reducers from "../reducers";
import thunk from "redux-thunk";
import createLogger from "redux-logger";

const ENV = process.env.REACT_APP_ENV;

export default function configureStore() {
  return createStore(
    combineReducers({
      ...reducers,
    }),
    {},
    ENV === "dev"
      ? applyMiddleware(thunk, createLogger)
      : applyMiddleware(thunk)
  );
}
