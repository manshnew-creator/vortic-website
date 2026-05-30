export type PluginCapability = 
  | 'DOM_READ' 
  | 'DOM_WRITE' 
  | 'NETWORK_FETCH' 
  | 'STORAGE_WRITE' 
  | 'PARENT_REDIRECT';

export interface PluginManifest {
  pluginId: string;
  name: string;
  version: string;
  permissions: PluginCapability[];
}

export class CapabilitySandboxEngine {
  /**
   * Generates highly secure Sandboxed iframe HTML attributes and Content Security Policy (CSP)
   * inline rules strictly customized depending on the plugin's requested and approved Capabilities.
   * This implements the Least Privilege Principle (Capability-Based Security) to isolate 3rd-party marketplace widgets.
   */
  public static generateSandboxConfiguration(manifest: PluginManifest): {
    sandboxAttributes: string[];
    cspHeader: string;
  } {
    const sandboxAttributes: string[] = ['allow-scripts']; // allow-scripts is base minimum
    const cspDirectives: string[] = ["default-src 'none'", "script-src 'unsafe-inline'"];

    const permissions = new Set<PluginCapability>(manifest.permissions);

    // 1. Evaluate DOM and Cookie isolation levels (allow-same-origin)
    // If a plugin requires reading DOM or writing to local storage/cookies, we grant allow-same-origin
    // but isolate with a highly-restrictive Content Security Policy.
    if (permissions.has('DOM_READ') || permissions.has('STORAGE_WRITE')) {
      sandboxAttributes.push('allow-same-origin');
    }

    // 2. Evaluate Network Capabilities
    if (permissions.has('NETWORK_FETCH')) {
      cspDirectives.push("connect-src 'self' https://*");
    } else {
      cspDirectives.push("connect-src 'none'");
    }

    // 3. Evaluate Frame Redirect Permissions
    if (permissions.has('PARENT_REDIRECT')) {
      sandboxAttributes.push('allow-top-navigation');
    }

    // Add CSS/Font asset rendering constraints to the CSP
    cspDirectives.push("style-src 'unsafe-inline' https://fonts.googleapis.com");
    cspDirectives.push("font-src https://fonts.gstatic.com");

    const cspHeader = cspDirectives.join('; ').trim();

    return {
      sandboxAttributes,
      cspHeader,
    };
  }

  /**
   * Generates a fully compiled capability-restricted iframe container markup for a widget
   */
  public static compileSecurePluginIframe(manifest: PluginManifest, widgetSourceHtml: string): string {
    const config = this.generateSandboxConfiguration(manifest);
    const sandboxStr = config.sandboxAttributes.join(' ');
    
    // Inject the custom CSP header dynamically inside a meta tag inside the isolated iframe doc
    const securedSrcDoc = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta http-equiv="Content-Security-Policy" content="${config.cspHeader}">
          <style>
            body { margin: 0; padding: 0; overflow: hidden; }
          </style>
        </head>
        <body>
          <div id="plugin-runtime-root">${widgetSourceHtml}</div>
        </body>
      </html>
    `.replace(/\s+/g, ' ').trim();

    return `
      <iframe 
        id="widget-${manifest.pluginId}"
        srcdoc="${securedSrcDoc}"
        sandbox="${sandboxStr}"
        class="secure-widget-frame w-full border-0"
        loading="lazy"
      ></iframe>
    `.trim();
  }
}
