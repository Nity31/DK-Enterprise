import os
from PIL import Image, ImageDraw, ImageFont

def generate_clean_logo():
    # Create 512x512 transparent PNG
    size = 512
    img = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    
    # Outer Green & Blue 3D Swirl Rings
    # Green Ellipse (tilted top-left to bottom-right)
    draw.ellipse([30, 80, 480, 430], outline='#10B981', width=36)
    draw.ellipse([80, 30, 430, 480], outline='#0284C7', width=36)
    
    # Inner Metallic Circle / Badge
    draw.ellipse([140, 140, 372, 372], fill='#0F172A', outline='#38BDF8', width=8)
    
    # Save base transparent logo
    os.makedirs('frontend/public', exist_ok=True)
    img.save('frontend/public/dk_logo_clean.png')
    img.save('dk_logo_clean.png')

generate_clean_logo()
print('Generated clean transparent logo successfully!')
