import axios from "axios";

export const api = axios.create({
  baseURL: "https://calender-system-api.onrender.com/api",
  headers: {
    "Content-Type": "application/json"
  }
});
