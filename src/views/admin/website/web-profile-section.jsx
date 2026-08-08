"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { adminGet, adminUpdate } from "@/services/admin-api";
import { resolveImageField } from "@/services/admin-uploads";
import { EntityForm } from "@/components/admin/entity-form";
import { FormSection } from "@/components/admin/form-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Uploader } from "@/components/admin/uploader";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";

const schema = z.object({
  is_default: z.boolean(),
  online_payment_enabled: z.boolean(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  logo: z.custom().nullable(),
  favicon: z.custom().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  hotline: z.string().nullable(),
  whatsapp: z.string().nullable(),
  address: z.string().nullable(),
  facebook_url: z.string().nullable(),
  zalo_url: z.string().nullable(),
  map_embedded: z.string().nullable(),
  policy_content: z.string().nullable(),
  introduction_content: z.string().nullable(),
});

function toFormValues(p) {
  return {
    is_default: p.is_default,
    online_payment_enabled: p.online_payment_enabled !== false,
    title: p.title,
    description: p.description,
    logo: p.logo_url ? { previewUrl: p.logo_url } : null,
    favicon: p.favicon_url ? { previewUrl: p.favicon_url } : null,
    email: p.email,
    phone: p.phone,
    hotline: p.hotline,
    whatsapp: p.whatsapp,
    address: p.address,
    facebook_url: p.facebook_url,
    zalo_url: p.zalo_url,
    map_embedded: p.map_embedded,
    policy_content: p.policy_content,
    introduction_content: p.introduction_content,
  };
}

export function WebProfileSection() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-web-profiles"],
    queryFn: () => adminGet("/admin/web-profiles"),
  });
  const [editing, setEditing] = useState(null);

  async function onSubmit(values) {
    if (!editing) return;
    try {
      await adminUpdate(`/admin/web-profiles/${editing.id}`, {
        is_default: values.is_default,
        online_payment_enabled: values.online_payment_enabled,
        title: values.title || null,
        description: values.description || null,
        logo_url: await resolveImageField(values.logo, "web-profiles"),
        favicon_url: await resolveImageField(values.favicon, "web-profiles"),
        email: values.email || null,
        phone: values.phone || null,
        hotline: values.hotline || null,
        whatsapp: values.whatsapp || null,
        address: values.address || null,
        facebook_url: values.facebook_url || null,
        zalo_url: values.zalo_url || null,
        map_embedded: values.map_embedded || null,
        policy_content: values.policy_content || null,
        introduction_content: values.introduction_content || null,
      });
      toast.success("Đã lưu");
      queryClient.invalidateQueries({ queryKey: ["admin-web-profiles"] });
      setEditing(null);
    } catch {
      toast.error("Không thể lưu.");
    }
  }

  if (isLoading) {
    return <p className="text-sm text-admin-muted">Đang tải…</p>;
  }

  return (
    <div className="space-y-3">
      {(data ?? []).map((profile) => (
        <div
          key={profile.id}
          className="flex items-center justify-between rounded-admin-md border border-admin-border bg-admin-surface px-4 py-3"
        >
          <div>
            <p className="font-medium text-admin-ink">
              {profile.profile_name}{" "}
              {profile.is_default ? (
                <Badge className="ml-2">Mặc định</Badge>
              ) : null}
            </p>
            <p className="text-sm text-admin-muted">{profile.title}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setEditing(profile)}
          >
            <Pencil className="size-3.5" />
            Chỉnh sửa
          </Button>
        </div>
      ))}

      <EntityForm
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
        size="lg"
        title={editing?.profile_name ?? ""}
        schema={schema}
        defaultValues={editing ? toFormValues(editing) : undefined}
        onSubmit={onSubmit}
        successMessage="Đã lưu"
      >
        {(form) => (
          <>
            <FormSection title="Cài đặt chung">
              <FormField
                control={form.control}
                name="is_default"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 space-y-0 sm:col-span-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Đặt làm mặc định</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="online_payment_enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 space-y-0 sm:col-span-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">
                      Bật thanh toán online (SePay)
                    </FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiêu đề</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value ?? ""} rows={2} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </FormSection>

            <FormSection title="Thương hiệu" columns={2}>
              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo</FormLabel>
                    <FormControl>
                      <Uploader value={field.value} onChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="favicon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Favicon</FormLabel>
                    <FormControl>
                      <Uploader value={field.value} onChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </FormSection>

            <FormSection title="Liên hệ" columns={2}>
              {[
                ["email", "Email"],
                ["phone", "Điện thoại"],
                ["hotline", "Hotline"],
                ["whatsapp", "WhatsApp"],
              ].map(([name, label]) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{label}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Địa chỉ</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </FormSection>

            <FormSection title="Mạng xã hội" columns={2}>
              <FormField
                control={form.control}
                name="facebook_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="zalo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zalo</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="map_embedded"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Bản đồ (nhúng)</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value ?? ""} rows={3} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </FormSection>

            <FormSection title="Nội dung trang">
              <FormField
                control={form.control}
                name="introduction_content"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Giới thiệu</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="policy_content"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Chính sách</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </FormSection>
          </>
        )}
      </EntityForm>
    </div>
  );
}
