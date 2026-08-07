import fs from "fs";
import path from "path";

const root = "src";

const renames = [
  ["ProvincesPanel", "ProvincesSection"],
  ["DistrictTypesPanel", "DistrictTypesSection"],
  ["DistrictsPanel", "DistrictsSection"],
  ["StopsPanel", "StopsSection"],
  ["BusesPanel", "BusesSection"],
  ["BusServicesPanel", "BusServicesSection"],
  ["RoutesPanel", "RoutesSection"],
  ["TripsPanel", "TripsSection"],
  ["SurchargesPanel", "SurchargesSection"],
  ["WebProfilePanel", "WebProfileSection"],
  ["BookingsPanel", "BookingsSection"],
];

const importMap = [
  [
    "@/components/admin/locations/provinces-panel",
    "@/views/admin/locations/provinces-section",
  ],
  [
    "@/components/admin/locations/district-types-panel",
    "@/views/admin/locations/district-types-section",
  ],
  [
    "@/components/admin/locations/districts-panel",
    "@/views/admin/locations/districts-section",
  ],
  [
    "@/components/admin/locations/stops-panel",
    "@/views/admin/locations/stops-section",
  ],
  [
    "@/components/admin/fleet/buses-panel",
    "@/views/admin/fleet/buses-section",
  ],
  [
    "@/components/admin/fleet/bus-services-panel",
    "@/views/admin/fleet/bus-services-section",
  ],
  [
    "@/components/admin/routes/routes-panel",
    "@/views/admin/routes/routes-section",
  ],
  [
    "@/components/admin/routes/route-stops-editor",
    "@/views/admin/editors/route-stops-editor",
  ],
  ["@/components/admin/trips/trips-panel", "@/views/admin/trips/trips-section"],
  [
    "@/components/admin/trips/trip-blocks-editor",
    "@/views/admin/editors/trip-blocks-editor",
  ],
  [
    "@/components/admin/surcharges/surcharges-panel",
    "@/views/admin/surcharges/surcharges-section",
  ],
  [
    "@/components/admin/surcharges/route-amounts-field",
    "@/views/admin/editors/route-amounts-field",
  ],
  [
    "@/components/admin/website/web-profile-panel",
    "@/views/admin/website/web-profile-section",
  ],
  [
    "@/components/admin/website/menu-tree-editor",
    "@/views/admin/editors/menu-tree-editor",
  ],
  [
    "@/components/admin/bookings/bookings-panel",
    "@/views/admin/bookings/bookings-section",
  ],
  [
    "@/components/admin/bookings/booking-form",
    "@/views/admin/bookings/booking-form",
  ],
  [
    "@/components/admin/bookings/booking-detail-sheet",
    "@/views/admin/bookings/booking-detail-sheet",
  ],
  ["@/components/admin/dashboard-overview", "@/views/admin/dashboard-overview"],
];

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, files);
    else if (/\.(jsx|js)$/.test(ent.name)) files.push(p);
  }
  return files;
}

for (const file of walk(root)) {
  let s = fs.readFileSync(file, "utf8");
  const orig = s;
  for (const [a, b] of renames) s = s.split(a).join(b);
  for (const [a, b] of importMap) s = s.split(a).join(b);
  if (s !== orig) {
    fs.writeFileSync(file, s);
    console.log("updated", file);
  }
}
console.log("done");
