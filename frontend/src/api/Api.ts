/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export enum RoleRole {
  /** 0 - Обычный пользователь */
  Buyer = 0,
  /** 1 - Модератор */
  Manager = 1,
  /** 2 - Администратор */
  Admin = 2,
}

export interface DsLetter {
  description?: string;
  details?: string;
  id?: number;
  image_url?: string;
  is_active?: boolean;
  name?: string;
  period_end?: number;
  period_start?: number;
}

export interface DsManuscript {
  calculated_period?: string;
  created_at?: string;
  finished_at?: string;
  id?: number;
  /** ВАЖНО: json:"letters" (с маленькой), чтобы фронт увидел массив */
  letters?: DsManuscriptLetter[];
  manuscript_text?: string;
  moderator?: DsUser;
  moderator_id?: number;
  status?: string;
  submitted_at?: string;
  /** Связи */
  user?: DsUser;
  user_id?: number;
}

export interface DsManuscriptLetter {
  /** ВАЖНО: json:"letter" чтобы получить название и картинку внутри корзины */
  letter?: DsLetter;
  letter_id?: number;
  manuscript_id?: number;
  quantity?: number;
}

export interface DsManuscriptListItemLetterResponse {
  description?: string;
  letter_id?: number;
  name?: string;
  period_end?: number;
  period_start?: number;
  quantity?: number;
}

export interface DsManuscriptListItemResponse {
  calculated_period?: string;
  /** === ДОБАВЛЕННЫЕ ПОЛЯ === */
  created_at?: string;
  /** Дата завершения (может быть null) */
  finished_at?: string;
  id?: number;
  letters?: DsManuscriptListItemLetterResponse[];
  manuscript_text?: string;
  /** Информация о Модераторе */
  moderator_id?: number;
  moderator_name?: string;
  status?: string;
  /** Информация о Создателе */
  user_id?: number;
  username?: string;
}

export interface DsUser {
  id?: number;
  password?: string;
  role?: RoleRole;
  username?: string;
}

export interface HandlerBasketStatusResponse {
  /** @example 5 */
  letter_count?: number;
  /** @example 10 */
  manuscript_id?: number;
}

export interface HandlerErrorResponse {
  /** @example "invalid json or record not found" */
  error?: string;
}

export interface HandlerImageUploadResponse {
  /** @example "http://127.0.0.1:9000/manuscripts/10_uuid.jpg" */
  image_url?: string;
  /** @example "Image successfully uploaded and link updated" */
  status?: string;
}

export interface HandlerLoginRequest {
  /** @example "testpassword" */
  password?: string;
  /** @example "testuser" */
  username?: string;
}

export interface HandlerLoginResponse {
  /** @example "Buyer" */
  role?: string;
  /** @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." */
  token?: string;
}

export interface HandlerModerateRequest {
  /**
   * Должен быть 'finished' или 'rejected'
   * @example "finished"
   */
  status?: string;
}

export interface HandlerRegisterResponse {
  /** @example 42 */
  user_id?: number;
}

export interface HandlerStatusResponse {
  /** @example "updated" */
  status?: string;
}

export interface HandlerUpdateQuantityRequest {
  /** @example 3 */
  quantity?: number;
}

export interface HandlerUpdateUserInput {
  /** @example "newsecurepassword" */
  password?: string;
  /** @example "updateduser" */
  username?: string;
}

