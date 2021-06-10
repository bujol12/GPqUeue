import React, {useEffect, useState} from "react";
import {Link, useHistory} from "react-router-dom";
import axios from "axios";

const postNewJob = (history, name, command, chosenGpus) => {
    axios.post("/api/add_job", {
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
        postNewJob(history, name, command, [...chosenGpus]);
    };

    const gpuCheckboxes = gpus.map((data, index) =>
        <div key={index} className="form-check">
            <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" onChange={updateChosenGpus(data.index)} />
            <label className="form-check-label" htmlFor="flexCheckDefault">
            GPU {data.index} - {data.name} ( {data.memory} / {data.maxMemory} MiB )
            </label>
        </div>
    );

    return (
        <div className="container container-md-custom">
            <h1 className="pt-4 mb-4">Start new experiment</h1>
            <div>
                <div className="mb-3">

                    <div className="mb-3">
                        <div className="card">
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
                    </div>
                </div>
                <div className="mb-3">
                    <div className="card">
                        <div className="card-header">
                            Current Directory
                        </div>
                        <div className="card-body">
                            <div id="nameHelp2" className="form-text"><code id="currentDir">{currentDir}</code></div>
                        </div>
                    </div>
                </div>
                <div className="mb-3">

                    <div className="card">
                        <div className="card-header">
                            Select GPUs*
                        </div>
                        <div className="card-body">
                            {gpuCheckboxes}
                        </div>
                    </div>
                </div>
                <button type="submit" className="btn btn-primary" onClick={handleSubmit}>Submit</button>
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
