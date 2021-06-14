import React, {useState, useEffect} from "react";
import {Link} from "react-router-dom";
import {Experiments, getExperiments} from "./Experiments.js";

const Project = ({id, name}) => {
    return (
        <Link className="project" to={"myexperiments/" + id}>
            <li className="list-group-item">
                {name}
            </li>
        </Link>
    );
};

const MyExperiments = () => {
    const [ongoingExperiments, setOngoingExperiments] = useState([]);
    const [finishedExperiments, setFinishedExperiments] = useState([]);

    useEffect(() => {
        getExperiments(setOngoingExperiments, "ongoing_jobs");
        getExperiments(setFinishedExperiments, "finished_jobs");
    }, []);

    return (
        <div className="container row">
            <div className="col-3">
                <h1 className="pt-4 mb-4">Projects</h1>
                <ul className="list-group">
                    <Project id={0} name="General" />
                    <Project id={1} name="Food / Animal Classifers" />
                    <Project id={2} name="Game Differentiators" />
                    <Project id={3} name="Face Identifiers" />
                </ul>
            </div>
            <div className="col">
                <h1 className="pt-4 mb-4">My Experiments</h1>
                <Experiments className="mb-4" experiments={ongoingExperiments} title="Ongoing Experiments" />
                <Experiments className="mb-4" experiments={finishedExperiments} title="Finished Experiments" />
            </div>
        </div>
    );
};

export default MyExperiments;
