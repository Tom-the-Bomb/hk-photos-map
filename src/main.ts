import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import exifr from "exifr";

import Swiper from 'swiper';
import { Keyboard, EffectCoverflow } from 'swiper/modules';

import 'swiper/swiper-bundle.css';

import { getImageHTML, getMarker } from './utils';
import './style.css';

let swiper: Swiper | null = null;

const images = import.meta.glob('/public/assets/**/*.jpg');
const markers = new Map<string, string[]>();

const orangeMarker = getMarker('orange-marker.png');
const mtrMarker = getMarker('mtr-marker.png');

const gallery = document.getElementById('gallery')!;
const galleryWrapper = document.getElementById('gallery-wrapper')!;

const map = L
    .map('map', {zoomControl: false, renderer: L.canvas()})
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

async function sortGPSData() {
    for (let image in images) {
        image = image.replace('/public', '');

        const {latitude, longitude} = await exifr.gps(image);
        const coord = JSON.stringify([latitude, longitude]);

        if (!markers.has(coord)) {
            markers.set(coord, []);
        }

        markers.get(coord)!.push(image);
    }
}

sortGPSData().then(() => {
    for (const [coord, images] of markers) {
        const [latitude, longitude] = JSON.parse(coord);
        const cover = images[0];

        const marker = L.marker([latitude, longitude], {icon: images[0].includes('mtr') ? mtrMarker : orangeMarker})
            .addTo(map);

        marker.bindPopup(
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
});