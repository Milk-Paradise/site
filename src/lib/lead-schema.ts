import { z } from 'zod';
const clean = (max: number) => z.string().trim().max(max).refine(value => !/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value), 'Недопустимые символы');
export const leadSchema = z.object({
  name: clean(80).pipe(z.string().min(2)),
  method: z.enum(['telegram','email','phone']),
  contact: clean(160).pipe(z.string().min(5)),
  project: z.enum(['landing','multipage','catalog','admin','other']),
  description: clean(2000).default(''), business: clean(120).default(''),
  deadline: clean(120).default(''), features: clean(500).default(''),
  website: z.string().max(200).default(''), consent: z.literal(true),
  token: z.string().min(1).max(2048), requestId: z.uuid(),
}).superRefine((value,context)=>{
  const valid = value.method==='telegram' ? /^@?[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(value.contact)
    : value.method==='email' ? z.email().safeParse(value.contact).success
    : /^[+\d ()-]{10,25}$/.test(value.contact) && value.contact.replace(/\D/g,'').length>=10 && value.contact.replace(/\D/g,'').length<=15;
  if (!valid) context.addIssue({code:'custom',path:['contact'],message:'Проверьте контакт для выбранного способа связи.'});
});
export type Lead = z.infer<typeof leadSchema>;
export const projectLabels: Record<Lead['project'],string> = {landing:'Лендинг',multipage:'Многостраничный сайт',catalog:'Каталог',admin:'Сайт с админкой',other:'Другое / пока не знаю'};
