const DISPOSITIVOS_VALIDOS = ["mobile", "desktop", "tablet"];
const SISTEMAS_VALIDOS = ["android", "ios", "windows", "macos", "linux", "outro"];
const REGRAS_ACESSO_VALIDAS = ["qualquer", "primeiro_acesso", "recorrente"];
const HORARIO_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function arrayValido(valor, listaPermitida) {
  if (!Array.isArray(valor)) return false;
  if (valor.length === 0) return true;
  return valor.every((v) => listaPermitida.includes(v));
}

// Valida os campos de agendamento/segmentacao de uma campanha vindos do body do PUT.
// Campos ausentes (undefined) sao ignorados (nao mexem na regra atual);
// null explicito limpa a regra; valor invalido retorna { erro }.
function validarRegras(body) {
  const {
    data_inicio, data_fim, horario_inicio, horario_fim,
    dias_semana, dispositivos, sistemas_operacionais, mikrotiks_permitidos,
    regra_acesso,
  } = body;

  if (data_inicio !== undefined && data_fim !== undefined && data_inicio && data_fim) {
    if (new Date(data_fim) < new Date(data_inicio)) {
      return { erro: "A data final deve ser igual ou posterior à data inicial." };
    }
  }

  const horarioInicioInformado = horario_inicio !== undefined && horario_inicio !== null && horario_inicio !== "";
  const horarioFimInformado = horario_fim !== undefined && horario_fim !== null && horario_fim !== "";
  if (horarioInicioInformado !== horarioFimInformado) {
    return { erro: "Informe o horário inicial e o horário final juntos, ou deixe os dois em branco." };
  }
  if (horarioInicioInformado && !HORARIO_RE.test(horario_inicio)) {
    return { erro: "Horário inicial inválido. Use o formato HH:MM." };
  }
  if (horarioFimInformado && !HORARIO_RE.test(horario_fim)) {
    return { erro: "Horário final inválido. Use o formato HH:MM." };
  }

  if (dias_semana !== undefined && dias_semana !== null) {
    if (!Array.isArray(dias_semana) || !dias_semana.every((d) => Number.isInteger(d) && d >= 0 && d <= 6)) {
      return { erro: "Dias da semana inválidos. Use números de 0 (domingo) a 6 (sábado)." };
    }
    if (new Set(dias_semana).size !== dias_semana.length) {
      return { erro: "Dias da semana não podem se repetir." };
    }
  }

  if (dispositivos !== undefined && dispositivos !== null && !arrayValido(dispositivos, DISPOSITIVOS_VALIDOS)) {
    return { erro: `Dispositivos inválidos. Use uma combinação de: ${DISPOSITIVOS_VALIDOS.join(", ")}.` };
  }

  if (sistemas_operacionais !== undefined && sistemas_operacionais !== null && !arrayValido(sistemas_operacionais, SISTEMAS_VALIDOS)) {
    return { erro: `Sistemas operacionais inválidos. Use uma combinação de: ${SISTEMAS_VALIDOS.join(", ")}.` };
  }

  if (mikrotiks_permitidos !== undefined && mikrotiks_permitidos !== null) {
    if (!Array.isArray(mikrotiks_permitidos) || !mikrotiks_permitidos.every((id) => Number.isInteger(id) && id > 0)) {
      return { erro: "Lista de hotspots inválida." };
    }
  }

  if (regra_acesso !== undefined && regra_acesso !== null && !REGRAS_ACESSO_VALIDAS.includes(regra_acesso)) {
    return { erro: `Regra de acesso inválida. Use uma de: ${REGRAS_ACESSO_VALIDAS.join(", ")}.` };
  }

  return { erro: null };
}

module.exports = { validarRegras, DISPOSITIVOS_VALIDOS, SISTEMAS_VALIDOS, REGRAS_ACESSO_VALIDAS };
