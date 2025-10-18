-- Bildirim sistemi için gerekli tablolar ve enum'lar

-- NotificationType enum'ını oluştur
CREATE TYPE "NotificationType" AS ENUM ('SUCCESS', 'INFO', 'WARNING', 'ERROR');

-- Notifications tablosunu oluştur
CREATE TABLE "notifications" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL,
    "title" VARCHAR NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'INFO',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "action_url" VARCHAR,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- İndeksler oluştur
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");
CREATE INDEX "notifications_is_read_idx" ON "notifications"("is_read");
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- Kullanıcı başına okunmamış bildirim sayısını hızlı hesaplamak için composite index
CREATE INDEX "notifications_user_unread_idx" ON "notifications"("user_id", "is_read") WHERE "is_read" = false;
