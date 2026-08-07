"use client";
import { useEffect, useRef } from "react";

/**
 * html_form comes from our own backend (sepay_svc.create_checkout_html) —
 * a trusted-origin HTML fragment containing the SePay checkout <form>, not
 * user input. Injected and auto-submitted.
 */
export function SepayAutoSubmitForm({ htmlForm }) {
  const containerRef = useRef(null);
  useEffect(() => {
    const form = containerRef.current?.querySelector("form");
    form?.submit();
  }, []);
  return (
    <div
      ref={containerRef}
      dangerouslySetInnerHTML={{
        __html: htmlForm,
      }}
    />
  );
}
