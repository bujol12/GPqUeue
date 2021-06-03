import React, {useState} from "react";
import {Sort, SortDropdown} from "./Sort.js";
import ExperimentCard from "./ExperimentCard.js";

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
                <p>Utilisation: {util}%</p>
                <p>Memory: {memory} / {maxMemory} MiB</p>
            </div>
        </div>
    );
};


const GPUOverview = ({gpuData}) => {
    const gpuCards = gpuData.map((data, index) =>
        <GPUCard key={index} index={index} name={data.name} user={data.user} util={data.util} memory={data.memory} maxMemory={data.maxMemory} />
    );
    const sortOptions = [
        "GPU",
        "Available",
        "Utilisation",
        "Memory",
    ];
    const {sortBy, setSortBy} = useState("gpu");

    return (
        <div>
            <div className="row">
                <div className="col">
                    <h2>GPU Loads</h2>
                </div>
                <div className="col text-end">
                    <SortDropdown options={sortOptions} setSortBy={setSortBy} />
                </div>
            </div>
            <Sort by={sortBy}>
                {gpuCards}
            </Sort>
        </div>
    );
};


const CompletedOverview = ({experiments}) => {
    const experimentCards = experiments.map((data, index) =>
        <ExperimentCard key={index} status={data.status} name={data.name} user={data.user} gpu={data.gpu} start={data.start} duration={data.duration} />
    );
    const sortOptions = [
        "GPU",
        "Available",
        "Utilisation",
        "Memory",
    ];
    const {sortBy, setSortBy} = useState("gpu");

    return (
        <div>
            <div className="row">
                <div className="col">
                    <h2>Completed Experiments</h2>
                </div>
                <div className="col text-end">
                    <SortDropdown options={sortOptions} setSortBy={setSortBy} />
                </div>
            </div>
            <Sort by={sortBy}>
                {experimentCards}
            </Sort>
        </div>
    );
};

const OngoingOverview = ({experiments}) => {
    const experimentCards = experiments.map((data, index) =>
        <ExperimentCard key={index} status={data.status} name={data.name} user={data.user} gpu={data.gpu} start={data.start} duration={data.duration} />
    );
    const sortOptions = [
        "GPU",
        "Available",
        "Utilisation",
        "Memory",
    ];
    const {sortBy, setSortBy} = useState("gpu");

    return (
        <div>
            <div className="row">
                <div className="col">
                    <h2>Ongoing Experiments</h2>
                </div>
                <div className="col text-end">
                    <SortDropdown options={sortOptions} setSortBy={setSortBy} />
                </div>
            </div>
            <Sort by={sortBy}>
                {experimentCards}
            </Sort>
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
        <div className="container container-md-custom">
            <h1 className="pt-4 mb-4">Overview</h1>
            <GPUOverview className="mb-4" gpuData={gpuData} />
            <CompletedOverview className="mb-4" experiments={completedExperiments} />
            <OngoingOverview className="mb-4" experiments={ongoingExperiments} />
        </div>
    );
};

export default Overview;
