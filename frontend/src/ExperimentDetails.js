import React, {useEffect, useState} from "react";
import axios from "axios";
import {msToHoursMinutesSeconds, msToTimeString} from "./util.js";
import { routerHistory } from "./App.js";

const getDetails = (uuid, setDetails) => {
    axios.get("/api/job_details", {
        params: {
            uuid: uuid
        }
    }).then((res) => {
        setDetails(res.data);
    });
};

const ExperimentDetails = ({match}) => {
    const [details, setDetails] = useState(null);

    useEffect(() => {
        getDetails(match.params.uuid, setDetails);
        return () => {};
    }, []);

    const [gpus, setGpus] = useState([]);

    useEffect(() => {
        axios.get(
            "/api/gpu_stats"
        ).then((res) => {
            if (details === null) {
                return;
            }
            let tempGpus = [];
            for (let i in res.data) {
                if (details.gpus_list.includes(res.data[i].name)) {
                    tempGpus.push(res.data[i].name + " - " + res.data[i].model);
                }
            }
            setGpus(tempGpus);
        });
    }, [details]);

    if (details == null) {
        return (
            <div className="container">
                <h1 className="pt-4 mb-4">No experiment found.</h1>
                <small>UUID: {match.params.uuid}</small>
            </div>
        );
    }

    const runtime = msToHoursMinutesSeconds(details.finish_time - details.start_time);

    let statusColour = "";

    if (details.status === "COMPLETED") {
        statusColour = "text-success";
    } else if (details.status === "QUEUED") {
        statusColour = "text-warning";
    } else {
        statusColour = "text-danger";
    }

    const backButton = () => {
        routerHistory.goBack();
    };

    const cliArgs = JSON.parse(details.cli_args);
    const cliCount = Object.keys(cliArgs).length;
    const cliArgsDisplayText = (
        cliCount != 0 ?
            Object.keys(cliArgs).map(
                (key, index) => (`${key}: ${cliArgs[key]}`)
            ).join("\n")
            : "<Empty>"
    );

    return (
        <div className="container">
            <button type="button" className="btn btn-outline-primary mt-3" onClick={backButton}>&lt; Back</button>
            <div className="row">
                <h1 className="pt-4 mb-4">Details - {details.name}</h1>
            </div>
            <div className="row">
                <div className="col">
                    <h3>Overview</h3>
                    <table className="table table-striped">
                        <tbody>
                            <tr>
                                <td>Project</td>
                                <td>{details.project}</td>
                            </tr>
                            <tr>
                                <td>Experiment Name</td>
                                <td>{details.name}</td>
                            </tr>
                            <tr>
                                <td>Status</td>
                                <td className={statusColour}>{details.status.toLowerCase()}</td>
                            </tr>
                            <tr>
                                <td>Command</td>
                                <td>{details.script_path !== "" ? (<code>{details.script_path}</code>) : "-"}</td>
                            </tr>
                            <tr>
                                <td>Runtime</td>
                                <td>{details.start_time ? runtime : "-"}</td>
                            </tr>
                            <tr>
                                <td>Started</td>
                                <td>{details.start_time ? msToTimeString(details.start_time) : "-"}</td>
                            </tr>
                            <tr>
                                <td>Finished</td>
                                <td>{details.finish_time ? msToTimeString(details.finish_time) : "-"}</td>
                            </tr>
                            <tr>
                                <td>GPU</td>
                                <td>{gpus.join(", ")}</td>
                            </tr>
                            <tr>
                                <td>Dataset</td>
                                <td><code>TODO</code></td>
                            </tr>
                            <tr>
                                <td>UUID</td>
                                <td>{match.params.uuid}</td>
                            </tr>
                        </tbody>
                    </table>
                    <h3>Configuration</h3>
                    <textarea style={{ resize: "none", width: "100%" }} rows={`${cliCount}`} readOnly>{cliArgsDisplayText}</textarea>
                </div>
                <div className="col">
                    <h3>Log</h3>
                    <textarea style={{resize: "none", width: "100%"}} rows="23" readOnly>TODO</textarea>
                </div>
            </div>
        </div>
    );
};

export default ExperimentDetails;
