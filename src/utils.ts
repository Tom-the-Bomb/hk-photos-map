
import L from 'leaflet';
import exifr from 'exifr';

const exifCache = new Map<string, string>();

export async function formatImageEXIF(image: HTMLImageElement) {
    let exif = exifCache.get(image.src);

    if (exif) {
        return exif;
    }

    const output = await exifr.parse(
        image,
        {
            exif: {
                pick: [
                    'Make', 'Model', 'LensMake', 'LensModel',
                    'FocalLength', 'ExposureTime', 'ISO', 'FNumber',
                ],
            },
            xmp: {pick: ['Lens']},
        },
    );
    let lens = output.Lens ? ` + ${output.Lens}` : '';
    lens = !lens && output.LensModel ? ` + ${output.LensMake ? output.LensMake + ' ' : ''}${output.LensModel}` : lens;
    const expTime = output.ExposureTime < 1 ? `1/${Math.round(1 / output.ExposureTime)}` : output.ExposureTime;

    let width = image.naturalWidth;
    let height = image.naturalHeight;

    if (width === 0 || height === 0) {
        [width, height] = await new Promise((resolve) => {
            image.onload = () => {
                resolve([image.naturalWidth, image.naturalHeight]);
            };
        });
    }

    exif = `Taken with ${output.Make} ${output.Model}${lens} |
        ${width}&times;${height}px at ${output.FocalLength} mm,
        ${expTime} s, ISO ${output.ISO}, ƒ${output.FNumber}`;

    exifCache.set(image.src, exif);
    return exif;
}

export function getImageHTML(image: string) {
    return (
        `<div class="gallery-image-wrapper">
            <img
                src="${image}"
                alt="photo"
                loading="lazy"
            />
        </div>
        <p></p>`
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