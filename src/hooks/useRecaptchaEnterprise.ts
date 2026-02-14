"use client";

import { useEffect, useState } from "react";

declare global {
/* eslint-disable @typescript-eslint/no-explicit-any */
  interface Window {
    grecaptcha: any;
  }
}

export function useRecaptchaEnterprise(siteKey: string | undefined) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!siteKey) return;

    const scriptId = "recaptcha-enterprise-script";
    
    // Check if script already exists
    if (document.getElementById(scriptId)) {
      if (window.grecaptcha?.enterprise) {
        window.grecaptcha.enterprise.ready(() => {
           setReady(true);
        });
      }
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/enterprise.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;
    script.id = scriptId;
    
    script.onload = () => {
      if (window.grecaptcha?.enterprise) {
        window.grecaptcha.enterprise.ready(() => {
          setReady(true);
        });
      }
    };

    document.head.appendChild(script);
  }, [siteKey]);

  const execute = async (action: string) => {
    if (!siteKey || !window.grecaptcha?.enterprise) {
      console.warn("ReCAPTCHA Enterprise not ready or missing siteKey");
      return null;
    }
    
    try {
        return await window.grecaptcha.enterprise.execute(siteKey, { action });
    } catch (error) {
        console.error("ReCAPTCHA execution error:", error);
        return null;
    }
  };

  return { execute, ready };
}
