import React from "react";
import {Route, BrowserRouter as Router, Link} from "react-router-dom";
import Overview from "./Overview.js";
import MyExperiments from "./MyExperiments.js";
import {Login, SignUp} from "./LoginSignUp.js";
import "./App.css";

const NavbarLink = ({to, text}) => {
    return (
        <li className="nav-item">
            <Link className="nav-link active" to={to}>{text}</Link>
        </li>
    );
};

const Navbar = () => {
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


const Gpus = () => {
    return (
        <div>
            <h1>GPUs</h1>
        </div>
    );
};

const NewExperiment = () => {
    return (
        <div className="container container-md-custom">
            <h1 className="pt-4 mb-4">Begin new experiment</h1>
            <form action="/api/add_job">
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">Experiment name*</label>
                    <input type="text" className="form-control" id="name" aria-describedby="nameHelp" placeholder="e.g. Hot Dog vs Cold Dog Classifer"/>
                    <div id="nameHelp" className="form-text">Give your experiment a good unique name so it&apos;s easy to find later.</div>
                </div>
                <div className="mb-3">
                    <label htmlFor="script" className="form-label">Python / Bash Script*</label>
                    <input type="file" className="form-control" id="script" disabled/>
                </div>
                <div className="mb-3">
                    <label htmlFor="arguments" className="form-label">Command line arguments</label>
                    <input type="text" className="form-control" id="arguments" disabled/>
                </div>
                <button type="submit" className="btn btn-primary">Submit</button>
            </form>
        </div>
    );
};

const App = () => {
    const routing = (
        <Router>
            <Navbar/>
            <div className="container">
                <Route exact path="/" component={Login}></Route>
                <Route exact path="/signup" component={SignUp}></Route>
                <Route exact path="/overview" component={Overview}></Route>
                <Route exact path="/myexperiments" component={MyExperiments}></Route>
                <Route exact path="/gpus" component={Gpus}></Route>
                <Route exact path="/newexperiment" component={NewExperiment}></Route>
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
