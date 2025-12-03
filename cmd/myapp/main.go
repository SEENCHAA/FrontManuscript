package main

import (
	"context"
	"log"
	"time"

	"lab31/internal/app/config"
	"lab31/internal/app/dsn"
	"lab31/internal/app/handler"
	"lab31/internal/app/redis"
	"lab31/internal/app/repository"
	"lab31/internal/pkg"

	_ "lab31/docs" // Оставляем для инициализации init() сваггера

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	// --- ИСПРАВЛЕНИЕ: ЗАКОММЕНТИРОВАНО, Т.К. ИСПОЛЬЗУЕТСЯ В CONTROLLER.GO ---
	// Иначе будет ошибка "imported and not used"
	// swaggerFiles "github.com/swaggo/files"
	// ginSwagger "github.com/swaggo/gin-swagger"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

// Константы MinIO
const (
	MinioEndpoint  = "127.0.0.1:9000"
	MinioAccessKey = "minioadmin"
	MinioSecretKey = "minioadmin"
	MinioBucket    = "manuscripts"
)

// @title Manuscript API
// @version 1.0
// @description API для работы с рукописями, письмами и пользователями.
// @contact.name API Support
// @contact.email support@example.com
// @license.name AS IS (NO WARRANTY)
// @host localhost:8081
// @BasePath /api
// @securityDefinitions.apikey ApiKeyAuth
// @in header
// @name Authorization
func main() {
	ctx := context.Background()
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	// --- 1. Инициализация Конфигурации, БД, Redis, MinIO ---

	cfg, err := config.NewConfig()
	if err != nil {
		log.Fatalf("Ошибка загрузки конфига: %v", err)
	}

	// Используем NewApplicationModel (или NewApplicationModelWithDB, если вы переименовали)
	appModel, err := repository.NewApplicationModel(dsn.FromEnv())
	// Примечание: repository.NewApplicationModel внутри себя создает новое подключение.
	// Если вы хотите переиспользовать `db` созданный выше, убедитесь, что в repository.go есть соответствующий конструктор,
	// либо просто используйте тот, что есть, но тогда `db` выше (строка 61) по сути лишний коннект, если NewApplicationModel создает свой.
	// Но для старта это не критично.
	if err != nil {
		log.Fatalf("Ошибка инициализации модели приложения: %v", err)
	}

	redisClient, err := redis.New(ctx, cfg.Redis)
	if err != nil {
		log.Fatalf("Ошибка инициализации Redis: %v", err)
	}
	defer redisClient.Close()

	minioClient, err := minio.New(MinioEndpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(MinioAccessKey, MinioSecretKey, ""),
		Secure: false,
	})
	if err != nil {
		log.Fatalf("Ошибка инициализации MinIO-клиента: %v", err)
	}

	// Проверка и создание бакета
	found, err := minioClient.BucketExists(ctx, MinioBucket)
	if err != nil {
		log.Fatalf("Ошибка проверки существования бакета: %v", err)
	}
	if !found {
		err = minioClient.MakeBucket(ctx, MinioBucket, minio.MakeBucketOptions{})
		if err != nil {
			log.Fatalf("Не удалось создать MinIO бакет: %v", err)
		}
		// Политика публичного чтения
		policy := `{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"AWS":["*"]},"Action":["s3:GetObject"],"Resource":["arn:aws:s3:::` + MinioBucket + `/*"]}]}`
		if err := minioClient.SetBucketPolicy(ctx, MinioBucket, policy); err != nil {
			log.Printf("Warning: Не удалось установить политику bucket: %v", err)
		}
	}

	// --- 2. Инициализация GIN-роутера ---
	r := gin.Default()

	// --- CORS ---
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://127.0.0.1:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// --- ИСПРАВЛЕНИЕ: УБРАНА РЕГИСТРАЦИЯ SWAGGER ---
	// Она вызывала панику, так как этот маршрут уже регистрируется внутри appHandler.RegisterAPI
	// r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// --- 3. Запуск ---
	appHandler := handler.NewApplicationController(appModel, minioClient, cfg, redisClient)
	app := pkg.NewApp(cfg, r, appHandler)

	app.RunApp()
}
