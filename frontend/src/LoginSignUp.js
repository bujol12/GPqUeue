import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import axios from "axios";

import "./LoginSignUp.css";

const postForm = (history, type, name, pw) => {
    axios.post("/api/" + type, {
        username: name,
        password: pw,
    }).then(res => {
        if (res.data.status === "success") {
            history.push("/overview");
        } else {
            history.push("/" + type);
        }
    });
};

const handleChange = (setter) => (e) => {
    setter(e.target.value);
};


const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const history = useHistory();

    const handleSubmit = () => {
        postForm(history, "login", username, password);
    };


    return (
        <div className="container container-sm-custom">
            <h1 className="pt-4 mb-4">Login</h1>
            <div className="mb-3">
                <label htmlFor="username" className="form-label">Username</label>
                <input type="text" className="form-control" id="username" onChange={handleChange(setUsername)} />
            </div>
            <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input type="password" className="form-control" id="password" onChange={handleChange(setPassword)} />
            </div>
            <button type="submit" className="btn btn-primary login-button" onClick={handleSubmit}>Login</button>
            <div className="text-center pt-3">
                <Link to="signup">Or create an account</Link>
            </div>
        </div>
    );
};

const SignUp = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const history = useHistory();

    const handleSubmit = () => {
        postForm(history, "signup", username, password);
    };


    return (
        <div className="container container-sm-custom">
            <h1 className="pt-4 mb-4">Sign up</h1>
            <div className="mb-3">
                <label htmlFor="username" className="form-label">Username</label>
                <input type="text" className="form-control" id="username" onChange={handleChange(setUsername)} />
            </div>
            <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input type="password" className="form-control" id="password" onChange={handleChange(setPassword)} />
            </div>
            <button type="submit" className="btn btn-primary login-button" onClick={handleSubmit}>Sign up</button>
            <div className="text-center pt-3">
                <Link to="login">Have an account? Login instead</Link>
            </div>
        </div>
    );
};

export { Login, SignUp };
