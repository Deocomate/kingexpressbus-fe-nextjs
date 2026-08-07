# Admin UI kit

Greenfield `/quan-tri` chrome — shadcn/ui (Radix) + `@tanstack/react-table` /
`@tanstack/react-query` + React Hook Form + Zod. No jQuery / DataTables /
Alpine / CDN. Module screens live under `src/views/admin/`; shared primitives
stay in `src/components/admin/`.

## Layout

- `app/(admin)/quan-tri/layout.jsx` — shell root (`admin.css` + Toaster)
- `app/(admin)/quan-tri/(dashboard)/layout.jsx` — sidebar + topbar + `AuthGate` + Query provider
- `app/(admin)/quan-tri/dang-nhap/` — guest login (outside dashboard group)
- Screen bodies: `src/views/admin/*`

## Auth

`AuthGate` calls `GET /auth/me` with browser cookies and redirects on 401 /
non-admin. `services/admin-auth.js` + `services/admin-api.js` hold fetch
wrappers.

## DataTable

Bound to FastAPI `Paginated { items, total, page, page_size }`. Client only
sends `page`, `page_size`, `q` (+ module filters). No client column-sort UI.

Bulk delete = per-id `DELETE` (no bulk route):

```jsx
onBulkDelete={(ids) =>
  confirm({
    title: `Xóa ${ids.length} mục?`,
    onConfirm: () =>
      Promise.all(ids.map((id) => adminDelete(`/admin/provinces/${id}`))),
  })
}
```

`useAdminList` owns pagination/search + query keys; call `invalidate` after writes.

## SheetForm

```jsx
<SheetForm
  open={open}
  onOpenChange={setOpen}
  title="Tỉnh/Thành phố"
  schema={provinceSchema}
  defaultValues={{ name: "" }}
  onSubmit={(v) => adminCreate("/admin/provinces", v)}
>
  {(form) => (
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tên</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )}
</SheetForm>
```

All write forms use Zod. Delete-guard errors surface via `getErrorMessage`.

## CrudSection

Compose DataTable + SheetForm + ConfirmDialog (+ ReorderList) for standard
CRUD modules. Nested editors (route stops, trip blocks, menus) live under
`views/admin/editors/`.

## Uploader

Two-stage: `stageUpload()` → parent form `commitUpload(token, dir)` after
save; `revertUpload(token)` on cancel. Never commit on stage alone.

## Confirm + toast

`useConfirmDialog()` → `{ confirm, dialog }`. Toasts via Sonner in admin root layout.
