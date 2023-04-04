import axios from "axios";
export { fetchImages };

axios.defaults.baseURL = 'https://pixabay.com/api/';
const KEY = '35043839-9a00e3f7a74986ab288e38356';

async function fetchImages(q, page, perPage) {
    const response = await axios.get(
        `?key=${KEY}&q=${q}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`,
    );
    return response;
}

