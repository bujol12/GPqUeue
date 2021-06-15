import React, {useEffect, useState} from "react";
import {Link, useHistory} from "react-router-dom";
import axios from "axios";

const postNewJob = (history, project, name, command, chosenGpus) => {
    axios.post("/api/add_job", {
        project: project,
        experiment_name: name,
        script_path: command,
        cli_args: null,
        gpus: chosenGpus,
    }).then(res => {
        if (res.data.status === "success") {
            history.push("/myexperiments");
        } else {
            history.push("/newexperiment/failed");
        }
    }).catch(_err => {
        history.push("/newexperiment/failed");
    });
};

const getProjects = (setProjects) => {
    axios.get("/api/projects").then((res) => {
        if (res.data.projects) {
            setProjects(res.data.projects);
        }
    });
};

const getCurrDir = (setCurrentDir) => {
    axios.get("/api/curr_dir").then(res => {
        if (res.data.status === "success") {
            setCurrentDir(res.data.currDir);
        }
    });
};

const getGpus = (setGpus) => {
    axios.get("/api/gpu_stats").then(res => {
        let tempGpus = [];
        for (const key in Object.keys(res.data)) {
            const data = res.data[key];
            tempGpus.push({
                index: data.name,
                name: data.model,
                user: data.last_user,
                util: data.last_utilisation_pct,
                memory: data.last_memory_used_mib,
                maxMemory: data.total_memory_mib
            });
        }
        setGpus(tempGpus);
    });
};

const NewExperiment = () => {
    const [name, setName] = useState(undefined);
    const [command, setCommand] = useState(undefined);
    const [currentDir, setCurrentDir] = useState("No directory");
    const [gpus, setGpus] = useState([]);
    const [chosenGpus, setChosenGpus] = useState(new Set());
    const [textProjectName, setTextProjectName] = useState("");
    const [dropProjectName, setDropProjectName] = useState("General");
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        getProjects(setProjects);
    }, []);

    const projectsDropdownLinks = projects.map((p, i) =>
        <li key={i}><button className="dropdown-item" onClick={() => setDropProjectName(p)}>{p}</button></li>
    );

    useEffect(() => {
        getCurrDir(setCurrentDir);
        getGpus(setGpus);
        const interval = setInterval(() => getGpus(setGpus), 1500);
        return () => {
            clearInterval(interval);
        };
    }, []);

    const history = useHistory();

    const updateChosenGpus = (index) => () => {
        let newChosenGpus = new Set(chosenGpus);

        if (chosenGpus.has(index)) {
            newChosenGpus.delete(index);
        } else {
            newChosenGpus.add(index);
        }

        setChosenGpus(newChosenGpus);
    };

    const handleChange = (setter) => (e) => {
        setter(e.target.value);
    };

    const handleSubmit = () => {
        const project = textProjectName !== "" ? textProjectName : dropProjectName;
        postNewJob(history, project, name, command, [...chosenGpus]);
    };

    const gpuCheckboxes = gpus.map((data, index) =>
        <div key={index} className="form-check">
            <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" onChange={updateChosenGpus(data.index)} />
            <label className="form-check-label" htmlFor="flexCheckDefault">
            GPU {data.index} - {data.name} ( {data.memory} / {data.maxMemory} MiB )
            </label>
        </div>
    );

    let projectDropdown;

    if (textProjectName === "") {
        projectDropdown = (
            <div className="dropdown">
                <button className="btn btn-primary dropdown-toggle w-100" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                    {dropProjectName}
                </button>
                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                    {projectsDropdownLinks}
                </ul>
            </div>
        );
    } else {
        projectDropdown = (
            <div className="dropdown">
                <button className="btn btn-primary dropdown-toggle w-100" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false" disabled>
                    {dropProjectName}
                </button>
                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                    {projectsDropdownLinks}
                </ul>
            </div>
        );
    }

    return (
        <div className="container container-md-custom">
            <h1 className="pt-4 mb-4">Start new experiment</h1>
            <div>

                <div className="card mb-3 shadow">
                    <div className="card-header">
                        Project*
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col text-center">
                                <p>Create a new project</p>
                                <input type="text" className="form-control" placeholder="Enter a new project name" onChange={handleChange(setTextProjectName)} />
                            </div>
                            <div className="col-1 text-center">
                                <p>or</p>
                            </div>
                            <div className="col text-center">
                                <p>Select an existing project</p>
                                {projectDropdown}
                            </div>
                        </div>
                        <div className="row pt-4">
                            <p>Experiment will be added to <code>{textProjectName !== "" ? textProjectName : dropProjectName}</code></p>
                        </div>
                    </div>
                </div>

                <div className="card mb-3 shadow">
                    <div className="card-header">
                        Experiment Name*
                    </div>
                    <div className="card-body">
                        <input type="text" className="form-control" id="experiment_name"
                            aria-describedby="nameHelp" placeholder="e.g. Hot Dog vs Cold Dog Classifer"
                            onChange={handleChange(setName)}/>
                        <div id="nameHelp" className="form-text">Give your experiment a good unique name so
                                    it&apos;s easy to find later.
                        </div>
                    </div>
                </div>

                <div className="card mb-3 shadow">
                    <div className="card-header">
                        Current Directory
                    </div>
                    <div className="card-body">
                        <div id="nameHelp2" className="form-text"><code id="currentDir">{currentDir}</code></div>
                    </div>
                </div>

                <div className="card mb-3 shadow">
                    <div className="card-header">
                        <label htmlFor="cli_command" className="form-label">Shell Command*</label>
                    </div>
                    <div className="card-body">
                        <input type="text" className="form-control" id="cli_command" onChange={handleChange(setCommand)} placeholder="e.g. python /.../model.py 1 2 3" />
                        <div id="nameHelp" className="form-text">Examples:</div>
                        <div id="nameHelp2" className="form-text"><code>sh /.../run.sh 1 2 3</code></div>
                        <div id="nameHelp2" className="form-text"><code>pyenv activate model_env ; python /.../model.py</code></div>
                    </div>
                </div>

                <div className="card mb-3 shadow">
                    <div className="card-header">
                            Select GPUs*
                    </div>
                    <div className="card-body">
                        {gpuCheckboxes}
                    </div>
                </div>

                <button type="submit" className="btn btn-primary w-100" onClick={handleSubmit}>Submit</button>
            </div>
        </div>
    );
};


const NewExperimentFailed = () => {
    return (
        < div className="container container-md-custom">
            <h1 className="pt-4 mb-4">Uh oh</h1>
            <p>Experiment failed to start. Try again <Link to="/newexperiment">here.</Link></p>
        </div>
    );
};

export {NewExperiment, NewExperimentFailed};
