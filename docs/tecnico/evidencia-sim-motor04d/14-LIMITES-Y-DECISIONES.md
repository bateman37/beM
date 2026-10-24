# SIM-MOTOR-04D · límites, métricas fuera de banda y decisiones pendientes

**Estado**: ejecutado, pendiente de Dennis. Nada de lo que sigue está «calibrado», «estadísticamente equivalente», «aceptado por Dennis», «conforme FIBA integralmente» ni constituye un «motor cerrado».

## 1. Resultado de la búsqueda (solo DEV conocido; reglas congeladas antes)
ningún vector admisible; se conserva el control.

Control Z0-A0 (= vector de 04C con los mecanismos nuevos neutrales): M04D_comparable 4.788 (dominante ast_fg); M04D completo 6.405 (**no evaluable** por la discrepancia de criterio de rebote, ver §3). **M04D > 1 implica que alguna banda sigue incumplida.**

Mejores descartados (causa exacta en 11-SELECCION-DEV.json):
- Z8-A2 (M04D_comparable 2.160, dominante inside_share; descartado: guardas: fga,three_pct,inside_share)
- Z8-A3 (M04D_comparable 2.166, dominante inside_share; descartado: guardas: fga,three_pct,ft_pct,inside_share)
- Z5-A3 (M04D_comparable 2.215, dominante fg3a; descartado: guardas: fga,inside_pct,inside_share)
- Z6-A2 (M04D_comparable 2.373, dominante tov; descartado: guardas: ft_pct,mid_pct,inside_share)
- Z1-A3 (M04D_comparable 2.384, dominante ast_ft; descartado: guardas: pf,pfd,three_pct,inside_pct,inside_share)

## 2. Bandas incumplidas
DEV (48 casos, control): pts (5.89 % frente a ±5 %); fgm (6.25 % frente a ±5 %); fg2m (11.26 % frente a ±5 %); fg3m (7.91 % frente a ±5 %); fg3a (16.26 % frente a ±5 %); ftm (13.44 % frente a ±5 %); fta (12.17 % frente a ±5 %); oreb (23.08 % frente a ±5 %); dreb (32.02 % frente a ±5 %); reb (29.39 % frente a ±5 %); ast_fg (23.94 % frente a ±5 %); ast_ft (17.58 % frente a ±5 %); ast_total (23.32 % frente a ±5 %); tov (22.12 % frente a ±5 %); stl (11.80 % frente a ±5 %); blk (9.49 % frente a ±5 %); fg_pct (4.72 pp frente a ±3 pp); two_pct (4.50 pp frente a ±3 pp); rim_pct (5.91 pp frente a ±3 pp); rim_share (6.38 pp frente a ±3 pp); mid_share (4.05 pp frente a ±3 pp); three_share (4.42 pp frente a ±3 pp).

VAL04D (96 encuentros, candidata = control): pts (6.04 % frente a ±5 %); fgm (5.44 % frente a ±5 %); fg2m (8.74 % frente a ±5 %); fg3a (7.81 % frente a ±5 %); ftm (15.73 % frente a ±5 %); fta (16.81 % frente a ±5 %); oreb (29.12 % frente a ±5 %); dreb (24.37 % frente a ±5 %); reb (25.68 % frente a ±5 %); ast_fg (21.88 % frente a ±5 %); ast_ft (12.96 % frente a ±5 %); ast_total (21.06 % frente a ±5 %); tov (20.01 % frente a ±5 %); stl (16.23 % frente a ±5 %); blk (22.94 % frente a ±5 %); pf (7.39 % frente a ±5 %); pfd (7.39 % frente a ±5 %); fg_pct (4.45 pp frente a ±3 pp); two_pct (5.49 pp frente a ±3 pp); rim_pct (5.08 pp frente a ±3 pp); mid_pct (4.81 pp frente a ±3 pp); rim_share (3.90 pp frente a ±3 pp); mid_share (3.73 pp frente a ±3 pp).

## 3. Discrepancia de criterio de rebote (D04-02)
En el detallado (`src/match/actions.js::resolveBlocked`) un tapón con balón vivo se resuelve como recuperación de control sin crédito de rebote (ni ofensivo ni defensivo) y un fallo seguido de expiración de posesión tampoco recibe crédito; en SIM todo fallo con oportunidad produce un crédito (incluido el tapón con balón vivo). Ver 08-REBOTES-Y-RECUPERACIONES.csv. La política estadística vigente (c20-p03 §20.13) dice que «el desenlace del balón después del tapón se determina aparte» y no fija un crédito: **no es un defecto normativo demostrado**. No se modificó el detallado ni se redujeron rebotes legítimos de SIM: se conservan ambos conteos, ORB, DREB y rebotes totales quedan **fuera de M04D_comparable** y su criterio queda **pendiente de decisión**.

## 4. Otras limitaciones
- La candidata coincide con el control: ningún vector de §7 mejoró de forma admisible; los ajustes de circulación y terminales mejoran el máximo pero dañan métricas ya dentro de banda (cuota inside, FGA, 3P%…).
- DEV no es una reserva independiente (ya analizada). VAL04D usa fichas y planes naturales; dieciséis actuaciones por equipo no certifican una clasificación.
- La correspondencia inmediata/reinicio del detallado es aproximada (contexto continuidad frente a otro tras el primer rebote ofensivo de la posesión).
- La atribución de familias cambia solo en la lectura (la continuación inmediata es `putback`).
- El rendimiento no cumple los objetivos con 2.000 clubes (ver 12-RENDIMIENTO.json); no se abrió otra optimización.

## 5. Decisiones pendientes (DECISIÓN REQUERIDA)
1. Criterio de crédito de rebote tras tapón con balón vivo y tras expiración: documentar y decidir si el detallado o SIM cambian.
2. Si se acepta el control de 04C (D0_04D ≡ C0_04C en trayectoria) como referencia provisional o se autoriza otra ronda con guardas distintas.
3. Objetivo de rendimiento con miles de clubes.
