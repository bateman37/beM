# Contrato de integración del motor (MOTOR-14 §12)

API real en `src/engine/index.js` (módulo, no HTTP). Sin navegador, DOM ni reloj de pared; cada encuentro tiene su azar, memoria, perfil congelado y estado de entrenador.

```js
import { validateEntries, createEncounter, restoreEncounter, readHistory, retargetTeam, buildMatchInput } from './src/engine/index.js';
const v = validateEntries({ input, profile });            // errores localizados, incompatibilidades (instancias), cobertura del perfil; no inventa datos
const e = createEncounter({ input, profile, controlledTeams: [0], detail: 'reduced' });
e.advance({ until: 'possession' });                       // 'step' | 'possession' | 'period' | 'end'
e.requestOrder({ team: 0, type: 'styles', styles: { freedom: 5 } }); // aceptada | pendiente | rechazada + causa; el rival se rechaza (sin autoridad)
e.retirePlayer('EQ01-J03', { cause: 'lesión' });          // indisponibilidad externa: sustitución, vacante o terminación (art. 21)
e.query({ audience: 'own', team: 0 });                    // public | own | diagnostic; sin efectos deportivos
const snap = e.snapshot(); const e2 = restoreEncounter(snap); // continuación real; incompatible/alterado → error con motivo
const r = e.result();   // r.outcome.kind: final_normal | produccion_parcial | adjudicacion_administrativa | fallo_tecnico; definitiveScore null si no hay final
readHistory(r.result, { audience: 'public' });            // lectura sin re-simular
```

- **IN01** plantillas (id estable, capacidades, cuerpo, tendencias, estado inicial incl. `available`), **IN02** `plan` por equipo, **IN03** semilla, importancia y perfil congelado. Los neutrales no se aplican aquí: solo si la entrada los declara.
- Dos copias de un equipo: `retargetTeam(team, 'NUEVO_ID')` crea la instancia (identidad de origen en `source.instance`); `validateEntries` rechaza colisiones.
- Un marcador adjudicado (`outcome.definitiveScore`) y lo producido (`outcome.producedScore`) son datos distintos; un fallo técnico no es una derrota.
- Estados finales = datos de salida (`result.diagnostics.finalEnergy`…); no se copian como iniciales.
- Fuera de alcance: carrera, entrenamiento, mercado, calendario, lesiones aleatorias.
