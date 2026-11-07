// Validate before replacing any live state. Accept legacy backups with optional fields.
export function parseBackup(text) {
  const data = JSON.parse(text);
  const state = data?.S;
  const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const date = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value));
  if (!object(state) || !Array.isArray(state.topics) || !Array.isArray(state.plan) || !state.plan.length || !date(state.start)) throw new Error('Plano inválido');
  if (!state.topics.every(t => object(t) && typeof t.id === 'string' && typeof t.n === 'string' && object(t.ck)) ||
      !state.plan.every(w => object(w) && typeof w.k === 'string')) throw new Error('Temas ou semanas inválidos');
  for (const key of ['imgs', 'sims', 'caderno', 'logMonths']) {
    if (state[key] !== undefined && !Array.isArray(state[key])) throw new Error('Lista inválida: ' + key);
  }
  const logs = data.LOGS ?? [];
  if (!Array.isArray(logs) || !logs.every(l => object(l) && date(l.d) && Number.isInteger(l.t) && l.t > 0 && Number.isInteger(l.c) && l.c >= 0 && l.c <= l.t)) throw new Error('Questões inválidas');
  if (state.imgs && !state.imgs.every(m => object(m) && typeof m.id === 'string')) throw new Error('Imagens inválidas');
  if (data.IMGS !== undefined && (!object(data.IMGS) || !Object.values(data.IMGS).every(d => typeof d === 'string' && /^data:image\//.test(d)))) throw new Error('Conteúdo das imagens inválido');
  return { ...data, LOGS: logs };
}
