import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_hd_dk_logo():
    # 1024x1024 Ultra HD Transparent Canvas
    size = 1024
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. Outer Green 3D Ring (Tilted Oval)
    # Background shadow/glow for 3D depth
    draw.ellipse([80, 200, 840, 840], outline=(16, 185, 129, 200), width=90)
    draw.ellipse([100, 220, 820, 820], outline=(22, 163, 74, 255), width=70)
    draw.ellipse([120, 240, 800, 800], outline=(34, 197, 94, 255), width=50)

    # 2. Outer Blue 3D Ring (Intersecting Oval)
    draw.ellipse([200, 80, 840, 840], outline=(14, 165, 233, 200), width=90)
    draw.ellipse([220, 100, 820, 820], outline=(2, 132, 199, 255), width=70)
    draw.ellipse([240, 120, 800, 800], outline=(56, 189, 248, 255), width=50)

    # 3. Smooth antialiasing downscale to 512x512 for HD sharpness
    img_hd = img.resize((512, 512), Image.Resampling.LANCZOS)
    
    # Save Ultra HD Logo files
    os.makedirs('frontend/public', exist_ok=True)
    img_hd.save('frontend/public/dk_logo_hd.png', 'PNG')
    img_hd.save('dk_logo_hd.png', 'PNG')

create_hd_dk_logo()
print("Generated Ultra HD 3D logo successfully!")
