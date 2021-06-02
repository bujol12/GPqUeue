import React from "react";
import {Route, BrowserRouter as Router, Link} from "react-router-dom";

const Navbar = () => {
    return (
        <React.Fragment>
            <div>
                <a><Link to="/">Home</Link></a>
                <a><Link to="/login">Login</Link></a>
            </div>
        </React.Fragment>
    );
};

const Home = () => {
    return (
        <div>
            <h1>Home</h1>
        </div>
    );
};

const Login = () => {
    return (
        <div>
            <h1>Login</h1>
        </div>
    );
};

const App = () => {
    const routing = (
        <Router>
            <Navbar/>
            <div>
                <Route exact path="/" component={Home}></Route>
                <Route exact path="/login" component={Login}></Route>
            </div>
        </Router>
    );

    return (
        <div>
            {routing}
        </div>
    );
};

export default App;
