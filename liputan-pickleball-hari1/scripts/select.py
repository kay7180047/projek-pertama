# Pilih gambar terbaik: buang lemah/ulang, auto-fokus subjek, bahagi 3 bahagian x 75.
import json,sys,shutil,numpy as np
from PIL import Image
SRC=sys.argv[1]; OUT=sys.argv[2]
c=json.load(open(SRC+'/cands.json'))
manual_drop={1,3,5,12,15,17,19,21,22,24,26,29,31,33,35,41,44,49,50,54,55,58,60,61,64,69,216,78,80,84,86}
# gambar lebar/pentas/kumpulan -> kekal penuh (contain); selebihnya crop 9:16 ikut fokus
contain={0,2,4,7,9,10,11,14,16,18,20,23,25,52,53,56,57,59,62,63,65,66,67,68,70,74,123,178,179}
idx=[i for i in range(len(c)) if i not in manual_drop]
def sig(i):
    return np.asarray(Image.open(f"{SRC}/src_small/{c[i]['f']}").convert('L').resize((16,16)),float).flatten()
sigs={i:sig(i) for i in idx}
TARGET=225
while len(idx)>TARGET:   # buang yang paling serupa dengan jiran (kurang variasi), lebihkan yang lebih tajam
    best=None
    for k in range(1,len(idx)):
        d=np.abs(sigs[idx[k]]-sigs[idx[k-1]]).mean()
        if best is None or d<best[0]: best=(d,k)
    k=best[1];a,b=idx[k-1],idx[k]
    idx.remove(a if c[a]['sharp']<c[b]['sharp'] else b)
def focus(f):
    im=Image.open(f"{SRC}/src_small/{f}").convert('L');w,h=im.size
    a=np.asarray(im.resize((w//4,h//4)),float)
    lap=np.abs(a[1:-1,1:-1]*4-a[:-2,1:-1]-a[2:,1:-1]-a[1:-1,:-2]-a[1:-1,2:])
    col=lap.sum(0)**2; col=np.convolve(col,np.ones(9)/9,'same')
    x=(col*np.arange(len(col))).sum()/col.sum()/len(col)
    return float(min(max(x,0.0),1.0))
def label(i):
    if i<=24: return 'PERASMIAN'
    if i<=51: return 'PERLAWANAN EKSHIBISYEN'
    if i<=70: return 'GAMBAR KUMPULAN'
    return 'PERLAWANAN'
items=[]
for i in idx:
    f=c[i]['f'];items.append(dict(src=f,layout='contain' if i in contain else 'cover',fx=round(focus(f),3),chapter=label(i)))
parts=[items[p*75:(p+1)*75] for p in range(3)]
for p,pl in enumerate(parts):
    for k,it in enumerate(pl): shutil.copy(f"{SRC}/src_small/{it['src']}",f"{OUT}/public/photos/{it['src']}")
json.dump(parts,open(f"{OUT}/src/selection.json",'w'),indent=1)
print(len(items),[len(p) for p in parts])
print([ (p[0]['chapter'],p[-1]['chapter']) for p in parts])
print(sum(1 for x in items if x['layout']=='cover'),'cover')
