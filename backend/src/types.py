from abc import ABC, abstractmethod


class Serialiseable(ABC):
    @abstractmethod
    def get_id(self) -> str:
        raise NotImplementedError()


class ABCGPU(Serialiseable):
    pass


class ABCJob(Serialiseable):
    pass


class ABCUser(Serialiseable):
    pass
