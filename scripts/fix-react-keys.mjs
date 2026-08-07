const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "src");
const changed = [];

function patch(rel, pairs) {
  const file = path.join(root, rel);
  let text = fs.readFileSync(file, "utf8");
  let n = 0;
  for (const [from, to] of pairs) {
    if (!text.includes(from)) {
      console.warn(`SKIP ${rel}: ${JSON.stringify(from).slice(0, 90)}`);
      continue;
    }
    const count = text.split(from).length - 1;
    text = text.split(from).join(to);
    n += count;
  }
  if (n > 0) {
    fs.writeFileSync(file, text);
    changed.push(`${rel} (${n})`);
  }
}

// search-bar
patch("components/client/search-bar.jsx", [
  [
    `{groupedLocations(originQuery).map((group) => (
                      <div className="mb-2 last:mb-0">`,
    `{groupedLocations(originQuery).map((group) => (
                      <div key={group.type} className="mb-2 last:mb-0">`,
  ],
  [
    `{groupedLocations(destinationQuery).map((group) => (
                      <div className="mb-2 last:mb-0">`,
    `{groupedLocations(destinationQuery).map((group) => (
                      <div key={group.type} className="mb-2 last:mb-0">`,
  ],
  [
    `{group.items.map((item) => (
                          <button
                            type="button"
                            onClick={() => selectLocation("origin", item)}`,
    `{group.items.map((item) => (
                          <button
                            key={\`\${item.type}-\${item.id}\`}
                            type="button"
                            onClick={() => selectLocation("origin", item)}`,
  ],
  [
    `{group.items.map((item) => (
                          <button
                            type="button"
                            onClick={() => selectLocation("destination", item)}`,
    `{group.items.map((item) => (
                          <button
                            key={\`\${item.type}-\${item.id}\`}
                            type="button"
                            onClick={() => selectLocation("destination", item)}`,
  ],
]);

patch("views/client/home-page.jsx", [
  [
    `].map(({ icon: Icon, title, desc }) => (
              <div className="ksb-trust-item">`,
    `].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="ksb-trust-item">`,
  ],
]);

patch("views/client/routes-page.jsx", [
  [
    `{quickSuggestions.map((route) => (
                <Link
                  href={\`\${routesIndexHref}/\${route.slug}\`}`,
    `{quickSuggestions.map((route) => (
                <Link
                  key={route.id ?? route.slug}
                  href={\`\${routesIndexHref}/\${route.slug}\`}`,
  ],
  [
    `{provincesWithRoutes.map((province) => (
                <Link
                  href={\`\${routesIndexHref}?province=\${province.id}\`}`,
    `{provincesWithRoutes.map((province) => (
                <Link
                  key={province.id}
                  href={\`\${routesIndexHref}?province=\${province.id}\`}`,
  ],
  [
    `{popularRoutes.map((route) => (
                <RouteCard route={route} locale={locale} t={t} />
              ))}`,
    `{popularRoutes.map((route) => (
                <RouteCard key={route.id ?? route.slug} route={route} locale={locale} t={t} />
              ))}`,
  ],
]);

patch("views/client/route-by-slug-page.jsx", [
  [
    `{quickTimeFilters.map(({ key }) => {
                  const isActive = filterState.timeRanges.includes(key);
                  return (
                    <Link
                      href={quickFilterHref({
                        time_range: key,
                      })}`,
    `{quickTimeFilters.map(({ key }) => {
                  const isActive = filterState.timeRanges.includes(key);
                  return (
                    <Link
                      key={key}
                      href={quickFilterHref({
                        time_range: key,
                      })}`,
  ],
  [
    `trips.map((trip) => (
                      <TripRowCard trip={trip} date={date} locale={locale} />
                    ))`,
    `trips.map((trip) => (
                      <TripRowCard key={trip.id} trip={trip} date={date} locale={locale} />
                    ))`,
  ],
]);

patch("components/client/about/about-destinations-section.jsx", [
  [
    `{DESTINATION_CARDS.map((destination, index) => (
            <Link
              href={routesIndexHref}`,
    `{DESTINATION_CARDS.map((destination, index) => (
            <Link
              key={destination.key}
              href={routesIndexHref}`,
  ],
]);

