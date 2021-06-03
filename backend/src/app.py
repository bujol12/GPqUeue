import os
from typing import Any, Dict, Optional
from flask import Flask, request

from database import Database
from enums.job_status import JobStatus
from gpu import GPU
from job import Job
from mocked_gpu import MockedGPU

app = Flask(__name__)

HAS_GPU = ((os.environ.get("gpu") or '').lower() in ('true', '1', 't'))
REDIS: Optional[Database] = None
GPU_DCT: Dict[str, GPU] = {}


@app.before_first_request
def get_gpus():
    if not HAS_GPU:
        mock_available_gpus()
    else:
        pass


@app.before_first_request
def setup_redis():
    global REDIS
    REDIS = Database()


@app.route("/hello")
def hello_world():
    return "<p>Hello, World!</p>"


@app.route("/available_gpus")
def get_available_gpu_names() -> Dict[str, Any]:
    return {'gpus': list(GPU_DCT.keys())}


@app.route("/gpu_stats")
def get_gpu_stats() -> Dict[str, Dict[str, Any]]:
    result = {}
    for gpu_name, gpu in GPU_DCT.items():
        result[gpu_name] = gpu.get_stats()
    return result


@app.route("/finished_jobs")
def get_finished_jobs() -> Dict[str, Any]:
    return {"jobs": REDIS.fetch_all_matching('status', JobStatus.COMPLETED.value)
                    + REDIS.fetch_all_matching('status', JobStatus.FAILED.value)}


@app.route("/ongoing_jobs")
def get_ongoing_jobs() -> Dict[str, Any]:
    return {"jobs": REDIS.fetch_all_matching('status', JobStatus.QUEUED.value)
                    + REDIS.fetch_all_matching('status', JobStatus.RUNNING.value)}


@app.route("/add_job", methods=['POST'])
def add_new_job() -> Dict[str, Any]:
    name = request.json.get('experiment_name')
    script_path = request.json.get('script_path')
    cli_args = request.json.get('cli_args')

    job = Job(name, script_path, cli_args)
    REDIS.add_key(name, job.to_dict())
    return {"status": "success"}


def mock_available_gpus():
    global GPU_DCT
    GPU_DCT.update({
        "0": MockedGPU(name="0", model="mockedGPU", total_memory_mib=12000),
        "1": MockedGPU(name="1", model="mockedGPU", total_memory_mib=10000),
        "2": MockedGPU(name="2", model="mockedGPU", total_memory_mib=8000),
        "3": MockedGPU(name="3", model="mockedGPU", total_memory_mib=16000)
    })
