
from os import remove
from pathlib import Path

from PIL import Image
from PIL.ExifTags import IFD, GPS, GPSTAGS
from pillow_heif import register_heif_opener

coords = [
    """43°40'35.3"N 79°36'41.4"W""",
    """22°17'08.7"N 114°08'32.0"E""",
    """22°17'12"N 114°09'13"E""",
    """22°17'12"N 114°09'05"E""",
    # wing lok & morrison
    """22°17'11.6"N 114°09'01.6"E""",
    """22°17'11.6"N 114°09'01.6"E""",
    # tram
    """22°17'16.9"N 114°08'27.1"E""",
    # peak
    """22°16'41.4"N 114°08'48.5"E""",
    """22°16'41.4"N 114°08'48.5"E""",
    """22°16'41.4"N 114°08'48.5"E""",
    """22°16'41.4"N 114°08'48.5"E""",
    """22°16'41.4"N 114°08'48.5"E""",
    """22°16'41.4"N 114°08'48.5"E""",
    """22°16'41.4"N 114°08'48.5"E""",
    """22°16'41.4"N 114°08'48.5"E""",
    """22°16'41.4"N 114°08'48.5"E""",
    """22°16'41.4"N 114°08'48.5"E""",
    """22°16'41.4"N 114°08'48.5"E""",
    """22°16'41.4"N 114°08'48.5"E""",
    # kennedy town
    """22°16'52.6"N 114°07'37.4"E""",
    # connaught pl
    """22°16'58.4"N 114°09'29.7"E""",
    # ifc mall
    """22°17'03.2"N 114°09'29.4"E""",
    # aia carnival
    """22°17'08.0"N 114°09'37.9"E""",
    # man kwong
    """22°17'10.5"N 114°09'39.0"E""",
    # central pier no. 8
    """22°17'10.9"N 114°09'43.4"E""",
    """22°17'10.9"N 114°09'43.4"E""",
    # central pier no. 9
    """22°17'10.2"N 114°09'46.5"E""",
    # central pier no. 10
    """22°17'06.6"N 114°09'44.9"E""",
    # star ferry
    """22°17'11.8"N 114°09'40.6"E""",
    # central pier
    """22°17'12.7"N 114°09'42.4"E""",
    # victoria harbor -> wan chai
    """22°17'22.5"N 114°09'50.0"E""",
    # star ferry 2
    """22°17'29.1"N 114°09'58.4"E""",
    # island skyline
    """22°17'39.9"N 114°10'06.8"E""",
    """22°17'39.9"N 114°10'06.8"E""",
    # Hong Kong words
    """22°17'42.0"N 114°10'01.4"E""",
    """22°17'42.0"N 114°10'01.4"E""",
    # 1881 heritage
    """22°17'41.5"N 114°10'12.4"E""",
    # sunset skyline
    """22°17'36.7"N 114°10'09.3"E""",
    # wan chai from avenue of stars
    """22°17'35.6"N 114°10'16.6"E""",
    # avenue of stars
    """22°17'36.1"N 114°10'30.3"E""",
    """22°17'36.1"N 114°10'30.3"E""",
    """22°17'36.1"N 114°10'30.3"E""",
    """22°17'36.1"N 114°10'30.3"E""",
    # K11 musea
    """22°17'38.2"N 114°10'31.3"E""",
    # 2 boats
    """22°17'38.9"N 114°10'33.0"E""",
    # K11 inside
    """22°17'39.2"N 114°10'29.8"E""",
    # the peninsula
    """22°17'40.5"N 114°10'18.7"E""",
    """22°17'40.5"N 114°10'18.7"E""",
    # Hong Kong winterfest
    """22°17'56.4"N 114°09'20.0"E""",
    """22°17'56.4"N 114°09'20.0"E""",
    # west kowloon skyline
    """22°17'56.1"N 114°09'21.1"E""",
    """22°17'56.1"N 114°09'21.1"E""",
    """22°17'56.1"N 114°09'21.1"E""",
    # Hong kong winterfest 2
    """22°17'56.4"N 114°09'20.0"E""",
    # West kowloon skyline 2
    """22°17'56.1"N 114°09'21.1"E""",
    # noel
    """22°18'08.4"N 114°09'47.9"E""",
    # NYE fireworks
    """22°17'34.7"N 114°10'12.8"E""",
    """22°17'34.7"N 114°10'12.8"E""",
    """22°17'34.7"N 114°10'12.8"E""",
    """22°17'34.7"N 114°10'12.8"E""",
    # 3rd st -> HKU
    """22°17'09.5"N 114°08'16.1"E""",
    # HKU
    """22°17'04"N 114°08'17"E""",
    # Monster building
    """22°17'02.8"N 114°12'44.9"E""",
    # mt parker road
    """22°17'05.2"N 114°12'43.3"E""",
    # monster building outside
    """22°17'06.6"N 114°12'41.0"E""",
    # causeway bay
    """22°16'50.4"N 114°11'00.9"E""",
    # wan chai
    """22°16'35.9"N 114°10'28.1"E""",
    # centre st & queen's rd W
    """22°17'12.7"N 114°08'32.1"E""",
    # western market
    """22°17'15.2"N 114°09'01.2"E""",
    # water street sign
    """22°17'15.2"N 114°08'19.7"E""",
    # des veoux & eastern st (hill)
    """22°17'16.1"N 114°08'37.7"E""",
    # wilmer st market
    """22°17'16.0"N 114°08'41.6"E""",
    # morrison st & bonham strand
    """22°17'10.6"N 114°09'01.0"E""",
    # jervois st
    """22°17'05.9"N 114°09'04.7"E""",
    # stairs
    """22°17'04.6"N 114°09'04.8"E""",
    # stairs 2
    """22°17'02.5"N 114°09'07.8"E""",
    # peel st
    """22°17'01.4"N 114°09'13.5"E""",
    # mong kok rd & nathan rd
    """22°19'14.8"N 114°10'08.4"E""",
    # sai yeung choi st
    """22°19'15.2"N 114°10'10.9"E""",
    # tung choi st
    """22°19'15.6"N 114°10'12.7"E""",
    """22°19'15.6"N 114°10'12.7"E""",
    # fa yuen st
    """22°19'16.1"N 114°10'14.8"E""",
    # taste of tea
    """22°19'15.1"N 114°10'11.5"E""",
    # oriental pearl
    """22°17'11.6"N 114°09'41.4"E""",
    # central pier no. 9
    """22°17'10.2"N 114°09'46.5"E""",
    """22°17'10.2"N 114°09'46.5"E""",
    # apple store IFC
    """22°17'03.5"N 114°09'34.9"E""",
    # courtyard marriot 7-11
    """22°17'16.3"N 114°08'19.6"E""",
    # courtyard marriot
    """22°17'16.8"N 114°08'19.4"E""",
    """22°17'16.8"N 114°08'19.4"E""",
    """22°17'16.8"N 114°08'19.4"E""",
    """22°17'16.8"N 114°08'19.4"E""",
    # skydeck
    """22°19'00"N 113°55'52"E""",
    # skybridge
    """22°18'57.7"N 113°55'53.6"E""",
    # skydeck
    """22°19'00"N 113°55'52"E""",
    # skybridge
    """22°18'57.7"N 113°55'53.6"E""",
    """22°18'57.7"N 113°55'53.6"E""",
    """22°18'57.7"N 113°55'53.6"E""",
    """22°18'57.7"N 113°55'53.6"E""",
    """22°18'57.7"N 113°55'53.6"E""",
    """22°18'57.7"N 113°55'53.6"E""",
    # elevator to skybridge
    """22°18'54.7"N 113°55'54.5"E""",
    # terminal 1 hall
    """22°18'50.8"N 113°55'52.5"E""",
    """22°18'50.8"N 113°55'52.5"E""",
    """22°18'50.8"N 113°55'52.5"E""",
    # final flight
    """22°18'48.9"N 113°55'47.0"E""",
    """22°18'48.9"N 113°55'47.0"E""",
]

def process(
    directory: str,
    *,
    quality: int = 100
) -> None:
    register_heif_opener()

    i = 0
    for file in Path(directory).glob('**/*.jpg'):
        with Image.open(file) as img:
            exif = img.getexif()

            gps = exif.get_ifd(IFD.GPSInfo)

            if not gps or file.parts[-1] == '20241231_035422466_iOS.jpg' or file.parts[-1] == '20241231_035436883_iOS.jpg':
                lat, long = coords[i].split()

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
                    format='JPEG',
                    quality=quality,
                    exif=exif,
                )
                i += 1

                print(f'Saved GPS info for [{file}]')
            else:
                print('GPS info already exists.')

if __name__ == '__main__':
    process('./public/assets/others')