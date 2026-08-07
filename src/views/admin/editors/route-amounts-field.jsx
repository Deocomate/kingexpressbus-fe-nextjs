"use client";

import { useFieldArray, useController } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResourceSelect } from "@/components/admin/resource-select";
import { MoneyInput } from "@/components/admin/sheet-form/money-input";

function RouteAmountRow({ control, index, onRemove }) {
  const routeIdField = useController({
    control,
    name: `route_amounts.${index}.route_id`,
  });
  const amountField = useController({
    control,
    name: `route_amounts.${index}.route_surcharge_amount`,
  });

  return (
    <div className="flex items-start gap-2">
      <div className="flex-1">
        <ResourceSelect
          resourcePath="/admin/routes"
          labelKey="name"
          value={routeIdField.field.value}
          onChange={routeIdField.field.onChange}
        />
        {routeIdField.fieldState.error ? (
          <p className="mt-1 text-xs font-medium text-admin-danger">
            {routeIdField.fieldState.error.message}
          </p>
        ) : null}
      </div>
      <div className="w-36">
        <MoneyInput
          value={amountField.field.value}
          onChange={amountField.field.onChange}
        />
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7 shrink-0"
        aria-label="Xóa"
        onClick={onRemove}
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}

export function RouteAmountsField({ control }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "route_amounts",
  });

  return (
    <div className="space-y-2">
      {fields.map((field, index) => (
        <RouteAmountRow
          key={field.id}
          control={control}
          index={index}
          onRemove={() => remove(index)}
        />
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ route_id: null, route_surcharge_amount: 0 })}
      >
        <Plus className="size-3.5" />
        Thêm tuyến
      </Button>
    </div>
  );
}