patch("components/client/about/about-fleet-section.jsx", [
  [
    `{features.map((feature) => (
                <li className="flex items-start gap-3 text-sm font-semibold text-slate-700">`,
    `{features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm font-semibold text-slate-700">`,
  ],
  [
    `{FLEET_CARDS.map((fleet) => (
            <article className="group">`,
    `{FLEET_CARDS.map((fleet) => (
            <article key={fleet.nameKey} className="group">`,
  ],
]);

patch("components/client/about/about-popular-routes-section.jsx", [
  [
    `popularRoutes.map((route) => (
              <Link
                href={\`\${routesIndexHref}/\${route.slug}\`}`,
    `popularRoutes.map((route) => (
              <Link
                key={route.id ?? route.slug}
                href={\`\${routesIndexHref}/\${route.slug}\`}`,
  ],
]);

patch("components/client/about/about-position-section.jsx", [
  [
    `{whyChooseItems.map((item, index) => {
                const Icon = WHY_CHOOSE_ICONS[index % WHY_CHOOSE_ICONS.length];
                return (
                  <div className="group">`,
    `{whyChooseItems.map((item, index) => {
                const Icon = WHY_CHOOSE_ICONS[index % WHY_CHOOSE_ICONS.length];
                return (
                  <div key={item.title} className="group">`,
  ],
  [
    `{timelineItems.map((item) => (
                <article className="relative">`,
    `{timelineItems.map((item) => (
                <article key={item.year} className="relative">`,
  ],
]);

patch("components/client/about/about-stat-bar-section.jsx", [
  [
    `{items.map((item) => (
            <AboutStatCounter
              target={item.value}`,
    `{items.map((item) => (
            <AboutStatCounter
              key={item.label}
              target={item.value}`,
  ],
]);

patch("components/client/about/about-vision-section.jsx", [
  [
    `{coreValueItems.map((item, index) => {
              const Icon = CORE_VALUE_ICONS[index % CORE_VALUE_ICONS.length];
              return (
                <article className="about-value-row grid gap-4 py-5 md:grid-cols-[48px_1fr]">`,
    `{coreValueItems.map((item, index) => {
              const Icon = CORE_VALUE_ICONS[index % CORE_VALUE_ICONS.length];
              return (
                <article key={item.title} className="about-value-row grid gap-4 py-5 md:grid-cols-[48px_1fr]">`,
  ],
]);

patch("components/client/contact/contact-faq-accordion.jsx", [
  [
    `return (
          <div className="rounded-sm border border-amber-100 bg-white">`,
    `return (
          <div key={faq.question ?? index} className="rounded-sm border border-amber-100 bg-white">`,
  ],
]);

patch("components/client/contact/contact-support-section.jsx", [
  [
    `{channels.map((channel) => (
              <a
                href={channel.href ?? undefined}`,
    `{channels.map((channel) => (
              <a
                key={channel.label}
                href={channel.href ?? undefined}`,
  ],
]);

patch("components/client/destination-mosaic.jsx", [
  [
    `{DESTINATIONS.map((destination) => (
        <a
          href={href}`,
    `{DESTINATIONS.map((destination) => (
        <a
          key={destination.key}
          href={href}`,
  ],
]);

patch("components/client/cms-page/cms-page-sidebar.jsx", [
  [
    `{DESTINATIONS.map((destination) => (
            <Link
              href={routesIndexHref}`,
    `{DESTINATIONS.map((destination) => (
            <Link
              key={destination.key}
              href={routesIndexHref}`,
  ],
]);

