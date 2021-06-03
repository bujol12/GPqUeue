import React, {useState} from "react";
import {Link, useHistory} from "react-router-dom";
import axios from "axios";

const postNewJob = (history, name, file, args) => {
    axios.post("/api/add_job", {
        experiment_name: name,
        script_path: file,
        cli_args: args,
    }).then(res => {
        if (res.data.status === "success") {
            history.push("/myexperiments");
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
            <h1 className="pt-4 mb-4">Start new experiment</h1>
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

const NewExperimentFailed = () => {
    return (
        < div className="container container-md-custom" >
            <h1 className="pt-4 mb-4">Uh oh</h1>
            <p>Experiment failed to start. Try again <Link to="/newexperiment">here.</Link></p>
        </div>
    );
};

export {NewExperiment, NewExperimentFailed};
