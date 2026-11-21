Rendere le animazioni del sito Sycomo più morbide, fluide e organiche per l'ambiente di produzione (in particolare il volo del logo con --p in globals.css, la discesa della tendina liquida IntroCurtain, la comparsa di <CheComputer> (.uso), e le transizioni responsive/card), conferendo una sensazione di inerzia fisica naturale a 60/120fps senza scatti.

Working directory: /home/shadymui/sycomosite
Integrity mode: development

## Requirements

### R1. Calibrazione e ammorbidimento delle animazioni e transizioni
Applicare curve di easing più morbide per dare sensazione di inerzia fisica naturale (es. curve cubic-bezier(0.16, 1, 0.3, 1), cubic-bezier(0.25, 1, 0.5, 1)), durate calibrate con cura, transizioni sfumate e micro-staggering per non far muovere tutto simultaneamente in blocco su:
- Volo del logo controllato da `--p` in `globals.css`
- Discesa della tendina liquida `IntroCurtain` (`.intro-sheet`)
- Comparsa di `<CheComputer>` (`.uso`)
- Transizioni responsive e card

### R2. Fluidità di rendering
Mantenere la massima fluidità visiva a 60/120fps senza scatti durante l'esecuzione di tutte le animazioni e transizioni.

### R3. Verifica e integrità dei test
Tutti i test esistenti della test-matrix e la suite di test E2E in `e2e/` devono essere eseguiti e superati con successo senza regressioni.

## Acceptance Criteria

### Fluidità e comportamento animazioni
- [ ] Le curve di easing e le durate per `--p`, `.uso`, `.intro-sheet` e le transizioni responsive/card utilizzano curve morbide con inerzia fisica naturale
- [ ] Gli elementi non compaiono o transitano tutti simultaneamente in blocco, grazie all'introduzione di micro-staggering calibrato
- [ ] L'esecuzione delle animazioni avviene in modo fluido a 60/120fps senza scatti o freeze del rendering

### Verifica suite di test
- [ ] La test-matrix del progetto viene eseguita e passa senza errori
- [ ] Tutti i test E2E nella directory `e2e/` vengono eseguiti e superati con successo
