import React from "react";

const SortDropdown = ({rules, setRule}) => {
    const menuItems = rules.map((rule, index) =>
        <li key={index}><button className="dropdown-item" onClick={() => setRule(rule)}>{rule.text}</button></li>
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

const Sort = ({children, prop, increasing}) => {
    let sortedChildren = React.Children.toArray(children).sort((a, b) => a[prop] - b[prop]);

    if (!increasing) {
        sortedChildren = sortedChildren.reverse();
    }

    return sortedChildren;
};

export {Sort, SortDropdown};
