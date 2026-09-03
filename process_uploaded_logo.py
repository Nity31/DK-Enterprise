from PIL import Image

input_path = 'C:/Users/NITU/.gemini/antigravity/brain/58562d02-d131-40f9-8151-55da664e45e8/.user_uploaded/media_1788441986445.png'

img = Image.open(input_path).convert("RGBA")
width, height = img.size

# Process pixels directly
new_pixels = []
for y in range(height):
    for x in range(width):
        r, g, b, a = img.getpixel((x, y))
        
        # Remove pink/red lines at top (y < 40 and r > g + 20)
        if y < 40 and r > g + 25 and r > 140:
            new_pixels.append((255, 255, 255, 0))
        # Off-white / paper grey background detection
        elif r > 165 and g > 170 and b > 175:
            new_pixels.append((255, 255, 255, 0))
        elif r > 180 and g > 185 and b > 190:
            new_pixels.append((255, 255, 255, 0))
        else:
            new_pixels.append((r, g, b, a))

img.putdata(new_pixels)

# Crop tight bounding box
bbox = img.getbbox()
if bbox:
    img = img.crop(bbox)

# Save transparent PNG
img.save('frontend/public/dk_logo.png', 'PNG')
img.save('dk_logo.png', 'PNG')

# Save ICO icon for desktop shortcut
ico = img.resize((64, 64), Image.Resampling.LANCZOS)
ico.save('dk_logo.ico', format='ICO')

print("Processed and saved high quality transparent logo via PIL!")
