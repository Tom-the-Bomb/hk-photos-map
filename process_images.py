
from os import remove
from pathlib import Path

from PIL import Image

def process(
    directory: str,
    *,
    quality: int = 100
) -> None:
    for file in Path(directory).glob('**/*.jpg'):
        if not (file_webp := file.with_suffix('.webp')).is_file():
            with Image.open(file) as img:
                img.save(
                    file_webp,
                    format='WEBP',
                    quality=quality,
                    exif=img.info['exif'],
                )

            print(f'Converted [{file}] from JPEG to WEBP successfully.')
            remove(file)

if __name__ == '__main__':
    process('./src/assets/', quality=80)