# Soundtrack + SFX prosedur (tanpa sampel luar, tanpa muzik komersial). 120 BPM, 30s.
import numpy as np, json, subprocess
TM=json.load(open('public/timing.json'))
scenes=[0.0]+TM['bounds']
from scipy.io import wavfile
from scipy.signal import butter, sosfilt
SR=44100; DUR=TM['end']; N=int(SR*DUR); BPM=120; B=60/BPM  # 0.5s/beat
rng=np.random.default_rng(7)
def t(n): return np.arange(n)/SR
def lp(x,f,o=2): return sosfilt(butter(o,f,'low',fs=SR,output='sos'),x)
def hp(x,f,o=2): return sosfilt(butter(o,f,'high',fs=SR,output='sos'),x)
def bp(x,a,b,o=2): return sosfilt(butter(o,[a,b],'band',fs=SR,output='sos'),x)
def put(buf,s,at,g=1.0):
    i=int(at*SR)
    if i>=len(buf): return
    e=min(len(buf),i+len(s)); buf[i:e]+=s[:e-i]*g
def env(n,a=0.002,d=0.1):
    x=t(n); return np.minimum(x/a,1)*np.exp(-x/d)
def kick():
    n=int(.28*SR);x=t(n);f=45+110*np.exp(-x*28);ph=2*np.pi*np.cumsum(f)/SR
    return np.sin(ph)*np.exp(-x*9)*np.minimum(x/.002,1)
def clap():
    n=int(.2*SR);x=t(n);nz=bp(rng.standard_normal(n),900,3500)
    e=sum(np.exp(-np.maximum(x-d,0)*55)*(x>=d) for d in (0,.011,.022))*0.6+np.exp(-x*18)*.5
    return nz*e*.9
def hat(o=False):
    n=int((.18 if o else .05)*SR);x=t(n);return hp(rng.standard_normal(n),7000)*np.exp(-x*(18 if o else 70))*.5
def bass(f,d=.22):
    n=int(d*SR);x=t(n);y=np.sin(2*np.pi*f*x)+.45*np.sin(4*np.pi*f*x)+.2*np.sign(np.sin(2*np.pi*f*x))
    return lp(y,700)*np.minimum(x/.004,1)*np.exp(-x/(d*.55))
def stab(freqs,d=.16):
    n=int(d*SR);x=t(n);y=0
    for f in freqs:
        for det in (0.997,1.003): y=y+np.sign(np.sin(2*np.pi*f*det*x))*0.5+np.sin(2*np.pi*f*det*x)
    return lp(y/len(freqs),2600)*np.minimum(x/.003,1)*np.exp(-x/(d*.5))
