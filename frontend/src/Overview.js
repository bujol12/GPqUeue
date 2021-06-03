import React, {useState, useEffect} from "react";
import {Sort, SortDropdown} from "./Sort.js";
import Experiments from "./Experiments.js";
import axios from "axios";

const GPUCard = ({user, index, name, util, memory, maxMemory}) => {
    const icon = user == "" ? "" : "busy.png";
    const userText = user == "" ? "Available" : user;

    return (
        <div className="row border mb-3">
            <div className="icon-col align-self-center pt-3 mb-3 me-3">
                <img className="icon" src={icon} />
            </div>
            <div className="col pt-3">
                <h3>GPU {index} - {name}</h3>
                <p>{userText}</p>
            </div>
            <div className="col pt-3 me-3 text-end">
                <p>Utilisation: {(new Number(util * 100).toPrecision(3))}%</p>
                <p>Memory: {memory} / {maxMemory} MiB</p>
            </div>
        </div>
    );
};


const GPUOverview = ({gpus}) => {
    const gpuCards = gpus.map((data, index) =>
        <GPUCard key={index} index={index} {...data} />
    );

    return (
        <div>
            <div className="row">
                <div className="col">
                    <h2>GPU Loads</h2>
                </div>
            </div>
            {gpuCards}
        </div>
    );
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

const Overview = () => {
    const [gpus, setGpus] = useState([]);

    useEffect(() => {
        getGpus(setGpus);
        const interval = setInterval(() => getGpus(setGpus), 1500);
        return () => {
            clearInterval(interval);
        };
    }, []);

    const experiments = [
        {status: "success", user: "Delilah Han", name: "NLP Experiment", gpu: "GPU 0 - RTX 3060", start: 1621790591741, end: 1621820591741},
        {status: "failed", user: "Joe Stacey", name: "Muffins vs Dogs Detector", gpu: "GPU 0 - RTX 3060", start: 1621610591741, end: 1621720591741},
        {status: "inprogress", user: "Sherry Edwards", name: "Hotdog Classifer", gpu: "GPU 2 - V100", start: 1622720591741},
        {status: "queued", user: "Joe Stacey", name: "Colddog Classifer", gpu: "GPU 0 - RTX 3060"}
    ];
    const ongoingExperiments = experiments.filter(e => e.status === "inprogress" || e.status === "queued");
    const completedExperiments = experiments.filter(e => e.status === "success" || e.status === "failed");

    return (
        <div className="container container-md-custom">
            <h1 className="pt-4 mb-4">Overview</h1>
            <GPUOverview className="mb-4" gpus={gpus} />
            <Experiments className="mb-4" experiments={ongoingExperiments} title="Ongoing Experiments" />
            <Experiments className="mb-4" experiments={completedExperiments} title="Completed Experiments"/>
        </div>
    );
};

export default Overview;
