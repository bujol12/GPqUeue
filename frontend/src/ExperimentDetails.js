const ExperimentDetails = ({match}) => {
    return (
        <div className="container">
            <div className="row">
                <h1 className="pt-4 mb-4">Experiment Details {match.params.id}</h1>
            </div>
            <div className="row">
                <div className="col">
                    <h3>Overview</h3>
                    <table className="table table-striped">
                        <tbody>
                            <tr>
                                <td>Project</td>
                                <td>BERT Explainability</td>
                            </tr>
                            <tr>
                                <td>Status</td>
                                <td className="text-success">Success</td>
                            </tr>
                            <tr>
                                <td>Runtime</td>
                                <td>3h 40m 4s</td>
                            </tr>
                            <tr>
                                <td>Started at</td>
                                <td>14:16</td>
                            </tr>
                            <tr>
                                <td>Finished at</td>
                                <td>17:56</td>
                            </tr>
                            <tr>
                                <td>GPU</td>
                                <td>GPU 1 - RTX 3060</td>
                            </tr>
                            <tr>
                                <td>Dataset</td>
                                <td><code>/home/kdb19/data/SST2</code></td>
                            </tr>
                        </tbody>
                    </table>
                    <h3>Configuration</h3>
                    <textarea style={{resize: "none", width: "100%"}} readOnly></textarea>
                </div>
                <div className="col">
                    <h3>Log</h3>
                    <textarea style={{resize: "none", width: "100%"}} readOnly></textarea>
                </div>
            </div>
        </div>
    );
};

export default ExperimentDetails;
