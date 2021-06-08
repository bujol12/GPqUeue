import React, {useState, useEffect} from "react";
import {Sort, SortDropdown} from "./Sort.js";
import {secondsToHoursMinutesSeconds} from "./util.js";


const getInfoText = (status, startTime, endTime) => {
    let infoText;

    if (status === "QUEUED") {
        infoText = (
            <div className="col align-self-center pt-3 me-3 text-end">
                <p>Queued</p>
            </div>
        );
    } else {
        const startDate = new Date(startTime);
        const currentDate = new Date();
        const millisecondsInADay = 1000 * 60 * 60 * 24;
        const daysSinceStart = Math.floor((currentDate.getTime() - startDate.getTime()) / millisecondsInADay);
        let startText = "";

        if (daysSinceStart === 0) {
            startText = `${startDate.getHours()}:${startDate.getMinutes()}`;
        } else if (daysSinceStart === 1) {
            startText = "Yesterday";
        } else if (daysSinceStart < 7) {
            startText = `${daysSinceStart} days ago`;
        } else {
            startText = `${startDate.getDate()}/${startDate.getMonth()}/${startDate.getFullYear()}`;
        }

        const endDate = endTime ? new Date(endTime) : currentDate;
        const duration = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);

        infoText = (
            <div className="col pt-3 me-3 text-end">
                <p>{startText}</p>
                <p>{secondsToHoursMinutesSeconds(duration)}</p>
            </div>
        );
    }

    return infoText;
};

const ExperimentCard = ({status, name, user, gpu, start, end}) => {
    const icon = `${status ? status.toLowerCase() : ""}.png`;
    const [infoText, setInfoText] = useState(getInfoText(status, start, end));

    useEffect(() => {
        const interval = setInterval(() => setInfoText(getInfoText(status, start, end)), 1000);
        return () => {
            clearInterval(interval);
        };
    }, []);


    return (
        <div className="row border mb-3">
            <div className="icon-col align-self-center pt-3 mb-3 me-3">
                <img className="icon" src={icon} />
            </div>
            <div className="col pt-3">
                <h3>{name}</h3>
                <p>{user} {gpu}</p>
            </div>
            {infoText}
        </div>
    );
};

const Experiments = ({experiments, title}) => {
    const experimentCards = experiments.map((data, index) =>
        <ExperimentCard key={index} {...data} />
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
            <Sort {...sortRule}>
                {experimentCards}
            </Sort>
        </div>
    );
};

export default Experiments;
