import axios from 'axios';

const publicApi = axios.create({
    baseURL: process.env.API_URL || 'http://localhost:3000/v1',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default publicApi;