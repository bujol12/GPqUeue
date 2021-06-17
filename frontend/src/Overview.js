import Experiments from "./Experiments.js";
import GPUOverview from "./Gpus.js";

const Overview = () => {
    return (
        <div className="container">
            <h1 className="pt-4 mb-4">Overview</h1>
            <div className="row">
                <div className="col">
                    <GPUOverview className="mb-4" />
                </div>
                <div className="col">
                    <Experiments className="mb-4" project="General" statuses={["running", "queued"]} title="Ongoing Experiments" />
                    <Experiments className="mb-4" project="General" statuses={["completed", "failed"]} title="Finished Experiments"/>
                </div>
            </div>
        </div>
    );
};

export default Overview;
