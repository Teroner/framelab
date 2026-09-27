// Demo page: the schedule is static data and the form never leaves the browser.
const week = {
  'Пн': [['08:00', 'Хатха для начинающих', 'Анна'], ['19:30', 'Растяжка и спина', 'Олег']],
  'Вт': [['10:00', 'Растяжка и спина', 'Олег'], ['20:00', 'Медитация и дыхание', 'Мария']],
  'Ср': [['08:00', 'Хатха для начинающих', 'Анна'], ['19:30', 'Хатха для начинающих', 'Мария']],
  'Чт': [['10:00', 'Растяжка и спина', 'Олег'], ['20:00', 'Медитация и дыхание', 'Мария']],
  'Пт': [['08:00', 'Хатха для начинающих', 'Анна'], ['19:00', 'Растяжка и спина', 'Олег']],
  'Сб': [['10:00', 'Хатха для начинающих', 'Анна'], ['12:00', 'Растяжка и спина', 'Олег']],
  'Вс': [['11:00', 'Медитация и дыхание', 'Мария']],
};
const days = document.querySelector('.days');
const slots = document.querySelector('.slots');
const form = document.querySelector('.form');

function show(day) {
  for (const button of days.children) button.setAttribute('aria-pressed', String(button.textContent === day));
  slots.replaceChildren(...week[day].map(([time, name, teacher]) => {
    const li = document.createElement('li');
    li.innerHTML = `<time></time><div><strong></strong><br><span></span></div><a href="#signup">Записаться</a>`;
    li.querySelector('time').textContent = time;
    li.querySelector('strong').textContent = name;
    li.querySelector('span').textContent = `ведёт ${teacher}`;
    li.querySelector('a').addEventListener('click', () => { form.elements.practice.value = name; });
    return li;
  }));
}
for (const day of Object.keys(week)) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = day;
  button.addEventListener('click', () => show(day));
  days.append(button);
}
show(Object.keys(week)[(new Date().getDay() + 6) % 7]);

const status = form.querySelector('.form-status');
function problem() {
  const { name, phone, consent } = form.elements;
  for (const field of [name, phone]) field.removeAttribute('aria-invalid');
  if (!name.value.trim()) return [name, 'Укажите имя — так администратор к вам обратится.'];
  if (phone.value.replace(/\D/g, '').length < 10) return [phone, 'Проверьте телефон: нужно 10–11 цифр.'];
  if (!consent.checked) return [consent, 'Отметьте согласие — без него мы не можем записать вас.'];
  return null;
}
form.addEventListener('submit', event => {
  event.preventDefault();
  const issue = problem();
  if (issue) {
    const [field, text] = issue;
    if (field.type !== 'checkbox') field.setAttribute('aria-invalid', 'true');
    status.className = 'form-status error';
    status.textContent = text;
    field.focus();
    return;
  }
  status.className = 'form-status ok';
  status.textContent = `Спасибо, ${form.elements.name.value.trim()}! Это демо-страница: заявка никуда не отправлена.`;
  form.reset();
});
