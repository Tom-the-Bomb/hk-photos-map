import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import Swiper from 'swiper';
import { Keyboard, EffectCoverflow, Pagination, Navigation } from 'swiper/modules';

import 'swiper/swiper-bundle.css';

import { getImageHTML, getMarker } from './utils';
import './style.css';

import orangeMarkerAsset from './assets/orange-marker.png';
import mtrMarkerAsset from './assets/mtr-marker.png';

import markers from './assets/markers.json';

let swiper: Swiper | null = null;

const orangeMarker = getMarker(orangeMarkerAsset);
const mtrMarker = getMarker(mtrMarkerAsset);

const gallery = document.getElementById('gallery')!;
const galleryWrapper = document.getElementById('gallery-wrapper')!;

const allImages: string[] = Object.values(
    import.meta.glob('./assets/**/*.avif', { eager: true, query: '?url', import: 'default' })
);

const map = L
    .map('map', {zoomControl: false})
    .setView([22.288, 114.173], 13)
    .setMaxBounds([
        // top-left corner
        [22.576, 113.704],
        // bottom-right corner
        [21.982, 114.569],
    ]);

L.tileLayer(
    `https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=${import.meta.env.VITE_STADIA_API_KEY}`,
    {
        minZoom: 11,
        maxZoom: 19,
    }
)
    .addTo(map);

function getOpenGalleryHandler(images: string[]) {
    return async () => {
        map.dragging.disable();
        map.touchZoom.disable();
        map.doubleClickZoom.disable();
        map.scrollWheelZoom.disable();
        map.boxZoom.disable();
        map.keyboard.disable();

        if (images.length > 1) {
            gallery.innerHTML = `
                <div class="swiper">
                    <div class="swiper-wrapper">
                        ${
                            images.map((image) =>
                                `<div class="swiper-slide swiper-slide-styles">
                                    ${getImageHTML(image)}
                                </div>`
                            )
                                .join('')
                        }
                    </div>
                    <div class="swiper-pagination"></div>
                    <div class="swiper-button-next"></div>
                    <div class="swiper-button-prev"></div>
                </div>`;

            swiper = new Swiper('.swiper', {
                modules: [Keyboard, EffectCoverflow, Pagination, Navigation],
                effect: 'coverflow',
                grabCursor: true,
                centeredSlides: true,
                keyboard: true,
                loop: true,
                spaceBetween: 45,
                direction: 'vertical',
                breakpoints: {
                    768: {
                        direction: 'horizontal',
                        navigation: {
                            nextEl: '.swiper-button-next',
                            prevEl: '.swiper-button-prev',
                        },
                    },
                },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                    type: images.length > 20 ? 'fraction' : 'bullets',
                },
            });
        } else {
            gallery.innerHTML =
                `<div class="swiper-slide-styles">
                    ${getImageHTML(images[0])}
                </div>`;
        }

        galleryWrapper.style.display = 'block';
    }
}

for (const [coord, rawPaths] of Object.entries(markers)) {
    const [latitude, longitude] = JSON.parse(coord);
    const images = rawPaths.map((image) =>
        import.meta.env.DEV ? image : image.replace('/src', '')
    );
    const cover = images[0];

    L.marker([latitude, longitude], {icon: cover.includes('mtr') ? mtrMarker : orangeMarker})
        .addTo(map)
        .bindPopup(
            `<img class="cover" src="${cover}" alt="${cover}"/>
            <p class="cover-caption">${images.length} photo${images.length > 1 ? 's' : ''}</p>`
        )
        .on('click', (event) => {
            const popUp = event.target
                .getPopup()
                .openPopup();

            const popUpElement = popUp.getElement();

            popUpElement.addEventListener('click', getOpenGalleryHandler(images));
            popUpElement.querySelector('.leaflet-popup-close-button')
                ?.addEventListener('click', (event: Event) => {
                    event.stopPropagation();
                });
        });
}

document.getElementById('gallery-close-btn')?.addEventListener('click', () => {
    gallery.innerHTML = '';
    galleryWrapper.style.display = 'none';

    if (swiper != null) {
        swiper.destroy();
    }

    map.dragging.enable();
    map.touchZoom.enable();
    map.doubleClickZoom.enable();
    map.scrollWheelZoom.enable();
    map.boxZoom.enable();
    map.keyboard.enable();
});

document.getElementById('view-all')?.addEventListener('click',
    getOpenGalleryHandler(allImages)
);