import React, {useState, useEffect} from "react";
import axios from "axios";
import {msToHoursMinutesSeconds} from "./util.js";
import {getExperiments} from "./Experiments.js";

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
                maxMemory: data.total_memory_mib,
                uuid: data.uuid,
            });
        }
        setGpus(tempGpus);
    });
};

const GPUCard = ({user, index, name, util, memory, maxMemory, uuid}) => {
    const icon = !user ? "available.png" : "busy.png";
    const userText = !user ? "Available" : user;
    const collapseId = "gpuCardCollapse" + index;
    const [currentExperiments, setCurrentExperiments] = useState([]);

    useEffect(() => {
        getExperiments(setCurrentExperiments, ["running", "queued"], uuid, 10, "oldest");
        const interval = setInterval(() => getExperiments(setCurrentExperiments, ["running", "queued"], uuid, 10, "oldest"), 1000);
        return () => {
            clearInterval(interval);
        };
    }, []);

    console.log(currentExperiments);

    let experimentListItems = currentExperiments.map((data, index) =>
        <li key={index} className={"list-group-item" + (data.status === "RUNNING" ? " text-primary" : "")}>
            <span className="d-inline-flex w-100 justify-content-between">
                {data.name} {data.status === "RUNNING" ? "- " + msToHoursMinutesSeconds(Date.now() - data.start) : ""}
                <small>{data.user}</small>
            </span>
        </li>
    );

    const utilPercent = Math.floor(util * 100);
    const memoryPercent = Math.floor((Number(memory) / Number(maxMemory)) * 100);

    return (
        <div className="shadow-sm accordion mb-3">
            <div className="accordion-item">
                <div className="accordion-header">
                    <button className="accordion-button collapsed gpu-card pt-3 ps-3 pe-3" data-bs-toggle="collapse" data-bs-target={"#" + collapseId} aria-expanded="false" aria-controls="collapseOne">
                        <div className="icon-col align-self-center mb-3 me-3">
                            <img className="icon" src={icon} />
                        </div>
                        <div className="col text-start">
                            <div className="row">
                                <div className="col">
                                    <h3>GPU {index} - {name}</h3>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col">
                                    <p>{userText}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col pe-3 text-start">
                            <span>Utilisation</span>
                            <div className="progress">
                                <div className="progress-bar" role="progressbar" style={{width: utilPercent + "%"}} aria-valuenow={utilPercent} aria-valuemin="0" aria-valuemax="100">{utilPercent}%</div>
                            </div>
                            <span>Memory {memory} / {maxMemory} MiB</span>
                            <div className="progress mb-4">
                                <div className="progress-bar" role="progressbar" style={{width: memoryPercent + "%"}} aria-valuenow={memoryPercent} aria-valuemin="0" aria-valuemax="100">{memoryPercent}%</div>
                            </div>
                        </div>
                    </button>
                </div>
                <div className="accordian-body collapse" id={collapseId}>
                    <ul className="list-group pe-0 list-group-flush">
                        {experimentListItems}
                    </ul>
                </div>
            </div>
        </div>
    );
};

const GPUOverview = () => {
    const [gpus, setGpus] = useState([]);

    useEffect(() => {
        getGpus(setGpus);
        const interval = setInterval(() => getGpus(setGpus), 5000);
        return () => {
            clearInterval(interval);
        };
    }, []);


    const gpuCards = gpus.map((data, index) =>
        <GPUCard key={index} index={index} {...data} />
    );

    return (
        <div className="border rounded shadow p-3 mb-3">
            <h2 className="">GPUs</h2>
            {gpuCards}
        </div>
    );
};

export default GPUOverview;
