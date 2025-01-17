
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
                format=file.split('.')[-1].upper(),
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
    # process_heif('./src/assets/', quality=100)
    # add_gps([
    #     # central station (overwrite)
    #     (r'src\assets\mtr\mtr-20241231_025035206_iOS.avif', """22°16'55.7"N 114°09'27.9"E"""),
    #     # monster building spot (overwrite)
    #     (r'src\assets\others\20250101_035300000_iOS.avif', """22°17'03.2"N 114°12'43.8"E"""),

    #     # sheung wan station
    #     (r'src/assets/mtr/20250101_114816926_iOS.jpg', """22°17'11.6"N 114°09'06.6"E"""),
    #     # sun yat sen park
    #     (r'src\assets\others\20241230_052400000_iOS.jpg', """22°17'25.4"N 114°08'45.2"E"""),
    #     # 1881 heritage (2)
    #     (r'src\assets\others\20241231_052000000_iOS.jpg', """22°17'41.5"N 114°10'12.4"E"""),
    #     # the peninsula (re-edited)
    #     (r'src/assets/others/20241231_063800000_iOS.jpg', """22°17'40.5"N 114°10'18.7"E"""),
    #     # King's road underpass (new image)
    #     (r'src\assets\others\20250101_040200000_iOS.jpg', """22°17'12.7"N 114°12'37.1"E"""),
    #     # western market (re-edited)
    #     (r'src\assets\others\20250101_120425700_iOS.jpg', """22°17'15.2"N 114°09'01.2"E"""),
    #     # water street sign (2) (street)
    #     (r'src\assets\others\20250102_022453300_iOS.jpg', """22°17'15.2"N 114°08'19.7"E"""),
    #     # wilmer street market (re-edited)
    #     (r'src\assets\others\20250102_023724300_iOS.jpg', """22°17'16.0"N 114°08'41.6"E"""),
    #     # courtyard marriott
    #     (r'src\assets\others\20250103_011442000_iOS.jpg', """22°17'16.8"N 114°08'19.4"E"""),
    #     # tung chung from HKG T1
    #     (r'src\assets\others\20250103_043427500_iOS.jpg', """22°18'50.9"N 113°56'08.1"E"""),
    # ])

    compress('./src/assets/', quality=70)