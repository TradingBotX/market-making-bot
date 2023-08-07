import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";

import App from "./components/App";
import * as serviceWorker from "./serviceWorker";
import reduxStore from "./redux/store";
import { createBrowserHistory } from "history";
import { AppContainer } from "react-hot-loader";

import "react-datepicker/dist/react-datepicker.css";

const customHistory = createBrowserHistory();

const store = reduxStore();

ReactDOM.render(
  <Provider store={store}>
    <React.StrictMode>
      <Router history={customHistory}>
        <App />
      </Router>
    </React.StrictMode>
  </Provider>,
  document.getElementById("root")
);

if (module.hot) {
  module.hot.accept("./components/App", () => {
    const NextApp = require("./components/App").default;

    ReactDOM.render(
      <AppContainer>
        <NextApp />
      </AppContainer>,
      document.getElementById("root")
    );
  });
}
serviceWorker.unregister();
