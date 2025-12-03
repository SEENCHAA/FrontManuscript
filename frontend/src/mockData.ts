import { type Letter } from './types';
const MOCK_IMAGE = "mock-card.jpg"


export const MOCK_LETTERS: Letter[] = [
    {
        id: 1, 
        name: "Буква ѣ (ять)",
        description: "Активно использовалась с XI по XVIII вв.",
        details: "Заглушка для буквы Ять. Буква сохранялась до реформы 1918 года.",
        periodStart: 1000,
        periodEnd: 1750,
        imageURL: MOCK_IMAGE, 
        isActive: true,
    },
    {
        id: 2,
        name: "Буква ѵ (ижица)",
        description: "Окончательно исчезает в XVIII веке.",
        details: "Заглушка для буквы Ижица. Была исключена из гражданского шрифта в 1735 году.",
        periodStart: 1000,
        periodEnd: 1700,
        imageURL: MOCK_IMAGE, 
        isActive: true,
    },
    {
        id: 3,
        name: "Буква Ѳ (фита)",
        description: "Исчезает в начале XX века после реформы.",
        details: "Заглушка для буквы Фита. Использовалась для передачи греческого звука 'ф', заменена на 'ф' в 1918 году.",
        periodStart: 1000,
        periodEnd: 1918,
        imageURL: MOCK_IMAGE, 
        isActive: true,
    },
    {
        id: 4,
        name: "Твёрдый знак",
        description: "Употреблялся на конце слов до реформы 1918 года.",
        details: "Заглушка для Твёрдого знака. После реформы его употребление было ограничено.",
        periodStart: 1000,
        periodEnd: 1918,
        imageURL: MOCK_IMAGE, 
        isActive: true,
    },
    {
        id: 5,
        name: "Буква i (i десятеричное)",
        description: "Отменена реформой 1918 года.",
        details: "Заглушка для i десятеричного. Использовалась наряду с 'и', затем полностью упразднена.",
        periodStart: 1000,
        periodEnd: 1918,
        imageURL: MOCK_IMAGE, 
        isActive: true,
    },
    {
        id: 6,
        name: "Буква ѯ (кси)",
        description: "Использовалась в древнерусских текстах с XI по XVIII век.",
        details: "Заглушка для буквы Кси. Пришла из греческого алфавита, обозначала 'кс'. Вышла из употребления к XVIII веку.",
        periodStart: 1000,
        periodEnd: 1700,
        imageURL: MOCK_IMAGE, 
        isActive: true,
    }
];