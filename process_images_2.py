
from os import remove
from pathlib import Path

from PIL import Image
from pillow_heif import register_heif_opener

def process(
    directory: str,
    *,
    quality: int = 100
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

if __name__ == '__main__':
    process('./public/assets/')