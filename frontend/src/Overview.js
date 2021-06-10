import React, {useState, useEffect} from "react";
import {Experiments, getExperiments} from "./Experiments.js";
import {GPUOverview} from "./Gpus.js";

const Overview = () => {
    const [ongoingExperiments, setOngoingExperiments] = useState([]);
    const [finishedExperiments, setFinishedExperiments] = useState([]);

    useEffect(() => {
        getExperiments(setOngoingExperiments, "ongoing_jobs");
        getExperiments(setFinishedExperiments, "finished_jobs");
    }, []);

    return (
        <div className="container container-md-custom">
            <h1 className="pt-4 mb-4">Overview</h1>
            <GPUOverview className="mb-4" />
            <Experiments className="mb-4" experiments={ongoingExperiments} title="Ongoing Experiments" />
            <Experiments className="mb-4" experiments={finishedExperiments} title="Finished Experiments"/>
        </div>
    );
};

export default Overview;
