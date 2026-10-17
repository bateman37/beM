// Filas del diccionario para SEM-MOTOR11 (POB02 generación correlacionada y POB03 tendencias). Mismo contrato que rows.js. Son parámetros que CONSTRUYEN entradas
// del escenario (centros, factores, residuos y límites de la población ficticia): NO son multiplicadores deportivos, no se aplican al resolver tareas del partido y
// no tocan el azar deportivo. `optional`: un perfil anterior sin la tabla `generator` sigue siendo completo y reproducible; la población usa entonces la receta de la base
// de MOTOR-11 y lo identifica. Los planes naturales, las fichas y los escenarios (`population.*`, `lab.*`, `generator.groups`) son contenido declarativo y no filas.
const EXT = 'SEM-MOTOR11';
const A = { cls: 'balance', views: ['poblacion'], ext: EXT, optional: true };
const NOT_SPORT = 'Solo cambia las entradas que el generador construye; una vez materializado un equipo, el partido usa sus valores efectivos congelados y no esta receta.';
const row = (path, type, unit, grp, label, desc, effect = NOT_SPORT) => ({ ...A, path, type, unit, grp, mech: 'population/generator.js', label: () => label, desc: () => desc, effect: () => effect });

const CROSS = [['TEC08', 'G08'], ['TEC10', 'G05'], ['TEC12', 'G05'], ['TEC13', 'G06'], ['TEC15', 'G05'], ['TEC15', 'body'], ['TEC17', 'G06'], ['TEC18', 'G05'], ['TEC18', 'body'], ['FIS04', 'body'], ['FIS01', 'body'], ['FIS03', 'body']];
const MM = (path, type, unit, label, desc) => [row(`${path}.min`, type, unit, 'POB02', `${label} · mínimo`, desc), row(`${path}.max`, type, unit, 'POB02', `${label} · máximo`, desc)];

