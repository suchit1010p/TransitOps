import axios from "axios"


const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
  withCredentials: true, // added this line to include cookies in requests
  headers: {
    "Content-Type": "application/json",
  },
})

export default api
