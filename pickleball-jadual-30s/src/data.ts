export const TEAMS: Record<string, string> = {
  mbka: 'MBK PICKLEFLUX A', mbkb: 'MBK PICKLEFLUX B', im: 'IM THUNDERBOLTS',
  pnp: 'PENDIDIKAN NEGERI PAHANG PICKLEBALL', pkpp: 'PKPP PICKLEBALL CLUB', supa: 'SUPAWARRIORS',
  msp: 'MSP ELEPHANT WARRIOR', pasfa: 'PASFA PICKLE', paip: 'PAIP WATERBLAST',
  iium: 'IIUM KUANTAN', picklenp: 'PICKLENP',
};
type M = [string, string, number]; // [kiri, kanan, jam mlm]
export type Day = {name: string; date: string; m: M[]};
export type Week = {n: number; range: string; color: string; rabu: Day; khamis: Day};
const d = (name: string, date: string, m: M[]): Day => ({name, date, m});
export const WEEKS: Week[] = [
  {n: 1, range: '4 – 5 NOV', color: '#C8FF2B',
    rabu: d('RABU', '4 NOV', [['mbka','im',9],['pnp','pkpp',9],['supa','pnp',10],['pkpp','mbka',10],['im','supa',11]]),
    khamis: d('KHAMIS', '5 NOV', [['msp','pasfa',9],['paip','mbkb',9],['iium','msp',10],['mbkb','picklenp',10],['picklenp','iium',11],['pasfa','paip',11]])},
  {n: 2, range: '11 – 12 NOV', color: '#FFB020',
    rabu: d('RABU', '11 NOV', [['mbka','supa',9],['mbkb','pnp',9],['pnp','pasfa',10],['supa','mbkb',10],['pasfa','mbka',11]]),
    khamis: d('KHAMIS', '12 NOV', [['msp','picklenp',9],['im','iium',9],['paip','msp',10],['iium','pkpp',10],['pkpp','paip',11],['picklenp','im',11]])},
  {n: 3, range: '18 – 19 NOV', color: '#B28CFF',
    rabu: d('RABU', '18 NOV', [['mbka','mbkb',9],['iium','supa',9],['mbkb','iium',10],['supa','paip',10],['paip','mbka',11]]),
    khamis: d('KHAMIS', '19 NOV', [['msp','pkpp',9],['picklenp','pasfa',9],['pnp','msp',10],['pasfa','im',10],['im','pnp',11],['pkpp','picklenp',11]])},
  {n: 4, range: '25 – 26 NOV', color: '#2BFFB0',
    rabu: d('RABU', '25 NOV', [['mbka','picklenp',9],['paip','pnp',9],['picklenp','paip',10],['pnp','iium',10],['iium','mbka',11]]),
    khamis: d('KHAMIS', '26 NOV', [['msp','mbkb',9],['pasfa','supa',9],['im','msp',10],['supa','pkpp',10],['pkpp','im',11],['mbkb','pasfa',11]])},
  {n: 5, range: '2 – 3 DIS', color: '#FF7A3D',
    rabu: d('RABU', '2 DIS', [['msp','mbka',9],['pnp','picklenp',9],['mbka','pnp',10],['picklenp','supa',10],['supa','msp',11]]),
    khamis: d('KHAMIS', '3 DIS', [['mbkb','im',9],['paip','iium',9],['pkpp','mbkb',10],['iium','pasfa',10],['pasfa','pkpp',11],['im','paip',11]])},
];
