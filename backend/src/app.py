import atexit
import json
import logging
import os
from datetime import datetime
from typing import Any, Dict, List, Optional

from apscheduler.schedulers.background import BackgroundScheduler
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
from src.param_parsing import parametric_cli
from src.user import User

app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False
app.secret_key = '0785f0f7-43fd-4148-917f-62f915d94e38'  # a random uuid4
app.register_blueprint(src.auth.bp)

logger = logging.getLogger(__name__)

login_manager = LoginManager()
login_manager.init_app(app)

HAS_GPU = ((os.environ.get("gpu") or '').lower() in ('true', '1', 't'))
GPU_DCT: Dict[str, GPU] = {}

running_jobs: List[Job] = []


def check_running_jobs():
    to_remove = []

    for job in running_jobs:
        logger.warning(f"checking job: {job}")
        if job.is_finished():
            to_remove.append(job)
            success = True
            if job.process.returncode != 0:
                success = False

            job.complete_job(datetime.now(), success=success)

    for job in to_remove:
        running_jobs.remove(job)


def run_new_jobs():
    for idx, gpu in GPU_DCT.items():
        logger.warning(f"Checking gpu {gpu.get_name()}")
        logger.warning(gpu)
        if gpu.is_idle():
            logger.warning(f"GPU idle {gpu.get_name()}")
            queue = gpu.fetch_queue()
            logger.warning(queue)
            if len(queue) > 0:
                logger.warning("gpus_list0: " + str(queue[0]))
                queue[0]["gpus_list"] = list(map(
                    lambda x: GPU.load(x),
                    json.loads(queue[0].get("gpus_list"))
                ))
                logger.warning("gpus_list: " + str(queue[0]))
                job = Job.from_dict(queue[0])
                logger.warning("queue0" + str(job))
                job.run_job()
                running_jobs.append(job)
                gpu.set_queue(queue[1:])


def check_job_status_and_run_new():
    check_running_jobs()
    run_new_jobs()


scheduler = BackgroundScheduler()
scheduler.add_job(func=check_job_status_and_run_new,
                  trigger="interval", seconds=10)
scheduler.start()


@login_manager.user_loader
def load_user(username) -> Optional[User]:
    return User.load(username)


@app.before_first_request
def get_gpus():
    if not HAS_GPU:
        mock_available_gpus()
    else:
        pass

    # register every gpu in database
    for gpu in GPU_DCT.values():
        gpu.commit()
        logger.warning("GPUS: " + str(gpu))


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

@app.route("/jobs")
@login_required
@use_args({
    'statuses[]': fields.List(fields.Str(), required=False, default=[], missing=[]),
    'gpu': fields.Str(required=False, default="", missing=""),
    'count': fields.Int(required=False, default=10, missing=5),
    'sortBy': fields.Str(required=False, default="newest", missing="newest"),
    'project': fields.Str(required=False, default="", missing=""),
    'public': fields.Bool(required=False, default=False, missing=False),
}, location="query")
def get_jobs(args: Dict[str, Any]) -> Dict[str, List[Dict[str, Any]]]:
    raw_statuses: List[str] = args["statuses[]"]
    gpu: str = args["gpu"]
    count: int = args["count"]
    sortBy: str = args["sortBy"]
    project: str = args['project']
    public: bool = args['public']
    statuses = []

    for status in raw_statuses:
        if status == "queued":
            statuses.append(JobStatus.QUEUED)
        elif status == 'running':
            statuses.append(JobStatus.RUNNING)
        elif status == 'failed':
            statuses.append(JobStatus.FAILED)
        elif status == 'cancelled':
            statuses.append(JobStatus.CANCELLED)
        elif status == 'completed':
            statuses.append(JobStatus.COMPLETED)

    # fetch jobs
    job_dicts: List[Dict[str, Any]]
    job_dicts = get_database().fetch_jobs()
    job_dicts = filter(lambda j: j is not None, job_dicts)
    jobs: List[Job]
    jobs = map(lambda j: Job.load(j), job_dicts)

    # filter by user
    if not public:
        jobs = filter(lambda j: j.user == current_user, jobs)

    # filter by project
    if project != "":
        jobs = filter(lambda j: j.project == project, jobs)

    # filter by status
    if statuses != []:
        jobs = filter(lambda j: j.status in statuses, jobs)

    # filter by gpu
    # ugly because filters didn't work
    if gpu != "":
        logger.warning(gpu)
        temp_jobs = []
        for j in jobs:
            gpu_uuids = []
            for g in j.gpus_list:
                logger.warning("Found " + g.uuid)
                gpu_uuids.append(g.uuid)
            if gpu in gpu_uuids:
                temp_jobs.append(j)
        jobs = temp_jobs

    # sort jobs
    if sortBy == "newest":
        jobs = sorted(jobs, key=lambda j: j.scheduled_time, reverse=True)
    elif sortBy == "oldest":
        jobs = sorted(jobs, key=lambda j: j.scheduled_time, reverse=False)
    elif sortBy == "duration":
        jobs = sorted(jobs, key=lambda j: j.finish_time - j.start_time if j.finish_time != None else datetime.now() - j.start_time, reverse=True)

    job_dicts = map(lambda j: j.dump(), jobs)

    return {
        "jobs": list(job_dicts)[:count]
    }


