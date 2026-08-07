"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ApiError } from "@/services/api-base";
import { adminLogin } from "@/services/admin-auth";
import { ADMIN_ROUTES } from "@/services/admin-routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
const loginSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu")
});
export function AdminLoginForm() {
  const router = useRouter();
  const [formError, setFormError] = useState(null);
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });
  async function onSubmit(values) {
    setFormError(null);
    try {
      await adminLogin(values);
      router.replace(ADMIN_ROUTES.dashboard);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        setFormError("Email hoặc mật khẩu không đúng, hoặc tài khoản không có quyền quản trị.");
        return;
      }
      setFormError("Đăng nhập thất bại. Vui lòng thử lại.");
    }
  }
  return <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate><FormField control={form.control} name="email" render={({
        field
      }) => <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} type="email" autoComplete="username" /></FormControl><FormMessage /></FormItem>} /><FormField control={form.control} name="password" render={({
        field
      }) => <FormItem><FormLabel>Mật khẩu</FormLabel><FormControl><Input {...field} type="password" autoComplete="current-password" /></FormControl><FormMessage /></FormItem>} />{formError ? <p role="alert" className="text-sm font-medium text-admin-danger">{formError}</p> : null}<Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Đang đăng nhập…" : "Đăng nhập"}</Button></form></Form>;
}