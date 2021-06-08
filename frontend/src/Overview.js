import Experiments from "./Experiments.js";
import {GPUOverview} from "./Gpus.js";

const Overview = () => {
    const experiments = [
        {status: "success", user: "Delilah Han", name: "NLP Experiment", gpu: "GPU 0 - RTX 3060", start: 1621790591741, end: 1621820591741},
        {status: "failed", user: "Joe Stacey", name: "Muffins vs Dogs Detector", gpu: "GPU 0 - RTX 3060", start: 1621610591741, end: 1621720591741},
        {status: "inprogress", user: "Sherry Edwards", name: "Hotdog Classifer", gpu: "GPU 2 - V100", start: 1622720591741},
        {status: "queued", user: "Joe Stacey", name: "Colddog Classifer", gpu: "GPU 0 - RTX 3060"}
    ];
    const ongoingExperiments = experiments.filter(e => e.status === "inprogress" || e.status === "queued");
    const completedExperiments = experiments.filter(e => e.status === "success" || e.status === "failed");

    return (
        <div className="container container-md-custom">
            <h1 className="pt-4 mb-4">Overview</h1>
            <GPUOverview className="mb-4" />
            <Experiments className="mb-4" experiments={ongoingExperiments} title="Ongoing Experiments" />
            <Experiments className="mb-4" experiments={completedExperiments} title="Completed Experiments"/>
        </div>
    );
};

export default Overview;
