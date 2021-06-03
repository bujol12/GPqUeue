import React from "react";
import {Route, BrowserRouter as Router, Link} from "react-router-dom";
import "./App.css";

const NavbarLink = (props) => {
    return (
        <li className="nav-item">
            <Link className="nav-link active" to={props.to}>{props.text}</Link>
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

const Login = () => {
    return (
        <div>
            <h1>Login</h1>
        </div>
    );
};

const GPUCard = (props) => {
    const icon = props.user == "" ? "" : "busy.png";
    const user = props.user == "" ? "Available" : props.user;

    return (
        <div className="row border mb-3">
            <div className="icon-col align-self-center pt-3 mb-3 me-3">
                <img className="icon" src={icon} />
            </div>
            <div className="col pt-3">
                <h3>GPU {props.index} - {props.name}</h3>
                <p>{user}</p>
            </div>
            <div className="col pt-3 me-3 text-end">
                <p>Utilisation: {props.util}%</p>
                <p>Memory: {props.memory} / {props.maxMemory} MiB</p>
            </div>
        </div>
    );
};

const SortByDropdown = () => {
    return (
        <div className="dropdown">
            <button className="btn btn-outline-primary dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                        Sort by
            </button>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                <li><a className="dropdown-item" href="#">User</a></li>
                <li><a className="dropdown-item" href="#">Max memory</a></li>
                <li><a className="dropdown-item" href="#">Memory used</a></li>
                <li><a className="dropdown-item" href="#">Load</a></li>
                <li><a className="dropdown-item" href="#">Utilisation</a></li>
            </ul>
        </div>
    );
};

const GPUOverview = (props) => {
    const gpuCards = props.gpuData.map((data, index) =>
        <GPUCard key={index} index={index} name={data.name} user={data.user} util={data.util} memory={data.memory} maxMemory={data.maxMemory} />
    );

    return (
        <div>
            <div className="row">
                <div className="col">
                    <h2>GPU Loads</h2>
                </div>
                <div className="col text-end">
                    <SortByDropdown />
                </div>
            </div>
            {gpuCards}
        </div>
    );
};

const ExperimentCard = (props) => {
    const icon = `${props.status}.png`;

    let end;
    if (props.status === "queued") {
        end = (
            <div className="col align-self-center pt-3 me-3 text-end">
                <p>{props.queuing}</p>
            </div>
        );
    } else {
        end = (
            <div className="col pt-3 me-3 text-end">
                <p>{props.start}</p>
                <p>{props.duration}</p>
            </div>
        );
    }

    return (
        <div className="row border mb-3">
            <div className="icon-col align-self-center pt-3 mb-3 me-3">
                <img className="icon" src={icon} />
            </div>
            <div className="col pt-3">
                <h3>{props.name}</h3>
                <p>{props.user} {props.gpu}</p>
            </div>
            {end}
        </div>
    );
};

const CompletedOverview = (props) => {
    const experimentCards = props.experiments.map((data, index) =>
        <ExperimentCard key={index} status={data.status} name={data.name} user={data.user} gpu={data.gpu} start={data.start} duration={data.duration} />
    );

    return (
        <div>
            <div className="row">
                <div className="col">
                    <h2>Completed Experiments</h2>
                </div>
                <div className="col text-end">
                    <SortByDropdown />
                </div>
            </div>
            {experimentCards}
        </div>
    );
};

const OngoingOverview = (props) => {
    const experimentCards = props.experiments.map((data, index) =>
        <ExperimentCard key={index} status={data.status} name={data.name} user={data.user} gpu={data.gpu} start={data.start} duration={data.duration} />
    );

    return (
        <div>
            <div className="row">
                <div className="col">
                    <h2>Ongoing Experiments</h2>
                </div>
                <div className="col text-end">
                    <SortByDropdown />
                </div>
            </div>
            {experimentCards}
        </div>
    );
};

const Overview = () => {
    const gpuData = [
        { name: "RTX 3060", user: "Delilah Han", util: 50, memory: 7432, maxMemory: 11019 },
        { name: "RTX 2080 Ti", user: "", util: 4, memory: 500, maxMemory: 11019 },
        { name: "V100", user: "Joe Stacey", util: 74, memory: 12302, maxMemory: 15258 },
    ];
    const completedExperiments = [
        { status: "success", user: "Delilah Han", name: "NLP Experiment", gpu: "GPU 0 - RTX 3060", start: "Yesterday", duration: "18h 53m 6s" },
        { status: "failed", user: "Joe Stacey", name: "Muffins vs Dogs Detector", gpu: "GPU 0 - RTX 3060", start: "Yesterday", duration: "18h 53m 6s" }
    ];
    const ongoingExperiments = [
        { status: "inprogress", user: "Sherry Edwards", name: "Hotdog Classifer", gpu: "GPU 2 - V100", start: "13:04", duration: "3m 54s" },
        { status: "queued", user: "Joe Stacey", name: "Colddog Classifer", gpu: "GPU 0 - RTX 3060", start: "", duration: "" }
    ];

    return (
        <div className="container-md">
            <h1 className="pt-4 mb-4">Overview</h1>
            <GPUOverview className="mb-4" gpuData={gpuData} />
            <CompletedOverview className="mb-4" experiments={completedExperiments} />
            <OngoingOverview className="mb-4" experiments={ongoingExperiments} />
        </div>
    );
};

const ExperimentCardList = (props) => {
    const experimentCards = props.experiments.map((data, index) =>
        <ExperimentCard key={index} status={data.status} name={data.name} user={data.user} gpu={data.gpu} start={data.start} duration={data.duration} queuing={data.queuing} />
    );
    return (
        <div>
            {experimentCards}
        </div>
    );
};

const MyExperiments = () => {
    const queuingExperiments = [
        { status: "queued", name: "Cold Dog Classifier", gpu: "GPU 0 - RTX 3060", queuing: "Queued (1 / 2)" },
        { status: "queued", name: "Cold Dog Classifier #1", gpu: "GPU 0 - RTX 3060", queuing: "Queued (2 / 2)" }
    ];
    const ongoingExperiments = [
        { status: "inprogress", name: "Hot Dog Classifier #2", gpu: "GPU 2 - V100", start: "13:04", duration: "3m 54s" },
    ];
    const completedExperiments = [
        { status: "failed", name: "Hot Dog Classifier #1", gpu: "GPU 2 - V100", start: "03:54", duration: "10h 30m 19s" },
        { status: "failed", name: "Muffins vs Dogs Detector", gpu: "GPU 0 - RTX 3060", start: "Yesterday", duration: "18h 53m 6s" },
        { status: "success", name: "NLP Experiment", gpu: "GPU 0 - RTX 3060", start: "Yesterday", duration: "18h 53m 6s" }
    ];
    return (
        <div className="container-md">
            <h1 className="pt-4 mb-4">My Experiments</h1>
            <div className="col text-end mb-3">
                <SortByDropdown />
            </div>
            <ExperimentCardList className="mb-4" experiments={queuingExperiments} />
            <ExperimentCardList className="mb-4" experiments={ongoingExperiments} />
            <ExperimentCardList className="mb-4" experiments={completedExperiments} />
        </div>
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
        <div>
            <h1>New Experiment</h1>
        </div>
    );
};

const App = () => {
    const routing = (
        <Router>
            <Navbar/>
            <div className="container">
                <Route exact path="/" component={Login}></Route>
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
