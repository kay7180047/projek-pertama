# Potong lencana pasukan & penaja daripada poster (public/assets/poster.jpg)
from PIL import Image
im = Image.open('public/assets/poster.jpg').convert('RGB')
def box(o, b, s=2): return (o[0]+b[0]/s, o[1]+b[1]/s, o[0]+b[2]/s, o[1]+b[3]/s)
G=(880,360)
teams = {
 'supa':(55,25,225,190),'mbk':(300,25,480,190),'elephant':(555,30,735,185),'im':(835,30,1005,190),
 'picklenp':(50,255,225,410),'pasfa':(265,285,505,365),'pnpp':(570,240,735,405),'picklepp':(830,240,990,405),
 'iium':(300,490,480,630),'waterblast':(580,480,740,640)}
for k,b in teams.items():
    c = im.crop(tuple(int(v) for v in box(G,b)))
    c.save(f'public/assets/teams/{k}.png')
S=(890,190)
sp = {'tpx':(40,10,185,100),'kospek':(200,25,400,85),'yap':(420,25,660,90),'alliance':(670,30,925,90)}
for k,b in sp.items():
    im.crop(tuple(int(v) for v in box(S,b))).save(f'public/assets/sponsors/{k}.png')
