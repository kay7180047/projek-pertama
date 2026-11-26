# Cari kedudukan subjek utama (muka > badan > ketajaman) untuk crop menegak 9:16.
import cv2,json,sys,numpy as np
PH=sys.argv[1]; SEL=sys.argv[2]; OUT=sys.argv[3]
fc=cv2.CascadeClassifier(cv2.data.haarcascades+'haarcascade_frontalface_alt2.xml')
pc=cv2.CascadeClassifier(cv2.data.haarcascades+'haarcascade_profileface.xml')
hog=cv2.HOGDescriptor();hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())
def sharp_fx(g):
    a=g.astype(float);lap=np.abs(a[1:-1,1:-1]*4-a[:-2,1:-1]-a[2:,1:-1]-a[1:-1,:-2]-a[1:-1,2:])
    col=np.convolve(lap.sum(0)**2,np.ones(9)/9,'same');return float((col*np.arange(len(col))).sum()/col.sum()/len(col))
def focus(path):
    im=cv2.imread(path);h,w=im.shape[:2];g=cv2.cvtColor(im,cv2.COLOR_BGR2GRAY)
    s=800/w;sm=cv2.resize(g,(800,int(h*s)));sm=cv2.equalizeHist(sm)
    faces=[(a,b,c,d) for (a,b,c,d) in fc.detectMultiScale(sm,1.1,5,minSize=(45,45))]
    for (a,b,c,d) in pc.detectMultiScale(sm,1.1,5,minSize=(45,45)): faces.append((a,b,c,d))
    flip=cv2.flip(sm,1)
    for (a,b,c,d) in pc.detectMultiScale(flip,1.1,5,minSize=(45,45)): faces.append((800-a-c,b,c,d))
    if faces:
        a,b,c,d=max(faces,key=lambda f:f[2]*f[3]);return (a+c/2)/800,'face'
    sm2=cv2.resize(g,(480,int(h*480/w)))
    rects,wts=hog.detectMultiScale(sm2,winStride=(8,8),padding=(8,8),scale=1.05)
    if len(rects):
        i=int(np.argmax([r[2]*r[3]*float(wt) for r,wt in zip(rects,np.ravel(wts))]));a,b,c,d=rects[i];return (a+c/2)/480,'body'
    return sharp_fx(cv2.resize(g,(w//4,h//4))),'sharp'
sel=json.load(open(SEL));res={}
items=[it for part in sel for it in part] if isinstance(sel[0],list) else sel
for it in items:
    fx,m=focus(f"{PH}/{it['src']}");res[it['src']]={'fx':round(float(fx),3),'m':m}
json.dump(res,open(OUT,'w'));
from collections import Counter;print(Counter(v['m'] for v in res.values()))
