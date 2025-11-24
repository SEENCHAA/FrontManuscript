// Определяем роли пользователя
export type Role = 0 | 1 | 2; 
// 0: Buyer (Обычный пользователь)
// 1: Manager (Модератор)
// 2: Admin (Администратор)

// Интерфейс пользователя (User)
export interface User {
    id: number;
    username: string;
    role: Role;
    // На фронтенде обычно исключают пароль и другую чувствительную информацию
}

// Интерфейс отдельной буквы (Letter / Признак)
export interface Letter {
    id: number;
    name: string;
    description: string;
    periodStart: number;
    periodEnd: number;
    details: string;
    imageURL: string; // Обратите внимание на регистр
    isActive: boolean;
}

// Интерфейс письма в составе рукописи (ManuscriptLetter) - для отображения состава
export interface ManuscriptLetter {
    letterID: number;
    name: string;
    description: string;
    imageURL: string;
    periodStart: number;
    periodEnd: number;
    quantity: number; // Количество в заявке
}

// Интерфейс Рукописи (Manuscript) - полный
export interface Manuscript {
    id: number;
    letters: ManuscriptLetter[];
    calculatedPeriod: string;
    manuscriptText: string;

    // Добавленные поля, основанные на структуре
    userID: number;
    user: User; // Владелец рукописи

    moderatorID: number | null; // ID модератора, может быть null
    moderator: User | null; // Модератор, может быть null

    status: string; // Текущий статус ('draft', 'submitted', 'completed' и т.д.)
    createdAt: string; // Дата создания (используем string для ISO-строки)
    submittedAt: string | null; // Дата отправки на проверку
    finishedAt: string | null; // Дата завершения/отклонения
}