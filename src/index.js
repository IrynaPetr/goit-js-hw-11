import axios from 'axios';
import { Notify } from 'notiflix';
import './css/styles.css';
import debounce from 'lodash.debounce';

import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import { fetchImages } from './fetch-images';

const PER_PAGE = 40;
const DEBOUNCE_DELAY = 250;

let q = '';
let page = 1;
let simplelightbox;

const refs = {
  input: document.querySelector(".input"),
  form: document.querySelector("#search-form"),
  gallery: document.querySelector(".gallery"),
  loadMoreBtn: document.querySelector(".load-more"),
}; 

function slowScroll() {
  const cardHeight  = refs.gallery.firstElementChild.getBoundingClientRect().height;
  window.scrollBy({
    top: cardHeight * 2,
    behavior: "smooth",
  });
}

function createGalleryMarkup(data) {
  return data.reduce((acc, { webformatURL, largeImageURL, tags, likes, views, comments, downloads }) =>  `
  ${acc}<div class="photo-card">
  <a class="gallery-item" href="${largeImageURL}">
     <img src="${webformatURL}" alt="${tags}" loading="lazy" width="400" height="250"/>
  </a>
  <div class="info">
  <ul class="info-list">
     <li class="info-item"><b>Likes:</b> ${likes}</li>
     <li class="info-item"><b>Views:</b> ${views}</li>
     <li class="info-item"><b>Comments:</b> ${comments}</li>
     <li class="info-item"><b>Downloads:</b> ${downloads}</li>
  </ul>
  </div>
  </div>`, "");
}

function handleErrors(error) {
  Notify.failure("Something went wrong. Please try again later.");
}

function clearGallery() {
  refs.gallery.innerHTML = "";
}

function addGalleryItems(data) {
  refs.gallery.insertAdjacentHTML("beforeend", createGalleryMarkup(data));
}


async function handleSearchSubmit(e) {
  e.preventDefault();

  q = e.currentTarget.searchQuery.value.trim();
    if(!q) return;

    clearGallery();
    page = 1;
    try {
      const { data } = await fetchImages(q, page, PER_PAGE);
  
    if (data.totalHits === 0) {
       Notify.failure(`Sorry, there are no images matching your search query. Please try again.`);
   return;
    }
      if (data.totalHits > PER_PAGE) {
      refs.loadMoreBtn.classList.remove("is-hidden")
      refs.loadMoreBtn.textContent = "Load more...";
    }

      if (data.totalHits < PER_PAGE && data.totalHits !=0) {
        refs.loadMoreBtn.classList.add("is-hidden");
      }

      addGalleryItems(data.hits);
      simplelightbox = new SimpleLightbox('.gallery a').refresh();
      Notify.success(`Hooray! We found ${data.totalHits} images.`);
  } catch (error) {
    handleErrors(error);
}}

async function handleLoadMoreClick() {
  page++;
  simplelightbox.destroy();
  try {
  const { data} = await fetchImages(q, page, PER_PAGE);
    addGalleryItems(data.hits);
    simplelightbox = new SimpleLightbox('.gallery a').refresh();

    const totalPages = Math.ceil(data.totalHits / PER_PAGE);
      if (page > totalPages) {
        refs.loadMoreBtn.classList.add("is-hidden")
         Notify.info(`We're sorry, but you've reached the end of search results.`);
         return
        }
      slowScroll();
  } catch(error) {
    handleErrors(error);
  };
}

refs.form.addEventListener("submit", handleSearchSubmit);
refs.loadMoreBtn.addEventListener("click", handleLoadMoreClick);