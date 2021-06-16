function readFileAsync(file) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();

        reader.onload = () => {
            resolve(reader.result);
        };

        reader.onerror = reject;

        reader.readAsText(file);
    });
}

const ImportFromFileBodyComponent = ({ ext, handleFileChosen }) => {
    return (
        <div className='upload-expense'>
            <input
                className='form-control'
                type='file'
                id='file'
                accept={ext}
                onChange={e => handleFileChosen(e.target.files[0])}
            />
        </div>
    );
};

export { readFileAsync, ImportFromFileBodyComponent };
