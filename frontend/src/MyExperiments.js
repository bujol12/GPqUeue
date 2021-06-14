import React, {useState} from "react";
import Experiments from "./Experiments.js";

const Project = ({name, project, setProject}) => {
    const isActive = name === project;
    const classes = "list-group-item " + (isActive ? "active" : "");

    return (
        <button className="project" onClick={() => setProject(name)}>
            <li className={classes}>
                {name}
            </li>
        </button>
    );
};

const MyExperiments = () => {
    const [project, setProject] = useState("General");


    return (
        <div className="container row">
            <div className="col-3">
                <h1 className="pt-4 mb-4">Projects</h1>
                <ul className="list-group">
                    <Project name="General" project={project} setProject={setProject} />
                    <Project name="Food / Animal Classifers" project={project} setProject={setProject} />
                    <Project name="Game Differentiators" project={project} setProject={setProject} />
                    <Project name="Face Identifiers" project={project} setProject={setProject} />
                </ul>
            </div>
            <div className="col">
                <h1 className="pt-4 mb-4">My Experiments</h1>
                <Experiments className="mb-4" endpoint="/ongoing_jobs" project={project} title="Ongoing Experiments" />
                <Experiments className="mb-4" endpoint="/finished_jobs" project={project} title="Finished Experiments" />
            </div>
        </div>
    );
};

export default MyExperiments;
