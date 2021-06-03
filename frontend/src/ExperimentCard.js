const ExperimentCard = ({status, name, user, gpu, start, duration}) => {
    const icon = `${status}.png`;

    let end;
    if (status === "queued") {
        end = (
            <div className="col align-self-center pt-3 me-3 text-end">
                <p>Queued</p>
            </div>
        );
    } else {
        end = (
            <div className="col pt-3 me-3 text-end">
                <p>{start}</p>
                <p>{duration}</p>
            </div>
        );
    }

    return (
        <div className="row border mb-3">
            <div className="icon-col align-self-center pt-3 mb-3 me-3">
                <img className="icon" src={icon} />
            </div>
            <div className="col pt-3">
                <h3>{name}</h3>
                <p>{user} {gpu}</p>
            </div>
            {end}
        </div>
    );
};

export default ExperimentCard;
