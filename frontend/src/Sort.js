const SortDropdown = ({options, setSortBy}) => {
    const menuItems = options.map((name, index) =>
        <li key={index}><a className="dropdown-item" href="#">{name}</a></li>
    );

    return (
        <div className="dropdown">
            <button className="btn btn-outline-primary dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                        Sort by
            </button>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                {menuItems}
            </ul>
        </div>
    );
};

// Sort sorts a list of elements by their properties
const Sort = ({children, by}) => {
    return (
        <div>
            
        </div>
    );
};

export {Sort, SortDropdown};
