
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

    return (
        `Taken with ${output.Make} ${output.Model}${lens} |
        ${1}&times;${1}px at ${output.FocalLength} mm,
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