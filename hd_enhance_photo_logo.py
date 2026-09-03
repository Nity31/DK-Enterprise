import os
from PIL import Image, ImageEnhance, ImageFilter

input_path = 'C:/Users/NITU/.gemini/antigravity/brain/58562d02-d131-40f9-8151-55da664e45e8/.user_uploaded/media_1788457346259.png'

# Load original uploaded photo
img = Image.open(input_path).convert("RGBA")

# 1. 4x High-Definition Super-Sampling Upscale
orig_w, orig_h = img.size
hd_w, hd_h = orig_w * 4, orig_h * 4
img_hd = img.resize((hd_w, hd_h), Image.Resampling.LANCZOS)

# 2. HD Edge Sharpening & Color Enhancement (Keeps exact photo artwork identical)
enhancer = ImageEnhance.Sharpness(img_hd)
img_hd = enhancer.enhance(1.8)

# 3. Transparent Background Removal
pixels = img_hd.load()
width, height = img_hd.size

for y in range(height):
    for x in range(width):
        r, g, b, a = pixels[x, y]
        
        # Remove top-left red/pink line artifact
        if y < height * 0.15 and x < width * 0.4 and r > g + 20 and r > 130:
            pixels[x, y] = (255, 255, 255, 0)
        # Off-white / light paper grey background detection with smooth thresholding
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

# Save HD Transparent PNG files
img_hd.save('frontend/public/dk_logo.png', 'PNG')
img_hd.save('dk_logo.png', 'PNG')

# Generate crisp favicon and desktop shortcut icon
ico = img_hd.resize((64, 64), Image.Resampling.LANCZOS)
ico.save('frontend/public/favicon.ico', format='ICO')
ico.save('dk_logo.ico', format='ICO')

print("Enhanced uploaded photo logo to HD transparent PNG!")
