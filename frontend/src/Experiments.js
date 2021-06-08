import React, {useState, useEffect} from "react";
import {Sort, SortDropdown} from "./Sort.js";

const secondsToHoursMinutesSeconds = (totalSeconds) => {
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const hours = Math.floor(totalSeconds / (60 * 60));
    return `${hours}h ${minutes}m ${seconds}s`;
};

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

const ExperimentCard = ({ status, name, user, gpu, start, end, index }) => {
    const icon = `${status ? status.toLowerCase() : ""}.png`;
    const [infoText, setInfoText] = useState(getInfoText(status, start, end));
    const prefix = "experimentCard";
    const id = `${prefix}-${index}`;
    const label = `${prefix}-label-${index}`;

    useEffect(() => {
        const interval = setInterval(() => setInfoText(getInfoText(status, start, end)), 1000);
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
                <div styles id={id} className="accordion-collapse collapse" aria-labelledby={label}>
                    <div className="accordion-body">
                        <strong>This is the first item's accordion body.</strong> It is shown by default, until the collapse plugin adds the appropriate classes that we use to style each element. These classes control the overall appearance, as well as the showing and hiding via CSS transitions. You can modify any of this with custom CSS or overriding our default variables. It's also worth noting that just about any HTML can go within the <code>.accordion-body</code>, though the transition does limit overflow.
                    </div>
                </div>
            </div>
        </div>
    );
};

const Experiments = ({experiments, title}) => {
    const experimentCards = experiments.map((data, index) =>
        <ExperimentCard key={index} index={index} {...data} />
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
