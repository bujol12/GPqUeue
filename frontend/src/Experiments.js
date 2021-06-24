import React, {useState, useEffect} from "react";
import {Link} from "react-router-dom";
import {msToHoursMinutesSeconds, msToTimeString} from "./util.js";
import axios from "axios";

const postCancelJob = (uuid) => {
    axios.post("/api/cancel_job", { uuid: uuid }).then(
        res => {
            // TODO: notify success / failed
            if (res.data.status === "success") {
                window.location.reload();
            }
        }
    );
};

const ExperimentCardDetails = ({end, start, status, gpus, dataset, uuid, command}) => {
    const endTime = end ? end : new Date().getTime();
    const runtime = Math.floor((endTime - start));

    const startDate = new Date(start);
    let startTime;
    if (isNaN(startDate.getTime())) {
        startTime = "Not Available";
    } else {
        startTime = startDate.toString();
    }

    const handleCancel = () => {
        postCancelJob(uuid);
    };

    const detailsButton = (
        <Link to={"/myexperiments/" + uuid}><button type="button" className="btn btn-primary">More Details</button></Link>
    );

    const cancelButton = (
        <button type="button" className="btn btn-danger" onClick={handleCancel}>Cancel</button>
    );

    let statusColour = "";

    if (status === "COMPLETED") {
        statusColour = "text-success";
    } else if (status === "QUEUED") {
        statusColour = "text-warning";
    } else {
        statusColour = "text-danger";
    }

    const gpuNames = [];

    gpus.forEach((g) => {
        gpuNames.push(g.name + " - " + g.model);
    });

    return (
        <div>
            <table className="table">
                <tbody>
                    <tr>
                        <td>Runtime</td>
                        <td>{msToHoursMinutesSeconds(runtime)}</td>
                    </tr>
                    <tr>
                        <td>Started</td>
                        <td>{startTime}</td>
                    </tr>
                    <tr>
                        <td>Status</td>
                        <td className={statusColour}>{status.toLowerCase()}</td>
                    </tr>
                    <tr>
                        <td>GPU</td>
                        <td>{gpuNames.join(", ")}</td>
                    </tr>
                    <tr>
                        <td>Command</td>
                        <td><code>{command}</code></td>
                    </tr>
                    <tr>
                        <td>UUID</td>
                        <td>{uuid}</td>
                    </tr>
                </tbody>
            </table>
            <div className="d-flex justify-content-between">
                {detailsButton}
                {cancelButton}
            </div>
        </div>
    );
};

const ExperimentCard = ({ usedGpus, status, project, name, user, gpus, start, end, uuid, prefix, command }) => {
    let icon;

    if (status === "RUNNING") {
        icon = (
            <div className="icon spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        );
    } else {
        icon = (
            <img className="icon" src={`/${status ? status.toLowerCase() : ""}.png`} />
        );
    }

    const _prefix = `${prefix}-experimentCard`;
    const id = `${_prefix}-${uuid}`;
    const label = `${_prefix}-label-${uuid}`;

    let infoText;

    if (status === "QUEUED") {
        infoText = (
            <div className="col align-self-center pt-3 me-3 text-end">
                <p>Queued</p>
            </div>
        );
    } else {
        end = end ? end : Date.now();
        infoText = (
            <div className="col pt-3 me-3 text-end">
                <p>{msToTimeString(start)}</p>
                <p>{msToHoursMinutesSeconds(end - start)}</p>
            </div>
        );
    }

    const details = <ExperimentCardDetails end={end} start={start} status={status} gpus={usedGpus} dataset="/some/random/path/to/the/dataset/directory" uuid={uuid} command={command} />;

    return (
        <div className="shadow-sm mb-3">
            <div className="accordion-item">
                <h2 className="accordion-header" id={label}>
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={`#${id}`} aria-expanded="false" aria-controls={id}>
                        <div className="row w-100">
                            <div className="icon-col align-self-center mb-- me-3">
                                {icon}
                            </div>
                            <div className="col pt-3 me-3 text-start">
                                <h3>{name}</h3>
                                <p>{project}</p>
                            </div>
                            {infoText}
                        </div>
                    </button>
                </h2>
                <div id={id} className="accordion-collapse collapse" aria-labelledby={label}>
                    <div className="accordion-body">
                        {details}
                    </div>
                </div>
            </div>
        </div>
    );
};

const getExperiments = (setExperiments, project, statuses, gpu, count, sortBy) => {
    const params = {
        project: project,
        statuses: statuses,
        gpu: gpu,
        count: count,
        sortBy: sortBy,
    };

    axios.get("/api/jobs", {
        params: params
    }).then(res => {
        let tempExperiments = [];
        let i = 0;
        for (const key in Object.keys(res.data.jobs)) {
            tempExperiments.push({
                index: i,
                project: res.data.jobs[key].project,
                name: res.data.jobs[key].name,
                command: res.data.jobs[key].script_path,
                uuid: res.data.jobs[key].uuid,
                user: res.data.jobs[key].user.username,
                status: res.data.jobs[key].status,
                gpus: res.data.jobs[key].gpus_list,
                start: res.data.jobs[key].start_time,
                end: res.data.jobs[key].finish_time,
            });
            i++;
        }
        setExperiments(tempExperiments);
    });
};

const Experiments = ({project, statuses, title}) => {
    const prefix = title.replace(" ", "_");
    const [experiments, setExperiments] = useState([]);
    const [random, setRandom] = useState(Math.random());
    const count = 10;
    const [sortBy, setSortby] = useState("newest");
    const [gpus, setGpus] = useState([]);

    useEffect(() => {
        axios.get(
            "/api/gpu_stats"
        ).then((res) => {
            let tempGpus = [];
            for (let i in res.data) {
                tempGpus.push(res.data[i]);
            }
            setGpus(tempGpus);
        });
    }, []);

    const updateRandom = () => {
        setRandom(Math.random());
        console.log("asd");
        setTimeout(updateRandom, 1000);
    };

    useEffect(() => {
        updateRandom();
    }, []);

    useEffect(() => {
        getExperiments(setExperiments, project, statuses, "", count, sortBy);
    }, [random, project, sortBy]);

    let experimentCards = (experiments.map((data) => {
        let experimentGpus = [];
        for (const i in gpus) {
            if (data.gpus.includes(gpus[i].uuid)) {
                experimentGpus.push(gpus[i]);
            }
        }
        return <ExperimentCard key={data.i} prefix={prefix} usedGpus={experimentGpus} {...data} />;
    }));

    let contents = <h4 className="p-1 ms-2 text-muted">No {title.toLowerCase()}</h4>;

    if (experimentCards.length > 0) {
        contents = (
            <React.Fragment>
                {experimentCards}
            </React.Fragment>
        );
    }

    return (
        <div className="border shadow rounded p-3 mb-3">
            <div className="row">
                <div className="col">
                    <h2>{title}</h2>
                </div>
                <div className="col-3 text-end">
                    <div className="dropdown">
                        <button className="btn btn-outline-primary dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                        Sort by
                        </button>
                        <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                            <li key={0}><button className="dropdown-item" onClick={() => setSortby("newest")}>Newest</button></li>
                            <li key={1}><button className="dropdown-item" onClick={() => setSortby("oldest")}>Oldest</button></li>
                            <li key={2}><button className="dropdown-item" onClick={() => setSortby("duration")}>Duration</button></li>
                        </ul>
                    </div>
                </div>
            </div>
            {contents}
        </div>
    );
};

export default Experiments;
export {getExperiments};
