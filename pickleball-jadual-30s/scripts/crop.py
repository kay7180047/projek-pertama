from PIL import Image, ImageDraw
S='public/assets/src/'; O='public/assets/logos/'
def circ(img,cx,cy,r,name,out=O):
    im=Image.open(S+img).convert('RGB').crop((cx-r,cy-r,cx+r,cy+r)).resize((r*8,r*8),Image.LANCZOS)
    m=Image.new('L',im.size,0);ImageDraw.Draw(m).ellipse((0,0,im.size[0]-1,im.size[1]-1),fill=255)
    im.putalpha(m);im.save(out+name+'.png')
L=117;r=31
for n,y in [('mbka',272),('pnp',344),('supa',417),('pkpp',490),('im',562),('msp',718),('paip',790),('iium',862),('mbkb',934),('picklenp',1006),('pasfa',1078)]:
    circ('minggu1.jpg',L,y,r,n)
def box(img,b,name):
    Image.open(S+img).convert('RGB').crop(b).save(O+name+'.png')
box('minggu1.jpg',(26,8,126,106),'kuantan'); box('minggu1.jpg',(919,8,1019,106),'kesumba')
box('minggu1.jpg',(83,1193,222,1253),'tpx'); box('minggu1.jpg',(313,1193,492,1253),'yap')
box('minggu1.jpg',(557,1195,747,1252),'kospek'); box('minggu1.jpg',(797,1197,987,1252),'alliance')
# contact sheet
import glob
fs=sorted(glob.glob(O+'*.png'));W=Image.new('RGB',(1300,520),(40,40,60));x=y=0
for f in fs:
    i=Image.open(f).convert('RGBA');i.thumbnail((200,200));W.paste(i,(x,y),i);x+=210
    if x>1100:x=0;y+=210
W.save('/tmp/claude-0/-home-user-projek-pertama/ddac325c-6810-595c-b0b7-b42962e59cab/scratchpad/sheet.png')
