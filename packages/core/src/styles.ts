/**
 * Default theme. Every color is a CSS custom property, so it can be themed with
 * plain CSS:  .qp-root { --qp-primary: #7c3aed; }
 */
export const css = `
.qp-root{--qp-primary:#e11d48;--qp-primary-contrast:#fff;--qp-bg:#000;--qp-surface:#18181b;--qp-surface-2:#27272a;--qp-border:#3f3f46;--qp-text:#fafafa;--qp-muted:#a1a1aa;--qp-success:#16a34a;--qp-danger:#dc2626;--qp-radius:12px;--qp-font:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Ubuntu,"Helvetica Neue",Arial,"Noto Sans","PingFang SC","Hiragino Sans",sans-serif;
position:relative;width:100%;aspect-ratio:16/9;container-type:inline-size;background:var(--qp-bg);color:var(--qp-text);font-family:var(--qp-font);overflow:hidden;border-radius:var(--qp-radius);line-height:1.4;-webkit-tap-highlight-color:transparent}
.qp-root *,.qp-root *::before,.qp-root *::after{box-sizing:border-box}
.qp-root.qp-fill{aspect-ratio:auto;height:100%;border-radius:0}
.qp-root:fullscreen{border-radius:0;aspect-ratio:auto;width:100%;height:100%}
.qp-video{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:var(--qp-bg);display:block}
.qp-bigplay{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:76px;height:76px;border-radius:50%;border:0;background:var(--qp-primary);color:var(--qp-primary-contrast);display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:4;box-shadow:0 8px 30px rgba(0,0,0,.45);transition:transform .2s,opacity .2s}
.qp-bigplay:hover{transform:translate(-50%,-50%) scale(1.08)}
.qp-bigplay svg{width:34px;height:34px;fill:currentColor;margin-left:4px}
.qp-root.qp-started .qp-bigplay{opacity:0;pointer-events:none}
.qp-controls{position:absolute;left:0;right:0;bottom:0;padding:28px 14px 10px;background:linear-gradient(to top,rgba(0,0,0,.85),transparent);display:flex;flex-direction:column;gap:8px;z-index:5;opacity:0;transition:opacity .25s}
.qp-root:hover .qp-controls,.qp-root:focus-within .qp-controls,.qp-root.qp-paused .qp-controls,.qp-root.qp-touch .qp-controls{opacity:1}
.qp-progress{position:relative;height:6px;border-radius:3px;background:rgba(255,255,255,.28);cursor:pointer;touch-action:none;outline:none}
.qp-progress:hover,.qp-progress:focus-visible{height:8px}
.qp-progress:focus-visible{box-shadow:0 0 0 2px var(--qp-primary)}
.qp-buffered{position:absolute;left:0;top:0;bottom:0;background:rgba(255,255,255,.25);border-radius:3px;width:0}
.qp-played{position:absolute;left:0;top:0;bottom:0;background:var(--qp-primary);border-radius:3px;width:0}
.qp-played::after{content:"";position:absolute;right:-6px;top:50%;transform:translateY(-50%);width:12px;height:12px;border-radius:50%;background:var(--qp-primary)}
.qp-limit{position:absolute;top:0;bottom:0;right:0;background:repeating-linear-gradient(45deg,rgba(0,0,0,.35) 0 4px,transparent 4px 8px);border-radius:0 3px 3px 0;pointer-events:none}
.qp-marker{position:absolute;top:50%;width:10px;height:10px;margin-left:-5px;transform:translateY(-50%) rotate(45deg);background:#facc15;border:2px solid rgba(0,0,0,.6);border-radius:2px;pointer-events:none}
.qp-marker.qp-done{background:var(--qp-success)}
.qp-marker.qp-wrong{background:var(--qp-danger)}
.qp-bar{display:flex;align-items:center;gap:6px}
.qp-btn{background:none;border:0;color:#fff;cursor:pointer;padding:6px;display:inline-flex;align-items:center;justify-content:center;border-radius:6px;transition:background .15s}
.qp-btn:hover,.qp-btn:focus-visible{background:rgba(255,255,255,.15);outline:none}
.qp-btn svg{width:22px;height:22px;fill:currentColor}
.qp-time{font-size:13px;font-variant-numeric:tabular-nums;color:#fff;white-space:nowrap;padding:0 4px}
.qp-spacer{flex:1}
.qp-volume{width:80px;accent-color:var(--qp-primary);cursor:pointer}
.qp-count{font-size:12px;color:#fff;background:rgba(255,255,255,.15);padding:3px 8px;border-radius:999px;white-space:nowrap}
.qp-overlay{position:absolute;inset:0;z-index:20;display:none;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,0)}
.qp-overlay.qp-open{display:flex;animation:qp-fade .45s ease forwards}
@keyframes qp-fade{from{background:rgba(0,0,0,0)}to{background:rgba(0,0,0,.88)}}
.qp-card{background:var(--qp-surface);border:1px solid var(--qp-border);border-radius:var(--qp-radius);padding:24px;width:100%;max-width:640px;max-height:100%;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.5);animation:qp-pop .5s cubic-bezier(.2,.9,.3,1.2) both;outline:none}
@keyframes qp-pop{from{opacity:0;transform:scale(.85) translateY(24px)}to{opacity:1;transform:none}}
.qp-kicker{font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:var(--qp-primary);font-weight:700;margin:0 0 8px}
.qp-question{font-size:clamp(17px,2.4vw,22px);font-weight:650;margin:0 0 20px;line-height:1.45}
.qp-options{display:flex;flex-direction:column;gap:10px;margin:0;padding:0;list-style:none}
.qp-option{display:flex;align-items:center;gap:14px;width:100%;text-align:left;background:var(--qp-surface-2);border:2px solid var(--qp-border);border-radius:10px;padding:13px 16px;color:var(--qp-text);font:inherit;font-size:15px;cursor:pointer;transition:border-color .2s,background .2s,transform .2s}
.qp-option::before{content:"";flex:0 0 20px;height:20px;border-radius:50%;border:2px solid currentColor;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:inherit;transition:all .2s}
.qp-option:hover:not([disabled]),.qp-option:focus-visible{border-color:var(--qp-primary);transform:translateX(4px);outline:none}
.qp-option[aria-checked="true"]{border-color:var(--qp-primary);background:color-mix(in srgb,var(--qp-primary) 18%,var(--qp-surface-2))}
.qp-option[aria-checked="true"]::before{background:var(--qp-primary);border-color:var(--qp-primary);box-shadow:0 0 0 4px color-mix(in srgb,var(--qp-primary) 25%,transparent)}
.qp-option[disabled]{cursor:default}
.qp-option.qp-correct{border-color:var(--qp-success);background:color-mix(in srgb,var(--qp-success) 20%,var(--qp-surface-2))}
.qp-option.qp-correct::before{content:"✓";background:var(--qp-success);border-color:var(--qp-success);color:#fff;box-shadow:none}
.qp-option.qp-incorrect{border-color:var(--qp-danger);background:color-mix(in srgb,var(--qp-danger) 20%,var(--qp-surface-2))}
.qp-option.qp-incorrect::before{content:"✗";background:var(--qp-danger);border-color:var(--qp-danger);color:#fff;box-shadow:none}
.qp-option.qp-dim{opacity:.55}
.qp-feedback{margin-top:16px;padding:12px 14px;border-radius:10px;font-weight:600;text-align:center;display:none}
.qp-feedback.qp-show{display:block}
.qp-feedback.qp-ok{background:color-mix(in srgb,var(--qp-success) 18%,transparent);border:1px solid var(--qp-success);color:#4ade80}
.qp-feedback.qp-bad{background:color-mix(in srgb,var(--qp-danger) 18%,transparent);border:1px solid var(--qp-danger);color:#fca5a5}
.qp-feedback.qp-neutral{background:var(--qp-surface-2);border:1px solid var(--qp-border);color:var(--qp-text)}
.qp-explanation{display:block;margin-top:6px;font-weight:400;color:var(--qp-text)}
.qp-submit{margin-top:18px;width:100%;border:0;border-radius:10px;padding:14px 20px;font:inherit;font-weight:700;font-size:15px;background:var(--qp-primary);color:var(--qp-primary-contrast);cursor:pointer;transition:transform .15s,box-shadow .15s,opacity .15s}
.qp-submit:hover:not([disabled]){transform:translateY(-2px);box-shadow:0 6px 18px color-mix(in srgb,var(--qp-primary) 45%,transparent)}
.qp-submit[disabled]{opacity:.45;cursor:not-allowed}
.qp-sub{margin-top:8px;text-align:center;font-size:12px;color:var(--qp-muted);min-height:1em}
.qp-toast{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scale(.92);z-index:25;width:min(460px,calc(100% - 32px));background:linear-gradient(135deg,var(--qp-surface),var(--qp-surface-2));border:2px solid var(--qp-primary);border-radius:var(--qp-radius);padding:24px;text-align:center;box-shadow:0 12px 40px rgba(0,0,0,.6);opacity:0;pointer-events:none;transition:all .25s}
.qp-toast.qp-open{opacity:1;pointer-events:auto;transform:translate(-50%,-50%) scale(1)}
.qp-toast h3{margin:0 0 8px;font-size:18px;color:var(--qp-primary)}
.qp-toast p{margin:0 0 16px;color:var(--qp-muted)}
.qp-toast-actions{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.qp-toast-actions button{border:0;border-radius:8px;padding:10px 18px;font:inherit;font-weight:600;cursor:pointer}
.qp-yes{background:var(--qp-primary);color:var(--qp-primary-contrast)}
.qp-no{background:var(--qp-border);color:var(--qp-text)}
.qp-notice{position:absolute;top:14px;left:50%;transform:translateX(-50%);z-index:30;background:var(--qp-primary);color:var(--qp-primary-contrast);padding:8px 14px;border-radius:8px;font-size:14px;opacity:0;pointer-events:none;transition:opacity .2s;max-width:calc(100% - 32px);text-align:center}
.qp-notice.qp-open{opacity:1}
.qp-root.qp-grow{aspect-ratio:auto;min-height:var(--qp-h,0px)}
.qp-root.qp-grow .qp-overlay.qp-open{position:relative;inset:auto;min-height:var(--qp-h,0px)}
.qp-root.qp-grow .qp-card{max-height:none}
.qp-root.qp-grow .qp-toast.qp-open{position:relative;left:auto;top:auto;transform:none;margin:16px auto}
.qp-sr{position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0}
@container (max-width:560px){.qp-card{padding:16px}.qp-question{font-size:16px;margin-bottom:12px}.qp-kicker{margin-bottom:4px}.qp-options{gap:8px}.qp-option{padding:9px 12px;font-size:14px}.qp-submit{margin-top:12px;padding:11px 16px}.qp-feedback{margin-top:10px;padding:9px 12px;font-size:14px}.qp-volume{display:none}.qp-toast{padding:16px}.qp-toast h3{font-size:16px}.qp-toast p{margin-bottom:12px;font-size:14px}.qp-bigplay{width:58px;height:58px}.qp-bigplay svg{width:26px;height:26px}}
@media (prefers-reduced-motion:reduce){.qp-root *{animation:none!important;transition:none!important}}
`;

let injected = false;

/** Injects the default stylesheet once per document. */
export function injectStyles(doc: Document = document): void {
  if (injected && doc.getElementById('quizplayer-styles')) return;
  if (doc.getElementById('quizplayer-styles')) {
    injected = true;
    return;
  }
  const style = doc.createElement('style');
  style.id = 'quizplayer-styles';
  style.textContent = css;
  doc.head.appendChild(style);
  injected = true;
}
