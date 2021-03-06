import React, { useEffect, useState } from "react";
import { Route, BrowserRouter as Router, Link, useLocation } from "react-router-dom";
import { Login, Logout, SignUp } from "./LoginSignUp.js";
import Overview from "./Overview.js";
import MyExperiments from "./MyExperiments.js";
import {NewExperiment, NewExperimentFailed} from "./NewExperiment.js";
import ExperimentDetails from "./ExperimentDetails.js";
import "./App.css";
import { getLocalUser, responseErrorHandler, responseSuccessHandler } from "./util.js";
import { createBrowserHistory } from "history";
import axios from "axios";

const routerHistory = createBrowserHistory();

const NavbarLink = ({to, text}) => {
    return (
        <li className="nav-item">
            <Link className="nav-link active" to={to}>{text}</Link>
        </li>
    );
};

function UnauthorisedNavbar() {
    return (
        <React.Fragment>
            <nav className="navbar navbar-expand-sm navbar-light bg-light">
                <div className="container-fluid">
                    <Link className="navbar-brand" to="/">GPqUeue</Link>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        </ul>
                        <Link to="/login">
                            <button className="btn btn-primary ms-3">
                                Log in
                            </button>
                        </Link>
                        <Link to="/signup">
                            <button className="btn btn-outline-primary ms-3">
                                Sign up
                            </button>
                        </Link>
                    </div>
                </div>
            </nav>
        </React.Fragment>
    );
}

function AuthorisedNavbar(user) {
    return (
        <React.Fragment>
            <nav className="navbar navbar-expand-sm navbar-light bg-light">
                <div className="container-fluid">
                    <Link className="navbar-brand" to="/">GPqUeue</Link>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <NavbarLink to="/overview" text="Overview" />
                            <NavbarLink to="/myexperiments" text="My Experiments" />
                        </ul>
                        <div className="ms-3">
                            {user ? `Welcome, ${user.username}` : "Loading User Info..."
                            }
                        </div>
                        <Link to="/newexperiment">
                            <button className="btn btn-primary ms-3">
                                New Experiment
                            </button>
                        </Link>
                        <Link to="/logout">
                            <button className="btn btn-outline-secondary ms-3">
                                Log out
                            </button>
                        </Link>
                    </div>
                </div>
            </nav>
        </React.Fragment>
    );
}

function Navbar() {
    const [user, setUser] = useState(getLocalUser());
    const location = useLocation();

    useEffect(
        () => setUser(getLocalUser()),
        [location],
    );

    return user ? AuthorisedNavbar(user) : UnauthorisedNavbar(user);
}

const App = () => {
    axios.interceptors.response.use(
        response => responseSuccessHandler(response),
        error => responseErrorHandler(error),
    );

    const routing = (
        <Router history={routerHistory}>
            <Navbar/>
            <div className="container">
                <Route exact path="/" component={Login}></Route>
                <Route exact path="/login" component={Login}></Route>
                <Route exact path="/logout" component={Logout}></Route>
                <Route exact path="/signup" component={SignUp}></Route>
                <Route exact path="/overview" component={Overview}></Route>
                <Route exact path="/myexperiments" component={MyExperiments}></Route>
                <Route exact path="/myexperiments/:uuid" component={ExperimentDetails}></Route>
                <Route exact path="/newexperiment" component={NewExperiment}></Route>
                <Route exact path="/newexperiment/failed" component={NewExperimentFailed}></Route>
            </div>
        </Router>
    );

    return (
        <div>
            {routing}
        </div>
    );
};

export default App;
export { routerHistory };
