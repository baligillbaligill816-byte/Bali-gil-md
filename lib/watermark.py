import sys
import requests
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
import os

def add_watermark(source, output_path):
    try:
        # Load the image
        if source.startswith("http"):
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
            response = requests.get(source, headers=headers)
            # print(f"Status: {response.status_code}, Content-Type: {response.headers.get('Content-Type')}")
            img = Image.open(BytesIO(response.content)).convert("RGB")
        else:
            img = Image.open(source).convert("RGB")
        
        draw = ImageDraw.Draw(img)
        width, height = img.size
        
        # Define watermark text
        text = "BALI GIL MD powered by ITACHI UCHIHA"
        
        # Try to use a nice font, fallback to default
        try:
            # Try to find a system font
            font_size = int(height / 25)
            if font_size < 20: font_size = 20
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
        except:
            font = ImageFont.load_default()

        # Calculate text position (bottom right)
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        margin = 20
        x = width - text_width - margin
        y = height - text_height - margin
        
        # Draw shadow/outline for better visibility
        draw.text((x+2, y+2), text, font=font, fill=(0, 0, 0))
        draw.text((x, y), text, font=font, fill=(255, 255, 255))
        
        # Save the result
        img.save(output_path, "JPEG", quality=95)
        return True
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 watermark.py <url> <output_path>")
        sys.exit(1)
    
    url = sys.argv[1]
    out = sys.argv[2]
    if add_watermark(url, out):
        sys.exit(0)
    else:
        sys.exit(1)
