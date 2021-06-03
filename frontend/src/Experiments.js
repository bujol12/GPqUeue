import React, {useState} from "react";
import {Sort, SortDropdown} from "./Sort.js";

const ExperimentCard = ({status, name, user, gpu, start, duration}) => {
    const icon = `${status}.png`;

    let end;
    if (status === "queued") {
        end = (
            <div className="col align-self-center pt-3 me-3 text-end">
                <p>Queued</p>
            </div>
        );
    } else {
        end = (
            <div className="col pt-3 me-3 text-end">
                <p>{start}</p>
                <p>{duration}</p>
            </div>
        );
    }

    return (
        <div className="row border mb-3">
            <div className="icon-col align-self-center pt-3 mb-3 me-3">
                <img className="icon" src={icon} />
            </div>
            <div className="col pt-3">
                <h3>{name}</h3>
                <p>{user} {gpu}</p>
            </div>
            {end}
        </div>
    );
};

const Experiments = ({experiments, title}) => {
    const experimentCards = experiments.map((data, index) =>
        <ExperimentCard key={index} {...data} />
    );
    const sortRules = [
        {text: "Newest", prop: "start", increasing: false},
        {text: "Oldest", prop: "start", increasing: true},
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
            <Sort {...sortRule}>
                {experimentCards}
            </Sort>
        </div>
    );
};

export default Experiments;
