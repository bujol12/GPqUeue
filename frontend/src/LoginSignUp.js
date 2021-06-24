import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import axios from "axios";
import { setLocalUser, removeLocalUser, getLocalUser } from "./util";

import "./LoginSignUp.css";

const postForm = (history, type, name, pw) => {
    axios.post("/api/" + type, {
        username: name,
        password: pw,
    }).then(res => {
        if (res.data.status === "success") {
            setLocalUser(res.data.user);
            history.goBack();
        } else {
            removeLocalUser();
            history.push(`/${type}#failed`);
        }
    });
};

const handleChange = (setter) => (e) => {
    setter(e.target.value);
};


const Login = () => {
    const history = useHistory();
    if (getLocalUser()) {
        history.replace("/overview");
    }

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = () => {
        postForm(history, "login", username, password);
    };

    let failedText;

    if (location.hash === "#failed") {
        failedText = (
            <div className="text-danger mb-3">
                Login failed. Username or password is incorrect.
            </div>
        );
    }

    return (
        <div className="container container-sm-custom">
            <h1 className="pt-4 mb-4">Login</h1>
            {failedText}
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

const SignUp = ({location}) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const history = useHistory();
    if (getLocalUser()) {
        history.replace("/overview");
    }

    const handleSubmit = () => {
        postForm(history, "signup", username, password);
    };

    let failedText;

    if (location.hash === "#failed") {
        failedText = (
            <div className="text-danger mb-3">
                Username is already taken.
            </div>
        );
    }

    return (
        <div className="container container-sm-custom">
            <h1 className="pt-4 mb-4">Sign up</h1>
            {failedText}
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

const Logout = () => {
    const history = useHistory();
    axios.get("/api/logout").finally(() => removeLocalUser())
        .then(res => {
            if (res.data.status === "success") {
                history.push("/login");
            } else {
                // TODO: else logout failed
                history.push("/login");
            }
        }).catch((e) => {
            console.log(`Error in logout: ${e}`);
        });

    return (
        <div aria-live="polite" aria-atomic="true" className="d-flex justify-content-center align-items-center w-100">
            <div className="position-absolute top-50" style={{ width: "60%" }}>
                <div className="progress" style={{ height: "40px" }}>
                    <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style={{ width: "100%" }}>
                        <div className="pt-2">
                            <h5>
                                Logging out...
                            </h5>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export { Login, SignUp, Logout };
