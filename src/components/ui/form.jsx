"use client";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Controller, FormProvider, useFormContext } from "react-hook-form";
import { cn } from "@/utils/cn";
import { Label } from "@/components/ui/label";
const Form = FormProvider;
const FormFieldContext = React.createContext({});
function FormField(props) {
  return <FormFieldContext.Provider value={{
    name: props.name
  }}><Controller {...props} /></FormFieldContext.Provider>;
}
function useFormField() {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const {
    getFieldState,
    formState
  } = useFormContext();
  const fieldState = getFieldState(fieldContext.name, formState);
  const {
    id
  } = itemContext;
  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState
  };
}
const FormItemContext = React.createContext({});
function FormItem({
  className,
  ...props
}) {
  const id = React.useId();
  return <FormItemContext.Provider value={{
    id
  }}><div {...props} className={cn("space-y-1.5", className)} /></FormItemContext.Provider>;
}
function FormLabel({
  className,
  ...props
}) {
  const {
    error,
    formItemId
  } = useFormField();
  return <Label {...props} className={cn(error && "text-admin-danger", className)} htmlFor={formItemId} />;
}
function FormControl({
  ...props
}) {
  const {
    error,
    formItemId,
    formDescriptionId,
    formMessageId
  } = useFormField();
  return <Slot {...props} id={formItemId} aria-describedby={error ? `${formDescriptionId} ${formMessageId}` : formDescriptionId} aria-invalid={!!error} />;
}
function FormDescription({
  className,
  ...props
}) {
  const {
    formDescriptionId
  } = useFormField();
  return <p {...props} id={formDescriptionId} className={cn("text-xs text-admin-muted", className)} />;
}
function FormMessage({
  className,
  children,
  ...props
}) {
  const {
    error,
    formMessageId
  } = useFormField();
  const body = error ? String(error.message ?? "") : children;
  if (!body) return null;
  return <p {...props} id={formMessageId} className={cn("text-xs font-medium text-admin-danger", className)}>{body}</p>;
}
export { useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField };