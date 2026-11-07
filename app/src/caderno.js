/* Caderno de Erros: lógica pura (sem DOM e sem chamadas a IA).
   Lê o bloco JSON produzido por qualquer chat, valida, associa à matriz,
   detecta duplicatas, agenda revisões e calcula estatísticas. */
(function (raiz) {
  'use strict';

  var TIPOS_ERRO = [
    'Lacuna de conhecimento', 'Interpretação incorreta do enunciado', 'Dificuldade em diagnóstico',
    'Dificuldade em tratamento', 'Erro em conduta', 'Falha de memorização', 'Desatenção', 'Dificuldade de gestão do tempo'
  ];
  var STATUS_GAB = ['oficial', 'proposto', 'indeterminado'];
  var CAMPOS = ['versao', 'grande_area', 'disciplina', 'assunto', 'subassunto', 'competencia', 'instituicao', 'ano_prova',
    'enunciado', 'alternativas', 'alternativa_marcada', 'alternativa_correta', 'status_gabarito', 'explicacao_resumida',
    'motivo_do_erro', 'explicacao_alternativa_correta', 'analise_das_alternativas', 'conceito_chave', 'dica_de_prova',
    'tipo_de_erro', 'referencias', 'observacoes', 'revisao_recomendada'];
  var TEXTOS = ['grande_area', 'disciplina', 'assunto', 'subassunto', 'competencia', 'instituicao', 'enunciado',
    'explicacao_resumida', 'motivo_do_erro', 'explicacao_alternativa_correta', 'conceito_chave', 'dica_de_prova', 'observacoes'];
  var INTERVALOS_CADERNO = [1, 3, 7, 14, 30, 60, 90];
  var LIMIAR_DUPLICATA = 0.8;
  var INI = 'INICIO_CADERNO_ERROS', FIM = 'FIM_CADERNO_ERROS';

  function norm(s) {
    return String(s === null || s === undefined ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }
  function tokens(s) { return norm(s).split(' ').filter(function (t) { return t.length > 1; }); }
  function jaccard(a, b) {
    var A = {}, B = {}, na = 0, nb = 0, inter = 0;
    tokens(a).forEach(function (t) { if (!A[t]) { A[t] = 1; na++; } });
    tokens(b).forEach(function (t) { if (!B[t]) { B[t] = 1; nb++; } });
    if (!na || !nb) return 0;
    Object.keys(A).forEach(function (t) { if (B[t]) inter++; });
    return inter / (na + nb - inter);
  }
  function somaDias(iso, n) {
    var d = new Date(iso + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  }
  function hojeISO() { return new Date().toLocaleDateString('en-CA'); }

  // Casa um valor com uma lista de opções (exato ou parcial único). Retorna a opção ou null.
  function casar(valor, lista) {
    var n = norm(valor);
    if (!n) return null;
    var exato = lista.filter(function (x) { return norm(x) === n; })[0];
    if (exato) return exato;
    var parc = lista.filter(function (x) { var m = norm(x); return m.indexOf(n) >= 0 || n.indexOf(m) >= 0; });
    return parc.length === 1 ? parc[0] : null;
  }

  function todosAssuntos(M) {
    if (M.assuntos) return M.assuntos; // lista pronta: [{id, areaId, area, disc, ass}]
    var lista = [];
    M.areas.forEach(function (a) {
      a.disciplinas.forEach(function (d) {
        d.assuntos.forEach(function (s) {
          lista.push({ id: a.id + '.' + d.id + '.' + s.id, areaId: a.id, area: a.nome, disc: d.nome, ass: s.nome });
        });
      });
    });
    return lista;
  }

  // Associa grande área, disciplina e assunto à matriz. Retorna o id do assunto ou null (ambíguo ou não encontrado).
  function associarAssunto(reg, M) {
    var cand = todosAssuntos(M);
    if (reg.grande_area) {
      var area = casar(reg.grande_area, M.areas.map(function (a) { return a.nome; }));
      if (area) cand = cand.filter(function (t) { return t.area === area; });
    }
    if (reg.disciplina) {
      var nd = norm(reg.disciplina);
      var dd = cand.filter(function (t) { var m = norm(t.disc); return m === nd || m.indexOf(nd) >= 0 || nd.indexOf(m) >= 0; });
      if (dd.length) cand = dd;
    }
    if (!reg.assunto) return null;
    var na = norm(reg.assunto);
    var exatos = cand.filter(function (t) { return norm(t.ass) === na; });
    if (exatos.length === 1) return exatos[0].id;
    var parc = cand.filter(function (t) { var m = norm(t.ass); return m.indexOf(na) >= 0 || na.indexOf(m) >= 0; });
    return parc.length === 1 ? parc[0].id : null;
  }

  function textoDe(v) {
    if (v === null || v === undefined) return null;
    if (typeof v === 'string') return v;
    if (Array.isArray(v)) return v.map(textoDe).join('\n');
    if (typeof v === 'object') return Object.keys(v).map(function (k) { return k + ': ' + textoDe(v[k]); }).join('\n');
    return String(v);
  }

  function validarRegistro(obj, M) {
    var erros = [], avisos = [];
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
      return { ok: false, erros: ['O conteúdo lido não é um objeto JSON.'], avisos: [], registro: null, assuntoId: null };
    }
    if (obj.versao !== '1.0') erros.push('Campo "versao" deve ser "1.0" (encontrado: ' + JSON.stringify(obj.versao === undefined ? null : obj.versao) + ').');

    var reg = {};
    CAMPOS.forEach(function (k) { reg[k] = obj[k] === undefined ? null : obj[k]; });
    reg.versao = '1.0';

    TEXTOS.forEach(function (k) {
      if (reg[k] !== null && typeof reg[k] !== 'string') erros.push('Campo "' + k + '" deve ser texto ou null.');
    });
    reg.analise_das_alternativas = textoDe(reg.analise_das_alternativas);

    // Enunciado
    if (typeof reg.enunciado !== 'string' || reg.enunciado.trim().length < 15) erros.push('Enunciado ausente ou muito curto. Cole o texto da questão.');

    // Alternativas
    var alts = reg.alternativas;
    var letras = [];
    if (!alts || typeof alts !== 'object' || Array.isArray(alts)) {
      erros.push('Campo "alternativas" deve ser um objeto, por exemplo {"A": "...", "B": "..."}.');
    } else {
      letras = Object.keys(alts);
      if (letras.length < 2) erros.push('Informe ao menos 2 alternativas.');
      letras.forEach(function (l) {
        if (!/^[A-H]$/.test(l)) erros.push('Letra de alternativa inválida: "' + l + '".');
        if (typeof alts[l] !== 'string') erros.push('Texto da alternativa ' + l + ' deve ser string.');
      });
    }

    // Marcada e correta
    var marcada = reg.alternativa_marcada;
    if (marcada === null || marcada === undefined || marcada === '') {
      erros.push('Informe a alternativa que você marcou. Sem isso não há erro a registrar.');
    } else if (letras.indexOf(marcada) < 0) {
      erros.push('Alternativa marcada "' + marcada + '" não existe nas alternativas.');
    }
    var correta = reg.alternativa_correta;
    if (correta !== null && letras.indexOf(correta) < 0) erros.push('Alternativa correta "' + correta + '" não existe nas alternativas.');
    if (STATUS_GAB.indexOf(reg.status_gabarito) < 0) erros.push('status_gabarito deve ser "oficial", "proposto" ou "indeterminado".');
    if (correta === null && (reg.status_gabarito === 'oficial' || reg.status_gabarito === 'proposto')) {
      erros.push('Sem alternativa correta, o status_gabarito deve ser "indeterminado".');
    }
    if (correta === null && reg.status_gabarito === 'indeterminado') avisos.push('Alternativa correta não identificada.');
    if (marcada && correta && marcada === correta) {
      erros.push('A alternativa marcada é a correta: não há erro a registrar. Confira os dados.');
    }

    // Tipos de erro
    var tipos = reg.tipo_de_erro === null ? [] : (Array.isArray(reg.tipo_de_erro) ? reg.tipo_de_erro : [reg.tipo_de_erro]);
    var tiposOk = [];
    tipos.forEach(function (t) {
      var c = casar(t, TIPOS_ERRO);
      if (c) tiposOk.push(c); else erros.push('Tipo de erro não reconhecido: "' + t + '".');
    });
    if (!tiposOk.length) avisos.push('Nenhum tipo de erro informado. Escolha na prévia.');
    reg.tipo_de_erro = tiposOk;

    // Classificações com correção sugerida (não bloqueiam)
    var areaNome = reg.grande_area ? casar(reg.grande_area, M.areas.map(function (a) { return a.nome; })) : null;
    if (reg.grande_area && !areaNome) avisos.push('Grande área não reconhecida: "' + reg.grande_area + '".');
    reg.grande_area = areaNome;
    var comp = reg.competencia ? casar(reg.competencia, M.competencias) : null;
    if (reg.competencia && !comp) avisos.push('Competência não reconhecida: "' + reg.competencia + '". Escolha na prévia.');
    reg.competencia = comp;

    if (reg.ano_prova !== null) {
      var ano = Number(reg.ano_prova);
      if (!Number.isInteger(ano) || ano < 1990 || ano > 2100) { avisos.push('Ano da prova inválido; campo deixado vazio.'); reg.ano_prova = null; } else reg.ano_prova = ano;
    }
    if (reg.referencias !== null) {
      if (typeof reg.referencias === 'string') reg.referencias = [reg.referencias];
      if (!Array.isArray(reg.referencias) || reg.referencias.some(function (r) { return typeof r !== 'string'; })) {
        erros.push('Campo "referencias" deve ser uma lista de textos.');
      }
    }
    if (typeof reg.revisao_recomendada !== 'boolean') reg.revisao_recomendada = null;

    var assuntoId = associarAssunto(reg, M);
    if (!assuntoId) avisos.push('Assunto não associado automaticamente à matriz. Escolha na prévia.');

    return { ok: erros.length === 0, erros: erros, avisos: avisos, registro: reg, assuntoId: assuntoId };
  }

  function extrairBloco(texto) {
    var i = texto.indexOf(INI), f = texto.indexOf(FIM);
    if (i < 0 || f < 0 || f < i) return { erro: 'Não encontrei os marcadores INICIO_CADERNO_ERROS e FIM_CADERNO_ERROS. Copie o bloco completo que o chat gerou, incluindo os dois marcadores.' };
    var miolo = texto.slice(i + INI.length, f).replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
    return { bloco: miolo, multiplos: texto.split(INI).length > 2 };
  }

  // Ponto de entrada: texto colado -> resultado validado (sem salvar).
  function interpretarResposta(texto, M) {
    var t = String(texto || '');
    if (!t.trim()) return { ok: false, erros: ['Cole a resposta do chat antes de importar.'], avisos: [], registro: null, assuntoId: null };
    var b = extrairBloco(t);
    if (b.erro) return { ok: false, erros: [b.erro], avisos: [], registro: null, assuntoId: null };
    var obj;
    try { obj = JSON.parse(b.bloco); }
    catch (e) {
      return { ok: false, erros: ['O JSON está inválido (' + e.message + '). Pode faltar vírgula, aspas ou chave. Use "Copiar prompt para organizar questão já corrigida" e peça o formato de novo.'], avisos: [], registro: null, assuntoId: null };
    }
    if (Array.isArray(obj) && obj.length === 1) obj = obj[0];
    var r = validarRegistro(obj, M);
    if (b.multiplos) r.avisos.unshift('Há mais de um bloco na resposta. Só o primeiro foi lido.');
    return r;
  }

  // Chave de semelhança: enunciado normalizado.
  function semelhantes(caderno, enunciado, ignorarId) {
    var out = [];
    caderno.forEach(function (it) {
      if (it.ativo === false || it.id === ignorarId) return;
      var e = it.registro.enunciado || '';
      var score = norm(e) === norm(enunciado) ? 1 : jaccard(e, enunciado);
      if (score >= LIMIAR_DUPLICATA) out.push({ item: it, score: Math.round(score * 100) });
    });
    return out.sort(function (a, b) { return b.score - a.score; });
  }

  function novoItem(reg, assuntoId, origem, agora) {
    var hoje = hojeISO();
    return {
      id: (raiz.crypto && raiz.crypto.randomUUID) ? raiz.crypto.randomUUID() : 'c' + Date.now() + Math.random().toString(16).slice(2),
      ativo: true, criadoEm: agora || new Date().toISOString(), atualizadoEm: agora || new Date().toISOString(),
      origem: origem, assuntoId: assuntoId || null, registro: reg,
      tentativas: [{ data: hoje, origem: origem, marcada: reg.alternativa_marcada }],
      revisoes: [], alteracoes: [], estagio: 0, proximaRevisao: hoje
    };
  }

  // Nova tentativa da mesma questão: não cria um erro novo.
  function registrarTentativa(item, marcada, origem) {
    var hoje = hojeISO();
    item.tentativas.push({ data: hoje, origem: origem, marcada: marcada });
    if (marcada !== item.registro.alternativa_correta && item.registro.alternativa_correta) {
      item.estagio = Math.max(0, item.estagio - 1);
      if (item.proximaRevisao > somaDias(hoje, 1)) item.proximaRevisao = somaDias(hoje, 1);
    }
    return item;
  }

  function agendarRevisao(item, res, cfg) {
    var iv = cfg.intervalosCaderno || INTERVALOS_CADERNO;
    var max = iv.length - 1, est = item.estagio, dias, motivo;
    if (!res.acertou) {
      est = Math.max(0, est - 1); dias = 1;
      motivo = 'Errou na revisão: volta amanhã e o intervalo diminui.';
    } else if (res.duvida) {
      dias = Math.min(iv[est], 3);
      motivo = 'Acertou com dúvida: nova revisão em no máximo 3 dias.';
    } else {
      est = Math.min(max, est + 1); dias = iv[est];
      motivo = 'Acertou sem dúvida: intervalo ampliado. A questão continua no caderno.';
    }
    item.estagio = est;
    item.proximaRevisao = somaDias(hojeISO(), dias);
    item.revisoes.push({ data: hojeISO(), acertou: !!res.acertou, duvida: !!res.duvida, proximaRevisao: item.proximaRevisao, motivo: motivo });
    return { proximaRevisao: item.proximaRevisao, motivo: motivo };
  }

  function diasDesde(iso) { return Math.floor((Date.now() - Date.parse(iso)) / 864e5); }

  function estatisticas(caderno, sessoes, M, filtro) {
    filtro = filtro || {};
    var hoje = hojeISO();
    var tp = {};
    todosAssuntos(M).forEach(function (t) { tp[t.id] = t; });
    var itens = caderno.filter(function (i) {
      if (i.ativo === false) return false;
      if (filtro.dias && diasDesde(i.criadoEm) > filtro.dias) return false;
      if (filtro.area && (i.assuntoId ? tp[i.assuntoId].areaId : null) !== filtro.area) return false;
      return true;
    });
    function contar(fn) {
      var m = {};
      itens.forEach(function (i) {
        var chaves = fn(i);
        (Array.isArray(chaves) ? chaves : [chaves]).forEach(function (k) { if (k) m[k] = (m[k] || 0) + 1; });
      });
      return Object.keys(m).map(function (k) { return { nome: k, total: m[k] }; }).sort(function (a, b) { return b.total - a.total; });
    }
    var porArea = contar(function (i) { return i.assuntoId ? tp[i.assuntoId].area : i.registro.grande_area; });
    var porDisc = contar(function (i) { return i.registro.disciplina || (i.assuntoId ? tp[i.assuntoId].disc : null); });
    var porAss = contar(function (i) { return i.assuntoId ? tp[i.assuntoId].ass : i.registro.assunto; });
    var porSub = contar(function (i) { return i.registro.subassunto; });
    var porComp = contar(function (i) { return i.registro.competencia; });
    var porTipo = contar(function (i) { return i.registro.tipo_de_erro; });
    var porMes = contar(function (i) { return i.criadoEm.slice(0, 7); }).sort(function (a, b) { return a.nome < b.nome ? -1 : 1; });

    // Percentual de erro por assunto, só quando há questões respondidas no mesmo assunto.
    var topAss = porAss.map(function (x) {
      var item = itens.filter(function (i) { return (i.assuntoId ? tp[i.assuntoId].ass : i.registro.assunto) === x.nome; })[0];
      var id = item && item.assuntoId;
      var resp = id ? sessoes.filter(function (s) { return s.topico === id; }).reduce(function (a, s) { return a + s.total; }, 0) : 0;
      return {
        nome: x.nome, erros: x.total,
        respondidas: resp,
        percentualErro: resp >= x.total && resp > 0 ? Math.round((x.total / resp) * 1000) / 10 : null,
        amostraPequena: x.total < 5
      };
    });

    // Evolução das revisões (por mês da revisão).
    var rev = {};
    itens.forEach(function (i) {
      i.revisoes.forEach(function (r) {
        var m = r.data.slice(0, 7);
        rev[m] = rev[m] || { total: 0, acertos: 0 };
        rev[m].total++;
        if (r.acertou) rev[m].acertos++;
      });
    });
    var evolucao = Object.keys(rev).sort().map(function (m) {
      return { mes: m, total: rev[m].total, acertos: rev[m].acertos, percentual: Math.round((rev[m].acertos / rev[m].total) * 1000) / 10 };
    });

    var tentativas = itens.reduce(function (a, i) { return a + i.tentativas.length; }, 0);
    var revisadas = itens.filter(function (i) { return i.revisoes.length > 0; }).length;
    var vencidas = itens.filter(function (i) { return i.proximaRevisao && i.proximaRevisao < hoje; }).length;
    var recorrentes = itens.filter(function (i) {
      var errosRev = i.revisoes.filter(function (r) { return !r.acertou; }).length;
      return i.tentativas.length >= 2 || errosRev >= 2;
    }).length;

    var frases = [];
    if (porArea.length) {
      var top = porArea[0];
      var partes = porDisc.slice(0, 3).map(function (d) { return d.total + ' em ' + d.nome; });
      if (partes.length) {
        var rotulo = top.total === 1 ? 'Entre o 1 erro registrado' : 'Entre os ' + top.total + ' erros registrados';
        frases.push(rotulo + ' em ' + top.nome + ', ' + partes.join(', ') + '.');
      }
    }
    return {
      total: itens.length, tentativas: tentativas, revisadas: revisadas, pendentes: itens.length - revisadas, vencidas: vencidas, recorrentes: recorrentes,
      porArea: porArea, porDisciplina: porDisc, porAssunto: porAss, porSubassunto: porSub, porCompetencia: porComp, porTipo: porTipo,
      porMes: porMes, topAssuntos: topAss.slice(0, 10), evolucaoRevisoes: evolucao, frases: frases, itens: itens
    };
  }

  // Textos dos prompts copiáveis.
  var PROMPT_ANALISE = [
    'Você é um professor especialista em preparação para provas de residência médica de acesso direto no Brasil.',
    'Vou enviar uma questão em imagem, print ou texto.',
    'Quero que você a interprete e produza uma correção comentada, tecnicamente rigorosa, adequada a uma estudante de Medicina em preparação para ENARE/ENAMED e processos seletivos de residência médica.',
    '',
    'Sua tarefa é:',
    '1. Transcrever corretamente o enunciado e as alternativas, quando legíveis.',
    '2. Identificar a grande área, disciplina, assunto e subassunto.',
    '3. Identificar a competência avaliada: diagnóstico, tratamento, conduta, fisiopatologia, prevenção ou outra.',
    '4. Identificar a alternativa que eu marquei, se eu informar.',
    '5. Identificar o gabarito oficial, caso seja fornecido.',
    '6. Explicar a alternativa correta.',
    '7. Explicar por que a alternativa que marquei estava incorreta.',
    '8. Analisar as outras alternativas, quando pertinente.',
    '9. Explicar o conceito fundamental necessário para compreender o erro.',
    '10. Indicar uma dica objetiva para evitar erros semelhantes.',
    '11. Verificar possíveis mudanças de recomendações ou diretrizes, somente quando tiver acesso a fontes confiáveis.',
    '12. Gerar um registro estruturado para meu Caderno de Erros.',
    '',
    'REGRAS IMPORTANTES:',
    '- Não invente trechos ilegíveis.',
    '- Não invente gabaritos ou referências.',
    '- Se o gabarito não estiver disponível, diferencie claramente a resposta sugerida pela IA do gabarito oficial.',
    '- Se houver divergência ou ambiguidade, indique.',
    '- Não presuma que minha alternativa estava incorreta sem conhecer a resposta escolhida e a correção.',
    '- Não alegue atualização de diretrizes sem evidência verificável.',
    '- Evite explicações excessivamente longas, mas preserve o raciocínio clínico essencial.',
    '- Faça uma análise didática para estudo e revisão futura.',
    '',
    'No final, gere um bloco JSON válido, sem comentários dentro do JSON, delimitado pelos marcadores:',
    'INICIO_CADERNO_ERROS',
    'FIM_CADERNO_ERROS',
    'O JSON deverá conter os seguintes campos: versao ("1.0"), grande_area, disciplina, assunto, subassunto, competencia, instituicao, ano_prova, enunciado, alternativas (objeto com letras como chaves), alternativa_marcada, alternativa_correta, status_gabarito ("oficial", "proposto" ou "indeterminado"), explicacao_resumida, motivo_do_erro, explicacao_alternativa_correta, analise_das_alternativas, conceito_chave, dica_de_prova, tipo_de_erro (lista), referencias (lista), observacoes, revisao_recomendada.',
    'Para campos não identificáveis, utilize null. Não invente dados para completar o JSON.',
    'Antes do bloco estruturado, você poderá apresentar uma explicação didática.'
  ].join('\n');

  var PROMPT_CONVERTER = [
    'Analise a conversa anterior sobre a questão de residência médica que acabamos de corrigir.',
    'Quero que você transforme a análise realizada em um registro estruturado para meu Caderno de Erros.',
    'Identifique o enunciado, as alternativas, a resposta que marquei, o gabarito, o motivo do erro, a explicação correta, a grande área, a disciplina, o assunto, o subassunto e a competência clínica avaliada.',
    'Produza o mesmo JSON do formato CADERNO_ERROS versão 1.0, seguindo o esquema de campos do meu prompt de análise, entre os marcadores INICIO_CADERNO_ERROS e FIM_CADERNO_ERROS.',
    'Use exatamente estes campos: versao ("1.0"), grande_area, disciplina, assunto, subassunto, competencia, instituicao, ano_prova, enunciado, alternativas (objeto com letras como chaves), alternativa_marcada, alternativa_correta, status_gabarito ("oficial", "proposto" ou "indeterminado"), explicacao_resumida, motivo_do_erro, explicacao_alternativa_correta, analise_das_alternativas, conceito_chave, dica_de_prova, tipo_de_erro (lista de: Lacuna de conhecimento; Interpretação incorreta do enunciado; Dificuldade em diagnóstico; Dificuldade em tratamento; Erro em conduta; Falha de memorização; Desatenção; Dificuldade de gestão do tempo), referencias (lista), observacoes, revisao_recomendada (true ou false).',
    'Não invente informações ausentes. Utilize null quando necessário. O resultado deverá ser importável automaticamente.'
  ].join('\n');

  var API = {
    TIPOS_ERRO: TIPOS_ERRO, STATUS_GAB: STATUS_GAB, CAMPOS: CAMPOS, INTERVALOS_CADERNO: INTERVALOS_CADERNO,
    PROMPT_ANALISE: PROMPT_ANALISE, PROMPT_CONVERTER: PROMPT_CONVERTER,
    norm: norm, jaccard: jaccard, validarRegistro: validarRegistro, interpretarResposta: interpretarResposta,
    associarAssunto: associarAssunto, semelhantes: semelhantes, novoItem: novoItem, registrarTentativa: registrarTentativa,
    agendarRevisao: agendarRevisao, estatisticas: estatisticas, extrairBloco: extrairBloco, LIMIAR_DUPLICATA: LIMIAR_DUPLICATA
  };
  raiz.CadernoNucleo = API;
})(typeof globalThis !== 'undefined' ? globalThis : this);
