import React, {useState, useEffect} from "react";
import axios from "axios";
import Experiments from "./Experiments.js";

const Project = ({name, project, setProject}) => {
    const isActive = name === project;
    const classes = "list-group-item " + (isActive ? "active" : "");

    return (
        <button className="project shadow bg-transparent rounded mb-1" onClick={() => setProject(name)}>
            <li className={classes}>
                {name}
            </li>
        </button>
    );
};

const getProjects = (setProjects) => {
    axios.get("/api/projects").then((res) => {
        if (res.data.projects) {
            setProjects(res.data.projects);
        }
    });
};

const MyExperiments = () => {
    const [project, setProject] = useState("General");
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        getProjects(setProjects);
    }, []);

    const projectLinks = projects.map((p, i) =>
        <Project key={i} name={p} project={project} setProject={setProject} />
    );

    return (
        <div className="container row">
            <div className="col-3">
                <h1 className="pt-4 mb-4">Projects</h1>
                <ul className="p-0">
                    {projectLinks}
                </ul>
            </div>
            <div className="col">
                <h1 className="pt-4 mb-4">My Experiments</h1>
                <Experiments className="mb-4" project={project} statuses={["running", "queued"]} title="Ongoing Experiments" />
                <Experiments className="mb-4" project={project} statuses={["completed", "failed"]} title="Finished Experiments"/>
            </div>
        </div>
    );
};

export default MyExperiments;
