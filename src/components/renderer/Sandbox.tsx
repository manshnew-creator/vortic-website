import React from 'react';

interface SandboxProps {
  id: string;
  customHtml: string;
  className?: string;
  width?: string;
  height?: string;
}

/**
 * Enterprise Secure Sandbox Engine for Custom User HTML embeds
 * Isolates user-submitted scripts (XSS Protection) using sandboxed iframes.
 * Prevents access to parent site localStorage, cookies, or DOM window references.
 */
export const Sandbox: React.FC<SandboxProps> = ({
  id,
  customHtml,
  className = '',
  width = '100%',
  height = '150px',
}) => {
  // Construct a completely sandboxed direct iframe data source template
  const iframeSrcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            overflow: hidden;
          }
        </style>
      </head>
      <body>
        <div id="sandbox-root">${customHtml}</div>
        <script>
          // Secure iframe reporting back its scrollHeight to avoid vertical overflow cuts
          window.addEventListener('load', () => {
            const height = document.documentElement.scrollHeight;
            window.parent.postMessage({ type: 'SANDBOX_RESIZE', id: '${id}', height }, '*');
          });
        </script>
      </body>
    </html>
  `.replace(/\s+/g, ' ');

  return (
    <iframe
      id={`sandbox-${id}`}
      srcDoc={iframeSrcDoc}
      title={`User Custom HTML Embed Sandbox ${id}`}
      width={width}
      height={height}
      className={`border-0 overflow-hidden bg-transparent select-none ${className}`}
      // Hardened Sandbox attributes: 
      // allow-scripts: Enables execution of user scripts (widgets, maps).
      // NO allow-same-origin: Blocks cookie, session, and localstorage parent extraction completely!
      // NO allow-top-navigation: Blocks redirection of parent app window.
      sandbox="allow-scripts"
    />
  );
};
