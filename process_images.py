
from os import remove
from pathlib import Path

from PIL import Image
from PIL.ExifTags import IFD, GPS

from pillow_heif import register_heif_opener
import pillow_avif

def add_gps(to_add: list[tuple[str, str]]) -> None:
    for file, coords in to_add:
        with Image.open(file) as img:
            exif = img.getexif()

            gps = exif.get_ifd(IFD.GPSInfo)

            lat, long = coords.split()

            lat, lat_ref = lat[:-2], lat[-1]
            long, long_ref = long[:-2], long[-1]

            lat = tuple(map(float, lat.replace('°', "'").split("'")))
            long = tuple(map(float, long.replace('°', "'").split("'")))

            gps[GPS.GPSLatitude] = lat
            gps[GPS.GPSLatitudeRef] = lat_ref
            gps[GPS.GPSLongitude] = long
            gps[GPS.GPSLongitudeRef] = long_ref

            exif[IFD.GPSInfo] = gps

            img.save(
                file,
                format=file.split('.')[-1].upper().replace('JPG', 'JPEG'),
                quality=100,
                exif=exif,
            )

        print(f'Wrote GPS coordinates to [{file}] successfully.')

def process_heif(
    directory: str,
    *,
    quality: int = 100,
) -> None:
    register_heif_opener()

    for file in Path(directory).glob('**/*.heic'):
        with Image.open(file) as img:
            img.save(
                file.with_suffix('.jpg'),
                format='JPEG',
                quality=quality,
                exif=img.info['exif'],
            )
        print(f'Converted [{file}] from HEIC to JPEG successfully.')
        remove(file)

def compress(
    directory: str,
    *,
    size: int = 3000,
    quality: int = 100,
) -> None:
    for file in Path(directory).glob('**/*.jpg'):
        if not (file_avif := file.with_suffix('.avif')).is_file():
            with Image.open(file) as img:
                img.thumbnail((size, size), Image.Resampling.LANCZOS)
                img.save(
                    file_avif,
                    format='AVIF',
                    quality=quality,
                    exif=img.info['exif'],
                )

            print(f'Converted [{file}] from JPEG to AVIF successfully.')
            remove(file)

if __name__ == '__main__':
    process_heif('./src/assets/')
    compress('./src/assets/', quality=70)