export const MOTOR11_FAMILIES = [
  row('generator.dispersions.contained', 'weight', 'multiplicador d', 'POB02', 'Dispersión contenida', 'Factor d de la dispersión «contenida» (precarga 0,5): escala las perturbaciones de capacidades, cuerpo y tendencias.'),
  row('generator.dispersions.ordinary', 'weight', 'multiplicador d', 'POB02', 'Dispersión ordinaria', 'Factor d de la dispersión «ordinaria» (precarga 1).'),
  row('generator.dispersions.wide', 'weight', 'multiplicador d', 'POB02', 'Dispersión amplia', 'Factor d de la dispersión «amplia» (precarga 1,5).'),
  row('generator.defaultDispersion', 'weight', 'multiplicador d', 'POB02', 'Dispersión por defecto', 'Valor de d que propone la pantalla del generador (precarga 1).'),
  row('generator.coefficients.team', 'weight', 'coeficiente', 'POB02', 'Capacidad generada · coeficiente del factor de equipo T_g', 'Peso del factor común de equipo del grupo en A = clamp(μ + d·[1,0·T + 1,5·Z + 0,75·e + cruce], 1, 30) (precarga 1,0).'),
  row('generator.coefficients.player', 'weight', 'coeficiente', 'POB02', 'Capacidad generada · coeficiente del factor individual Z_g', 'Peso del factor individual del grupo (precarga 1,5). Hace que las capacidades de un mismo grupo se muevan juntas dentro de un jugador.'),
  row('generator.coefficients.residual', 'weight', 'coeficiente', 'POB02', 'Capacidad generada · coeficiente del residuo e_a', 'Peso del residuo independiente de cada capacidad (precarga 0,75).'),
  ...CROSS.map(([ab, g]) => row(`generator.cross.${ab}.${g}`, 'logit', 'coeficiente', 'POB02', `Cruce · ${ab} con ${g === 'body' ? 'el factor corporal Z_cuerpo' : `Z_${g}`}`, `Contribución cruzada que se suma dentro del corchete de la fórmula de ${ab} (no cambia el grupo principal de la capacidad; puede ser negativa).`)),
  row('generator.precision.abilityDecimals', 'count', 'decimales', 'POB02', 'Precisión de la capacidad generada', 'Decimales de la normalización técnica del valor continuo (precarga 3); parte identificada de la versión de la receta, no un redondeo a entero.'),
  row('generator.precision.bodyDecimals', 'count', 'decimales', 'POB02', 'Precisión del cuerpo generado', 'Decimales de altura, peso y envergadura (precarga 1).'),
  row('generator.precision.tendencyDecimals', 'count', 'decimales', 'POB03', 'Precisión de las tendencias generadas', 'Decimales de Iniciativa, vocación y preferencias de zona (precarga 4).'),
  row('generator.body.heightCm.team', 'weight', 'cm por unidad de factor', 'POB02', 'Altura · coeficiente de equipo', 'altura = H_base + d·(2·T_cuerpo + 3·Z_cuerpo + e_altura) cm (precarga 2).'),
  row('generator.body.heightCm.player', 'weight', 'cm por unidad de factor', 'POB02', 'Altura · coeficiente individual', 'Precarga 3.'),
  row('generator.body.heightCm.residual', 'weight', 'cm por unidad de factor', 'POB02', 'Altura · coeficiente del residuo', 'Precarga 1.'),
  row('generator.body.weightKg.team', 'weight', 'kg por unidad de factor', 'POB02', 'Peso · coeficiente de equipo', 'peso = peso_base + d·(1,5·T_cuerpo + 2·Z_cuerpo + 0,75·e_peso) kg (precarga 1,5).', 'Solo cambia el peso generado. El peso no añade Fuerza oculta: los efectos corporales del motor siguen siendo los ya aprobados.'),
  row('generator.body.weightKg.player', 'weight', 'kg por unidad de factor', 'POB02', 'Peso · coeficiente individual', 'Precarga 2.', 'Solo cambia el peso generado; no hay efecto directo adicional.'),
  row('generator.body.weightKg.residual', 'weight', 'kg por unidad de factor', 'POB02', 'Peso · coeficiente del residuo', 'Precarga 0,75.', 'Solo cambia el peso generado; no hay efecto directo adicional.'),
  row('generator.body.wingspanCm.player', 'weight', 'cm por unidad de factor', 'POB02', 'Envergadura · coeficiente individual', 'envergadura = altura + (env_base − H_base) + d·(Z_cuerpo + e_envergadura) cm (precarga 1).'),
  row('generator.body.wingspanCm.residual', 'weight', 'cm por unidad de factor', 'POB02', 'Envergadura · coeficiente del residuo', 'Precarga 1.'),
  ...MM('generator.body.limits.heightCm', 'points', 'cm', 'Límite de altura', 'Intervalo adulto de esta población ficticia de laboratorio (precarga 170–220 cm); coincide con el contrato corporal del perfil.'),
  ...MM('generator.body.limits.weightKg', 'points', 'kg', 'Límite de peso', 'Intervalo de esta población de laboratorio (precarga 55–140 kg), no una afirmación clínica.'),
  ...MM('generator.body.limits.wingspanCm', 'points', 'cm', 'Límite de envergadura', 'Precarga 170–235 cm; coincide con el contrato corporal del perfil.'),
  ...MM('generator.body.limits.wingspanMinusHeightCm', 'logit', 'cm', 'Límite de envergadura − altura', 'Diferencia admitida (precarga −2 a +20 cm); se intersecta con el límite absoluto sin generar un intervalo imposible.'),
  row('generator.age.span', 'count', 'años', 'POB02', 'Edad · amplitud de la perturbación', 'edad = edad_base + floor(amplitud·U) + desplazamiento (precarga 5 con desplazamiento −2: ±2 años).'),
  row('generator.age.offset', 'logit', 'años', 'POB02', 'Edad · desplazamiento', 'Precarga −2.'),
  ...['default', 'EQ07', 'EQ08'].flatMap((k) => MM(`generator.age.bounds.${k}`, 'count', 'años', `Edad generada · ${k === 'default' ? 'resto de identidades' : k}`, 'Intervalo de edad admitido para la identidad base (precarga: EQ08 18–23, EQ07 34–42, resto 18–42). No hay curva de envejecimiento ni potencial.')),
  row('generator.tendencies.initiative', 'weight', 'amplitud', 'POB03', 'Iniciativa generada · amplitud del residuo', 'Iniciativa = clamp(base + amplitud·d·e, 0, 1) (precarga 0,10). Independiente de las capacidades.'),
  row('generator.tendencies.finishingVocation', 'weight', 'amplitud', 'POB03', 'Vocación de finalización generada · amplitud del residuo', 'Vocación = clamp(base + amplitud·d·e, 0, 1) (precarga 0,10).'),
  row('generator.tendencies.zonePreference', 'weight', 'amplitud', 'POB03', 'Preferencia de zona generada · amplitud del residuo', 'A cada componente aro/media/triple se le añade amplitud·d·e, se limita a no negativo y se normaliza a 1 (precarga 0,05).'),
];
// Identificación documental y contenido declarativo (planes materializados, revisiones, grupos del generador, escenarios).
export const MOTOR11_EXEMPT = [
  /^population\./, /^lab\./, /^generator\.(version|datasetVersion|name|provenance|distribution|groups|rng|names|idPattern)(\.|$)/, /^generator\.(body|age)\.note$/,
];
