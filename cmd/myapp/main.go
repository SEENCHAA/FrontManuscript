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

	_ "lab31/docs"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

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

	cfg, err := config.NewConfig()
	if err != nil {
		log.Fatalf("Ошибка загрузки конфига: %v", err)
	}

	appModel, err := repository.NewApplicationModel(dsn.FromEnv())
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

	found, err := minioClient.BucketExists(ctx, MinioBucket)
	if err != nil {
		log.Fatalf("Ошибка проверки существования бакета: %v", err)
	}
	if !found {
		err = minioClient.MakeBucket(ctx, MinioBucket, minio.MakeBucketOptions{})
		if err != nil {
			log.Fatalf("Не удалось создать MinIO бакет: %v", err)
		}
		policy := `{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"AWS":["*"]},"Action":["s3:GetObject"],"Resource":["arn:aws:s3:::` + MinioBucket + `/*"]}]}`
		if err := minioClient.SetBucketPolicy(ctx, MinioBucket, policy); err != nil {
			log.Printf("Warning: Не удалось установить политику bucket: %v", err)
		}
	}

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	appHandler := handler.NewApplicationController(appModel, minioClient, cfg, redisClient)
	app := pkg.NewApp(cfg, r, appHandler)

	app.RunApp()
}