export interface HandlerUserRegisterInput {
  /** @example "securepassword" */
  password?: string;
  /** @example "newuser" */
  username?: string;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Manuscript API
 * @version 1.0
 * @license AS IS (NO WARRANTY)
 * @contact API Support <support@example.com>
 *
 * API для работы с рукописями, письмами и пользователями.
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  letters = {
    /**
     * @description Возвращает список всех активных писем, опционально фильтруя по тексту. Доступно всем.
     *
     * @tags Letters
     * @name LettersList
     * @summary Получить список писем (Letter)
     * @request GET:/letters
     * @response `200` `(DsLetter)[]` Список писем
     * @response `500` `HandlerErrorResponse` Ошибка сервера
     */
    lettersList: (
      query?: {
        /** Фильтр для поиска по имени/описанию */
        filter?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<DsLetter[], HandlerErrorResponse>({
        path: `/letters`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Создает новое письмо. Требуется роль Manager или Admin.
     *
     * @tags Letters
     * @name LettersCreate
     * @summary Создать новое письмо
     * @request POST:/letters
     * @secure
     * @response `201` `DsLetter` Созданное письмо
     * @response `400` `HandlerErrorResponse` Неверный формат запроса
     * @response `401` `HandlerErrorResponse` Неавторизован
     * @response `403` `HandlerErrorResponse` Нет доступа
     * @response `500` `HandlerErrorResponse` Ошибка сервера
     */
    lettersCreate: (letter: DsLetter, params: RequestParams = {}) =>
      this.request<DsLetter, HandlerErrorResponse>({
        path: `/letters`,
        method: "POST",
        body: letter,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает письмо по его ID. Доступно всем.
     *
     * @tags Letters
     * @name LettersDetail
     * @summary Получить конкретное письмо
     * @request GET:/letters/{id}
     * @response `200` `DsLetter` Детали письма
     * @response `404` `HandlerErrorResponse` Письмо не найдено
     */
    lettersDetail: (id: number, params: RequestParams = {}) =>
      this.request<DsLetter, HandlerErrorResponse>({
        path: `/letters/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Обновляет данные письма по ID. Требуется роль Manager или Admin.
     *
     * @tags Letters
     * @name LettersUpdate
     * @summary Обновить письмо
     * @request PUT:/letters/{id}
     * @secure
     * @response `200` `HandlerStatusResponse` Успешное обновление
     * @response `400` `HandlerErrorResponse` Неверный формат запроса
     * @response `401` `HandlerErrorResponse` Неавторизован
     * @response `403` `HandlerErrorResponse` Нет доступа
     * @response `500` `HandlerErrorResponse` Ошибка сервера
     */
    lettersUpdate: (id: number, letter: DsLetter, params: RequestParams = {}) =>
      this.request<HandlerStatusResponse, HandlerErrorResponse>({
        path: `/letters/${id}`,
        method: "PUT",
        body: letter,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Удаляет письмо по ID. Требуется роль Manager или Admin.
     *
     * @tags Letters
     * @name LettersDelete
     * @summary Удалить письмо
     * @request DELETE:/letters/{id}
     * @secure
     * @response `200` `HandlerStatusResponse` Успешное удаление
     * @response `401` `HandlerErrorResponse` Неавторизован
     * @response `403` `HandlerErrorResponse` Нет доступа
     * @response `500` `HandlerErrorResponse` Ошибка сервера
     */
    lettersDelete: (id: number, params: RequestParams = {}) =>
      this.request<HandlerStatusResponse, HandlerErrorResponse>({
        path: `/letters/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Загружает изображение в MinIO и сохраняет URL в базе данных для указанного письма. Требуется роль Manager или Admin.
     *
     * @tags Letters
     * @name ImageCreate
     * @summary Загрузить изображение для письма
     * @request POST:/letters/{id}/image
     * @secure
     * @response `200` `HandlerImageUploadResponse` Успешная загрузка
     * @response `400` `HandlerErrorResponse` Неверный ID или файл не предоставлен
     * @response `401` `HandlerErrorResponse` Неавторизован
     * @response `403` `HandlerErrorResponse` Нет доступа
     * @response `500` `HandlerErrorResponse` Ошибка сервера (MinIO или БД)
     */
    imageCreate: (
      id: number,
      data: {
        /** Файл изображения */
        image: File;
      },
      params: RequestParams = {},
    ) =>
      this.request<HandlerImageUploadResponse, HandlerErrorResponse>({
        path: `/letters/${id}/image`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),

    /**
     * @description Добавляет указанное письмо в текущий черновик рукописи пользователя. Если черновика нет, он создается. Требуется роль Buyer.
     *
     * @tags Letters
     * @name ManuscriptCreate
     * @summary Добавить письмо в черновик рукописи
     * @request POST:/letters/{id}/manuscript
     * @secure
     * @response `201` `Record<string,any>` Письмо добавлено
     * @response `400` `HandlerErrorResponse` Неверный формат запроса
     * @response `401` `HandlerErrorResponse` Неавторизован
     * @response `403` `HandlerErrorResponse` Нет доступа
     * @response `500` `HandlerErrorResponse` Ошибка сервера
     */
    manuscriptCreate: (
      id: number,
      data: HandlerUpdateQuantityRequest,
      params: RequestParams = {},
    ) =>
      this.request<Record<string, any>, HandlerErrorResponse>({
        path: `/letters/${id}/manuscript`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  manuscripts = {
    /**
     * @description Возвращает список рукописей, отфильтрованный по статусу и/или датам. Администраторы и модераторы видят все заявки, покупатели – только свои.
     *
     * @tags Manuscripts
     * @name ManuscriptsList
     * @summary Фильтрация списка рукописей
     * @request GET:/manuscripts
     * @secure
     * @response `200` `(DsManuscriptListItemResponse)[]` Список рукописей
     * @response `401` `HandlerErrorResponse` Неавторизован
     * @response `403` `HandlerErrorResponse` Нет доступа
     * @response `500` `HandlerErrorResponse` Ошибка сервера
     */
    manuscriptsList: (
      query?: {
        /** Фильтр по статусу (например, 'submitted', 'finished') */
        status?: string;
        /** Начальная дата (YYYY-MM-DD) */
        start?: string;
        /** Конечная дата (YYYY-MM-DD) */
        end?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<DsManuscriptListItemResponse[], HandlerErrorResponse>({
        path: `/manuscripts`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает ID текущего черновика (Manuscript) пользователя и количество писем в нем. Требуется роль Buyer.
     *
     * @tags Manuscripts
     * @name BasketList
     * @summary Статус корзины/черновика
     * @request GET:/manuscripts/basket
     * @secure
     * @response `200` `HandlerBasketStatusResponse` Статус черновика
     * @response `401` `HandlerErrorResponse` Неавторизован
     * @response `403` `HandlerErrorResponse` Нет доступа
     * @response `404` `HandlerErrorResponse` Черновик не найден
     */
    basketList: (params: RequestParams = {}) =>
      this.request<HandlerBasketStatusResponse, HandlerErrorResponse>({
        path: `/manuscripts/basket`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает детали рукописи по ID. Требуется авторизация (Owner, Manager, Admin).
     *
     * @tags Manuscripts
     * @name ManuscriptsDetail
     * @summary Получить конкретную рукопись
     * @request GET:/manuscripts/{id}
     * @secure
     * @response `200` `DsManuscript` Детали рукописи
     * @response `401` `HandlerErrorResponse` Неавторизован
     * @response `403` `HandlerErrorResponse` Нет доступа
     * @response `404` `HandlerErrorResponse` Рукопись не найдена
     */
    manuscriptsDetail: (id: number, params: RequestParams = {}) =>
      this.request<DsManuscript, HandlerErrorResponse>({
        path: `/manuscripts/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Обновляет поля рукописи по ID. Доступно только владельцу (Owner) и только в статусе 'draft'.
     *
     * @tags Manuscripts
     * @name ManuscriptsUpdate
     * @summary Обновить рукопись
     * @request PUT:/manuscripts/{id}
     * @secure
     * @response `200` `HandlerStatusResponse` Успешное обновление
     * @response `400` `HandlerErrorResponse` Неверный формат запроса
     * @response `401` `HandlerErrorResponse` Неавторизован
     * @response `403` `HandlerErrorResponse` Нет доступа
     * @response `500` `HandlerErrorResponse` Ошибка сервера
     */
    manuscriptsUpdate: (
      id: number,
      data: DsManuscript,
      params: RequestParams = {},
    ) =>
      this.request<HandlerStatusResponse, HandlerErrorResponse>({
        path: `/manuscripts/${id}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Удаляет рукопись по ID. Доступно владельцу (Owner) в статусе 'draft' или Admin.
     *
     * @tags Manuscripts
     * @name ManuscriptsDelete
     * @summary Удалить рукопись
     * @request DELETE:/manuscripts/{id}
     * @secure
     * @response `200` `HandlerStatusResponse` Успешное удаление
     * @response `401` `HandlerErrorResponse` Неавторизован
     * @response `403` `HandlerErrorResponse` Нет доступа
     * @response `500` `HandlerErrorResponse` Ошибка сервера
     */
    manuscriptsDelete: (id: number, params: RequestParams = {}) =>
      this.request<HandlerStatusResponse, HandlerErrorResponse>({
        path: `/manuscripts/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Обновляет количество конкретного письма (Letter) внутри рукописи (Manuscript). Доступно владельцу (Owner) в статусе 'draft'.
     *
     * @tags Manuscripts
     * @name LettersUpdate
     * @summary Обновить количество письма в рукописи
     * @request PUT:/manuscripts/{id}/letters/{lid}
     * @secure
     * @response `200` `HandlerStatusResponse` Успешное обновление
     * @response `400` `HandlerErrorResponse` Неверный формат запроса
     * @response `401` `HandlerErrorResponse` Неавторизован
     * @response `403` `HandlerErrorResponse` Нет доступа
     * @response `500` `HandlerErrorResponse` Ошибка сервера
     */
    lettersUpdate: (
      id: number,
      lid: number,
      data: HandlerUpdateQuantityRequest,
      params: RequestParams = {},
    ) =>
      this.request<HandlerStatusResponse, HandlerErrorResponse>({
        path: `/manuscripts/${id}/letters/${lid}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Удаляет связь между письмом (Letter) и рукописью (Manuscript). Доступно владельцу (Owner) в статусе 'draft'.
     *
     * @tags Manuscripts
     * @name LettersDelete
     * @summary Удалить письмо из рукописи
     * @request DELETE:/manuscripts/{id}/letters/{lid}
     * @secure
     * @response `200` `HandlerStatusResponse` Успешное удаление
     * @response `401` `HandlerErrorResponse` Неавторизован
     * @response `403` `HandlerErrorResponse` Нет доступа
     * @response `500` `HandlerErrorResponse` Ошибка сервера
     */
    lettersDelete: (id: number, lid: number, params: RequestParams = {}) =>
      this.request<HandlerStatusResponse, HandlerErrorResponse>({
        path: `/manuscripts/${id}/letters/${lid}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Завершает ('finished') или отклоняет ('rejected') рукопись. Требуется роль Manager или Admin.
     *
     * @tags Manuscripts
     * @name ModerationUpdate
     * @summary Модерация рукописи
     * @request PUT:/manuscripts/{id}/moderation
     * @secure
     * @response `200` `HandlerStatusResponse` Успешная модерация
     * @response `400` `HandlerErrorResponse` Неверный статус или ошибка БД
     * @response `401` `HandlerErrorResponse` Неавторизован
     * @response `403` `HandlerErrorResponse` Нет доступа
     */
    moderationUpdate: (
      id: number,
      data: HandlerModerateRequest,
      params: RequestParams = {},
    ) =>
      this.request<HandlerStatusResponse, HandlerErrorResponse>({
        path: `/manuscripts/${id}/moderation`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Меняет статус рукописи с 'draft' на 'submitted'. Доступно только владельцу (Owner).
     *
     * @tags Manuscripts
     * @name SubmitUpdate
     * @summary Отправить рукопись на модерацию
     * @request PUT:/manuscripts/{id}/submit
     * @secure
     * @response `200` `HandlerStatusResponse` Успешно отправлено
     * @response `400` `HandlerErrorResponse` Неверный статус или ошибка БД
     * @response `401` `HandlerErrorResponse` Неавторизован
     * @response `403` `HandlerErrorResponse` Нет доступа
     */
    submitUpdate: (id: number, params: RequestParams = {}) =>
      this.request<HandlerStatusResponse, HandlerErrorResponse>({
        path: `/manuscripts/${id}/submit`,
        method: "PUT",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  users = {
    /**
     * @description Вход в систему, проверка учетных данных и выдача JWT-токена.
     *
     * @tags Users
     * @name LoginCreate
     * @summary Аутентификация пользователя
     * @request POST:/users/login
     * @response `200` `HandlerLoginResponse` Успешный вход и токен
     * @response `400` `HandlerErrorResponse` Неверный формат запроса
     * @response `401` `HandlerErrorResponse` Неверные учетные данные
     * @response `500` `HandlerErrorResponse` Ошибка генерации токена
     */
    loginCreate: (login: HandlerLoginRequest, params: RequestParams = {}) =>
      this.request<HandlerLoginResponse, HandlerErrorResponse>({
        path: `/users/login`,
        method: "POST",
        body: login,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Добавляет текущий JWT-токен в черный список Redis. Требуется авторизация.
     *
     * @tags Users
     * @name LogoutCreate
     * @summary Выход из системы
     * @request POST:/users/logout
     * @secure
     * @response `200` `HandlerStatusResponse` Успешный выход
     * @response `401` `HandlerErrorResponse` Токен не предоставлен/недействителен
     * @response `500` `HandlerErrorResponse` Ошибка сервера (Redis)
     */
    logoutCreate: (params: RequestParams = {}) =>
      this.request<HandlerStatusResponse, HandlerErrorResponse>({
        path: `/users/logout`,
        method: "POST",
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает данные авторизованного пользователя, используя ID из JWT-токена.
     *
     * @tags Users
     * @name GetUsers
     * @summary Получить данные текущего пользователя
     * @request GET:/users/me
     * @secure
     * @response `200` `DsUser` Данные пользователя
     * @response `401` `HandlerErrorResponse` Неавторизован
     * @response `500` `HandlerErrorResponse` Ошибка сервера
     */
    getUsers: (params: RequestParams = {}) =>
      this.request<DsUser, HandlerErrorResponse>({
        path: `/users/me`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Создает нового пользователя с ролью Buyer по умолчанию.
     *
     * @tags Users
     * @name RegisterCreate
     * @summary Регистрация нового пользователя
     * @request POST:/users/register
     * @response `201` `HandlerRegisterResponse` Успешная регистрация
     * @response `400` `HandlerErrorResponse` Неверный формат запроса
     * @response `500` `HandlerErrorResponse` Ошибка сервера (например, пользователь уже существует)
     */
    registerCreate: (
      user: HandlerUserRegisterInput,
      params: RequestParams = {},
    ) =>
      this.request<HandlerRegisterResponse, HandlerErrorResponse>({
        path: `/users/register`,
        method: "POST",
        body: user,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Обновляет имя и/или пароль пользователя по ID. Требуется авторизация.
     *
     * @tags Users
     * @name UsersUpdate
     * @summary Обновить данные пользователя
     * @request PUT:/users/{id}
     * @secure
     * @response `200` `HandlerStatusResponse` Успешное обновление
     * @response `400` `HandlerErrorResponse` Неверный формат запроса
     * @response `500` `HandlerErrorResponse` Ошибка сервера
     */
    usersUpdate: (
      id: number,
      data: HandlerUpdateUserInput,
      params: RequestParams = {},
    ) =>
      this.request<HandlerStatusResponse, HandlerErrorResponse>({
        path: `/users/${id}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
