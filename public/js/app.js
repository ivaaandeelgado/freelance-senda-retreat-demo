import { stays, landscapes, scenes } from "./catalog.js";
import { money, todayISO, addDays, nextWeekend, formatDate, validateDates, unavailableDates, quote, filterStays, itineraryText, itineraryICS } from "./domain.js";
import { getStorage, readState, writeState, STORAGE_KEY } from "./storage.js";
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const scrollToSection = (element) => element.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
const shapes = {
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  up: '<path d="M6 18 18 6M6 6h12v12"/>',
  down: '<path d="M12 5v14m-6-6 6 6 6-6"/>',
  heart: '<path d="M20.4 5.6a5.1 5.1 0 0 0-7.2 0L12 6.8l-1.2-1.2a5.1 5.1 0 0 0-7.2 7.2L12 21l8.4-8.2a5.1 5.1 0 0 0 0-7.2Z"/>',
  tree: '<path d="m12 3-5 6h3l-5 6h5v6h4v-6h5l-5-6h3Z"/>',
  mountain: '<path d="m2 20 7-14 5 8 3-5 5 11H2Z"/><path d="m6.5 11 2.5 2 2-3"/>',
  wave: '<path d="M2 9c4-5 5 5 10 0s6 5 10 0M2 16c4-5 5 5 10 0s6 5 10 0"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5Z"/>',
  bag: '<path d="M5 7h14l1 14H4L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/>',
  people: '<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3m1-17a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 5v2"/>',
  bed: '<path d="M3 5v16m18-8v8M3 17h18M3 9h6v8m0-8h8a4 4 0 0 1 4 4v4"/><path d="M4 9V7h4v2"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  plus: '<path d="M5 12h14M12 5v14"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18m-14 5h3m4 0h3"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  pin: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2"/>'
};
const icon = (name) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (shapes[name] || shapes.compass) + "</svg>";
function hydrateIcons(root = document) {
  $$("[data-icon]", root).forEach((el) => el.innerHTML = icon(el.dataset.icon));
}
const storage = getStorage();
let state = readState(storage), persistent = true, toastTimer;
const initialDates = nextWeekend();
const filters = { landscape: "all", guests: 2, maxPrice: 220, pets: false, sort: "recommended", favoritesOnly: false, checkin: "", checkout: "" };
$("#checkin").value = initialDates.checkin;
$("#checkout").value = initialDates.checkout;
setDateBounds($("#checkin"), $("#checkout"));
function setDateBounds(arrival, departure) {
  arrival.min = todayISO();
  arrival.max = addDays(todayISO(), 180);
  departure.min = addDays(arrival.value || todayISO(), 1);
  departure.max = addDays(todayISO(), 194);
}
function toast(message) {
  clearTimeout(toastTimer);
  $("#toast").textContent = message;
  $("#toast").hidden = false;
  toastTimer = setTimeout(() => $("#toast").hidden = true, 6e3);
}
function persist() {
  persistent = writeState(storage, state);
  return persistent;
}
function updateHeader() {
  $("#favorites-count").textContent = state.favorites.length;
  $("#favorites-toggle").setAttribute("aria-label", "Ver favoritos, " + state.favorites.length + " guardados");
  $("#favorites-toggle").setAttribute("aria-pressed", String(filters.favoritesOnly));
  $("#plan-dot").hidden = !state.plan;
}
function showScene(type) {
  const scene = scenes[type] || scenes.all;
  const img = $("#hero-image"), changed = !img.src.endsWith(scene.image);
  if (changed) {
    img.src = "./assets/" + scene.image;
    img.alt = type === "bosque" ? "La luz entre los \xE1rboles de un bosque" : type === "mar" ? "Una playa de arena clara y agua turquesa" : "Un lago rodeado de monta\xF1as y un refugio junto al agua";
    $(".hero").dataset.changing = "true";
    setTimeout(() => delete $(".hero").dataset.changing, 650);
  }
  $("#scene-line").textContent = scene.label;
  $("#scene-caption").textContent = scene.caption;
  $$("[data-scene]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.scene === (type === "all" ? "montana" : type))));
}
function setLandscape(value) {
  filters.landscape = value;
  $("#landscape").value = value;
  showScene(value);
  renderStays();
}
function renderStays() {
  const result = filterStays({ ...filters, favorites: state.favorites });
  $("#stay-grid").innerHTML = result.map((stay) => '<article class="stay-card" data-stay="' + stay.id + '"><a href="#refugio-' + stay.id + '" class="stay-link" data-open="' + stay.id + '" aria-haspopup="dialog"><div class="stay-photo"><img src="./assets/' + stay.image + '" width="960" height="800" alt="' + stay.alt + '" loading="lazy"><span class="stay-photo-label">' + stay.tag + '</span></div><div class="stay-title-row"><h3>' + stay.name + '</h3><p class="stay-price">' + money(stay.price) + ' <small>/ noche</small></p></div><div class="stay-meta"><span>' + icon("pin") + stay.region + "</span><span>" + icon("people") + stay.capacity + "</span><span>" + icon("bed") + stay.bedrooms + '</span></div><div class="stay-bottom"><span>' + landscapes[stay.landscape] + (stay.petFriendly ? " \xB7 Tu perro tambi\xE9n" : " \xB7 Para desconectar") + "</span>" + icon("arrow") + '</div></a><button type="button" class="icon-button favorite-button" data-favorite="' + stay.id + '" aria-label="' + (state.favorites.includes(stay.id) ? "Quitar de favoritos: " : "Guardar en favoritos: ") + stay.name + '" aria-pressed="' + state.favorites.includes(stay.id) + '">' + icon("heart") + "</button></article>").join("");
  $("#empty-state").hidden = result.length !== 0;
  $("#result-count").textContent = (result.length === 1 ? "1 refugio" : result.length + " refugios") + (filters.favoritesOnly ? " en tus favoritos" : " para cambiar de ritmo") + (filters.checkin ? " \xB7 " + formatDate(filters.checkin) + " \u2014 " + formatDate(filters.checkout) : "");
  $("#empty-message").textContent = filters.favoritesOnly ? "Aqu\xED aparecer\xE1n los refugios que guardes con el coraz\xF3n. Tambi\xE9n puedes ampliar tus filtros." : "No hay refugios con esta combinaci\xF3n. Prueba otras fechas, otro paisaje o ampl\xEDa el presupuesto.";
  $$("[data-filter]").forEach((button) => {
    const active = button.dataset.filter === filters.landscape;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  $("#price-output").textContent = money(filters.maxPrice * 100);
  updateHeader();
}
function toggleFavorite(id) {
  if (state.favorites.includes(id)) {
    state.favorites = state.favorites.filter((value) => value !== id);
  } else {
    state.favorites.push(id);
  }
  const saved = persist();
  renderStays();
  const next = $('[data-favorite="' + id + '"]');
  if (next) next.focus({ preventScroll: true });
  toast(saved ? state.favorites.includes(id) ? "Refugio guardado en tus favoritos." : "Refugio eliminado de tus favoritos." : "Favoritos actualizados para esta visita. Tu navegador no permite guardarlos.");
}
function resetFilters() {
  Object.assign(filters, { landscape: "all", guests: 2, maxPrice: 220, pets: false, sort: "recommended", favoritesOnly: false, checkin: "", checkout: "" });
  $("#landscape").value = "all";
  $("#guests").value = "2";
  $("#max-price").value = "220";
  $("#pets").checked = false;
  $("#sort").value = "recommended";
  $("#checkin").value = initialDates.checkin;
  $("#checkout").value = initialDates.checkout;
  $("#search-error").hidden = true;
  showScene("all");
  renderStays();
}
function openDialog(id) {
  const dialog = $("#" + id);
  if (!dialog.open) dialog.showModal();
}
function closeDialog(id) {
  $("#" + id).close();
}
function quoteMarkup(q) {
  return '<div class="quote-row"><span>' + q.nights + " noche" + (q.nights === 1 ? "" : "s") + " de alojamiento</span><span>" + money(q.lodging) + "</span></div>" + (q.discount ? '<div class="quote-row discount"><span>Descuento por 3 noches o m\xE1s</span><span>\u2212' + money(q.discount) + "</span></div>" : "") + '<div class="quote-row"><span>Preparaci\xF3n y limpieza</span><span>' + money(q.cleaning) + "</span></div>" + (q.breakfast ? '<div class="quote-row"><span>Desayunos \xB7 ' + q.guests + " personas</span><span>" + money(q.breakfast) + "</span></div>" : "") + (q.walk ? '<div class="quote-row"><span>Ruta guiada \xB7 ' + q.guests + " personas</span><span>" + money(q.walk) + "</span></div>" : "") + '<div class="quote-row total"><span>Total de ejemplo</span><span data-total="' + q.total + '">' + money(q.total) + '</span></div><p class="quote-note">' + (q.weekendNights ? q.weekendNights + " noche" + (q.weekendNights === 1 ? "" : "s") + " de viernes o s\xE1bado con suplemento del 20 %. " : "") + "Importes ficticios. Sin pagos ni reserva.</p>";
}
let activeStay = null;
function bookingInput() {
  return { stayId: activeStay.id, checkin: $("#book-checkin").value, checkout: $("#book-checkout").value, guests: Number($("#book-guests").value), breakfast: $("#book-breakfast").checked, walk: $("#book-walk").checked };
}
function updateQuote() {
  const input = bookingInput();
  $("#book-checkout").min = addDays(input.checkin, 1) || todayISO();
  const q = quote(activeStay, input);
  $("#booking-error").hidden = q.ok;
  $("#booking-error").textContent = q.ok ? "" : q.error;
  $("#quote-breakdown").innerHTML = q.ok ? quoteMarkup(q) : '<p class="quote-note">Ajusta los datos para ver el presupuesto.</p>';
  $("#save-plan").disabled = !q.ok;
  return q;
}
function openStay(id, edit = false) {
  const stay = stays.find((item) => item.id === id);
  if (!stay) return;
  activeStay = stay;
  const plan = edit && state.plan?.stayId === id ? state.plan : null;
  const dates = plan || { checkin: filters.checkin || $("#checkin").value, checkout: filters.checkout || $("#checkout").value, guests: Math.min(Number($("#guests").value), stay.capacity) };
  const blocked = unavailableDates(stay);
  $("#stay-content").innerHTML = '<div class="dialog-top"><h2 id="stay-title">' + stay.name + '</h2><button type="button" class="icon-button" data-close="stay-dialog" aria-label="Cerrar refugio">' + icon("close") + '</button></div><div class="stay-detail-layout"><div class="stay-detail-main"><img class="detail-photo" src="./assets/' + stay.image + '" width="960" height="800" alt="' + stay.alt + '"><p class="detail-region">' + icon("pin") + stay.region + " \xB7 " + landscapes[stay.landscape] + '</p><p class="detail-description">' + stay.description + '</p><ul class="amenities">' + stay.amenities.map((text) => "<li>" + icon("check") + text + "</li>").join("") + '</ul><p class="availability-note">Refugio imaginario. Fotograf\xEDa de ambiente.</p></div><form class="booking-panel" id="booking-form" novalidate><h3>Dale forma a tu escapada.</h3><p class="subtle">Desde ' + money(stay.price) + " / noche \xB7 Hasta " + stay.capacity + ' personas</p><div class="booking-fields"><div class="form-field"><label for="book-checkin">Llegada</label><input type="date" id="book-checkin" required value="' + dates.checkin + '" aria-describedby="booking-error"></div><div class="form-field"><label for="book-checkout">Salida</label><input type="date" id="book-checkout" required value="' + dates.checkout + '" aria-describedby="booking-error"></div><div class="form-field full"><label for="book-guests">Personas</label><select id="book-guests">' + Array.from({ length: stay.capacity }, (_, i) => '<option value="' + (i + 1) + '" ' + (i + 1 === Number(dates.guests) ? "selected" : "") + ">" + (i + 1) + " persona" + (i === 0 ? "" : "s") + "</option>").join("") + '</select></div></div><fieldset class="extras"><legend>Un poco m\xE1s de escapada</legend><label class="extra-option"><input type="checkbox" id="book-breakfast" ' + (plan?.breakfast ? "checked" : "") + '><span>Desayuno sin prisas<small>12 \u20AC / persona y noche</small></span></label><label class="extra-option"><input type="checkbox" id="book-walk" ' + (plan?.walk ? "checked" : "") + '><span>Una ruta con gu\xEDa<small>25 \u20AC / persona \xB7 una salida</small></span></label></fieldset><p id="booking-error" class="form-error" role="alert" hidden></p><div id="quote-breakdown" class="quote-breakdown" aria-live="polite" aria-atomic="true"></div><button class="button button-dark" id="save-plan" type="submit">Guardar mi plan' + icon("arrow") + '</button><p class="availability-note">Calendario de ejemplo: no disponible las noches del ' + formatDate(blocked[0]) + " y " + formatDate(blocked[1]) + ".</p></form></div>";
  setDateBounds($("#book-checkin"), $("#book-checkout"));
  $("#booking-form").addEventListener("input", updateQuote);
  $("#booking-form").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!updateQuote().ok) return;
    state.plan = bookingInput();
    const saved = persist();
    updateHeader();
    closeDialog("stay-dialog");
    renderPlan();
    openDialog("plan-dialog");
    toast(saved ? "Tu plan se ha guardado en este navegador." : "Plan preparado para esta visita. No se ha podido guardar en el navegador.");
  });
  updateQuote();
  openDialog("stay-dialog");
}
function renderPlan() {
  const plan = state.plan;
  if (!plan) {
    $("#plan-content").innerHTML = '<div class="plan-empty">' + icon("bag") + '<h3>Tu escapada empieza aqu\xED.</h3><p>Elige un refugio, a\xF1ade tus fechas y guarda el plan. Lo tendr\xE1s a mano para seguir imaginando.</p><button type="button" class="button button-dark" id="explore-from-plan">Explorar los refugios' + icon("arrow") + "</button></div>";
    return;
  }
  const stay = stays.find((s) => s.id === plan.stayId), q = quote(stay, plan, { historical: true });
  const past = plan.checkin < todayISO();
  $("#plan-content").innerHTML = '<div class="plan-summary"><img src="./assets/' + stay.image + '" width="240" height="240" alt="' + stay.alt + '"><div><h3>' + stay.name + "</h3><p>" + stay.region + "</p><p>" + formatDate(plan.checkin) + " \u2014 " + formatDate(plan.checkout) + " \xB7 " + q.nights + " noches</p><p>" + q.guests + " persona" + (q.guests === 1 ? "" : "s") + '</p></div></div><div class="quote-breakdown">' + quoteMarkup(q) + '</div><p class="plan-demo-note">' + (past ? "Las fechas de este plan ya han pasado. Puedes editarlas. " : persistent ? "Guardado solo en este navegador. " : "No se ha guardado: el almacenamiento est\xE1 desactivado. Descarga el plan para conservarlo. ") + 'Este plan es ficticio y no constituye una reserva.</p><div class="plan-actions"><button type="button" id="download-text" class="button button-dark">' + icon("download") + 'Descargar plan</button><button type="button" id="download-calendar" class="button button-outline">' + icon("calendar") + 'A\xF1adir al calendario</button></div><div class="plan-secondary"><button type="button" id="edit-plan" class="text-button">Cambiar mi plan' + icon("arrow") + '</button><button type="button" id="delete-plan" class="text-button">Eliminar plan</button></div>';
}
function download(content, name, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2e3);
}
document.addEventListener("click", (event) => {
  const close = event.target.closest("[data-close]");
  if (close) {
    closeDialog(close.dataset.close);
    return;
  }
  const favorite = event.target.closest("[data-favorite]");
  if (favorite) {
    toggleFavorite(favorite.dataset.favorite);
    return;
  }
  const open = event.target.closest("[data-open]");
  if (open) {
    event.preventDefault();
    openStay(open.dataset.open);
    return;
  }
  const filter = event.target.closest("[data-filter]");
  if (filter) {
    setLandscape(filter.dataset.filter);
    return;
  }
  const scene = event.target.closest("[data-scene]");
  if (scene) {
    setLandscape(scene.dataset.scene);
    return;
  }
  const id = event.target.closest("button")?.id;
  if (id === "download-text") download(itineraryText(state.plan), "senda-" + state.plan.stayId + "-plan.txt", "text/plain;charset=utf-8");
  if (id === "download-calendar") download(itineraryICS(state.plan), "senda-" + state.plan.stayId + ".ics", "text/calendar;charset=utf-8");
  if (id === "edit-plan") {
    closeDialog("plan-dialog");
    openStay(state.plan.stayId, true);
  }
  if (id === "delete-plan") {
    state.plan = null;
    const saved = persist();
    renderPlan();
    updateHeader();
    toast(saved ? "Plan eliminado. Puedes empezar otro cuando quieras." : "Plan eliminado de esta visita. No hemos podido actualizar el almacenamiento.");
  }
  if (id === "explore-from-plan") {
    closeDialog("plan-dialog");
    scrollToSection($("#refugios"));
    $("#collection-title").setAttribute("tabindex", "-1");
    $("#collection-title").focus({ preventScroll: true });
  }
});
$("#search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const dates = validateDates($("#checkin").value, $("#checkout").value);
  $("#search-error").hidden = dates.ok;
  if (!dates.ok) {
    $("#search-error").textContent = dates.error;
    $("#checkin").focus();
    return;
  }
  Object.assign(filters, { checkin: $("#checkin").value, checkout: $("#checkout").value, guests: Number($("#guests").value), landscape: $("#landscape").value });
  showScene(filters.landscape);
  renderStays();
  scrollToSection($("#refugios"));
});
$("#checkin").addEventListener("change", () => {
  $("#checkout").min = addDays($("#checkin").value, 1);
});
$("#pets").addEventListener("change", (event) => {
  filters.pets = event.target.checked;
  renderStays();
});
$("#sort").addEventListener("change", (event) => {
  filters.sort = event.target.value;
  renderStays();
});
$("#max-price").addEventListener("input", (event) => {
  filters.maxPrice = Number(event.target.value);
  renderStays();
});
$("#favorites-toggle").addEventListener("click", () => {
  filters.favoritesOnly = !filters.favoritesOnly;
  renderStays();
  scrollToSection($("#refugios"));
});
$("#reset-filters").addEventListener("click", resetFilters);
$("#open-plan").addEventListener("click", () => {
  renderPlan();
  openDialog("plan-dialog");
});
$("#privacy-button").addEventListener("click", () => openDialog("privacy-dialog"));
$("#clear-data").addEventListener("click", () => {
  let cleared = true;
  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    cleared = false;
  }
  state = { favorites: [], plan: null };
  filters.favoritesOnly = false;
  renderStays();
  renderPlan();
  $("#privacy-feedback").textContent = cleared ? "Tus favoritos y tu plan se han borrado." : "Datos borrados de esta visita. El navegador no permite modificar el almacenamiento.";
});
$("#surprise-me").addEventListener("click", () => {
  const options = filterStays({ ...filters, favorites: state.favorites });
  if (!options.length) {
    toast("Ampl\xEDa los filtros para descubrir un refugio.");
    scrollToSection($("#refugios"));
    return;
  }
  openStay(options[Math.floor(Math.random() * options.length)].id);
});
$$("dialog").forEach((dialog) => dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
  }
}));
hydrateIcons();
renderStays();
export {
  icon
};
