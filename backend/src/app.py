import os
from typing import *

from flask import Flask
from mocked_gpu import MockedGPU

app = Flask(__name__)

HAS_GPU = ((os.environ.get("gpu") or '').lower() in ('true', '1', 't'))
GPU_DCT = {}


@app.before_first_request
def get_gpus():
    if not HAS_GPU:
        mock_available_gpus()
    else:
        pass


@app.route("/hello")
def hello_world():
    return "<p>Hello, World!</p>"


@app.route("/available_gpus")
def get_available_gpu_names() -> Dict:
    return {'gpus': list(GPU_DCT.keys())}


@app.route("/gpu_stats")
def get_gpu_stats() -> Dict[str, Dict]:
    result = {}
    for gpu_name, gpu in GPU_DCT.items():
        result[gpu_name] = gpu.get_stats()
    return result


@app.route("/finished_jobs")
def get_finished_jobs() -> Dict:
    return {}


@app.route("/ongoing_jobs")
def get_ongoing_jobs() -> Dict:
    return {}


def mock_available_gpus():
    global GPU_DCT
    GPU_DCT= {
        "0": MockedGPU(name="0", model="mockedGPU", total_memory_mib=12000),
        "1": MockedGPU(name="1", model="mockedGPU", total_memory_mib=10000),
        "2": MockedGPU(name="2", model="mockedGPU", total_memory_mib=8000),
        "3": MockedGPU(name="3", model="mockedGPU", total_memory_mib=16000)
    }