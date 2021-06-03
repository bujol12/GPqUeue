import Experiments from "./Experiments.js";

const MyExperiments = () => {
    const experiments = [
        { status: "queued", name: "Cold Dog Classifier", gpu: "GPU 0 - RTX 3060", queuing: "Queued (1 / 2)" },
        { status: "queued", name: "Cold Dog Classifier #1", gpu: "GPU 0 - RTX 3060", queuing: "Queued (2 / 2)" },
        { status: "inprogress", name: "Hot Dog Classifier #2", gpu: "GPU 2 - V100", start: "13:04", duration: "3m 54s" },
        { status: "failed", name: "Hot Dog Classifier #1", gpu: "GPU 2 - V100", start: "03:54", duration: "10h 30m 19s" },
        { status: "failed", name: "Muffins vs Dogs Detector", gpu: "GPU 0 - RTX 3060", start: "Yesterday", duration: "18h 53m 6s" },
        { status: "success", name: "NLP Experiment", gpu: "GPU 0 - RTX 3060", start: "Yesterday", duration: "18h 53m 6s" }
    ];
    const queuingExperiments = experiments.filter(e => e.status === "queued");
    const ongoingExperiments = experiments.filter(e => e.status === "inprogress");
    const completedExperiments = experiments.filter(e => e.status === "failed" || e.status === "success");

    return (
        <div className="container container-md-custom">
            <h1 className="pt-4 mb-4">My Experiments</h1>
            <Experiments className="mb-4" experiments={queuingExperiments} title="Queued Experiments" />
            <Experiments className="mb-4" experiments={ongoingExperiments} title="Ongoing Experiments" />
            <Experiments className="mb-4" experiments={completedExperiments} title="Completed Experiments" />
        </div>
    );
};

export default MyExperiments;
