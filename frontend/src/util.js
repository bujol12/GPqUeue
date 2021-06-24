import { useEffect, useRef, useState } from "react";
import { routerHistory } from "./App";

const max = (a, b) => a < b ? b : a;

const msToHoursMinutesSeconds = (totalMs) => {
    // FIX ME: Dirty trick to force non-negative
    const totalSeconds = Math.floor(max(totalMs, 0) / 1000);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const hours = Math.floor(totalSeconds / (60 * 60));
    if (isNaN(seconds) || isNaN(minutes) || isNaN(hours)) {
        return "Not Available";
    }
    return `${hours}h ${minutes}m ${seconds}s`;
};

const msToTimeString = (ms) => {
    const date = new Date(ms);
    const currentDate = new Date();
    const millisecondsInADay = 1000 * 60 * 60 * 24;
    const daysSinceStart = Math.floor((currentDate.getTime() - date.getTime()) / millisecondsInADay);

    // FIX ME: Dirty trick to force non-negative
    if (daysSinceStart <= 0) {
        return date.toLocaleTimeString(navigator.language, {
            hour: "2-digit",
            minute: "2-digit"
        });
    } else if (daysSinceStart === 1) {
        return "Yesterday";
    } else if (daysSinceStart < 7) {
        return `${daysSinceStart} days ago`;
    }

    return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`;
};

const responseSuccessHandler = response => response;

const responseErrorHandler = error => {
    if (error.response && error.response.status === 401) {
        removeLocalUser();
        routerHistory.push("/login");
        // refresh the page immediately to complete the jump.
        routerHistory.go(0);
    }

    return Promise.reject(error);
};

const localUserStorageKey = "__GPqUeue_User_token__";

function setLocalUser(user) {
    window.localStorage.setItem(localUserStorageKey, JSON.stringify(user));
}

function getLocalUser() {
    return JSON.parse(window.localStorage.getItem(localUserStorageKey));
}

function removeLocalUser() {
    window.localStorage.removeItem(localUserStorageKey);
}

function AutoTextArea(props) {
    const textAreaRef = useRef(null);
    const [text, setText] = useState("");
    const [textAreaHeight, setTextAreaHeight] = useState("auto");
    const [parentHeight, setParentHeight] = useState("auto");

    useEffect(() => {
        if (textAreaRef && textAreaRef.current) {
            setParentHeight(`${textAreaRef.current.scrollHeight}px`);
            setTextAreaHeight(`${textAreaRef.current.scrollHeight}px`);
        }
    }, [text]);

    const onChangeHandler = (event) => {
        setTextAreaHeight("auto");
        if (textAreaRef) {
            setParentHeight(`${textAreaRef.current.scrollHeight}px`);
        }
        setText(event.target.value);

        if (props.onChange) {
            props.onChange(event);
        }
    };

    return (
        <div
            style={{
                minHeight: parentHeight,
            }}
        >
            <textarea
                {...props}
                ref={textAreaRef}
                rows={1}
                style={{
                    minHeight: "60px",
                    height: textAreaHeight,
                    width: "100%",
                }}
                onChange={onChangeHandler}
            />
        </div>
    );
}

export {
    msToHoursMinutesSeconds, msToTimeString,
    responseSuccessHandler, responseErrorHandler,
    setLocalUser, getLocalUser, removeLocalUser,
    AutoTextArea,
};
