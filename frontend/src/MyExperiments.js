import React, {useState, useEffect} from "react";
import axios from "axios";
import Experiments from "./Experiments.js";

const getExperiments = (setExperiments, endpoint) => {
    axios.get(`/api/${endpoint}`).then(res => {
        let tempExperiments = [];
        for (const key in Object.keys(res.data.jobs)) {
            tempExperiments.push({
                status: res.data.jobs[key].status,
                name: res.data.jobs[key].name,
                gpu: "TODO",
                queueing: "queued",
            });
        }
        setExperiments(tempExperiments);
    });
};

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
            <Experiments className="mb-4" experiments={finishedExperiments} title="Completed Experiments" />
        </div>
    );
};

export default MyExperiments;
