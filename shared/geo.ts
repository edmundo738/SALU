/**
 * Divisão político-administrativa de Angola — fonte única.
 *
 * Âmbito desta versão: províncias onde o SALU já pode operar (Luanda e
 * Icolo e Bengo), com municípios e comunas conforme a Lei n.º 14/24 e a
 * reorganização publicada em 2024/2025. As restantes províncias existem na
 * lista para não fingir que Angola tem duas províncias, mas estão marcadas
 * como indisponíveis: não têm municípios inventados.
 *
 * Regra: nunca inferir município por latitude/longitude; a localização é
 * sempre escolhida explicitamente pelo utilizador.
 */

export interface Commune {
  id: string;
  name: string;
}

export interface Municipality {
  id: string;
  name: string;
  communes: Commune[];
}

export interface Province {
  id: string;
  name: string;
  available: boolean;
  municipalities: Municipality[];
}

const c = (province: string, municipality: string, slug: string, name: string): Commune => ({
  id: `${province}-${municipality}-${slug.toUpperCase()}`,
  name,
});

const m = (province: string, slug: string, name: string, communes: Array<[string, string]>): Municipality => ({
  id: `${province}-${slug.toUpperCase()}`,
  name,
  communes: communes.map(([cs, cn]) => c(province, slug.toUpperCase(), cs, cn)),
});

const sede = (province: string, slug: string, name: string): Array<[string, string]> => [['sede', name]];

export const PROVINCES: Province[] = [
  {
    id: 'AO-LUA',
    name: 'Luanda',
    available: true,
    municipalities: [
      m('AO-LUA', 'belas', 'Belas', [
        ['barra-do-cuanza', 'Barra do Cuanza'],
        ['cabolombo', 'Cabolombo'],
        ['ramiros', 'Ramiros'],
        ['benfica', 'Benfica'],
      ]),
      m('AO-LUA', 'cacuaco', 'Cacuaco', [
        ['cacuaco', 'Cacuaco'],
        ['kikolo', 'Kikolo'],
      ]),
      m('AO-LUA', 'cazenga', 'Cazenga', [
        ['cazenga', 'Cazenga'],
        ['kima-kieza', 'Kima Kieza'],
      ]),
      m('AO-LUA', 'viana', 'Viana', sede('AO-LUA', 'viana', 'Viana')),
      m('AO-LUA', 'talatona', 'Talatona', [['talatona', 'Talatona']]),
      m('AO-LUA', 'mussulo', 'Mussulo', sede('AO-LUA', 'mussulo', 'Mussulo')),
      m('AO-LUA', 'sambizanga', 'Sambizanga', sede('AO-LUA', 'sambizanga', 'Sambizanga')),
      m('AO-LUA', 'rangel', 'Rangel', sede('AO-LUA', 'rangel', 'Rangel')),
      m('AO-LUA', 'maianga', 'Maianga', sede('AO-LUA', 'maianga', 'Maianga')),
      m('AO-LUA', 'samba', 'Samba', sede('AO-LUA', 'samba', 'Samba')),
      m('AO-LUA', 'camama', 'Camama', [
        ['camama', 'Camama'],
        ['cidade-universitaria', 'Cidade Universitária'],
      ]),
      m('AO-LUA', 'mulenvos', 'Mulenvos', sede('AO-LUA', 'mulenvos', 'Mulenvos')),
      m('AO-LUA', 'kilamba', 'Kilamba', [
        ['kilamba', 'Kilamba'],
        ['vila-flor', 'Vila Flôr'],
      ]),
      m('AO-LUA', 'hoji-ya-henda', 'Hoji ya Henda', sede('AO-LUA', 'hoji-ya-henda', 'Hoji ya Henda')),
      m('AO-LUA', 'ingombota', 'Ingombota', sede('AO-LUA', 'ingombota', 'Ingombota')),
      m('AO-LUA', 'kilamba-kiaxi', 'Kilamba Kiaxi', [
        ['golfe', 'Golfe'],
        ['nova-vida', 'Nova Vida'],
      ]),
    ],
  },
  {
    id: 'AO-ICB',
    name: 'Icolo e Bengo',
    available: true,
    municipalities: [
      m('AO-ICB', 'catete', 'Catete', [
        ['catete', 'Catete'],
        ['cassoneca', 'Cassoneca'],
        ['caculo-cahango', 'Caculo Cahango'],
        ['caxicane', 'Caxicane'],
      ]),
      m('AO-ICB', 'quicama', 'Quiçama', [
        ['muxima', 'Muxima'],
        ['quixinge', 'Quixinge'],
        ['demba-chio', 'Demba Chio'],
        ['mumbondo', 'Mumbondo'],
      ]),
      m('AO-ICB', 'sequele', 'Sequele', [
        ['funda', 'Funda'],
        ['quifangondo', 'Quifangondo'],
        ['sequele', 'Sequele'],
      ]),
      m('AO-ICB', 'calumbo', 'Calumbo', sede('AO-ICB', 'calumbo', 'Calumbo')),
      m('AO-ICB', 'cabiri', 'Cabiri', sede('AO-ICB', 'cabiri', 'Cabiri')),
      m('AO-ICB', 'cabo-ledo', 'Cabo Ledo', sede('AO-ICB', 'cabo-ledo', 'Cabo Ledo')),
      m('AO-ICB', 'bom-jesus', 'Bom Jesus', sede('AO-ICB', 'bom-jesus', 'Bom Jesus')),
    ],
  },
  // Províncias reconhecidas, ainda sem operação. Não inventamos municípios.
  ...(
    [
      ['AO-BGO', 'Bengo'],
      ['AO-BGU', 'Benguela'],
      ['AO-BIE', 'Bié'],
      ['AO-CAB', 'Cabinda'],
      ['AO-CNN', 'Cunene'],
      ['AO-CUS', 'Cuanza Sul'],
      ['AO-CNO', 'Cuanza Norte'],
      ['AO-CCU', 'Cuando Cubango'],
      ['AO-HUA', 'Huambo'],
      ['AO-HUI', 'Huíla'],
      ['AO-LNO', 'Lunda Norte'],
      ['AO-LSU', 'Lunda Sul'],
      ['AO-MAL', 'Malanje'],
      ['AO-MOX', 'Moxico'],
      ['AO-NAM', 'Namibe'],
      ['AO-UIG', 'Uíge'],
      ['AO-ZAI', 'Zaire'],
      ['AO-CUB', 'Cubango'],
      ['AO-MOXE', 'Moxico Leste'],
    ] as Array<[string, string]>
  ).map(([id, name]) => ({ id, name, available: false, municipalities: [] })),
];

