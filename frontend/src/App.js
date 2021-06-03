import React, {useState} from "react";
import {Route, BrowserRouter as Router, Link, useHistory} from "react-router-dom";
import axios from "axios";
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

const postNewJob = (history, name, file, args) => {
    axios.post("/api/add_job", {
        experiment_name: name,
        script_path: file,
        cli_args: args,
    }).then(res => {
        if (res.data.status === "success") {
            history.push("/newexperiment/success");
        } else {
            history.push("/newexperiment/failed");
        }
    });
};

const NewExperiment = () => {
    const [name, setName] = useState(undefined);
    const [file, setFile] = useState(undefined);
    const [args, setArgs] = useState("");

    const history = useHistory();

    const handleChange = (setter) => (e) => {
        setter(e.target.value);
    };

    const handleSubmit = () => {
        postNewJob(history, name, file, args);
    };

    return (
        <div className="container container-md-custom">
            <h1 className="pt-4 mb-4">Begin new experiment</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">Experiment name*</label>
                    <input type="text" className="form-control" id="name" aria-describedby="nameHelp" placeholder="e.g. Hot Dog vs Cold Dog Classifer" onChange={handleChange(setName)}/>
                    <div id="nameHelp" className="form-text">Give your experiment a good unique name so it&apos;s easy to find later.</div>
                </div>
                <div className="mb-3">
                    <label htmlFor="script" className="form-label">Python / Bash script*</label>
                    <input type="file" className="form-control" id="script" onChange={handleChange(setFile)} />
                </div>
                <div className="mb-3">
                    <label htmlFor="arguments" className="form-label">Command line arguments</label>
                    <input type="text" className="form-control" id="arguments" onChange={handleChange(setArgs)} />
                </div>
                <button type="submit" className="btn btn-primary" >Submit</button>
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
                <Route exact path="/login" component={Login}></Route>
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
