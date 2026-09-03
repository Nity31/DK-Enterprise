import os
from PIL import Image, ImageEnhance

input_path = 'C:/Users/NITU/.gemini/antigravity/brain/58562d02-d131-40f9-8151-55da664e45e8/.user_uploaded/media_1788458332590.png'

# Load image
img = Image.open(input_path).convert("RGBA")

# 1. 4x Super-Sampling HD Upscale
w, h = img.size
img_hd = img.resize((w * 4, h * 4), Image.Resampling.LANCZOS)

# 2. Sharpening
enhancer = ImageEnhance.Sharpness(img_hd)
img_hd = enhancer.enhance(1.6)

# 3. Background Removal
pixels = img_hd.load()
width, height = img_hd.size

for y in range(height):
    for x in range(width):
        r, g, b, a = pixels[x, y]
        
        # Remove top-left pink/red line artifact
        if y < height * 0.15 and x < width * 0.4 and r > g + 20 and r > 130:
            pixels[x, y] = (255, 255, 255, 0)
        # Paper off-white / light grey background removal
        elif r > 160 and g > 165 and b > 170:
            pixels[x, y] = (255, 255, 255, 0)
        elif r > 180 and g > 180 and b > 185:
            pixels[x, y] = (255, 255, 255, 0)

# Crop tight bounding box
bbox = img_hd.getbbox()
if bbox:
    img_hd = img_hd.crop(bbox)

# Ensure directories exist
os.makedirs('frontend/public', exist_ok=True)
os.makedirs('frontend/dist', exist_ok=True)

# Save HD Transparent PNG files
img_hd.save('frontend/public/dk_logo.png', 'PNG')
img_hd.save('frontend/dist/dk_logo.png', 'PNG')
img_hd.save('dk_logo.png', 'PNG')

# Generate crisp favicon and desktop shortcut icon
ico = img_hd.resize((64, 64), Image.Resampling.LANCZOS)
ico.save('frontend/public/favicon.ico', format='ICO')
ico.save('frontend/dist/favicon.ico', format='ICO')
ico.save('dk_logo.ico', format='ICO')

print("Processed and updated exact uploaded logo to HD transparent PNG everywhere!")
