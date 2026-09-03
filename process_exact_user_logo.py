import os
from PIL import Image

input_path = 'C:/Users/NITU/.gemini/antigravity/brain/58562d02-d131-40f9-8151-55da664e45e8/.user_uploaded/media_1788454782736.png'

img = Image.open(input_path).convert("RGBA")
width, height = img.size

# Process pixels directly to keep exact logo colors untouched while removing paper background
new_pixels = []
for y in range(height):
    for x in range(width):
        r, g, b, a = img.getpixel((x, y))
        
        # Remove pink line at the top left corner if present
        if y < 35 and r > g + 20 and r > 130:
            new_pixels.append((255, 255, 255, 0))
        # Off-white / light paper grey background removal threshold
        elif r > 165 and g > 170 and b > 175:
            new_pixels.append((255, 255, 255, 0))
        elif r > 180 and g > 180 and b > 185:
            new_pixels.append((255, 255, 255, 0))
        else:
            new_pixels.append((r, g, b, a))

img.putdata(new_pixels)

# Crop tight bounding box around the exact logo
bbox = img.getbbox()
if bbox:
    img = img.crop(bbox)

# Ensure public folder exists
os.makedirs('frontend/public', exist_ok=True)

# Save high quality transparent PNG
img.save('frontend/public/dk_logo.png', 'PNG')
img.save('dk_logo.png', 'PNG')

# Generate crisp favicon and desktop shortcut icon
ico = img.resize((64, 64), Image.Resampling.LANCZOS)
ico.save('frontend/public/favicon.ico', format='ICO')
ico.save('dk_logo.ico', format='ICO')

print("Processed exact uploaded logo with transparent background!")
