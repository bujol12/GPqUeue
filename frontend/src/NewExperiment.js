import React, {useState} from "react";
import {Link, useHistory} from "react-router-dom";
import axios from "axios";

const postNewJob = (history, name, command) => {
    axios.post("/api/add_job", {
        experiment_name: name,
        script_path: command,
        cli_args: null,
    }).then(res => {
        if (res.data.status === "success") {
            history.push("/myexperiments");
        } else {
            history.push("/newexperiment/failed");
        }
    });
};

const getCurrDir = () => {
    axios.get("api/curr_dir").then(res => {
        if (res.data.status === "success") {
            return res.data.currDir;
        }
    });
    return "no directory";
};

const NewExperiment = () => {
    const [name, setName] = useState(undefined);
    const [command, setCommand] = useState(undefined);

    const history = useHistory();

    const handleChange = (setter) => (e) => {
        setter(e.target.value);
    };

    const handleSubmit = () => {
        postNewJob(history, name, command);
    };

    const currentDir = getCurrDir();

    return (
        <div className="container container-md-custom">
            <h1 className="pt-4 mb-4">Start new experiment</h1>
            <div>
                <div className="mb-3">
                    <label htmlFor="experiment_name" className="form-label">Experiment name*</label>
                    <input type="text" className="form-control" id="experiment_name" aria-describedby="nameHelp" placeholder="e.g. Hot Dog vs Cold Dog Classifer" onChange={handleChange(setName)}/>
                    <div id="nameHelp" className="form-text">Give your experiment a good unique name so it&apos;s easy to find later.</div>
                </div>
                <div className="mb-3">
                    <label className="form-label">Current Directory:</label>
                     <div id="nameHelp2" className="form-text"><code id="currentDir">{currentDir}</code></div>
                </div>
                <div className="mb-3">
                    <label htmlFor="cli_command" className="form-label">Shell Command*</label>
                    <input type="text" className="form-control" id="cli_command" onChange={handleChange(setCommand)} placeholder="e.g. python /.../model.py 1 2 3" />
                    <div id="nameHelp" className="form-text">Examples:</div>
                    <div id="nameHelp2" className="form-text"><code>sh /.../run.sh 1 2 3</code></div>
                    <div id="nameHelp2" className="form-text"><code>pyenv activate model_env ; python /.../model.py</code></div>
                </div>
                <button type="submit" className="btn btn-primary" onClick={handleSubmit}>Submit</button>
            </div>
        </div>
    );
};


const NewExperimentFailed = () => {
    return (
        < div className="container container-md-custom" >
            <h1 className="pt-4 mb-4">Uh oh</h1>
            <p>Experiment failed to start. Try again <Link to="/newexperiment">here.</Link></p>
        </div>
    );
};

export {NewExperiment, NewExperimentFailed};
