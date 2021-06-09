import os
from typing import Any, Dict, List, Optional

from flask import Flask, request
from flask_login import LoginManager, current_user, login_required
from webargs import fields
from webargs.flaskparser import use_args, use_kwargs

import src.auth
from src.database import get_database, setup_database
from src.enums.job_status import JobStatus
from src.gpu import GPU
from src.job import Job
from src.mocked_gpu import MockedGPU
from src.user import User

app = Flask(__name__)
app.secret_key = '0785f0f7-43fd-4148-917f-62f915d94e38'  # a random uuid4
app.register_blueprint(src.auth.bp)

login_manager = LoginManager()
login_manager.init_app(app)

HAS_GPU = ((os.environ.get("gpu") or '').lower() in ('true', '1', 't'))
GPU_DCT: Dict[str, GPU] = {}


@login_manager.user_loader
def load_user(username) -> Optional[User]:
    return User.load(username)


@app.before_first_request
def get_gpus():
    if not HAS_GPU:
        mock_available_gpus()
    else:
        pass


@app.before_first_request
def setup_redis():
    setup_database()


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


def get_jobs(
    status_list: List[JobStatus],
    public: bool = False
) -> List[Dict[str, Any]]:
    job_dict_list: List[List[Dict[str, Any]]]
    job_dict_list = [get_database().fetch_all_matching(
        'status',
        status.value
    ) for status in status_list]
    job_list: List[Job] = [job for job in
                           [Job.load(_dict)
                            for _list in job_dict_list
                            for _dict in _list]
                           if job is not None]

    result_list: List[Dict[str, Any]]

    if not public:
        result_list = [job.to_dict()
                       for job in job_list
                       if job.user == current_user]
    else:
        result_list = [job.to_dict() for job in job_list]

    return result_list


@app.route("/finished_jobs")
@login_required
@use_args({
    'public': fields.Bool(required=False, default=False, missing=False),
})
def get_finished_jobs(args: Dict[str, Any]) -> Dict[str, List[Dict[str, Any]]]:
    public: bool = args['public']

    return {"jobs": get_jobs(
        [JobStatus.COMPLETED, JobStatus.FAILED, JobStatus.CANCELLED],
        public=public,
    )}


@app.route("/ongoing_jobs")
@login_required
@use_args({
    'public': fields.Bool(required=False, default=False, missing=False),
})
def get_ongoing_jobs(args: Dict[str, Any]) -> Dict[str, List[Dict[str, Any]]]:
    public: bool = args['public']

    return {"jobs": get_jobs(
        [JobStatus.QUEUED, JobStatus.RUNNING],
        public=public
    )}


@app.route("/add_job", methods=['POST'])
@login_required
def add_new_job() -> Dict[str, Any]:
    name = request.json.get('experiment_name')
    script_path = request.json.get('script_path')
    cli_args = request.json.get('cli_args')
    user: User = current_user

    job = Job(name, script_path, cli_args, user=user)
    get_database().add_key(job.get_DB_key(), job.dump())
    return {"status": "success"}


@app.route("/cancel_job", methods=['GET', 'POST'])
@login_required
@use_kwargs({
    'uuid': fields.Str(required=True),
}, location='json')
def cancel_job(uuid: str) -> Dict[str, Any]:
    job: Optional[Job] = Job.load(uuid)
    user: User = current_user
    print(f"Received cancelling request {job}.", flush=True)
    if job is None:
        return {
            "status": "failed",
            "code": 404,
            "error": "Job not found.",
        }
    if job.user != user:
        return {
            "status": "failed",
            "code": 501,
            "error": "Unauthorised.",
        }
    # TODO: cancel job.
    print(f"Cancelled {job}.", flush=True)
    job.cancel_job()
    return {"status": "success"}

@app.route("/job_details")
@login_required
def get_job_details() -> Dict[str, Any]:
    name = request.args.get("name")
    return get_database().fetch_key(name)

@app.route("/curr_dir", methods=['GET'])
@login_required
def get_curr_dir() -> Dict[str, Any]:
    return {"status": "success", "currDir": os.getcwd()}


def mock_available_gpus():
    global GPU_DCT
    GPU_DCT.update({
        "0": MockedGPU(name="0", model="mockedGPU", total_memory_mib=12000),
        "1": MockedGPU(name="1", model="mockedGPU", total_memory_mib=10000),
        "2": MockedGPU(name="2", model="mockedGPU", total_memory_mib=8000),
        "3": MockedGPU(name="3", model="mockedGPU", total_memory_mib=16000)
    })
