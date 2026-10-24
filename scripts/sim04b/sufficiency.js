// SIM-MOTOR-04B · suficiencia de exposición de los contrastes (§6.1). Corrige la evaluación de 04: exigía exposición POSITIVA en ambos lados y calificó como insuficiente el contraste de altura de presión (T03) aunque sus cuatro controles
// normales registraban, con razón, CERO presión adelantada. Ahora cada variante declara su expectativa:
//   · `zero`     el numerador 0 es legítimo (p. ej. altura normal: no hay presión adelantada) SIEMPRE que haya denominador (controles rivales presentes);
//   · `positive` se espera numerador > 0 con denominador > 0 (tratamiento);
//   · numerador `null` = no conservado / no instrumentado (con causa), nunca convertido en 0; sin denominador = no evaluado (con causa).
// Cuatro pares siguen siendo una muestra reducida del efecto medio aunque su exposición sea válida: el veredicto habla de EXPOSICIÓN, no de significación.
export const EXPECTATION = { T03: { V0: 'zero', V1: 'positive' } };
export const expectationOf = (factor, variant) => EXPECTATION[factor]?.[variant] ?? 'positive';

// Estado de UN caso. `row`: { factor, variant, numerator, denominator, cause? }.
export function caseStatus(row) {
  const exp = expectationOf(row.factor, row.variant); const { numerator: n, denominator: d } = row;
  if (n == null) return { status: 'no_conservado', ok: false, expected: exp, cause: row.cause ?? 'la operación no está instrumentada en este registro' };
  if (exp === 'zero') {
    if (!(d > 0)) return { status: 'no_evaluado', ok: false, expected: exp, cause: 'sin controles rivales: el cero no se puede interpretar' };
    return n === 0 ? { status: 'cero_esperado', ok: true, expected: exp } : { status: 'exposicion_inesperada', ok: false, expected: exp, cause: `se esperaba ausencia y hay ${n}` };
  }
  if (d != null && !(d > 0)) return { status: 'no_evaluado', ok: false, expected: exp, cause: 'denominador nulo' };
  return n > 0 ? { status: 'exposicion_positiva', ok: true, expected: exp } : { status: 'sin_exposicion', ok: false, expected: exp, cause: 'el tratamiento no registra la operación que debía exponer' };
}
// Veredicto por factor sobre todos sus casos (ambas variantes y orientaciones).
export function sufficiencyOf(rows, factors) {
  return factors.map((f) => {
    const mine = rows.filter((r) => r.factor === f); const st = mine.map((r) => ({ case_id: r.case_id, variant: r.variant, ...caseStatus(r) }));
    const bad = st.filter((x) => !x.ok); const variants = [...new Set(mine.map((r) => r.variant))].sort();
    return { factor: f, pairs: Math.floor(mine.length / Math.max(1, variants.length)), cases: st.length, ok: st.filter((x) => x.ok).length, expectation: Object.fromEntries(variants.map((v) => [v, expectationOf(f, v)])), verdict: !st.length ? 'no_evaluado: sin casos' : bad.length ? `insuficiente: ${bad.map((x) => `${x.case_id} ${x.status}`).join('; ')}` : 'suficiente (exposición válida; muestra reducida del efecto medio)', statuses: st };
  });
}
