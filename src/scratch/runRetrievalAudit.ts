// Setup global localStorage mock first
if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    length: 0,
    key: () => null
  };
}

async function run() {
  // Dynamically import the audit script so that the localStorage mock is already in place
  const { runRetrievalAudit } = await import('./retrievalAudit');
  await runRetrievalAudit();
}

run()
  .then(() => console.log('[Audit] Retrieval audit completed successfully.'))
  .catch(err => {
    console.error('[Audit] Retrieval audit failed:', err);
    process.exit(1);
  });