def nm(n): return 440*2**((n-69)/12)
music=np.zeros(N); sfx=np.zeros(N)
# Kord: Fm7 | Bb7 | Ebmaj7 | C7  (setiap 2 bar = 4s)  -> 15 bar
chords=[(41,[65,68,72,75]),(46,[65,68,72,74]),(51,[67,70,74,77]),(48,[64,67,70,72])]
root_pat=[0,None,0,None,12,None,0,7, None,0,None,10,0,None,12,None] # 16 langkah (16th)
nbar=15; sw=0.0
for bar in range(nbar):
    ch=chords[(bar//2)%4]; b0=bar*4*B
    intro=bar<1; main=bar>=1; peak=bar>=11   # peak = minggu bracket/final
    # kick: four-on-floor ringan, kosong pada bar 0 separuh pertama (hook beri ruang)
    for beat in range(4):
        if bar==0 and beat<2: continue
        put(music,kick(),b0+beat*B,.95 if main else .7)
    if main or bar==0:
        for beat in (1,3): 
            if not(bar==0 and beat<3): put(music,clap(),b0+beat*B,.5)
    for s in range(16):
        tt=b0+s*B/4+(B/8*0.35 if s%2 else 0)  # swing ringan
        if bar>=1:
            put(music,hat(s%4==2),tt,.42 if s%2 else .3)
        r=root_pat[s]
        if r is not None and bar>=1:
            put(music,bass(nm(ch[0]+r)),tt,.62)
    # stab funky sinkopasi
    if bar>=1:
        for s in ([3,6,10,14] if not peak else [0,3,6,8,10,14]):
            put(music,stab([nm(n) for n in ch[1]]),b0+s*B/4,.2)
# riser pra-final (bar 12 -> 13) & fill
def riser(dur,f0,f1):
    n=int(dur*SR);x=t(n);nz=bp(rng.standard_normal(n),f0,f1,2);e=(x/dur)**2
    sw_=np.sin(2*np.pi*np.cumsum(np.linspace(f0,f1,n))/SR)*.4
    return (nz*.6+sw_)*e
put(sfx,riser(3.5,300,6000),scenes[7]+0.2,.35)   # menuju bracket
put(sfx,riser(1.0,500,7000),0.0,.0)
def whoosh(dur=.4,up=True):
    n=int(dur*SR);x=t(n);nz=rng.standard_normal(n)
    f=np.linspace(400,5000,n) if up else np.linspace(5000,400,n)
    y=np.zeros(n);blk=512
    for i in range(0,n,blk):
        c=float(f[i]);y[i:i+blk]=bp(nz[i:i+blk]*1.0,max(c*.6,80),min(c*1.4,20000),1) if False else nz[i:i+blk]
    y=bp(nz,300,6000)*np.sin(np.pi*x/dur)**2
    # sapuan kecerahan
    y=y*(0.5+0.5*np.sin(np.pi*x/dur))
    return hp(lp(y,np.mean(f)*1.5),200)*1.0
def pop(f=600,d=.09):
    n=int(d*SR);x=t(n);fr=f*(1+1.5*np.exp(-x*60));return np.sin(2*np.pi*np.cumsum(fr)/SR)*np.exp(-x/(d*.35))
def tick(f):
    n=int(.06*SR);x=t(n);return (np.sin(2*np.pi*f*x)+.3*np.sin(2*np.pi*f*2*x))*np.exp(-x*55)
def impact():
    n=int(.7*SR);x=t(n);y=np.sin(2*np.pi*np.cumsum(55+90*np.exp(-x*14))/SR)*np.exp(-x*5)
    return y+lp(rng.standard_normal(n),1800)*np.exp(-x*14)*.5
def sparkle():
    n=int(.5*SR);x=t(n);y=0
    for i,f in enumerate((1568,1976,2349,3136)): y=y+np.sin(2*np.pi*f*(x-i*.05).clip(0))*np.exp(-np.maximum(x-i*.05,0)*9)*(x>=i*.05)
    return y*.5
# Jadual cue (saat) — sama dengan visual (lihat src/timing.ts)

for s in scenes[1:]: put(sfx,whoosh(.45),s-.30,.5)
put(sfx,impact(),0.0,.0)
for c in (0.55,1.1,1.6,2.1):   pass
# Hook: 3 stamp "11 PASUKAN / 6 MINGGU / 1 PIALA"
for c in (0.0,1.0,1.5,2.0): put(sfx,impact(),c,.55 if c else .45)
# Minggu: title slam, lalu tick baris (Rabu 5, Khamis 6)
for w in range(5):
    w0=scenes[2+w]
    put(sfx,pop(520,.1),w0+0.05,.5)
    for i in range(5): put(sfx,tick(900+i*70),w0+0.55+i*0.09,.28)
    put(sfx,pop(780,.08),w0+2.6,.45)
    for i in range(6): put(sfx,tick(900+i*70),w0+2.87+i*0.09,.28)
# Info (3.0-5.5): pop kata kunci
for c in (scenes[1]+.15,scenes[1]+.8,scenes[1]+1.5): put(sfx,pop(700,.09),c,.5)
# Bracket (23-28)
for c in (scenes[7]+.2,scenes[7]+1.1,scenes[7]+2.0,scenes[7]+3.0): put(sfx,pop(600+(c-scenes[7])*40,.1),c,.5)
IMP=scenes[7]+3.7
put(sfx,impact(),IMP,.7); put(sfx,sparkle(),IMP+.1,.6)
# CTA
put(sfx,pop(660,.09),scenes[8]+.05,.5); put(sfx,sparkle(),scenes[8]+.4,.5)
# Mixing: sidechain ringan pada muzik dari kick + fade in/out
subprocess.run(['ffmpeg','-v','error','-y','-ss',str(TM['songStart']),'-t',str(DUR),'-i','public/audio/sweat.m4a','-ar',str(SR),'-ac','2','/tmp/claude-0/song30.wav'],check=True)
_,sg=wavfile.read('/tmp/claude-0/song30.wav'); sg=sg.astype(float)/32768
sg=sg[:N]; sg=np.pad(sg,((0,N-len(sg)),(0,0))) if len(sg)<N else sg
sgm=sg.mean(1)
mus=sgm
x=t(N); fade=np.minimum(x/0.01,1)*np.minimum((DUR-x)/1.5,1)
# duck muzik sedikit pada SFX besar (impact/stamp) — sidechain mudah
duck=np.ones(N)
for c in (0.0,1.0,1.5,2.0,IMP): 
    i=int(c*SR);L=int(.25*SR);duck[i:i+L]*=np.linspace(.35,1,len(duck[i:i+L]))
mus_st=sg*duck[:,None]*0.42
sf=sfx/(np.max(np.abs(sfx))+1e-9)*0.55
st=(mus_st+sf[:,None])*fade[:,None]
pk=np.max(np.abs(st)); st=st/pk*0.89 if pk>0.89 else st
wavfile.write('public/audio/soundtrack.wav',SR,(st*32767).astype(np.int16))
print('ok',pk)
