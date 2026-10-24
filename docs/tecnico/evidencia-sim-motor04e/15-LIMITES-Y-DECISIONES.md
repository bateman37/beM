# SIM-MOTOR-04E · límites, incumplimientos y decisiones pendientes

## Bandas que siguen fuera (VAL04E, 96 entradas nuevas, 31 métricas)
- **SIM_04E_BASE (recomendada, = S0)**: M 4.380; 17 de 31 bandas fuera. Peores: tov 21.9 %, ast_fg 17.7 %, ast_total 16.6 %, stl 13.2 %, fta 12.9 %, ftm 12.1 %.
- **SIM_04E_EXP (experimental, no recomendada)**: M 5.400; 12 de 31 bandas fuera. Peores: blk 27.0 %, fg3m 17.5 %, stl 12.9 %, rim_share 5.7 pp, three_pct 4.8 pp, fg3a 7.1 %.
- Desarrollo: DEV-A base 6.087 · experimental 1.869; DEV-B base 5.332 · experimental 5.666; conjunto (72) base 5.009 · experimental 1.520.
- Un M parcial no acredita el acta completa. No hay métricas excluidas (con la política común de rebote, ORB/DREB/REB vuelven a ser comparables); ningún denominador ausente en las 31.

## Incertidumbre
Dieciséis actuaciones por equipo en VAL04E (192 por modelo) y 144 en el desarrollo conjunto: ±5 % relativo sobre conteos pequeños (tapones ≈ 2,1–2,7; AST a libres ≈ 1,8–2,0) es del orden del ruido de muestreo. La comparativa incluye por métrica el intervalo de remuestreo (2.000 repeticiones deterministas de partidos completos, ambos equipos juntos, emparejados por entrada) **de la diferencia SIM − DET**; es descriptivo y no cambia el cumplimiento de la banda. Resultado mecánico: la mejora de la experimental sobre DEV-A no generaliza a DEV-B ni a VAL04E (dominante: tapones).

## Decisiones pendientes (DECISIÓN REQUERIDA)
1. Qué hacer con S0 (recomendada por la regla, 17 de 31 bandas fuera en VAL04E) frente a la experimental (mejora la mayoría de métricas en VAL04E pero incumple guardas y empeora triples, 2PA y cuotas aro/inside): aceptar S0 y diseñar otra ronda con guardas distintas, revisar la regla de guardas (S0 tiene ORB al 0,7 % y esa guarda bloquea cualquier mejora global) o ampliar el desarrollo antes de otra búsqueda. No se decide aquí.
2. Criterio de rebote: implementado desde la especificación contrastada por ChatGPT (cap. 4, 5 y 8 del FIBA Statisticians’ Manual 2024; art. 29 y 51); sin lectura directa por Claude Code. No se añadieron faltas de rebote, balones encajados ni violaciones nuevas.
3. Rendimiento a 1.000 partidos (5 s), publicación 1 s y RSS 1,5 GiB: pendientes de medición.

## No ejecutado
Navegadores o versiones de Node adicionales; campaña nueva por atributo; auditoría de las 32 capacidades fuera de las sondas existentes; 3.000 partidos de rendimiento; aceptación manual y deportiva (Dennis).
