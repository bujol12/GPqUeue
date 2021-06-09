import React, {useEffect, useState} from "react";
import axios from "axios";
import {msToHoursMinutesSeconds, msToTimeString} from "./util.js";

const getDetails = (jobId, setDetails) => {
    axios.get("/api/job_details", {
        params: {
            jobid: jobId
        }
    }).then((res) => {
        setDetails(res.data);
    });
};

const ExperimentDetails = ({match}) => {
    const [details, setDetails] = useState(null);

    useEffect(() => {
        getDetails(match.params.id, setDetails);
        return () => {};
    }, []);

    if (details == null) {
        return (
            <div className="container">
                <h1 className="pt-4 mb-4">No experiment found.</h1>
            </div>
        );
    }

    const runtime = msToHoursMinutesSeconds(details.endTime - details.startTime);

    return (
        <div className="container">
            <div className="row">
                <h1 className="pt-4 mb-4">Experiment Details {match.params.id}</h1>
            </div>
            <div className="row">
                <div className="col">
                    <h3>Overview</h3>
                    <table className="table table-striped">
                        <tbody>
                            <tr>
                                <td>Project</td>
                                <td>{details.name}</td>
                            </tr>
                            <tr>
                                <td>Status</td>
                                <td className="text-success">{details.status}</td>
                            </tr>
                            <tr>
                                <td>Runtime</td>
                                <td>{runtime}</td>
                            </tr>
                            <tr>
                                <td>Started</td>
                                <td>{msToTimeString(details.startTime)}</td>
                            </tr>
                            <tr>
                                <td>Finished</td>
                                <td>{msToTimeString(details.endTime)}</td>
                            </tr>
                            <tr>
                                <td>GPU</td>
                                <td>{details.gpu}</td>
                            </tr>
                            <tr>
                                <td>Dataset</td>
                                <td><code>{details.dataset}</code></td>
                            </tr>
                        </tbody>
                    </table>
                    <h3>Configuration</h3>
                    <textarea style={{resize: "none", width: "100%"}} rows="9" readOnly>{details.configuration}</textarea>
                </div>
                <div className="col">
                    <h3>Log</h3>
                    <textarea style={{resize: "none", width: "100%"}} rows="23" readOnly>{details.log}</textarea>
                </div>
            </div>
        </div>
    );
};

export default ExperimentDetails;
