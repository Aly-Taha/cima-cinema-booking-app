-- CreateTable
CREATE TABLE "SeatHold" (
    "id" TEXT NOT NULL,
    "showtimeId" TEXT NOT NULL,
    "seatNumber" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeatHold_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SeatHold_showtimeId_seatNumber_key" ON "SeatHold"("showtimeId", "seatNumber");

-- AddForeignKey
ALTER TABLE "SeatHold" ADD CONSTRAINT "SeatHold_showtimeId_fkey" FOREIGN KEY ("showtimeId") REFERENCES "Showtime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

