from PIL import Image

def remove_background(input_path, output_path, threshold=210):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    
    newData = []
    for item in datas:
        # Check if color is close to white/light grey background
        r, g, b, a = item
        if r > threshold and g > threshold and b > threshold:
            newData.append((255, 255, 255, 0)) # Make transparent
        else:
            newData.append(item)
            
    img.putdata(newData)
    img.save(output_path, "PNG")

remove_background('dk_logo.png', 'frontend/public/dk_logo.png', threshold=190)
remove_background('dk_logo.png', 'dk_logo.png', threshold=190)
print('Made photo logo transparent!')
