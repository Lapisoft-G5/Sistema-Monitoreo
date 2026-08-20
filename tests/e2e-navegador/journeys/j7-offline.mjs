// J7 — El especialista llena y finaliza una ficha SIN CONEXIÓN. La ficha queda en
// la cola de envío (la visita NO cambia en el servidor); al reconectar, la cola se
// drena sola y recién ahí la visita pasa a COMPLETADO y nace la ficha.
//
// Demuestra el ciclo offline completo de la Fase 3 contra el stack real:
//   llenar offline → encolar → reconectar → sincronizar.
import { chromium } from 'playwright-core';
import { chromiumPath, OUT, WEB, loginWeb, prepararUsuario, sql } from '../lib.mjs';

export async function run() {
  const buscar = () => sql(
    `SELECT c.id||'|'||pe.dni||'|'||pd.nombres FROM cronogramas c
     JOIN especialistas e ON e.id=c.monitor_id JOIN personas pe ON pe.id=e.persona_id
     JOIN docentes d ON d.id=c.evaluado_id JOIN personas pd ON pd.id=d.persona_id
     WHERE c.estado='EN_PROCESO' LIMIT 1`,
  );
  let fila = buscar();
  // La suite comparte visitas: J3 puede haber consumido la única EN_PROCESO. Si no
  // queda ninguna, se promueve una PROGRAMADA a EN_PROCESO y se le asigna como
  // monitor a un especialista con acceso real al calendario (el director de UGEL
  // ya no monitorea, así que no sirve). El especialista 40000002 de la seed sí lo
  // tiene; con eso se puede abrir "Continuar Monitoreo" (la ficha nace al finalizar).
  if (!fila) {
    const monitorId = sql(
      `SELECT e.id FROM especialistas e JOIN personas p ON p.id=e.persona_id WHERE p.dni='40000002'`,
    );
    if (monitorId) {
      sql(
        `UPDATE cronogramas SET estado='EN_PROCESO', monitor_id='${monitorId}' WHERE id=(
           SELECT id FROM cronogramas WHERE estado='PROGRAMADO' AND evaluado_id IS NOT NULL LIMIT 1)`,
      );
      fila = buscar();
    }
  }
  if (!fila) { console.log('RESULT J7-offline SKIP sin visita monitoreable en la base'); return true; }
  const [visitaId, monitorDni, docenteNombre] = fila.split('|');
  const fichasAntes = Number(sql('SELECT count(*) FROM fichas_monitoreo'));

  const browser = await chromium.launch({ headless: true, executablePath: chromiumPath() });
  const context = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
  const page = await context.newPage();
  let estadoConCola = '?';
  try {
    await prepararUsuario(monitorDni); // idempotente: pasa el primer-login a la contraseña definitiva.
    await loginWeb(page, monitorDni);
    await page.goto(WEB + '/monitoreo/calendario', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: /^Lista$/ }).click();
    await page.waitForTimeout(1200);
    // Se elige por el badge de estado (hay exactamente una EN_PROCESO), no por el
    // nombre del docente: ese puede repetirse en visitas ya completadas y abrir la
    // tarjeta equivocada.
    const card = page.getByText('EN_PROCESO', { exact: true }).first()
      .locator('xpath=ancestor::div[.//button[contains(.,"Ver detalles")]][1]');
    await card.getByRole('button', { name: /Ver detalles/i }).click();
    await page.waitForTimeout(800);
    // El formulario se abre ONLINE para que carguen plantilla y estado de la ficha.
    // "Iniciar" si la ficha aún no se empezó; "Continuar" si ya hay borrador.
    await page.getByRole('button', { name: /(Iniciar|Continuar) Monitoreo/i }).click();
    await page.waitForTimeout(1800);

    // A partir de aquí, sin conexión: el llenado es local; el finalizar irá a la cola.
    await context.setOffline(true);

    const fill = async (ph, v) => { const l = page.getByPlaceholder(ph).first(); if (await l.count()) await l.fill(v); };
    await fill(/Ej\. 2/, '2°');
    await fill(/Ej\. A/, 'A');
    const nums = page.locator('input[type="number"], input[placeholder="0"]');
    if (await nums.count()) { await nums.nth(0).fill('20'); if (await nums.count() > 1) await nums.nth(1).fill('1'); }

    const total = await page.getByText(/^Valoración:/).count();
    for (let i = 0; i < total; i++) {
      const item = page.getByText(/^Valoración:/).nth(i).locator('xpath=ancestor::*[self::div or self::button][1]');
      await item.scrollIntoViewIfNeeded();
      await item.click();
      await page.waitForTimeout(500);
      const ok = await page.evaluate(() => {
        const els = [...document.querySelectorAll('span,h3,h4,div')].filter(
          (e) => (e.textContent || '').trim() === 'Nivel III' && e.offsetParent !== null);
        if (!els[0]) return false;
        els[0].scrollIntoView({ block: 'center' }); els[0].click(); return true;
      });
      if (!ok) throw new Error('no se pudo seleccionar Nivel III');
      await page.waitForTimeout(250);
      const obs = page.getByPlaceholder(/observaciones o evidencias/i).first();
      await obs.fill('Se observa un desempeño satisfactorio; el docente evidencia la conducta esperada.');
      await page.waitForTimeout(150);
    }

    const fillTa = async (ph, v) => { const l = page.getByPlaceholder(ph).first(); if (await l.count()) { await l.scrollIntoViewIfNeeded(); await l.fill(v); } };
    await fillTa(/cómo se desarrolló la visita/i, 'La visita se desarrolló con normalidad y apertura al acompañamiento.');
    await fillTa(/aquí las sugerencias/i, 'Continuar fortaleciendo las estrategias de participación activa.');
    await fillTa(/aquí los compromisos/i, 'El docente se compromete a incorporar preguntas de mayor demanda cognitiva.');

    await page.getByRole('button', { name: /Finalizar Monitoreo/i }).click();
    await page.waitForTimeout(1000);
    const conf = page.getByRole('button', { name: /confirmar|sí|aceptar|finalizar/i }).last();
    if (await conf.count()) await conf.click().catch(() => {});
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${OUT}/j7-offline-encolada.png`, fullPage: true }).catch(() => {});

    // Con la ficha en cola pero sin red: el servidor NO debe haberse tocado.
    estadoConCola = sql(`SELECT estado FROM cronogramas WHERE id='${visitaId}'`);

    // Reconectar: la cola debe drenarse sola (evento 'online' → ping → sincronizar).
    await context.setOffline(false);
    // Dar tiempo al ping + a que la sincronización recorra la cola.
    for (let i = 0; i < 20; i++) {
      await page.waitForTimeout(1500);
      if (sql(`SELECT estado FROM cronogramas WHERE id='${visitaId}'`) === 'COMPLETADO') break;
    }
    await page.screenshot({ path: `${OUT}/j7-offline-sincronizada.png`, fullPage: true }).catch(() => {});
  } finally {
    await browser.close();
  }

  const estadoFinal = sql(`SELECT estado FROM cronogramas WHERE id='${visitaId}'`);
  const fichasDespues = Number(sql('SELECT count(*) FROM fichas_monitoreo'));
  // La prueba real: mientras estaba en cola seguía EN_PROCESO, y tras reconectar quedó COMPLETADO con su ficha.
  const ok = estadoConCola === 'EN_PROCESO' && estadoFinal === 'COMPLETADO' && fichasDespues === fichasAntes + 1;
  console.log(
    `RESULT J7-offline ${ok ? 'PASS' : 'FAIL'} en-cola=${estadoConCola} final=${estadoFinal} fichas ${fichasAntes}→${fichasDespues}`,
  );
  return ok;
}

if (import.meta.url === `file://${process.argv[1]}`) run().then((ok) => process.exit(ok ? 0 : 1));
