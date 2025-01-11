
import L from 'leaflet';
import exifr from 'exifr';

async function formatImageEXIF(image: string) {
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

    const [width, height] = await new Promise((resolve: (value: Number[]) => void) => {
        const imageEl = new Image();
        imageEl.src = image;
        imageEl.onload = () => {
            resolve([imageEl.width, imageEl.height]);
        };
    });

    return (
        `Taken with ${output.Make} ${output.Model}${lens} |
        ${width}&times;${height}px at ${output.FocalLength} mm,
        ${expTime} s, ISO ${output.ISO}, ƒ${output.FNumber}`
    );
}

export async function getImageHTML(image: string) {
    return (
        `<div class="gallery-image-wrapper">
            <img
                src="${image}"
                alt="photo"
            />
        </div>
        <p>${await formatImageEXIF(image)}</p>`
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