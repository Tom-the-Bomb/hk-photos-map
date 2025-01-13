
import fs from 'fs';
import exifr from 'exifr';
import sizeOf from 'image-size';

const DIRS = [
    './src/assets/mtr/',
    './src/assets/others/',
];

async function readGPSData() {
    const markers = {};
    const exifData = {};

    for (const dir of DIRS) {
        const images = fs.readdirSync(dir);

        for (const image of images) {
            const fullPath = dir + image;

            const output = await exifr.parse(
                fullPath,
                {
                    exif: {
                        pick: [
                            'Make', 'Model', 'LensMake', 'LensModel',
                            'FocalLength', 'ExposureTime', 'ISO', 'FNumber',
                        ],
                    },
                    gps: {
                        pick: ['latitude', 'longitude'],
                    },
                },
            );
            const lens = ` + ${output.LensMake ? output.LensMake + ' ' : ''}${output.LensModel}`;
            const expTime = output.ExposureTime < 1 ? `1/${Math.round(1 / output.ExposureTime)}` : output.ExposureTime;

            const coord = JSON.stringify([output.latitude, output.longitude]);

            if (markers[coord] == null) {
                markers[coord] = [];
            }

            markers[coord].push(fullPath);

            const {width, height} = sizeOf(fullPath);

            exifData[image] = `Taken with ${output.Make} ${output.Model}${lens} |
                ${width}&times;${height}px at ${output.FocalLength} mm,
                ${expTime} s, ISO ${output.ISO}, ƒ${output.FNumber}`;
        }
    }
    return [markers, exifData];
}

readGPSData().then(([markers, exifData]) => {
    console.log('[Successfully read GPS & EXIF data]');

    fs.writeFileSync('./src/assets/markers.json', JSON.stringify(markers));
    console.log('[Successfully recorded GPS data]');

    fs.writeFileSync('./src/assets/exifData.json', JSON.stringify(exifData));
    console.log('[Successfully recorded EXIF data]');
});