
import L from 'leaflet';

import loading from './assets/loading.svg';

import rawExifData from './assets/exifData.json';
const exifData: { [key: string]: string } = rawExifData;

export function getImageHTML(image: string) {
    return (
        `<div class="gallery-image-wrapper">
            <img src="${loading}" class="loader"/>
            <img
                src="${image}"
                alt="photo"
                loading="lazy"
            />
        </div>
        <p>${exifData[image.split('/').slice(-1)[0]]}</p>`
    );
}

export function getMarker(file: string) {
    return new L.Icon({
        iconUrl: file,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });
}