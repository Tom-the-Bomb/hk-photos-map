
from os import remove
from pathlib import Path

from PIL import Image
import pillow_avif

def process(
    directory: str,
    *,
    quality: int = 100
) -> None:
    for file in Path(directory).glob('**/*.avif'):
        #if not (file_avif := file.with_suffix('.avif')).is_file():
        with Image.open(file) as img:
            img.thumbnail((3000, 3000), Image.Resampling.LANCZOS)
            img.save(
                file,
                format='AVIF',
                quality=quality,
                exif=img.info['exif'],
            )

        print(f'Converted [{file}] from JPEG to AVIF successfully.')
        #remove(file)

if __name__ == '__main__':
    process('./src/assets/', quality=70)