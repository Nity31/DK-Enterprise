import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_hd_exact_logo():
    # 1024x1024 canvas for crisp HD anti-aliased rendering
    canvas_size = 1024
    scale = 2  # Super-sample at 2048x2048 then downscale for silky smooth HD edges
    size = canvas_size * scale
    
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. Render Outer Green Tilted Torus Ring
    # Center = (1024, 1024), Radii = (750, 480), Tilted -30 deg
    ring_img_g = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw_g = ImageDraw.Draw(ring_img_g)
    
    # Outer Green Ring Glow & 3D Tube layers
    for thickness in range(120, 0, -4):
        alpha = int(255 * (1.0 - (thickness / 130.0) * 0.3))
        # Green gradient shift from bright green to dark green
        g_val = int(180 - (thickness * 0.5))
        b_val = int(50 - (thickness * 0.3))
        color = (50, max(120, g_val), max(20, b_val), alpha)
        
        draw_g.ellipse(
            [size*0.12 + thickness, size*0.25 + thickness, size*0.78 - thickness, size*0.82 - thickness],
            outline=color,
            width=6
        )

    # Rotate Green Ring by -28 degrees
    ring_g_rot = ring_img_g.rotate(-28, resample=Image.Resampling.BICUBIC, center=(size//2, size//2))

    # 2. Render Outer Blue Tilted Torus Ring
    ring_img_b = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw_b = ImageDraw.Draw(ring_img_b)

    for thickness in range(120, 0, -4):
        alpha = int(255 * (1.0 - (thickness / 130.0) * 0.3))
        b_val = int(210 - (thickness * 0.6))
        color = (0, int(120 - (thickness * 0.3)), max(140, b_val), alpha)
        
        draw_b.ellipse(
            [size*0.22 + thickness, size*0.15 + thickness, size*0.88 - thickness, size*0.72 - thickness],
            outline=color,
            width=6
        )

    # Rotate Blue Ring by 28 degrees
    ring_b_rot = ring_img_b.rotate(28, resample=Image.Resampling.BICUBIC, center=(size//2, size//2))

    # Composite Green & Blue Rings with 3D intersection
    img.alpha_composite(ring_g_rot)
    img.alpha_composite(ring_b_rot)

    # Downscale from 2048x2048 to 1024x1024 for 4K HD crispness
    img_hd = img.resize((1024, 1024), Image.Resampling.LANCZOS)
    
    # Save Ultra HD Logo files
    os.makedirs('frontend/public', exist_ok=True)
    img_hd.save('frontend/public/dk_logo.png', 'PNG')
    img_hd.save('dk_logo.png', 'PNG')

create_hd_exact_logo()
print("Generated crisp HD 1024x1024 logo successfully!")
