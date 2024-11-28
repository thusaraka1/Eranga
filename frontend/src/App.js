import React, { useEffect } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import Main from "./components/layout/Main";
import Login from "./pages/login/LoginPage";


import "./assets/styles/main.css";
import "./assets/styles/responsive.css";
import Cookies from "js-cookie";


function App() {
  let rememberedUser = Cookies.get("rememberedUser");
  const is_cookie_set = Boolean(rememberedUser);

  let ROLE1 = "USER";

  if (rememberedUser) {
    rememberedUser = JSON.parse(rememberedUser);
    const { ROLE } = rememberedUser;
    ROLE1 = ROLE;
  }

  useEffect(() => {
    if (is_cookie_set && window.location.pathname === '/') {
      // Redirect to '/' if no valid cookie is set and the path is not '/'
      window.location.href = "/dashboard";
    }
  }, [is_cookie_set]);

  return (
      <div className="App">
        <Switch>
          <Route path="/" exact component={Login} />
          <Main>
            <Route exact path="/dashboard" component={Home} />
            <Route exact path="/sign-up" component={SignUp} />

            <Route exact path="/add-items" component={Home} />

          </Main>
        </Switch>
      </div>
  );
}

export default App;
