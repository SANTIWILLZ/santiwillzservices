import './styles.css';
import { api } from '@appdeploy/client';

type Category = 'gadgets' | 'automobile' | 'technical';
const titles: Record<Category, string> = {
  gadgets: 'Gadgets',
  automobile: 'Automobile',
  technical: 'Technical Support & Installation',
};
const options: Record<Category, string[]> = {
  gadgets: [
    'Buy a gadget',
    'Repair a device',
    'Upgrade a device',
    'Accessories / other',
  ],
  automobile: [
    'Buy a vehicle',
    'Sell a vehicle',
    'Source a vehicle',
    'Other automobile enquiry',
  ],
  technical: [
    'Installation',
    'Repair / troubleshooting',
    'Maintenance',
    'Technical consultation',
  ],
};
const details: Record<Category, Record<string, string[]>> = {
  gadgets: {
    'Buy a gadget': ['Device / model', 'Specifications or condition', 'Budget'],
    'Repair a device': [
      'Device / model',
      'Problem or fault',
      'Preferred service date',
    ],
    'Upgrade a device': ['Device / model', 'Upgrade needed', 'Budget'],
    'Accessories / other': ['Item needed', 'Specifications', 'Budget'],
  },
  automobile: {
    'Buy a vehicle': ['Preferred make / model', 'Year and condition', 'Budget'],
    'Sell a vehicle': [
      'Make / model / year',
      'Condition and mileage',
      'Expected price',
    ],
    'Source a vehicle': ['Make / model / year', 'Requirements', 'Budget'],
    'Other automobile enquiry': [
      'Type of service',
      'Vehicle details',
      'Requirements',
    ],
  },
  technical: {
    Installation: [
      'Equipment / system',
      'Installation requirements',
      'Preferred date',
    ],
    'Repair / troubleshooting': [
      'Equipment / device',
      'Fault description',
      'Urgency',
    ],
    Maintenance: ['Equipment / system', 'Maintenance needed', 'Preferred date'],
    'Technical consultation': [
      'Technology / system',
      'What help do you need?',
      'Preferred date',
    ],
  },
};
const modal = document.querySelector<HTMLDialogElement>('#wizard')!;
const content = document.querySelector<HTMLElement>('#stepContent')!;
const feedback = document.querySelector<HTMLElement>('#feedback')!;
const next = document.querySelector<HTMLButtonElement>('#next')!;
const back = document.querySelector<HTMLButtonElement>('#back')!;
let category: Category = 'gadgets';
let step = 0;
let requestType = '';
let fields: Record<string, string> = {};
let contact: Record<string, string> = {};
let completedUrl = '';
let requestId = crypto.randomUUID();
const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ] || c
  );
function render() {
  feedback.textContent = '';
  feedback.style.color = '#bd2028';
  document.querySelector('#wizardTitle')!.textContent = titles[category];
  document.querySelector<HTMLElement>('#bar')!.style.width =
    ((step + 1) / 4) * 100 + '%';
  back.style.visibility = step === 0 ? 'hidden' : 'visible';
  next.textContent =
    step === 3
      ? completedUrl
        ? 'Open WhatsApp ↗'
        : 'Register & open WhatsApp ↗'
      : 'Continue →';
  if (step === 0) {
    content.innerHTML =
      '<p class="question">What would you like to do?</p><div class="choices">' +
      options[category]
        .map(
          value =>
            '<button type="button" class="' +
            (requestType === value ? 'selected' : '') +
            '" data-choice="' +
            escapeHtml(value) +
            '">' +
            escapeHtml(value) +
            '</button>'
        )
        .join('') +
      '</div>';
    content
      .querySelectorAll<HTMLButtonElement>('[data-choice]')
      .forEach(button =>
        button.addEventListener('click', () => {
          requestType = button.dataset.choice || '';
          fields = {};
          render();
        })
      );
  } else if (step === 1) {
    content.innerHTML =
      '<p class="question">Tell us more about your request</p>' +
      details[category][requestType]
        .map(
          (label, i) =>
            '<label class="field">' +
            escapeHtml(label) +
            '<input data-detail="' +
            i +
            '" maxlength="200" required value="' +
            escapeHtml(fields[label] || '') +
            '" placeholder="Your answer"></label>'
        )
        .join('');
  } else if (step === 2) {
    content.innerHTML =
      '<p class="question">How can we contact you?</p>' +
      [
        ['name', 'Full name'],
        ['phone', 'WhatsApp number'],
        ['location', 'City / state'],
      ]
        .map(
          ([key, label]) =>
            '<label class="field">' +
            label +
            '<input data-contact="' +
            key +
            '" maxlength="120" required value="' +
            escapeHtml(contact[key] || '') +
            '" placeholder="' +
            label +
            '"></label>'
        )
        .join('');
  } else {
    const lines = [
      titles[category],
      requestType,
      ...Object.entries(fields).map(([key, value]) => key + ': ' + value),
      'Name: ' + contact.name,
      'WhatsApp: ' + contact.phone,
      'Location: ' + contact.location,
    ];
    content.innerHTML =
      '<p class="question">Review your enquiry</p><div class="summary">' +
      escapeHtml(lines.join('\n')) +
      '</div>';
  }
}
document
  .querySelectorAll<HTMLButtonElement>('[data-category]')
  .forEach(button =>
    button.addEventListener('click', () => {
      const selectedCard = button.closest<HTMLElement>('.cards article');
      document.querySelectorAll<HTMLElement>('.cards article').forEach(card => {
        card.classList.toggle('is-active', card === selectedCard);
      });

      category = button.dataset.category as Category;
      step = 0;
      requestType = '';
      fields = {};
      contact = {};
      completedUrl = '';
      requestId = crypto.randomUUID();
      render();
      modal.showModal();
    })
  );

