import attr


@attr.frozen()
class User:
    email: str
    first_name: str
    surname: str
