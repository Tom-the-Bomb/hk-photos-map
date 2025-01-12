import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import Swiper from 'swiper';
import { Keyboard, EffectCoverflow } from 'swiper/modules';

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
    'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
    {
        minZoom: 11,
        maxZoom: 19,
        crossOrigin: true,
    }
)
    .addTo(map);

for (const [coord, images] of Object.entries(markers)) {
    const [latitude, longitude] = JSON.parse(coord);
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

            popUpElement.addEventListener('click', async () => {
                map.dragging.disable();
                map.touchZoom.disable();
                map.doubleClickZoom.disable();
                map.scrollWheelZoom.disable();
                map.boxZoom.disable();
                map.keyboard.disable();

                if (images.length > 1) {
                    document.getElementById('gallery')!.innerHTML = `
                        <div class="swiper">
                            <div class="swiper-wrapper">
                                ${
                                    (await Promise.all(
                                        images.map(async (image) =>
                                            `<div class="swiper-slide swiper-slide-styles">
                                                ${await getImageHTML(image)}
                                            </div>`
                                        )
                                    ))
                                        .join('')
                                }
                            </div>
                        </div>`;

                    swiper = new Swiper('.swiper', {
                        modules: [Keyboard, EffectCoverflow],
                        effect: 'coverflow',
                        loop: true,
                        grabCursor: true,
                        centeredSlides: true,
                        keyboard: true,
                        direction: 'vertical',
                        breakpoints: {
                            768: {
                                direction: 'horizontal',
                            },
                        },
                    });
                } else {
                    gallery.innerHTML =
                        `<div class="swiper-slide-styles">
                            ${await getImageHTML(images[0])}
                        </div>`;
                }

                galleryWrapper.style.display = 'block';
            });

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