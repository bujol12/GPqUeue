import pytest
from src.enums.job_status import JobStatus
from src.job import Job


class TestJob:
    job = Job(
        project="General", name="abc",
        script_path="xyz/hjk", cli_args={"-x": ""}
    )

    def test_job_to_dict(self):
        dct_res = self.job.to_dict()

        assert dct_res.get('status', '') == JobStatus.QUEUED.value
        assert dct_res.get('name', '') == 'abc'
        assert dct_res.get('script_path', '') == 'xyz/hjk'
        assert dct_res.get('cli_args', '') == {'-x': ''}

        assert len(dct_res.keys()) == 7
        assert 'uuid' in dct_res.keys()
