import struct

def create_dk_ico(filepath):
    width = 64
    height = 64
    bpp = 32
    
    # 32-bit BGRA pixels
    # Let's draw a nice rounded square badge with dark navy blue background (#0f172a)
    # and white "DK" letters!
    
    # Font bitmap pattern for 'D' and 'K' in 16x16 grid scaled up
    d_pattern = [
        "FFFF....",
        "F...F...",
        "F....F..",
        "F....F..",
        "F....F..",
        "F...F...",
        "FFFF...."
    ]
    
    k_pattern = [
        "F...F...",
        "F..F....",
        "F.F.....",
        "FF......",
        "F.F.....",
        "F..F....",
        "F...F..."
    ]
    
    pixels = bytearray(width * height * 4)
    
    # Fill background with rounded rectangle
    radius = 12
    bg_b, bg_g, bg_r, bg_a = 42, 23, 15, 255  # #0f172a in BGRA
    
    for y in range(height):
        for x in range(width):
            # Check rounded corner radius
            dx = max(0, max(radius - x, x - (width - 1 - radius)))
            dy = max(0, max(radius - y, y - (height - 1 - radius)))
            
            idx = ((height - 1 - y) * width + x) * 4
            
            if dx * dx + dy * dy <= radius * radius:
                # Background gradient (sky blue to dark blue)
                blend = y / height
                r_val = int(2 + blend * (15 - 2))
                g_val = int(132 + blend * (23 - 132))
                b_val = int(199 + blend * (42 - 199))
                
                pixels[idx] = b_val
                pixels[idx+1] = g_val
                pixels[idx+2] = r_val
                pixels[idx+3] = 255
            else:
                # Transparent outside rounded rect
                pixels[idx] = 0
                pixels[idx+1] = 0
                pixels[idx+2] = 0
                pixels[idx+3] = 0

    # Render 'D' and 'K' text in white in center
    # D at x: 12..28, y: 18..46
    # K at x: 34..50, y: 18..46
    def draw_glyph(pattern, start_x, start_y, scale=4):
        for py, row in enumerate(pattern):
            for px, ch in enumerate(row):
                if ch == 'F':
                    for sy in range(scale):
                        for sx in range(scale):
                            gx = start_x + px * scale + sx
                            gy = start_y + py * scale + sy
                            if 0 <= gx < width and 0 <= gy < height:
                                idx = ((height - 1 - gy) * width + gx) * 4
                                pixels[idx] = 255     # B
                                pixels[idx+1] = 255   # G
                                pixels[idx+2] = 255   # R
                                pixels[idx+3] = 255   # A

    draw_glyph(d_pattern, 10, 18, scale=3)
    draw_glyph(k_pattern, 36, 18, scale=3)

    # ICO Header
    ico_header = struct.pack('<HHH', 0, 1, 1) # Reserved=0, Type=1(ICO), Count=1
    
    # BMP Info Header (BITMAPINFOHEADER - 40 bytes)
    bmp_header_size = 40
    image_size = len(pixels) + bmp_header_size
    
    # Directory Entry (16 bytes)
    entry = struct.pack('<BBBBHHII', 
        width, height, 0, 0, 1, bpp, image_size, 6 + 16
    )
    
    # BITMAPINFOHEADER (height doubled for ICO mask transparency)
    bmp_header = struct.pack('<IIIHHIIIIII',
        bmp_header_size, width, height * 2, 1, bpp, 0, len(pixels), 0, 0, 0, 0
    )
    
    with open(filepath, 'wb') as f:
        f.write(ico_header)
        f.write(entry)
        f.write(bmp_header)
        f.write(pixels)

create_dk_ico('dk_logo.ico')
print('Generated dk_logo.ico successfully!')
