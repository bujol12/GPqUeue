import Experiments from "./Experiments.js";
import GPUOverview from "./Gpus.js";

const Overview = () => {
    return (
        <div className="container container-md-custom">
            <h1 className="pt-4 mb-4">Overview</h1>
            <GPUOverview className="mb-4" />
            <Experiments className="mb-4" endpoint="/ongoing_jobs" project="General" title="Ongoing Experiments" />
            <Experiments className="mb-4" endpoint="/finished_jobs" project="General" title="Finished Experiments"/>
        </div>
    );
};

export default Overview;
