import { requestApi } from "../../utils/axios/request";

export let config = {
    appName: "RustCn",
    uiDomain: "http://localhost:3000",
    commonMaxlen: 255,
    posts: {
        titleMaxLen: 128,
        briefMaxLen: 128,
        writingEnabled: false,
        maxTags: 3,
    },
    user: {
        nicknameMaxLen: 64,
        usernameMaxLen: 39,
        navbarMaxLen: 20,
    },
    tags: null
};