// The whole card opens the same enquiry flow as its accessible action button.
document.querySelectorAll<HTMLElement>('.cards article').forEach(card => {
  card.addEventListener('click', event => {
    if ((event.target as HTMLElement).closest('button')) return;
    card.querySelector<HTMLButtonElement>('[data-category]')?.click();
  });
});
document.querySelector('#exit')!.addEventListener('click', () => modal.close());
back.addEventListener('click', () => {
  if (next.disabled || completedUrl) return;
  if (step === 1) {
    content.querySelectorAll<HTMLInputElement>('[data-detail]').forEach((input, i) => {
      fields[details[category][requestType][i]] = input.value;
    });
  }
  if (step === 2) {
    content.querySelectorAll<HTMLInputElement>('[data-contact]').forEach(input => {
      contact[input.dataset.contact!] = input.value;
    });
  }
  if (step > 0) {
    step--;
    render();
  }});
next.addEventListener('click', async () => {
  if (next.disabled) return;
  if (step === 0 && !requestType) {
    feedback.textContent = 'Please choose an option.';
    return;
  }
  if (step === 1) {
    const inputs = [
      ...content.querySelectorAll<HTMLInputElement>('[data-detail]'),
    ];
    if (inputs.some(input => !input.value.trim())) {
      feedback.textContent = 'Please answer each question.';
      return;
    }
    fields = Object.fromEntries(
      inputs.map((input, i) => [
        details[category][requestType][i],
        input.value.trim(),
      ])
    );
  }
  if (step === 2) {
    const inputs = [
      ...content.querySelectorAll<HTMLInputElement>('[data-contact]'),
    ];
    if (inputs.some(input => !input.value.trim())) {
      feedback.textContent = 'Please complete your contact details.';
      return;
    }
    contact = Object.fromEntries(
      inputs.map(input => [input.dataset.contact || '', input.value.trim()])
    );
    if ((!/^[+0-9 ()-]{7,22}$/.test(contact.phone) || !/^\d{7,15}$/.test(contact.phone.replace(/\D/g, '')))) {
      feedback.textContent = 'Enter a valid WhatsApp number.';
      return;
    }
  }
  if (step < 3) {
    step++;
    render();
    return;
  }
  if (completedUrl) {
    window.open(completedUrl, '_blank', 'noopener,noreferrer');
    return;
  }
  next.disabled = true;
  next.textContent = 'Registering...';
  try {
    const response = await api.post('/api/orders', {
      category,
      requestType,
      fields,
      requestId,
      ...contact,
    });
    const orderId = response.data.orderId as string;
    const message = [
      'Hello Santi Willz Services!',
      'ORDER REFERENCE: ' + orderId,
      'CATEGORY: ' + titles[category],
      'REQUEST: ' + requestType,
      ...Object.entries(fields).map(([key, value]) => key + ': ' + value),
      'CUSTOMER: ' + contact.name,
      'PHONE: ' + contact.phone,
      'LOCATION: ' + contact.location,
      'Please assist with my enquiry.',
    ].join('\n');
    completedUrl =
      'https://wa.me/2348051816985?text=' + encodeURIComponent(message);
    feedback.style.color = '#237b40';
    feedback.textContent =
      'Order ' + orderId + ' registered. Continue to WhatsApp and tap Send.';
    back.style.visibility = 'hidden';
    next.textContent = 'Open WhatsApp ↗';
    window.open(completedUrl, '_blank', 'noopener,noreferrer');
  } catch {
    feedback.style.color = '#bd2028';
    feedback.textContent =
      'Registration failed. Please try again. Your enquiry could not be confirmed. Retry to check and register it safely.';
    next.textContent = 'Register & open WhatsApp ↗';
  } finally {
    next.disabled = false;
  }
});
