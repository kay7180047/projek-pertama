# Bersihkan latar putih logo (JPEG) -> PNG lutsinar, potong ruang kosong. Asal dalam aset-logo/ tidak diubah.
import sys
from PIL import Image
import numpy as np
SRC={'mbk':'MBK.jpg','kesumba':'Kesumba.jpg','biro':'Biro.jpg'}
for k,f in SRC.items():
    im=Image.open('aset-logo/'+f).convert('RGB'); a=np.asarray(im).astype(np.float32)
    m=a.min(axis=2)
    alpha=np.clip((243-m)/(243-222),0,1)            # >=243 putih/off-white -> lutsinar, <222 kekal
    rgba=np.dstack([a,alpha*255]).astype(np.uint8)
    img=Image.fromarray(rgba,'RGBA'); bb=img.getchannel('A').point(lambda v:255 if v>20 else 0).getbbox()
    pad=6; bb=(max(0,bb[0]-pad),max(0,bb[1]-pad),min(img.width,bb[2]+pad),min(img.height,bb[3]+pad))
    img=img.crop(bb); img.save(f'public/logos/{k}.png'); print(k,img.size)
