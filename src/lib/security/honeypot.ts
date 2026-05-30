export class HoneypotSpamFilter {
  
  /**
   * HONEYPOT ANTI-SPAM FILTER (Problem #6)
   * Frictionless spam protection that blocks robotic form submissions without annoying users 
   * with complex captchas (which drop checkout conversion rates by up to 15%!).
   * 
   * It checks if a hidden form field (the "honeypot", invisible to humans but auto-filled by bots) 
   * has been filled out. If so, it instantly flags and blocks the submission as spam.
   */
  public static isSpamSubmission(
    formDataPayload: Record<string, any>,
    honeypotFieldKey = '_website_trap_field'
  ): boolean {
    const trapValue = formDataPayload[honeypotFieldKey];

    // If the hidden honeypot field is filled out, it's definitely a spam bot!
    if (trapValue !== undefined && trapValue !== '') {
      console.warn(`🛡️ [Honeypot Filter] Spam submission detected and blocked! Trap value filled: "${trapValue}"`);
      return true;
    }

    return false;
  }
}
