import React, {useState, useEffect} from "react";
import {Link} from "react-router-dom";
import {Sort, SortDropdown} from "./Sort.js";
import {msToHoursMinutesSeconds, msToTimeString} from "./util.js";
import axios from "axios";

const postCancelJob = (uuid) => {
    axios.post("/api/cancel_job", { uuid: uuid }).then(
        res => {
            console.log(res);
            // TODO: notify success / failed
            if (res.data.status === "success") {
                window.location.reload();
            }
        }
    );
};

const getInfoText = (status, startTime, endTime) => {
    if (status === "QUEUED") {
        return (
            <div className="col align-self-center pt-3 me-3 text-end">
                <p>Queued</p>
            </div>
        );
    }

    endTime = endTime ? endTime : Date.now();

    return (
        <div className="col pt-3 me-3 text-end">
            <p>{msToTimeString(startTime)}</p>
            <p>{msToHoursMinutesSeconds(endTime - startTime)}</p>
        </div>
    );
};

const ExperimentCardDetails = (end, start, status, gpu, dataset, uuid) => {
    const endTime = end ? end : new Date().getTime();
    const runtime = Math.floor((endTime - start) / 1000);
    const statusMap = {
        inprogress: "Running",
        queued: "Queuing",
        success: "Completed Successfully",
        failed: "Failed",
        cancelled: "Cancelled",
    };

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

    return (
        <div>
            <p>
                Runtime: {msToHoursMinutesSeconds(runtime)}
            </p>
            <p>
                Started at: {startTime}
            </p>
            <p>
                Status: {statusMap[status.toLowerCase()]}
            </p>
            <p>
                GPU: {gpu}
            </p>
            <p>
                Dataset: {dataset}
            </p>
            <p>
                Experiment ID: {uuid}
            </p>
            <div className="d-flex justify-content-between">
                {detailsButton}
                {cancelButton}
            </div>
        </div>
    );
};

const ExperimentCard = ({ status, name, user, gpus, start, end, uuid, prefix }) => {
    const icon = `/${status ? status.toLowerCase() : ""}.png`;
    const [infoText, setInfoText] = useState(getInfoText(status, start, end));
    const [details, setDetails] = useState("");
    const _prefix = `${prefix}-experimentCard`;
    const id = `${_prefix}-${uuid}`;
    const label = `${_prefix}-label-${uuid}`;
    if (gpus === undefined) {
        gpus = "[]";
    }
    const gpu = gpus.slice(1, -1);

    useEffect(() => {
        const interval = setInterval(() => {
            setInfoText(getInfoText(status, start, end));
            setDetails(ExperimentCardDetails(end, start, status, gpu, "/some/random/path/to/the/dataset/directory", uuid));
        }, 1000);
        return () => {
            clearInterval(interval);
        };
    }, []);

    return (
        <div className="mb-3">
            <div className="accordion-item">
                <h2 className="accordion-header" id={label}>
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={`#${id}`} aria-expanded="false" aria-controls={id}>
                        <div className="row w-100">
                            <div className="icon-col align-self-center mb-- me-3">
                                <img className="icon" src={icon} />
                            </div>
                            <div className="col pt-3 me-3 text-start">
                                <h3>{name}</h3>
                                <p>{user} {gpu}</p>
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

const getExperiments = (setExperiments, endpoint, project) => {
    axios.get(`/api/${endpoint}`, {
        params: {
            project: project
        }
    }).then(res => {
        let tempExperiments = [];
        for (const key in Object.keys(res.data.jobs)) {
            tempExperiments.push({
                project: project,
                name: res.data.jobs[key].name,
                path: res.data.jobs[key].script_path,
                uuid: res.data.jobs[key].uuid,
                user: `${res.data.jobs[key].user.username}`,
                status: res.data.jobs[key].status,
                gpus: res.data.jobs[key].gpus_list,
                start: res.data.jobs[key].start_time,
                end: res.data.jobs[key].finish_time,
            });
        }
        setExperiments(tempExperiments);
    });
};

const Experiments = ({endpoint, project, title}) => {
    const prefix = title.replace(" ", "_");
    const [experiments, setExperiments] = useState([]);

    useEffect(() => {
        getExperiments(setExperiments, endpoint, project);
    }, [project]);

    const experimentCards = experiments.map((data, index) =>
        <ExperimentCard key={index} prefix={prefix} {...data} />
    );
    const sortRules = [
        {text: "Newest", prop: "start", increasing: true},
        {text: "Oldest", prop: "start", increasing: false},
        {text: "Duration", prop: "duration", increasing: false},
    ];
    const [sortRule, setSortRule] = useState(sortRules[0]);

    return (
        <div>
            <div className="row">
                <div className="col">
                    <h2>{title}</h2>
                </div>
                <div className="col-2 text-end">
                    <SortDropdown rules={sortRules} setRule={setSortRule} />
                </div>
            </div>
            <div className="accordion" id={"Experiments-" + title}>
                <Sort {...sortRule}>
                    {experimentCards}
                </Sort>
            </div>
        </div>
    );
};

export default Experiments;