@app.route("/add_job", methods=['POST'])
@login_required
@use_args({
    'project': fields.Str(required=True),
    'experiment_name': fields.Str(required=True),
    'script_path': fields.Str(required=True),
    'cli_args': fields.Str(required=False, default="", missing="", allow_none=True),
    'gpus': fields.List(fields.Str, required=True),
    'yaml': fields.Str(required=False, default="", missing=""),
}, location="json")
def add_new_job(arg: Dict[str, Any]) -> Dict[str, Any]:
    yaml = arg['yaml']
    project = arg['project']
    name = arg['experiment_name']
    script_path = arg['script_path']
    cli_args = arg['cli_args']
    gpus = list(map(lambda x: GPU_DCT.get(x, None), arg['gpus']))

    assert gpus
    assert script_path
    assert name
    assert project

    def add_job(_script_path: str, _cli_args: Dict[str, str]):
        job = Job(
            project=project,
            name=name,
            script_path=_script_path,
            cli_args=_cli_args,
            gpus_list=gpus,
            user=current_user,
        )

        logger.warning("job: " + str(job))

        for gpu in gpus:
            job.add_to_queue(gpu)

        # job.run_job()

        job.commit()

    if yaml:
        args: List[Dict[str, Any]] = parametric_cli(
            cli=script_path,
            yaml_str=yaml,
        )
        for arg_dict in args:
            command: str = arg_dict['command']
            arguments: Dict[str, str] = arg_dict['argument']
            add_job(command, arguments)
    else:
        add_job(script_path, json.loads(cli_args or "{}"))

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
    uuid = request.args.get("uuid")

    if uuid is None:
        return {
            "status": "failed",
            "code": 400,
            "error": "UUID not supplied.",
        }

    job: Optional[Job] = Job.load(uuid)

    if job is None:
        return {
            "status": "failed",
            "code": 404,
            "error": "Job not found.",
        }

    return job.dump(use_gpu_name=True)


@app.route("/curr_dir", methods=['GET'])
@login_required
def get_curr_dir() -> Dict[str, Any]:
    return {"status": "success", "currDir": os.getcwd()}


@app.route("/projects", methods=['GET'])
@login_required
def get_projects() -> Dict[str, Any]:
    jobs = get_database().fetch_all_matching("user", current_user.username)
    projectsSet = set([j['project'] for j in jobs])
    projects = sorted(list(projectsSet))
    if "General" in projects:
        projects.remove("General")
    projects.insert(0, "General")
    return {
        "projects": projects
    }


def mock_available_gpus():
    global GPU_DCT
    GPU_DCT.update({
        "0": MockedGPU(name="0", model="mockedGPU", total_memory_mib=12000, uuid="214175be-8c20-4f6d-8e25-bdc9c438a898"),
        "1": MockedGPU(name="1", model="mockedGPU", total_memory_mib=10000, uuid="3c7a2a0e-1d5d-4df8-a85e-3dbe79de801c"),
        "2": MockedGPU(name="2", model="mockedGPU", total_memory_mib=8000, uuid="ee415e66-c0bf-45ba-a944-0c5fb2cd7fa3"),
        "3": MockedGPU(name="3", model="mockedGPU", total_memory_mib=16000, uuid="af20175a-f19c-4962-8f2f-983d3038a87b")
    })


atexit.register(lambda: scheduler.shutdown())