patch("components/client/route-filter-fields.jsx", [
  [
    `{sortOptions.map((option) => (
            <label className="flex cursor-pointer items-center gap-3 text-sm text-muted hover:text-ink">`,
    `{sortOptions.map((option) => (
            <label key={option.value} className="flex cursor-pointer items-center gap-3 text-sm text-muted hover:text-ink">`,
  ],
  [
    `return (
                <label className="cursor-pointer">
                  <input
                    type="checkbox"
                    name="time_ranges"`,
    `return (
                <label key={option.key} className="cursor-pointer">
                  <input
                    type="checkbox"
                    name="time_ranges"`,
  ],
  [
    `return (
                <label className="cursor-pointer">
                  <input
                    type="checkbox"
                    name="services"`,
    `return (
                <label key={service} className="cursor-pointer">
                  <input
                    type="checkbox"
                    name="services"`,
  ],
]);

patch("components/client/trip-detail-modal.jsx", [
  [
    `pickupPoints.map((point) => (
                      <p className="text-sm font-semibold text-ink">
                        {point.name}
                      </p>
                    ))`,
    `pickupPoints.map((point) => (
                      <p key={point.stop_id ?? point.id ?? point.name} className="text-sm font-semibold text-ink">
                        {point.name}
                      </p>
                    ))`,
  ],
  [
    `dropoffPoints.map((point) => (
                      <p className="text-sm font-semibold text-ink">
                        {point.name}
                      </p>
                    ))`,
    `dropoffPoints.map((point) => (
                      <p key={point.stop_id ?? point.id ?? point.name} className="text-sm font-semibold text-ink">
                        {point.name}
                      </p>
                    ))`,
  ],
  [
    `trip.bus_services.map((service) => (
                  <span className="inline-flex items-center gap-2 rounded-sm border border-line bg-surface px-3 py-2 text-sm font-semibold text-ink">
                    {service}
                  </span>
                ))`,
    `trip.bus_services.map((service) => (
                  <span key={service} className="inline-flex items-center gap-2 rounded-sm border border-line bg-surface px-3 py-2 text-sm font-semibold text-ink">
                    {service}
                  </span>
                ))`,
  ],
]);

patch("components/client/trip-row-card.jsx", [
  [
    `{trip.bus_services.slice(0, 3).map((service) => (
                <span className="hidden items-center gap-1 rounded-md bg-panel px-2 py-0.5 text-[11px] font-medium text-muted sm:inline-flex">
                  {service}
                </span>
              ))}`,
    `{trip.bus_services.slice(0, 3).map((service) => (
                <span key={service} className="hidden items-center gap-1 rounded-md bg-panel px-2 py-0.5 text-[11px] font-medium text-muted sm:inline-flex">
                  {service}
                </span>
              ))}`,
  ],
]);

patch("components/client/booking-form.jsx", [
  [
    `].map((method) => {
                    const selected = paymentMethod === method.key;
                    return (
                      <label
                        className={\`payment-method-label block rounded-sm border border-gray-200 p-4\${selected ? " selected" : ""}\`}
                      >`,
    `].map((method) => {
                    const selected = paymentMethod === method.key;
                    return (
                      <label
                        key={method.key}
                        className={\`payment-method-label block rounded-sm border border-gray-200 p-4\${selected ? " selected" : ""}\`}
                      >`,
  ],
  [
    `trip.bus_services.map((service) => (
                    <li className="flex items-center gap-2 text-xs">
                      {service}
                    </li>
                  ))`,
    `trip.bus_services.map((service) => (
                    <li key={service} className="flex items-center gap-2 text-xs">
                      {service}
                    </li>
                  ))`,
  ],
]);

patch("components/client/booking-stop-section.jsx", [
  [
    `return (
          <label
            className={\`stop-card flex items-start gap-3 rounded-sm border border-gray-200 p-4\${selected ? " selected" : ""}\`}
          >`,
    `return (
          <label
            key={idStr}
            className={\`stop-card flex items-start gap-3 rounded-sm border border-gray-200 p-4\${selected ? " selected" : ""}\`}
          >`,
  ],
]);

patch("components/client/phone-country-input.jsx", [
  [
    `{filtered.map(([dial, code, name]) => (
              <div
                role="option"`,
    `{filtered.map(([dial, code, name]) => (
              <div
                key={code}
                role="option"`,
  ],
]);

console.log("Changed:");
changed.forEach((c) => console.log(" -", c));
console.log(`Total files: ${changed.length}`);
