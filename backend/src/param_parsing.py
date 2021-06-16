from typing import Any, Dict, List
import yaml
import jinja2


def parametric_cli(cli: str, yaml_str: str) -> List[Dict[str, Any]]:
    """Takes a Command with jinja format variable, do substitution.

    The yaml_str will be parsed as yaml.
        It should have a dict named "argument"
        Under the argument, there should be several K-V,
            where key corresponds to each variable in the command
            and values are lists to be propagated
        The combination of different parameters would be generated

    Example:
      Params:
        - cli: "python3 test -n {{ number }} -b {{ batch }}"
        - yaml:
          '''
          argument:
            number: [1, 2]
            batch:
              - 4
              - 5
          '''
      Returns:
        [
            {
                'argument': {'number': 1, 'batch' 4},
                'command': "python3 test -n 1 -b 4"
            },
            {
                'argument': {'number': 1, 'batch' 5},
                'command': "python3 test -n 1 -b 5"
            },
            {
                'argument': {'number': 2, 'batch' 4},
                'command': "python3 test -n 2 -b 4"
            },
            {
                'argument': {'number': 2, 'batch' 5},
                'command': "python3 test -n 2 -b 5"
            },
        ]
    """
    param_settings: Dict[str, List[Any]] = (
        yaml.safe_load(yaml_str)
            .get('argument', {})
    )
    print(param_settings, flush=True)
    print(cli, flush=True)
    param_names: List[str] = list(param_settings.keys())
    param_values: List[List[Any]] = list(param_settings.values())

    # Generate param combinations
    params: List[Dict[str, Any]] = []
    indices: List[int] = list((0 for _ in range(len(param_names))))
    while indices[0] < len(param_values[0]):
        param_dict: Dict[str, Any] = {}
        for i, index in enumerate(indices):
            name: str = param_names[i]
            param_options: List[Any] = param_values[i]

            param_dict[name] = param_options[index]

        params.append(param_dict)
        # update indices
        indices[-1] += 1
        # perform "carry" checking
        i = len(param_names) - 1
        while i >= 1 and indices[i] >= len(param_values[i]):
            indices[i] = 0
            indices[i - 1] += 1
            i -= 1

    # Render with generated params
    result: List[Dict[str, Any]] = []
    for param in params:
        command: str = jinja2.Template(cli).render(param)
        result.append(
            dict(
                argument=param,
                command=command
            )
        )

    return result
