
import fs from 'fs';
import exifr from 'exifr';

const DIRS = [
    './src/assets/mtr/',
    './src/assets/others/',
];

async function readGPSData() {
    const markers = {};

    for (const dir of DIRS) {
        const images = fs.readdirSync(dir);

        for (let image of images) {
            image = dir + image;

            const {latitude, longitude} = await exifr.gps(image);
            const coord = JSON.stringify([latitude, longitude]);

            if (markers[coord] == null) {
                markers[coord] = [];
            }

            markers[coord].push(image);
        }
    }
    return markers;
}

readGPSData().then((markers) => {
    console.log('[Successfully read GPS data]');
    fs.writeFileSync('./src/assets/markers.json', JSON.stringify(markers));
    console.log('[Successfully recorded GPS data]');
});