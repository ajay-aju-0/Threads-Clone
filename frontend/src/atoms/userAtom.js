import { atom } from "recoil";

const userAtom = atom({
    key: "useratom",
    default: JSON.parse(localStorage.getItem("user-threads"))
});

export default userAtom;