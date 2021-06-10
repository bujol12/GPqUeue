import React, {useState, useEffect} from "react";
import {Experiments, getExperiments} from "./Experiments.js";

const MyExperiments = () => {
    const [ongoingExperiments, setOngoingExperiments] = useState([]);
    const [finishedExperiments, setFinishedExperiments] = useState([]);

    useEffect(() => {
        getExperiments(setOngoingExperiments, "ongoing_jobs");
        getExperiments(setFinishedExperiments, "finished_jobs");
    }, []);

    return (
        <div className="container container-md-custom">
            <h1 className="pt-4 mb-4">My Experiments</h1>
            <Experiments className="mb-4" experiments={ongoingExperiments} title="Ongoing Experiments" />
            <Experiments className="mb-4" experiments={finishedExperiments} title="Finished Experiments" />
        </div>
    );
};

export default MyExperiments;
