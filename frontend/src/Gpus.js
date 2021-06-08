import React, {useState, useEffect} from "react";
import axios from "axios";

const getGpus = (setGpus) => {
    axios.get("/api/gpu_stats").then(res => {
        let tempGpus = [];
        for (const key in Object.keys(res.data)) {
            const data = res.data[key];
            tempGpus.push({
                index: data.name,
                name: data.model,
                user: data.last_user,
                util: data.last_utilisation_pct,
                memory: data.last_memory_used_mib,
                maxMemory: data.total_memory_mib
            });
        }
        setGpus(tempGpus);
    });
};

const GPUCard = ({user, index, name, util, memory, maxMemory}) => {
    const icon = !user ? "available.png" : "busy.png";
    const userText = !user ? "Available" : user;

    return (
        <div className="row border mb-3">
            <div className="icon-col align-self-center pt-3 mb-3 me-3">
                <img className="icon" src={icon} />
            </div>
            <div className="col pt-3">
                <h3>GPU {index} - {name}</h3>
                <p>{userText}</p>
            </div>
            <div className="col pt-3 me-3 text-end">
                <p>Utilisation: {(new Number(util * 100).toPrecision(3))}%</p>
                <p>Memory: {memory} / {maxMemory} MiB</p>
            </div>
        </div>
    );
};

const GPUOverview = () => {
    const [gpus, setGpus] = useState([]);

    useEffect(() => {
        getGpus(setGpus);
        const interval = setInterval(() => getGpus(setGpus), 1500);
        return () => {
            clearInterval(interval);
        };
    }, []);


    const gpuCards = gpus.map((data, index) =>
        <GPUCard key={index} index={index} {...data} />
    );

    return (
        <div>
            <div className="row">
                <div className="col">
                    <h2>GPU Loads</h2>
                </div>
            </div>
            {gpuCards}
        </div>
    );
};

const GPUs = () => {
    return (
        <div className="container container-md-custom">
            <h1 className="pt-4 mb-4">GPUs</h1>
            <GPUOverview />
        </div>
    );
};

export {GPUs, GPUOverview};
