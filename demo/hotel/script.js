// Demo page: nothing is sent; availability and booking only show honest local responses.
const iso = date => date.toISOString().slice(0, 10);
const today = new Date();
const tomorrow = new Date(today.getTime() + 864e5);

for (const form of document.querySelectorAll('form')) {
  const { from, to } = form.elements;
  from.min = iso(today); to.min = iso(tomorrow);
  from.addEventListener('change', () => {
    if (!from.value) return;
    const next = new Date(new Date(from.value).getTime() + 864e5);
    to.min = iso(next);
    if (!to.value || to.value <= from.value) to.value = iso(next);
  });
}

function datesProblem(form) {
  const { from, to } = form.elements;
  for (const field of [from, to]) field.removeAttribute('aria-invalid');
  if (!from.value) return [from, 'Выберите дату заезда.'];
  if (!to.value || to.value <= from.value) return [to, 'Дата выезда должна быть позже заезда.'];
  return null;
}
const nightWord = n => (n % 10 === 1 && n % 100 !== 11) ? 'ночь' : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) ? 'ночи' : 'ночей';
function nights(form) {
  return Math.round((new Date(form.elements.to.value) - new Date(form.elements.from.value)) / 864e5);
}

const finder = document.querySelector('.finder');
finder.addEventListener('submit', event => {
  event.preventDefault();
  const status = finder.querySelector('.finder-status');
  const issue = datesProblem(finder);
  if (issue) { issue[0].setAttribute('aria-invalid', 'true'); status.textContent = issue[1]; issue[0].focus(); return; }
  const count = nights(finder);
  status.textContent = `Демо: ${count} ${nightWord(count)}, ${finder.elements.guests.value}. В рабочем сайте здесь будет ответ администратора или онлайн-бронирование.`;
  const booking = document.querySelector('.booking .form');
  booking.elements.from.value = finder.elements.from.value;
  booking.elements.to.value = finder.elements.to.value;
});

for (const link of document.querySelectorAll('[data-room]')) {
  link.addEventListener('click', () => { document.querySelector('.booking .form').elements.room.value = link.dataset.room; });
}

const form = document.querySelector('.booking .form');
const status = form.querySelector('.form-status');
form.addEventListener('submit', event => {
  event.preventDefault();
  const { name, phone, consent } = form.elements;
  for (const field of [name, phone]) field.removeAttribute('aria-invalid');
  let issue = null;
  if (!name.value.trim()) issue = [name, 'Укажите имя, чтобы администратор знал, к кому обратиться.'];
  else if (phone.value.replace(/\D/g, '').length < 10) issue = [phone, 'Проверьте телефон: нужно 10–11 цифр.'];
  else issue = datesProblem(form) || (!consent.checked ? [consent, 'Отметьте согласие — без него запрос не принять.'] : null);
  if (issue) {
    if (issue[0].type !== 'checkbox') issue[0].setAttribute('aria-invalid', 'true');
    status.className = 'form-status error'; status.textContent = issue[1]; issue[0].focus();
    return;
  }
  status.className = 'form-status ok';
  status.textContent = `Спасибо! ${form.elements.room.value}, ${nights(form)} ${nightWord(nights(form))}. Это демо: запрос никуда не отправлен.`;
  form.reset();
});