export const AVAILABLE_PROVINCES = PROVINCES.filter((p) => p.available);

export function getProvince(provinceId: string): Province | undefined {
  return PROVINCES.find((p) => p.id === provinceId);
}

export function getMunicipality(provinceId: string, municipalityId: string): Municipality | undefined {
  return getProvince(provinceId)?.municipalities.find((m) => m.id === municipalityId);
}

export function getCommune(provinceId: string, municipalityId: string, communeId: string): Commune | undefined {
  return getMunicipality(provinceId, municipalityId)?.communes.find((c) => c.id === communeId);
}

export function locationLabel(
  provinceId?: string | null,
  municipalityId?: string | null,
  communeId?: string | null,
): string {
  const province = provinceId ? getProvince(provinceId) : undefined;
  const municipality = provinceId && municipalityId ? getMunicipality(provinceId, municipalityId) : undefined;
  const commune =
    provinceId && municipalityId && communeId ? getCommune(provinceId, municipalityId, communeId) : undefined;
  const parts: string[] = [];
  if (commune?.name) parts.push(commune.name);
  if (municipality?.name && municipality.name !== commune?.name) parts.push(municipality.name);
  if (province?.name) parts.push(province.name);
  return parts.join(', ');
}

export function isValidLocation(provinceId: unknown, municipalityId: unknown, communeId: unknown): boolean {
  if (typeof provinceId !== 'string' || typeof municipalityId !== 'string' || typeof communeId !== 'string') {
    return false;
  }
  return Boolean(getCommune(provinceId, municipalityId, communeId));
}
