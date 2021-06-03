import React, {useState} from "react";
import {Sort, SortDropdown} from "./Sort.js";
import ExperimentCard from "./ExperimentCard.js";

const ExperimentCardList = ({experiments}) => {
    const experimentCards = experiments.map((data, index) =>
        <ExperimentCard key={index} status={data.status} name={data.name} user={data.user} gpu={data.gpu} start={data.start} duration={data.duration} queuing={data.queuing} />
    );
    return (
        <div>
            {experimentCards}
        </div>
    );
};

const MyExperiments = () => {
    const queuingExperiments = [
        { status: "queued", name: "Cold Dog Classifier", gpu: "GPU 0 - RTX 3060", queuing: "Queued (1 / 2)" },
        { status: "queued", name: "Cold Dog Classifier #1", gpu: "GPU 0 - RTX 3060", queuing: "Queued (2 / 2)" }
    ];
    const ongoingExperiments = [
        { status: "inprogress", name: "Hot Dog Classifier #2", gpu: "GPU 2 - V100", start: "13:04", duration: "3m 54s" },
    ];
    const completedExperiments = [
        { status: "failed", name: "Hot Dog Classifier #1", gpu: "GPU 2 - V100", start: "03:54", duration: "10h 30m 19s" },
        { status: "failed", name: "Muffins vs Dogs Detector", gpu: "GPU 0 - RTX 3060", start: "Yesterday", duration: "18h 53m 6s" },
        { status: "success", name: "NLP Experiment", gpu: "GPU 0 - RTX 3060", start: "Yesterday", duration: "18h 53m 6s" }
    ];
    const sortOptions = [
        "Newest",
        "Oldest",
        "Duration"
    ];
    const {sortBy, setSortBy} = useState("Newest");

    return (
        <div className="container-md">
            <h1 className="pt-4 mb-4">My Experiments</h1>
            <div className="col text-end mb-3">
                <SortDropdown options={sortOptions} setSortBy={setSortBy} />
            </div>
            <Sort by={sortBy}>
                <ExperimentCardList className="mb-4" experiments={queuingExperiments} />
                <ExperimentCardList className="mb-4" experiments={ongoingExperiments} />
                <ExperimentCardList className="mb-4" experiments={completedExperiments} />
            </Sort>
        </div>
    );
};

export default MyExperiments;
