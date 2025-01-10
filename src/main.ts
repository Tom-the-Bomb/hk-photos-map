import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import exifr from "exifr";

import Swiper from 'swiper';
import { Keyboard, EffectCoverflow } from 'swiper/modules';

import 'swiper/swiper-bundle.css';

import './style.css';

function getImageHTML(image: string) {
    return `<img
        src="${image}"
        alt="photo"
    />
    <p>1</p>`;
}

let swiper: Swiper | null = null;

const images = import.meta.glob('/public/assets/**/*.jpg');
const markers = new Map<string, Array<string>>();

const markerIcon = new L.Icon({
    iconUrl: 'marker.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

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
    }
)
    .addTo(map);

for (let image in images) {
    image = image.replace('/public', '');

    const {latitude, longitude} = await exifr.gps(image);
    const coord = JSON.stringify([latitude, longitude]);

    if (!markers.has(coord)) {
        markers.set(coord, []);
    }

    markers.get(coord)!.push(image);
}

for (const [coord, images] of markers) {
    const [latitude, longitude] = JSON.parse(coord);
    const cover = images[0];

    L.marker([latitude, longitude], {icon: markerIcon})
        .addTo(map)
        .bindPopup(
            `<img class="cover" src="${cover}" alt="${cover}"/>
            <p class="cover-caption">${images.length} photo${images.length > 1 ? 's' : ''}</p>`
        )
        .on('click', (event) => {
            event.target
                .getPopup()
                .openPopup()
                .getElement()
                .addEventListener('click', () => {
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
                                        images.map((image) =>
                                            `<div class="swiper-slide swiper-slide-styles">
                                                ${getImageHTML(image)}
                                            </div>`
                                        )
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
                                ${getImageHTML(images[0])}
                            </div>`;
                    }

                    galleryWrapper.style.display = 'block';
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