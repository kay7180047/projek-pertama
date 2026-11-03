# Cari kick lagu & snap sempadan babak ke dentuman terdekat. Output: public/timing.json
import json, subprocess, numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, find_peaks
SONG='public/audio/sweat.m4a'; START=14.75   # drop tenaga penuh
subprocess.run(['ffmpeg','-v','error','-y','-ss',str(START),'-t','31','-i',SONG,'-ar','22050','-ac','1','/tmp/claude-0/seg.wav'],check=True)
sr,x=wavfile.read('/tmp/claude-0/seg.wav'); x=x.astype(float)/32768
lo=sosfilt(butter(2,150,'low',fs=sr,output='sos'),x); h=64; fps=sr/h
e=np.abs(lo)[:len(lo)//h*h].reshape(-1,h).mean(1); d=np.maximum(np.diff(e),0)
pk,_=find_peaks(d,height=np.percentile(d,92),distance=int(0.25*fps)); kicks=(pk+1)/fps
print('kicks',len(kicks),'median gap',np.median(np.diff(kicks)))
want=[3.0,5.5,9.0,12.5,16.0,19.5,23.0,28.0]
snapped=[]
for w in want:
    k=kicks[np.argmin(abs(kicks-w))]; snapped.append(round(float(k) if abs(k-w)<0.25 else w,3))
print(list(zip(want,snapped)))
json.dump({'songStart':START,'bounds':snapped,'end':30.0},open('public/timing.json','w'))
