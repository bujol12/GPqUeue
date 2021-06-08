import React from "react";
import { Route, BrowserRouter as Router, Link, useLocation } from "react-router-dom";
import {Login, SignUp} from "./LoginSignUp.js";
import Overview from "./Overview.js";
import MyExperiments from "./MyExperiments.js";
import {GPUs} from "./Gpus.js";
import {NewExperiment, NewExperimentFailed} from "./NewExperiment.js";
import "./App.css";

const NavbarLink = ({to, text}) => {
    return (
        <li className="nav-item">
            <Link className="nav-link active" to={to}>{text}</Link>
        </li>
    );
};

const Navbar = () => {
    const location = useLocation();
    if (location.pathname === "/" ||
        location.pathname === "/login" ||
        location.pathname === "/signup") {
        return (
            <React.Fragment>
                <nav className="navbar navbar-expand-xxl navbar-light bg-light">
                    <div className="container-fluid">
                        <Link className="navbar-brand" to="/">GPqUeue</Link>
                        <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        </div>
                    </div>
                </nav>
            </React.Fragment>
        );
    }
    return (
        <React.Fragment>
            <nav className="navbar navbar-expand-xxl navbar-light bg-light">
                <div className="container-fluid">
                    <Link className="navbar-brand" to="/">GPqUeue</Link>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <NavbarLink to="/overview" text="Overview"/>
                            <NavbarLink to="/myexperiments" text="My Experiments"/>
                            <NavbarLink to="/gpus" text="GPUs" />
                        </ul>
                        <Link to="/newexperiment">
                            <button className="btn btn-primary">
                                New Experiment
                            </button>
                        </Link>
                    </div>
                </div>
            </nav>
        </React.Fragment>
    );
};

const App = () => {
    const routing = (
        <Router>
            <Navbar/>
            <div className="container">
                <Route exact path="/" component={Login}></Route>
                <Route exact path="/login" component={Login}></Route>
                <Route exact path="/signup" component={SignUp}></Route>
                <Route exact path="/overview" component={Overview}></Route>
                <Route exact path="/myexperiments" component={MyExperiments}></Route>
                <Route exact path="/gpus" component={GPUs}></Route>
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
